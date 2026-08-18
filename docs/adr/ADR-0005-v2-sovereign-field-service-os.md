# ADR-0005 v2: Sovereign BBQ Talent & Field-Service Operations OS

* **Status:** Aceito (Substitui ADR-0005 e ADR-0006)
* **Data:** 2026-08-18
* **Autor:** Jeferson Amorim (Founder) & Antigravity (Pair AI)
* **Domínio:** BBQ do Carioca (`jgdeamorim/bbqcarioca`)

---

## 1. O Princípio Semântico Soberano

> **The platform does not merely recruit people. It converts customer service requests into priced, approved, paid, geographically feasible, staffed, executed, and evaluated events.**

O núcleo comercial não gira artificialmente em torno de um candidato. A espinha dorsal do sistema é o ciclo de vida completo do serviço:
`CUSTOMER ➔ SERVICE REQUEST ➔ PRICING ➔ REGIONAL MANAGER ➔ QUOTE ➔ STRIPE PAYMENT ➔ EVENT ➔ SMART MATCHING ➔ TALENT ➔ CROSS-DOCK ➔ STAFF ASSIGNMENT ➔ EVENT ➔ FEEDBACK ➔ QUALITY SCORE ➔ GOOGLE REVIEW`

---

## 2. A Matriz de 25 Domínios

O ecossistema é dividido estritamente nos 25 domínios a seguir, gerenciados sob a arquitetura Cloudflare:

1. **Identity & Access:** Cloudflare Access (JWT completo: signature, issuer, audience, not-before). RBAC (SUPERADMIN ➔ REGIONAL_MANAGER ➔ OPERATIONS_ADMIN).
2. **People & Talent:** Classe `Person` generalista (Candidate, Talent, Provider).
3. **Skills & Certifications:** Validações, proficiências.
4. **Availability:** Janelas de tempo.
5. **Locations:** Geocodificação (Lat/Lon) e Haversine.
6. **Hubs / Cross-Docks:** Capacidade, Horários, Serviço. Modos Logísticos: `DIRECT`, `HUB`, e `MULTI_HUB`.
7. **Customers:** O contratante do BBQ Catering.
8. **Service Requests:** Objeto central de demanda (Data, Duração, Convidados, Staff exigido).
9. **Pricing:** Motor de precificação (Custo Serviço + Custo Staff + Deslocamento + Margem + Tax).
10. **Quotes:** Orçamentos (DRAFT ➔ PENDING_APPROVAL ➔ APPROVED ➔ SENT ➔ ACCEPTED ➔ EXPIRED ➔ CANCELLED).
11. **Regional Management:** Aprovação por região (Flórida).
12. **Events:** A cristalização do Quote aprovado e pago. Separação estrita de Order State vs Payment State.
13. **Smart Scheduling:** Planejamento de staff.
14. **Smart Matching:** `MATCH SCORE ➔ RECOMMENDATION ➔ HUMAN APPROVAL` (Nunca contratação automática).
15. **Assignments:** A alocação oficial do talento.
16. **Payments:** Estados separados (UNPAID, PAID, PARTIALLY_PAID, DISPUTED, REFUNDED).
17. **Stripe:** Integração Checkout (V1) e Connect (V2). Webhooks com **Idempotência**.
18. **Provider Settlements:** Repasse financeiro.
19. **Communications:** Canais intercambiáveis (Email [Oficial], WhatsApp, SMS, Phone).
20. **Customer Feedback:** Avaliação do serviço.
21. **Staff Feedback:** Avaliação do funcionário.
22. **Reputation / Reviews:** Convite neutro pro Google (Sem Review Gating).
23. **Documents / R2:** Políticas de upload presigned (Max size, Content-Type via Worker). MVP permite form estruturado (Zero-PDF) e fotos via R2 opcionalmente.
24. **Retention / Privacy:** `retention_until` por política de dados. Zero coleta de SSN no onboarding.
25. **Audit / Observability:** Tabela `audit_logs` rigorosa (`actor_id`, `action`, `before`, `after`, `correlation_id` end-to-end).

---

## 3. Infraestrutura & Limites (MVP Free Tier $0)

