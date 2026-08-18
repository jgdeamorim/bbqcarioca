# ADR-0003: Arquitetura de Refatoração Idêntica com React 19 + Vite + JSX & Kimera Design System

- **Status:** Aceito (Accepted)
- **Data:** 18 de Agosto de 2026
- **Autores:** Antigravity AI, Jeferson Amorim (Founder)
- **Domínio:** BBQ Carioca (`jgdeamorim/bbqcarioca`) & Adsentice OS
- **Validação de Documentação:** React 19.2.7 (`/react/react/v19.2.7` via Context7 MCP)

---

## 1. CONTEXTO E PROBLEMA

O ecossistema do **BBQ Carioca** exige **fidelidade visual absoluta de 100%** ao DNA original (fontes, cores HSL, layout e comportamentos do monólito `lp-bbq-carioca-v2_0.html`).

Entretanto, a manutenção direta de um arquivo monolítico RAW de +1400 linhas traz riscos operacionais:
1. **Dificuldade de Manutenção:** Duplicação manual de marcas, SVGs, seletores `data-i18n` e elementos em múltiplos arquivos (`src/index.html`, `public/index.html`, `lp/lp-bbq-carioca-v2_0.html`).
2. **Propensão a Erros Humanos:** Riscos de erros sintáticos HTML (ex: tags `<span>` inválidas em `<option>`).
3. **Escalabilidade Limitada:** Falta de reaproveitamento de componentes e tokens de design tipados em TypeScript.

Necessitamos de uma arquitetura que mantenha o **resultado final estático idêntico (monólito HTML5 puro + zero runtime JS pesado)**, mas permita aos desenvolvedores programar usando **React 19 + Vite + JSX** e o motor **Kimera Design System**.

---

## 2. DECISÃO DE ARQUITETURA

Decidimos adotar a **Refatoração Declarativa com React 19 + Vite + Static Compilation (Kimera Engine)**.

### Pilares da Decisão:

1. **Stack de Desenvolvimento:**
   - **React 19.2.7:** Utilizado como motor de componentes declarativos em build-time.
   - **Vite 6+:** Bundler ultra-rápido para compilação local e integração com o Cloudflare Pages.
   - **`react-markup` / `ReactDOMServer.renderToStaticMarkup`:** API do React 19 consultada via **Context7 MCP** para transformar a árvore JSX em HTML5 estático limpo (sem atributos internos do React ou hydration overhead).
   - **Kimera Design System Tokens:** Tipagem estática de cores (`#FF6B35`, `#0F0D0E`), tipografia (`Outfit`, `Inter`, `IBM Plex Mono`), ícones SVG em funções e espaçamentos.

2. **Pipeline de Compilação Zero-Runtime:**
   - O código JSX vive em `apps/web/src/components/`.
   - O script de build executa o gerador estático em tempo de compilação.
   - O produto final gerado para a pasta `dist/` e `public/` é o **`index.html` estático perfeito**.
   - O cliente final no **Cloudflare Pages ($0/mês)** recebe um arquivo estático puro, com TTFB < 20ms e velocidade máxima de carregamento.

3. **Sobriedade Visual & Micro-interações Leves (Sem Partículas 3D / Canvas Physics):**
   - Isenção de scripts pesados de física 3D ou loops de partículas em canvas.
   - Foco em micro-interações CSS nativas, transições suaves de hover e revelação via `IntersectionObserver` leve, mantendo o consumo de CPU/GPU em praticamente 0%.

---

## 3. ESQUEMA DO PIPELINE DE COMPILAÇÃO

```
┌────────────────────────────────────────────────────────┐
│              CÓDIGO DE DESENVOLVIMENTO                 │
│  - Tokens (bbq-tokens.ts)                              │
│  - Componentes JSX (Hero, ExpCard, QuoteForm)          │
│  - i18n JSON Data (en.json, pt-br.json)                │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             BUILD ENGINE (Vite + React 19)             │
│  - React 19 `renderToStaticMarkup` / `react-markup`    │
│  - Injeção de CSS Inline & i18n Attributes              │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                 PRODUTO FINAL GERADO                   │
│  - `public/index.html` (Monólito Idêntico v3.x)        │
│  - Cloudflare Pages Edge Deployment ($0/mês)           │
└────────────────────────────────────────────────────────┘
```

---

## 4. CONSEQUÊNCIAS E BENEFÍCIOS

### Positivas:
- ✅ **Fidelidade Visual 100% Retida:** O HTML5 gerado é identicamente formatado e estruturado.
- ✅ **Produtividade & Segurança de Código:** Componentes JSX fortemente tipados via TypeScript previnem tags quebradas ou atributos i18n esquecidos.
- ✅ **Desempenho Imbatível:** Zero custo de JS no cliente para renderização de página (LCP e CLS perfeitos no Lighthouse).
- ✅ **Compatibilidade Nativa Cloudflare Pages:** Sem necessidade de runtime Node.js em produção.

### Negativas / Cuidados:
- ⚠️ **Regra de Não-Modularização Externa:** O build precisa garantir a injeção estática completa sem quebrar o CSS inline consolidado.

---

## 5. REFERÊNCIAS
- **Context7 MCP API Reference:** `React 19.2.7` (`/react/react/v19.2.7` - `renderToStaticMarkup` & `react-markup`)
- **Proposta Técnica:** `docs/spec/kimera-jsx-static-generator-proposal.md`
- **ADR Ancestrais:** `ADR-0001` (Cloudflare Free Stack), `ADR-0002` (Enterprise Monorepo HTML5)
