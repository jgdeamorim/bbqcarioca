# Especificação de Design: Pin Motion Scroll para Seção "PERFECT FOR / IDEAL PARA"

> **Projeto:** BBQ Carioca (`jgdeamorim/bbqcarioca`)  
> **Inspiração de Arquitetura:** Seção "O que a sentinela vê" (Adsentice OS)  
> **Padrão:** Sticky Layout 2-Columns (0 KB JS, CSS `position: sticky`)  
> **Data:** 18 de Agosto de 2026 | **Autor:** Antigravity AI

---

## 1. CONCEITO E COMPARAÇÃO ARQUITETURAL

No Adsentice OS, a seção **"O que a sentinela vê — Três eixos auditados"** utiliza a coluna da esquerda **pinada (travada)** com o título e a narrativa principal, enquanto os três eixos (Search-Check, Wa-Check, Social-Check) deslizam à direita em cards de alto impacto.

Aplicamos esse **mesmo padrão de design editorial de elite** para a seção **"PERFECT FOR / IDEAL PARA"** do BBQ Carioca!

---

## 2. ESTRUTURA DO COMPONENTE JSX / HTML5

```html
<section class="section section-alt pin-scroll-section" id="ideal">
  <div class="container mx-auto px-4 max-w-6xl">
    <div class="pin-scroll-grid">
      
      <!-- Coluna Esquerda: PINADA / STICKY -->
      <div class="pin-scroll-sticky-col">
        <div class="sticky-head-box p-6 bg-charcoal-800/60 border border-line rounded-2xl backdrop-blur-md">
          <p class="section-label mb-2"><span data-lang="en">PERFECT FOR</span><span data-lang="pt">IDEAL PARA</span></p>
          <h2 class="section-h2 text-3xl md:text-4xl font-display font-bold text-cream-50 leading-tight">
            <span data-lang="en">Any occasion worth celebrating</span>
            <span data-lang="pt">Qualquer ocasião que merece comemoração</span>
          </h2>
          <p class="mt-4 text-smoke-400 text-sm leading-relaxed">
            <span data-lang="en">From intimate backyard BBQs to grand corporate events across South Florida.</span>
            <span data-lang="pt">De churrascos íntimos no quintal a grandes eventos corporativos no sul da Flórida.</span>
          </p>
        </div>
      </div>

      <!-- Coluna Direita: CARDS ROLANTES -->
      <div class="pin-scroll-cards-col space-y-6">
        
        <!-- Tile 1: Backyard -->
        <article class="ideal-card-pin group">
          <div class="ideal-card-inner">
            <span class="ideal-icon-badge">🏡</span>
            <div>
              <h3 class="ideal-title-lg"><span data-lang="en">Backyard Gatherings</span><span data-lang="pt">Reuniões em Casa</span></h3>
              <p class="ideal-desc"><span data-lang="en">Relax with family while Bruno handles the grill, charcoal, and service right in your backyard.</span><span data-lang="pt">Aproveite a família enquanto o Bruno cuida da grelha, brasa e serviço no seu quintal.</span></p>
            </div>
          </div>
        </article>

        <!-- Tile 2: Birthdays -->
        <article class="ideal-card-pin group">
          <div class="ideal-card-inner">
            <span class="ideal-icon-badge">🎂</span>
            <div>
              <h3 class="ideal-title-lg"><span data-lang="en">Birthdays & Parties</span><span data-lang="pt">Aniversários e Festas</span></h3>
              <p class="ideal-desc"><span data-lang="en">Make your birthday unforgettable with live Brazilian barbecue and hot picanha served nonstop.</span><span data-lang="pt">Torne seu aniversário inesquecível com churrasco brasileiro ao vivo e picanha servida sem parar.</span></p>
            </div>
          </div>
        </article>

        <!-- Tile 3: Corporate -->
        <article class="ideal-card-pin group">
          <div class="ideal-card-inner">
            <span class="ideal-icon-badge">💼</span>
            <div>
              <h3 class="ideal-title-lg"><span data-lang="en">Corporate Events</span><span data-lang="pt">Eventos Corporativos</span></h3>
              <p class="ideal-desc"><span data-lang="en">Impress clients and reward your team with a high-end Brazilian steakhouse experience at your office or venue.</span><span data-lang="pt">Impressione clientes e recompense sua equipe com uma experiência de churrascaria brasileira no seu escritório ou local.</span></p>
            </div>
          </div>
        </article>

        <!-- Tile 4: Weddings -->
        <article class="ideal-card-pin group">
          <div class="ideal-card-inner">
            <span class="ideal-icon-badge">💍</span>
            <div>
              <h3 class="ideal-title-lg"><span data-lang="en">Weddings & Receptions</span><span data-lang="pt">Casamentos e Recepções</span></h3>
              <p class="ideal-desc"><span data-lang="en">Elegant, rustic, and unforgettable meat buffet service tailored for your special reception day.</span><span data-lang="pt">Serviço elegante, rústico e inesquecível de buffet de carnes preparado sob medida para o dia da sua recepção.</span></p>
            </div>
          </div>
        </article>

      </div>

    </div>
  </div>
</section>
```

---

## 3. CSS DO COMPONENTE PIN STICKY (0 KB JS OVERHEAD)

```css
.pin-scroll-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
}

@media (min-width: 768px) {
  .pin-scroll-grid {
    grid-template-columns: 360px 1fr;
  }

  .pin-scroll-sticky-col {
    position: sticky;
    top: 120px;
    height: fit-content;
  }
}

.ideal-card-pin {
  background: rgba(30, 25, 23, 0.7);
  border: 1px solid rgba(217, 164, 65, 0.16);
  border-radius: 1rem;
  padding: 1.75rem;
  backdrop-filter: blur(12px);
  transition: border-color 0.3s ease, transform 0.3s ease;
}

.ideal-card-pin:hover {
  border-color: rgba(255, 107, 53, 0.5);
  transform: translateX(6px);
}
```

---

## 4. CONCLUSÃO

A transformação da seção **PERFECT FOR** usando o padrão **Pin Motion Scroll** do Adsentice OS eleva o visual de uma simples lista para um **Scrollytelling Editorial**, retendo a atenção do usuário no mobile e desktop com **Zero JS Overhead**.
