// M. Patachon — interactions & animations

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
