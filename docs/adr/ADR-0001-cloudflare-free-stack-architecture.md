# ADR-0001: Arquitetura Cloudflare Free Stack para a Landing Page (Edge Delivery, Turnstile e Analytics)

**Status:** ACEITO  
**Data:** 2026-08-18  
**Autor:** Jeferson Amorim / Antigravity AI  
**Tenant:** BBQ do Carioca (`bbqcarioca`)  

---

## 1. Contexto

A landing page do **BBQ do Carioca** atende a clientes na Flórida (EUA) com foco em conversão de eventos via WhatsApp (+1 561 403-4603). Para garantir alta performance, máxima conversão e soberania operacional com custo fixo de **$0/mês**, faz-se necessária uma infraestrutura de hospedagem moderna que ofereça:
1. Tráfego e largura de banda ilimitados sem taxas de transferência de dados (egress).
2. Baixíssima latência e TTFB (Time to First Byte) inferior a 15ms na região sudeste dos EUA (Miami/Flórida).
3. Proteção contra bots e mensagens automatizadas de spam no formulário de orçamento.
4. Métricas de tráfego respeitando a privacidade dos clientes (GDPR/LGPD compliant, sem cookies).
5. E-mails profissionais com domínio próprio direcionados para o Gmail do fundador.

---

## 2. Decisão

Decidimos adotar a **Stack 100% Gratuita da Cloudflare** como a infraestrutura canônica de hospedagem e entrega Edge do projeto **BBQ do Carioca**:

### 2.1. Componentes da Arquitetura:
1. **Cloudflare Pages:**
   - Deploy contínuo atrelado ao repositório GitHub `jgdeamorim/bbqcarioca.git` (branch `main`).
   - Certificado SSL/TLS automático e gerenciado.
   - Suporte a até 100 domínios customizados e 500 builds/mês no plano Free.
2. **Cloudflare Turnstile:**
   - Substituição completa de desafios reCAPTCHA por validação invisível de bots.
   - Integrado diretamente ao formulário de orçamento (`#quote-form`), mantendo a taxa de conversão sem atrito visual.
3. **Cloudflare Web Analytics:**
   - Monitoramento de acessos e origens de tráfego sem uso de cookies e com peso de script quase nulo.
4. **Cloudflare Email Routing:**
   - Roteamento gratuito de e-mails institucionais (ex: `quote@bbqdocarioca.com`) diretamente para a caixa postal principal do fundador.
5. **Configuração de Cache e Headers (`_headers`):**
   - Imutabilidade e cache longo para assets locais em `lp/img/` (`bg-slider-01.png`, `Bruno-Carioca.png`).

---

## 3. Consequências

### 3.1. Impactos Positivos:
- **Custo zero operacional ($0/mês):** Sem despesas de hospedagem, servidores ou egress.
- **Velocidade Edge Extrema:** Renderização via CDN global com suporte nativo a HTTP/3, Brotli e Early Hints.
- **Proteção Anti-Spam:** Validação silenciosa de formulários reduzindo leads falsos no WhatsApp.
- **Zero Lock-in:** O projeto permanece em arquivos estáticos (HTML/CSS/JS Vanilla) podendo rodar em qualquer CDN de contingência.

### 3.2. Restrições e Limites Mapeados (Plano Free):
- Limite de 500 builds por mês (atende perfeitamente à demanda atual).
- Tamanho máximo por arquivo individual de 25 MB.
- 1 build concorrente por conta.

---

## 4. Status de Implementação

- [x] Documentação e especificações validadas via Context7 MCP.
- [x] ADR formalizado em `docs/adr/ADR-0001-cloudflare-free-stack-architecture.md`.
- [ ] Configuração do arquivo `lp/_headers` para otimização de cache.
- [ ] Integração da tag Turnstile e widget no formulário.
