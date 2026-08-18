/* ── QUOTE FORM HANDLER ── */
function handleQuote(e) {
  e.preventDefault();
  const f = e.target;
  const lang = document.documentElement.lang;
  const date    = f.date.value    || '—';
  const city    = f.city.value    || '—';
  const guests  = f.guests.value  || '—';
  const grill   = f.grill.value;
  const notes   = f.notes.value   || '—';

  const grillLabel = lang === 'pt'
    ? (grill === 'yes' ? 'Sim' : 'Não — levar churrasqueira')
    : (grill === 'yes' ? 'Yes' : 'No — bring one');

  const msgText = lang === 'pt'
    ? `Olá BBQ do Carioca! Gostaria de um orçamento.\n\n📅 Data: ${date}\n📍 Cidade: ${city}\n👥 Convidados: ${guests}\n🔥 Churrasqueira: ${grillLabel}\n🥩 Observações: ${notes}`
    : `Hi BBQ do Carioca! I'd like a free quote.\n\n📅 Date: ${date}\n📍 City: ${city}\n👥 Guests: ${guests}\n🔥 Grill: ${grillLabel}\n🥩 Notes: ${notes}`;

  const encodedMsg = encodeURIComponent(msgText);
  window.open(`https://wa.me/15614034603?text=${encodedMsg}`, '_blank', 'noopener,noreferrer');
}
