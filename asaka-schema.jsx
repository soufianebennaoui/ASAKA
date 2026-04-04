import React, { useState } from 'react';

/* ─── Tokens ─── */
const C = {
  bg:     '#060d18',
  card:   '#0d1b2a',
  border: '#1e3a5f',
  blue:   '#1565c0',
  ice:    '#4fc3f7',
  green:  '#22c55e',
  amber:  '#f59e0b',
  coral:  '#e74c3c',
  purp:   '#a855f7',
  white:  '#f0f8ff',
  muted:  '#94a3b8',
  dim:    '#475569',
  wa:     '#25d366',
};

/* ─── Atoms ─── */
const Badge = ({ color, children }) => (
  <span style={{ background: color+'22', border:`1px solid ${color}55`, color, borderRadius:999, padding:'2px 8px', fontSize:10, fontWeight:800, whiteSpace:'nowrap' }}>{children}</span>
);

const Section = ({ title, icon, color=C.ice, badge, children }) => (
  <div style={{ background:C.card, border:`1px solid ${color}28`, borderRadius:16, padding:'16px 18px', marginBottom:12 }}>
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
      <span style={{ fontSize:18 }}>{icon}</span>
      <span style={{ color:C.white, fontWeight:800, fontSize:14, flex:1 }}>{title}</span>
      {badge && <Badge color={badge==='✓'?C.green:badge==='!'?C.amber:C.ice}>{badge==='✓'?'✓ VALIDÉ':badge==='!'?'⏳ PENDING':badge}</Badge>}
    </div>
    {children}
  </div>
);

const Row = ({children,gap=8}) => <div style={{display:'flex',gap,flexWrap:'wrap',marginBottom:8}}>{children}</div>;

const Chip = ({emoji,label,sub,color=C.ice}) => (
  <div style={{ background:color+'12', border:`1px solid ${color}35`, borderRadius:12, padding:'10px 12px', flex:1, minWidth:110 }}>
    <div style={{fontSize:17,marginBottom:4}}>{emoji}</div>
    <div style={{color:C.white,fontWeight:700,fontSize:12}}>{label}</div>
    {sub&&<div style={{color:C.muted,fontSize:10,marginTop:2}}>{sub}</div>}
  </div>
);

const FlowStep = ({n,label,sub,color=C.ice,right,warn}) => (
  <div style={{display:'flex',gap:12,marginBottom:12,alignItems:'flex-start'}}>
    <div style={{width:28,height:28,borderRadius:'50%',background:warn?C.amber:color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:900,color:C.bg,flexShrink:0,marginTop:1}}>{n}</div>
    <div style={{flex:1}}>
      <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
        <span style={{color:C.white,fontWeight:700,fontSize:13}}>{label}</span>
        {right&&<Badge color={C.green}>{right}</Badge>}
        {warn&&<Badge color={C.amber}>{warn}</Badge>}
      </div>
      {sub&&<div style={{color:C.muted,fontSize:12,marginTop:3,lineHeight:1.5}}>{sub}</div>}
    </div>
  </div>
);

const Note = ({emoji,text,type='idea'}) => (
  <div style={{
    display:'flex',gap:8,alignItems:'flex-start',marginBottom:8,
    background:type==='ok'?C.green+'10':type==='security'?C.coral+'10':type==='idea'?C.purp+'10':C.amber+'10',
    border:`1px solid ${type==='ok'?C.green:type==='security'?C.coral:type==='idea'?C.purp:C.amber}30`,
    borderRadius:10,padding:'8px 12px'
  }}>
    <span style={{fontSize:14,flexShrink:0}}>{emoji}</span>
    <span style={{color:'#cbd5e1',fontSize:12,lineHeight:1.5}}>{text}</span>
  </div>
);

const Arrow = ({color=C.dim}) => (
  <div style={{textAlign:'center',color,fontSize:20,margin:'-4px 0',lineHeight:1}}>↓</div>
);

const TwoCol = ({left,right}) => (
  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:8}}>{left}{right}</div>
);

const Box = ({label,sub,color=C.ice,emoji}) => (
  <div style={{background:color+'12',border:`1px solid ${color}30`,borderRadius:10,padding:'10px 12px'}}>
    {emoji&&<div style={{fontSize:16,marginBottom:4}}>{emoji}</div>}
    <div style={{color:C.white,fontWeight:700,fontSize:12}}>{label}</div>
    {sub&&<div style={{color:C.muted,fontSize:11,marginTop:2}}>{sub}</div>}
  </div>
);

