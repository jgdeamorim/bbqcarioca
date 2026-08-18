# ADR-0005: Sovereign BBQ Talent & Service Platform Architecture ($0/month Free Tier to Paid Upgrade Roadmap)

* **Status:** Aceito (Accepted)
* **Data:** 2026-08-18
* **Autor:** Jeferson Amorim (Founder) & Antigravity (Pair AI)
* **Domínio:** BBQ do Carioca (`jgdeamorim/bbqcarioca`)
* **Impacto:** Arquitetura CRM Multi-Canal, Email Service Híbrido, Estratégia de TLDs (`.com` vs `.work`), Backend Serverless e Custo $0/mês (Fase 0) ➔ US$5/mês (Fase 1)

---

## Contexto e Problema

O projeto BBQ do Carioca necessita de uma plataforma soberana de recrutamento e gestão de prestadores de serviço de catering na Flórida (Grill Masters, Auxiliares de Fogo, Garçons, Barmans, Coordenadores e Pitmasters).

Ratificou-se que:
1. **`db.json` é proibido para produção**, sendo reservado exclusivamente para mocks e testes unitários locais.
2. **E-mail é o canal oficial primário obrigatório** para o cadastro do candidato, mantendo **WhatsApp e SMS como canais operacionais opcionais**.
3. Em 2026, a Cloudflare oferece o **Cloudflare Email Routing** totalmente gratuito no plano Free (para recepção e redirecionamento de e-mails), enquanto o disparo outbound arbitrário para candidatos via **Cloudflare Email Sending** requer o plano **Workers Paid (US$ 5/mês)** com 3.000 e-mails/mês incluídos.
4. O domínio **`bbqdocarioca.work`** deve ser alocado especificamente para a **Plataforma de Trabalho, Talentos e Operações**, separando-o da marca comercial pública **`bbqdocarioca.com`**.

---

## Decisão de Arquitetura

Decidiu-se adotar a **BBQ Talent & Service Platform** sob uma arquitetura híbrida de custo inicial zero ($0/mês na Fase 0) com roadmap de atualização cirúrgica para US$ 5/mês (Fase 1).

### 🌐 Arquitetura de Domínios e Segregação de Marcas

```text
               MARCA COMERCIAL              PLATAFORMA DE TRABALHO & OPERAÇÕES
            bbqdocarioca.com                     bbqdocarioca.work
                   │                                     │
         ┌─────────┴─────────┐                 ┌─────────┼─────────┐
         ▼                   ▼                 ▼         ▼         ▼
    Landing Page         Orçamentos        /careers   /talent  /services
    (Cliente Final)      (Catering)       Candidatos Talentos Parceiros
                                                         │
                                                         ▼
                                             admin.bbqdocarioca.work
                                             (SuperAdmin Zero Trust)
```

---

## 📧 Arquitetura Híbrida de E-mail & Notificações

```text
Fase 0 ($0/mês - Cloudflare Free)
Candidato Form ➔ Worker ➔ D1 / R2 ➔ Email Routing ➔ Notificação Interna pro Bruno (Sem e-mail outbound pro candidato)

Fase 1 (US$ 5/mês - Workers Paid)
Candidato Form ➔ Worker ➔ D1 / R2 ➔ Cloudflare Email Sending (env.EMAIL.send()) ➔ Confirmation & Status E-mails pro Candidato
```

### 1. Fase 0 ($0/mês — MVP Cloudflare Free Tier):
* **Recepção de E-mails:** Uso do **Cloudflare Email Routing** gratuito para criar endereços institucionais (`careers@bbqdocarioca.work`, `jobs@bbqdocarioca.work`, `contact@bbqdocarioca.work`).
* **Submissão de Candidatura:** O formulário salva no D1 e faz upload no R2. Notifica o administrador (Bruno) sem gerar custo outbound.

### 2. Fase 1 (US$ 5/mês — Upgrade Workers Paid quando houver candidatos reais):
* **Disparo Outbound Nativo:** Ativação do **Cloudflare Email Sending** via `env.EMAIL.send()` no Worker.
* **Benefícios:** Autenticação de domínio SPF, DKIM e DMARC configurada automaticamente na Cloudflare sem necessidade de terceiros (SendGrid, Resend, Mailgun).
* **Franquia Incluída:** 3.000 e-mails/mês incluídos no plano Paid de US$ 5/mês (depois US$ 0,35 por mil e-mails).

### 3. Abstração de Código Desacoplada (`EmailService`):
```typescript
export interface EmailService {
  sendApplicationReceived(candidateEmail: string, candidateName: string): Promise<void>;
  sendApplicationStatusChanged(candidateEmail: string, newStatus: string): Promise<void>;
}

// Configuração controlada por variável de ambiente
const EMAIL_PROVIDER = "CLOUDFLARE";
const EMAIL_ENABLED = env.EMAIL_ENABLED === "true"; // false na Fase 0, true na Fase 1
```

---

## Arquitetura de Canais de Contato & Segurança PII (Privacy-by-Design)

