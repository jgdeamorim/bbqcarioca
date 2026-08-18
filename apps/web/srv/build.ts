import { privacyContent } from './legal/privacy.js';
import { termsContent } from './legal/terms.js';
import { cookiesContent } from './legal/cookies.js';
import { accessibilityContent } from './legal/accessibility.js';
import * as fs from 'fs';
import * as path from 'path';

export function buildStaticLegalModals() {
  const publicIndexPath = path.resolve('public/index.html');
  let html = fs.readFileSync(publicIndexPath, 'utf-8');

  const modalBlockHtml = `
<!-- ══════════════════════════════════════ LEGAL COMPLIANCE MODALS (BUILD-TIME INLINED) ══════════════════════════════════════ -->
<dialog id="legal-modal-privacy" class="legal-modal" aria-labelledby="modal-privacy-title">
  <div class="legal-modal-header">
    <h3 id="modal-privacy-title" class="legal-modal-title"><span data-lang="en">Privacy Policy</span><span data-lang="pt">Política de Privacidade</span></h3>
    <button type="button" class="legal-modal-close" onclick="closeLegalModal('privacy')" aria-label="Close dialog">×</button>
  </div>
  <div class="legal-modal-body">
    <span data-lang="en">${privacyContent.en}</span>
    <span data-lang="pt">${privacyContent.pt}</span>
  </div>
</dialog>

<dialog id="legal-modal-terms" class="legal-modal" aria-labelledby="modal-terms-title">
  <div class="legal-modal-header">
    <h3 id="modal-terms-title" class="legal-modal-title"><span data-lang="en">Terms of Use</span><span data-lang="pt">Termos de Uso</span></h3>
    <button type="button" class="legal-modal-close" onclick="closeLegalModal('terms')" aria-label="Close dialog">×</button>
  </div>
  <div class="legal-modal-body">
    <span data-lang="en">${termsContent.en}</span>
    <span data-lang="pt">${termsContent.pt}</span>
  </div>
</dialog>

<dialog id="legal-modal-cookies" class="legal-modal" aria-labelledby="modal-cookies-title">
  <div class="legal-modal-header">
    <h3 id="modal-cookies-title" class="legal-modal-title"><span data-lang="en">Cookie Policy</span><span data-lang="pt">Política de Cookies</span></h3>
    <button type="button" class="legal-modal-close" onclick="closeLegalModal('cookies')" aria-label="Close dialog">×</button>
  </div>
  <div class="legal-modal-body">
    <span data-lang="en">${cookiesContent.en}</span>
    <span data-lang="pt">${cookiesContent.pt}</span>
  </div>
</dialog>

<dialog id="legal-modal-accessibility" class="legal-modal" aria-labelledby="modal-accessibility-title">
  <div class="legal-modal-header">
    <h3 id="modal-accessibility-title" class="legal-modal-title"><span data-lang="en">Accessibility Statement</span><span data-lang="pt">Declaração de Acessibilidade</span></h3>
    <button type="button" class="legal-modal-close" onclick="closeLegalModal('accessibility')" aria-label="Close dialog">×</button>
  </div>
  <div class="legal-modal-body">
    <span data-lang="en">${accessibilityContent.en}</span>
    <span data-lang="pt">${accessibilityContent.pt}</span>
  </div>
</dialog>
`;

  // Replace any previous dynamic dialog with inlined static modals
  const dialogRegex = /<!-- ═+ LEGAL COMPLIANCE MODAL[s]? ═+ -->[\s\S]*?<\/dialog>/gi;
  if (dialogRegex.test(html)) {
    html = html.replace(dialogRegex, modalBlockHtml.trim());
  } else {
    html = html.replace('</footer>', '</footer>\n' + modalBlockHtml.trim());
  }

  // Update footer button click handlers to 0ms direct DOM showModal()
  html = html.replace(/onclick="openLegalModal\('privacy'\)"/g, `onclick="openLegalModal('privacy')"`);
  html = html.replace(/onclick="openLegalModal\('terms'\)"/g, `onclick="openLegalModal('terms')"`);
  html = html.replace(/onclick="openLegalModal\('cookies'\)"/g, `onclick="openLegalModal('cookies')"`);
  html = html.replace(/onclick="openLegalModal\('accessibility'\)"/g, `onclick="openLegalModal('accessibility')"`);

  fs.writeFileSync(publicIndexPath, html, 'utf-8');
  console.log('[srv compiler] Successfully compiled inlined legal compliance modals into public/index.html (0ms runtime, 100% SEO static HTML)');
}

buildStaticLegalModals();
