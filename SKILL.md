---
name: bbq-carioca-landing
description: Master skill for the "BBQ do Carioca" landing page and brand system (Brazilian churrasco catering — Florida, USA). Use when building, editing, reviewing, translating or extending the BBQ landing page, its sections (hero, packages, meet the churrasqueiro, service area, quote form), the WhatsApp quote flow, SEO, ads or brand assets. Triggers: "BBQ landing", "BBQ do Carioca", "Carioca", "churrasco page", "landing do churrasco", "update the landing", "bbq carioca", "brand dna carioca".
---

# BBQ DO CARIOCA — COMPLETE SKILL (v1.0.0)
Single-file source of truth for Landing Page + Brand System

---

## 0. REGRAS DE USO
- Este é o único arquivo da skill. Tudo está contido aqui.
- NUNCA invente copy. Use apenas os textos da seção COPY DECK.
- NUNCA use: frontend-skill genérico, artifacts-builder default, shadcn SaaS, 21st.dev.
- Esta é uma landing editorial premium, não dashboard.
- Tudo deve ser validado contra o Brand DNA abaixo. Se não estiver alinhado, revise ou descarte.
- Idioma de aquisição: EN-US primeiro. PT-BR é transcreation (não tradução literal).

## 1. PIPELINE OBRIGATÓRIO (siga nesta ordem)
1. PARSE ........ design-brief (use este arquivo como brief)
2. SYSTEM ....... color-expert + tokens abaixo
3. BUILD ........ frontend-design (HTML semântico, layout editorial)
4. MOTION ....... motion-patterns + gsap-scrolltrigger + gsap-performance (respeitar prefers-reduced-motion)
5. A11Y ......... frontend-a11y
6. COPY ......... copywriting (polish EN-US + transcreation PT-BR)
7. ASSETS ....... imagegen / imagen + image-enhancer (seguir regras de assets)
8. QA ........... make-interfaces-feel-better → design-review → stitch-loop
9. SEO .......... aplicar Keyword DNA + JSON-LD
10. ADS ......... aplicar Marketing System

---

## 2. BRAND DNA

### Essence
BBQ do Carioca is a professional Brazilian churrasco catering service that fires authentic churrasco live at private and corporate events across Florida.
It transforms Brazilian grilling tradition into a complete hospitality experience so the host can stay with the guests.

**Master line:**  
“Mais que um churrasco, uma experiência inesquecível.”  
“More than a barbecue — an unforgettable experience.”

**Positioning line:**  
Authentic Brazilian Churrasco, Fired Live at Your Event.

### Five Psychological Triggers
1. **Desire** — Visual appetite (premium cuts, live fire, smoke, color)
2. **Trust** — Professionalism, punctuality, founder presence, clear process
3. **Authenticity** — Real Brazilian method (espeto, charcoal, no shortcuts)
4. **Status** — “I gave my guests something special”
5. **Relief** — “You host. We master the fire.”

### Heritage vs Evolution
**Heritage (preserve the soul)**
- Founder Bruno Carioca
- Brazilian hospitality & *resenha* spirit
- Warmth, authenticity, pride of origin
- Ember / fire energy
- Live cooking as spectacle

**Evolution (modernize the expression)**
- From bar identity → professional event catering
- From informal → reliable + premium
- From single location → Florida-wide service
- Current circular emblem = official logo
- Old caricature = storytelling asset only (not primary logo)

### Personality
Authentic • Professional • Hospitable • Proud • Reliable • Appetizing

**Archetype:** The Host (primary) + The Artisan (secondary)

### Voice & Tone
- Warm, direct, zero corporate jargon
- Proud of Brazilian roots without flag clichés
- Confident but never arrogant
- Bilingual: EN-US primary for acquisition, PT-BR natural and close

**Signature line (EN):**  
“The cold beer stayed in Rio. The fire came with him.”

**Signature line (PT):**  
“A gelada ficou no Rio. O fogo, ele trouxe.”

*resenha* (n.) — the untranslatable Brazilian art of good company around the fire.  
(Explain only once in English.)

