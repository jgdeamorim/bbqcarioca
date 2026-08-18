# ADR-0009: Separação Física dos Funis de Captação (Landing Pages) vs Dashboards React (SPA)

## Status
Aceito

## Contexto
Durante a implementação da arquitetura Tri-Tenant (ADR-0007 e ADR-0008), ocorreu uma dissociação entre o planejamento e o código. As rotas `/client` e `/careers` na vitrine institucional (`bbqcarioca.work`) foram configuradas como redirects diretos (`301`) para o React SPA (`portal.bbqcarioca.work`). Além disso, os Steppers de captação (formulários de agendamento e RH) foram construídos dentro do React SPA, misturando a área de "Marketing/Captação" com a área "Operacional/Segura".

Conforme a arquitetura correta ditada pelo founder:
- `bbqcarioca.work/client` e `bbqcarioca.work/careers` **são Landing Pages estáticas explicativas** que possuem formulários de captação (Steppers). Elas recebem o "contexto" via URL dos CTAs da Home.
- Somente **após** o cliente ou talento completar o cadastro/opt-in nestas páginas HTML, o sistema gera o acesso e faz o redirecionamento (hand-off) para os dashboards seguros em `portal.bbqcarioca.work`.
- Apenas a rota `/admin` é um redirect vazio, pois não fazemos marketing para captar administradores.

## Decisão

Para corrigir a rota e alinhar o código às diretrizes OODA, determinamos as seguintes execuções cirúrgicas:

### 1. Limpeza do `_redirects`
Removeremos `/client` e `/careers` do arquivo `apps/web/public/_redirects`, mantendo apenas o redirecionamento `/admin`.

### 2. Criação das Fronts de Captação Estáticas (Vanilla HTML/JS)
Criaremos duas novas Landing Pages físicas no repositório estático:
- `apps/web/public/client/index.html`: Front de Agendamento B2C/B2B. Explicará as regras do jogo e conterá o formulário (Stepper) em Vanilla JS, consumindo a Hono API para cadastro.
- `apps/web/public/careers/index.html`: Front do Banco de Talentos. Explicará o processo de seleção e conterá o formulário de captação de Pitmasters.

Essas páginas utilizarão o mesmo `tokens.css` e `layout.css` da vitrine para garantir consistência visual e carregamento instantâneo (Zero React Runtime no marketing).

### 3. Injeção de Contexto nos CTAs da Vitrine
Os botões da página inicial (`index.html`) que apontavam para `/client` vazios serão enriquecidos com parâmetros de intenção. Exemplo: um clique no pacote "Corporate" enviará o usuário para `/client?intent=corporate`. A Front de Agendamento lerá esse parâmetro para pré-preencher o Stepper.

### 4. Limpeza do React SPA
Os componentes `ClientStepper` e `TalentStepper` serão removidos das rotas públicas do `apps/dashboard/src/App.tsx`. O React SPA (`portal.bbqcarioca.work`) passará a focar exclusivamente em ser o Dashboard Logado. O fluxo de login será recebido via Token repassado pela Landing Page.

## Consequências
- **Positivas:** O funil de captação volta a ser incrivelmente rápido e indexável por SEO, pois é 100% estático até o momento da conversão. O React SPA fica mais leve e focado estritamente na gestão operacional. A lógica de negócio se alinha com a mente do founder.
- **Negativas/Trade-offs:** Exigirá a reescrita dos formulários (Steppers) de captação usando Vanilla JS e manipulação de DOM nas páginas HTML, em vez da conveniência do React Hook Form/Zod. Porém, o ganho de performance e isolamento compensa.
