# ADR-0004: Hardening de Eventos do Menu Mobile Header e Refinamento Canônico de UI/SEO

- **Status:** Concluído & Em Produção (Completed / Implemented in Commit beeb3c8)

- **Data:** 18 de Agosto de 2026
- **Autores:** Antigravity AI, Jeferson Amorim (Founder)
- **Domínio:** BBQ Carioca (`jgdeamorim/bbqcarioca`) & Adsentice OS
- **Validação de Documentação:** W3C DOM Events Standard / Context7 MCP (`/facebook/react` / Vanilla Event Propagation)

---

## 1. CONTEXTO E PROBLEMA

Durante a auditoria canônica do projeto **BBQ Carioca**, identificamos 5 lacunas críticas de qualidade, interação e SEO que impactam diretamente a conversão mobile no mercado da Flórida (USA):

1. **Bug do Botão de Menu Mobile (`#mob-toggle`):** O botão de menu no header mobile não mantinha o estado aberto ao ser clicado. A causa raiz foi diagnosticada via DAG como um **Double Event Handler Triggering**:
   - `index.html` (linha 1906) acionava `onclick="toggleMob(event)"` inline.
   - `apps/web/public/js/app.js` (linha 13) registrava `mobToggle.addEventListener('click', ...)` no escopo `DOMContentLoaded`.
   - Como resultado, a classe `.open` era adicionada pelo 1º handler e removida em menos de 1ms pelo 2º handler no mesmo clique.
2. **Duplicação de Código (SOP §III.B):** A função `handleQuote` encontrava-se duplicada no `index.html` e em `js/quote-form.js`.
3. **Desalinhamento com Brand DNA:** Uso de emoji inline (`🔥`) como favicon em vez do Emblema Oficial da marca (Regra 3.1 & 4.1 do `SKILL.md`).
4. **Ausência de Tags Canonical & Hreflang:** Falta de marcação formal de SEO regional para a Flórida (EN-US primary / PT-BR transcreation).
5. **Conflito de Especificidade CSS:** Regras conflitantes de z-index e display entre `layout.css` e `<style>` inline.

---

## 2. DECISÃO DE ARQUITETURA E REFINAMENTO

Decidimos aplicar o **Hardening de Eventos DOM + Padronização Canônica SOP v3.0**:

### 1. Desduplicação de Handlers DOM & Event Isolation
- Manter o handler global único e soberano `window.toggleMob(e)` e `window.closeMob()` no script modular/inline.
- Remover o listener redundante `mobToggle.addEventListener('click', ...)` em `apps/web/public/js/app.js`.
- Garantir que a propagação de eventos não dispare loops de fechamento em elementos de overlay modal.

### 2. Sincronização e Limpeza de Scripts (SOP §III.B Compliance)
- Eliminar declarações duplicadas da função `handleQuote`.
- Manter modularidade estrita entre `app.js`, `quote-form.js`, `embers.js` e `i18n.js`.

### 3. SEO & Canonicidade para o Mercado Flórida / USA
- Adicionar `<link rel="canonical" href="https://bbqdocarioca.com/" />`.
- Adicionar marcação `hreflang` bilingue para garantia de indexação sem duplicidade:
  ```html
  <link rel="alternate" hreflang="en" href="https://bbqdocarioca.com/" />
  <link rel="alternate" hreflang="pt" href="https://bbqdocarioca.com/?lang=pt" />
  <link rel="alternate" hreflang="x-default" href="https://bbqdocarioca.com/" />
  ```

### 4. Respeito ao Brand DNA (Favicon Oficial)
- Substituir o favicon SVG de emoji `🔥` por uma versão vetorial otimizada do Emblema Oficial do BBQ do Carioca.

---

## 3. CONSEQUÊNCIAS E BENEFÍCIOS

### Positivas:
- ✅ **Navegação Mobile 100% Funcional:** Menu hamburguer abre e fecha com resposta instantânea e determinística em qualquer dispositivo.
- ✅ **Conformidade Estrita SOP v3.0:** Eliminação total de funções duplicadas e scripts mortos.
- ✅ **Fortalecimento de SEO:** Indexação limpa e sem ambiguidades no Google Search / GBP (Google Business Profile) Flórida.
- ✅ **Fidelidade de Marca:** Respeito absoluto ao Brand DNA e às regras de assets do `SKILL.md`.

---

## 4. REFERÊNCIAS
- **SOP Code Standard:** `docs/spec/adsentice-coding-sop-ts-tsx.md` (§III.B Anti-Duplicação)
- **Brand DNA Specification:** `SKILL.md` (BBQ do Carioca Master Skill v1.0.0)
- **ADR-0001 / ADR-0002 / ADR-0003:** Arquitetura Cloudflare Pages & Monorepo BBQ Carioca
