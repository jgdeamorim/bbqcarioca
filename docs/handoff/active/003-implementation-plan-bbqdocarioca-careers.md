# Implementation Plan: BBQ Carioca Careers (Fase 1 Draft)

**Domínios Consolidados:** `bbqdocarioca.com`, `bbqdocarioca.work`, `admin.bbqdocarioca.work`

Este documento consolida a **Fase 1 (Portal de Talentos/Careers)**, pavimentando o domínio para a integração futura (Customer ➔ Service Request ➔ Quote ➔ Payment ➔ Event). A Fase 1 opera exclusivamente na arquitetura Cloudflare Free Tier ($0/mês).

---

## 1. Enterprise Monorepo Structure

A estrutura foi planejada para escalar sem necessidade de refatoração estrutural futura.

```text
apps/
├── web/                   # Vite React 19 SPA (bbqdocarioca.work)
└── api/                   # Cloudflare Worker
    └── src/
        ├── routes/
        │   ├── careers.ts     # FASE 1
        │   ├── customers.ts   # Reservado FASE 2
        │   ├── services.ts    # Reservado FASE 2
        │   ├── quotes.ts      # Reservado FASE 2
        │   ├── events.ts      # Reservado FASE 2
        │   ├── payments.ts    # Reservado Stripe
        │   ├── scheduling.ts  # Reservado Smart Scheduling
        │   ├── matching.ts    # Reservado Smart Matching
        │   └── feedback.ts    # Reservado Feedback
        ├── domain/
        ├── services/
        ├── repositories/
        ├── middleware/        # Cloudflare Access JWT / Rate Limit
        ├── lib/
        └── schema/            # Zod Validation
```

---

## 2. Banco de Dados D1 (Fase 1 Schema)

O schema da Fase 1 respeita a taxonomia do **DOMAIN-0001**, inserindo a base universal (`persons`, `locations`, `audit_logs`), mas implementando apenas o necessário para a candidatura de staff.

```sql
-- 1. BASE SYSTEM
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

CREATE TABLE locations (
    id TEXT PRIMARY KEY,
    location_type TEXT NOT NULL, -- 'CANDIDATE', ('HUB', 'EVENT' futuros)
    zip_code TEXT NOT NULL,
    latitude REAL,  -- Preenchido via zip_geocodes offline
    longitude REAL
);

-- Tabela Offline de resolução geodésica para MVP (evita APIs pagas)
CREATE TABLE zip_geocodes (
    zip_code TEXT PRIMARY KEY,
    centroid_latitude REAL NOT NULL,
    centroid_longitude REAL NOT NULL
);

-- 2. PEOPLE & TALENTS
CREATE TABLE persons (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL DEFAULT 'CANDIDATE',
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    whatsapp_phone TEXT,
    preferred_contact_method TEXT DEFAULT 'EMAIL', -- 'EMAIL', 'WHATSAPP', 'SMS', 'PHONE'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE talent_profiles (
    id TEXT PRIMARY KEY,
    person_id TEXT UNIQUE NOT NULL,
    location_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'NEW', -- NEW, REVIEWING, SHORTLISTED, INTERVIEW, APPROVED, REJECTED
    operational_status TEXT NOT NULL DEFAULT 'INACTIVE', -- AVAILABLE, LIMITED, UNAVAILABLE, SUSPENDED, INACTIVE
    work_authorization_status TEXT NOT NULL, -- AUTHORIZED, NOT_AUTHORIZED, UNKNOWN
    experience_years INTEGER NOT NULL,
    privacy_policy_version TEXT NOT NULL,
    privacy_accepted_at DATETIME NOT NULL,
    retention_until DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (person_id) REFERENCES persons(id),
    FOREIGN KEY (location_id) REFERENCES locations(id)
);

-- 3. NORMALIZED SKILLS & LANGUAGES
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

-- 4. AVAILABILITY & R2 DOCUMENTS
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
```

---

## 3. Worker API: Segurança & Idempotência

O Worker validará a submissão separando rigidamente os status HTTP.

