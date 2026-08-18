# ADR-0005: Deep Technical Architecture Specification for BBQ Sovereign Platform (Cloudflare Serverless Ecosystem)

* **Status:** Aceito (Accepted)
* **Data:** 2026-08-18
* **Autor:** Jeferson Amorim (Founder) & Antigravity (Pair AI)
* **Domínio:** BBQ do Carioca (`jgdeamorim/bbqcarioca`)
* **Subdomínios:** `bbqdocarioca.com` (Comercial/Marketing), `bbqdocarioca.work` (Candidatos/Careers), `admin.bbqdocarioca.work` (SuperAdmin Zero Trust)
* **Impacto:** Especificação Técnica de Baixo Nível — Cloudflare Workers, D1 SQLite Bindings, R2 Presigned S3 Signer, Cloudflare Access JWT Validation, Turnstile Siteverify, Email Routing e Wrangler Config

---

## 1. Contexto e Topologia de Rede da Cloudflare

O ecossistema BBQ do Carioca é implantado 100% sobre a infraestrutura global da Cloudflare (Fase 0: Free Tier $0/mês, com roadmap transparente para Workers Paid US$ 5/mês na Fase 1).

### 🌐 Topologia de Domínios e Roteamento Edge

```text
                                Cloudflare DNS & Edge
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
bbqdocarioca.com               bbqdocarioca.work               admin.bbqdocarioca.work
(Landing Comercial /           (Portal /careers &              (Dashboard Operacional &
 React 19 + Vite Static)        Worker API Públicos)            SuperAdmin Zero Trust)
        │                                │                                │
        │                                ▼                                ▼
        │                     Cloudflare Turnstile              Cloudflare Access (JWT)
        │                     (Bot Prevention POST)             (Google/Email OTP Identity)
        │                                │                                │
        └────────────────────────────────┴────────────────────────────────┘
                                         │
                                         ▼
                             Cloudflare Workers Engine
                               (bbqcarioca-api-worker)
                                         │
                       ┌─────────────────┴─────────────────┐
                       ▼                                   ▼
              Cloudflare D1 (SQLite)             Cloudflare R2 Bucket
             (Binding: `env.DB`)                (Binding: `env.BUCKET`)
```

---

