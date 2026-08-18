# ADR-0005: Sovereign BBQ Talent & Service Platform Architecture

* **Status:** Aceito (Accepted)
* **Data:** 2026-08-18
* **Autor:** Jeferson Amorim (Founder) & Antigravity (Pair AI)
* **Domínio:** BBQ do Carioca (`jgdeamorim/bbqcarioca`)
* **Impacto:** Arquitetura Backend/DB, Infraestrutura Cloudflare, Segurança PII e Gestão de Talentos/Prestadores

---

## Contexto e Problema

O projeto BBQ do Carioca necessita de uma solução escalável e segura para captar e gerenciar candidatos e prestadores de serviço de catering na Flórida (Grill Masters/Churrasqueiros, Auxiliares de Fogo, Garçons, Barmans, Coordenadores e Pitmasters).

Inicialmente, ponderou-se o uso de soluções locais simples como `db.json`. No entanto, para um sistema em produção exposto publicamente que transaciona dados pessoais sensíveis (PII: e-mails, telefones, histórico profissional, currículos e documentos de residentes nos EUA), o uso de `db.json` apresenta riscos inaceitáveis de concorrência, ausência de isolamento de segurança e falta de suporte a transações relacionais.

---

## Decisão de Arquitetura

Decidiu-se projetar e implementar a **BBQ Talent & Service Platform** totalmente alinhada à infraestrutura soberana de custo zero ($0/mês) da Cloudflare.

### 🏛️ Visão Geral da Arquitetura

```
                          BBQ DO CARIOCA PLATFORM
                                    │
               ┌────────────────────┴────────────────────┐
               │                                         │
        [ Site Público ]                         [ SuperAdmin ]
    bbqdocarioca.com/careers               admin.bbqdocarioca.com
               │                                         │
       (Turnstile + Form)                        (Cloudflare Access / Zero Trust)
               │                                         │
               └────────────────────┬────────────────────┘
                                    ▼
                         [ Cloudflare Worker API ]
                         (TypeScript + Rate Limit)
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
        [ Cloudflare D1 (SQL) ]             [ Cloudflare R2 ]
    candidatos / prestadores / serviços        currículos (PDF) / fotos
```

---

## Especificação dos Componentes de Infraestrutura

### 1. Banco de Dados Relacional Serverless — Cloudflare D1 (SQL)
Substituição definitiva de qualquer arquivo `db.json` pelo **Cloudflare D1** (SQLite distribuído no Edge).
* **Armazenamento:** 5 GB gratuitos ($0/mês).
* **Franquia:** 5.000.000 de leituras/dia e 100.000 escritas/dia gratuitas.
* **Função:** Armazenar exclusivamente dados estruturados, status de candidaturas, classificações e logs de auditoria.

### 2. Armazenamento de Arquivos/Blobs — Cloudflare R2
Nenhum arquivo binário (PDFs de currículos, fotos de perfis ou comprovações) será armazenado dentro do D1.
* **Armazenamento:** 10 GB gratuitos ($0/mês).
* **Taxa de Saída (Egress):** **$0 (Zero Egress Fees)**.
* **Estrutura de Pastas no R2:**
  ```text
  /candidates/{candidate_id}/resume.pdf
  /candidates/{candidate_id}/profile.jpg
  /candidates/{candidate_id}/certifications.pdf
  ```

### 3. API Backend Serverless — Cloudflare Worker (TypeScript)
Uma API enxuta e fortemente tipada em TypeScript orquestra as requisições sem expor o banco D1 ao cliente público.
* **Endpoints REST Públicos:**
  - `POST /api/applications` — Submissão de novas candidaturas (com proteção Turnstile + Rate Limit).
* **Endpoints REST Administrativos (Autenticados):**
  - `GET /api/candidates` — Listagem com filtros por cidade, função e status.
  - `GET /api/candidates/:id` — Detalhes do candidato e referências no R2.
  - `PATCH /api/candidates/:id` — Atualização do status da candidatura.
  - `POST /api/services` / `GET /api/services` — Gestão de prestadores e categorias de serviço.

### 4. Proteção e Autenticação do SuperAdmin — Cloudflare Zero Trust (Access)
O painel administrativo (`admin.bbqdocarioca.com`) não possui tela de login exposta a ataques de força bruta.
* O acesso é protegido diretamente no Edge pela camada **Cloudflare Access / Zero Trust**.
* Requer autenticação de identidade corporativa (One-Time PIN ou SSO) antes mesmo de conectar ao Worker.

### 5. Unificação de Talentos e Prestadores (Talent & Service Network)
Modelagem unificada para suportar dois tipos de perfis em uma única tabela D1:
* **Talent Types:** `Employee`, `Caterer`, `Chef`, `Pitmaster`, `Grill Specialist`, `Event Staff`, `Freelancer`.
* **Services Provided:** `BBQ Catering`, `Private Chef`, `Corporate Events`, `Weddings`, `Birthday Parties`, `Backyard BBQ`, `Grill Service`.

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

-- Tabela de Documentos no R2
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
│   │   │   ├── applications.ts  # Route handler public application
│   │   │   ├── candidates.ts    # Route handler admin candidates management
│   │   │   └── services.ts      # Route handler services & providers
│   │   ├── db/
│   │   │   ├── schema.sql       # Script de migração D1
│   │   │   └── queries.ts      # Consultas SQL preparadas
│   │   ├── middleware/
│   │   │   ├── auth.ts          # Validado pelo Cloudflare Access
│   │   │   └── rateLimit.ts     # Proteção contra abusos
│   │   └── types/
│   │       └── index.ts
│   └── wrangler.jsonc           # Configuração de Bindings (D1, R2, Turnstile)
└── docs/
    └── adr/
        └── ADR-0005-talent-and-service-platform-architecture.md
```

---

## Roteiro de Implementação (Roadmap MVP)

1. **Fase 1 (MVP Application Engine):**
   - Criação do banco D1 `bbqcarioca-db` e bucket R2 `bbqcarioca-vault` via Wrangler.
   - Endpoint `POST /api/applications` no Worker com envio de arquivo ao R2 e registro no D1.
   - Integração do formulário público `/careers` com Cloudflare Turnstile.

2. **Fase 2 (SuperAdmin Dashboard):**
   - Configuração do Cloudflare Access para a rota `admin.bbqdocarioca.com`.
   - Aplicação React 19 + Vite + Tailwind v4 em `apps/admin` consumindo a API protegida.
   - Pipeline de status (`NEW` ➔ `REVIEWING` ➔ `SHORTLISTED` ➔ `APPROVED` ➔ `ACTIVE`).

3. **Fase 3 (Service Providers & Quick Convocation):**
   - Módulo de prestadores externos e botão de convocação direta via WhatsApp para eventos.

---

## Consequências e Benefícios

* **Segurança Máxima PII:** 0% de exposição do banco D1 à internet pública.
* **Custo Zero ($0/mês):** Todos os serviços (Workers, D1, R2, Turnstile, Access) operam confortavelmente dentro do Free Tier da Cloudflare.
* **Concorrência Garantida:** Leitura e escrita distribuídas sem os problemas de travamento e corrupção inerentes ao `db.json`.
* **Alta Escalabilidade:** Estrutura pronta para atender tanto o banco de talentos interno quanto futuros prestadores parceiros do BBQ do Carioca.