### Brand Promise
We bring authentic Brazilian churrasco — premium cuts, live fire, professional service — directly to your event anywhere in Florida, so you can enjoy your guests while we master the fire.

### Do / Don’t
**Do**
- Show meat and fire generously
- Communicate Florida-wide coverage
- Speak the language of experience
- Keep Brazilian pride
- Be clear and direct on the CTA
- Put the product (fire + cuts) as the hero

**Don’t**
- Look like a bar or beer brand
- Look like a “Brazil theme party”
- Hide the product behind decoration
- Use generic American BBQ visuals
- Promise what the service does not deliver
- Use green-yellow-blue flag as primary palette
- Use western kitsch, heavy distress, or emoji fire

### Transcreation Rules
- EN-US is the source language for acquisition
- PT-BR is natural Brazilian Portuguese (not literal translation)
- Prefer “Brazilian BBQ Chef” / “Churrasqueiro” according to context
- Never translate “resenha” — keep it and explain once
- Prices and units stay in USD / American event language in EN

---

## 3. DESIGN TOKENS

### Color System
```css
--charcoal-950: #0B0908;   /* deepest background */
--charcoal-900: #141110;   /* main dark surface */
--charcoal-800: #1E1917;   /* elevated dark surface */
--ember-500:    #FF6B35;   /* primary energy / CTA / fire */
--ember-700:    #C2410C;   /* pressed / darker fire */
--gold-400:     #D9A441;   /* accent, highlights, premium */
--cream-50:     #FAF6EE;   /* light text / light surfaces */
--smoke-400:    #A69D93;   /* secondary text / muted */
--line:         rgba(217, 164, 65, 0.16); /* subtle borders */
```

**Semantic usage**
- Backgrounds → charcoal-950 / 900
- Primary text on dark → cream-50
- Secondary text → smoke-400
- CTAs & energy → ember-500
- Premium accents → gold-400

**Forbidden**
- Green + yellow + blue of the Brazilian flag as primary system
- Indigo / violet gradients
- Generic glassmorphism
- Pure white backgrounds for main sections
- Oversaturated neon

### Typography
- **Display (Headlines):** Fraunces (600–900)
- **Body:** Manrope (400–600)
- **Eyebrows / Labels / Prices:** IBM Plex Mono (or system mono)

### Spacing & Motion
- Base unit: 4px / 8px
- Section padding: generous (clamp(4rem, 8vw, 7rem))
- Card radius: 12–16px
- Button radius: 8–999px (pill for primary CTA)
- Borders: 1px solid var(--line)
- Motion: prefer transforms + opacity, 0.35–0.6s, respect prefers-reduced-motion
- Ember glow only on hover/focus

### Accessibility Base
- Text on charcoal must meet WCAG AA
- Focus states clearly visible
- Minimum touch target 44×44px
- Color is never the only indicator

---

## 4. ASSETS RULES

### Hierarchy
1. **Official Circular Emblem** (current logo)  
   → Header, footer, OG, GBP, uniforms, print  
   Never stretch. Always provide monochrome version.

2. **Simplified / Horizontal Logo**  
   → Navigation, mobile header, documents, email

3. **Caricature / Character (Historical Bruno)**  
   → “Meet your churrasqueiro” section, favicon, WhatsApp avatar, merch, storytelling  
   Never replace the official emblem as main logo.

4. **Original Bar Resenha Logo**  
   → Archive / heritage only (“where it started” moment)

### Photography Direction
Priority order:
1. Live fire + skewers with premium cuts (close and appetizing)
2. Professional churrasqueiro in action
3. Guests enjoying / atmosphere
4. Clean professional setup

Style: warm, high-contrast, appetizing light. Real events preferred. Avoid “theme Brazil” decorations.

---

## 5. COPY DECK (EN source / PT transcreation)

### 1. HERO — Trigger: Desire
**Eyebrow**  
EN: LIVE-FIRE BRAZILIAN CHURRASCO • FLORIDA, USA  
PT: CHURRASCO BRASILEIRO AO VIVO • FLÓRIDA, EUA

**H1**  
EN: Authentic Brazilian Churrasco, Fired Live at Your Event.  
PT: Churrasco brasileiro autêntico, assado ao vivo no seu evento.

