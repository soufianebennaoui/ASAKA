import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// ── Transporter Configuration ──────────────────────────────
// Uses SMTP settings from .env file. If not set, it won't crash
// but emails will obviously fail to send.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Brand colors for the HTML emails
const BRAND = {
  bg: '#0F1523', // asaka-900
  card: '#151D2F', // asaka-800
  accent: '#F97316', // orange-500
  text: '#E2E8F0',
  muted: '#94A3B8'
};

const BASE_HTML_WRAPPER = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: ${BRAND.bg}; color: ${BRAND.text}; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: ${BRAND.card}; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }
    .header { background-color: ${BRAND.bg}; padding: 30px 20px; text-align: center; border-bottom: 2px solid ${BRAND.accent}; }
    .header h1 { margin: 0; color: #fff; font-size: 24px; letter-spacing: 2px; }
    .header h1 span { color: ${BRAND.accent}; }
    .content { padding: 40px 30px; text-align: center; line-height: 1.6; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: ${BRAND.muted}; background-color: ${BRAND.bg}; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ASAKA <span>SUSHI</span></h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} Asaka Sushi. Tous droits réservés.<br/>
      Sidi Maarouf, Casablanca
    </div>
  </div>
</body>
</html>
`;

/**
 * Sends a 6-digit verification code for profile updates.
 */
export const sendVerificationEmail = async (toEmail, code) => {
  if (!process.env.SMTP_USER) return console.log('Mock Email Code:', code);

  const html = BASE_HTML_WRAPPER(`
    <h2 style="color: #fff; margin-bottom: 20px;">Vérification de sécurité</h2>
    <p>Vous avez demandé à modifier vos informations sur Asaka Sushi.</p>
    <p>Veuillez utiliser le code de sécurité suivant pour confirmer cette action :</p>
    
    <div style="margin: 40px 0; padding: 20px; background-color: ${BRAND.bg}; border-radius: 12px; display: inline-block;">
      <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: ${BRAND.accent};">${code}</span>
    </div>
    
    <p style="color: ${BRAND.muted}; font-size: 14px;">Ce code expirera dans 10 minutes.<br/>Si vous n'avez pas fait cette demande, veuillez ignorer cet e-mail.</p>
  `);

  await transporter.sendMail({
    from: `"Asaka Sushi" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `Code de vérification : ${code} - Asaka Sushi`,
    html,
  });
};

/**
 * Sends a welcome email when a new account is created.
 */
export const sendWelcomeEmail = async (customer) => {
  if (!process.env.SMTP_USER) return console.log('Mock Welcome Email for:', customer.email);

  const html = BASE_HTML_WRAPPER(`
    <h2 style="color: #fff; margin-bottom: 20px;">Bienvenue chez Asaka Sushi ! 🍣</h2>
    <p>Bonjour <strong>${customer.name}</strong>,</p>
    <p>Votre compte a été créé avec succès. Nous sommes ravis de vous compter parmi nos membres !</p>
    <p>En tant que membre Asaka, vous bénéficiez désormais de :</p>
    
    <ul style="text-align: left; max-width: 300px; margin: 20px auto; color: #fff;">
      <li style="margin-bottom: 10px;">🍣 Un coupon de bienvenue de -10%</li>
      <li style="margin-bottom: 10px;">⭐ Cumul de points de fidélité à chaque commande</li>
      <li>🚀 Suivi en temps réel de vos commandes</li>
    </ul>

    <p style="margin-top: 30px;">À très vite pour votre première commande !</p>
  `);

  await transporter.sendMail({
    from: `"Asaka Sushi" <${process.env.SMTP_USER}>`,
    to: customer.email,
    subject: `Bienvenue chez Asaka Sushi, ${customer.name} ! 🎉`,
    html,
  });
};
