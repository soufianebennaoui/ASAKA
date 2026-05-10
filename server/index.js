// ═══════════════════════════════════════════════════════════
//  ASAKA SUSHI — Express API Server
//
//  Endpoints:
//    GET    /api/orders         → all orders (newest first)
//    POST   /api/orders         → create order
//    PATCH  /api/orders/:id     → update status
//    GET    /api/orders/events  → SSE stream (real-time push)
// ═══════════════════════════════════════════════════════════
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool, initDB } from './db.js';
import { sendVerificationEmail, sendWelcomeEmail } from './mailer.js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

// ── SSE client registry ───────────────────────────────────
// Each connected browser tab gets an entry here.
// When any order changes, we broadcast to all of them.
const clients = new Set();

function broadcast(eventName, data) {
  const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
  clients.forEach(res => {
    try { res.write(payload); } catch {}
  });
}

// ── GET /api/orders/events  (must be before /:id route) ──
app.get('/api/orders/events', (req, res) => {
  res.set({
    'Content-Type':  'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection':    'keep-alive',
    'X-Accel-Buffering': 'no',       // nginx: disable buffering
  });
  res.flushHeaders();

  // Send a heartbeat every 25s to keep the connection alive
  const heartbeat = setInterval(() => {
    try { res.write(': heartbeat\n\n'); } catch {}
  }, 25_000);

  clients.add(res);
  req.on('close', () => {
    clearInterval(heartbeat);
    clients.delete(res);
  });
});