**Sub**  
EN: A professional churrasqueiro brings the fire, the premium cuts and the full service — so you can stay with your guests.  
PT: Um churrasqueiro profissional leva o fogo, os cortes premium e o serviço completo — você fica com seus convidados.

**CTA Primary** → Get My Free Quote / Pedir Meu Orçamento → wa.me/15614034603  
**CTA Secondary** → See Packages / Ver Pacotes

**Chips**  
EN: On-site live fire · Premium Brazilian cuts · Bilingual EN/PT · Florida-wide  
PT: Fogo ao vivo no local · Cortes brasileiros premium · Bilíngue EN/PT · Toda a Flórida

### 2. FAIXA ALÍVIO — Trigger: Relief
EN: You host. We master the fire.  
PT: Você cuida dos convidados. Nós cuidamos do fogo.

### 3. EXPERIÊNCIA — Trigger: Authenticity (3 cards)
**A. Live Fire, Brazilian Style**  
EN: Skewers over glowing charcoal, the way it’s done in Brazil. No ovens, no shortcuts — the fire is the show.  
PT: Espeto sobre a brasa, do jeito que se faz no Brasil. Sem forno, sem atalho — o fogo é o espetáculo.

**B. Premium Cuts**  
EN: Picanha and hand-selected cuts, seasoned simply, grilled to perfection in front of your guests.  
PT: Picanha e cortes selecionados, temperados com simplicidade e grelhados na frente dos seus convidados.

**C. Full Service & Setup**  
EN: We bring the grill, the structure and the service when you need them. You bring the guests.  
PT: Levamos a churrasqueira, a estrutura e o serviço quando você precisar. Você só chama os convidados.

### 4. MEET YOUR CHURRASQUEIRO — Trigger: Trust
**Eyebrow:** FROM RIO WITH FIRE / DO RIO COM FOGO  
**H2:** The man behind the fire. / O homem por trás do fogo.

**Body EN:**  
Long before Florida, he built his name the Brazilian way — skewer in one hand and hours of *resenha* around the grill. The cold beer stayed in Rio. The fire came with him.  
(*resenha* (n.) — the untranslatable Brazilian art of good company around the fire.)

**Body PT:**  
Antes da Flórida, ele fez nome do jeito brasileiro — espeto numa mão e horas de resenha em volta da brasa. A gelada ficou no Rio. O fogo, ele trouxe.

**Signature:** — O Carioca

### 5. PACOTES — Trigger: Status (Premium first = price anchor)
**[Signature] PREMIUM EXPERIENCE** — US$70–100+ / guest  
Custom menu • Hand-selected premium cuts • Full service & elevated presentation

**[Most booked] FULL BBQ** — from US$500  
Churrasqueiro + full structure • Menu-defined meats & sides • Small/medium events

**THE CHURRASQUEIRO** — US$50–75 / hour  
Professional churrasqueiro • Prep & service • You provide meats & sides

**Example note:** A full package for 10 guests starts around US$600, depending on menu and setup.

### 6. COMO FUNCIONA — 4 steps
1. Tell us about your event → Conte sobre seu evento  
2. We design your menu → Montamos seu cardápio  
3. We bring the fire → Levamos o fogo  
4. You enjoy the party → Você aproveita a festa

### 7. IDEAL PARA
EN: Backyard gatherings · Birthdays · Weddings · Corporate events  
PT: Churrasco em família · Aniversários · Casamentos · Confraternizações

### 8. SERVICE AREA
**Eyebrow:** PROUDLY SERVING FLORIDA / ATENDENDO TODA A FLÓRIDA  
**Chips (real cities only):** Palm Beach County · Boca Raton · West Palm Beach · Miami · Fort Lauderdale · Orlando  
**Line:** Don’t see your city? Ask — we travel for events.

### 9. QUOTE FORM
**H2:** Let’s build your churrasco. / Vamos montar seu churrasco?  
**Fields:** date · city · guests · time/duration · meat preferences · sides · do you have a grill?  
**Button:** Get My Free Quote on WhatsApp / Pedir Orçamento no WhatsApp  
**Microcopy:** Free quote · Reply within 24h · Bilingual EN/PT

