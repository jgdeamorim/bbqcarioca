sua stack de skills (frontend-design, make-interfaces-feel-better, motion-patterns, gsap-*, copywriting, design-review) é exatamente o time certo. As duas imagens que acabei de gerar definem a direção de fotografia do Brand DNA: brasa/espeto em fundo carvão (hero = desejo) e o churrasqueiro na estação de fogo ao vivo no evento noturno (confiança/status).
🔥 Direção Visual — "Fire & Charcoal"
Derivada do Brand DNA Book e do dourado do logo (sem clichê de bandeira):
:root{
  --charcoal-950:#0B0908;  /* fundo principal */
  --charcoal-900:#141110;  /* seções alternadas */
  --charcoal-800:#1E1917;  /* cards */
  --ember-500:#FF6B35;     /* CTA / fogo / hover */
  --ember-700:#C2410C;     /* gradiente de brasa */
  --gold-400:#D9A441;      /* dourado do logo — bordas, badges, preços */
  --cream-50:#FAF6EE;      /* texto principal */
  --smoke-400:#A69D93;     /* texto secundário */
  --line:rgba(217,164,65,.16); /* bordas 1px */
}

Tipografia: Fraunces 600–900 (display — calor artesanal, ecoa o slab do logo sem virar western kitsch) + Manrope (body) + IBM Plex Mono (eyebrows, preços, labels tipo LIVE FIRE • ON-SITE).
Regras: dark editorial, espaçamento generoso, bordas 1px dourado-fumê, glow de brasa só em hover. Proibido: gradiente indigo/violet, glassmorphism genérico, verde-amarelo bandeira, emoji de fogo.
Motion: partículas de brasa no hero (canvas), reveals com gsap-scrolltrigger, marquee de cortes (PICANHA • COSTELA • LINGUIÇA • PÃO DE ALHO), prefers-reduced-motion respeitado.
🧠 IA + Copy (transcreation EN-first, PT no toggle)
Seção
Gatilho
EN (principal)
PT (toggle)
Hero
Desejo
H1: Authentic Brazilian Churrasco, Fired Live at Your Event. Sub: A professional churrasqueiro brings the fire, the premium cuts and the service — so you can stay with your guests. CTAs: Get My Free Quote (WhatsApp) / See Packages
Churrasco brasileiro de verdade, assado ao vivo no seu evento.
Faixa alívio
Alívio
You host. We master the fire.
Você cuida dos convidados. Nós cuidamos do fogo.
Experiência (3 cards c/ fotos)
Autenticidade
Live Fire Brazilian Style / Premium Cuts / Full Service & Setup
Fogo de chão & espeto / Cortes premium / Serviço completo
Pacotes
Status + ancoragem
Premium Experience US$70–100+/guest (badge Signature, aparece 1º = âncora) → Full BBQ from US$500 (badge Most booked) → The Churrasqueiro US$50–75/h. Nota: Full package for 10 guests starts ~US$600.
Churrasqueiro / BBQ Completo / Experiência Premium
Como funciona
Confiança
1 Tell us about your event → 2 We design your menu → 3 We bring the fire → 4 You enjoy the party
idem brief
Ideal para
—
Backyard gatherings / Birthdays / Corporate events / Weddings
Residências / Aniversários / Confraternizações / Casamentos
Service area
SEO local
Palm Beach County (561), Boca Raton, Miami, Fort Lauderdale, Orlando… (só cidades reais atendidas)
idem
Quote form
Conversão
Campos do brief → botão abre wa.me/15614034603 com mensagem pré-preenchida
idem
SEO: Title: Brazilian BBQ Catering in Florida | BBQ do Carioca — Live-Fire Churrasco for Events · H1 carrega "Brazilian Churrasco" + "Live" · JSON-LD Caterer com telephone +1-561-403-4603, areaServed, priceRange $$–$$$. Insight local: DDI 561 = Palm Beach County — comece as páginas /service-area/ por Palm Beach/Boca Raton, não por Miami.
📋 Mega-Prompt para colar no Grok (ativa suas skills exatas)


