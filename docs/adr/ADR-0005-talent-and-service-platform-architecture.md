# ADR-0005: Sovereign BBQ Talent & Service Platform Architecture ($0/month Free Tier)

* **Status:** Aceito (Accepted)
* **Data:** 2026-08-18
* **Autor:** Jeferson Amorim (Founder) & Antigravity (Pair AI)
* **Domínio:** BBQ do Carioca (`jgdeamorim/bbqcarioca`)
* **Impacto:** Arquitetura CRM Multi-Canal, Backend/DB Serverless, Segurança PII, Custos de Operação ($0) e Rede de Talentos/Prestadores

---

## Contexto e Problema

O projeto BBQ do Carioca necessita de um sistema soberano de recrutamento e gestão de prestadores de serviço de catering na Flórida (Grill Masters, Auxiliares de Fogo, Garçons, Barmans, Coordenadores e Pitmasters).

Ratificou-se que **o `db.json` é expressamente proibido para o ambiente de produção**, sendo reservado exclusivamente para mocks e testes unitários locais. 

Além disso, definiu-se que a plataforma não deve ser um simples "sistema de WhatsApp" nem depender de APIs pagas de terceiros (Twilio/Z-API). Ela deve ser um **Talent & Service CRM proprietário do BBQ do Carioca**, onde **E-mail é o canal oficial obrigatório do MVP** e canais adicionais (WhatsApp, SMS, Ligação) são **opcionais e intercambiáveis**.

---

## Decisão de Arquitetura

Decidiu-se adotar a **BBQ Talent & Service Platform** rodando 100% no plano Free da Cloudflare ($0/mês), conectando a stack **TypeScript ➔ Cloudflare Worker ➔ D1 (SQL) ➔ R2 (Blobs) ➔ Zero Trust Access**.

### 📊 Validação de Cotas e Custo Inicial ($0/mês)

```text
                 BBQ TALENT & SERVICE PLATFORM
                               │
               ┌───────────────┴───────────────┐
               │                               │
            WEBSITE                          ADMIN
     bbqdocarioca.com/careers        admin.bbqdocarioca.com
               │                               │
           Turnstile                       Zero Trust
               │                               │
               └───────────────┬───────────────┘
                               ▼
                          Worker API
                         (TypeScript)
                               │
             ┌─────────────────┴─────────────────┐
             ▼                                   ▼
        D1 (SQLite)                          R2 Storage
    candidatos / prestadores              resumes (PDF) / fotos
```

* **Cloudflare Workers:** 100.000 requests/dia grátis.
* **Cloudflare D1:** 5.000.000 lidas/dia + 100.000 escritas/dia + 5 GB de banco SQL grátis.
* **Cloudflare R2:** 10 GB de armazenamento + Operações Class A/B + **Zero Egress Fees** ($0 taxa de saída).
* **Cloudflare Access (Zero Trust):** Proteção administrativa gratuita até 50 usuários.
* **Fail-Safe:** Documentado que exceder a cota diária causa pausa temporária nas chamadas até o reset automático, **sem nenhuma cobrança de surpresa**.

---

## Arquitetura de Canais de Contato & Segurança PII (Privacy-by-Design)

### 1. E-mail como Canal Oficial & WhatsApp Opcional
Para evitar a exclusão de candidatos americanos (onde cerca de 1/3 usa WhatsApp, enquanto entre hispânicos e brasileiros na Flórida o uso é de 56%+), o formulário divide os campos em:

* **Obrigatórios:** Nome Completo, E-mail (Canal Oficial), Cidade, Estado, Área de Interesse, Anos de Experiência, Disponibilidade, Idiomas, Autorização Legal de Trabalho nos EUA e Consentimento.
* **Opcionais:** Telefone, WhatsApp (`has_whatsapp`), LinkedIn, Instagram e Upload de Currículo.

### 2. Isenção Total de Dados Sensíveis Desnecessários (Sem SSN no Início)
* **NÃO se solicita SSN (Social Security Number)** nem documentos sensíveis no formulário inicial.
* Solicita-se apenas a autorização legal padrão nos EUA: `is_legally_authorized_us` (*"Are you legally authorized to work in the United States?"* — YES / NO / REQUIRE_SPONSORSHIP).
* Documentações contratuais formais serão solicitadas apenas em etapa posterior e apropriada de contratação.

### 3. Contact Channels Dinâmicos no SuperAdmin
No painel do administrador (`admin.bbqdocarioca.com`), cada perfil renderiza os botões de contato dinamicamente conforme os canais informados:

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
* **WhatsApp Dispatch (Fase 2 - $0 API Cost):** Usa o protocolo nativo `https://wa.me/phone?text=...` abrindo a conversa no navegador sem pagar Twilio/Z-API.

### 4. Upload Direto via Presigned URLs no R2
* O navegador solicita uma Presigned PUT URL ao Worker e faz o upload do PDF/foto **diretamente para o R2 da Cloudflare**, desacoplando o I/O pesado de mídias da CPU do Worker.

### 5. Política de Retenção Configurável (`retention_until`)
* A tabela `talents` armazena uma coluna de controle `retention_until`. A rotina mensal de Cron Trigger avalia a política de retenção antes de arquivar ou remover registros.

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

## Roadmap de Implementação Incremental

```text
MVP v1 (Escopo Enxuto)
/careers ➔ Form ➔ POST /api/applications ➔ Cloudflare D1 ➔ SuperAdmin (Zero Trust + Email Contact)

Fase 2 (Canais Multi-Opcionais)
SuperAdmin Dispatch WhatsApp (wa.me) + Upload Direto no R2 via Presigned URLs

Fase 3 (Expansão de Prestadores)
Dashboard de Prestadores de Serviço (Caterers/Private Chefs) + SMS Dispatch
```
