# IMPLEMENTATION PLAN 001 — Architecture, Design System & Motion Engine (Vanilla HTML/CSS/JS)

**Projeto:** BBQ do Carioca (Brazilian BBQ Catering — Florida)  
**Status:** PROPOSTO / EM ANÁLISE (SDD Protocol)  
**Autoridade:** Brand DNA Book (`SKILL.md`) + `INITIAL-VISUAL-DIRECTION.md`  

---

## 1. Objetivo Estratégico

Estruturar a refatoração e otimização do arquivo `lp/lp-bbq-carioca-v2_0.html` para converter a Landing Page em uma experiência visual de alto padrão (Fire & Charcoal Edition), garantindo conversão direta para orçamento via WhatsApp (+1 561 403-4603) e total responsividade.

---

## 2. Design System & Tokens (Fire & Charcoal)

Garantir que a folha de estilos contida no `v2_0.html` declare e utilize estritamente a paleta de cores e tipografia da marca:

```css
:root {
  --charcoal-950: #0B0908;  /* Fundo principal (fundo escuro editorial) */
  --charcoal-900: #141110;  /* Seções alternadas */
  --charcoal-800: #1E1917;  /* Cards e containers */
  --ember-500:    #FF6B35;  /* CTA / Fogo / Hover */
  --ember-700:    #C2410C;  /* Gradiente de brasa */
  --gold-400:     #D9A441;  /* Dourado do logo (Bordas, Badges, Preços) */
  --cream-50:     #FAF6EE;  /* Texto principal */
  --smoke-400:    #A69D93;  /* Texto secundário */
  --line:         rgba(217, 164, 65, 0.16); /* Bordas sutis */
}
```

### Tipografia Oficial:
- **Display:** `Fraunces` (600–900) — Elegância artesanal com o peso do churrasco.
- **Body:** `Manrope` (400–600) — Leitura fluida para EN-US / PT-BR.
- **Eyebrows & Preços:** `IBM Plex Mono` — Precisão técnica / estilo catering profissional.

---

## 3. Fases de Execução (SOP / SDD)

### Fase 1: Auditoria de Estrutura & Limpeza (Markup Sanitization)
- Validar seções da página contra a ordem da psicologia de conversão:
  1. `HERO` (Fogo ao vivo + Partículas Canvas)
  2. `FAIXA ALÍVIO` ("You host. We master the fire.")
  3. `EXPERIÊNCIA` (3 Cards editoriais com fotografias)
  4. `MEET YOUR CHURRASQUEIRO` (História do Bruno / Bar Resenha Carioca no Rio)
  5. `PACOTES` (Ancoragem: Signature → Most Booked → Churrasqueiro por hora)
  6. `COMO FUNCIONA` (4 Passos numerados em Mono)
  7. `IDEAL PARA` (Tiles de eventos)
  8. `SERVICE AREA` (Cidades reais da Flórida: Palm Beach, Boca Raton, Miami...)
  9. `QUOTE FORM` (Formulário dinâmico gerador de mensagem no WhatsApp)
  10. `FOOTER` (Tagline + NAP + ISO Lang Switcher)

### Fase 2: Motor de Movimento (Motion Engine & GSAP)
- **Partículas no Hero:** Canvas leve renderizando faíscas sutis subindo da brasa.
- **ScrollTrigger Reveals:** Efeito stagger (fade + rise) em cartões e headlines.
- **Marquee Interativo:** Faixa contínua com cortes nobres (`PICANHA • COSTELA • LINGUIÇA • PÃO DE ALHO`).
- **Acessibilidade:** Suporte total a `@media (prefers-reduced-motion: reduce)`.

### Fase 3: Engenharia do WhatsApp Quote Builder
- O formulário enviará os dados estruturados diretamente para o WhatsApp `+1 561 403-4603`:
  - Data do evento, Cidade/Local, Nº de convidados, Cortes preferidos e Acompanhamentos.

---

## 4. Critérios de Aceite (QA & Compliance)

- [ ] Zero dependências de bibliotecas UI pesadas (manter 100% Vanilla estático/GSAP).
- [ ] Contraste AA verificado em todos os textos sobre o fundo escuro (`--charcoal-950`).
- [ ] Formulário validado em dispositivos móveis.
- [ ] Commit e selo OODA no Redis registrados ao finalizar.
