# Prompt SDD — Cortivo C00 (base) + C01 (instância e acesso)

> **Uso.** O Cortivo toca dois repositórios. Rode na ordem:
>
> 1. **No SparkCore** (`core/core.sparkilnghub.com.br`), `/speckit-specify` com a
>    [Parte A](#parte-a--sparkcore-cadastro-do-produto-cortivo). É pequena: catálogo, artefato,
>    provisionador, privilégio e registro de portas. Pode seguir em paralelo ao endurecimento de
>    segurança do Core (`CONF-01`), em branch própria.
> 2. **No Cortivo** (`cortivo/cortivo.sparklinghub.com.br`), primeiro inicialize o Spec Kit
>    (`.specify/`, copiando templates e workflow do workspace) e o repositório git próprio do
>    produto; depois `/speckit-constitution` com a [Parte B](#parte-b--constituição-do-cortivo)
>    e `/speckit-specify` com a [Parte C](#parte-c--especificação-c00--c01).
> 3. Siga o fluxo `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-analyze` →
>    `/speckit-implement` → `/speckit-converge`.
>
> Fontes: [escopo](../escopo/README.md), [modelagem](../modelagem/README.md),
> [decisões](../modelagem/05-decisoes.md) e
> [padrões canônicos](../../../../core/core.sparkilnghub.com.br/docs/ecossistema/README.md).

---

## Parte A — SparkCore: cadastro do produto Cortivo

```text
/speckit-specify Cadastrar o produto Cortivo no SparkCore.

Contexto: o Cortivo (gestão para barbearias) é o segundo SaaS real do ecossistema, depois do
Tuteli. Siga docs/operacao/novo-produto.md §1.1 e docs/ecossistema/07-checklist-novo-saas.md
("C00 — lado do Core"). Código técnico `cortivo` (imutável, D-COR-01), nome "Cortivo",
descrição "Gestão para barbearias", prefixo `cortivo_`.

Entregar:
1. Migração nova do catálogo spark_core inserindo o produto (status ativo, reference_only false).
   Antes, verificar no ambiente-alvo se já existe código para o produto (ex.: `sparkbarba`); se
   existir, preservar o existente e registrar a decisão.
2. Artefato produtos/cortivo/artifact (manifest v1, databasePrefix `cortivo_`, SHA-256) com a
   migração 0001 contendo apenas a base: `_spark_instance`, `idempotencia`, `auditoria`
   (declarada só-inserção para o privilégio SELECT,INSERT — SEC-BASE-12), `outbox_evento`, e
   as tabelas de acesso local `perfil_colaborador` e `unidade` (linha única) de
   cortivo/docs/modelagem/02-modelo-de-dados.md. Tabelas de negócio entram em migrações das
   fatias seguintes.
3. Provisionador `cortivo-v1` em server/src/modules/catalog/provisioners.ts e caminho em
   server/src/platform/paths.ts; ambientes development, homologation, production.
4. GRANT do provisionador em `cortivo\_%` em docker/mysql/init/01-databases-and-users.sh.
5. Linha do Cortivo e portas 3003/5177 confirmadas em docs/ecossistema/01-registro-de-produtos.md.
6. Se o endurecimento CONF-01 já tiver entregue credencial por instância, documentar o comando
   `app-credential create cortivo ... --instance <slug>`; senão, registrar a dependência.

Aceite: `npm run artifact:validate -- produtos/cortivo/artifact` verde; teste de integração
provisiona DUAS instâncias Cortivo (operacional + _acc), retoma após falha simulada sem duplicar
recursos (AC-COR-001), e aplica a migração 0001 com `_spark_instance` correto; nenhum contrato
consumido pelo Tuteli regride.
Fora: qualquer regra de negócio do Cortivo; mudanças em /internal/v1.
```

---

## Parte B — Constituição do Cortivo

```text
/speckit-constitution Criar a constituição do Cortivo, derivada da constituição do SparkCore
(core/core.sparkilnghub.com.br/.specify/memory/constitution.md v1.2.1), conforme
docs/ecossistema/02-arquitetura-padrao-saas.md ECO-015.

Princípios obrigatórios: I Isolamento por instância (não negociável); II Identidade e
autorização no servidor — validação de cada requisição pela projeção de acesso D-04, papel e
membership vindos da projeção, perfil local só restringe; III Contratos versionados com o Core
(/internal/v1 fixado por fatia, cliente único em api/src/core); IV Operações críticas
idempotentes e seguras sob concorrência (MySQL real); V Verificação com MySQL 8.4 real e
cenários de falha, duas instâncias sintéticas; VI Rastreabilidade, auditoria só-inserção e
privacidade (minimização: cliente sem CPF); VII Monólito modular api/+web/ com stack ECO-011
(Hono, Kysely, mysql2, React 19, React Router 7, TanStack Query 5, Vite 7, Tailwind 4);
VIII Interface pelo @sparkling-hub/design-system 0.5.0 e pelo padrão canônico
docs/ecossistema/04-padrao-interface.md (shell do Tuteli com menu lateral, breadcrumbs em toda
página, paleta única só por tokens --color-sh-*, máscaras do DS em todo campo de telefone,
documento, CEP, valor, porcentagem, data e hora, marca aprovada do Cortivo); IX Linha de base de
segurança docs/ecossistema/05-baseline-seguranca.md (SEC-BASE-01..22 aplicáveis são requisito de
fatia, não débito).

Governança: precedência constituição do Core → contratos → padrões canônicos → escopo →
implementação do Tuteli (referência, não norma); emendas nos temas compartilhados comunicadas ao
Core; portões G1–G6 de ECO-016 em toda fatia; troca de versão do DS registrada em
docs/design-system-updates.md.
```

---

## Parte C — Especificação C00 + C01

```text
/speckit-specify Base e acesso do Cortivo (fatias C00 e C01).

## Contexto
O Cortivo é o SaaS de gestão para barbearias da Sparkling Hub. Delega identidade, vínculos,
convites, ciclo de vida, credenciais e provisionamento ao SparkCore pelo contrato /internal/v1
(v1.3.3; v1.4 em andamento com o endurecimento) e valida cada requisição na projeção de acesso
do banco `cortivo_<uuid>_acc` (D-04). Uma instância = uma unidade de barbearia. Um processo da
API por instância (SPARKCORE_INSTANCE_SLUG). Entradas normativas, nesta precedência:
constituição do Cortivo; core/.../contracts (openapi.yaml, access-projection.md v2,
conventions.md, migration-artifact.md); core/.../docs/ecossistema (01–07); docs/escopo;
docs/modelagem (01–05, decisões D-COR-01..11 de 15/11/2026).

O Tuteli é a referência prática da casca de interface e do layout api/+web/, mas NÃO repetir
as divergências listadas em docs/ecossistema/06-conformidade-produtos.md (touch síncrono como
guarda, papel no cookie, cookie só assinado, fetch sem timeout, logout sem projeção, confiança
em X-Forwarded-For, pool sem revalidação, ausência de breadcrumbs, sobrescrita de CSS do DS).

## Objetivo
Uma instância Cortivo provisionada pelo Core é ativada; o administrador convidado entra,
configura perfis locais da equipe e vê a casca completa do produto (menu lateral, breadcrumbs,
marca), com isolamento provado entre duas instâncias e a linha de base de segurança aplicada
desde o primeiro commit (jornada J01, prioridade P1).

## Requisitos

### C00 — Base
- Repositório com a estrutura ECO-010: api/ (Hono + Kysely + mysql2, Node 22, ESM, TypeScript
  estrito) e web/ (React 19, React Router 7, TanStack Query 5, Vite 7, Tailwind 4).
- Portas: API 3003, Vite 5177 (strictPort), SPARKCORE_INTERNAL_URL=http://127.0.0.1:5273
  (ECO-002); .env.example com TRUSTED_PROXIES, PUBLIC_ORIGIN, SESSION_SECRET,
  SESSION_SECRET_PREVIOUS, SPARKCORE_APP_CREDENTIAL, SPARKCORE_INSTANCE_SLUG.
- Design system 0.5.0 por .tgz em vendor/design-system com entrada em
  docs/design-system-updates.md (sha256). Ordem de CSS layers.css → styles.css do DS → app.css;
  raiz .sh-theme. Se o .tgz 0.5.0 ainda não estiver publicado (CONF-08), usar 0.4.0 com
  MaskedInput e registrar a troca pendente — sem copiar código do DS.
- Marca: copiar de UX/assets/logomarcas-produtos/final-v1/cortivo/ os sete arquivos de UI-050
  para web/public/brand/ e testar sha256 contra manifesto-sha256.txt; Brand com alt "Cortivo";
  favicon SVG + ICO + apple-touch-icon; títulos "Cortivo — Sparkling Hub" e "<Página> · Cortivo".
- Shell UI-010 idêntico ao do Tuteli (aside petróleo w-56/w-16 colapsável, header claro + Drawer
  abaixo de lg, conteúdo max-w-5xl em fundo ground, Sair e Recolher no rodapé, endosso "Uma
  solução da Sparkling Hub" na lateral expandida e no login).
- PageHeader local que renderiza o Breadcrumb do DS com navegação SPA (UI-020), breadcrumbs
  declarados em handle.crumb de cada rota; primeiro nível "Cortivo" → /hoje.
- NAV completo de docs/modelagem/04-interface.md (Hoje, Agenda, Clientes, Vendas, Caixa,
  Estoque, Comissões, Retornos, Relatórios, Catálogo, Equipe, Configurações, Auditoria),
  filtrado por papel e perfis; nesta fatia as páginas de negócio são placeholders com
  EmptyState "Disponível em breve" e breadcrumb correto.
- CI: typecheck, lint, unit, integração com MySQL 8.4 real, contrato, E2E Playwright + axe,
  npm audit --omit=dev sem moderado+.

### C01 — Instância e acesso (CORE-COR-001..006, NFR-COR-001)
- INT-010 Boot: health do Core com timeout 2 s; GET /connection; pools operacional e _acc
  vinculados a instanceId + credentialVersion; conferir _spark_instance e access_instance contra
  o instanceId do Core e a faixa de schema suportada; divergência → 503 e log de segurança.
- INT-020 Revalidar /connection a cada 10 min e em erro de autenticação MySQL; nova versão de
  credencial troca pools; instância não ATIVA → descartar pool e recusar (SEC-BASE-19); TLS nos
  pools fora do dev (SEC-BASE-15).
- INT-030 Login: POST /api/auth/login → POST /internal/v1/instances/{slug}/sessions com
  clientIp real (socket; X-Forwarded-For só de TRUSTED_PROXIES, salto mais à direita não
  confiável — SEC-BASE-02), limite local 20 tentativas/15 min/IP → 429, 401 único.
- INT-040 Cookie __Host-cortivo_session (cortivo_session só em dev HTTP): HttpOnly, Secure fora
  do dev local, SameSite=Strict, sem Domain; conteúdo cifrado AES-256-GCM com iat/exp
  verificados e rotação de chave (SEC-BASE-06); papel NÃO é autoridade no cookie.
- INT-050 Toda rota protegida aplica a regra normativa da projeção; papel e membership_id vêm
  dela (SEC-BASE-04); perfil local lido do banco operacional pelo membership_id; Core fora do
  ar com projeção acessível mantém sessões válidas; projeção inacessível → 503.
- INT-051 touch ≤ 1 vez/5 min/sessão, fora do caminho crítico, timeout 3 s; aceitar 200 (v1.4)
  e 204 (v1.3).
- INT-060 Logout: INSERT IGNORE em access_session_logout antes de apagar o cookie (SEC-BASE-03).
- INT-070 Equipe: listar membros, convidar, revogar convite, mudar papel e revogar vínculo
  apenas via /internal/v1 (escopo members, X-Instance-Session do ator); regra do último
  administrador é do Core.
- Perfis locais (D-COR-03, acumuláveis): administrador define em /equipe os perfis
  {recepcao, barbeiro} de cada colaborador; barbeiro exige associar exatamente um profissional
  ativo (cadastro mínimo de profissional nesta fatia: nome, apelido, telefone com mask="phone",
  estado); colaborador sem perfil vê só /configuracao-pendente; revogação do vínculo elimina o
  acesso mesmo com perfil cadastrado; toda alteração auditada.
- GET /api/sessao: conta (nome), papel, perfis, profissional, unidade (nome, fuso do Core),
  sem e-mail de terceiros.
- Linha de base: origin-check + JSON only + 415 (SEC-BASE-05), bodyLimit 1 MiB (08), cabeçalhos
  de segurança em SPA e API (10), auditoria só-inserção (12), X-Correlation-Id só UUID (17),
  app.onError sem SQL no log (18), paginação com teto 10.000 (20), CSV neutralizado (21) já como
  utilitário; credencial de aplicação por instância assim que o Core oferecer (SEC-BASE-01;
  homologação bloqueada até lá — D-COR-10).
- Telas desta fatia: Login (PublicLayout, assinatura principal + endosso), Hoje (placeholder com
  StatsBlock vazio), Equipe (membros do Core + perfis locais + profissionais), Configuração
  pendente, 401/403/404/503 amigáveis — cada uma com matriz de estados do DS (inicial, vazio,
  carregando, inválido, enviando, sucesso pós-API, erro, conflito 409, sem permissão,
  indisponível) e breadcrumb.

## Cenários de aceite
- AC-COR-001 (via Parte A no Core), AC-COR-002, AC-COR-003, AC-COR-004 do escopo.
- AC-COR-021 parcial: colaborador recém-convidado só opera após receber perfil; perfil
  acumulado recepção+barbeiro libera a união das ações; alteração de perfil gera trilha.
- INT-110 1–7 de docs/ecossistema/03-contrato-saas-core.md com duas instâncias Cortivo
  sintéticas (A e B) e um vínculo da mesma conta no Tuteli: credencial/slug cruzados recusados
  sem revelar existência; cookie após logout → 401; rebaixamento → 403 na próxima escrita;
  revogar A preserva B; suspender A e reativar exige novo login; Core fora do ar mantém leitura
  e recusa login com 503; X-Forwarded-For forjado limitado.
- Interface: shell em 320, 360, 768 e 1280 px sem rolagem horizontal; menu móvel com foco
  contido, Escape e restauração; breadcrumb presente e correto em todas as rotas; axe sem
  violação séria; teclado no login e na Equipe; sha256 da marca confere; telefone do
  profissional com máscara e envio do valor bruto.

## Fora do escopo
Regras de negócio de C02 em diante (unidade completa, clientes, catálogo, agenda, fila,
atendimento, vendas, caixa, estoque, comissões, retornos, relatórios); utilização F08 (C09);
pedidos e WhatsApp; MFA para usuários do produto; deploy de produção.

## Restrições
- Não alterar contratos /internal/v1 a partir do Cortivo; necessidade de contrato vira pedido
  ao Core com versão.
- Nenhum segredo em log, URL, resposta, bundle (verificar web/dist), CSV ou fixture.
- Dados de teste sintéticos; nada de produção.
- Dinheiro em centavos, instantes UTC, datas civis no fuso da instância, intervalos [início, fim).

## Critérios de sucesso
- Duas instâncias Cortivo operam isoladas, com prova automatizada no gate.
- Logout, rebaixamento e revogação têm efeito na requisição seguinte.
- p95 da autorização pela projeção medido e registrado (meta NFR-004: leitura ≤ 800 ms total).
- Todos os SEC-BASE aplicáveis com teste que falharia sem a defesa.
- Constitution Check do plano mapeia cada tela e campo para componentes do DS, breadcrumbs e
  máscaras.
```

---

## Fatias seguintes (para o `/speckit-specify` de cada uma)

| Fatia | Entrada | Decisões já fechadas |
| --- | --- | --- |
| C02 — Unidade e cadastros | `COR-001..004`, `COR-020`; modelagem 02 (unidade, profissional, expediente, bloqueio, cliente, serviço, item) | D-COR-09 (cliente: e-mail e nascimento opcionais, sem CPF); máscaras phone/cep/currency/date/time |
| C03 — Agenda | `COR-005`, `COR-006`; `AC-COR-005`, `AC-COR-007` | D-COR-04 (tolerância e passo 15 min) |
| C04 — Fila, encaixe, atendimento | `COR-007..010`; `AC-COR-006/008/009` | D-COR-03 (barbeiro só os próprios; acumulado opera como recepção) |
| C05 — Comanda de serviço e caixa | `COR-011..014`; `AC-COR-011..013` | D-COR-05a/b (desconto só admin; dinheiro/Pix/crédito/débito) — **marco do piloto** (D-COR-11) |
| C06 — Revenda e estoque | `COR-015`; `AC-COR-010` | — |
| C07 — Comissões | `COR-016`, `COR-017`; `AC-COR-014` | D-COR-06 |
| C08 — Retorno e gestão | `COR-018..020`; `AC-COR-015/016` | D-COR-07 antes de dados reais |
| C09 — Utilização | `CORE-COR-007`; `AC-COR-017` | F08 do Core validado |