A arquitetura DevOps Cloudflare é ratificada:
* **Workers:** 100k reqs/dia ($0).
* **D1 (SQLite):** 5M reads/dia, 100k writes/dia, 5GB storage ($0). Execução Sequencial Transacional via `env.DB.batch()`.
* **R2:** 10GB storage, Egress grátis ($0). Utilização de `Presigned URLs` (Bearer tokens de curto prazo para upload direto do Client).
* **Email:** Email Routing Grátis. E-mails transacionais arbitrários alocados para Fase 1 (Workers Paid $5).

---

## 4. O Modelo de Dados (D1 Core Schema)

A taxonomia separa rigidamente `Order State` de `Payment State` e unifica `Persons`:

```sql
-- DOMAINS 1, 2, 7: Persons & Identity
CREATE TABLE IF NOT EXISTS persons (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- 'CUSTOMER', 'CANDIDATE', 'TALENT', 'PROVIDER'
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    whatsapp_phone TEXT,
    preferred_contact_method TEXT DEFAULT 'EMAIL',
    retention_until DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- DOMAIN 8: Service Requests
CREATE TABLE IF NOT EXISTS service_requests (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    service_type TEXT NOT NULL, -- 'BBQ Catering'
    location_id TEXT NOT NULL,
    event_date DATE NOT NULL,
    guests INTEGER,
    duration_hours INTEGER,
    requested_staff INTEGER,
    status TEXT NOT NULL DEFAULT 'NEW',
    correlation_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES persons(id)
);

-- DOMAINS 9, 10: Pricing & Quotes
CREATE TABLE IF NOT EXISTS quotes (
    id TEXT PRIMARY KEY,
    service_request_id TEXT NOT NULL,
    regional_manager_id TEXT,
    total_price REAL NOT NULL,
    staff_cost REAL NOT NULL,
    margin REAL NOT NULL,
    status TEXT NOT NULL, -- 'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT', 'ACCEPTED', 'EXPIRED', 'CANCELLED'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_request_id) REFERENCES service_requests(id)
);

-- DOMAIN 12: Events (Order State)
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    quote_id TEXT NOT NULL,
    order_status TEXT NOT NULL, -- 'DRAFT', 'QUOTED', 'APPROVED', 'BOOKED', 'COMPLETED', 'CANCELLED'
    payment_status TEXT NOT NULL, -- 'UNPAID', 'PARTIALLY_PAID', 'PAID', 'REFUNDED', 'FAILED', 'DISPUTED'
    stripe_payment_intent_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quote_id) REFERENCES quotes(id)
);

-- DOMAINS 13, 14, 15: Staff Assignments
CREATE TABLE IF NOT EXISTS staff_assignments (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    talent_id TEXT NOT NULL,
    hub_id TEXT, -- Pode ser nulo se o modo for DIRECT
    role TEXT NOT NULL,
    match_score REAL,
    status TEXT NOT NULL, -- 'RECOMMENDED', 'APPROVED', 'CONFIRMED', 'COMPLETED'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (talent_id) REFERENCES persons(id)
);

-- DOMAIN 25: Audit Logs & Observability
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    actor_id TEXT NOT NULL,
    action TEXT NOT NULL, -- 'APPROVED_QUOTE', 'CHANGED_PRICE', 'PROCESSED_WEBHOOK'
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    before_state TEXT, -- JSON
    after_state TEXT,  -- JSON
    ip_address TEXT,
    correlation_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- IDEMPOTENCY KEY (Domain 17)
CREATE TABLE IF NOT EXISTS processed_webhooks (
    id TEXT PRIMARY KEY,
    stripe_event_id TEXT UNIQUE NOT NULL,
    processed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 5. Middleware Zero Trust (Roteamento Seguro)
O JWT emitido pelo Cloudflare Access será dissecado no Worker, validando não apenas o Audience (`ZERO_TRUST_AUDIENCE`), mas também:
1. Assinatura Criptográfica.
2. Issuer (URL do Access).
3. Expiration / Not-Before.
4. Extração de `role`, `region` e `permissions` para autorização cirúrgica na rota.

## 6. Lógica Logística & Haversine
O `estimatedTravelMinutes` passará a se chamar `estimated_drive_time_heuristic`. O sistema preverá modos logísticos completos (`DIRECT`, `HUB`, `MULTI_HUB`) evitando presunção de que o candidato sempre usa o Hub.

---

> **Aprovação**: Esta ADR v2 sobrepõe todas as especificações prévias de negócio para o projeto BBQ Carioca.
