# ADR-0005: Sovereign BBQ Talent & Service Platform Architecture ($0/month Free Tier to Paid Upgrade Roadmap)

* **Status:** Aceito (Accepted)
* **Data:** 2026-08-18
* **Autor:** Jeferson Amorim (Founder) & Antigravity (Pair AI)
* **Domínio:** BBQ do Carioca (`jgdeamorim/bbqcarioca`)
* **Impacto:** Field-Service Operations Engine, Smart Talent Matching (Score %), Calendário Operacional, DB Relacional D1, Estratégia de TLDs (`.com` vs `.work`) e Custo $0/mês (Fase 0)

---

## Contexto e Problema

O projeto BBQ do Carioca necessita de mais do que um simples banco de currículos (ATS). Para atender à demanda de catering na Flórida (Casamentos, Eventos Corporativos, Festas Privadas de BBQ), o sistema deve evoluir para um **Talent & Service Operations OS**, onde a solicitação de um evento gera automaticamente as necessidades de equipe e o algoritmo calcula os candidatos mais compatíveis.

Ratificou-se que:
1. **`db.json` é expressamente proibido para produção**, sendo reservado apenas para mocks locais.
2. **E-mail é o canal oficial primário obrigatório**, com **WhatsApp e SMS como canais operacionais opcionais**.
3. O domínio **`bbqdocarioca.work`** consolida os 3 pilares operacionais: **TALENT** (Candidatos/Chefs), **SERVICES** (Catering/Eventos) e **OPERATIONS** (Smart Scheduling/Matching).
4. O algoritmo calcula um **Match Score (%) determinístico**, recomendando os melhores candidatos, enquanto a decisão final permanece sempre sob confirmação do **SuperAdmin (Human-in-the-Loop)**.

---

## Decisão de Arquitetura

Decidiu-se adotar a **BBQ Talent & Service Platform** sob a arquitetura de **Field-Service Management (FSM)** rodando na infraestrutura serverless da Cloudflare (D1 + R2 + Workers + Zero Trust).

### 🏛️ Três Pilares da Plataforma (`bbqdocarioca.work`)

```text
┌────────────────────────────────────────────────────────────────────────┐
│                      BBQ DO CARIOCA WORK PLATFORM                      │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   1. TALENT NETWORK         2. SERVICES & CATERING     3. OPERATIONS   │
│   Candidates / Chefs        Weddings / Corporate       Smart Matching  │
│   Pitmasters / Staff        Private BBQ Services       Event Calendar  │
│                                                                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
                       [ Smart Matching Engine ]
                                    │
               ┌────────────────────┴────────────────────┐
               ▼                                         ▼
   [ Match Score % Calculation ]              [ Conflict Detection ]
   (Role, City, Radius, Rating)               (Double-booking Preventer)
               │                                         │
               └────────────────────┬────────────────────┘
                                    ▼
                         SuperAdmin Confirmation
                         (admin.bbqdocarioca.work)
```

---

## ⚡ Motor de Smart Matching & Cálculo de Match Score (%)

O algoritmo avalia os talentos disponíveis e gera uma pontuação determinística:

$$\text{Match Score} = (w_1 \cdot \text{Role}) + (w_2 \cdot \text{Availability}) + (w_3 \cdot \text{Distance}) + (w_4 \cdot \text{Experience}) + (w_5 \cdot \text{Language}) + (w_6 \cdot \text{Reliability})$$

```text
CANDIDATE: Carlos Silva (BBQ Chef)
──────────────────────────────────────────────────
Role Match:             100%
Availability:           100%
Distance (Boca Raton):   92%  (Raio < 25 miles)
Experience (6 yrs):      95%
Languages (EN/PT):      100%
Reliability Rating:      94%  (Audit history)
──────────────────────────────────────────────────
TOTAL MATCH SCORE:       95%  ➔ #1 RECOMMENDED
```

### 🚨 Detecção de Conflitos de Agenda (Conflict Preventer)
Se um talento já possui alocação em um evento (`Aug 29 · 5 PM - 10 PM · Boca Raton`), o sistema bloqueia automaticamente a escalação concorrente (`Aug 29 · 6 PM - 11 PM · Miami`) e exibe **`CONFLICT DETECTED`**.

---

## 🔄 Máquina de Estados Operacionais do Evento & Subtituição Rápida