// ── GET /api/orders/next-id  (must be before /:id route) ─
// Returns a unique sequential order ID using the DB sequence.
// The front-office calls this before POSTing a new order so that
// IDs never collide even when the same session reloads.
app.get('/api/orders/next-id', async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT '#' || nextval('order_id_seq') AS id");
    res.json({ id: rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/orders ───────────────────────────────────────
app.get('/api/orders', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM orders ORDER BY created_at DESC'
    );
    res.json(rows.map(dbToOrder));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/orders ──────────────────────────────────────
app.post('/api/orders', async (req, res) => {
  const o = req.body;
  try {
    await pool.query(`
      INSERT INTO orders
        (id, customer, items, total, status, mode, platform, phone,
         address, gps_link, pickup_time, payment_method, tip,
         cancel_window_end, payload, raw_items)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      ON CONFLICT (id) DO NOTHING
    `, [
      o.id, o.customer, o.items, o.total,
      o.status || 'new', o.mode, o.platform, o.phone,
      o.address, o.gpsLink, o.pickupTime, o.paymentMethod,
      o.tip, o.cancelWindowEnd ?? null,
      JSON.stringify(o.payload  ?? {}),
      JSON.stringify(o.rawItems ?? []),
    ]);

    const { rows } = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    broadcast('orders', rows.map(dbToOrder));
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/orders/:id ─────────────────────────────────
app.patch('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const VALID = ['new','prep','ready','delivering','done','cancelled','cancelled_by_client'];
  if (!VALID.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2',
      [status, id]
    );
    const { rows } = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    broadcast('orders', rows.map(dbToOrder));
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════
//  CUSTOMER ENDPOINTS
// ════════════════════════════════════════════════════════════

// ── POST /api/auth/send-verification ──────────────────────
// Stores codes temporarily in memory. (Expires after 10 mins)
const verificationCodes = new Map();

app.post('/api/auth/send-verification', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'missing_email' });

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Save with 10-minute expiry
  verificationCodes.set(email, {
    code,
    expires: Date.now() + 10 * 60 * 1000
  });

  try {
    await sendVerificationEmail(email, code);
    res.json({ ok: true });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ error: 'failed_to_send' });
  }
});

// ── POST /api/auth/verify-code ────────────────────────────
app.post('/api/auth/verify-code', (req, res) => {
  const { email, code } = req.body;
  const record = verificationCodes.get(email);

  if (!record) return res.status(400).json({ error: 'code_not_found' });
  if (Date.now() > record.expires) {
    verificationCodes.delete(email);
    return res.status(400).json({ error: 'code_expired' });
  }
  if (record.code !== code) {
    return res.status(400).json({ error: 'code_invalid' });
  }

  // Success: remove code to prevent reuse
  verificationCodes.delete(email);
  res.json({ ok: true });
});

// ── POST /api/auth/oauth ──────────────────────────────────
app.post('/api/auth/oauth', async (req, res) => {
  const { provider, oauth_id, email, name, picture } = req.body;
  if (!provider || !oauth_id || !email) return res.status(400).json({ error: 'missing_oauth_fields' });

  try {
    // 1. Check if user already exists with this email
    const { rows: existing } = await pool.query('SELECT * FROM customers WHERE LOWER(email) = $1 LIMIT 1', [email.toLowerCase()]);
    
    if (existing.length > 0) {
      const user = existing[0];
      // If they exist but don't have oauth linked, link it now
      if (!user.oauth_provider) {
        await pool.query('UPDATE customers SET oauth_provider = $1, oauth_id = $2 WHERE id = $3', [provider, oauth_id, user.id]);
        user.oauth_provider = provider;
        user.oauth_id = oauth_id;
      }
      return res.json(dbToCustomer(user));
    }

    // 2. User doesn't exist, create a new one (without password)
    const { rows: inserted } = await pool.query(`
      INSERT INTO customers (
        name, email, oauth_provider, oauth_id, avatar_url, joined_date
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      name || 'Utilisateur', email, provider, oauth_id, picture || null, new Date().toLocaleDateString('fr-MA')
    ]);

    const newUser = dbToCustomer(inserted[0]);
    broadcast('customers', await allCustomers());
    
    // Trigger welcome email
    sendWelcomeEmail(newUser).catch(err => console.error('OAuth Welcome email failed:', err));

    res.status(201).json(newUser);
  } catch (err) {
    console.error('OAuth Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/customers ────────────────────────────────────
app.get('/api/customers', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM customers ORDER BY created_at DESC');
    res.json(rows.map(dbToCustomer));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/customers/login ─────────────────────────────
app.post('/api/customers/login', async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) return res.status(400).json({ error: 'missing_fields' });

  // identifier can be email or phone (E.164 or local format)
  const normalized = identifier.trim().toLowerCase();
  try {
    const { rows } = await pool.query(`
      SELECT * FROM customers
      WHERE (LOWER(email) = $1 OR phone = $2 OR phone = $3)
        AND password = $4
      LIMIT 1
    `, [normalized, identifier.trim(), normalized, password]);

    if (rows.length === 0) return res.status(401).json({ error: 'invalid_credentials' });
    res.json(dbToCustomer(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/customers  (signup) ────────────────────────
app.post('/api/customers', async (req, res) => {
  const c = req.body;
  try {
    const { rows } = await pool.query(`
      INSERT INTO customers
        (name, email, phone, password, points, total_orders, total_spent,
         order_history, favorites, coupons, saved_addresses,
         avatar_url, avatar_emoji, joined_date)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING *
    `, [
      c.name, c.email, c.phone, c.password,
      c.points || 0, c.totalOrders || 0, c.totalSpent || 0,
      JSON.stringify(c.orderHistory   || []),
      JSON.stringify(c.favorites      || []),
      JSON.stringify(c.coupons        || []),
      JSON.stringify(c.savedAddresses || []),
      c.avatarUrl || null, c.avatarEmoji || null,
      c.joinedDate || new Date().toLocaleDateString('fr-MA'),
    ]);
    broadcast('customers', await allCustomers());
    const savedCustomer = dbToCustomer(rows[0]);
    
    // Trigger welcome email (non-blocking)
    sendWelcomeEmail(savedCustomer).catch(err => console.error('Welcome email failed:', err));

    res.status(201).json(savedCustomer);
  } catch (err) {
    if (err.code === '23505') {
      // unique violation — email already exists
      return res.status(409).json({ error: 'email_exists' });
    }
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/customers/:id  (update profile / loyalty) ─
app.patch('/api/customers/:id', async (req, res) => {
  const { id } = req.params;
  const c = req.body;
  try {
    await pool.query(`
      UPDATE customers SET
        name            = COALESCE($1,  name),
        phone           = COALESCE($2,  phone),
        password        = COALESCE($3,  password),
        points          = COALESCE($4,  points),
        total_orders    = COALESCE($5,  total_orders),
        total_spent     = COALESCE($6,  total_spent),
        order_history   = COALESCE($7,  order_history),
        favorites       = COALESCE($8,  favorites),
        coupons         = COALESCE($9,  coupons),
        saved_addresses = COALESCE($10, saved_addresses),
        avatar_url      = COALESCE($11, avatar_url),
        avatar_emoji    = COALESCE($12, avatar_emoji)
      WHERE id = $13
    `, [
      c.name   ?? null, c.phone  ?? null, c.password ?? null,
      c.points ?? null, c.totalOrders ?? null, c.totalSpent ?? null,
      c.orderHistory   != null ? JSON.stringify(c.orderHistory)   : null,
      c.favorites      != null ? JSON.stringify(c.favorites)      : null,
      c.coupons        != null ? JSON.stringify(c.coupons)        : null,
      c.savedAddresses != null ? JSON.stringify(c.savedAddresses) : null,
      c.avatarUrl ?? null, c.avatarEmoji ?? null,
      id,
    ]);
    broadcast('customers', await allCustomers());
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/customers/:id ─────────────────────────────
app.delete('/api/customers/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM customers WHERE id = $1', [req.params.id]);
    broadcast('customers', await allCustomers());
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── Helper: fetch all customers ───────────────────────────
async function allCustomers() {
  const { rows } = await pool.query('SELECT * FROM customers ORDER BY created_at DESC');
  return rows.map(dbToCustomer);
}

// ── DB row → app customer shape ───────────────────────────
function dbToCustomer(row) {
  return {
    id:             row.id,
    name:           row.name,
    email:          row.email,
    phone:          row.phone,
    password:       row.password,
    points:         row.points,
    totalOrders:    row.total_orders,
    totalSpent:     Number(row.total_spent),
    orderHistory:   row.order_history   || [],
    favorites:      row.favorites       || [],
    coupons:        row.coupons         || [],
    savedAddresses: row.saved_addresses || [],
    avatarUrl:      row.avatar_url,
    avatarEmoji:    row.avatar_emoji,
    joinedDate:     row.joined_date,
  };
}

// ── DB row → app order shape ──────────────────────────────
function dbToOrder(row) {
  const payload = row.payload || {};
  return {
    id:                row.id,
    customer:          row.customer,
    // Delivery recipient (may differ from account holder when ordering for someone else)
    deliveryName:      payload.deliveryName  || row.customer,
    deliveryPhone:     payload.deliveryPhone || row.phone,
    items:             row.items,
    rawItems:          row.raw_items,
    payload:           payload,
    total:             row.total,
    status:            row.status,
    mode:              row.mode,
    platform:          row.platform,
    phone:             row.phone,
    address:           row.address,
    gpsLink:           row.gps_link,
    pickupTime:        row.pickup_time,
    paymentMethod:     row.payment_method,
    tip:               row.tip,
    cancelWindowEnd:   row.cancel_window_end ? Number(row.cancel_window_end) : null,
    time:              new Date(row.created_at).toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' }),
    source:            'frontoffice',
  };
}

// ════════════════════════════════════════════════════════════
//  STAFF / ADMIN ENDPOINTS
// ════════════════════════════════════════════════════════════

// ── POST /api/staff/login ─────────────────────────────────
app.post('/api/staff/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const { rows } = await pool.query(`
      SELECT * FROM staff
      WHERE (LOWER(name) = LOWER($1) OR LOWER(email) = LOWER($1))
        AND password = $2
        AND status = 'Active'
      LIMIT 1
    `, [username, password]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }

    // Update last_login
    await pool.query('UPDATE staff SET last_login = NOW() WHERE id = $1', [rows[0].id]);
    res.json(dbToStaff(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/staff ────────────────────────────────────────
app.get('/api/staff', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM staff ORDER BY created_at ASC');
    res.json(rows.map(dbToStaff));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/staff ───────────────────────────────────────
app.post('/api/staff', async (req, res) => {
  const s = req.body;
  try {
    const { rows } = await pool.query(`
      INSERT INTO staff (name, email, password, role, status)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [s.name, s.email, s.password, s.role || 'Staff', s.status || 'Active']);
    res.status(201).json(dbToStaff(rows[0]));
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'email_exists' });
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/staff/:id ──────────────────────────────────
app.patch('/api/staff/:id', async (req, res) => {
  const s = req.body;
  try {
    await pool.query(`
      UPDATE staff SET
        name     = COALESCE($1, name),
        email    = COALESCE($2, email),
        password = COALESCE($3, password),
        role     = COALESCE($4, role),
        status   = COALESCE($5, status)
      WHERE id = $6
    `, [s.name ?? null, s.email ?? null, s.password ?? null,
        s.role ?? null, s.status ?? null, req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/staff/:id ─────────────────────────────────
app.delete('/api/staff/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM staff WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function dbToStaff(row) {
  return {
    id:        row.id,
    name:      row.name,
    email:     row.email,
    password:  row.password,
    role:      row.role,
    status:    row.status,
    lastLogin: row.last_login
      ? new Date(row.last_login).toLocaleString('fr-MA')
      : 'Jamais',
  };
}

// ════════════════════════════════════════════════════════════
//  OFFERS ENDPOINTS
// ════════════════════════════════════════════════════════════

async function allOffers() {
  const { rows } = await pool.query('SELECT * FROM offers ORDER BY created_at DESC');
  return rows.map(dbToOffer);
}

function dbToOffer(row) {
  return {
    id:              row.id,
    name:            row.name,
    description:     row.description,
    discountPercent: row.discount_percent,
    isActive:        row.is_active,
    startDate:       row.start_date,
    endDate:         row.end_date,
    holidayType:     row.holiday_type,
    slides:          row.slides || [],
  };
}

app.get('/api/offers', async (req, res) => {
  try { res.json(await allOffers()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/offers', async (req, res) => {
  const o = req.body;
  try {
    await pool.query(`
      INSERT INTO offers (id, name, description, discount_percent, is_active, start_date, end_date, holiday_type, slides)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      ON CONFLICT (id) DO UPDATE SET
        name=EXCLUDED.name, description=EXCLUDED.description,
        discount_percent=EXCLUDED.discount_percent, is_active=EXCLUDED.is_active,
        start_date=EXCLUDED.start_date, end_date=EXCLUDED.end_date,
        holiday_type=EXCLUDED.holiday_type, slides=EXCLUDED.slides
    `, [o.id, o.name, o.description||'', o.discountPercent||0,
        o.isActive!==false, o.startDate||null, o.endDate||null,
        o.holidayType||'custom', JSON.stringify(o.slides||[])]);
    broadcast('offers', await allOffers());
    res.status(201).json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/offers/:id', async (req, res) => {
  const o = req.body;
  try {
    await pool.query(`
      UPDATE offers SET
        name             = COALESCE($1, name),
        description      = COALESCE($2, description),
        discount_percent = COALESCE($3, discount_percent),
        is_active        = COALESCE($4, is_active),
        start_date       = COALESCE($5, start_date),
        end_date         = COALESCE($6, end_date),
        holiday_type     = COALESCE($7, holiday_type),
        slides           = COALESCE($8, slides)
      WHERE id = $9
    `, [o.name??null, o.description??null, o.discountPercent??null,
        o.isActive??null, o.startDate??null, o.endDate??null,
        o.holidayType??null,
        o.slides != null ? JSON.stringify(o.slides) : null,
        req.params.id]);
    broadcast('offers', await allOffers());
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/offers/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM offers WHERE id = $1', [req.params.id]);
    broadcast('offers', await allOffers());
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ════════════════════════════════════════════════════════════
//  MENU CATEGORIES ENDPOINTS
// ════════════════════════════════════════════════════════════

async function allCategories() {
  const { rows } = await pool.query('SELECT * FROM menu_categories ORDER BY sort_order ASC, created_at ASC');
  return rows.map(r => ({ id: r.id, name: r.name, emoji: r.emoji, image: r.image, sortOrder: r.sort_order }));
}

app.get('/api/categories', async (req, res) => {
  try { res.json(await allCategories()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// Upsert a single category
app.post('/api/categories', async (req, res) => {
  const c = req.body;
  try {
    await pool.query(`
      INSERT INTO menu_categories (id, name, emoji, image, sort_order)
      VALUES ($1,$2,$3,$4,$5)
      ON CONFLICT (id) DO UPDATE SET
        name=EXCLUDED.name, emoji=EXCLUDED.emoji,
        image=EXCLUDED.image, sort_order=EXCLUDED.sort_order
    `, [c.id, c.name, c.emoji||'', c.image||null, c.sortOrder||0]);
    broadcast('categories', await allCategories());
    res.status(201).json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Replace all categories atomically (used when BO reorders / bulk-edits)
app.post('/api/categories/bulk', async (req, res) => {
  const cats = req.body;
  if (!Array.isArray(cats)) return res.status(400).json({ error: 'Expected array' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM menu_categories');
    for (let i = 0; i < cats.length; i++) {
      const c = cats[i];
      await client.query(
        'INSERT INTO menu_categories (id, name, emoji, image, sort_order) VALUES ($1,$2,$3,$4,$5)',
        [c.id, c.name, c.emoji||'', c.image||null, i],
      );
    }
    await client.query('COMMIT');
    broadcast('categories', await allCategories());
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM menu_categories WHERE id = $1', [req.params.id]);
    broadcast('categories', await allCategories());
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ════════════════════════════════════════════════════════════
//  MENU ITEMS ENDPOINTS
// ════════════════════════════════════════════════════════════

async function allMenuItems() {
  const { rows } = await pool.query('SELECT * FROM menu_items ORDER BY category ASC, name ASC');
  return rows.map(dbToMenuItem);
}

function dbToMenuItem(row) {
  return {
    id:          row.id,
    name:        row.name,
    category:    row.category,
    price:       Number(row.price),
    description: row.description,
    image:       row.image,
    available:   row.available,
    extras:      row.extras    || [],
    allergens:   row.allergens || [],
    tags:        row.tags      || [],
    kcal:        row.kcal,
  };
}

app.get('/api/menu-items', async (req, res) => {
  try { res.json(await allMenuItems()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// Upsert a single item
app.post('/api/menu-items', async (req, res) => {
  const m = req.body;
  try {
    await pool.query(`
      INSERT INTO menu_items
        (id, name, category, price, description, image, available, extras, allergens, tags, kcal)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      ON CONFLICT (id) DO UPDATE SET
        name=EXCLUDED.name, category=EXCLUDED.category, price=EXCLUDED.price,
        description=EXCLUDED.description, image=EXCLUDED.image,
        available=EXCLUDED.available, extras=EXCLUDED.extras,
        allergens=EXCLUDED.allergens, tags=EXCLUDED.tags, kcal=EXCLUDED.kcal
    `, [m.id, m.name, m.category||null, m.price||0, m.description||null,
        m.image||null, m.available!==false,
        JSON.stringify(m.extras||[]), JSON.stringify(m.allergens||[]),
        JSON.stringify(m.tags||[]), m.kcal||null]);
    broadcast('menuItems', await allMenuItems());
    res.status(201).json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Replace all menu items atomically
app.post('/api/menu-items/bulk', async (req, res) => {
  const items = req.body;
  if (!Array.isArray(items)) return res.status(400).json({ error: 'Expected array' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM menu_items');
    for (const m of items) {
      await client.query(`
        INSERT INTO menu_items
          (id, name, category, price, description, image, available, extras, allergens, tags, kcal)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      `, [m.id, m.name, m.category||null, m.price||0, m.description||null,
          m.image||null, m.available!==false,
          JSON.stringify(m.extras||[]), JSON.stringify(m.allergens||[]),
          JSON.stringify(m.tags||[]), m.kcal||null]);
    }
    await client.query('COMMIT');
    broadcast('menuItems', await allMenuItems());
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
});

app.patch('/api/menu-items/:id', async (req, res) => {
  const m = req.body;
  try {
    await pool.query(`
      UPDATE menu_items SET
        name        = COALESCE($1,  name),
        category    = COALESCE($2,  category),
        price       = COALESCE($3,  price),
        description = COALESCE($4,  description),
        image       = COALESCE($5,  image),
        available   = COALESCE($6,  available),
        extras      = COALESCE($7,  extras),
        allergens   = COALESCE($8,  allergens),
        tags        = COALESCE($9,  tags),
        kcal        = COALESCE($10, kcal)
      WHERE id = $11
    `, [m.name??null, m.category??null, m.price??null, m.description??null,
        m.image??null, m.available??null,
        m.extras    != null ? JSON.stringify(m.extras)    : null,
        m.allergens != null ? JSON.stringify(m.allergens) : null,
        m.tags      != null ? JSON.stringify(m.tags)      : null,
        m.kcal??null, req.params.id]);
    broadcast('menuItems', await allMenuItems());
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/menu-items/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM menu_items WHERE id = $1', [req.params.id]);
    broadcast('menuItems', await allMenuItems());
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ════════════════════════════════════════════════════════════
//  INVENTORY ENDPOINTS
// ════════════════════════════════════════════════════════════

async function allInventory() {
  const { rows } = await pool.query('SELECT * FROM inventory ORDER BY category ASC, name ASC');
  return rows.map(r => ({
    id:          r.id,
    name:        r.name,
    category:    r.category,
    quantity:    Number(r.quantity),
    unit:        r.unit,
    minStock:    Number(r.min_stock),
    price:       Number(r.price),
    supplier:    r.supplier,
    lastUpdated: r.last_updated,
  }));
}

app.get('/api/inventory', async (req, res) => {
  try { res.json(await allInventory()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/inventory', async (req, res) => {
  const inv = req.body;
  try {
    await pool.query(`
      INSERT INTO inventory (id, name, category, quantity, unit, min_stock, price, supplier)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT (id) DO UPDATE SET
        name=EXCLUDED.name, category=EXCLUDED.category,
        quantity=EXCLUDED.quantity, unit=EXCLUDED.unit,
        min_stock=EXCLUDED.min_stock, price=EXCLUDED.price,
        supplier=EXCLUDED.supplier, last_updated=NOW()
    `, [inv.id, inv.name, inv.category||null, inv.quantity||0,
        inv.unit||'kg', inv.minStock||0, inv.price||0, inv.supplier||null]);
    broadcast('inventory', await allInventory());
    res.status(201).json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/inventory/:id', async (req, res) => {
  const inv = req.body;
  try {
    await pool.query(`
      UPDATE inventory SET
        name      = COALESCE($1, name),
        category  = COALESCE($2, category),
        quantity  = COALESCE($3, quantity),
        unit      = COALESCE($4, unit),
        min_stock = COALESCE($5, min_stock),
        price     = COALESCE($6, price),
        supplier  = COALESCE($7, supplier),
        last_updated = NOW()
      WHERE id = $8
    `, [inv.name??null, inv.category??null, inv.quantity??null,
        inv.unit??null, inv.minStock??null, inv.price??null,
        inv.supplier??null, req.params.id]);
    broadcast('inventory', await allInventory());
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/inventory/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM inventory WHERE id = $1', [req.params.id]);
    broadcast('inventory', await allInventory());
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ════════════════════════════════════════════════════════════
//  AVIS / REVIEWS ENDPOINTS
// ════════════════════════════════════════════════════════════

async function allAvis() {
  const { rows } = await pool.query('SELECT * FROM avis ORDER BY created_at DESC');
  return rows.map(r => ({
    id:        Number(r.id),
    name:      r.name,
    stars:     r.stars,
    text:      r.text,
    date:      r.date,
    published: r.published,
    images:    r.images || [],
  }));
}

app.get('/api/avis', async (req, res) => {
  try { res.json(await allAvis()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/avis', async (req, res) => {
  const a = req.body;
  try {
    const { rows } = await pool.query(`
      INSERT INTO avis (name, stars, text, date, published, images)
      VALUES ($1,$2,$3,$4,$5,$6) RETURNING *
    `, [a.name, a.stars||5, a.text||'',
        a.date || new Date().toLocaleDateString('fr-MA'),
        a.published!==false, JSON.stringify(a.images||[])]);
    broadcast('avis', await allAvis());
    res.status(201).json({ id: Number(rows[0].id), ...a });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/avis/:id', async (req, res) => {
  const a = req.body;
  try {
    await pool.query(`
      UPDATE avis SET
        name      = COALESCE($1, name),
        stars     = COALESCE($2, stars),
        text      = COALESCE($3, text),
        date      = COALESCE($4, date),
        published = COALESCE($5, published),
        images    = COALESCE($6, images)
      WHERE id = $7
    `, [a.name??null, a.stars??null, a.text??null, a.date??null,
        a.published??null,
        a.images != null ? JSON.stringify(a.images) : null,
        req.params.id]);
    broadcast('avis', await allAvis());
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/avis/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM avis WHERE id = $1', [req.params.id]);
    broadcast('avis', await allAvis());
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Start ─────────────────────────────────────────────────
initDB().then(() => {
  app.listen(PORT, '0.0.0.0', () =>
    console.log(`🍣 Asaka API running → http://0.0.0.0:${PORT}`)
  );
});
