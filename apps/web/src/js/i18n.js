/* ── i18n JSON ENGINE (EN & PT-BR) ── */
const translations = {};
let currentLang = 'en';

async function loadLocale(lang) {
  const file = lang === 'pt' ? 'pt-br.json' : 'en.json';
  if (translations[lang]) return translations[lang];
  
  try {
    const res = await fetch(`locales/${file}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    translations[lang] = data;
    return data;
  } catch (err) {
    console.warn(`[i18n] Could not load locales/${file}:`, err);
    return null;
  }
}

function getNestedValue(obj, keyPath) {
  return keyPath.split('.').reduce((prev, curr) => (prev && prev[curr] !== undefined) ? prev[curr] : null, obj);
}

async function setLang(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  try { localStorage.setItem('bbq-lang', lang); } catch (e) { void e; }

  // Update toggle buttons active class
  ['lang-en', 'footer-lang-en'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('active', lang === 'en');
  });
  ['lang-pt', 'footer-lang-pt'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('active', lang === 'pt');
  });

  // Load JSON translations and apply
  const dict = await loadLocale(lang);
  if (dict) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = getNestedValue(dict, key);
      if (val !== null) el.textContent = val;
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      const val = getNestedValue(dict, key);
      if (val !== null) el.innerHTML = val;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = getNestedValue(dict, key);
      if (val !== null) el.placeholder = val;
    });
  }
}

function initI18n() {
  document.getElementById('lang-en')?.addEventListener('click', () => setLang('en'));
  document.getElementById('lang-pt')?.addEventListener('click', () => setLang('pt'));
  document.getElementById('footer-lang-en')?.addEventListener('click', () => setLang('en'));
  document.getElementById('footer-lang-pt')?.addEventListener('click', () => setLang('pt'));

  let initialLang = 'en';
  try {
    const saved = localStorage.getItem('bbq-lang');
    if (saved === 'pt' || saved === 'en') initialLang = saved;
    else if (navigator.language.startsWith('pt')) initialLang = 'pt';
  } catch (e) { void e; }

  setLang(initialLang);
}
