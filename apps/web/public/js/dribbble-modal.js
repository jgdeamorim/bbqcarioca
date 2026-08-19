/**
 * Dribbble-style Intercepted Modal Routing
 * Intercepts specific links to open in a modal while updating the URL via History API.
 */

document.addEventListener('DOMContentLoaded', () => {
  const dialog = document.getElementById('dribbble-modal');
  if (!dialog) return;

  const iframe = document.getElementById('dribbble-iframe');
  const closeBtn = document.getElementById('dribbble-close');
  
  // Guardar URL original para restaurar ao fechar
  let originalUrl = window.location.pathname + window.location.search;

  // Interceptar todos os links que vão para o /client/ (Stepper) e /careers (Talent Pool)
  const clientLinks = document.querySelectorAll('a[href^="client/"], a[href^="/client/"], a[href^="https://www.bbqcarioca.work/client/"], a[href^="/careers"], a[href^="careers/"]');
  
  clientLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Se abrir em nova aba, deixa nativo
      if (e.ctrlKey || e.metaKey || link.target === '_blank') return;
      
      e.preventDefault();
      
      const targetUrl = link.getAttribute('href');
      
      // Update iframe source
      iframe.src = targetUrl;
      
      // Salva estado atual e muda a URL silenciosamente (Dribbble style)
      window.history.pushState({ isDribbbleModal: true }, '', targetUrl);
      
      // Mostra o Modal
      dialog.showModal();
      document.body.style.overflow = 'hidden'; // Prevents background scrolling
    });
  });

  // Também adaptar o formulário de quote do rodapé para abrir o modal
  const quoteForm = document.getElementById('quote-form');
  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      // Impede o submit nativo ou o comportamento anterior do quote-form.js
      e.preventDefault();
      e.stopPropagation();

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

      const intentPayload = {
        date, city, guests, grill: grillLabel, notes,
        source: 'landing_page_quote_form',
        timestamp: new Date().toISOString()
      };

      const encodedPayload = btoa(encodeURIComponent(JSON.stringify(intentPayload)));
      const targetUrl = `/client/?intent=quote&init=${encodedPayload}`;
      
      iframe.src = targetUrl;
      window.history.pushState({ isDribbbleModal: true }, '', targetUrl);
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    }, true); // Use capture to intercept before the old quote-form.js
  }

  // Fechar o modal
  const closeModal = () => {
    dialog.close();
    iframe.src = 'about:blank'; // Clear iframe memory
    document.body.style.overflow = '';
    
    // Restaurar a URL original da página
    if (window.history.state && window.history.state.isDribbbleModal) {
      window.history.back(); // Volta na history do navegador, o que restaura a URL limpa
    } else {
      window.history.pushState(null, '', originalUrl);
    }
  };

  closeBtn.addEventListener('click', closeModal);

  // Fechar clicando no backdrop
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      closeModal();
    }
  });

  // Listener para quando o usuário clicar no botão "Voltar" do navegador
  window.addEventListener('popstate', (e) => {
    if (dialog.open && (!e.state || !e.state.isDribbbleModal)) {
      dialog.close();
      iframe.src = 'about:blank';
      document.body.style.overflow = '';
    }
  });
});
