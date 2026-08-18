# ADR-0006: Talent, Service & Smart Scheduling Domain Model ($0/month Sovereign Architecture)

* **Status:** Aceito (Accepted)
* **Data:** 2026-08-18
* **Autor:** Jeferson Amorim (Founder) & Antigravity (Pair AI)
* **Domínio:** BBQ do Carioca (`jgdeamorim/bbqcarioca`)
* **Impacto:** Arquitetura do Modelo de Domínio, Motores Cognitivos, Compliance Legal/EEOC, Auditabilidade e Schema Relacional D1 Completo

---

## Contexto e Problema

O projeto BBQ do Carioca evoluiu da simples captação de currículos (ATS) para uma **Plataforma Soberana de Gestão de Operações de Eventos e Força de Trabalho (Workforce & Event Operations Platform)** em `bbqdocarioca.work`. 

Antes de iniciar a programação, é necessário congelar o **Modelo de Domínio Soberano (ADR-0006)** para evitar refatorações estruturais quando o sistema integrar logística, disponibilidade, matching algorítmico, substituições de emergência e auditoria legal.

---

## Princípios de Domínio & Diretrizes de Conformidade Legal

### 1. Separação de Entidades: `Person` ➔ (`Candidate` | `Worker` | `Provider`)
Uma pessoa física é representada pela entidade raiz `Person`. Uma única pessoa pode possuir múltiplos perfis operacionais sem duplicação de dados:
* **Candidate Profile:** Fase de recrutamento e triagem.
* **Worker Profile:** Integrante da equipe operacional de eventos (Grill Cook, Server, Bartender).
* **Provider Profile:** Prestador de serviços parceiro (Private Chef, Caterer).

### 2. Modelo de Estados Duplo e Independente
Separou-se o estado de recrutamento do estado operacional:
* **Recruiting State:** `NEW` ➔ `SCREENING` ➔ `SHORTLISTED` ➔ `INTERVIEW` ➔ `APPROVED` ➔ `REJECTED`.
* **Operational State:** `AVAILABLE`, `LIMITED`, `UNAVAILABLE`, `SUSPENDED`, `INACTIVE`.
*(Exemplo: Um profissional pode estar `APPROVED` e `AVAILABLE`, ou `APPROVED` e `UNAVAILABLE`).*

### 3. Ética Algorítmica, Não-Discriminação & Human-in-the-Loop (EEOC Compliance)
* **Zero Atributos Protegidos:** O formulário proíbe perguntas sobre Raça, Religião, Idade ou Gênero. Idiomas são tratados exclusivamente como competência operacional (`English`, `Portuguese`, `Spanish`).
* **Zero SSN no Cadastro Inicial:** Elimina-se a coleta de documentos ultrassensíveis no primeiro contato.
* **Recomendação, Não Decisão Automática:** O algoritmo de *Smart Match* calcula uma pontuação e justifica os motivos da recomendação. A decisão de contratação/escalação é estritamente humana e auditada (`admin_decision`, `match_reasons`, `algorithm_version`).

### 4. Acessibilidade Universal (WCAG 2.1 AA)
O formulário público `/careers` é construído com HTML5 semântico, suporte completo a navegação por teclado, leitores de tela e contraste adequado.

---

## 🏛️ Os 5 Motores Arquiteturais do Sistema

```text
                        BBQ WORKFORCE OPERATIONS OS
                                    │
    ┌───────────────┬───────────────┼───────────────┬───────────────┐
    ▼               ▼               ▼               ▼               ▼
1. TALENT       2. LOCATION     3. SCHEDULING   4. MATCHING     5. OPERATIONS
 ENGINE          ENGINE          ENGINE          ENGINE          ENGINE
 (Pessoas &      (Logística &    (Datas &        (Score % &      (Escalas &
 Taxonomias)     Cross-Docks)    Janelas)        Algoritmo)      Emergências)
```

1. **Talent Engine:** Gestão de habilidades (`Brisket`, `Smoker`, `Open Fire`), certificações (`Food Handler`) e avaliações operacionais (`Reliability Score`).
2. **Location Engine:** Geocodificação Haversine ($0), cálculo de distância, tempo de viagem (*Travel Time* em min) e integração com **Cross-Docking Hubs**.
3. **Scheduling Engine:** Matriz de disponibilidade (`Date`, `Start/End Time`, `Blackout Dates`, `Recurring`).
4. **Matching Engine:** Motor algorítmico ponderado que recomenda a equipe ideal para cada evento.
5. **Operations Engine:** Gestão do ciclo de vida do evento, confirmações, substituição urgente (*Emergency Replacement*) e logs de auditoria.

---

## Schema Relacional Completo do Cloudflare D1 (SQLite)

