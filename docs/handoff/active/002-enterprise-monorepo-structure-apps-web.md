# IMPLEMENTATION PLAN 002 — Reorganização Enterprise `apps/web` (Separacão de Assets, CSS, JS e HTML5 para Cloudflare Pages)

**Projeto:** BBQ do Carioca (`bbqcarioca`)  
**Status:** PROPOSTO / EM ANÁLISE (SDD Protocol)  
**Autoridade:** ADR-0001 (Cloudflare Free Stack) & Brand DNA Book (`SKILL.md`)  

---

## 1. Objetivo Estratégico

Evoluir a arquitetura do repositório para o padrão **Enterprise Monorepo** sob a estrutura `apps/web/`, desmembrando a Landing Page monolítica (`lp-bbq-carioca-v2_0.html`) em módulos limpos e sustentáveis (HTML5 semântico, CSS3 modularizado por tokens/componentes e scripts JS especializados), mantendo 100% de compatibilidade com **Cloudflare Pages** e zero dependências pesadas de runtime.

---

## 2. Arquitetura Proposta de Arquivos (`apps/web`)

```
apps/web/
├── public/                     # Servido diretamente no root pelo Cloudflare Pages
│   ├── _headers                # Regras de cache imutável e segurança HTTP
│   ├── favicon.svg             # Ícone do site
│   └── img/                    # Assets visuais (bg-slider-01.png, Bruno-Carioca.png, logos)
├── src/
│   ├── css/                    # Modularização de Estilos Vanilla
│   │   ├── tokens.css          # Cores Fire & Charcoal, fontes, variáveis :root
│   │   ├── layout.css          # Header, Section commons, Grid, Footer, Mobile Nav
│   │   ├── components.css      # Hero, Relief band, Experience cards, Package cards, Quote form
│   │   └── animations.css      # Keyframes, embers, marquee, reveal transitions
│   ├── js/                     # Módulos JS Puros e Defensivos
│   │   ├── i18n.js             # Gerenciamento de idioma (EN/PT) e persistência em localStorage
│   │   ├── embers.js           # Partículas Canvas no Hero com detecção de reduced-motion
│   │   ├── quote-form.js       # Captura de dados, encodeURIComponent e wa.me builder
│   │   └── app.js              # Entrypoint (IntersectionObserver, Mobile menu, Marquee)
│   └── index.html              # HTML5 limpo, sem CSS inline nem blocos extensos de script
└── package.json                # Metadados do projeto web e scripts de build/dev
```

---

## 3. Benefícios para Cloudflare Pages

1. **Build Directory Nativo:** Configuração simples no painel Cloudflare Pages (`Build output directory: apps/web/public` ou `apps/web/dist`).
2. **Separação de Preocupações (SoC):** Permite evoluir para frameworks futuros (Astro, Vite, Next.js ou React) sem alterar a estrutura de pastas do projeto.
3. **Cache de Assets no Edge:** Arquivos `.css` e `.js` externos ganham hash e podem ser servidos com `Cache-Control: immutable` pelo Cloudflare.
4. **Manutenibilidade:** Edição rápida de estilos sem precisar navegar por 1.300+ linhas de HTML unificado.

---

## 4. Fases de Transição Executável

- **Fase 1:** Criar a estrutura de pastas `apps/web/public/` e `apps/web/src/`.
- **Fase 2:** Extrair variáveis CSS e blocos de código para `src/css/tokens.css`, `layout.css`, `components.css`.
- **Fase 3:** Extrair os scripts para `src/js/i18n.js`, `embers.js`, `quote-form.js`, `app.js`.
- **Fase 4:** Gerar `apps/web/src/index.html` limpo apontando para os arquivos CSS/JS desmembrados.
- **Fase 5:** Atualizar o script de ingesta `tools/bbqcarioca_self_ingest.py` e validar via `git commit`.

---

## 5. Próximo Passo Requerido

Aguardando **autorização explícita do founder** para executar a migração dos arquivos da pasta `lp/` para `apps/web/`.
