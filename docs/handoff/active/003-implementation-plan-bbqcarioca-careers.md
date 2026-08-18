# Implementation Plan: BBQ Carioca Sovereign Careers Platform (Fase 1)

## 1. Visão Geral e Contexto Soberano
O projeto "BBQ do Carioca" opera como um **Workforce & Event Operations Platform** sobre infraestrutura 100% Cloudflare (Free Tier $0/mês).

Este documento detalha **nos mínimos detalhes** a implementação tática do módulo fundacional: o **Portal de Talentos e Careers**, aderindo à política de **Zero-PDF Friction** e **Privacy-First** (Nenhum SSN requisitado).

---

## 2. Arquitetura de Diretórios (Enterprise Monorepo)

A estrutura do projeto deve obedecer à taxonomia de um Monorepo, separando nitidamente a Edge API do Frontend estático:

```text
/
├── apps/
│   ├── web/                     # React 19 + Vite (SPA estático via Pages)
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   └── careers/     # Rota /careers (Portal do Candidato)
│   │   │   │       ├── page.tsx
│   │   │   │       └── actions.ts # Lógica de submit encapsulada
│   │   │   ├── components/
│   │   │   │   ├── ui/          # Componentes base (Tailwind v4)
│   │   │   │   └── forms/       # Componentes React 19 (SubmitButton com useFormStatus)
│   │   │   └── lib/
│   │   │       └── utils.ts
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── api/                     # Cloudflare Workers (Backend)
│       ├── src/
│       │   ├── index.ts         # Ponto de entrada (Router e CORS)
│       │   ├── routes/
│       │   │   ├── careers.ts   # Handler para POST /api/v1/careers/apply
│       │   │   └── upload.ts    # Handler para POST /api/v1/careers/upload-url
│       │   ├── lib/
│       │   │   ├── turnstile.ts # Validação de Bot Server-Side
│       │   │   └── haversine.ts # Lógica do Triângulo Logístico ($0 Cost)
│       │   └── schema.ts        # Tipagens Zod das requisições
│       ├── wrangler.jsonc
│       ├── schema.sql           # DDL das tabelas do D1
│       └── package.json
```

---

## 3. Especificação do Banco de Dados (Cloudflare D1)

As tabelas devem ser geradas através do arquivo `apps/api/schema.sql` via `wrangler d1 execute`. O MVP (Fase 1) exige no mínimo 3 tabelas interligadas para suportar a lógica do Triângulo Logístico.

### A. Tabela `locations`
```sql
CREATE TABLE IF NOT EXISTS locations (
    id TEXT PRIMARY KEY,
    location_type TEXT NOT NULL, -- 'CANDIDATE', 'HUB', 'EVENT'
    city TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'FL',
    zip_code TEXT NOT NULL,
    latitude REAL, -- Nulo até que a geocodificação offline preencha
    longitude REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### B. Tabela `talents`
```sql
CREATE TABLE IF NOT EXISTS talents (
    id TEXT PRIMARY KEY,
    primary_location_id TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    whatsapp_phone TEXT,
    preferred_contact_method TEXT NOT NULL DEFAULT 'EMAIL',
    talent_role TEXT NOT NULL, -- 'BBQ Chef', 'Pitmaster', 'Grill Assistant', 'Server'
    experience_years INTEGER NOT NULL,
    languages TEXT NOT NULL, -- JSON Array: '["English", "Portuguese"]'
    is_legally_authorized_us TEXT NOT NULL DEFAULT 'YES',
    retention_until DATETIME, -- Data para o expurgo via Cron Trigger (Privacy Act)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (primary_location_id) REFERENCES locations(id) ON DELETE CASCADE
);
```

### C. Tabela `talent_documents` (Apenas Imagens/Portfólio)
```sql
CREATE TABLE IF NOT EXISTS talent_documents (
    id TEXT PRIMARY KEY,
    talent_id TEXT NOT NULL,
    document_type TEXT NOT NULL, -- 'PROFILE_PHOTO', 'PORTFOLIO_IMAGE'
    r2_key TEXT NOT NULL,
    content_type TEXT NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (talent_id) REFERENCES talents(id) ON DELETE CASCADE
);
```

---

## 4. Cloudflare Worker API (Motor de Submissão)

O Worker atua como o gatekeeper. Ele deve validar o bot via Turnstile ANTES de tocar no D1.

### A. Tipagem Estrita Zod (`apps/api/src/schema.ts`)
```typescript
import { z } from "zod";

export const ApplyCareerSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  hasWhatsapp: z.boolean().default(false),
  city: z.string().min(2),
  zipCode: z.string().min(5),
  talentRole: z.enum(["BBQ Chef", "Pitmaster", "Grill Assistant", "Server", "Bartender"]),
  experienceYears: z.coerce.number().min(0).max(50),
  languages: z.array(z.string()).min(1),
  isLegallyAuthorizedUs: z.boolean(),
  turnstileToken: z.string().min(10)
});
```

### B. Router Principal (`apps/api/src/index.ts`)
```typescript
import { handleCareerApplication } from "./routes/careers";

export interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
  TURNSTILE_SECRET_KEY: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "https://bbqcarioca.work",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        }
      });
    }

    const url = new URL(request.url);
    if (url.pathname === "/api/v1/careers/apply" && request.method === "POST") {
      return await handleCareerApplication(request, env);
    }

    return new Response("Not Found", { status: 404 });
  }
};
```

### C. O Fluxo de Transação (Batch) (`apps/api/src/routes/careers.ts`)
```typescript
import { ApplyCareerSchema } from "../schema";
import { verifyTurnstileToken } from "../lib/turnstile";

