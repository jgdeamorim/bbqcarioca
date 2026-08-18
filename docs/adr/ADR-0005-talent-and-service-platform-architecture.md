# ADR-0005: Sovereign BBQ Talent & Service Platform Architecture ($0/month Free Tier)

* **Status:** Aceito (Accepted)
* **Data:** 2026-08-18
* **Autor:** Jeferson Amorim (Founder) & Antigravity (Pair AI)
* **Domínio:** BBQ do Carioca (`jgdeamorim/bbqcarioca`)
* **Impacto:** Arquitetura Backend/DB, Infraestrutura Cloudflare, Segurança PII, Custos de Operação e Gestão de Talentos/Prestadores

---

## Contexto e Problema

O projeto BBQ do Carioca necessita de uma solução escalável, soberana e segura para captar e gerenciar candidatos e prestadores de serviço de catering na Flórida (Grill Masters/Churrasqueiros, Auxiliares de Fogo, Garçons, Barmans, Coordenadores e Pitmasters).

Decidiu-se **eliminar e proibir o uso de `db.json` para o ambiente de produção**, reservando arquivos JSON estáticos exclusivamente para mocks e testes unitários locais de desenvolvimento. O motivo central é que dados pessoais sensíveis (PII: e-mails, telefones, histórico profissional, currículos e documentos de residentes nos EUA) não devem nascer em arquivos de texto plano sem controle estrito de acesso, transacionalidade e auditoria.

Deseja-se construir e operar o **MVP inteiro dentro do plano Free da Cloudflare ($0/mês)**, alocando recursos de ponta sem gerar custos fixos de servidor neste estágio do negócio.

---

## Decisão de Arquitetura

Decidiu-se adotar a **BBQ Talent & Service Platform** rodando 100% sobre a infraestrutura serverless gratuita da Cloudflare, conectando a stack **TypeScript ➔ Cloudflare Worker ➔ D1 (SQL) ➔ R2 (Blobs) ➔ Zero Trust Access**.

### 📊 Validação das Cotas do Plano Free da Cloudflare ($0/mês)

| Componente | Franquia Grátis Cloudflare | Consumo Estimado no MVP BBQ | Status |
| :--- | :--- | :--- | :---: |
| **Cloudflare Workers** | 100.000 requests/dia | ~500 a 2.000 requests/dia | ✅ 100% Confortável |
| **Cloudflare D1 (Rows Read)** | 5.000.000 linhas lidas/dia | ~10.000 a 50.000 lidas/dia | ✅ 100% Confortável |
| **Cloudflare D1 (Rows Written)**| 100.000 linhas escritas/dia | ~100 a 1.000 escritas/dia | ✅ 100% Confortável |
| **Cloudflare D1 Storage** | 5 GB de banco de dados | ~10 MB inicial | ✅ 100% Confortável |
| **Cloudflare R2 Storage** | 10 GB de armazenamento | ~500 MB (currículos/fotos) | ✅ 100% Confortável |
| **Cloudflare R2 Operações** | 1M Class A + 10M Class B /mês | ~5.000 ops/mês | ✅ 100% Confortável |
| **Cloudflare R2 Egress** | **Grátis / Ilimitado** | 0% custo de tráfego de saída | ✅ 100% Confortável |
| **Workers Builds** | 3.000 minutos/mês | ~50 minutos/mês | ✅ 100% Confortável |
| **Zero Trust / Access** | Grátis até 50 usuários | 1 a 3 administradores (Bruno/RH) | ✅ 100% Confortável |

> **Nota de Comportamento de Erro (Fail-Safe):** A documentação oficial da Cloudflare confirma que se uma conta no plano Free ultrapassar os limites diários do D1, as chamadas retornam erro e são pausadas até o reset diário automático, **sem nenhuma cobrança surpresa no cartão de crédito**. A migração para o Workers Paid (US$ 5/mês) será avaliada somente no futuro caso haja explosão de volume de candidatos/uploads.

---

## Desenho do Fluxo de Dados & Segurança PII

```text
                 BBQ DO CARIOCA PLATFORM
                       │
          ┌────────────┴────────────┐
          │                         │
       WEBSITE                  ADMIN
  bbqdocarioca.com/careers  admin.bbqdocarioca.com
          │                         │
      Turnstile                 Zero Trust
          │                         │
          └────────────┬────────────┘
                       ▼
                  Worker API
                 (TypeScript)
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
        D1 (SQLite)          R2 Storage
    dados estruturados        arquivos/CVs
```

