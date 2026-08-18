# DOMAIN-0001: BBQ Talent & Field-Service Domain Model

**Status:** Draft
**Domínio:** BBQ do Carioca (`bbqdocarioca.work`)

O modelo conceitual abaixo representa a taxonomia soberana do BBQ do Carioca, separando estruturalmente Pessoas, Solicitações, Financeiro e Logística.

---

## 1. Pessoas & Identidade (Identity Hub)
* **Person:** Entidade raiz (id, full_name, email, phone, whatsapp_phone, preferred_contact_method). Pode assumir múltiplos papéis.
* **Customer:** Uma `Person` que contrata serviços.
* **Provider:** Uma `Person` (ou B2B) que fornece infraestrutura/materiais.
* **TalentProfile:** Perfil operacional de uma `Person`. Contém `status` (NEW, REVIEWING, SHORTLISTED, APPROVED, REJECTED) e `operational_status` (AVAILABLE, LIMITED, UNAVAILABLE, SUSPENDED, INACTIVE). Contém `work_authorization_status` (AUTHORIZED, NOT_AUTHORIZED, UNKNOWN).
* **Skill:** Catálogo mestre de habilidades (ex: "Pitmaster", "Brisket").
* **TalentSkill:** Tabela pivô de proficiência (`talent_id`, `skill_id`).
* **Language:** Catálogo de idiomas.
* **TalentLanguage:** Tabela pivô de fluência (`talent_id`, `language_id`, `proficiency`).
* **Availability:** Janelas de tempo do talento (`talent_id`, `date`, `start_time`, `end_time`, `availability_type`).
* **PrivacyConsent:** Aceite de políticas (`person_id`, `privacy_policy_version`, `accepted_at`).

## 2. Demanda Comercial & Operacional
* **Service:** Catálogo base ("BBQ Catering").
* **ServiceRequest:** A demanda geradora (`customer_id`, `location_id`, `date`, `guests`, `staff_requested`).
* **Quote:** Orçamento gerado pelo Pricing Engine (`service_request_id`, status: DRAFT, PENDING_APPROVAL, APPROVED).
* **Order / Event:** A consolidação executável (`quote_id`, status: DRAFT, QUOTED, BOOKED, COMPLETED, CANCELLED).
* **EventRequirement:** As necessidades logísticas/humanas específicas do evento.

## 3. Logística Geográfica
* **Location:** Coordenadas lat/lon de um ponto de interesse (`location_type`: CANDIDATE, HUB, EVENT).
* **ZipGeocode:** Tabela offline estática para o MVP traduzir ZIP Codes em centroids (evitando chamadas à API de Mapas).
* **Hub / CrossDock:** Instância de Localização Operacional com Capacidade e Horários.

## 4. Orquestração (Matching & Scheduling)
* **Assignment:** O vínculo final entre o Talento, o Hub e o Evento.

## 5. Financeiro
* **Payment:** O estado do pagamento do cliente (`UNPAID`, `PAID`, `PARTIALLY_PAID`, `REFUNDED`).
* **FinancialTransaction:** Logs financeiros individuais, reembolsos, payouts.
* **ProcessedWebhook:** Tabela de idempotência (`stripe_event_id`) para garantir robustez.

## 6. Feedback & Reputação
* **Feedback:** Avaliação bidirecional privada.
* **Review:** Avaliação pública e métricas sociais.
* **Reputation / ReliabilityScore:** O impacto consolidado no ranking do talento.

## 7. Observabilidade
* **AuditLog:** Histórico estrito (`actor_id`, `action`, `entity_type`, `before`, `after`, `correlation_id`).
* **Notification:** Histórico de envio de e-mails/WhatsApp.
