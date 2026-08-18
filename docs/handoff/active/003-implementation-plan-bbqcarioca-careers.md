# Implementation Plan: BBQ Carioca Sovereign Careers & Operations Platform

## 1. Visão Geral (Spec-Driven Context)
O BBQ do Carioca evoluiu de uma landing page para um **Workforce & Event Operations Platform** operando na Cloudflare (Free Tier $0/mês). A fundação técnica já foi cristalizada nas ADRs 0005 e 0006 e pela DAG Soberana.

O foco desta implementação é o **Portal de Careers & Talentos (Zero-PDF Friction)**:
- Um formulário web estruturado construído em **React 19 + Vite (SPA)**.
- Um **Cloudflare Worker** interceptando os dados de formulário via `useActionState` e Turnstile.
- Inserções relacionais seguras no **Cloudflare D1**.
- Upload assinado no **Cloudflare R2** exclusivo para fotos e imagens (Zero-PDF).

## 2. Tecnologias & Abordagem (Adsentice Benchmark)
- **Frontend:** React 19, Vite, Tailwind CSS v4, TypeScript, Radix UI ou components inspirados no Shadcn/UI (Dark Mode Materio-like).
- **Backend:** Cloudflare Workers API.
- **Banco de Dados:** Cloudflare D1 (SQLite) com Batch Transactions.
- **Armazenamento:** Cloudflare R2 Presigned URLs.
- **Segurança:** Cloudflare Turnstile Server-side, Haversine Distance Calculation nativo no Edge.

---

## 3. Plano de Fases Cirúrgicas

### Fase 1: Infraestrutura Cloudflare Backend (API & D1)
1. **Configurar o D1 Relacional:**
   - Executar o schema do D1 definido na ADR-0005.
   - Tabelas: `locations`, `hubs`, `talents`, `service_requests`, `event_staff_requirements`, `staff_assignments`, `talent_documents`, `audit_logs`.
2. **Setup Cloudflare Worker (`bbqcarioca-api-worker`):**
   - Configurar o `wrangler.jsonc` com os bindings corretos para D1, R2 e as vars para Turnstile.
   - Implementar o Router base no `fetch` handler.
3. **API de Candidatura (`POST /api/v1/careers/apply`):**
   - Receber dados do formulário multipart/form-data ou JSON.
   - Validar Turnstile Token (`siteverify`).
   - Usar `calculateHaversineDistance()` para encontrar a distância do candidato ao Hub mais próximo.
   - Executar `DB.batch()` para inserir a localização em `locations` e o talento em `talents`.
4. **API de Upload R2 (`POST /api/v1/careers/upload-url`):**
   - Receber a solicitação de upload e retornar uma URL R2 Presigned com validade de 15 minutos para imagens.

### Fase 2: Interface Frontend de Careers (React 19 SPA)
1. **Bootstrap Vite + React 19:**
   - Instalar `@cloudflare/turnstile` ou usar o script diretamente.
   - Configurar Tailwind v4 no pipeline CSS.
2. **O Formulário "Zero-PDF Friction":**
   - Utilizar o novo hook `useActionState` do React 19 para orquestrar a submissão assíncrona.
   - Utilizar `useFormStatus` para capturar `pending` states nos botões sem dependência pesada de Effects.
   - Campos obrigatórios (conforme o spec original): Nome, Email, Cidade, ZIP Code, Função (BBQ Chef, Server, etc.), Anos de Experiência, Idiomas, Disponibilidade e Autorização Legal de Trabalho nos EUA (NUNCA pedir SSN na Fase 0).
   - Campos de Contato: Checkbox explícito para "I use WhatsApp" e campo opcional de celular.
3. **Upload de Mídia (Imagens/Portfólio):**
   - Integração com a API de `/upload-url` antes de submeter o form final, ou envio direto dos blobs caso a imagem seja processada localmente.
4. **Agradecimento & Routing:**
   - Estado de sucesso (Application Received). Apenas informar que entraremos em contato por email se o perfil der match.

### Fase 3: Dashboard Operacional SuperAdmin
1. **Adsentice UI Benchmark:**
   - Usar a mesma ergonomia visual da Adsentice (`admin.bbqcarioca.work`). Bento UI Grid de 4 colunas.
   - Proteger a rota `/admin/*` via Cloudflare Access (Zero Trust). O Worker valida o JWT recebido pelo Header.
2. **Smart Scheduling Board:**
   - Tela de Upcoming Events e Staffing requests.
   - Ação de "Find Talent" que engatilha o SQL de Match Score baseado na distância e restrições.
3. **Canais Intercambiáveis:**
   - Painel do Talento exibindo botões de ação: `[ EMAIL ]`, `[ WHATSAPP ]` (com wa.me manual) e futuramente SMS.

---

## 4. O Código Base do Formulário (React 19 Action)

```tsx
import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";

// Componente botão com pending nativo do form
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="bg-primary px-4 py-2 rounded">
      {pending ? "Sending..." : "Apply Now"}
    </button>
  );
}

// Action submetida ao Worker
async function submitApplication(prevState: any, formData: FormData) {
  // Chamada à API
  const response = await fetch("https://bbqcarioca.work/api/v1/careers/apply", {
    method: "POST",
    body: formData // Worker processa multipart ou convertemos pra JSON
  });
  if (!response.ok) return { error: "Failed to apply." };
  return { success: true };
}

export function CareerForm() {
  const [state, formAction, isPending] = useActionState(submitApplication, null);

  if (state?.success) {
    return <div>Application Received. We will contact you by email.</div>;
  }

  return (
    <form action={formAction}>
      <input type="text" name="fullName" required placeholder="Full Name" />
      <input type="email" name="email" required placeholder="Email Address" />
      <input type="text" name="zipCode" required placeholder="ZIP Code" />
      {/* Cloudflare Turnstile */}
      <div className="cf-turnstile" data-sitekey="0x4AAAAAAA..."></div>
      
      <SubmitButton />
    </form>
  );
}
```

## 5. Regras Rígidas (Doutrinas do Projeto)
1. **Zero PDF:** Nunca permitir upload de `.pdf` ou `.doc`. Extensões bloqueadas no Frontend e R2.
2. **SSN/Privacidade:** Nenhum PII sensível (SSN, ID numbers) pedido no momento da candidatura.
3. **Medido=Verdade:** Nunca construir UI que simule um dado que não está no D1. O SuperAdmin exibe exatamente o que foi gravado e processado no Worker.
4. **Custo $0:** Todo processamento pesado fica na borda (Haversine via SQLite/Worker). Sem invocar APIs externas de rotas no momento de cadastro.
