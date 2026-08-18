# Análise Técnica: Pins Motion Scroll para BBQ Carioca

> **Projeto:** BBQ Carioca (`jgdeamorim/bbqcarioca`)  
> **Tema:** Trava de Seções durante o Scroll (Pin Motion Scroll / Scrollytelling)  
> **Data:** 18 de Agosto de 2026 | **Autor:** Antigravity AI

---

## 1. O QUE É PIN MOTION SCROLL & COMO APLICAR NO BBQ CARIOCA

O **Pin Motion Scroll** (ou *Scroll Pinning*) é a técnica onde uma seção da página fica **"travada" (pinada)** na tela enquanto o usuário rola o scroll do mouse ou celular. Enquanto a tela está travada, os conteúdos laterais (como os cards de **Pacotes**, as etapas de **Como Funciona** ou a foto do **Chef Bruno**) vão deslizando ou alternando suavemente.

---

## 2. TRÊS ABORDAGENS TÉCNICAS COMPARADAS

| Abordagem | Como Funciona | Tamanho | Vantagens no BBQ Carioca |
| :--- | :--- | :--- | :--- |
| **1. CSS Native `position: sticky` + `position: relative` (Recomendado)** | Utiliza CSS nativo puro (`top: 0`, `height: 200vh` ou `300vh` para criar a área de scroll). | **0 KB JS** | ⚡ **Ultra-rápido**, zero consumo de CPU no celular, roda 100% liso em 60 FPS sem travar o scroll nativo. |
| **2. CSS Scroll-Driven Animations (`animation-timeline: scroll()`)** | Nova API do CSS (2026+) que vincula o progresso do scroll diretamente à animação CSS. | **0 KB JS** | 💎 **Moderno e Nascido no CSS**, sem depender de scripts externos. |
| **3. GSAP ScrollTrigger Pin** | Biblioteca JavaScript GSAP ativando `pin: true`. | ~15 KB JS | 🎯 Permite sincronização milimétrica se houver sequenciamento complexo de múltiplos quadros. |

---

## 3. ONDE APLICAR O PIN SCROLL NO BBQ CARIOCA (CASOS DE USO ELEGANTE)

### 📌 **Caso de Uso 1: Seção "Como Funciona em 4 Passos"**
- A coluna da esquerda com o título **"Como Funciona o Catering"** e a ilustração de brasa fica **pinada (`position: sticky`)** no topo.
- Conforme o usuário rola a tela, os 4 passos sobem um a um na coluna da direita:
  1. *Escolha o Pacote ou Menu Sob Medida*
  2. *Defina a Data e Local do Evento na Flórida*
  3. *Chegamos 2h Antes com Tudo Pronto*
  4. *Você Apenas Aproveita os Convidados*

### 📌 **Caso de Uso 2: Seção "Conheça o Churrasqueiro (Chef Bruno)"**
- A fotografia editorial do Chef Bruno fica travada à esquerda.
- O texto de storytelling e a história do Bar Resenha Carioca no Rio de Janeiro deslizam suavemente à direita.

---

## 4. ESTRUTURA DE CÓDIGO CSS NATIVO (0 KB JS LEVE)

```css
/* Estrutura de Pin Motion Scroll Leve sem JavaScript pesado */
.pin-scroll-container {
  display: flex;
  align-items: flex-start;
  gap: 40px;
}

.pin-scroll-sticky-col {
  position: sticky;
  top: 100px; /* Trava a 100px do topo do viewport */
  flex: 1;
}

.pin-scroll-content-col {
  flex: 1.2;
}
```

---

## 5. CONCLUSÃO

Para manter a diretriz de **Sobriedade e Ultra-Performance (0 KB JS Runtime)** no Cloudflare Pages, a melhor escolha para o BBQ Carioca é o **Pin Scroll Nativo via CSS `position: sticky`**, garantindo efeito visual de alta classe com carregamento instantâneo.