```typescript
// apps/api/src/routes/careers.ts

export async function submitApplication(request: Request, env: Env) {
  // 1. Idempotency Check (Prevenir duplo POST)
  const idempotencyKey = request.headers.get("x-idempotency-key");
  if (!idempotencyKey) return new Response("Missing Idempotency Key", { status: 400 });

  // 2. Parse & Zod Validation (400 Bad Request)
  const data = await request.json();
  const parsed = schema.safeParse(data);
  if (!parsed.success) return new Response(JSON.stringify(parsed.error), { status: 400 });

  // 3. Turnstile & Rate Limiting (403 Forbidden / 429 Too Many Requests)
  const isValidTurnstile = await verifyTurnstile(parsed.data.turnstileToken, env.TURNSTILE_SECRET);
  if (!isValidTurnstile) return new Response("Bot protection failed", { status: 403 });

  // 4. Duplicate Check by Email (409 Conflict)
  const existingPerson = await env.DB.prepare("SELECT id FROM persons WHERE email = ?").bind(parsed.data.email).first();
  if (existingPerson) return new Response("Application already submitted", { status: 409 });

  // 5. Transaction Batch (D1) & Audit Log
  const personId = crypto.randomUUID();
  const talentProfileId = crypto.randomUUID();
  const locationId = crypto.randomUUID();
  const correlationId = crypto.randomUUID();

  // Haversine/DriveTime: estimated_drive_time_heuristic (calculation_method=HEURISTIC)
  
  try {
    await env.DB.batch([
      env.DB.prepare("INSERT INTO locations ..."),
      env.DB.prepare("INSERT INTO persons ..."),
      env.DB.prepare("INSERT INTO talent_profiles ..."),
      env.DB.prepare("INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, correlation_id) VALUES (?, 'SYSTEM', 'APPLICATION_SUBMITTED', 'talent_profile', ?, ?)").bind(crypto.randomUUID(), talentProfileId, correlationId)
    ]);
  } catch (error: unknown) {
    // 6. DB Failures (500 Internal Server Error)
    console.error(error); // Logs para observabilidade
    return new Response("Internal Server Error", { status: 500 });
  }

  // Resposta segura (Omitindo IDs internos)
  return new Response(JSON.stringify({ success: true, applicationId: correlationId }), { status: 201 });
}
```

---

## 4. Frontend React 19 (Vite SPA)

Como o Frontend é um SPA puro via Vite (Pages), não usaremos `useActionState` fingindo Server Actions. Faremos `fetch` transacional.

```tsx
// apps/web/src/pages/careers/CareersPage.tsx
import { useState } from "react";
import { Turnstile } from '@marsidev/react-turnstile';

export default function CareersPage() {
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [status, setStatus] = useState<"IDLE" | "SUBMITTING" | "SUCCESS" | "ERROR">("IDLE");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnstileToken) return;
    setStatus("SUBMITTING");

    const idempotencyKey = crypto.randomUUID();
    const res = await fetch("https://api.bbqdocarioca.work/v1/careers/apply", {
      method: "POST",
      headers: { "x-idempotency-key": idempotencyKey, "Content-Type": "application/json" },
      body: JSON.stringify({ /* payload */ turnstileToken })
    });

    if (res.ok) setStatus("SUCCESS");
    else setStatus("ERROR"); // Tratar 400/409 apropriadamente
  };

  if (status === "SUCCESS") return <div>Application Submitted Successfully!</div>;

  return (
    <form onSubmit={handleSubmit}>
      {/* ... inputs ... */}
      
      <div className="my-4">
        <label>
          <input type="checkbox" required name="privacy_consent" />
          I agree to the Privacy Policy (v1.0)
        </label>
      </div>

      <Turnstile siteKey="0x4AAAAAA..." onSuccess={(token) => setTurnstileToken(token)} />

      <button disabled={!turnstileToken || status === "SUBMITTING"}>
        {status === "SUBMITTING" ? "Sending..." : "Submit Application"}
      </button>
    </form>
  );
}
```