Você é Principal Design Engineer + Creative Director. Construa a landing page
single-page "BBQ do Carioca" (Brazilian BBQ Catering — Florida).
ATIVE AS SKILLS: design-brief (parse este brief), frontend-design,
make-interfaces-feel-better, motion-patterns + gsap-scrolltrigger,
frontend-a11y, color-expert (contraste AA no dark), copywriting (polish EN-US),
imagegen/imagen (assets que faltarem), e ao final stitch-loop + design-review
com screenshots before/after. NÃO use 21st.dev, NÃO use shadcn genérico de SaaS.

BRIEF (I-Lang): produto=landing de catering; objetivo=orçamento via WhatsApp
+1 561 403-4603; tom=experiência premium de fogo ao vivo, NUNCA "comida barata".
TOKENS: --charcoal-950:#0B0908; --charcoal-800:#1E1917; --ember-500:#FF6B35;
--gold-400:#D9A441; --cream-50:#FAF6EE; --smoke-400:#A69D93; bordas 1px var(--line).
TYPE: Fraunces (display 600–900), Manrope (body), IBM Plex Mono (eyebrows/preços).
PROIBIDO: gradiente indigo/violet, glassmorphism, verde-amarelo bandeira, emoji.

SEÇÕES + COPY EXATA (não invente texto):
1 HERO — eyebrow mono "LIVE-FIRE BRAZILIAN CHURRASCO • FLORIDA, USA";
H1 "Authentic Brazilian Churrasco, Fired Live at Your Event.";
sub "A professional churrasqueiro brings the fire, the premium cuts and the
service — so you can stay with your guests."; CTAs "Get My Free Quote"
(wa.me/15614034603) e "See Packages"; fundo: foto de espetos sobre brasa em
carvão + partículas de brasa em canvas.
2 FAIXA — "You host. We master the fire."
3 EXPERIÊNCIA — 3 cards: Live Fire Brazilian Style / Premium Cuts /
Full Service & Setup, com fotos estilo editorial noturno.
4 PACOTES (ordem = ancoragem): Premium Experience US$70–100+/guest [Signature];
Full BBQ from US$500 [Most booked]; The Churrasqueiro US$50–75/h.
Bullets conforme material; nota: "for 10 guests, full packages start ~US$600".
5 COMO FUNCIONA — 4 passos numerados em mono.
6 IDEAL PARA — 4 tiles. 7 SERVICE AREA — chips de cidades FL.
8 QUOTE FORM — data, cidade, convidados, horário/duração, carnes,
acompanhamentos, possui churrasqueira? → submit monta mensagem WhatsApp.
9 FOOTER — NAP + toggle PT-BR (hreflang), tagline "Churrasco brasileiro com
sabor, qualidade e atendimento na Flórida."

MOTION: reveals stagger fade+rise (ScrollTrigger), marquee de cortes,
hover = lift + borda ember; respeitar prefers-reduced-motion.
A11y: AA, focus-visible, HTML semântico, alt text com keywords.
SEO: title/meta/H2 com "Brazilian BBQ Catering Florida", "BBQ chef for hire",
"Brazilian churrasco catering"; JSON-LD @type Caterer.
QA FINAL: rode design-review + passe make-interfaces-feel-better
(espaçamentos, hit areas, text wrapping, bordas) e entregue antes/depois.

NOVA SEÇÃO — MEET YOUR CHURRASQUEIRO (entre EXPERIENCE e PACOTES):
Layout 2 colunas. Esquerda: caricatura reskin circular (borda 1px gold,
rotate -3deg, efeito sticker) + abaixo, mini-moldura "arquivo" com o logo
original Bar Resenha Carioca e legenda mono "RIO DE JANEIRO — WHERE IT
STARTED". Direita: eyebrow mono "FROM RIO WITH FIRE"; H2 Fraunces
"The man behind the fire."; copy EN: "Long before Florida, he built his
name the Brazilian way — skewer in one hand and hours of resenha around
the grill. The cold beer stayed in Rio. The fire came with him.";
toggle PT: "Antes da Flórida, ele fez nome do jeito brasileiro — espeto
numa mão e horas de resenha em volta da brasa. A gelada ficou no Rio.
O fogo, ele trouxe."; assinatura "— O Carioca" em itálico display.
VOICE PILLAR: resenha = caloroso, direto, zero corporativo; manter a
palavra "resenha" em itálico no EN, explicada uma única vez.


