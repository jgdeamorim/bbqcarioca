# Análise da Suíte de Skills GSAP (Open Design Upstream Build)

> **Caminho Origem:** `/media/jeffer/5aab5a95-8290-d3f7-2e4f-8c27cc2d09a93/open-design-upstream-build/skills/`  
> **Domínio:** Animação de Alta Performance, Scroll Pinning, React 19 & Design System  
> **Data:** 18 de Agosto de 2026 | **Autor:** Antigravity AI

---

## 1. RESUMO EXECUTIVO

A suíte de **8 Skills do GSAP** contida no repositório `open-design-upstream-build` representa o estado da arte em curadoria da GreenSock (post-Webflow acquisition 2026). Todos os plugins (SplitText, MorphSVG, DrawSVG, Flip, Draggable) agora são **100% gratuitos e inclusos no pacote npm oficial (`gsap`)**.

Esta análise sintetiza as 8 skills e detalha como aproveitá-las de forma estratégica no **BBQ Carioca** e no ecossistema **Adsentice OS**.

---

## 2. MAPEAMENTO DAS 8 SKILLS GSAP

### 1. `gsap-core` (API Primária & Tweens)
- **Foco:** `gsap.to()`, `gsap.from()`, `gsap.fromTo()`, `gsap.set()`.
- **Doutrina:** Usar transform aliases (`x`, `y`, `scale`, `rotation`, `xPercent`, `yPercent`, `autoAlpha`) em vez de propriedades de layout (`width`, `top`, `left`).
- **Acessibilidade:** Integração nativa com `gsap.matchMedia()` para tratar `prefers-reduced-motion`.

### 2. `gsap-scrolltrigger` (Scroll & Pinning)
- **Foco:** Animações atreladas ao scroll, `pin: true`, `scrub`, `ScrollTrigger.batch()`, `scrollerProxy()`.
- **Pinning Avançado:** Permite pinagem vertical enquanto sincroniza animações horizontais via `containerAnimation` (usando obrigatoriamente `ease: "none"`).
- **Batching:** `ScrollTrigger.batch()` substitui com vantagem o `IntersectionObserver` para revelações em grupo.

### 3. `gsap-react` (Integração React 19 & Next.js)
- **Foco:** Hook oficial `useGSAP()` da biblioteca `@gsap/react`.
- **Gestão de Ciclo de Vida:** Substitui o `useEffect` garantindo `ctx.revert()` automático no unmount do componente.
- **Scoping & ContextSafe:** `scope: containerRef` impede vazamento de seletores CSS entre componentes; `contextSafe()` protege handlers de eventos (ex: `onClick`).

### 4. `gsap-performance` (Otimização 60 FPS & Leveza)
- **Foco:** Prevenção de *layout thrashing* e travamentos no thread principal do navegador.
- **Técnicas de Elite:**
  - Animar apenas `transform` e `opacity` (camada da GPU compositor).
  - Utilização de `gsap.quickTo()` para atualizações frequentes (ex: seguidores de mouse / efeito de brasa).
  - Uso inteligente de `will-change: transform`.

### 5. `gsap-timeline` (Coreografia & Sequenciamento)
- **Foco:** `gsap.timeline()`, parâmetro de posição (`"<"`, `">"`, `"+=0.5"`), `addLabel()`.
- **Doutrina:** NUNCA encadear animações usando `delay` manual. Sempre preferir Timelines com `defaults: { duration: 0.5, ease: "power2.out" }`.

### 6. `gsap-plugins` (Coleção de Plugins Grátis)
- **Foco:** Plugins especializados (`Flip`, `Draggable`, `InertiaPlugin`, `SplitText`, `DrawSVG`, `MorphSVG`, `MotionPath`).
- **Revolução Webflow/GSAP:** Nenhum plugin requer chave de licença ou Club GSAP (todos via `npm install gsap`).
- **Registros:** Obrigatoriedade de `gsap.registerPlugin(...)` antes de qualquer instância.

### 7. `gsap-utils` (Matemática & Mapeamento de Valores)
- **Foco:** `clamp()`, `mapRange()`, `normalize()`, `interpolate()`, `random()`, `snap()`, `distribute()`, `wrap()`, `toArray()`.
- **Superpotência:** `distribute({ base, amount, from: "center" })` para staggers tridimensionais ou radiais em grides.

### 8. `gsap-frameworks` (Padrões para SSR / Frameworks JS)
- **Foco:** Garantir execução 100% *Client-Side* sem quebrar o Server-Side Rendering (SSR).

---

## 3. APLICAÇÃO NO BBQ CARIOCA & ADSENTICE OS

1. **Combinação Soberana com React 19 + Vite (ADR-0003):**
   - Usamos o React 19 no build-time para gerar o monólito `index.html`.
   - Onde o **CSS puro (`dct-motion`)** resolve (ex: fade in simples, sticky scroll), mantemos **0 KB JS**.
   - Onde for necessária uma **sequência de storytelling interativa** (ex: o formulário dinâmico de orçamento ou timeline do churrasco), ativamos o **`gsap-core` + `useGSAP()`** com importação limpa via CDN/Vite.

2. **Doutrina de Performance BBQ Carioca:**
   - **Sem 3D pesado:** Nenhuma partícula física Canvas de 60fps consumindo bateria (conforme decisão de sobriedade visual).
   - **GSAP Responsivo:** Uso do `gsap.matchMedia()` para desativar motion em telas pequenas ou para usuários com `prefers-reduced-motion`.
