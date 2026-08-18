# ADR-0008: B2C/B2B Conversion Funnels e Stepper Architecture (RH Online & Checkout)

## Status
Aceito (Rascunho Inicial para Refinamento)

## Contexto
O ecossistema BBQ Carioca exige uma transição suave e profissional entre os visitantes casuais das "Fronts Institucionais" (`bbqcarioca.work`) e os Dashboards Operacionais Logados (`portal.bbqcarioca.work`). Em vez de redirecionamentos vazios ou integrações diretas desestruturadas no WhatsApp, precisamos formalizar a jornada do usuário baseada no conceito de **Intermediate Steppers** (Passo a Passo Intermediário), desenhados inteiramente na SPA React.

Essa arquitetura mapeia três rotas principais de conversão, separando estritamente a experiência do Cliente (Agendamento), do Pitmaster (RH Online) e do Administrador (Controle).

## Decisão

Aprovamos a construção arquitetural baseada nos seguintes três Funis de Conversão:

### 1. Funil Client: O Checkout de Serviços (B2C/B2B)
A jornada do contratante de serviços não deve cair imediatamente em um painel administrativo. Ela deve mimetizar a experiência de um e-commerce de alto ticket (Carrinho de Compras).

*   **Ponto de Ignição:** O cliente interage com os botões "Get a Quote" no site institucional `bbqcarioca.work`.
*   **Página Intermediária (SPA Unauth):** O usuário é direcionado para `portal.bbqcarioca.work/client` (visão não-autenticada). Ele é recebido por uma interface de Checkout (Stepper).
*   **Ação:** O cliente seleciona/refina os detalhes do agendamento (Data, Local, Pacotes de Carnes, Número de Convidados).
*   **Autenticação e Conversão:** No último passo do carrinho, o sistema valida se o usuário já possui conta (Cache de Identificação/SSO) ou solicita a criação rápida do cadastro.
*   **Acesso Seguro:** Confirmado o pedido, o usuário recebe a credencial (Opt-in) e a tela transita perfeitamente para a Visão Autenticada do Dashboard (`portal.bbqcarioca.work/client`), onde ele poderá acompanhar o status da solicitação, aprovar orçamentos e gerenciar pagamentos.

### 2. Funil Careers: O RH Online Dinâmico (Banco de Talentos)
A captação de novos Pitmasters e Staffs (Assistentes) necessita de uma triagem rigorosa.

*   **Ponto de Ignição:** O candidato acessa `bbqcarioca.work/careers` buscando oportunidades.
*   **Onboarding Stepper (SPA Unauth):** Redirecionado para `portal.bbqcarioca.work/careers`, ele enfrenta um processo de "RH Online".
*   **Mapeamento Dinâmico de Skills:** Os passos do formulário não são estáticos. Eles puxam via API a lista de "Pacotes de Serviços/Habilidades" ativamente registrados pelo Superadmin no D1. O candidato seleciona as habilidades nas quais possui expertise.
*   **Estado de Quarentena (Sandbox):** Ao finalizar o formulário, o candidato ganha acesso restrito ao painel. O status inicial de sua conta é obrigatoriamente **"Candidatura em Análise"**. Neste estado, o sistema bloqueia sua participação em missões.
*   **Autoridade do Superadmin:** O administrador avalia o perfil no seu Dashboard. Uma vez que o "Opt-in Operacional" é concedido, o algoritmo de *Matching* começa a direcionar esse talento para os agendamentos dos clientes, com total governança sobre repasses financeiros e custos.

### 3. Funil Admin: O Túnel de Controle
A via do administrador é estritamente operacional e desprovida de passos de marketing.

*   **Ponto de Ignição:** `bbqcarioca.work/admin`.
*   **Acesso Direto:** Trata-se de um redirecionamento limpo (`301`) na camada da Cloudflare (Edge) direto para a página de Login com MFA no `portal.bbqcarioca.work/admin`. Nenhuma Landing Page intermediária é renderizada.

## Padrões de Qualidade (Design Engineering)
*   **Steppers Fluidos:** Os passos (Client Checkout e HR Onboarding) devem utilizar o poder do framer-motion (ou CSS transitions nativas) e a arquitetura do **shadcn-ui**.
*   **Isolamento de Componentes:** Formulários devem ser montados modularmente. A coleta de "Data/Local" e "Skills" devem ser abstraídas em Bounded Contexts dentro do repositório React (`apps/dashboard/src/modules`).

## Consequências
*   **Positivas:** A lógica de negócio reflete uma operação corporativa autêntica (Padrão 2026+). Acaba a comunicação desestruturada no WhatsApp e todo Lead/Talento passa a existir sob um Schema rígido no banco D1 antes de conversar com qualquer humano.
*   **Negativas/Trade-offs:** O desenvolvimento de Steppers dinâmicos, com injeção de dados do backend (Lista de Serviços Ativos), adiciona complexidade à carga inicial do React SPA. Requererá *suspense boundaries* e robusto cache local via Zustand/TanStack Query para garantir que a experiência não trave em redes móveis (3G/4G).
