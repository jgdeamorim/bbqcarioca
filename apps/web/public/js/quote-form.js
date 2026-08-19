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

  // Pacote de intenção de negócio (Intent Payload)
  const intentPayload = {
    date,
    city,
    guests,
    grill: grillLabel,
    notes,
    source: 'landing_page_quote_form',
    timestamp: new Date().toISOString()
  };

  // Criptografa o JSON em Base64 seguro para URL
  const encodedPayload = btoa(encodeURIComponent(JSON.stringify(intentPayload)));
  
  // Redireciona para a Front de Agendamento
  window.location.href = `/client/?intent=quote&init=${encodedPayload}`;
}
