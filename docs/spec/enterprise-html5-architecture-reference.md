# Blueprint de Arquitetura HTML5 Enterprise para BBQ Carioca
> **Referência Analisada:** `Maharatri HTML5 Template` (`/home/jeffer/Downloads/Maharatri-hindu-temple-html5-template/Maharatri HTML5 Template`)  
> **Data:** 18/08/2026 | **Autor:** Antigravity AI | **Projeto:** BBQ Carioca (`jgdeamorim/bbqcarioca`)

---

## 1. RESUMO EXECUTIVO & ANÁLISE COMPARATIVA

A análise do template industrial **Maharatri HTML5** revela padrões de organização de código e recursos utilizados em templates comerciais de alta performance (Envato/ThemeForest Class Enterprise).

### Matriz Comparativa de Arquitetura

| Pilar Arquitetural | Template Maharatri (Referência) | BBQ Carioca (Estado Atual) | Padrão Alvo (Enterprise Recommended) |
| :--- | :--- | :--- | :--- |
| **Estrutura de Arquivos** | Multi-páginas (`/assets/{css,js,fonts,img}`) | Monólito em `index.html` + `/public/{img,js,locales}` | Monólito em `index.html` + Ativos Estruturados em `/public/assets/{css,js,fonts,img}` |
| **Nomenclatura CSS** | BEM modificado com prefixo (`sigma_*`) | Utilitários curtos (`.hero-title`, `.exp-card`) | BEM Sovereign (`.bbq-*` ou `.exp-*` isolados) |
| **Acessibilidade (a11y)** | Skip Links, `aria-*`, roles semânticas | Semântica HTML5 + aria básica | Skip links, `aria-live` para i18n, `role="region"`, `loading="lazy"` |
| **Modularização de CSS** | Paginado e por componente (`plugins/`, `responsive.css`, `style.css`) | Inline `<style>` no `index.html` | Arquivo CSS otimizado e minificado para produção com Fallback Monolítico em Dev |
| **Performance de Mídia** | `loading="lazy"`, animações CSS `@keyframes`, SVG Sprites | PNGs gerados locais (`img/exp-*.png`) + SVGs Inline | `<picture>` responsivo + WebP/PNG local com `loading="lazy"` |

---

## 2. ESTRUTURA DE DIRETÓRIOS ENTERPRISE (PROPOSTA PARA BBQ CARIOCA)

Inspirado no Maharatri, a estrutura soberana recomendada para o monorepo `apps/web/public` e `apps/web/src` segue a convenção:

```
apps/web/
├── public/
│   ├── favicon.ico
│   ├── assets/
│   │   ├── css/
│   │   │   ├── plugins/          # Estilos de plugins (GSAP, Swiper, Animate)
│   │   │   ├── bbq-core.css      # Design System, Variáveis HSL, Tipografia
│   │   │   ├── bbq-components.css# Cards, Botões, Form, Badges
│   │   │   └── bbq-responsive.css# Breakpoints (desktop, tablet, mobile)
│   │   ├── js/
│   │   │   ├── plugins/          # Libs externas (GSAP, Lenis, etc.)
│   │   │   ├── i18n.js           # Motor de Tradução JSON
│   │   │   └── main.js           # Interações, Form submit, Animations
│   │   ├── fonts/                # IBM Plex Mono, Outfit / Inter (WOFF2)
│   │   ├── img/                  # Imagens proprietárias (exp-*.png, hero, etc.)
│   │   └── locales/              # en.json e pt-br.json
│   └── index.html
├── src/
│   ├── index.html                # Fonte da Verdade Monolítica (Dev Sync)
│   └── img/                      # Imagens de fonte
```

---

## 3. PADRÕES TÉCNICOS EXTRAÍDOS DO TEMPLATE REFERÊNCIA

### 3.1 Skip Links & Acessibilidade Soberana
O template Maharatri utiliza skip links no topo do `<body>` para leitores de tela e navegação por teclado:
```html
<a class="skip-link" href="#main-content">Skip to main content</a>
```
**Recomendação BBQ Carioca:** Incluir o skip link no `index.html` apontando diretamente para o formulário de orçamento `#quote` ou conteúdo principal `<main id="main-content">`.

### 3.2 Keyframe Zoom Efeito Hero (CSS Pseudo-Element Layering)
No Maharatri, o zoom das imagens de fundo do Hero é isolado em `::before` para evitar que o texto do Hero trema ou perca nitidez durante a transição CSS:
```css
.hero-bg-zoom::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: inherit;
  background-size: cover;
  background-position: center;
  transform: scale(1);
  transition: transform 8s ease-out;
  z-index: 0;
}
.hero-bg-zoom:hover::before {
  transform: scale(1.08);
}
```
**Benefício:** Evita re-layouts do browser no texto principal da Picanha/Hero.

### 3.3 Gestão de Temas & Variações Globais (Design Tokens)
O Maharatri utiliza uma folha de estilo de cores desacoplada (`theme-colors/color1.css`). No BBQ Carioca, as variáveis CSS no `:root` já cumprem esse papel com precisão:
```css
:root {
  --charcoal-900: #0f0d0e;
  --fire-orange: #FF6B35;
  --gold-amber: #F7B05B;
  --cream-50: #FAF8F5;
}
```

---

## 4. PLANO DE AÇÃO & GOVERNANÇA

> [!IMPORTANT]
> Em conformidade com a **Doutrina #2 (Autorização Explícita)**, NENHUMA alteração foi ou será aplicada aos arquivos de código sem o pedido direto e explícito do Founder.

### Passos Futuros Caso Solicitado:
1. **Adição de Skip Link (`a11y`):** Incluir navegação por teclado no `index.html`.
2. **Organização da Pasta Assets:** Agrupar arquivos JS/CSS em subsistemas sem quebrar o formato monólito de distribuição.
3. **Efeitos visuais avançados:** Aplicar a técnica de `pseudo-element zoom` nas fotos dos cards `exp-grid`.
