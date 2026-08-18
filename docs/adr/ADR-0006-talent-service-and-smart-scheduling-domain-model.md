# ADR-0006: Talent, Service, Commercial & Experience Domain Model ($0/month Sovereign Architecture)

* **Status:** Aceito (Accepted)
* **Data:** 2026-08-18
* **Autor:** Jeferson Amorim (Founder) & Antigravity (Pair AI)
* **Domínio:** BBQ do Carioca (`jgdeamorim/bbqcarioca`)
* **Impacto:** Arquitetura do Modelo de Domínio, UI/UX Benchmark (`Adsentice Next.js Server` + `adsentice-materio`), Motores Cognitivos, Módulo Comercial & Financeiro (Stripe Webhooks), Módulo de Reputação/Google Reviews, Compliance Legal/EEOC e Schema D1 Relacional Completo (14 Tabelas)

---

## Contexto e Problema

O projeto BBQ do Carioca consolidou-se como um **Workforce & Event Operations Platform** soberano em `bbqcarioca.work`. 

A entidade central do negócio **não é o candidato nem o pagamento**, mas sim a **Solicitação de Serviço (Service Order / Event)**. O ciclo de vida do negócio inicia-se no orçamento comercial, passa pela aprovação da gerência regional da Flórida, liquidação de depósitos pelo cliente, escalação logística da equipe, execução do evento e encerra-se no **Feedback Bilateral** e acúmulo de **Reputação Pública no Google Business**.

---

## Princípios de Domínio & Diretrizes de Conformidade Legal

### 1. Objeto Central do Negócio: `Service Order / Event`
O fluxo do negócio segue a jornada unificada:
$$\text{Solicitação} \rightarrow \text{Orçamento (Pricing)} \rightarrow \text{Aprovação Gerente} \rightarrow \text{Pagamento (Stripe)} \rightarrow \text{Equipe (Smart Match)} \rightarrow \text{Execução} \rightarrow \text{Feedback Bilateral} \rightarrow \text{Reputação Google}$$

### 2. Separação entre Preço Comercial, Custo Operacional e Margem
* **Preço Comercial:** Valor cobrado do cliente final (Alimentos, Chef, Equipe, Equipamentos, Deslocamento).
* **Custo Operacional:** Soma dos pagamentos da equipe (*Staff Settlement*), transporte e insumos.
* **Margem Bruta:** $\text{Preço Comercial} - \text{Custo Operacional}$.

### 3. Pagamentos Seguros & Integração Gateway (Stripe) — Zero PII Cartão no D1
* **Zero Dados Financeiros Sensíveis no D1:** O D1 nunca armazena números de cartão ou CVV.
* **Stripe Payment Links & Webhooks:** O Worker gera um Stripe Payment Link para o cliente efetuar o depósito/saldo. O webhook do Stripe atualiza a ordem para `DEPOSIT_PAID` ou `FULLY_PAID`.
* Suporte nativo a pagamentos parciais (*Deposit* ➔ *Balance*).

### 4. Motor de Reputação & Feedback Bilateral (Google Business Priority)
* **Feedback Bilateral:**
  - **Cliente ➔ BBQ:** Avalia Comida, Serviço, Equipe e Comunicação.
  - **BBQ ➔ Equipe:** Avalia Pontualidade, Profissionalismo e Habilidade. Realimenta o **Reliability Score** do profissional.
* **Google Business Review:** Convite neutro e autêntico após a conclusão do evento com link direto para a página oficial do Google Business Profile.
* **Social Proof Verificado:** Exibição de avaliações verificadas vinculadas a IDs reais de eventos concluídos em `bbqcarioca.com/reviews`.

### 5. Ética Algorítmica & EEOC Compliance (Human-in-the-Loop)
* Zero atributos protegidos (raça, idade, gênero). Justificativa algorítmica auditada com confirmação final humana do **Gerente da Flórida**.

---

## 🎨 Arquitetura de UI/UX & Padrões Visuais (Referência Primária: `Adsentice Next.js Server` & `adsentice-materio`)