### 🔒 Diretrizes Obrigatórias de Segurança & PII (Privacy-by-Design):
1. **Minimização de Dados:** Coletar apenas campos estritamente necessários para o recrutamento de catering.
2. **Isolamento Total:** O front-end público não possui acesso direto ao banco D1. O formulário conversa exclusivamente com a rota sanitizada `POST /api/applications`.
3. **Proteção Anti-Bot:** Validação server-side via **Cloudflare Turnstile** e **Rate Limiting** por IP no Worker.
4. **Proteção do SuperAdmin:** A rota `admin.bbqdocarioca.com` é blindada por **Cloudflare Access (Zero Trust)**, exigindo OTP/SSO antes de autorizar o tráfego para a API.

---

## Schema do Banco de Dados D1 (SQLite)

```sql
-- Tabela de Candidatos e Prestadores
CREATE TABLE IF NOT EXISTS talents (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'FL',
    talent_type TEXT NOT NULL, -- Employee, Caterer, Pitmaster, Event Staff, etc.
    opportunity_type TEXT NOT NULL, -- Full-time, Part-time, Contract, Event-based
    experience_years INTEGER NOT NULL,
    specialties TEXT, -- JSON Array: ["Picanha", "Brisket", "Caipirinha Bar"]
    availability TEXT, -- JSON Array: ["Weekend", "Evenings"]
    languages TEXT, -- JSON Array: ["PT", "EN", "ES"]
    status TEXT NOT NULL DEFAULT 'NEW', -- NEW, REVIEWING, SHORTLISTED, INTERVIEW, APPROVED, ACTIVE, REJECTED
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Documentos e Mídias no R2
CREATE TABLE IF NOT EXISTS talent_documents (
    id TEXT PRIMARY KEY,
    talent_id TEXT NOT NULL,
    document_type TEXT NOT NULL, -- RESUME, PROFILE_PHOTO, CERTIFICATE
    r2_key TEXT NOT NULL,
    file_name TEXT NOT NULL,
    content_type TEXT NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (talent_id) REFERENCES talents(id) ON DELETE CASCADE
);

-- Tabela de Serviços/Categorias
CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Logs de Auditoria do Admin
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    actor_email TEXT NOT NULL,
    action TEXT NOT NULL,
    target_id TEXT,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Estrutura do Monorepo

```text
bbqcarioca/
├── apps/
│   ├── web/                     # Landing Page Principal (Vite/HTML/JS) + /careers
│   └── admin/                   # Dashboard SuperAdmin (React 19 + Vite + Tailwind CSS v4)
├── worker/
│   ├── src/
│   │   ├── index.ts             # Entrypoint da API Cloudflare Worker
│   │   ├── routes/
│   │   │   ├── applications.ts  # Route handler público de candidaturas
│   │   │   ├── candidates.ts    # Route handler administrativo de talentos
│   │   │   └── services.ts      # Route handler de prestadores e serviços
│   │   ├── db/
│   │   │   ├── schema.sql       # Script de migração D1
│   │   │   └── queries.ts      # Consultas SQL preparadas
│   │   ├── middleware/
│   │   │   ├── auth.ts          # Middleware validado pelo Cloudflare Access
│   │   │   └── rateLimit.ts     # Proteção contra requisições abusivas
│   │   └── types/
│   │       └── index.ts
│   └── wrangler.jsonc           # Configuração de Bindings (D1, R2, Turnstile)
└── docs/
    └── adr/
        └── ADR-0005-talent-and-service-platform-architecture.md
```

---

## Roadmap de Execução Incremental (Lean MVP v1)

Para evitar hiper-engenharia precoce, o sistema nascerá enxuto e evoluirá por fases:

### 🚀 MVP v1 (Escopo Mínimo Viável):
1. **`/careers` (Front-end):** Form simples de candidaturas integrado com Cloudflare Turnstile.
2. **`POST /api/applications` (Worker):** Endpoint sanitizado salvando o candidato no banco D1.
3. **`D1` (Database):** Tabela `talents` armazenando o cadastro básico e status `NEW`.
4. **`/admin` (SuperAdmin):** Visualização de lista de candidatos protegida por Cloudflare Access com botões para **Aprovar / Rejeitar**.

### 🌟 Fase 2 (Evolução Incremental):
- Integração do bucket R2 para upload e download seguro de currículos em PDF.
- Categorização completa de Prestadores de Serviço terceirizados (*Caterers, Private Chefs, Pitmasters*).
- Notificações e atalho de convocação direta via WhatsApp para eventos.
