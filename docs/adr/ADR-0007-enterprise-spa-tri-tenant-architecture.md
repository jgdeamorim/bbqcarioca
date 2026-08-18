# ADR-0007: Arquitetura Enterprise SPA Tri-Tenant e Organização Mobile-First

## Status
Aceito

## Contexto
O ecossistema "Control Plane 360" do BBQ Carioca evoluiu para uma SPA Multi-Tenant servida pela Cloudflare Workers Assets. O mesmo bundle React (`apps/dashboard`) agora intercepta 3 subdomínios:
- `admin.bbqcarioca.work` (Para Regional Managers)
- `careers.bbqcarioca.work` (Para Pitmasters e Staff)
- `portal.bbqcarioca.work` (Para Clientes)

Para suportar o crescimento do projeto mantendo a robustez de um sistema de classe corporativa, precisamos de uma padronização organizacional rigorosa inspirada no modelo corporativo Adsentice (Materio), mas adaptada para o runtime Vite + React 19 Client-Side e desenhada estritamente como **Mobile-First**.

## Decisão

Adotamos a seguinte estrutura de pastas, hierarquia de componentes e regras de acesso (RBAC) para o frontend React.

### 1. Estrutura de Diretórios Enterprise-Grade

A pasta `apps/dashboard/src/` passa a ser organizada utilizando *Path Aliases* (ex: `@core`, `@layouts`) para encapsular domínios técnicos e visuais.

```text
apps/dashboard/src/
├── @core/               # Núcleo intocável: Contextos globais, Providers, Configurações de Tema (Tailwind/CSS tokens).
├── @layouts/            # Estruturas macro: BlankLayout (Público), VerticalLayout (Admin), HorizontalLayout (Portal).
├── @menu/               # Dicionários de roteamento: Arrays de navegação injetados dinamicamente baseado no User Profile.
├── assets/              # Assets estáticos empacotados pelo Vite (SVGs, ilustrações Lottie, placeholders).
├── components/          # Pedaços isolados da UI, divididos em granularidade:
│   ├── elements/        # Atoms: Botões, Inputs, Badges, Switches.
│   ├── contents/        # Molecules: Cards Bento, List Items, Modals.
│   ├── tabs/            # Organisms: Navegação por abas horizontais (Pills) otimizadas para Mobile Touch.
│   └── shared/          # Organisms: Header (Navbar glassmorphic), Footer, Sidebars responsivos.
├── hooks/               # Lógica reutilizável: `useAuth()`, `useTenant()`, `useMobile()`, `useMediaQuery()`.
├── lib/                 # Infraestrutura técnica: `api-client.ts`, formatadores, schemas Zod, wrappers de requisição.
├── modules/             # Regras de Negócio (Bounded Contexts): `/billing`, `/quotes`, `/talent`, agrupando views e lógica.
├── views/               # Partes modulares de telas complexas (Ex: `DashboardStatsView`, `TalentProfileView`).
├── pages/               # Apenas injeção de roteador (React Router). Representa as páginas finais renderizadas.
│   ├── admin/           # Tenant 1 (admin.*)
│   ├── careers/         # Tenant 2 (careers.*)
│   └── portal/          # Tenant 3 (portal.*)
└── App.tsx              # Roteador Global Dinâmico (Hostname Interceptor).
```

### 2. Princípio Mobile-First (Design Engineering)

1. **Thumb Zone:** Elementos interativos críticos (CTAs de aprovação de orçamento, aceite de eventos para Pitmasters) devem residir na metade inferior da tela ou em `Bottom Sheets` (gavetas inferiores) em vez de modais centrais no mobile.
2. **Horizontal Scroll (Overflow-x):** Tabelas de dados enterprise devem permitir scroll horizontal contido, ou alternar para visualização em formato de Cartões (Cards) em breakpoints menores (`md` e abaixo).
3. **Navegação:** O Menu lateral (`VerticalMenu`) do Desktop se converte automaticamente em um *Bottom Navigation Bar* ou em um *Hamburger Drawer* no Mobile, usando componentes do `@layouts`.

### 3. Governança RBAC (Role-Based Access Control) por Profile-Rules

A arquitetura Tri-Tenant usa o subdomínio (`window.location.hostname`) apenas como o **Portão Físico**. A **Autoridade Lógica** é validada pelo JWT (`cf_access_token` ou Supabase Session) usando *Route Guards* (Hooks de proteção).

#### As 3 Entidades (User-IDs) e suas Regras de Acesso:

*   **`admin` (Regional Manager / Operator)**
    *   **Portão:** `admin.bbqcarioca.work`
    *   **JWT Role Exigida:** `role: 'admin' | 'manager'`
    *   **Permissões:** Leitura e Escrita global sobre as coleções (Quotes, Events, Staff, CRM). Acesso irrestrito a configurações.
    *   **Fallback:** Se um não-admin tentar entrar no domínio admin, o Hook `useAuth` força redirect para página de "Acesso Negado 403".

*   **`careers` (Staff / Talent)**
    *   **Portão:** `careers.bbqcarioca.work`
    *   **JWT Role Exigida:** `role: 'talent' | 'staff'`
    *   **Permissões:** Acesso Mutacional Restrito (Apenas altera sua própria linha em `talent_profiles`), leitura dos eventos aos quais foi alocado (status `STAFFING_PENDING` ou `FULLY_STAFFED`).
    *   **Interface Privada:** Diferente do admin, o layout remove o menu vertical e exibe um feed de missões/eventos.

*   **`client` (Customer / Lead)**
    *   **Portão:** `portal.bbqcarioca.work`
    *   **JWT Role Exigida:** `role: 'customer'` (gerado após criar o Lead ou via Magic Link).
    *   **Permissões:** Visualização e aprovação exclusiva de seus próprios orçamentos (Quotes com `lead_id` = JWT `sub`). Nenhuma visualização de custos internos ou de outros clientes.

## Consequências
*   **Positivas:** Código perfeitamente organizado para o crescimento, seguindo o padrão de projetos de larga escala (Adsentice), reduzindo refatorações futuras. Reutilização máxima de `@components` em todos os três subdomínios.
*   **Negativas/Trade-offs:** Adoção de arquitetura complexa (`@core`, `@layouts`, `modules`) exige que todos os novos componentes sigam as diretrizes rígidas, aumentando ligeiramente a curva de aprendizado inicial da engenharia front-end do projeto.
