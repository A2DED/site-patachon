// M. Patachon — interactions & animations

/* ==========================================================================
   Google Analytics 4 + consentement cookies (conforme RGPD)
   - Aucun cookie/traceur n'est déposé tant que le visiteur n'a pas accepté.
   - ID de mesure de la propriété "Site M Patachon".
   ========================================================================== */
(function () {
  var GA_ID = 'G-9SKRDQ8SM8';
  var STORE = 'mp_consent'; // 'granted' | 'denied'
  function getChoice(){ try { return localStorage.getItem(STORE); } catch(e){ return null; } }
  function setChoice(v){ try { localStorage.setItem(STORE, v); } catch(e){} }

  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = gtag;

  // Consent Mode v2 : tout refusé par défaut
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied'
  });

  var gaLoaded = false;
  function loadGA(){
    if (gaLoaded) return; gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
  }
  function grant(){
    setChoice('granted');
    gtag('consent', 'update', { analytics_storage: 'granted' });
    loadGA();
  }
  function deny(){ setChoice('denied'); }

  // Bandeau cookies (injecté sur chaque page, charte Patachon)
  function showBanner(){
    if (document.getElementById('mp-cookie')) return;
    var css = document.createElement('style');
    css.textContent =
      '#mp-cookie{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:560px;margin:0 auto;background:#0F2D68;color:#fff;border:2px solid #fff;border-radius:18px;padding:18px 20px;box-shadow:0 12px 40px rgba(0,0,0,.35);font-family:"Josefin Sans",Arial,sans-serif;}'+
      '#mp-cookie p{margin:0 0 14px;font-size:14px;line-height:1.45;}'+
      '#mp-cookie a{color:#fff;text-decoration:underline;}'+
      '#mp-cookie .mp-cta{display:flex;gap:10px;flex-wrap:wrap;}'+
      '#mp-cookie button{cursor:pointer;border:2px solid #fff;border-radius:999px;padding:9px 20px;font-family:inherit;font-weight:700;text-transform:uppercase;letter-spacing:.4px;font-size:13px;}'+
      '#mp-cookie .mp-ok{background:#fff;color:#13377D;}'+
      '#mp-cookie .mp-ok:hover{background:#13377D;color:#fff;}'+
      '#mp-cookie .mp-no{background:transparent;color:#fff;}'+
      '#mp-cookie .mp-no:hover{background:rgba(255,255,255,.14);}';
    document.head.appendChild(css);
    var box = document.createElement('div');
    box.id = 'mp-cookie';
    box.setAttribute('role','dialog');
    box.setAttribute('aria-label','Consentement cookies');
    box.innerHTML =
      '<p>On utilise des cookies de mesure d\'audience (Google Analytics) pour améliorer le site. '+
      'Tu peux accepter ou refuser — le site marche pareil. '+
      '<a href="mentions-legales.html">En savoir plus</a>.</p>'+
      '<div class="mp-cta">'+
      '<button type="button" class="mp-ok">Accepter</button>'+
      '<button type="button" class="mp-no">Refuser</button>'+
      '</div>';
    document.body.appendChild(box);
    box.querySelector('.mp-ok').addEventListener('click', function(){ grant(); box.remove(); });
    box.querySelector('.mp-no').addEventListener('click', function(){ deny(); box.remove(); });
  }

  var choice = getChoice();
  if (choice === 'granted') { loadGA(); }
  else if (choice !== 'denied') {
    if (document.body) showBanner();
    else document.addEventListener('DOMContentLoaded', showBanner);
  }
})();


const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- Menu burger mobile -------------------------------------------------- */
const toggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');
if (toggle && nav) {
  const headerEl = document.querySelector('.header');
  const setMenu = (open) => {
    toggle.classList.toggle('is-open', open);
    nav.classList.toggle('is-open', open);
    // le backdrop-filter du header crée un bloc conteneur qui empêche l'overlay
    // (position:fixed) de couvrir tout l'écran quand on est scrollé → on le neutralise
    if (headerEl) headerEl.classList.toggle('nav-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  nav.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => setMenu(false));
  });
  // fermer avec Échap
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
}

