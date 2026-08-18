/* ── APP ENTRYPOINT & INITIALIZERS ── */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof initI18n === 'function') initI18n();

  const mobMenu = document.getElementById('mob-menu');
  const mobToggle = document.getElementById('mob-toggle');
  function closeMob() {
    if (mobMenu) mobMenu.classList.remove('open');
    if (mobToggle) mobToggle.setAttribute('aria-expanded','false');
    document.body.style.overflow = '';
  }
  if (mobToggle && mobMenu) {
    mobToggle.addEventListener('click', () => {
      const open = mobMenu.classList.toggle('open');
      mobToggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }});
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

  const heroBg = document.getElementById('hero-bg');
  if (heroBg) {
    const img = heroBg.querySelector('img');
    if (img) {
      if (img.complete) {
        heroBg.classList.add('loaded');
      } else {
        img.addEventListener('load', () => heroBg.classList.add('loaded'));
      }
    }
  }

  (function buildMarquee() {
    const items = ['PICANHA', 'COSTELA', 'LINGUIÇA', 'PÃO DE ALHO', 'FRANGO', 'MAMINHA', 'ALCATRA', 'VINAGRETE'];
    const marqueeEl = document.getElementById('marquee');
    if (!marqueeEl) return;
    let html = '';
    const repeat = 4;
    for (let r = 0; r < repeat; r++) {
      items.forEach(item => {
        html += `<span class="marquee-item">${item}<span class="marquee-dot" aria-hidden="true">•</span></span>`;
      });
    }
    marqueeEl.innerHTML = html;
  })();

  if (typeof initEmbers === 'function') initEmbers();

  const bubble = document.getElementById('wa-bubble');
  if (bubble) {
    setTimeout(() => bubble.classList.add('show'), 2200);
    document.getElementById('wa-close')?.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      bubble.classList.remove('show');
    });
  }
});
