-- BBQ do Carioca Sovereign Schema (D1)
-- Baseado em DOMAIN-0001

-- ==========================================
-- 1. OBSERVABILITY & SYSTEM CORE
-- ==========================================
CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY,
    actor_id TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    before_state TEXT,
    after_state TEXT,
    ip_address TEXT,
    correlation_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    id TEXT PRIMARY KEY,
    recipient_id TEXT NOT NULL,
    channel TEXT NOT NULL, -- 'EMAIL', 'WHATSAPP'
    status TEXT NOT NULL, -- 'PENDING', 'SENT', 'FAILED'
    payload TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. GEOGRAPHICAL LOGISTICS
-- ==========================================
CREATE TABLE locations (
    id TEXT PRIMARY KEY,
    location_type TEXT NOT NULL, -- 'CANDIDATE', 'HUB', 'EVENT', 'CROSSDOCK'
    zip_code TEXT NOT NULL,
    latitude REAL,  
    longitude REAL
);

-- Tabela Offline de resolução geodésica para MVP (evita APIs de mapas em massa)
CREATE TABLE zip_geocodes (
    zip_code TEXT PRIMARY KEY,
    centroid_latitude REAL NOT NULL,
    centroid_longitude REAL NOT NULL
);

-- ==========================================
-- 3. IDENTITY HUB (PERSONS)
-- ==========================================
CREATE TABLE persons (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL DEFAULT 'CANDIDATE', -- 'CANDIDATE', 'STAFF', 'CUSTOMER', 'PROVIDER'
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    whatsapp_phone TEXT,
    preferred_contact_method TEXT DEFAULT 'EMAIL', -- 'EMAIL', 'WHATSAPP', 'SMS', 'PHONE'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE privacy_consents (
    id TEXT PRIMARY KEY,
    person_id TEXT NOT NULL,
    privacy_policy_version TEXT NOT NULL,
    accepted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (person_id) REFERENCES persons(id)
);

-- ==========================================
-- 4. TALENT PROFILES (STAFF)
-- ==========================================
CREATE TABLE talent_profiles (
    id TEXT PRIMARY KEY,
    person_id TEXT UNIQUE NOT NULL,
    location_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'NEW', -- 'NEW', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW', 'APPROVED', 'REJECTED'
    operational_status TEXT NOT NULL DEFAULT 'INACTIVE', -- 'AVAILABLE', 'LIMITED', 'UNAVAILABLE', 'SUSPENDED', 'INACTIVE'
    work_authorization_status TEXT NOT NULL, -- 'AUTHORIZED', 'NOT_AUTHORIZED', 'UNKNOWN'
    experience_years INTEGER NOT NULL,
    retention_until DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (person_id) REFERENCES persons(id),
    FOREIGN KEY (location_id) REFERENCES locations(id)
);

CREATE TABLE skills (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE talent_skills (
    talent_profile_id TEXT NOT NULL,
    skill_id TEXT NOT NULL,
    PRIMARY KEY (talent_profile_id, skill_id),
    FOREIGN KEY (talent_profile_id) REFERENCES talent_profiles(id),
    FOREIGN KEY (skill_id) REFERENCES skills(id)
);

CREATE TABLE languages (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL -- 'EN', 'PT', 'ES'
);

CREATE TABLE talent_languages (
    talent_profile_id TEXT NOT NULL,
    language_id TEXT NOT NULL,
    proficiency TEXT NOT NULL, -- 'BASIC', 'CONVERSATIONAL', 'FLUENT', 'NATIVE'
    PRIMARY KEY (talent_profile_id, language_id),
    FOREIGN KEY (talent_profile_id) REFERENCES talent_profiles(id),
    FOREIGN KEY (language_id) REFERENCES languages(id)
);

CREATE TABLE talent_availability (
    id TEXT PRIMARY KEY,
    talent_profile_id TEXT NOT NULL,
    date DATE NOT NULL,
    start_time TEXT,
    end_time TEXT,
    availability_type TEXT NOT NULL,
    FOREIGN KEY (talent_profile_id) REFERENCES talent_profiles(id)
);

CREATE TABLE talent_documents (
    id TEXT PRIMARY KEY,
    talent_profile_id TEXT NOT NULL,
    document_type TEXT NOT NULL, -- 'RESUME_PDF', 'FOOD_CERT', 'PORTFOLIO_IMAGE'
    r2_object_key TEXT NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (talent_profile_id) REFERENCES talent_profiles(id)
);

-- ==========================================
-- 5. COMMERCIAL DEMAND & EVENTS (FASE 2/3)
-- ==========================================
CREATE TABLE services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    base_price REAL
);

CREATE TABLE service_requests (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    location_id TEXT NOT NULL,
    service_id TEXT NOT NULL,
    event_date DATE NOT NULL,
    guests INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES persons(id),
    FOREIGN KEY (location_id) REFERENCES locations(id),
    FOREIGN KEY (service_id) REFERENCES services(id)
);

CREATE TABLE quotes (
    id TEXT PRIMARY KEY,
    service_request_id TEXT NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT', -- 'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_request_id) REFERENCES service_requests(id)
);

CREATE TABLE events (
    id TEXT PRIMARY KEY,
    quote_id TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT', -- 'DRAFT', 'QUOTED', 'BOOKED', 'COMPLETED', 'CANCELLED'
    scheduled_start DATETIME,
    scheduled_end DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quote_id) REFERENCES quotes(id)
);

CREATE TABLE event_requirements (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    skill_id TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (skill_id) REFERENCES skills(id)
);

-- ==========================================
-- 6. ORCHESTRATION (ASSIGNMENTS)
-- ==========================================
CREATE TABLE assignments (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    talent_profile_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'CONFIRMED', 'COMPLETED', 'NO_SHOW'
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (talent_profile_id) REFERENCES talent_profiles(id)
);

-- ==========================================
-- 7. FINANCIAL (STRIPE INTEGRATION)
-- ==========================================
CREATE TABLE payments (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    amount REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'UNPAID', -- 'UNPAID', 'PAID', 'PARTIALLY_PAID', 'REFUNDED'
    stripe_payment_intent_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id)
);

CREATE TABLE financial_transactions (
    id TEXT PRIMARY KEY,
    payment_id TEXT NOT NULL,
    amount REAL NOT NULL,
    transaction_type TEXT NOT NULL, -- 'CHARGE', 'REFUND', 'PAYOUT'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id)
);

CREATE TABLE processed_webhooks (
    stripe_event_id TEXT PRIMARY KEY,
    processed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 8. FEEDBACK & REPUTATION
-- ==========================================
CREATE TABLE feedback (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    reviewer_id TEXT NOT NULL,
    reviewee_id TEXT NOT NULL,
    rating INTEGER NOT NULL, -- 1 to 5
    comments TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (reviewer_id) REFERENCES persons(id),
    FOREIGN KEY (reviewee_id) REFERENCES persons(id)
);

CREATE TABLE reviews (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    public_rating INTEGER NOT NULL,
    public_comment TEXT,
    approved_for_marketing BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (customer_id) REFERENCES persons(id)
);