/* ---- CTA flottant desktop : apparaît après un peu de scroll -------------- */
const stickyCta = document.querySelector('.sticky-cta');
if (stickyCta) {
  const toggleCta = () => stickyCta.classList.toggle('is-shown', window.scrollY > 560);
  toggleCta();
  window.addEventListener('scroll', toggleCta, { passive: true });

  // masque le CTA flottant quand le footer est visible (ne recouvre plus le programme fidélité)
  const footerEl = document.querySelector('.footer2');
  if (footerEl && 'IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      stickyCta.classList.toggle('is-hidden', entries[0].isIntersecting);
    }, { rootMargin: '0px 0px -8% 0px' }).observe(footerEl);
  }
}

/* ---- Choix du restaurant à appeler (page carte) -------------------------- */
const callSheet = document.getElementById('callSheet');
if (callSheet) {
  const openBtn = document.querySelector('[data-call-open]');
  const setSheet = (open) => {
    callSheet.classList.toggle('is-open', open);
    callSheet.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  if (openBtn) openBtn.addEventListener('click', () => setSheet(true));
  callSheet.querySelectorAll('[data-call-close]').forEach(el => el.addEventListener('click', () => setSheet(false)));
  // fermer après avoir choisi un numéro (laisse le tel: se déclencher)
  callSheet.querySelectorAll('.call-sheet__opt').forEach(el => el.addEventListener('click', () => setTimeout(() => setSheet(false), 60)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setSheet(false); });
}

/* ---- Année du footer ----------------------------------------------------- */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---- Header : état "scrolled" + barre de progression --------------------- */
const header = document.querySelector('.header');
const progress = document.querySelector('.scroll-progress');
function onScrollUI() {
  const y = window.scrollY;
  if (header) header.classList.toggle('is-scrolled', y > 40);
  if (progress) {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
  }
}

/* ---- Scroll-reveal (IntersectionObserver) -------------------------------- */
const revealEls = document.querySelectorAll('[data-reveal], .title-reveal');
if (revealEls.length) {
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => io.observe(el));
  }
}

