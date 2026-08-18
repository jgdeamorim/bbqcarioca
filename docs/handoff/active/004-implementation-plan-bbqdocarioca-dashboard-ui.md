# Implementation Plan: BBQ Carioca SuperAdmin Dashboard (Fase 3 UI/UX)

## 1. Visão Geral (Sovereign Dashboard UX)
O Dashboard Operacional (`admin.bbqdocarioca.work`) atuará como o **Control Plane 360** da operação logística. Ele herdará diretamente as diretrizes visuais e ergonômicas estabelecidas no *Adsentice OS*, utilizando os mesmos padrões de Bento Grid, Glassmorphism e Semantic Motion.

Este documento aprofunda os padrões de interface da **Fase 3** (O Módulo Administrativo).

---

## 2. Padrões Visuais Adsentice (Cross-KG `materio` Heritage)

As decisões abaixo espelham as conquistas do Adsentice (ADR-0093 e ADR-0101):

### A. Core Layout & Bento Grid
A interface abandona tabelas rígidas em favor de **Bento Grids**:
* **Classe-Mãe:** `.tech-bento-grid`
* Estrutura visual responsiva nativa via Tailwind CSS v4 grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`).
* Cada cartão de talento ou requisição é um "tile" do Bento Grid, o que garante escalabilidade perfeita no Mobile (onde cai para 1 coluna) sem necessidade de media queries pesadas.
* O Smart Scheduling Dashboard usa *DisplayCards Skew* para indicar urgência nas datas dos eventos.

### B. Glassmorphism e Tailwind v4 (OKLCH)
A identidade cromática utiliza o espaço de cor **OKLCH**, garantindo o padrão de Acessibilidade Juty AA (contraste mínimo de 4.5:1) mesmo em variações extremas do *Dark Mode*.
* O Top Header será **Glassmorphic** (usando `backdrop-blur-md bg-zinc-950/70`), transmitindo o conceito de "vidro líquido".
* Bordas com `.border-zinc-800` ou `border-zinc-900` gerando delimitação elegante sem ruído visual.
* Eliminação de "buracos brancos" em scroll, como documentado no Adsentice S10.

### C. Semantic Motion Engine (SME)
Nenhum artefato animado deve drenar bateria ou exigir carregamentos 3D (`Three.js`).
* **Regra de Ouro:** Animações via SVGs vetoriais puros de 60 FPS (Zero KB de dependências).
* Transições CSS modernas utilizando `@starting-style` e transições de entrada do Tailwind v4 (`transition-all duration-300`).
* **Strategic Motion Pacing:** Intervalos de animação coordenados. Por exemplo, listas renderizando com uma pausa de `0.4s` entre elementos (Stripe/Linear style pacing) usando as utilities de delay do Tailwind.
* Obrigatoriedade de respeitar `prefers-reduced-motion: reduce`. Se o sistema operacional do usuário bloqueia motion, os cards do Bento Grid aparecem instantaneamente.

---

## 3. O Control Plane Executivo 360 (Mockup Estrutural)

A tela principal do `/admin` seguirá o layout *Control Plane 360* testado na plataforma Adsentice, adaptado para a gestão de talentos BBQ:

### 📊 Seção 1: KPIs Executivos (Topo)
O Header Glassmorphic será seguido pelos indicadores críticos em tempo real:
* **Talent Match Rate** (Score Haversine médio)
* **Upcoming Events** (Eventos na janela de 7 dias)
* **Onboarding Funnel** (Candidatos ➔ Aceitos ➔ Alocados)

### 🎛️ Seção 2: Grid de Operações Vivas (O Coração)
* Emulação do "Grid de Pings de Microsserviços" do Adsentice, focado em **Status dos Hubs Logísticos**.
* Lista rápida dos **Event Staff Requirements**, ordenados por proximidade temporal.

### 📋 Seção 3: Talent Roster (O Bento Grid)
Em vez de uma lista paginada entediante, os perfis chegam formatados assim:
```html
<!-- Componente React Tailwind v4 Mock -->
<div class="tech-bento-grid grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
  <div class="card glassmorphism bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl hover:scale-[1.02] transition-transform duration-300">
    <div class="flex items-center justify-between">
      <h3 class="text-white text-lg font-bold">João Santos</h3>
      <span class="badge bg-green-500/20 text-green-400 px-2 py-1 text-xs rounded-full">97% Match</span>
    </div>
    <p class="text-zinc-400 text-sm mt-1">BBQ Chef • Fort Lauderdale, FL</p>
    
    <div class="mt-4 flex gap-2">
      <!-- Botão Email (Canal Oficial) -->
      <a href="mailto:..." class="flex-1 text-center bg-zinc-800 hover:bg-zinc-700 text-white rounded p-2 text-sm transition-colors">
        Email
      </a>
      <!-- Botão WhatsApp (wa.me dinâmico) -->
      <a href="https://wa.me/..." target="_blank" class="flex-1 text-center bg-zinc-800 hover:bg-green-600 text-white rounded p-2 text-sm transition-colors">
        WhatsApp
      </a>
    </div>
  </div>
</div>
```

---

## 4. Arquitetura React 19 Frontend (Admin)

Para entregar esta ergonomia mantendo o **Custo $0**, o admin também será um Single Page Application (SPA) empacotado pelo Vite e servido na Edge via Cloudflare Pages.

```text
apps/web/src/pages/admin/
├── layout.tsx         # Header Glassmorphic & Zero Trust Auth Wrapper
├── dashboard.tsx      # Control Plane 360
├── components/
│   ├── BentoGrid.tsx  # Wrapper de Layout do Tailwind
│   ├── KpiCard.tsx    # Count-up animation nativa para números
│   └── TalentCard.tsx # Hover states e botões de Email/Whatsapp
└── api/
    └── admin-fetch.ts # Wrapper passando o Header JWT emitido pelo Cloudflare Access
```

## 5. Práticas Interditadas (Doutrinas UI/UX)
1. **Zero Particle.js ou WebGL:** Proibido o uso de renderização 3D complexa. O dashboard deve rodar fluido (60 FPS) num celular 3G do campo.
2. **Sem Tabelas Infinitas (Anti-Grid):** É proibido o uso de DataTables engessados. Telas no Mobile perdem toda a usabilidade horizontal. Sempre usar Bento Grid Responsivo.
3. **Hardcode de Tema:** Proibido código de cores hexadecimais no JSX. Toda cor deve vir do sistema central OKLCH do Tailwind v4 (`text-primary`, `bg-zinc-950`).