export async function handleCareerApplication(request: Request, env: Env) {
  try {
    const rawData = await request.json();
    const data = ApplyCareerSchema.parse(rawData);

    // 1. Defesa Anti-Bot Severa
    const ip = request.headers.get("CF-Connecting-IP") || "";
    const isBot = await verifyTurnstileToken(data.turnstileToken, ip, env.TURNSTILE_SECRET_KEY);
    if (!isBot) {
      return new Response(JSON.stringify({ error: "Bot verification failed" }), { status: 403 });
    }

    // 2. Gerar UUIDs locais
    const locationId = crypto.randomUUID();
    const talentId = crypto.randomUUID();

    // 3. Batch Transaction Segura
    await env.DB.batch([
      env.DB.prepare(`INSERT INTO locations (id, location_type, city, zip_code) VALUES (?, 'CANDIDATE', ?, ?)`)
            .bind(locationId, data.city, data.zipCode),
      env.DB.prepare(`
        INSERT INTO talents (
          id, primary_location_id, full_name, email, phone, whatsapp_phone, preferred_contact_method,
          talent_role, experience_years, languages, is_legally_authorized_us
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
          talentId, locationId, data.fullName, data.email, data.phone, 
          data.hasWhatsapp ? data.phone : null, data.hasWhatsapp ? 'WHATSAPP' : 'EMAIL',
          data.talentRole, data.experienceYears, JSON.stringify(data.languages), 
          data.isLegallyAuthorizedUs ? 'YES' : 'NO'
        )
    ]);

    return new Response(JSON.stringify({ success: true, talentId }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Invalid data or Server Error" }), { status: 400 });
  }
}
```

---

## 5. Interface React 19 Frontend (SPA / careers)

Adotando as novas primitivas do React 19 (`useActionState` e `useFormStatus`) para eliminar a necessidade de gerenciar o `isSubmitting` via `useState` e `useEffect`.

### A. O Componente Submit Button (`components/forms/SubmitButton.tsx`)
```tsx
import { useFormStatus } from "react-dom";

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      disabled={pending} 
      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex justify-center items-center"
    >
      {pending ? (
        <span className="animate-pulse">Processing Application...</span>
      ) : (
        "Submit Application"
      )}
    </button>
  );
}
```

### B. O Formulário Zero-PDF (`pages/careers/page.tsx`)
```tsx
import { useActionState } from "react";
import { submitApplicationAction } from "./actions";
import { SubmitButton } from "../../components/forms/SubmitButton";

export default function CareersPage() {
  const [state, formAction] = useActionState(submitApplicationAction, { success: false, error: null });

  if (state.success) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-zinc-900 border border-zinc-800 rounded-xl text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Application Received</h2>
        <p className="text-zinc-400">Thank you for your interest in BBQ do Carioca. We'll contact you by email if your profile matches an upcoming opportunity.</p>
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto mt-12 p-6">
      <h1 className="text-3xl font-bold text-white mb-8">Join the BBQ Crew</h1>
      
      {state.error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-6 bg-zinc-900 p-8 rounded-xl border border-zinc-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Full Name</label>
            <input type="text" name="fullName" required className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Email Address</label>
            <input type="email" name="email" required className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-white" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">City</label>
            <input type="text" name="city" required placeholder="Boca Raton" className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">ZIP Code</label>
            <input type="text" name="zipCode" required className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-white" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Primary Role</label>
          <select name="talentRole" required className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-white">
            <option value="BBQ Chef">BBQ Chef</option>
            <option value="Pitmaster">Pitmaster</option>
            <option value="Grill Assistant">Grill Assistant</option>
            <option value="Server">Server</option>
            <option value="Bartender">Bartender</option>
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <input type="checkbox" name="isLegallyAuthorizedUs" value="true" required className="w-5 h-5 bg-zinc-950 border-zinc-800 rounded" />
          <label className="text-sm text-zinc-300">I am legally authorized to work in the United States.</label>
        </div>

        {/* Turnstile injetado aqui via hook de ref ou lib react-turnstile */}
        <input type="hidden" name="turnstileToken" id="turnstile-token-input" />

        <SubmitButton />
      </form>
    </main>
  );
}
```

### C. Ação Cliente (`pages/careers/actions.ts`)
```typescript
export async function submitApplicationAction(prevState: any, formData: FormData) {
  try {
    const payload = {
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      city: formData.get("city"),
      zipCode: formData.get("zipCode"),
      talentRole: formData.get("talentRole"),
      experienceYears: Number(formData.get("experienceYears") || 0),
      languages: ["English"], // Na UI final, capturar array de checkboxes
      isLegallyAuthorizedUs: formData.get("isLegallyAuthorizedUs") === "true",
      hasWhatsapp: false, // Expansão na UI
      turnstileToken: formData.get("turnstileToken"),
    };

    const response = await fetch("https://bbqcarioca.work/api/v1/careers/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const resData = await response.json().catch(() => ({}));
      return { success: false, error: resData.error || "Failed to submit application. Please try again." };
    }

    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: "Network error. Please verify your connection." };
  }
}
```