O painel administrativo em `admin.bbqcarioca.work` adota como **Referência Canônica de Excelência o Dashboard do Servidor Next.js Adsentice** (`apps/web` com MUI Materio / Tailwind CSS v4 / `shadcn/ui`), combinado com o mapa visual do Knowledge Graph (`tag=materio`):

```text
┌────────────────────────────────────────────────────────────────────────┐
│  BBQ CARIOCA WORKFORCE OS — ADSENTICE NEXT.JS EXECUTIVE BENTO GRID     │
├───────────────────┬───────────────────┬───────────────────┬────────────┤
│  CARD 1: HERO KPI │  CARD 2: FINANÇAS │  CARD 3: ALERTAS  │ CARD 4:    │
│  6/7 Staff        │  Revenue: $3,200  │  ⚠ Pitmaster      │ REPUTAÇÃO  │
│  Confirmed        │  Margin:  $2,230  │  Replacement Req. │ 4.9 ⭐     │
├───────────────────┴───────────────────┴───────────────────┴────────────┤
│  LOGISTICS & SMART MATCHING MATRIX (Adsentice Pipeline Runbook Style)  │
│  Candidate ➔ Hub Boca Raton ➔ Event Fort Lauderdale (Haversine 8.2 mi) │
├────────────────────────────────────────────────────────────────────────┤
│  MOBILE THUMB-ZONE NAVIGATION (Ergonomia em Campo com 1 Mão)            │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Benchmark Adsentice Core Server:** 
   - Estética rica com modo escuro por padrão, suporte a *glassmorphism*, micro-animações suaves e paletas HSL equilibradas.
   - Hierarquia visual inspirada nos **Pipeline Runbooks (S0-S7)** e nos dashboards de **Commerce Intelligence (L3/S3 Social-Check & Web-Check)** do servidor Adsentice.
2. **Stack Visual:** React 19 + Tailwind CSS v4 + `shadcn/ui` + Lucide Icons + Recharts.
3. **Layout Archetype:** Executive Bento UI Grid 4 Colunas (`21st-bento-grid-card-4col`).
4. **Módulo de Logística:** Baseado no template `src/app/(main)/dashboard/logistics/page.tsx` para exibição do Triângulo Logístico e status dos Hubs.
5. **Ergonomia Mobile em Campo:** Ações principais acionáveis via navegação por polegar (*Thumb Zone*), facilitando o manuseio pelo gerente regional no celular durante os eventos.

---

## 🏛️ Os 6 Motores Arquiteturais do Sistema

```text
                        BBQ WORKFORCE & EVENT OPERATIONS OS
                                         │
    ┌──────────┬──────────┬──────────────┼──────────────┬──────────┬──────────┐
    ▼          ▼          ▼              ▼              ▼          ▼          ▼
1. TALENT   2. LOCATION 3. SCHEDULING  4. MATCHING    5. COMMERCIAL 6. REPUTATION &
 ENGINE      ENGINE     ENGINE         ENGINE          ENGINE      EXPERIENCE
(Workers)   (Hubs &     (Datas &       (Score % &      (Quotes &   (Bilateral &
            Haversine)  Janelas)       EEOC Audit)     Stripe)     Google)
