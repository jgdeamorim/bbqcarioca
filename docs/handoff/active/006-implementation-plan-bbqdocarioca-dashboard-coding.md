# [Implementation Plan] BBQ Carioca Dashboard Coding (Fase 2)

Este plano descreve a implementação técnica em código (Frontend + Backend) para o Dashboard Operacional (`admin.bbqdocarioca.work`), assegurando que a UI/UX definida no Handoff 004 seja traduzida para código executável respeitando o DOMAIN-0001 e as regras (SOPs) do Adsentice.

> [!IMPORTANT]
> **User Review Required:** Este é um artefato executável que afeta a fundação do front-end administrativo e a autorização de API do Worker. Aguardando aprovação para proceder com a geração dos arquivos `.tsx` e `.ts`.

## Open Questions
1. **SaaS Template vs Construção Limpa:** Embora usemos referências do Materio, a construção será do zero usando React 19 limpo + Tailwind v4 para maximizar performance (sem excesso de dependências do MUI). O founder confirma que prefere a construção "limpa e soberana" focada no Bento Grid em vez de importar o boilerplate gigante do Materio?
2. **Cloudflare Access Setup:** O código do Worker exigirá as chaves públicas (JWKS) do seu tenant do Cloudflare Access para validar as requisições (`<tenant>.cloudflareaccess.com/cdn-cgi/access/certs`). Confirma que essa URL será injetada como variável de ambiente no `wrangler.jsonc`?

---

## Proposed Changes

### [Frontend SPA - admin.bbqdocarioca.work]

O Dashboard será construído no monorepo dentro de `apps/web/src/pages/admin/` como uma SPA consumindo a API.

#### [NEW] `apps/web/src/pages/admin/layout.tsx`
- Layout raiz com o Header Glassmorphic (`backdrop-blur-md bg-zinc-950/70`).
- Cumpre a SOP de JSX (uso de `&lt;` em vez de `<` literal para evitar quebra do SWC Linter).
- Integrará a navegação lateral simplificada focada em *Thumb Zone* (Ergonomia Mobile).

#### [NEW] `apps/web/src/pages/admin/dashboard.tsx`
- O "Control Plane 360" implementado como um Bento Grid (`.tech-bento-grid`).
- Renderiza 3 seções: KPIs, Painel Logístico (Smart Scheduling) e Feed de Feedback.
- As animações usarão CSS Tailwind v4 (`@starting-style`) abolindo frameworks pesados, cumprindo a diretriz de "SME" (Semantic Motion Engine).

#### [NEW] `apps/web/src/lib/api-client.ts`
- Wrapper de requisição seguro. Ele interceptará o token JWT (injetado via cookie do CF Access) e enviará nos cabeçalhos `Authorization: Bearer <token>` para o Worker API.

---

### [Backend Worker API - apps/api]

O Worker receberá as requisições, validará o JWT do Cloudflare Access e buscará os dados no D1.

#### [NEW] `apps/api/src/middleware/auth.ts`
- Implementação rigorosa de **Zero Trust**.
- Busca o JWKS (JSON Web Key Set) da URL do seu tenant, faz cache no Runtime.
- Verifica `signature`, `issuer`, `audience` e `expiration`.
- Cumpre a SOP Adsentice: `catch (e: unknown) { void e; return new Response('Unauthorized', { status: 401 }); }`. Nunca falha silenciosamente.

#### [NEW] `apps/api/src/routes/admin/dashboard.ts`
- Rota consolidada para carregar o Control Plane.
- Executa queries simultâneas no D1 (usando `env.DB.batch()` para eficiência):
  1. Count de `events` onde status = 'BOOKED' (Upcoming Events).
  2. Últimas `service_requests` pendentes.
  3. Taxa de `talent_profiles` disponíveis.
- Retorna o payload estruturado.

---

## Verification Plan

### Automated Tests
- Validar se o Worker devolve `HTTP 401 Unauthorized` quando um JWT inválido, expirado ou forjado é apresentado no cabeçalho.
- Validar via `eslint` cirúrgico (ADR-0109) os arquivos `.tsx` para garantir que não existem falhas de sintaxe SWC.

### Manual Verification
- Deploy em Preview no Cloudflare Pages.
- Acesso à rota `/admin`.
- Verificar se as transições e o Bento Grid mantêm `60 FPS` no renderizador, respeitando o `motion-reduce`.
