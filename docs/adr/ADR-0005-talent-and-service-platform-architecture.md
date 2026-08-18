# ADR-0005: Sovereign BBQ Talent & Service Platform Architecture ($0/month Free Tier to Paid Upgrade Roadmap)

* **Status:** Aceito (Accepted)
* **Data:** 2026-08-18
* **Autor:** Jeferson Amorim (Founder) & Antigravity (Pair AI)
* **Domínio:** BBQ do Carioca (`jgdeamorim/bbqcarioca`)
* **Domínios/Subdomínios:** `bbqcarioca.com` (Comercial/Marketing), `bbqcarioca.work` (Candidatos/Careers), `admin.bbqcarioca.work` (SuperAdmin Zero Trust)
* **Impacto:** Location Intelligence, Cross-Docking Hubs, Smart Matching Engine, Field-Service Management, DB D1 Relacional, Especificação Técnica de Baixo Nível (Workers, JWT, Turnstile) e Estratégia de TLDs (`.com` vs `.work`)

---

## Parte I: Contexto de Negócio e Princípios Arquiteturais (Spec-Driven)

O projeto BBQ do Carioca necessita de um **Talent & Field-Service Operations OS** para a operação de catering na Flórida. Na logística de eventos, a distância simples em linha reta entre o candidato e o local do evento é insuficiente. A operação de catering exige a avaliação de **Hubs / Cross-Docks de Logística** (pontos de encontro de equipe, insumos e equipamentos de churrasco), além da estimativa realista de **Distância e Tempo de Deslocamento (Travel Time)** nas rodovias da Flórida.

Ratificou-se que:
1. **`db.json` é expressamente proibido para produção**, sendo reservado apenas para mocks locais.
2. **E-mail é o canal oficial obrigatório**, mantendo **WhatsApp e SMS como canais operacionais opcionais**.
3. A localização do candidato baseia-se no **ZIP Code / Cidade** informados (respeitando a privacidade PII), e **não** na geolocalização do IP do navegador.
4. O cálculo de distância inicial no MVP usa a fórmula matemática de **Haversine no D1/Worker ($0 de APIs de mapas)**.

---

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

## Parte II: Implementação de Baixo Nível (Cloudflare Serverless Ecosystem)

O ecossistema BBQ do Carioca é implantado 100% sobre a infraestrutura global da Cloudflare (Fase 0: Free Tier $0/mês, com roadmap transparente para Workers Paid US$ 5/mês na Fase 1).

### 🌐 1. Topologia de Domínios e Roteamento Edge

```text
                                Cloudflare DNS & Edge
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
bbqcarioca.com                 bbqcarioca.work                 admin.bbqcarioca.work
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

### ⚙️ 2. Configuração Canônica do `wrangler.jsonc`

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
    "ALLOWED_ORIGIN_WORK": "https://bbqcarioca.work",
    "ALLOWED_ORIGIN_ADMIN": "https://admin.bbqcarioca.work",
    "TURNSTILE_SITEKEY": "0x4AAAAAAABbbbbCccccDddd"
  }
}
```

### 💻 3. Especificação do Worker (`src/index.ts`) e Bindings TypeScript

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

### 🛡️ 4. Implementação Técnica dos Módulos Críticos

#### A. Validação de Bot com Cloudflare Turnstile Server-Side
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

#### B. Cálculo Geográfico Haversine no Edge (Worker / SQLite D1 - $0 Cost)
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

#### C. Transações Atômicas Batch no D1
O Worker executa múltiplas transações simultâneas de forma segura (exemplo: Criar Person, Location e Worker em uma única transação no D1):
```typescript
  const batchResults = await env.DB.batch([
    env.DB.prepare(`INSERT INTO locations ...`).bind(...),
    env.DB.prepare(`INSERT INTO persons ...`).bind(...),
    env.DB.prepare(`INSERT INTO workers ...`).bind(...)
  ]);
```

---

## Parte III: Roadmap e Compliance de Privacidade (Florida Privacy Act)

1. **Zero-PDF Friction & R2 Presigned Uploads:** O sistema abandona a prática obsoleta de exigir currículos em PDF (alta fricção). O candidato preenche suas habilidades diretamente num formulário web moderno e amigável (React 19). O Cloudflare R2 via URL assinada é reservado EXCLUSIVAMENTE para uploads de fotos (foto de perfil, portfólio de churrasco ou imagem de certificações), garantindo velocidade e zero parsing de PDFs.
2. **Cron Trigger de Expurgo PII:** Worker configurado com Cron Trigger mensal (`0 0 1 * *`) para deletar permanentemente os arquivos de foto no R2 e registros no D1 de candidatos inativos ou rejeitados há mais de 180 dias.

```text
MVP v1 (Base Soberana + Geocodificação Inicial)
- /careers em bbqcarioca.work (Formulário + Turnstile + Worker + D1)
- Cadastro com ZIP Code/Cidade ➔ Cálculo Haversine ($0 API Maps)
- Tabela `talents` + `locations` + SuperAdmin em admin.bbqcarioca.work (Zero Trust)

Fase 2 (Cross-Dock Hubs & Smart Match Engine)
- Cadastro de Hubs/Bases Operacionais na Flórida
- Cálculo do Triângulo Logístico (Candidato ➔ Hub ➔ Evento)
- Detecção visual de conflitos de horário no Calendário do SuperAdmin

Fase 3 (Multi-Canal & Convocação Rápida)
- Botão WhatsApp Dispatch (wa.me) no SuperAdmin
- Ativação do Cloudflare Email Sending (US$ 5/mês Workers Paid)
```