```sql
-- 1. Entidade Raiz de Pessoa
CREATE TABLE IF NOT EXISTS persons (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    whatsapp_phone TEXT,
    has_whatsapp INTEGER DEFAULT 0,
    preferred_contact_method TEXT NOT NULL DEFAULT 'EMAIL', -- EMAIL, WHATSAPP, SMS, PHONE
    is_legally_authorized_us TEXT NOT NULL DEFAULT 'YES', -- YES, NO, REQUIRE_SPONSORSHIP
    engagement_type TEXT DEFAULT 'CONTRACTOR', -- CONTRACTOR, EMPLOYEE_PENDING
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

-- 4. Perfil de Candidato / Profissional Operacional
CREATE TABLE IF NOT EXISTS workers (
    id TEXT PRIMARY KEY,
    person_id TEXT UNIQUE NOT NULL,
    primary_location_id TEXT,
    recruiting_status TEXT NOT NULL DEFAULT 'NEW', -- NEW, SCREENING, SHORTLISTED, INTERVIEW, APPROVED, REJECTED
    operational_status TEXT NOT NULL DEFAULT 'AVAILABLE', -- AVAILABLE, LIMITED, UNAVAILABLE, SUSPENDED, INACTIVE
    primary_role TEXT NOT NULL, -- BBQ Chef, Pitmaster, Grill Assistant, Server, Bartender, Coordinator
    secondary_roles TEXT, -- JSON Array
    experience_years INTEGER NOT NULL DEFAULT 0,
    languages TEXT NOT NULL, -- JSON Array: ["English", "Portuguese"]
    max_travel_miles INTEGER DEFAULT 35,
    -- Métricas de Confiabilidade (Reliability Score)
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

-- 5. Taxonomia de Habilidades e Certificações
CREATE TABLE IF NOT EXISTS worker_skills (
    id TEXT PRIMARY KEY,
    worker_id TEXT NOT NULL,
    skill_name TEXT NOT NULL, -- Brisket, Ribs, Smoker, Open Fire, Argentine Grill, Event Service
    proficiency_level TEXT DEFAULT 'EXPERT',
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS worker_certifications (
    id TEXT PRIMARY KEY,
    worker_id TEXT NOT NULL,
    certification_name TEXT NOT NULL, -- Food Handler, Food Safety, Alcohol Service
    issued_date DATE,
    expiration_date DATE,
    is_verified INTEGER DEFAULT 0,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
);

-- 6. Matriz de Disponibilidade de Horários
CREATE TABLE IF NOT EXISTS worker_availabilities (
    id TEXT PRIMARY KEY,
    worker_id TEXT NOT NULL,
    day_of_week INTEGER, -- 0=Sunday, 6=Saturday
    specific_date DATE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_blackout_date INTEGER DEFAULT 0,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
);

-- 7. Solicitações de Eventos de Catering (Com Controle Financeiro Inicial)
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    event_location_id TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    event_type TEXT NOT NULL, -- Wedding, Corporate BBQ, Birthday, Backyard Party
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    guest_count INTEGER NOT NULL,
    event_lifecycle_status TEXT NOT NULL DEFAULT 'REQUESTED', -- LEAD, QUOTE, REQUESTED, CONFIRMED, STAFFING, STAFF_CONFIRMED, IN_PROGRESS, COMPLETED, ARCHIVED
    -- Financeiro Operacional (Métricas Estimadas)
    revenue_usd REAL DEFAULT 0.0,
    estimated_staff_cost_usd REAL DEFAULT 0.0,
    estimated_travel_cost_usd REAL DEFAULT 0.0,
    estimated_margin_usd REAL DEFAULT 0.0,
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

-- 9. Alocações de Equipe, Matching & Substituição de Emergência
CREATE TABLE IF NOT EXISTS staff_assignments (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    worker_id TEXT NOT NULL,
    assigned_hub_id TEXT,
    role_assigned TEXT NOT NULL,
    match_score_pct REAL NOT NULL,
    algorithm_version TEXT DEFAULT 'v1.0',
    match_reasons TEXT, -- JSON explicativo para auditoria EEOC
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

-- 10. Documentos no R2 e Logs de Auditoria do Sistema
CREATE TABLE IF NOT EXISTS talent_documents (
    id TEXT PRIMARY KEY,
    worker_id TEXT NOT NULL,
    document_type TEXT NOT NULL, -- RESUME, PROFILE_PHOTO, CERTIFICATE
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
   - Criação das tabelas `persons`, `locations`, `workers`, `worker_skills`, `talent_documents` e `audit_logs` no D1.
   - Portal `/careers` em `bbqdocarioca.work` com acessibilidade WCAG 2.1 AA e Turnstile.
   - SuperAdmin em `admin.bbqdocarioca.work` com Zero Trust e cadastro basilar.

2. **Fase 1 (Smart Operations & Emergency Replacement):**
   - Tabelas `hubs`, `events`, `event_staff_requirements` e `staff_assignments`.
   - Calculadora Haversine com Travel Time e motor de *Smart Match (v1.0)*.
   - Botão de substituição urgente (*Emergency Replacement*).

3. **Fase 2 (Multi-Canal & Financeiro Operacional):**
   - Disparo WhatsApp (`wa.me`) + Ativação Cloudflare Email Sending (US$ 5/mês Workers Paid).
   - Relatórios de margem estimada e custos de deslocamento por evento.