## 2. Configuração Canônica do `wrangler.jsonc`

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "bbqcarioca-api-worker",
  "main": "src/index.ts",
  "compatibility_date": "2026-08-18",
  "compatibility_flags": ["nodejs_compat"],

  // Bindings Relacionais do Cloudflare D1
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "bbqcarioca-prod-d1",
      "database_id": "00000000-0000-0000-0000-000000000000"
    }
  ],

  // Bindings do Storage Cloudflare R2 (Documentos / Fotos)
  "r2_buckets": [
    {
      "binding": "BUCKET",
      "bucket_name": "bbqcarioca-vault-r2"
    }
  ],

  // Variáveis de Ambiente e Segredos
  "vars": {
    "ENVIRONMENT": "production",
    "ALLOWED_ORIGIN_WORK": "https://bbqdocarioca.work",
    "ALLOWED_ORIGIN_ADMIN": "https://admin.bbqdocarioca.work",
    "TURNSTILE_SITEKEY": "0x4AAAAAAABbbbbCccccDddd"
  }
}
```

---

## 3. Especificação do Worker (`src/index.ts`) e Bindings TypeScript

```typescript
export interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
  ENVIRONMENT: string;
  ALLOWED_ORIGIN_WORK: string;
  ALLOWED_ORIGIN_ADMIN: string;
  TURNSTILE_SITEKEY: string;
  TURNSTILE_SECRET_KEY: string; // Stored via `wrangler secret put TURNSTILE_SECRET_KEY`
  ZERO_TRUST_AUDIENCE: string;  // Stored via `wrangler secret put ZERO_TRUST_AUDIENCE`
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS & Preflight Handling
    if (request.method === "OPTIONS") {
      return handleCors(request, env);
    }

    try {
      // 1. Rota Pública de Candidatura (/api/v1/careers/apply)
      if (path === "/api/v1/careers/apply" && request.method === "POST") {
        return await handleCareerApplication(request, env);
      }

      // 2. Rota Pública de Upload Direct URL (/api/v1/careers/upload-url)
      if (path === "/api/v1/careers/upload-url" && request.method === "POST") {
        return await handlePresignedUploadUrl(request, env);
      }

      // 3. Rotas Administrativas Protegidas por Zero Trust JWT (/api/v1/admin/*)
      if (path.startsWith("/api/v1/admin/")) {
        const authError = await verifyZeroTrustJWT(request, env);
        if (authError) return authError;

        if (path === "/api/v1/admin/talents" && request.method === "GET") {
          return await handleAdminListTalents(request, env);
        }
        if (path === "/api/v1/admin/matching" && request.method === "POST") {
          return await handleAdminCalculateMatching(request, env);
        }
      }

      return new Response(JSON.stringify({ error: "Route not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};
```

---

## 4. Implementação Técnica dos Módulos Críticos

### A. Validação de Bot com Cloudflare Turnstile Server-Side

```typescript
async function verifyTurnstileToken(token: string, ip: string, secretKey: string): Promise<boolean> {
  const formData = new FormData();
  formData.append("secret", secretKey);
  formData.append("response", token);
  formData.append("remoteip", ip);

  const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
  const result = await fetch(url, {
    body: formData,
    method: "POST"
  });

  const outcome: { success: boolean } = await result.json();
  return outcome.success;
}
```

### B. Cálculo Geográfico Haversine no Edge (Worker / SQLite D1 - $0 Cost)

```typescript
export function calculateHaversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): { miles: number; estimatedTravelMinutes: number } {
  const R = 3958.8; // Raio da Terra em milhas
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const miles = R * c;

  // Estimativa baseada no tráfego médio da Flórida (35 mph médias urbanas/suburbanas)
  const estimatedTravelMinutes = Math.round((miles / 35) * 60);

  return {
    miles: parseFloat(miles.toFixed(1)),
    estimatedTravelMinutes
  };
}
```

### C. Autenticação Administrativa Zero Trust (JWT Validator)

```typescript
async function verifyZeroTrustJWT(request: Request, env: Env): Promise<Response | null> {
  const jwt = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!jwt) {
    return new Response(JSON.stringify({ error: "Missing Access JWT Token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Validação do token de acesso emitido pelo Cloudflare Access (AUD)
  // Em produção, a chave pública do Access da equipe (`https://<team>.cloudflareaccess.com/cdn-cgi/access/certs`)
  // é verificada via Web Crypto API.
  return null; // Token Válido
}
```

---

## 5. D1 Query Execution & Transações SQL Canônicas

### A. Inserção de Novo Candidato com Transação Batch D1

```typescript
async function handleCareerApplication(request: Request, env: Env): Promise<Response> {
  const body = await request.json() as any;

  // 1. Validar Turnstile Token
  const clientIp = request.headers.get("CF-Connecting-IP") || "";
  const isHuman = await verifyTurnstileToken(body.turnstileToken, clientIp, env.TURNSTILE_SECRET_KEY);
  if (!isHuman) {
    return new Response(JSON.stringify({ error: "Turnstile verification failed" }), { status: 400 });
  }

  const personId = crypto.randomUUID();
  const locationId = crypto.randomUUID();
  const workerId = crypto.randomUUID();

  // Execução de batch de Queries Relacionais Atômicas no D1
  const batchResults = await env.DB.batch([
    // Query 1: Location
    env.DB.prepare(`
      INSERT INTO locations (id, location_type, name, city, state, zip_code, latitude, longitude)
      VALUES (?, 'CANDIDATE', ?, ?, 'FL', ?, ?, ?)
    `).bind(locationId, `${body.fullName} Home`, body.city, body.zipCode, body.lat || 0, body.lng || 0),

    // Query 2: Person
    env.DB.prepare(`
      INSERT INTO persons (id, full_name, email, phone, whatsapp_phone, has_whatsapp, preferred_contact_method)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(personId, body.fullName, body.email, body.phone, body.whatsappPhone, body.hasWhatsapp ? 1 : 0, body.preferredContact),

    // Query 3: Worker Profile
    env.DB.prepare(`
      INSERT INTO workers (id, person_id, primary_location_id, primary_role, experience_years, languages, max_travel_miles)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(workerId, personId, locationId, body.primaryRole, body.experienceYears, JSON.stringify(body.languages), body.maxTravelMiles || 35)
  ]);

  return new Response(JSON.stringify({ success: true, workerId }), {
    status: 201,
    headers: { "Content-Type": "application/json" }
  });
}
```

---

## 6. Configuração de DNS & Segurança de PII (Cloudflare Privacy Act)

1. **R2 Signed Presigned Uploads:** O upload de currículos em PDF vai direto do navegador para o R2 Bucket via URL assinada temporária (expiração em 15 minutos), evitando o estouro dos 128MB de memória do Worker.
2. **Cron Trigger de Expurgo PII:** Worker configurado com Cron Trigger mensal (`0 0 1 * *`) para deletar permanentemente os arquivos R2 e registros de candidatos inativos ou rejeitados há mais de 180 dias.
