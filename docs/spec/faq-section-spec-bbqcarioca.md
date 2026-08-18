# Especificação Técnica: Seção de FAQ (Perguntas Frequentes) — BBQ Carioca

> **Projeto:** BBQ Carioca (`jgdeamorim/bbqcarioca`)  
> **Objetivo:** Aumentar taxa de conversão do formulário/WhatsApp eliminando objeções comuns dos clientes de catering na Flórida.  
> **Padrão:** `faq-page` Skill (Open Design Upstream) + Accordion HTML5 Semântico (`<details>` & `<summary>`)  
> **Data:** 18 de Agosto de 2026 | **Autor:** Antigravity AI

---

## 1. ESTRUTURA DO COMPONENTE FAQ (ACCORDION NATIVO)

Para manter a diretriz de **Zero JS Runtime Overhead** e **Acessibilidade WAI-ARIA**, utilizaremos elementos nativos HTML5 `<details>` e `<summary>` estilizados com os tokens **Fire & Charcoal**.

```html
<section id="faq" class="faq-section py-20 bg-charcoal-900 text-cream-50">
  <div class="container mx-auto px-4 max-w-4xl">
    <!-- Header -->
    <div class="text-center mb-12">
      <span class="text-ember-500 font-mono text-sm tracking-widest uppercase mb-2 block" data-i18n="faq_subtitle">Tudo o que você precisa saber</span>
      <h2 class="text-3xl md:text-4xl font-display font-bold text-cream-50" data-i18n="faq_title">Perguntas Frequentes (FAQ)</h2>
    </div>

    <!-- Accordion Group -->
    <div class="faq-accordion space-y-4">
      <!-- Item 1: Área de Atendimento -->
      <details class="faq-item group bg-charcoal-800 border border-line rounded-xl p-5 cursor-pointer transition-all hover:border-ember-500/50">
        <summary class="faq-question font-display text-lg font-semibold flex justify-between items-center list-none text-cream-50">
          <span data-i18n="faq_q1">Quais cidades da Flórida o BBQ Carioca atende?</span>
          <svg class="w-5 h-5 text-ember-500 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </summary>
        <p class="faq-answer mt-4 text-smoke-400 text-sm leading-relaxed" data-i18n="faq_a1">
          Atendemos todo o sul da Flórida, incluindo Boca Raton, Delray Beach, Palm Beach, Fort Lauderdale, Miami, West Palm Beach e regiões próximas. Para eventos corporativos ou maiores, atendemos também Orlando.
        </p>
      </details>

      <!-- Item 2: O que está incluído -->
      <details class="faq-item group bg-charcoal-800 border border-line rounded-xl p-5 cursor-pointer transition-all hover:border-ember-500/50">
        <summary class="faq-question font-display text-lg font-semibold flex justify-between items-center list-none text-cream-50">
          <span data-i18n="faq_q2">O que está incluído nos pacotes de churrasco?</span>
          <svg class="w-5 h-5 text-ember-500 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </summary>
        <p class="faq-answer mt-4 text-smoke-400 text-sm leading-relaxed" data-i18n="faq_a2">
          Nossos pacotes incluem churrasqueiro profissional (Chef Bruno), churrasqueira de brasa, cortes nobres selecionados (Picanha, Fraldinha, Costela, Linguiça), entradas (pão de alho), acompanhamentos (farofa, vinagrete, arroz), pratos, talheres descartáveis premium e limpeza da área da churrasqueira.
        </p>
      </details>

      <!-- Item 3: Duração do Serviço -->
      <details class="faq-item group bg-charcoal-800 border border-line rounded-xl p-5 cursor-pointer transition-all hover:border-ember-500/50">
        <summary class="faq-question font-display text-lg font-semibold flex justify-between items-center list-none text-cream-50">
          <span data-i18n="faq_q3">Quanto tempo dura o serviço de churrasco no evento?</span>
          <svg class="w-5 h-5 text-ember-500 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </summary>
        <p class="faq-answer mt-4 text-smoke-400 text-sm leading-relaxed" data-i18n="faq_a3">
          Chegamos 2 horas antes do horário de servir para montar a estrutura e acender a brasa. O serviço de churrasco à vontade (rodízio/buffet) dura entre 3 e 4 horas continuas de atendimento para seus convidados.
        </p>
      </details>

      <!-- Item 4: Número Mínimo de Convidados -->
      <details class="faq-item group bg-charcoal-800 border border-line rounded-xl p-5 cursor-pointer transition-all hover:border-ember-500/50">
        <summary class="faq-question font-display text-lg font-semibold flex justify-between items-center list-none text-cream-50">
          <span data-i18n="faq_q4">Qual o número mínimo e máximo de convidados?</span>
          <svg class="w-5 h-5 text-ember-500 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </summary>
        <p class="faq-answer mt-4 text-smoke-400 text-sm leading-relaxed" data-i18n="faq_a4">
          Atendemos desde pequenas festas residenciais (a partir de 15 convidados) até grandes eventos corporativos, aniversários e casamentos com mais de 200 convidados.
        </p>
      </details>

      <!-- Item 5: Reserva e Formas de Pagamento -->
      <details class="faq-item group bg-charcoal-800 border border-line rounded-xl p-5 cursor-pointer transition-all hover:border-ember-500/50">
        <summary class="faq-question font-display text-lg font-semibold flex justify-between items-center list-none text-cream-50">
          <span data-i18n="faq_q5">Como funciona a reserva da data e o pagamento?</span>
          <svg class="w-5 h-5 text-ember-500 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </summary>
        <p class="faq-answer mt-4 text-smoke-400 text-sm leading-relaxed" data-i18n="faq_a5">
          Para garantir a data na agenda, solicitamos um sinal de 20% no momento da reserva. O valor restante é pago no dia do evento. Aceitamos Zelle, Cartões de Crédito, Venmo e Dinheiro.
        </p>
      </details>

      <!-- Item 6: Política de Chuva -->
      <details class="faq-item group bg-charcoal-800 border border-line rounded-xl p-5 cursor-pointer transition-all hover:border-ember-500/50">
        <summary class="faq-question font-display text-lg font-semibold flex justify-between items-center list-none text-cream-50">
          <span data-i18n="faq_q6">E se chover no dia do meu evento?</span>
          <svg class="w-5 h-5 text-ember-500 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </summary>
        <p class="faq-answer mt-4 text-smoke-400 text-sm leading-relaxed" data-i18n="faq_a6">
          Nossa equipe possui tendas profissionais de proteção contra chuva e sol para a área da churrasqueira. O fogo não apaga e seu churrasco acontece com perfeita qualidade, independentemente do tempo!
        </p>
      </details>
    </div>
  </div>
</section>
```

---

## 2. INTEGRAÇÃO i18N (EN-US & PT-BR)

As chaves `faq_q1` até `faq_q6` e `faq_a1` até `faq_a6` serão adicionadas nos arquivos de internacionalização:
- `apps/web/public/locales/en.json`
- `apps/web/public/locales/pt-br.json`

---

## 3. BENEFÍCIOS PARA CONVERSÃO (CRO)

1. **Aumento de Confiança:** Esclarece imediatamente a logística de atendimento na Flórida (tendas para chuva, formas de pagamento locais como Zelle).
2. **Redução de Atrito:** Convidados tiram dúvidas comuns antes de enviar o formulário, aumentando a qualificação do lead no WhatsApp (+1 561 403-4603).
3. **0 KB JS Runtime:** O uso de `<details>` e `<summary>` permite animação de sanfona fluida direto no CSS, sem dependências adicionais.
