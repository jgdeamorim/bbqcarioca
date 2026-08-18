# ADR-0005: Sovereign BBQ Talent & Service Platform Architecture ($0/month Free Tier to Paid Upgrade Roadmap)

* **Status:** Aceito (Accepted)
* **Data:** 2026-08-18
* **Autor:** Jeferson Amorim (Founder) & Antigravity (Pair AI)
* **Domínio:** BBQ do Carioca (`jgdeamorim/bbqcarioca`)
* **Impacto:** Location Intelligence, Cross-Docking Hubs, Smart Matching Engine, Field-Service Management, DB D1 Relacional e Estratégia de TLDs (`.com` vs `.work`)

---

## Contexto e Problema

O projeto BBQ do Carioca necessita de um **Talent & Field-Service Operations OS** para a operação de catering na Flórida. Na logística de eventos, a distância simples em linha reta entre o candidato e o local do evento é insuficiente. A operação de catering exige a avaliação de **Hubs / Cross-Docks de Logística** (pontos de encontro de equipe, insumos e equipamentos de churrasco), além da estimativa realista de **Distância e Tempo de Deslocamento (Travel Time)** nas rodovias da Flórida.

Ratificou-se que:
1. **`db.json` é expressamente proibido para produção**, sendo reservado apenas para mocks locais.
2. **E-mail é o canal oficial obrigatório**, mantendo **WhatsApp e SMS como canais operacionais opcionais**.
3. A localização do candidato baseia-se no **ZIP Code / Cidade** informados (respeitando a privacidade PII), e **não** na geolocalização do IP do navegador.
4. O cálculo de distância inicial no MVP usa a fórmula matemática de **Haversine no D1/Worker ($0 de APIs de mapas)**.

---

## Decisão de Arquitetura

Decidiu-se incorporar o módulo de **Location Intelligence & Cross-Docking Hubs** ao motor de Smart Matching da **BBQ Talent & Service Platform**.

### 📍 1. O Triângulo Logístico de Operações (3 Nós Geográficos)

```text
               [ CANDIDATO ]
            Residência / ZIP Code
                      │
                      │ (Distância 1: Candidato ➔ Hub)
                      ▼
            [ CROSS-DOCK / HUB ]
          Equipamentos, Veículos e Staff
                      │
                      │ (Distância 2: Hub ➔ Evento)
                      ▼
                 [ EVENTO ]
         Local de Catering na Flórida
```

### 🧮 2. Smart Matching Engine com Rating Logístico

$$\text{Distance Score} = f(\text{Distância Candidato} \rightarrow \text{Hub}) + f(\text{Distância Hub} \rightarrow \text{Evento}) + \text{Tempo Estimado (Travel Time)}$$

```text
EVENTO: BBQ Wedding (Fort Lauderdale, FL)
HUB PRÓXIMO: Fort Lauderdale Cross-Dock #01 (4.2 miles do evento)
-----------------------------------------------------------------------
CANDIDATO 1: João Santos (Fort Lauderdale) ➔ Evento direto: 5.1 mi (97% Match)
CANDIDATO 2: Carlos Silva (Boca Raton) ➔ Hub: 8 mi ➔ Evento: 12 mi = Total 20 mi (94% Match)
CANDIDATO 3: Marcos Oliveira (Miami) ➔ Hub: 24 mi ➔ Evento: 12 mi = Total 36 mi (89% Match)
```

---

## Schema Expandido do Banco de Dados D1 (SQLite)

```sql
-- 1. Locais e Coordenadas (Candidatos, Hubs, Eventos)
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

-- 2. Hubs de Operação & Cross-Docking
CREATE TABLE IF NOT EXISTS hubs (
    id TEXT PRIMARY KEY,
    location_id TEXT NOT NULL,
    name TEXT NOT NULL,
    staff_capacity INTEGER DEFAULT 20,
    equipment_capacity_events INTEGER DEFAULT 5,
    pickup_window_start TIME,
    pickup_window_end TIME,
    service_areas TEXT, -- JSON Array: ["Boca Raton", "Fort Lauderdale", "Delray Beach"]
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- 3. Tabela Unificada de Talentos e Prestadores
CREATE TABLE IF NOT EXISTS talents (
    id TEXT PRIMARY KEY,
    primary_location_id TEXT,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    whatsapp_phone TEXT,
    has_whatsapp INTEGER DEFAULT 0,
    preferred_contact_method TEXT NOT NULL DEFAULT 'EMAIL',
    talent_type TEXT NOT NULL, -- BBQ Chef, Pitmaster, Grill Assistant, Server, Bartender, Coordinator
    experience_years INTEGER NOT NULL,
    specialties TEXT, -- JSON Array
    languages TEXT NOT NULL, -- JSON Array
    is_legally_authorized_us TEXT NOT NULL DEFAULT 'YES',
    max_travel_miles INTEGER DEFAULT 35,
    reliability_rating REAL DEFAULT 5.0,
    status TEXT NOT NULL DEFAULT 'NEW',
    notes TEXT,
    retention_until DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (primary_location_id) REFERENCES locations(id) ON DELETE SET NULL
);

-- 4. Solicitações de Serviços / Eventos de Catering
CREATE TABLE IF NOT EXISTS service_requests (
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
    status TEXT NOT NULL DEFAULT 'REQUESTED', -- REQUESTED, MATCHING, PROPOSED, CONFIRMED, COMPLETED, CANCELLED
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- 5. Necessidades de Equipe Calculadas por Evento
CREATE TABLE IF NOT EXISTS event_staff_requirements (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL,
    required_role TEXT NOT NULL,
    required_count INTEGER NOT NULL DEFAULT 1,
    hourly_rate REAL,
    FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE
);

-- 6. Alocações de Equipe (Escala & Matching)
CREATE TABLE IF NOT EXISTS staff_assignments (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL,
    talent_id TEXT NOT NULL,
    assigned_hub_id TEXT,
    role_assigned TEXT NOT NULL,
    match_score_pct REAL NOT NULL,
    distance_miles REAL,
    estimated_travel_minutes INTEGER,
    assignment_status TEXT NOT NULL DEFAULT 'PROPOSED', -- PROPOSED, INVITED, ACCEPTED, CONFIRMED, DECLINED, REPLACEMENT_REQUIRED
    invited_at DATETIME,
    responded_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (talent_id) REFERENCES talents(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_hub_id) REFERENCES hubs(id) ON DELETE SET NULL
);

-- 7. Documentos no R2 & Logs de Auditoria
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
MVP v1 (Base Soberana + Geocodificação Inicial)
- /careers em bbqdocarioca.work (Formulário + Turnstile + Worker + D1)
- Cadastro com ZIP Code/Cidade ➔ Cálculo Haversine ($0 API Maps)
- Tabela `talents` + `locations` + SuperAdmin em admin.bbqdocarioca.work (Zero Trust)

Fase 2 (Cross-Dock Hubs & Smart Match Engine)
- Cadastro de Hubs/Bases Operacionais na Flórida
- Cálculo do Triângulo Logístico (Candidato ➔ Hub ➔ Evento)
- Detecção visual de conflitos de horário no Calendário do SuperAdmin

Fase 3 (Multi-Canal & Convocação Rápida)
- Botão WhatsApp Dispatch (wa.me) no SuperAdmin
- Ativação do Cloudflare Email Sending (US$ 5/mês Workers Paid)
```