/* ─── Main ─── */
export default function AsakaSchema() {
  const [tab,setTab] = useState('chartflow');

  const tabs = [
    {id:'chartflow', label:'🗺 Chartflow Complet'},
    {id:'validated', label:'✅ Tout Validé'},
    {id:'security',  label:'🔒 Sécurité'},
    {id:'stack',     label:'⚙️ Stack & Libs'},
    {id:'start',     label:'🚀 Prêt à Démarrer'},
  ];

  return (
    <div style={{minHeight:'100vh',background:C.bg,fontFamily:'Inter,system-ui,sans-serif',color:C.white,paddingBottom:60}}>

      {/* Header */}
      <div style={{background:'#030810',borderBottom:`1px solid ${C.border}`,padding:'16px 18px 12px'}}>
        <div style={{maxWidth:760,margin:'0 auto'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
            <div style={{width:40,height:40,borderRadius:'50%',background:`linear-gradient(135deg,${C.blue},${C.ice})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>🍱</div>
            <div>
              <div style={{fontWeight:900,fontSize:17}}><span style={{color:C.ice}}>Asaka</span><span style={{color:C.white}}> Sushi</span><span style={{color:C.dim,fontWeight:400,fontSize:12}}> — Plan Final · v3</span></div>
              <div style={{color:C.dim,fontSize:11}}>Toutes les sections validées · Prêt à coder</div>
            </div>
          </div>
          <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
            {tabs.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                background:tab===t.id?C.blue:'transparent',
                border:`1px solid ${tab===t.id?C.blue:C.border}`,
                color:tab===t.id?C.white:C.dim,
                borderRadius:999,padding:'4px 12px',fontSize:11,fontWeight:700,cursor:'pointer'
              }}>{t.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:760,margin:'0 auto',padding:'20px 14px 0'}}>

        {/* ══════════ CHARTFLOW ══════════ */}
        {tab==='chartflow'&&(
          <div>
            <div style={{color:C.muted,fontSize:12,marginBottom:16}}>Architecture complète — de l'entrée sur le site à la livraison, en passant par chaque décision.</div>

            {/* ── ENTRY ── */}
            <Section title="① ENTRÉE — Page d'accueil" icon="🏠" color={C.ice} badge="✓">
              <div style={{background:'#030810',border:`1px solid ${C.border}`,borderRadius:12,padding:14,marginBottom:8}}>
                <div style={{color:C.ice,fontWeight:800,fontSize:12,marginBottom:10}}>Ce que le client voit en premier (above the fold)</div>
                <div style={{textAlign:'center',padding:'16px 0'}}>
                  <div style={{display:'inline-block',background:`linear-gradient(135deg,${C.blue}33,${C.ice}11)`,border:`2px solid ${C.ice}40`,borderRadius:20,padding:'20px 32px',marginBottom:12}}>
                    <div style={{fontSize:32,marginBottom:6}}>🍱</div>
                    <div style={{color:C.ice,fontWeight:900,fontSize:20,letterSpacing:-0.5}}>ASAKA SUSHI</div>
                    <div style={{color:C.muted,fontSize:12,marginBottom:16}}>Tagline courte · Casablanca</div>
                    <div style={{display:'flex',gap:10,justifyContent:'center'}}>
                      <div style={{background:C.green,color:C.bg,borderRadius:10,padding:'10px 20px',fontWeight:800,fontSize:13}}>🥡 À Emporter</div>
                      <div style={{background:C.blue,color:C.white,borderRadius:10,padding:'10px 20px',fontWeight:800,fontSize:13}}>🛵 Livraison</div>
                    </div>
                  </div>
                  <div style={{color:C.muted,fontSize:11}}>Animation 3D scroll-triggered · Fond animé · Particules japonaises</div>
                </div>
              </div>
              <Note emoji="🎨" text="Design Apple-like : scroll déclenche des animations, éléments 3D (Three.js/Spline), parallax. Refs : sugarfishsushi.com + sushi-rei.jp" type="idea"/>
              <Note emoji="📸" text="Section owner/influencer : courte bio + photo Instagram du propriétaire. Ajoutée après le hero." type="ok"/>
              <Note emoji="📍" text="Horaires ouverture + bouton compact Google Maps (pas d'iframe). WhatsApp direct pour contact." type="ok"/>
            </Section>

            <Arrow />

            {/* ── BROWSE ── */}
            <Section title="② MENU — Parcourir & Ajouter" icon="🍣" color={C.ice} badge="✓">
              <FlowStep n="A" label="Tabs catégories sticky" sub="Rolls · Sashimi · Chirashi · Spécialités · Boissons — scroll horizontal sur mobile" color={C.ice}/>
              <FlowStep n="B" label="Affichage au choix du client" sub="3 modes : Grille 2-col / Liste / Cards horizontales — préférence sauvegardée" color={C.ice}/>
              <FlowStep n="C" label="Barre de recherche" sub="Cliquée → suggestions de produits à la une (configurés en backoffice). Recherche live par nom." color={C.ice}/>
              <FlowStep n="D" label="Tap article → Bottom Sheet popup" sub="Photo HD + nom + ingrédients (backoffice) + prix + quantité + Ajouter au panier. Sans quitter le menu." color={C.ice}/>
              <FlowStep n="E" label="FAB panier flottant" sub="Bas de l'écran : 🛒 3 articles · 255 Dh → Voir panier. Visible en permanence si panier non vide." color={C.green}/>
              <Note emoji="🔥" text="Badges 'Populaire' et 'Nouveau' sur les cards — gérés depuis le backoffice par article." type="ok"/>
              <Note emoji="🔍" text="Produits mis en avant dans la recherche = configurables en backoffice (ex: mettre le plat du jour)." type="ok"/>
            </Section>

            <Arrow />

            {/* ── CART ── */}
            <Section title="③ PANIER" icon="🛒" color={C.amber} badge="✓">
              <FlowStep n="1" label="Liste articles" sub="+/- quantités · Supprimer · Sous-total par article" color={C.amber}/>
              <FlowStep n="2" label="Choix du mode" sub="À Emporter OU Livraison (2 options seulement)" color={C.amber}/>
              <FlowStep n="3" label="Tip" sub="Préselection : 0% / 10% / 15% / 20% / Montant libre" color={C.amber}/>
              <FlowStep n="4" label="Total final" sub="Sous-total + Tip + Frais livraison (si livraison)" color={C.amber}/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,margin:'8px 0'}}>
                <Box emoji="🥡" label="À Emporter" sub="→ Formulaire Emporter" color={C.green}/>
                <Box emoji="🛵" label="Livraison" sub="→ Formulaire Livraison" color={C.ice}/>
              </div>
            </Section>

            <Arrow />

            {/* ── CHECKOUT ── */}
            <Section title="④ CHECKOUT — Formulaire & Compte" icon="📝" color={C.purp} badge="✓">

              {/* Account decision */}
              <div style={{background:'#0d0820',border:`1px solid ${C.purp}40`,borderRadius:12,padding:14,marginBottom:12}}>
                <div style={{color:C.purp,fontWeight:800,fontSize:12,marginBottom:10}}>🔐 Connexion — Optionnelle mais incitative</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
                  <Box emoji="👤" label="Avec compte" sub="Infos pré-remplies automatiquement. Discount actif. Points gagnés." color={C.green}/>
                  <Box emoji="🚶" label="Sans compte" sub="Formulaire manuel. Pas de points. Invitation à créer un compte à la fin." color={C.amber}/>
                </div>
                <Note emoji="🎁" text="Message affiché : 'Créez un compte gratuit et bénéficiez de X% de réduction + gagnez des points à chaque commande' — le % est configurable depuis le backoffice." type="ok"/>
              </div>

              {/* Takeaway form */}
              <div style={{marginBottom:12}}>
                <div style={{color:C.green,fontWeight:800,fontSize:12,marginBottom:8}}>🥡 Formulaire À Emporter</div>
                {['Nom complet *','Numéro de téléphone *','Créneau de récupération (liste déroulante) *','Récapitulatif : articles + sous-total + tip + total'].map((f,i)=>(
                  <div key={i} style={{display:'flex',gap:8,alignItems:'center',marginBottom:5}}>
                    <span style={{color:C.green,fontSize:11}}>→</span>
                    <span style={{color:'#cbd5e1',fontSize:12}}>{f}</span>
                  </div>
                ))}
              </div>

              {/* Delivery form */}
              <div>
                <div style={{color:C.ice,fontWeight:800,fontSize:12,marginBottom:8}}>🛵 Formulaire Livraison</div>
                {[
                  'Nom complet *',
                  'Numéro de téléphone *',
                  'Adresse complète (saisie texte)',
                  'OU bouton GPS → génère lien maps.google.com/?q=LAT,LNG (sauvegardé avec la commande)',
                  'Créneau de livraison *',
                  'Récapitulatif : articles + frais livraison + tip + total',
                ].map((f,i)=>(
                  <div key={i} style={{display:'flex',gap:8,alignItems:'flex-start',marginBottom:5}}>
                    <span style={{color:C.ice,fontSize:11,marginTop:2}}>→</span>
                    <span style={{color:'#cbd5e1',fontSize:12}}>{f}</span>
                  </div>
                ))}
                <Note emoji="📍" text="Lien GPS format Google Maps → enregistré dans la commande. Le livreur l'ouvre directement depuis le backoffice ou son téléphone." type="ok"/>
              </div>

              {/* Security note */}
              <Note emoji="🔒" text="SÉCURITÉ : Tous les champs sont validés côté frontend ET sanitisés côté backend. Rate limiting sur la soumission du formulaire. Voir onglet Sécurité." type="security"/>
            </Section>

            <Arrow />

            {/* ── CONFIRMATION CHOICE ── */}
            <Section title="⑤ CONFIRMATION — WhatsApp ou Site" icon="✅" color={C.wa} badge="✓">
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
                <div style={{background:C.wa+'10',border:`1px solid ${C.wa}30`,borderRadius:12,padding:12}}>
                  <div style={{fontSize:18,marginBottom:6}}>💬</div>
                  <div style={{color:C.white,fontWeight:800,fontSize:12,marginBottom:4}}>Via WhatsApp</div>
                  <div style={{color:C.muted,fontSize:11}}>Popup avec aperçu du message. Bouton "Ouvrir WhatsApp". Client envoie. Restaurant répond.</div>
                </div>
                <div style={{background:C.blue+'15',border:`1px solid ${C.blue}30`,borderRadius:12,padding:12}}>
                  <div style={{fontSize:18,marginBottom:6}}>🌐</div>
                  <div style={{color:C.white,fontWeight:800,fontSize:12,marginBottom:4}}>Via le Site</div>
                  <div style={{color:C.muted,fontSize:11}}>Commande enregistrée directement. Restaurant voit en backoffice. Rappel/SMS pour confirmer.</div>
                </div>
              </div>
              <Note emoji="💬" text="Message WA pré-rempli : nom + mode + articles + total + tip + créneau + lien GPS (si livraison)." type="ok"/>
              <Note emoji="⏱️" text="Après confirmation site : compte à rebours estimé affiché (ex: 'Prêt dans ~25 min'). Délai configurable depuis le backoffice, ou auto-calculé selon les produits (à définir en backoffice v2)." type="ok"/>
            </Section>

            <Arrow />

            {/* ── POST ORDER ── */}
            <Section title="⑥ POST-COMMANDE — Suivi & Avis" icon="🎉" color={C.amber} badge="✓">
              <FlowStep n="1" label="Page confirmation animée" sub="Animation checkmark 3D · Numéro commande · Récapitulatif · Confettis" color={C.amber}/>

              <FlowStep n="2" label="Timeline de statut (connectée au backoffice)" color={C.amber}
                sub=""
              />
              <div style={{background:'#0d0a02',border:`1px solid ${C.amber}30`,borderRadius:10,padding:'10px 14px',marginBottom:12,marginLeft:40}}>
                <div style={{display:'flex',gap:0,alignItems:'center',flexWrap:'wrap'}}>
                  {['📥 Reçue','✅ Acceptée','👨‍🍳 En préparation','📦 Prête / En route','🎉 Livrée'].map((s,i,arr)=>(
                    <React.Fragment key={i}>
                      <div style={{background:i===0?C.amber+'30':'#1e3a5f',border:`1px solid ${i===0?C.amber:'#2d4a6a'}`,borderRadius:999,padding:'3px 10px',fontSize:10,color:i===0?C.amber:'#475569',whiteSpace:'nowrap'}}>{s}</div>
                      {i<arr.length-1&&<div style={{color:'#1e3a5f',fontSize:12,margin:'0 2px'}}>→</div>}
                    </React.Fragment>
                  ))}
                </div>
                <div style={{color:C.muted,fontSize:11,marginTop:6}}>→ Chaque étape est cliquée par le staff depuis le backoffice (réception → cuisine → livreur → livré). Le client voit l'avancement en temps réel sur sa page.</div>
              </div>

              <FlowStep n="3" label="Bouton 'Appeler le restaurant'" sub="Affiché en permanence sur la page confirmation — pour les clients qui veulent parler." color={C.amber}/>
              <FlowStep n="4" label="Formulaire Avis (déclenché après délai)" sub="★★★★★ · Commentaire libre · Photo uploadable · Envoyer sur Google aussi (optionnel). Avis soumis → en attente de validation backoffice avant publication." color={C.amber}/>
              <FlowStep n="5" label="Crédits/Points pour avis" sub="Soumettre un avis valide = X points bonus. Configuré en backoffice." color={C.green}/>
              <FlowStep n="6" label="Bouton 'Commander à nouveau'" sub="Remet les mêmes articles dans le panier en 1 tap." color={C.ice}/>
              <FlowStep n="7" label="Bouton 'Contact / Question'" sub="Ouvre WhatsApp direct avec message pré-rempli 'J\'ai une question sur ma commande #XXXX'." color={C.wa}/>
              <Note emoji="👤" text="Si pas de compte : nudge discret 'Créez un compte pour retrouver vos commandes et gagner des points' avec bouton inscription." type="ok"/>
            </Section>

            {/* ── ACCOUNT ── */}
            <div style={{height:1,background:C.border,margin:'16px 0'}}/>
            <Section title="COMPTE CLIENT — Fidélité & Badges" icon="👤" color={C.purp} badge="✓">
              <Row>
                <Chip emoji="🥉" label="Bronze" sub="1–9 commandes" color="#cd7f32"/>
                <Chip emoji="🥈" label="Argent" sub="10–24 commandes" color={C.muted}/>
                <Chip emoji="🥇" label="Or" sub="25+ commandes" color={C.amber}/>
              </Row>
              <Note emoji="💎" text="Points : 1 Dh dépensé = 1 point. 100 pts = discount X Dh. Le ratio et la valeur du point sont configurables en backoffice." type="ok"/>
              <Note emoji="🎁" text="Avantages niveaux : configurables en backoffice. Exemple : Or → livraison gratuite / Argent → -5% / Bronze → accès early à nouveautés." type="ok"/>
              <Note emoji="⭐" text="Soumettre un avis vérifié = points bonus (montant configurable en backoffice)." type="ok"/>
              <Note emoji="❤️" text="Favoris : marquer des articles. Ré-ordre rapide depuis l'historique." type="ok"/>
            </Section>

            {/* ── AVIS ── */}
            <Section title="AVIS CLIENTS — Section Dédiée" icon="⭐" color={C.amber} badge="✓">
              <Note emoji="📸" text="Le client upload photo + commentaire + note étoiles. Soumis → en attente validation backoffice. Validé → publié sur le site." type="ok"/>
              <Note emoji="🏆" text="Page dédiée aux avis : tous les avis acceptés, avec photo du plat/client, note, prénom. Style Instagram/testimonial." type="ok"/>
              <Note emoji="🔗" text="Bouton 'Laisser un avis Google' sur la page d'accueil (SocialSection) et sur la page confirmation." type="ok"/>
              <Note emoji="💰" text="Avis validé → X points crédités automatiquement sur le compte. Configurable en backoffice." type="ok"/>
            </Section>
          </div>
        )}

        {/* ══════════ VALIDATED ══════════ */}
        {tab==='validated'&&(
          <div>
            <Note emoji="✅" text="Toutes les sections sont maintenant validées par le client. Ce tableau récapitule chaque décision." type="ok"/>

            {[
              {
                topic:'Design global',color:C.ice,
                items:[
                  'Branding : Asaka Sushi (logo fourni)',
                  'Palette : bleu marine profond → ice blue (inspiré logo)',
                  'Style : Apple-like, scroll animé, 3D, immersif',
                  'Références : sugarfishsushi.com + sushi-rei.jp/en',
                  'Navigation mobile : Bottom Bar (4 icônes)',
                  'Mode sombre par défaut',
                ]
              },
              {
                topic:'Page Accueil',color:C.ice,
                items:[
                  'Hero : nom restaurant + 2 CTA (Emporter / Livraison)',
                  'Fond animé avec particules japonaises (pas de photo statique)',
                  'Section bio courte + photo propriétaire (influencer Instagram)',
                  'Section "Comment ça marche" : 3 étapes, style japonais illustré',
                  'Horaires en page d\'accueil',
                  'Bouton compact Google Maps (pas d\'iframe)',
                  'WhatsApp direct pour contact',
                  'Section avis clients (carrousel)',
                ]
              },
              {
                topic:'Menu',color:C.purp,
                items:[
                  'Client choisit son mode d\'affichage (grille / liste / horizontal)',
                  'Vraies photos (à uploader plus tard — placeholders pour l\'instant)',
                  'Tap → Bottom Sheet avec ingrédients (connecté backoffice)',
                  'Barre de recherche avec produits suggérés (configurés backoffice)',
                  'Badges Populaire / Nouveau gérés backoffice',
                ]
              },
              {
                topic:'Commande',color:C.green,
                items:[
                  '2 modes seulement : À Emporter + Livraison',
                  'Compte optionnel — incitation avec % discount configurable',
                  'GPS livraison → lien Google Maps généré + sauvegardé',
                  'Tip proposé dans le panier',
                  'WhatsApp popup OU confirmation site directe',
                  'Compte à rebours post-commande (délai configurable backoffice)',
                ]
              },
              {
                topic:'Post-commande',color:C.amber,
                items:[
                  'Timeline statut (5 étapes) pilotée par le staff depuis backoffice',
                  'Bouton "Appeler le restaurant" permanent',
                  'Formulaire avis après délai (photo + commentaire + étoiles)',
                  'Avis → points bonus + validation backoffice avant publication',
                  'Bouton "Commander à nouveau"',
                  'Bouton contact/réclamation → WhatsApp',
                ]
              },
              {
                topic:'Fidélité',color:C.amber,
                items:[
                  'Bronze / Argent / Or selon nombre de commandes',
                  'Points : 1 Dh = 1 pt, valeur configurable backoffice',
                  'Avantages par niveau configurables backoffice',
                  'Favoris + historique',
                  'Points bonus pour avis validé',
                ]
              },
              {
                topic:'Avis',color:C.amber,
                items:[
                  'Upload photo + commentaire + note',
                  'Validation backoffice avant publication',
                  'Page dédiée tous les avis',
                  'Lien avis Google sur accueil + confirmation',
                ]
              },
            ].map(s=>(
              <Section key={s.topic} title={s.topic} icon="✓" color={s.color} badge="✓">
                {s.items.map((item,i)=>(
                  <div key={i} style={{display:'flex',gap:8,marginBottom:6,alignItems:'flex-start'}}>
                    <span style={{color:C.green,flexShrink:0,marginTop:1}}>✓</span>
                    <span style={{color:'#cbd5e1',fontSize:12}}>{item}</span>
                  </div>
                ))}
              </Section>
            ))}
          </div>
        )}

        {/* ══════════ SECURITY ══════════ */}
        {tab==='security'&&(
          <div>
            <div style={{background:C.coral+'12',border:`1px solid ${C.coral}40`,borderRadius:14,padding:'12px 16px',marginBottom:20}}>
              <div style={{color:C.coral,fontWeight:800,fontSize:13}}>🔒 OWASP Security — Priorité absolue avant tout autre code</div>
              <div style={{color:'#fca5a5',fontSize:12,marginTop:4}}>Implémenté dès le départ, pas en patch post-dev.</div>
            </div>

            <Section title="Frontend Security" icon="🛡️" color={C.coral}>
              {[
                {rule:'Input Sanitization',detail:'Tous les champs de formulaire : trim() + strip HTML tags + longueur max. Avant envoi vers API.'},
                {rule:'Validation côté client',detail:'Regex téléphone marocain (+212 / 06 / 07), format email, adresse min 10 chars, nom min 2 chars.'},
                {rule:'XSS Prevention',detail:'Pas de dangerouslySetInnerHTML. Toute donnée affichée vient du state React, jamais injectée raw.'},
                {rule:'Rate Limiting UI',detail:'Bouton "Commander" désactivé 3s après clic. Pas de double-soumission possible.'},
                {rule:'Env Variables',detail:'Numéro WA, Google Maps API Key, Google Place ID → variables d\'environnement (.env). Jamais hardcodés dans le code.'},
                {rule:'GPS Permissions',detail:'navigator.geolocation uniquement sur HTTPS. Gestion explicite du refus. Fallback → saisie manuelle.'},
              ].map((r,i)=>(
                <div key={i} style={{marginBottom:10,paddingBottom:10,borderBottom:i<5?`1px solid ${C.border}`:'none'}}>
                  <div style={{color:C.coral,fontWeight:700,fontSize:12}}>{r.rule}</div>
                  <div style={{color:C.muted,fontSize:12,marginTop:3}}>{r.detail}</div>
                </div>
              ))}
            </Section>

            <Section title="Backend / API Security" icon="🔐" color={C.coral}>
              {[
                {rule:'Parameterized Queries',detail:'Toutes les requêtes DB utilisent des paramètres. Zéro concaténation de strings SQL.'},
                {rule:'Rate Limiting API',detail:'Express-rate-limit : max 10 req/min par IP sur POST /orders. Max 5 tentatives login.'},
                {rule:'Input Validation Backend',detail:'Joi ou Zod schema validation sur chaque endpoint. Même si le frontend valide, le backend revalide.'},
                {rule:'API Keys en .env',detail:'WHATSAPP_NUMBER, GOOGLE_MAPS_KEY, JWT_SECRET, DB_URL → toutes en variables d\'environnement.'},
                {rule:'CORS',detail:'Allowlist des origines autorisées. Pas de wildcard * en production.'},
                {rule:'Helmet.js',detail:'Headers HTTP de sécurité : HSTS, X-Frame-Options, CSP, etc.'},
                {rule:'Auth JWT',detail:'Tokens avec expiration courte (1h access + refresh token). Stored en httpOnly cookie, pas localStorage.'},
              ].map((r,i)=>(
                <div key={i} style={{marginBottom:10,paddingBottom:10,borderBottom:i<6?`1px solid ${C.border}`:'none'}}>
                  <div style={{color:C.coral,fontWeight:700,fontSize:12}}>{r.rule}</div>
                  <div style={{color:C.muted,fontSize:12,marginTop:3}}>{r.detail}</div>
                </div>
              ))}
            </Section>

            <Section title="Données sensibles" icon="🗝️" color={C.amber}>
              <Note emoji="📱" text="Numéro téléphone client : stocké hashé ou masqué dans l'affichage backoffice (+212 6XX XXX ***)" type="security"/>
              <Note emoji="📍" text="Coordonnées GPS : stockées uniquement sous forme de lien Maps, pas les coordonnées brutes." type="security"/>
              <Note emoji="🔑" text="Mots de passe : bcrypt avec salt rounds ≥ 12. Jamais stockés en clair." type="security"/>
              <Note emoji="🍪" text="Sessions : httpOnly cookies + SameSite=Strict. Pas de token dans l'URL." type="security"/>
            </Section>

            <Section title="Fichier .env requis" icon="⚙️" color={C.dim}>
              <div style={{background:'#030810',borderRadius:10,padding:14,fontFamily:'monospace',fontSize:11,color:'#86efac',lineHeight:2}}>
                {'# Restaurant\n'}
                {'VITE_WHATSAPP_NUMBER=+212600000000\n'}
                {'VITE_RESTAURANT_PHONE=+212522000000\n'}
                {'VITE_GOOGLE_MAPS_PLACE_ID=ChIJ...\n'}
                {'\n# Auth & DB\n'}
                {'JWT_SECRET=your-super-secret-key\n'}
                {'DB_URL=mongodb://localhost/asaka\n'}
                {'\n# APIs\n'}
                {'VITE_GOOGLE_MAPS_KEY=AIza...\n'}
              </div>
              <Note emoji="⚠️" text="Ces valeurs sont des placeholders. Remplacer avec les vraies infos avant déploiement. Le fichier .env est dans .gitignore." type="security"/>
            </Section>
          </div>
        )}

        {/* ══════════ STACK ══════════ */}
        {tab==='stack'&&(
          <div>
            <Section title="Stack Technique" icon="⚙️" color={C.ice}>
              <Row>
                <Chip emoji="⚛️" label="React 19" sub="Framework UI" color={C.ice}/>
                <Chip emoji="⚡" label="Vite" sub="Build tool" color={C.amber}/>
                <Chip emoji="🎨" label="Tailwind CSS 3" sub="Styling" color={C.blue}/>
              </Row>
              <Row>
                <Chip emoji="🗄️" label="État local" sub="useState / useContext" color={C.purp}/>
                <Chip emoji="📦" label="Lucide Icons" sub="Déjà installé" color={C.ice}/>
              </Row>
            </Section>

            <Section title="Nouvelles librairies pour le design Apple-like" icon="✨" color={C.purp}>
              {[
                {lib:'Framer Motion',npm:'framer-motion',usage:'Animations scroll-triggered, transitions de pages, bottom sheet, confettis. Le plus adapté à React.'},
                {lib:'Three.js + React Three Fiber',npm:'@react-three/fiber @react-three/drei',usage:'Éléments 3D dans le hero (sushi 3D, particules). Optionnel si trop lourd — on peut faire du CSS 3D.'},
                {lib:'Lenis / Smooth Scroll',npm:'@studio-freight/lenis',usage:'Scroll fluide comme Apple.com — différence immédiate sur la qualité perçue.'},
                {lib:'React Hot Toast',npm:'react-hot-toast',usage:'Notifications légères : "Article ajouté", "Commande confirmée".'},
                {lib:'React Hook Form + Zod',npm:'react-hook-form zod',usage:'Validation de formulaires robuste + type-safe. Remplace la validation manuelle actuelle.'},
              ].map((l,i)=>(
                <div key={i} style={{marginBottom:12,paddingBottom:12,borderBottom:i<4?`1px solid ${C.border}`:'none'}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                    <span style={{color:C.purp,fontWeight:800,fontSize:13}}>{l.lib}</span>
                    <span style={{background:'#1e3a5f',borderRadius:6,padding:'1px 8px',fontSize:10,fontFamily:'monospace',color:C.muted}}>{l.npm}</span>
                  </div>
                  <div style={{color:C.muted,fontSize:12}}>{l.usage}</div>
                </div>
              ))}
              <Note emoji="📦" text="Total nouvelles dépendances : 5 packages. Impact bundle géré avec lazy loading des composants 3D." type="idea"/>
            </Section>

            <Section title="Structure des fichiers (refonte)" icon="📁" color={C.dim}>
              <div style={{fontFamily:'monospace',fontSize:11,color:'#94a3b8',lineHeight:2,background:'#030810',borderRadius:10,padding:14}}>
                {`src/frontoffice/
├── FrontApp.jsx              (état global, routing)
├── components/
│   ├── layout/
│   │   ├── BottomNav.jsx     ← NOUVEAU
│   │   ├── FrontNavbar.jsx   (simplifié)
│   │   └── Footer.jsx        (compact)
│   ├── home/
│   │   ├── HeroSection.jsx   ← REFONDU 3D
│   │   ├── OwnerSection.jsx  ← NOUVEAU
│   │   ├── HowItWorks.jsx    ← NOUVEAU
│   │   ├── FeaturedMenu.jsx  (refondu)
│   │   ├── ReviewsSection.jsx← NOUVEAU
│   │   └── LocationContact.jsx← compact
│   ├── menu/
│   │   ├── MenuPage.jsx      (refondu)
│   │   ├── MenuSearch.jsx    ← NOUVEAU
│   │   └── ItemBottomSheet.jsx←NOUVEAU
│   ├── order/
│   │   ├── CartPage.jsx
│   │   ├── UnifiedCheckout.jsx
│   │   ├── WaConfirmModal.jsx← NOUVEAU
│   │   └── OrderConfirmation.jsx
│   ├── reviews/
│   │   └── ReviewsPage.jsx   ← NOUVEAU
│   └── auth/
│       ├── CustomerAuth.jsx
│       └── CustomerProfile.jsx
└── data/
    └── asakaData.js          ← RENOMMÉ`}
              </div>
            </Section>
          </div>
        )}

        {/* ══════════ START ══════════ */}
        {tab==='start'&&(
          <div>
            {/* All clear */}
            <div style={{background:C.green+'12',border:`1px solid ${C.green}40`,borderRadius:16,padding:'16px 18px',marginBottom:20}}>
              <div style={{color:C.green,fontWeight:900,fontSize:16,marginBottom:8}}>🚀 Tout est validé — Prêt à démarrer</div>
              <div style={{color:'#86efac',fontSize:13}}>Le plan est complet. Voici exactement dans quel ordre on construit.</div>
            </div>

            {/* Order of work */}
            <Section title="Ordre d'implémentation" icon="📋" color={C.ice}>
              {[
                {n:1, phase:'Setup & Foundation', items:['Renommer Salmon Sushi → Asaka Sushi dans tous les fichiers','Changer la palette (tokens CSS orange → bleu)','Installer Framer Motion + Lenis + React Hot Toast','Configurer .env avec placeholders','Mettre en place la validation OWASP (Zod + sanitize)'], color:C.coral, est:'1-2h'},
                {n:2, phase:'Navigation & Layout', items:['Bottom Nav Bar (mobile)','Simplifier FrontNavbar (desktop)','Footer compact'], color:C.ice, est:'1h'},
                {n:3, phase:'Page d\'accueil (Hero 3D + sections)', items:['HeroSection animée (Framer Motion + optionnel Three.js)','Section owner/bio','HowItWorks japonais illustré','LocationContact compact (bouton Maps)'], color:C.purp, est:'3-4h'},
                {n:4, phase:'Page Menu', items:['Refonte MenuPage (3 modes affichage)','Barre de recherche avec suggestions','ItemBottomSheet (popup ingrédients)','FAB panier flottant'], color:C.ice, est:'2-3h'},
                {n:5, phase:'Flux de commande', items:['CartPage (2 modes seulement)','UnifiedCheckout (Emporter + Livraison + GPS)','WaConfirmModal (popup WhatsApp)','OrderConfirmation (timeline + timer)'], color:C.green, est:'2-3h'},
                {n:6, phase:'Compte & Fidélité', items:['CustomerAuth (login/signup avec offre incitative)','CustomerProfile (badge tier + points + historique + favoris)'], color:C.amber, est:'2h'},
                {n:7, phase:'Avis Clients', items:['ReviewsSection (homepage)','ReviewsPage (dédiée)','FormAvis (upload photo + note + commentaire)'], color:C.amber, est:'1-2h'},
                {n:8, phase:'Polish & Responsive', items:['Tests mobile (375px, 390px, 430px)','Animations finales','Performance (lazy loading images)','Vérification sécurité complète'], color:C.dim, est:'2h'},
              ].map(p=>(
                <div key={p.n} style={{marginBottom:16,paddingBottom:16,borderBottom:`1px solid ${C.border}`}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                    <div style={{width:28,height:28,borderRadius:'50%',background:p.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:900,color:C.bg,flexShrink:0}}>{p.n}</div>
                    <span style={{color:C.white,fontWeight:800,fontSize:14,flex:1}}>{p.phase}</span>
                    <span style={{background:C.border,borderRadius:999,padding:'2px 8px',fontSize:10,color:C.muted}}>{p.est}</span>
                  </div>
                  {p.items.map((item,i)=>(
                    <div key={i} style={{display:'flex',gap:8,marginBottom:4,marginLeft:38}}>
                      <span style={{color:p.color,fontSize:10,marginTop:3,flexShrink:0}}>▸</span>
                      <span style={{color:C.muted,fontSize:12}}>{item}</span>
                    </div>
                  ))}
                </div>
              ))}
            </Section>

            {/* What we need from client */}
            <Section title="Ce qu'on attend du client (can start sans ça)" icon="📬" color={C.amber} badge="!">
              {[
                {item:'Numéro WhatsApp du restaurant', urgency:'Avant Phase 5', color:C.coral},
                {item:'Numéro de téléphone du restaurant', urgency:'Avant Phase 5', color:C.coral},
                {item:'Google Maps Place ID (pour lien avis)', urgency:'Avant Phase 7', color:C.amber},
                {item:'Photo du propriétaire (Instagram)', urgency:'Avant Phase 3', color:C.amber},
                {item:'Contenu menu réel (noms, prix, catégories, ingrédients)', urgency:'Placeholders pour l\'instant', color:C.dim},
                {item:'Photos des plats HD', urgency:'Placeholders pour l\'instant', color:C.dim},
                {item:'Instagram handle du restaurant', urgency:'Avant Phase 3', color:C.amber},
                {item:'Adresse exacte du restaurant', urgency:'Avant Phase 3', color:C.amber},
                {item:'Horaires d\'ouverture', urgency:'Avant Phase 3', color:C.amber},
              ].map((r,i)=>(
                <div key={i} style={{display:'flex',gap:10,alignItems:'center',marginBottom:8}}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:r.color,flexShrink:0}}/>
                  <span style={{color:'#cbd5e1',fontSize:12,flex:1}}>{r.item}</span>
                  <span style={{background:r.color+'20',color:r.color,borderRadius:999,padding:'1px 8px',fontSize:10,fontWeight:700,whiteSpace:'nowrap'}}>{r.urgency}</span>
                </div>
              ))}
            </Section>

            <div style={{background:`linear-gradient(135deg,${C.blue}22,${C.ice}11)`,border:`1px solid ${C.ice}30`,borderRadius:16,padding:18,marginTop:8,textAlign:'center'}}>
              <div style={{fontSize:32,marginBottom:8}}>✅</div>
              <div style={{color:C.ice,fontWeight:900,fontSize:16,marginBottom:6}}>Validez ce plan et on démarre Phase 1</div>
              <div style={{color:C.muted,fontSize:13}}>Dites "go" et je commence par le Setup + Foundation + OWASP Security.</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