/* ---- Compteurs animés ---------------------------------------------------- */
const counters = document.querySelectorAll('[data-count]');
if (counters.length) {
  const run = (el) => {
    const target = parseFloat(el.dataset.count);
    const dur = 1400;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toString();
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toString();
    };
    requestAnimationFrame(step);
  };
  if (reduceMotion || !('IntersectionObserver' in window)) {
    counters.forEach(el => el.textContent = el.dataset.count);
  } else {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { run(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach(el => cio.observe(el));
  }
}

/* ---- Parallax (hero bg, pictos déco, médias) ----------------------------- */
const heroBg = document.querySelector('.hero__bg');
const parallaxEls = Array.from(document.querySelectorAll('[data-parallax]'));
let ticking = false;

function applyParallax() {
  const vh = window.innerHeight;
  // hero background
  if (heroBg) {
    const y = Math.min(window.scrollY, vh);
    heroBg.style.transform = `scale(1.08) translateY(${y * 0.16}px)`;
  }
  // elements relative to their position on screen
  for (const el of parallaxEls) {
    const speed = parseFloat(el.dataset.parallax) || 0.15;
    const rect = el.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const offset = (center - vh / 2) * -speed;
    el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
  }
  ticking = false;
}

function onScroll() {
  onScrollUI();
  if (!reduceMotion && !ticking) {
    ticking = true;
    requestAnimationFrame(applyParallax);
  }
}
onScrollUI();
if (!reduceMotion) applyParallax();
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', () => { if (!reduceMotion) applyParallax(); }, { passive: true });

/* ---- Boutons magnétiques (desktop, pointeur fin) ------------------------- */
if (!reduceMotion && window.matchMedia('(pointer:fine)').matches) {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width / 2);
      const my = e.clientY - (r.top + r.height / 2);
      btn.style.transform = `translate(${mx * 0.18}px, ${my * 0.28 - 2}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

/* ---- Commander : sélecteur de restaurant interne + statut horaires -------- */
(function () {
  const MARKET = 'https://bonne-nouvelle.marketplace.dood.com/fr';
  // Horaires en minutes depuis minuit (0=dim … 6=sam). 11h45=705, 14h00=840,
  // 14h30=870, 19h00=1140, 22h30=1350, 23h00=1380.
  const RESTOS = [
    { name: 'Petit Quevilly', addr: '7 Rue Hélène Boucher',
      url: MARKET + '/shops/street-food/m-patachon-rouen-rive-gauche',
      hours: { 0:[[1140,1350]], 1:[], 2:[[1140,1350]], 3:[[1140,1350]], 4:[[1140,1350]], 5:[[1140,1350]], 6:[[1140,1350]] } },
    { name: 'Rouen Centre-ville', addr: '66 Rue de la Vicomté',
      url: MARKET + '/shops/street-food/m-patachon-rouen-rive-droite',
      hours: { 0:[[1140,1350]], 1:[[705,840],[1140,1350]], 2:[[705,840],[1140,1350]], 3:[[705,840],[1140,1350]], 4:[[705,840],[1140,1350]], 5:[[705,840],[1140,1380]], 6:[[705,870],[1140,1350]] } }
  ];
  const T = {
    fr: { kicker:'Commander en ligne', title:'Quel restaurant ?', open:'Ouvert', closed:'Fermé', closes:'ferme à', opens:'ouvre à', opensDay:'ouvre', soon:'ferme bientôt', go:'Commander', modes:['Livraison','À emporter'], note:'Redirection vers notre service de commande en ligne', days:['dim.','lun.','mar.','mer.','jeu.','ven.','sam.'] },
    en: { kicker:'Order online', title:'Which restaurant?', open:'Open', closed:'Closed', closes:'closes at', opens:'opens at', opensDay:'opens', soon:'closing soon', go:'Order', modes:['Delivery','Takeaway'], note:'You will be redirected to our online ordering service', days:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'] },
    es: { kicker:'Pedir online', title:'¿Qué restaurante?', open:'Abierto', closed:'Cerrado', closes:'cierra a las', opens:'abre a las', opensDay:'abre', soon:'cierra pronto', go:'Pedir', modes:['Entrega','Para llevar'], note:'Serás redirigido a nuestro servicio de pedidos online', days:['dom.','lun.','mar.','mié.','jue.','vie.','sáb.'] },
    de: { kicker:'Online bestellen', title:'Welches Restaurant?', open:'Geöffnet', closed:'Geschlossen', closes:'schließt um', opens:'öffnet um', opensDay:'öffnet', soon:'schließt bald', go:'Bestellen', modes:['Lieferung','Zum Mitnehmen'], note:'Weiterleitung zu unserem Online-Bestellservice', days:['So.','Mo.','Di.','Mi.','Do.','Fr.','Sa.'] }
  };
  function lang() { let l = 'fr'; try { l = localStorage.getItem('mp_lang') || 'fr'; } catch (e) {} return T[l] ? l : 'fr'; }
  function parisNow() {
    try {
      const p = new Intl.DateTimeFormat('en-US', { timeZone:'Europe/Paris', hour12:false, weekday:'short', hour:'2-digit', minute:'2-digit' }).formatToParts(new Date());
      const wd = { Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6 }[p.find(x => x.type === 'weekday').value];
      let hh = parseInt(p.find(x => x.type === 'hour').value, 10); if (hh === 24) hh = 0;
      const mm = parseInt(p.find(x => x.type === 'minute').value, 10);
      return { wd: wd, min: hh * 60 + mm };
    } catch (e) { const d = new Date(); return { wd: d.getDay(), min: d.getHours() * 60 + d.getMinutes() }; }
  }
  function fmtTime(m, l) { const h = Math.floor(m / 60), mm = String(m % 60).padStart(2, '0'); return l === 'fr' ? (h + 'h' + mm) : (String(h).padStart(2, '0') + ':' + mm); }
  function status(resto) {
    const now = parisNow(), l = lang(), t = T[l];
    const today = resto.hours[now.wd] || [];
    // Les cuisines ferment 15 min avant l'heure de fermeture → dernière commande = fin − 15 min
    const LAST_ORDER = 15;
    for (const iv of today) {
      const effEnd = iv[1] - LAST_ORDER;
      if (now.min >= iv[0] && now.min < effEnd) {
        const soon = (effEnd - now.min) <= 30;
        return { cls: soon ? 'rstatus-soon' : 'rstatus-open', label: (soon ? t.soon : t.open) + ' · ' + t.closes + ' ' + fmtTime(effEnd, l) };
      }
    }
    for (const iv of today) { if (iv[0] > now.min) return { cls:'rstatus-closed', label: t.closed + ' · ' + t.opens + ' ' + fmtTime(iv[0], l) }; }
    for (let i = 1; i <= 7; i++) {
      const d = (now.wd + i) % 7, arr = resto.hours[d] || [];
      if (arr.length) return { cls:'rstatus-closed', label: t.closed + ' · ' + t.opensDay + ' ' + t.days[d] + ' ' + fmtTime(arr[0][0], l) };
    }
    return { cls:'rstatus-closed', label: t.closed };
  }
  const sheet = document.createElement('div');
  sheet.className = 'order-sheet'; sheet.id = 'orderSheet'; sheet.setAttribute('aria-hidden', 'true');
  sheet.innerHTML =
    '<div class="order-sheet__backdrop" data-order-close></div>' +
    '<div class="order-sheet__panel" role="dialog" aria-modal="true" aria-label="Commander">' +
    '<button type="button" class="order-sheet__close" data-order-close aria-label="Fermer">&times;</button>' +
    '<span class="order-sheet__kicker" data-k></span><h3 data-title></h3>' +
    '<div class="order-sheet__modes" data-modes></div>' +
    '<div data-opts></div><p class="order-sheet__note" data-note></p></div>';
  document.body.appendChild(sheet);
  const optsWrap = sheet.querySelector('[data-opts]');
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c])); }
  function render() {
    const t = T[lang()];
    sheet.querySelector('[data-k]').textContent = t.kicker;
    sheet.querySelector('[data-title]').textContent = t.title;
    sheet.querySelector('[data-modes]').innerHTML = (t.modes || []).map(function (m) { return '<span>' + esc(m) + '</span>'; }).join('');
    sheet.querySelector('[data-note]').textContent = t.note;
    optsWrap.innerHTML = RESTOS.map(function (r) {
      const st = status(r);
      return '<a class="order-opt" href="' + r.url + '" target="_blank" rel="noopener">' +
        '<span class="order-opt__info"><span class="order-opt__name">' + esc(r.name) + '</span>' +
        '<span class="order-opt__sub">' + esc(r.addr) + '</span>' +
        '<span class="order-opt__status ' + st.cls + '">' + esc(st.label) + '</span></span>' +
        '<span class="order-opt__go">' + esc(t.go) + ' →</span></a>';
    }).join('');
  }
  function setOpen(open) {
    if (open) render();
    sheet.classList.toggle('is-open', open);
    sheet.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  document.querySelectorAll('a[href="' + MARKET + '"]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); setOpen(true); });
  });
  sheet.querySelectorAll('[data-order-close]').forEach(function (el) { el.addEventListener('click', function () { setOpen(false); }); });
  optsWrap.addEventListener('click', function (e) { if (e.target.closest('.order-opt')) setTimeout(function () { setOpen(false); }, 80); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
})();


/* ---- GA4 : suivi des clics "Commander" (intention de commande) ----------- */
(function () {
  document.addEventListener('click', function (e) {
    if (typeof window.gtag !== 'function') return;
    var opt = e.target.closest && e.target.closest('.order-opt');
    if (opt) {
      var el = opt.querySelector('.order-opt__name');
      var name = (el && el.textContent ? el.textContent : 'inconnu').trim();
      window.gtag('event', 'commander_clic', { restaurant: name });
    }
  }, true);
})();