```text
   REQUESTED (Solicitação recebida)
       │
       ▼
   MATCHING (Cálculo de Match Score %)
       │
       ▼
   PROPOSED (SuperAdmin selecionou equipe)
       │
       ▼
   INVITED (Notificação enviada por E-mail/WhatsApp)
       │
       ▼
   ACCEPTED (Talento confirmou presença)
       │
       ▼
   CONFIRMED (Equipe fechada e validada)
       │
       ▼
   IN_PROGRESS ➔ COMPLETED (Evento concluído)

   --- TRATAMENTO DE EXCEÇÃO & REPOSIÇÃO RÁPIDA ---
   CANCELLED / NO_SHOW / DECLINED
       │
       ▼
   REPLACEMENT_REQUIRED ➔ Dispara Smart Match do 2º colocado instantaneamente
```

---

## Schema Expandido do Banco de Dados D1 (SQLite)

```sql
-- 1. Talentos e Prestadores
CREATE TABLE IF NOT EXISTS talents (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    whatsapp_phone TEXT,
    has_whatsapp INTEGER DEFAULT 0,
    preferred_contact_method TEXT NOT NULL DEFAULT 'EMAIL',
    city TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'FL',
    max_travel_miles INTEGER DEFAULT 35,
    talent_type TEXT NOT NULL, -- BBQ Chef, Pitmaster, Grill Assistant, Server, Bartender, Coordinator
    experience_years INTEGER NOT NULL,
    specialties TEXT, -- JSON Array
    languages TEXT NOT NULL, -- JSON Array
    is_legally_authorized_us TEXT NOT NULL DEFAULT 'YES',
    reliability_rating REAL DEFAULT 5.0,
    status TEXT NOT NULL DEFAULT 'NEW',
    notes TEXT,
    retention_until DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Solicitações de Serviços / Eventos de Catering
CREATE TABLE IF NOT EXISTS service_requests (
    id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    event_type TEXT NOT NULL, -- Wedding, Corporate BBQ, Birthday, Backyard Party
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location_city TEXT NOT NULL,
    location_address TEXT NOT NULL,
    guest_count INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'REQUESTED', -- REQUESTED, MATCHING, PROPOSED, CONFIRMED, COMPLETED, CANCELLED
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Necessidades de Equipe Calculadas por Evento
CREATE TABLE IF NOT EXISTS event_staff_requirements (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL,
    required_role TEXT NOT NULL, -- Pitmaster, Grill Assistant, Server, Bartender
    required_count INTEGER NOT NULL DEFAULT 1,
    hourly_rate REAL,
    FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE
);

-- 4. Alocações de Equipe (Escala & Matching)
CREATE TABLE IF NOT EXISTS staff_assignments (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL,
    talent_id TEXT NOT NULL,
    role_assigned TEXT NOT NULL,
    match_score_pct REAL NOT NULL,
    assignment_status TEXT NOT NULL DEFAULT 'PROPOSED', -- PROPOSED, INVITED, ACCEPTED, CONFIRMED, DECLINED, REPLACEMENT_REQUIRED
    invited_at DATETIME,
    responded_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (talent_id) REFERENCES talents(id) ON DELETE CASCADE
);

-- 5. Documentos no R2
CREATE TABLE IF NOT EXISTS talent_documents (
    id TEXT PRIMARY KEY,
    talent_id TEXT NOT NULL,
    document_type TEXT NOT NULL,
    r2_key TEXT NOT NULL,
    file_name TEXT NOT NULL,
    content_type TEXT NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (talent_id) REFERENCES talents(id) ON DELETE CASCADE
);

-- 6. Logs de Auditoria
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

## 🗺️ Roadmap de Implementação Incremental

```text
MVP v1 (Base Soberana)
- /careers em bbqdocarioca.work (Formulário + Turnstile + Worker + D1)
- Tabela `talents` + SuperAdmin em admin.bbqdocarioca.work (Zero Trust)
- Filtro por Cidade, Função e Status de Candidatos

Fase 2 (Smart Operations & Event Matcher)
- Tabelas `service_requests`, `event_staff_requirements` e `staff_assignments`
- Calculadora de Match Score % baseada em papel, localização e disponibilidade
- Detecção visual de conflitos de horário no Calendário do SuperAdmin

Fase 3 (Multi-Canal & Convocação Rápida)
- Botão WhatsApp Dispatch (wa.me) no SuperAdmin
- Ativação do Cloudflare Email Sending (US$ 5/mês Workers Paid) para confirmações automáticas
```
