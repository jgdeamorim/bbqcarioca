/* ── i18n LANGUAGE SWITCHER ── */
function setLang(lang) {
  document.documentElement.lang = lang;
  try { localStorage.setItem('bbq-lang', lang); } catch(e){}
  
  ['lang-en', 'footer-lang-en'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('active', lang === 'en');
  });
  ['lang-pt', 'footer-lang-pt'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('active', lang === 'pt');
  });
}

function initI18n() {
  document.getElementById('lang-en')?.addEventListener('click', () => setLang('en'));
  document.getElementById('lang-pt')?.addEventListener('click', () => setLang('pt'));
  document.getElementById('footer-lang-en')?.addEventListener('click', () => setLang('en'));
  document.getElementById('footer-lang-pt')?.addEventListener('click', () => setLang('pt'));
  try { if (localStorage.getItem('bbq-lang') === 'pt') setLang('pt'); } catch(e){}
}