### 1. E-mail Obrigatório + WhatsApp Opcional
* **Campos Obrigatórios:** Nome Completo, E-mail (Canal Oficial), Cidade, Estado, Área de Interesse, Anos de Experiência, Disponibilidade, Idiomas, Autorização Legal de Trabalho nos EUA e Consentimento.
* **Campos Opcionais:** Telefone, WhatsApp (`has_whatsapp`), LinkedIn, Instagram e Upload de Currículo.

### 2. Isenção Total de Dados Sensíveis Desnecessários (Sem SSN no Início)
* **NÃO se solicita SSN (Social Security Number)** nem documentos sensíveis no formulário inicial.
* Pergunta padrão de trabalho nos EUA: `is_legally_authorized_us` (*"Are you legally authorized to work in the United States?"* — YES / NO / REQUIRE_SPONSORSHIP).

### 3. Contact Channels Dinâmicos no SuperAdmin (`admin.bbqdocarioca.work`)
```text
┌─────────────────────────────────────────────────────────┐
│ JOHN SMITH — BBQ CHEF (Orlando, FL)                    │
├─────────────────────────────────────────────────────────┤
│ Email: john@email.com · Phone: +1 561... (WhatsApp: ✓)  │
│ Languages: English / Portuguese · Experience: 6 years   │
│ US Work Authorized: YES · Status: APPROVED              │
├─────────────────────────────────────────────────────────┤
│  [ ✉ EMAIL ]   [ 💬 WHATSAPP (wa.me) ]   [ 📱 SMS ]    │
└─────────────────────────────────────────────────────────┘
```
* **WhatsApp Dispatch (Fase 2 - $0 API Cost):** Protocolo nativo `https://wa.me/phone?text=...` abrindo a conversa no navegador sem pagar Twilio/Z-API.

### 4. Upload Direto via Presigned URLs no R2
* Presigned PUT URLs do R2 enviadas ao navegador para upload direto do PDF/foto sem carregar a CPU do Worker.

### 5. Política de Retenção Configurável (`retention_until`)
* A tabela `talents` armazena `retention_until` para expurgo/anonimização auditada por Cron Trigger mensal.

---

## Schema do Banco de Dados D1 (SQLite)

```sql
-- Tabela Unificada de Talentos e Prestadores
CREATE TABLE IF NOT EXISTS talents (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    whatsapp_phone TEXT,
    has_whatsapp INTEGER DEFAULT 0,
    preferred_contact_method TEXT NOT NULL DEFAULT 'EMAIL', -- EMAIL, WHATSAPP, SMS, PHONE
    city TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'FL',
    talent_type TEXT NOT NULL, -- BBQ Chef, Pitmaster, Grill Cook, Event Staff, Server, Bartender, Caterer, etc.
    opportunity_type TEXT NOT NULL, -- Full-time, Part-time, Contract, Event-based, Seasonal
    experience_years INTEGER NOT NULL,
    specialties TEXT, -- JSON Array: ["Picanha", "Brisket", "Ribs"]
    availability TEXT, -- JSON Array: ["Weekend", "Full-time"]
    languages TEXT NOT NULL, -- JSON Array: ["English", "Portuguese"]
    is_legally_authorized_us TEXT NOT NULL DEFAULT 'YES', -- YES, NO, REQUIRE_SPONSORSHIP
    linkedin_url TEXT,
    instagram_url TEXT,
    status TEXT NOT NULL DEFAULT 'NEW', -- NEW, REVIEWING, SHORTLISTED, INTERVIEW, APPROVED, ACTIVE, REJECTED
    notes TEXT,
    retention_until DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Documentos no R2
CREATE TABLE IF NOT EXISTS talent_documents (
    id TEXT PRIMARY KEY,
    talent_id TEXT NOT NULL,
    document_type TEXT NOT NULL, -- RESUME, PROFILE_PHOTO, PORTFOLIO
    r2_key TEXT NOT NULL,
    file_name TEXT NOT NULL,
    content_type TEXT NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (talent_id) REFERENCES talents(id) ON DELETE CASCADE
);

-- Tabela de Categorias e Serviços Prestados
CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL, -- BBQ Catering, Private Chef, Corporate Events, Backyard BBQ
    description TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Logs de Auditoria
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

## Roadmap de Execução Incremental

```text
Fase 0 ($0/mês - Cloudflare Free)
- Dominio bbqdocarioca.work (Careers) + admin.bbqdocarioca.work (SuperAdmin Zero Trust)
- Cloudflare D1 + R2 + Worker API + Turnstile
- Email Routing para recebimento de e-mails institucionais
- Dashboard com dispatch manual de WhatsApp (wa.me) e e-mail corporativo

Fase 1 (US$ 5/mês - Workers Paid)
- Ativação do Cloudflare Email Sending (env.EMAIL.send()) para confirmação automática de candidaturas, convites para entrevistas e convocações para eventos.

Fase 2 (Operação em Escala)
- Expansão de prestadores de serviço terceirizados (Caterers/Private Chefs) + SMS Dispatch + Analytics.
```
