# Proposta Arquitetural: Engine de Compilação JSX-to-Static-HTML (Kimera Design System)
> **Projeto:** BBQ Carioca (`jgdeamorim/bbqcarioca`) | **Origem:** `kimera-design-system.jsx`  
> **Objetivo:** Utilizar a tecnologia de Design Tokens & Componentes JSX para gerar compilações estáticas monolíticas perfeitas com zero dependências de runtime.

---

## 1. O CONCEITO ARQUITETURAL

Em vez de editar manualmente o monolito HTML de 1400 linhas (o que aumenta o risco de erros de sintaxe e inconsistências de design), utilizamos o padrão do **Kimera Design System**:

```
[ Tokens & Componentes (JSX/TSX) ]
             │
             ▼
[ Compilador / Build Script (Vite / React SSR / Bun) ]
             │
             ▼
[ Monolito Perfeito (index.html + CSS Inline + i18n JSON) ]
```

---

## 2. ESTRUTURA DO SISTEMA DE DESIGN (`bbq-design-system.ts`)

### 2.1 Tokens Soberanos do BBQ Carioca
```typescript
export const BBQ_TOKENS = {
  colors: {
    charcoalBg:   "#0F0D0E",
    fireOrange:   "#FF6B35",
    goldAmber:    "#F7B05B",
    creamLight:   "#FAF8F5",
    smoke400:     "#A09A96",
  },
  fonts: {
    display: "'Outfit', sans-serif",
    body:    "'Inter', sans-serif",
    mono:    "'IBM Plex Mono', monospace",
  },
  spacing: { sm: 8, md: 16, lg: 24, xl: 32, xxl: 64 },
  radii:   { sm: 8, md: 12, lg: 16, pill: 9999 },
};
```

### 2.2 Biblioteca de Ícones SVG Puros (`ICONS`)
Substitui SVGs pesados por funções de ícones estáticos reutilizáveis:
- `ICONS.flame(22)` -> Chama o SVG da chama com cor `#FF6B35`.
- `ICONS.picanha(22)` -> Corte de carne premium.
- `ICONS.whatsapp(20)` -> Widget do WhatsApp.

### 2.3 Componentes Declarativos
Exemplo do componente `<ExpCard />`:
```tsx
export function ExpCard({ image, icon, titleEn, titlePt, textEn, textPt, delayClass }) {
  return (
    <article class={`exp-card reveal ${delayClass}`}>
      <img src={image} alt={titleEn} class="exp-card-img" loading="lazy" />
      <div class="exp-card-body">
        <div class="exp-card-icon">{icon}</div>
        <h3 class="exp-card-title">
          <span data-lang="en">{titleEn}</span>
          <span data-lang="pt">{titlePt}</span>
        </h3>
        <p class="exp-card-text">
          <span data-lang="en">{textEn}</span>
          <span data-lang="pt">{textPt}</span>
        </p>
      </div>
    </article>
  );
}
```

---

## 3. BENEFÍCIOS DA TECNOLOGIA PARA O BBQ CARIOCA

1. **Zero Runtime Overhead:** O cliente recebe um HTML5 ultra-rápido sem o peso de carregar React ou qualquer framework no browser.
2. **Manutenibilidade Enterprise:** Alterar a cor da chama ou a margem dos cards exige mudar apenas o token no `bbq-design-system.ts`.
3. **Fidelidade Visual 100% Garantida:** Elimina discrepâncias entre design e código.
4. **Integração com i18n Engine:** Os seletores `data-i18n` e `data-lang` são injetados automaticamente nos elementos adequados.

---

## 4. PRÓXIMOS PASSOS (MEDIANTE AUTORIZAÇÃO)

1. Criar o pacote de tokens em `packages/design-system/`.
2. Adicionar o script `npm run build:html` no monorepo para compilar `src/index.html` de forma limpa e automatizada.