```

---

## Schema Relacional Completo do Cloudflare D1 (SQLite - 14 Tabelas)

```sql
-- 1. Entidade Raiz de Pessoa
CREATE TABLE IF NOT EXISTS persons (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    whatsapp_phone TEXT,
    has_whatsapp INTEGER DEFAULT 0,
    preferred_contact_method TEXT NOT NULL DEFAULT 'EMAIL',
    is_legally_authorized_us TEXT NOT NULL DEFAULT 'YES',
    engagement_type TEXT DEFAULT 'CONTRACTOR',
    deleted_at DATETIME,
    deleted_by TEXT,
    deletion_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Localizações e Endereços Base
CREATE TABLE IF NOT EXISTS locations (
    id TEXT PRIMARY KEY,
    location_type TEXT NOT NULL, -- CANDIDATE, HUB, CROSS_DOCK, EVENT
    name TEXT NOT NULL,
    address TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'FL',
    zip_code TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Hubs de Operação Logística / Cross-Docking
CREATE TABLE IF NOT EXISTS hubs (
    id TEXT PRIMARY KEY,
    location_id TEXT NOT NULL,
    name TEXT NOT NULL,
    staff_capacity INTEGER DEFAULT 20,
    equipment_capacity_events INTEGER DEFAULT 5,
    pickup_window_start TIME,
    pickup_window_end TIME,
    operating_hours TEXT,
    service_area_cities TEXT, -- JSON Array
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- 4. Perfil de Profissional Operacional
CREATE TABLE IF NOT EXISTS workers (
    id TEXT PRIMARY KEY,
    person_id TEXT UNIQUE NOT NULL,
    primary_location_id TEXT,
    recruiting_status TEXT NOT NULL DEFAULT 'NEW',
    operational_status TEXT NOT NULL DEFAULT 'AVAILABLE',
    primary_role TEXT NOT NULL,
    secondary_roles TEXT,
    experience_years INTEGER NOT NULL DEFAULT 0,
    languages TEXT NOT NULL,
    max_travel_miles INTEGER DEFAULT 35,
    events_completed INTEGER DEFAULT 0,
    attendance_rate_pct REAL DEFAULT 100.0,
    on_time_rate_pct REAL DEFAULT 100.0,
    cancellation_count INTEGER DEFAULT 0,
    no_show_count INTEGER DEFAULT 0,
    reliability_score REAL DEFAULT 5.0,
    retention_until DATETIME,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE,
    FOREIGN KEY (primary_location_id) REFERENCES locations(id) ON DELETE SET NULL
);

-- 5. Habilidades e Certificações
CREATE TABLE IF NOT EXISTS worker_skills (
    id TEXT PRIMARY KEY,
    worker_id TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    proficiency_level TEXT DEFAULT 'EXPERT',
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS worker_certifications (
    id TEXT PRIMARY KEY,
    worker_id TEXT NOT NULL,
    certification_name TEXT NOT NULL,
    issued_date DATE,
    expiration_date DATE,
    is_verified INTEGER DEFAULT 0,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
);

-- 6. Matriz de Disponibilidade de Horários
CREATE TABLE IF NOT EXISTS worker_availabilities (
    id TEXT PRIMARY KEY,
    worker_id TEXT NOT NULL,
    day_of_week INTEGER,
    specific_date DATE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_blackout_date INTEGER DEFAULT 0,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
);

-- 7. Eventos & Ordens de Serviço (Entidade Central)
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    event_location_id TEXT NOT NULL,
    region_code TEXT NOT NULL DEFAULT 'FLORIDA',
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    guest_count INTEGER NOT NULL,
    event_lifecycle_status TEXT NOT NULL DEFAULT 'LEAD', -- LEAD, QUOTE_DRAFT, MANAGER_APPROVED, QUOTE_SENT, DEPOSIT_PAID, STAFFING, STAFF_CONFIRMED, IN_PROGRESS, COMPLETED, ARCHIVED
    -- Preço e Controle Financeiro Comercial
    quoted_price_usd REAL DEFAULT 0.0,
    deposit_required_usd REAL DEFAULT 0.0,
    deposit_paid_usd REAL DEFAULT 0.0,
    balance_due_usd REAL DEFAULT 0.0,
    payment_status TEXT NOT NULL DEFAULT 'UNPAID', -- UNPAID, DEPOSIT_PAID, FULLY_PAID, REFUNDED
    -- Custos e Margem Bruta
    estimated_staff_cost_usd REAL DEFAULT 0.0,
    estimated_travel_cost_usd REAL DEFAULT 0.0,
    estimated_equipment_cost_usd REAL DEFAULT 0.0,
    gross_margin_usd REAL DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- 8. Requisitos de Equipe do Evento
CREATE TABLE IF NOT EXISTS event_staff_requirements (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    required_role TEXT NOT NULL,
    required_count INTEGER NOT NULL DEFAULT 1,
    hourly_rate_usd REAL,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- 9. Alocações de Equipe (Matching Engine)
CREATE TABLE IF NOT EXISTS staff_assignments (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    worker_id TEXT NOT NULL,
    assigned_hub_id TEXT,
    role_assigned TEXT NOT NULL,
    match_score_pct REAL NOT NULL,
    algorithm_version TEXT DEFAULT 'v1.0',
    match_reasons TEXT,
    distance_miles REAL,
    estimated_travel_minutes INTEGER,
    estimated_travel_cost_usd REAL,
    assignment_status TEXT NOT NULL DEFAULT 'PROPOSED', -- PROPOSED, INVITED, ACCEPTED, CONFIRMED, DECLINED, REPLACEMENT_REQUIRED
    invited_at DATETIME,
    responded_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_hub_id) REFERENCES hubs(id) ON DELETE SET NULL
);

-- 10. Registros de Pagamentos (Stripe Webhooks)
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    stripe_payment_intent_id TEXT UNIQUE,
    stripe_checkout_session_id TEXT,
    amount_usd REAL NOT NULL,
    payment_type TEXT NOT NULL, -- DEPOSIT, BALANCE_PAYMENT, REFUND
    payment_status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, SUCCEEDED, FAILED
    paid_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- 11. Feedbacks e Avaliações de Clientes (Experience Engine)
CREATE TABLE IF NOT EXISTS customer_feedbacks (
    id TEXT PRIMARY KEY,
    event_id TEXT UNIQUE NOT NULL,
    food_rating INTEGER CHECK (food_rating BETWEEN 1 AND 5),
    service_rating INTEGER CHECK (service_rating BETWEEN 1 AND 5),
    staff_rating INTEGER CHECK (staff_rating BETWEEN 1 AND 5),
    communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
    overall_rating REAL NOT NULL,
    comment TEXT,
    google_review_invited INTEGER DEFAULT 0,
    google_review_clicked INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- 12. Avaliações Operacionais da Equipe (Alimenta Reliability Score)
CREATE TABLE IF NOT EXISTS worker_evaluations (
    id TEXT PRIMARY KEY,
    assignment_id TEXT UNIQUE NOT NULL,
    worker_id TEXT NOT NULL,
    punctuality_rating INTEGER CHECK (punctuality_rating BETWEEN 1 AND 5),
    professionalism_rating INTEGER CHECK (professionalism_rating BETWEEN 1 AND 5),
    skill_rating INTEGER CHECK (skill_rating BETWEEN 1 AND 5),
    reliability_rating INTEGER CHECK (reliability_rating BETWEEN 1 AND 5),
    evaluator_email TEXT NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES staff_assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
);

-- 13. Documentos no R2 & 14. Logs de Auditoria do Sistema
CREATE TABLE IF NOT EXISTS talent_documents (
    id TEXT PRIMARY KEY,
    worker_id TEXT NOT NULL,
    document_type TEXT NOT NULL,
    r2_key TEXT NOT NULL,
    file_name TEXT NOT NULL,
    content_type TEXT NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    actor_email TEXT NOT NULL,
    action TEXT NOT NULL,
    target_entity TEXT NOT NULL,
    target_id TEXT NOT NULL,
    details_json TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🗺️ Roadmap Integrado de Execução

1. **Fase 0 (MVP Soberano $0/mês):**
   - D1: Tabelas `persons`, `locations`, `workers`, `worker_skills`, `talent_documents` e `audit_logs`.
   - Portal `/careers` em `bbqcarioca.work` (Formulário + Turnstile + Workers).
   - SuperAdmin UI (`admin.bbqcarioca.work`) em React 19 + Tailwind v4 baseada na estética do servidor Adsentice Next.js / Materio Bento UI Grid.

2. **Fase 1 (Commercial & Smart Operations):**
   - Tabelas `events`, `service_requests`, `hubs`, `event_staff_requirements`, `staff_assignments`.
   - Integração com Stripe Payment Links para aprovação de orçamentos e recebimento de depósitos.
   - Smart Matching (v1.0) com Haversine e substituição de emergência.

3. **Fase 2 (Experience & Reputation Loop):**
   - Tabelas `payments`, `customer_feedbacks` e `worker_evaluations`.
   - Disparo de convites para Google Business Review e atualização do `Reliability Score`.