### 10. FOOTER
NAP + phone +1 (561) 403-4603  
Tagline PT: “Churrasco brasileiro com sabor, qualidade e atendimento na Flórida.”  
Toggle EN/PT (hreflang) · Florida – USA

---

## 6. KEYWORD DNA

### Positive (high priority)
- BBQ catering near me
- BBQ chef for hire
- Brazilian BBQ catering
- Brazilian churrasco catering
- churrasqueiro brasileiro na Florida
- churrasco brasileiro para festas
- wedding BBQ catering
- backyard BBQ catering
- private BBQ chef
- corporate BBQ catering
- live fire catering
- on-site BBQ catering

### Negative — Absolute
jobs, careers, hiring, salary, grill for sale, smoker, recipes, how to, DIY, free catering, delivery, takeout, fast food

### Negative — Contextual
steakhouse, BBQ restaurant, menu → keep only when followed by catering / wedding / event / party

### On-page mapping
- H1: Authentic Brazilian Churrasco, Fired Live at Your Event
- H2: Brazilian BBQ Catering for Private Events
- H2: BBQ Catering Packages & Pricing in Florida
- H2: BBQ Chef for Hire — How It Works
- H2: Florida Service Area

### JSON-LD base
```json
{
  "@type": "Caterer",
  "name": "BBQ do Carioca",
  "telephone": "+1-561-403-4603",
  "slogan": "Authentic Brazilian Churrasco, Fired Live at Your Event.",
  "priceRange": "$$–$$$",
  "servesCuisine": ["Brazilian barbecue", "Churrasco"],
  "areaServed": ["Palm Beach County", "Boca Raton", "West Palm Beach", "Miami", "Fort Lauderdale", "Orlando"]
}
```

---

## 7. MARKETING SYSTEM

### Big Idea
“THE FIRE CAME WITH HIM.”  
(Rio → Crossing → Your Event)

### Taglines by trigger
- Desire: “Fired live at your event.”
- Relief: “You host. We master the fire.”
- Status: “Your guests will talk about this one.”
- Authenticity: “Not American BBQ with a flag on it. The real thing.”
- Trust: “One WhatsApp message. Zero grills to manage.”

### Pricing Psychology
- Always show Premium first (anchor)
- Then “from US$500” feels accessible
- Reframe: “≈ US$60 per guest — less than a steakhouse dinner”
- Hourly rate = low-friction entry
- Final quote is always custom

### WhatsApp Funnel
- Reply target < 24h
- First reply: greeting EN/PT + 3 questions (date? guests? city?) + probable package range
- Follow-up at 48h and 7 days

---

## 8. QA CHECKLIST (obrigatório antes de entregar)

**Brand Alignment**
- [ ] 5 triggers respected
- [ ] Product (fire + meat) is visually dominant
- [ ] Tone is warm + professional
- [ ] Official emblem used correctly

**Copy & Language**
- [ ] EN-US clean and conversion-oriented
- [ ] PT-BR natural (not literal)
- [ ] “resenha” explained only once
- [ ] CTA points to +1 561 403 4603

**Visual & Tokens**
- [ ] Colors match the token system
- [ ] No forbidden styles
- [ ] Logo has clear space and is not stretched

**Accessibility**
- [ ] WCAG AA contrast
- [ ] Focus states visible
- [ ] Touch targets ≥ 44px
- [ ] prefers-reduced-motion respected

**Conversion**
- [ ] Primary goal = WhatsApp quote
- [ ] Packages in correct order (Premium first)
- [ ] Relief message present

**SEO**
- [ ] Title/meta/H1/H2 correct
- [ ] JSON-LD present
- [ ] NAP consistent

Only deliver when critical items are checked.

---

## 9. CONVERSION OBJECTIVE
Único objetivo da landing: gerar orçamento via WhatsApp  
Número: +1 (561) 403-4603  
Link base: https://wa.me/15614034603

---

**Version:** v1.0.0 — Consolidated single-file skill  
**Last update:** 2026-08-16  
**Status:** Ready for use on grok.com