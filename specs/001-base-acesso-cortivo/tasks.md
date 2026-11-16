---

description: "Tarefas da fatia 001 — Base e acesso do Cortivo (C00 + C01)"
---

# Tasks: Base e acesso do Cortivo (C00 + C01)

**Input**: Design documents from `specs/001-base-acesso-cortivo/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: OBRIGATÓRIOS. A constituição exige testes com MySQL 8.4 real (V), teste falhando antes
da implementação nas regras de alto risco (V) e um teste por `SEC-BASE` aplicável que falharia sem
a defesa (IX). Nas fases de história, os testes vêm antes da implementação e DEVEM falhar
primeiro.

**Organization**: tarefas agrupadas por história de usuário (US1–US5 de [spec.md](./spec.md)).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: história atendida (US1…US5)
- **[CORE]** no texto: tarefa executada no **repositório do SparkCore**
  (`../../core/core.sparkilnghub.com.br/`, abreviado `core/`), por fluxo próprio do Core; as
  demais são deste repositório (`cortivo/cortivo.sparklinghub.com.br`).

## Path Conventions

Monólito `api/` + `web/` na raiz deste repositório ([plan.md](./plan.md#project-structure)).
Rastreabilidade: cite os IDs (`FR-*`, `INT-*`, `SEC-BASE-*`, `UI-*`, `AC-COR-*`) no commit.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: esqueleto do repositório (C00), convenções e esteira

- [X] T001 Criar `package.json` raiz com `"private": true`, `"type": "module"`, workspaces `["api","web"]`, `engines.node >=22`, e scripts `dev` (API + Vite em paralelo), `typecheck`, `lint` (ESLint + `node scripts/check-ui.mjs`), `test:unit`, `test:integration`, `test:contract`, `test:e2e`, `build`, `check:bundle` (`node scripts/check-bundle.mjs`) em package.json
- [X] T002 Criar `tsconfig.base.json` com `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`, `module`/`moduleResolution` `NodeNext` e `target` ES2023 em tsconfig.base.json
- [X] T003 [P] Criar `api/package.json` (deps `hono` ^4, `@hono/node-server` ^2.1.3 (a 1.x tem GHSA-rmxm-3fg6-px4f no `serveStatic`; SEC-BASE-09), `kysely` ^0.29, `mysql2` ^3, `uuid` ^11; dev `typescript`, `tsx`, `vitest`, `ajv`, `ajv-formats`, `yaml`, `@types/node` ^22), `api/tsconfig.json`, `api/tsconfig.test.json` e `api/vitest.config.ts` com projetos `unit`, `integration` (sequencial, `TEST_MYSQL_URL`) e `contract`, seguindo o padrão de `tuteli/.../api/vitest.*.ts`
- [X] T004 [P] Criar `web/package.json` (deps `react`/`react-dom` ^19, `react-router` ^7, `@tanstack/react-query` ^5, `lucide-react`, `@sparkling-hub/design-system` `file:../vendor/design-system/sparkling-hub-design-system-0.5.0.tgz`; dev `vite` ^7, `@vitejs/plugin-react`, `tailwindcss` ^4, `@tailwindcss/vite`, `@playwright/test`, `@axe-core/playwright`, `vitest`, `@types/react*`), `web/tsconfig.json` e `web/vite.config.ts` com `server.port = 5177`, `strictPort: true` e proxy `/api → http://127.0.0.1:3003` (R-17)
- [X] T005 [P] Copiar sem alteração `../../tuteli/tuteli.sparklinghub.com.br/vendor/design-system/sparkling-hub-design-system-0.5.0.tgz` para `vendor/design-system/`, conferir sha256 `58381c2ede514b6c2f240f09ea272b8d161b62558cba858f2f734895eb21cf36` e criar `docs/design-system-updates.md` com a entrada inicial (versão 0.5.0, sha256, origem, motivo "adoção inicial C00", changelog lido, testes de interface executados) e a seção "Lacunas observadas" vazia (G6, R-01)
- [X] T006 [P] Criar `eslint.config.js` (flat: `typescript-eslint` strict, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`) e `.prettierrc` (largura 100) na raiz
- [X] T007 [P] Criar `scripts/check-ui.mjs` que varre `web/src/**/*.{ts,tsx,css}` e falha com arquivo:linha em: cor literal (`#hex`, `rgb(`, `hsl(`, nomes de cor CSS) fora de `var(--color-sh-*)`; `!important` em regra que contenha `.sh-`; redefinição de `--color-sh-`; `<input`/`<Input` cujo `name`/`id`/`label` indique telefone, documento, CEP, valor, porcentagem, data ou hora sem prop `mask` (UI-030, UI-040)
- [X] T008 [P] Criar `api/.env.example` com `NODE_ENV=development`, `PORT=3003`, `PUBLIC_ORIGIN=http://127.0.0.1:5177`, `TRUSTED_PROXIES=`, `SESSION_SECRET=`, `SESSION_SECRET_PREVIOUS=`, `SPARKCORE_INTERNAL_URL=http://127.0.0.1:5273`, `SPARKCORE_PUBLIC_URL=http://127.0.0.1:5173` (endereço público da interface do Core, usado só no redirecionamento para `/recuperar`), `SPARKCORE_APP_CREDENTIAL=`, `SPARKCORE_INSTANCE_SLUG=`, `TEST_MYSQL_URL=` (sem nenhum valor secreto) e comentário por variável
- [X] T009 [P] Criar `.gitignore` (`node_modules`, `dist`, `.env`, `test-results`, `playwright-report`) e `.gitattributes` (`* text=auto eol=lf`, `*.tgz binary`, `*.ico binary`, `*.png binary`)
- [X] T010 [P] Copiar sem edição de `../../UX/assets/logomarcas-produtos/final-v1/cortivo/` para `web/public/brand/` os sete arquivos `cortivo-principal.svg`, `cortivo-inversa.svg`, `simbolo-principal.svg`, `simbolo-inversa.svg`, `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, e copiar `manifesto-sha256.txt` para `web/tests/fixtures/brand-manifesto-sha256.txt` (UI-050)
- [X] T011 [P] Criar `.github/workflows/ci.yml` com jobs typecheck, lint, test:unit, test:integration (serviço MySQL 8.4 com credencial de teste que só cria `t_*`), test:contract (checkout do Core em `CORE_REPO_DIR`), build + check:bundle, `npm audit --omit=dev --audit-level=moderate` e job e2e manual/noturno dependente do Core local (FR-010)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: artefato no Core, instância, segurança de borda, sessão pela projeção, casca web
mínima e utilitários de teste. Sem esta fase nenhuma história pode ser testada.

**⚠️ CRITICAL**: nenhuma história começa antes do checkpoint desta fase.

### Parte A — Repositório do SparkCore

- [X] T012 [CORE] Criar `core/produtos/cortivo/artifact/migrations/0001_base.sql` (entregue pela spec 009 do Core, branch `009-cadastro-produto-cortivo`): `_spark_instance` (formato do contrato do Core: `instance_uuid`, `product_code`, `owner_task_uuid`, `synthetic`, `created_at`); `idempotencia` (PK (`chave`,`ator_membership_id`,`operacao`), índice em `expira_em`); `auditoria` (`entidade_id VARCHAR(36) NULL`, índices (`ocorrido_em`) e (`entidade`,`entidade_id`)); `outbox_evento` (índice (`estado`,`proxima_tentativa_em`)); `perfil_colaborador` (`perfis SET('recepcao','barbeiro')` com `CHECK (perfis <> '')`, `profissional_id BINARY(16) NULL` **sem FK**, `definido_por`, `version`); `unidade` (linha única por `CHECK (id = 1)`, `CHECK (passo_agenda_min IN (5,10,15,20,30))`, fuso `America/Sao_Paulo`, tolerância e passo 15); InnoDB `utf8mb4_0900_ai_ci`; nenhuma tabela de negócio
- [ ] T013 [CORE] **Pendente; especificada na spec `010-cortivo-equipe-acesso` do Core (US1, US2: versão 2 do artefato e migração v1 → v2), fora da 009, que fixa o esquema na versão 1.** Criar `core/produtos/cortivo/artifact/migrations/0002_equipe_acesso.sql` com `profissional` (`id BINARY(16) PK`, `nome VARCHAR(120)` NOT NULL, `apelido VARCHAR(40) NULL`, `telefone_e164 VARCHAR(16) NULL`, `estado ENUM('ativo','inativo')` padrão `ativo`, `version INT UNSIGNED`, `criado_em`, `atualizado_em DATETIME(6)`) e, em `perfil_colaborador`, `ALTER TABLE`: FK `profissional_id` → `profissional.id`, coluna gerada STORED `barbeiro_profissional_chave = IF(FIND_IN_SET('barbeiro', perfis) > 0, profissional_id, NULL)` com `UNIQUE`, `CHECK (FIND_IN_SET('barbeiro', perfis) = 0 OR profissional_id IS NOT NULL)` e `CHECK (FIND_IN_SET('barbeiro', perfis) > 0 OR profissional_id IS NULL)`; acrescentar a entrada de versão 2 (com sha256) ao `manifest.json` e estender os testes do Core (aplicação do zero e a partir da v1, `appendOnlyTables` intacto)
- [X] T014 [CORE] Criar `core/produtos/cortivo/artifact/manifest.json` (`formatVersion: 1`, `productCode: "cortivo"`, `databasePrefix: "cortivo_"`, `appendOnlyTables: ["auditoria"]`, migração 1 com sha256 do arquivo normalizado LF/UTF-8 sem BOM; a entrada da migração 2 entra com a T013) e rodar `npm run artifact:validate -- produtos/cortivo/artifact` (verde) e a aplicação em banco descartável `t_*` (passos 1–2 de `migration-artifact.md`; coberta por `server/tests/integration/migrations/cortivo-artifact.test.ts`)
- [X] T015 [CORE] Cadastrar o código `cortivo` no catálogo (migração `0010_cadastro_cortivo`, segura para reaplicação) e registrar o provisionador `cortivo-v1` em `core/server/src/modules/catalog/provisioners.ts` (`cortivoProductDir` em `paths.ts`; ambientes `development`, `homologation`, `production`), com o `GRANT` do provisionador em `cortivo\_%` no `docker/mysql/init/01-databases-and-users.sh`, `cortivo` nos slugs reservados e testes de integração do catálogo, do artefato e do provisionamento (CORE-COR-001, CORE-COR-002; spec 009)
- [ ] T016 [CORE] **Pendente; especificada na spec `010-cortivo-equipe-acesso` do Core (US3: ambiente de ensaio); executar depois da T013**, para que as instâncias já nasçam na versão 2 do artefato (senão exigem a aba "Migração" do Core depois). Provisionar e ativar no ambiente `development` as instâncias sintéticas `cortivo-a` e `cortivo-b`, uma instância Tuteli, as contas de teste do [quickstart](./quickstart.md#pré-requisitos) e credenciais de aplicação (`connection`, `sessions`, `members`) vinculadas a cada instância Cortivo (`npm run app-credential -- create cortivo "<rótulo>" --scopes sessions,members,connection --instance <slug>`, documentado em `core/docs/operacao/novo-produto.md`); registrar o roteiro em `core/docs/operacao/` (pré-requisito só do E2E)

### Base deste repositório — espelhos e utilitários de teste

- [ ] T017 [P] Espelhar `core/produtos/cortivo/artifact/` em `api/tests/fixtures/artifact/` e `core/server/migrations/access_projection/` em `api/tests/fixtures/access_projection/`, e criar `api/tests/contract/deriva.test.ts` que compara sha256 dos espelhos, de `contracts/openapi.yaml` e de `contracts/access-projection.md` com `CORE_REPO_DIR` (pula com aviso quando ausente localmente; obrigatório no CI) (R-13, G5)
- [ ] T018 Criar `api/tests/helpers/banco-descartavel.ts` que, no MySQL 8.4 de `TEST_MYSQL_URL`, cria dois pares `t_cortivo_<a|b>_<rand>` + `_acc`, aplica o esquema da projeção e as migrações 1–2 do espelho, insere `_spark_instance` e `access_instance` (`state` parametrizável), cria um usuário operacional por par com `SELECT` no operacional, `INSERT, UPDATE, DELETE` nas tabelas de negócio, só `INSERT` em `auditoria`, `SELECT` no `_acc` e só `INSERT` em `access_session_logout`, e oferece fábricas de `access_session`/`access_member` (sessão válida, vencida, inativa, revogada, rebaixada) e limpeza
- [ ] T019 [P] Criar `api/tests/helpers/core-falso.ts`: servidor HTTP que implementa `GET /health/live`, `GET /internal/v1/instances/{slug}/connection`, `POST /sessions`, `POST /sessions/touch` (modo 1.4 `200 {role, membershipStatus}` ou 1.3 `204`), `GET /members`, `POST /invitations`, `POST /invitations/{id}/revoke`, `POST /members/{id}/role`, `POST /members/{id}/revoke`, com controles de teste (atraso, queda, `tls` ausente, `credentialVersion`, `state`, slug cruzado → resposta de inexistente, `401 AUTH_APP_CREDENTIAL_INVALID`) e registro das requisições recebidas
- [ ] T020 [P] Criar `api/tests/contract/core-falso.contract.test.ts` que valida com Ajv cada resposta do Core falso contra `openapi.yaml` 1.4.0 (via `CORE_REPO_DIR` ou cópia em `api/tests/fixtures/openapi-core.yaml`) e a variante 1.3.3 de `touch` e `connection` (G5)
- [ ] T021 Criar `api/tests/helpers/app-teste.ts` que importa `createApp` de `api/src/app.ts` (ainda inexistente: os testes que o usam falham até T041), monta o app sobre um par descartável + Core falso e registra a rota de teste `POST /api/__teste/admin` protegida por `requireRole('administrador')`, passada a `createApp` somente com `NODE_ENV=test`

### Testes de alto risco — escritos primeiro (Princípio V: DEVEM falhar antes da implementação)

- [ ] T022 [P] Escrever `api/tests/unit/cookie-sessao.test.ts` (antes de T037; deve falhar até o módulo existir): ida e volta; adulteração de qualquer byte → inválido; `exp` vencido → inválido; cifrado com chave anterior aceito; chave descartada → inválido; conteúdo decifrado não contém papel; troca de nome do cookie (AAD) → inválido
- [ ] T023 [P] Escrever `api/tests/unit/perfil-efetivo.test.ts` cobrindo cada linha da tabela "Perfil efetivo" de [data-model.md](./data-model.md) (deve falhar até T039)
- [ ] T024 Escrever `api/tests/integration/linha-base-borda.test.ts` (escrito antes de T035–T036 e T041; deve falhar sem cada defesa): com `NODE_ENV=production`, `POST /api/__teste/admin` → `404` (a rota de teste nunca existe fora do ambiente de teste); `Origin` alheio em `POST` → `403`; `text/plain` → `415`; corpo de 1 MiB + 1 B → `413`; `X-Correlation-Id: abc` substituído por UUID e repetido na resposta; cabeçalhos de SEC-BASE-10 presentes em `/`, `/api/saude`, `/api/rota-inexistente` (404) e em `500`; erro de banco provocado gera log sem SQL nem valores e envelope `500` (SEC-BASE-05/08/10/17/18)
- [ ] T025 Escrever `api/tests/integration/instancia-boot.test.ts` (antes de T034; deve falhar até o gerenciador existir): par A pronto → `/api/saude` `200`; `_spark_instance` de outro UUID, `product_code` diferente, `access_instance` de outro UUID, `state='pronta'`/`'suspensa'`, esquema versão 1 ou 3, e credencial recusada pelo Core falso → `/api/*` `503 SYSTEM_INSTANCE_UNAVAILABLE` e log `seguranca.instancia_divergente`/`seguranca.credencial_recusada` (INT-010)
- [ ] T026 Escrever `api/tests/integration/projecao-sessao.test.ts` (antes de T038 e T040; deve falhar até a autorização existir): sessão válida autoriza e o papel vem de `access_member.role` (mesmo com o cookie de outra sessão); cada condição da regra normativa falsa (vencida, inativa, `auth_revision` divergente, vínculo revogado, conta bloqueada, instância suspensa, logout registrado) → `401` com cookie apagado; rebaixar `role` na projeção → `POST /api/__teste/admin` `403` na requisição seguinte (SEC-BASE-04, INT-050)
- [ ] T027 [P] Criar `api/tests/contract/cliente-core.contract.test.ts` que captura as requisições do cliente no Core falso e as valida contra os `requestBody`/parâmetros do `openapi.yaml` 1.4.0, verificando também que toda chamada leva o `X-Correlation-Id` da requisição de origem (G5). Escrito antes de T033; deve falhar até o cliente existir

### Base deste repositório — API

- [ ] T028 Criar `api/src/env.ts` que valida no boot todas as variáveis de T008 e falha cedo: `SESSION_SECRET` ≥ 32 bytes; `PUBLIC_ORIGIN` e `SPARKCORE_PUBLIC_URL` URLs de origem (https fora do dev); `TRUSTED_PROXIES` lista de IPs/CIDR; `SPARKCORE_INSTANCE_SLUG` não vazio; nunca imprime valores (FR-002); teste em `api/tests/unit/env.test.ts`
- [ ] T029 [P] Criar `api/src/modules/comum/log.ts`: logger JSON (campos `nivel`, `evento`, `correlationId`, `instanceId` verificado, `operacao`, `authzMs`) que remove/mascara chaves proibidas (`password`, `senha`, `token`, `cookie`, `authorization`, `link`, `SESSION_SECRET`) recursivamente; teste em `api/tests/unit/log.test.ts` (FR-036, FR-040)
- [ ] T030 [P] Criar `api/src/modules/comum/erros.ts` com `ErroApi` e catálogo de códigos/mensagens pt-BR (`AUTH_INVALID_CREDENTIALS`, `AUTH_SESSION_INVALID`, `AUTH_FORBIDDEN`, `AUTH_ORIGIN_REFUSED`, `AUTH_THROTTLED`, `PERFIL_PENDENTE`, `NOT_FOUND`, `CONFLICT_VERSION`, `CONFLICT_LAST_ADMIN`, `CONFLICT_IDEMPOTENCY_KEY_REUSED`, `CONFLICT_REQUEST_IN_PROGRESS`, `PROFISSIONAL_JA_ASSOCIADO`, `PROFISSIONAL_EM_USO`, `PROFISSIONAL_INATIVO`, `PERFIL_BARBEIRO_EXIGE_PROFISSIONAL`, `PERFIL_ALVO_ADMINISTRADOR`, `VALIDATION_*`, `SYSTEM_INSTANCE_UNAVAILABLE`, `SYSTEM_IDENTITY_UNAVAILABLE`, `SYSTEM_DEPENDENCY_UNAVAILABLE`, `SYSTEM_UNEXPECTED`) e montagem do envelope `{error:{code,message,field,retryable,correlationId,details?}}` de `conventions.md` §4 (FR-037)
- [ ] T031 [P] Criar `api/src/modules/comum/uuid.ts` (UUID v7, validação, conversão texto ⇄ `BINARY(16)`), `api/src/modules/comum/validacao.ts` (validadores de objeto sem campos extras → `422` com `field` JSON Pointer e `details`), `api/src/modules/comum/paginacao.ts` (`offset` 0–10000, `limit` 1–100, padrão 50 → `422` fora da faixa, SEC-BASE-20) e `api/src/modules/comum/csv.ts` (prefixa `'` em valores iniciados por `=`, `+`, `-`, `@`, `\t`, `\r`, SEC-BASE-21), com testes em `api/tests/unit/{uuid,validacao,paginacao,csv}.test.ts`
- [ ] T032 [P] Criar `api/src/db/tipos-op.ts` e `api/src/db/tipos-acc.ts` com as interfaces Kysely das tabelas de [data-model.md](./data-model.md) e da projeção v2 (`access_session`, `access_session_logout`, `access_member`, `access_instance`)
- [ ] T033 Criar `api/src/core/cliente.ts`, `api/src/core/tipos.ts` e `api/src/core/erros.ts`: ÚNICO cliente do SparkCore, `Authorization: Bearer <SPARKCORE_APP_CREDENTIAL>`, `AbortSignal.timeout(2000)` no `/health/live` e `3000` nas demais, `X-Instance-Session` quando exigido, `Idempotency-Key` repassado, `X-Correlation-Id` da requisição corrente repassado em toda chamada (para a trilha do Core casar com a do Cortivo), corpos sem campos extras, aceite de `touch` `200`/`204` e `tls` ausente, e tradução de respostas conforme a tabela de [core-consumo.md](./contracts/core-consumo.md) (`AUTH_APP_CREDENTIAL_INVALID` → `SYSTEM_DEPENDENCY_UNAVAILABLE` + evento `seguranca.credencial_recusada`; timeout/rede → `SYSTEM_IDENTITY_UNAVAILABLE` retryable); nunca loga `password`, `token` nem `link` (FR-039, SEC-BASE-07)
- [ ] T034 Criar `api/src/instancia/gerenciador.ts`, `api/src/instancia/pools.ts` e `api/src/instancia/esquema.ts`: estados `iniciando | pronta | indisponivel`; boot `/health/live` → `/connection` → pools operacional e `_acc` (mysql2, sem `USE`, um pool por banco atado a `instanceId` + `credentialVersion`, `ssl` quando `tls=required` ou `NODE_ENV !== 'development'`) → conferência de `_spark_instance.instance_uuid` e `product_code='cortivo'`, `access_instance.instance_id` e `state='ativa'`, versão efetiva de `_spark_schema_history` (última aplicada sem `falha`) em `ESQUEMA_SUPORTADO = [2, 2]`; qualquer divergência → `indisponivel` + log `seguranca.instancia_divergente`; expõe `displayName` e `timezone` (INT-010, R-08)
- [ ] T035 [P] Criar `api/src/middleware/correlacao.ts` (aceita `X-Correlation-Id` só se UUID, senão gera v7; devolve no cabeçalho, SEC-BASE-17), `api/src/middleware/cabecalhos.ts` (CSP `default-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'; object-src 'none'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy` restritiva, HSTS fora do dev, `Cache-Control: no-store` em `/api`, SEC-BASE-10) e `api/src/middleware/origem-json.ts` (métodos inseguros exigem `Sec-Fetch-Site: same-origin` ou `Origin === PUBLIC_ORIGIN` → senão `403 AUTH_ORIGIN_REFUSED`; `Content-Type` diferente de `application/json` → `415`, SEC-BASE-05)
- [ ] T036 [P] Criar `api/src/middleware/erro.ts` (`app.onError` e `notFound`: log `{nome, codigo, correlationId}` sem mensagem de driver, SQL ou valores; resposta envelope `500 SYSTEM_UNEXPECTED`, SEC-BASE-18) e `api/src/middleware/prontidao.ts` (`/api/*` exceto `/api/saude` responde `503 SYSTEM_INSTANCE_UNAVAILABLE` com `Retry-After: 5` quando a instância não está `pronta`)
- [ ] T037 Criar `api/src/modules/acesso/cookie-sessao.ts`: AES-256-GCM, chave HKDF-SHA256 de `SESSION_SECRET` com `info="cortivo-session-v1"`, AAD = nome do cookie, valor `v1.` + base64url(nonce 12 B ‖ cifra ‖ tag 16 B), conteúdo `{t, iat, exp}` com `exp = min(expiresAt do Core, iat + 12 h)`, decifra com a chave atual e depois as de `SESSION_SECRET_PREVIOUS`, nome `__Host-cortivo_session` (ou `cortivo_session` só com `NODE_ENV=development` e `PUBLIC_ORIGIN` `http://`), atributos `HttpOnly; SameSite=Strict; Path=/`, sem `Domain`, `Secure` fora do dev local; sem papel, vínculo, nome ou e-mail (INT-040, SEC-BASE-06, R-04)
- [ ] T038 Criar `api/src/modules/acesso/projecao.ts` (regra normativa de `access-projection.md` com `sha256(token)` calculado em Node e consulta preparada no pool `_acc`, sem cache, medindo `authzMs` com `performance.now()`; e `registrarLogout(token)` com `INSERT IGNORE INTO access_session_logout (id_hash, ended_at) VALUES (?, UTC_TIMESTAMP(6))`) (INT-050.1, INT-060, R-05)
- [ ] T039 Criar `api/src/modules/acesso/perfil-efetivo.ts` (regra pura da tabela "Perfil efetivo" de [data-model.md](./data-model.md): `administrador` ignora perfis; `colaborador` sem linha → pendente; `recepcao`; `barbeiro` com profissional ativo; união; barbeiro com profissional inativo → pendente com log) até T023 passar
- [ ] T040 Criar `api/src/middleware/sessao.ts` (decifra cookie → projeção → contexto `{accountId, membershipId, displayName, role}` vindos da linha; zero linhas ou cookie inválido → `401 AUTH_SESSION_INVALID` e cookie apagado; consulta o conjunto de sessões invalidadas pelo touch) e `api/src/middleware/autorizacao.ts` (`perfil` carrega `perfil_colaborador` + profissional pelo `membershipId` no banco operacional e calcula o perfil efetivo; `requireRole('administrador')` → `403 AUTH_FORBIDDEN`) (INT-050.2, INT-050.3, SEC-BASE-04)
- [ ] T041 Criar `api/src/app.ts` (Hono; ordem em `/api`: correlação → cabeçalhos → `bodyLimit` 1 MiB com `413` → origem-json → prontidão → sessão → perfil → rotas → erro; `GET /api/saude` público; fora do dev serve `web/dist` com fallback `index.html` e os mesmos cabeçalhos, ECO-012.2) e `api/src/main.ts` (lê `env`, sobe `@hono/node-server` na `PORT`, inicia o gerenciador de instância, encerra pools no `SIGTERM`); `createApp(deps)` aceita rotas extras apenas quando `NODE_ENV === 'test'`, até T024–T026 passarem

### Base deste repositório — Web

- [ ] T042 Criar `web/src/styles/layers.css` (declaração de camadas), `web/src/styles/app.css` (somente utilitários do produto, sem cor literal) e `web/src/main.tsx` importando `layers.css` → `@sparkling-hub/design-system/styles.css` → `app.css`, raiz `<div class="sh-theme">`, `QueryClientProvider` e `RouterProvider` (UI-001)
- [ ] T043 [P] Criar `web/src/api/client.ts`: `fetch` com `credentials: 'same-origin'`, JSON, timeout por `AbortSignal.timeout(15000)`, `X-Correlation-Id` UUID por requisição, `Idempotency-Key` por intenção (gerada ao abrir o formulário, reaproveitada em reenvio), parse do envelope de erro em `ErroApi` tipado, e tratamento global: `401` → `/login?retorno=<rota interna>`, `503` → estado indisponível
- [ ] T044 Atualizar `web/index.html` com `<title>Cortivo — Sparkling Hub</title>`, `<link rel="icon" href="/brand/favicon.svg" type="image/svg+xml">`, `<link rel="icon" href="/brand/favicon.ico" sizes="any">`, `<link rel="apple-touch-icon" href="/brand/apple-touch-icon.png">`, `lang="pt-BR"`
- [ ] T045 Criar `web/tests/unit/brand.test.ts` que calcula sha256 dos sete arquivos de `web/public/brand/` e compara com `web/tests/fixtures/brand-manifesto-sha256.txt` (UI-050, SC-008)

**Checkpoint**: Core com artefato e provisionador; API sobe, confere a instância, aplica a linha
de base de borda e autoriza pela projeção; testes T022–T027, escritos e vistos falhando antes de
T028–T041, agora verdes.

---

## Phase 3: User Story 1 - Administrador convidado entra e encontra a casca do produto (Priority: P1) 🎯 MVP

**Goal**: login delegado ao Core com IP real e limite, sessão exposta, logout pela projeção e a
casca completa (marca, menu de 13 itens, breadcrumbs, títulos, placeholders, Hoje).

**Independent Test**: com o par A e o Core falso (integração) ou a instância `cortivo-a` real
(E2E), entrar como administrador, navegar por todo o menu conferindo breadcrumb, título e marca,
sair e reapresentar o cookie antigo → `401`.

### Tests for User Story 1 ⚠️

- [ ] T046 [P] [US1] Escrever `api/tests/unit/ip-cliente.test.ts`: sem `TRUSTED_PROXIES` o XFF é ignorado; socket confiável com `XFF: forjado, cliente, proxy-confiavel` → `cliente`; todos confiáveis → o mais à esquerda; IPv6 e CIDR (SEC-BASE-02)
- [ ] T047 [P] [US1] Escrever `api/tests/unit/limite-login.test.ts`: 20 tentativas em 15 min passam, a 21ª → bloqueada com `retryAfter`; janela desliza; teto de chaves descarta o mais antigo
- [ ] T048 [P] [US1] Escrever `api/tests/integration/login-logout.test.ts`: login válido → `200` com `Sessao` e `Set-Cookie` com `HttpOnly`, `SameSite=Strict`, `Path=/`, sem `Domain` (e `Secure`/`__Host-` com `NODE_ENV=production`); Core recebe `clientIp` do socket; senha errada, conta sem vínculo e conta inexistente → mesmo `401 AUTH_INVALID_CREDENTIALS` com corpo idêntico; 25 tentativas com `X-Forwarded-For` variado sem proxy confiável → `429` a partir da 21ª com `Retry-After` e log com o IP do socket; logout → linha em `access_session_logout`, cookie apagado e reuso → `401`; logout com `_acc` sem privilégio de `INSERT` → cookie apagado mesmo assim e falha logada; `GET /api/auth/recuperar` → `302` para `SPARKCORE_PUBLIC_URL` + `/recuperar` (INT-030, INT-060, SEC-BASE-02/03/06, FR-030)
- [ ] T049 [P] [US1] Escrever `api/tests/integration/sessao.test.ts`: `GET /api/sessao` devolve `conta.nome` (display_name da projeção), `papel`, `perfis: []`, `situacao: "ativa"`, `profissional: null`, `unidade.nome`/`unidade.fuso` do `/connection`, e o JSON não contém e-mail, token nem `membershipId` de terceiros (FR-031)
- [ ] T050 [P] [US1] Escrever `api/tests/contract/api-acesso.contract.test.ts` validando respostas de `/saude`, `/auth/login`, `/auth/logout`, `/auth/recuperar` (`302` com `Location` igual a `SPARKCORE_PUBLIC_URL` + `/recuperar`, sem `Set-Cookie` e sem parâmetros de consulta) e `/sessao` contra [api-cortivo.openapi.yaml](./contracts/api-cortivo.openapi.yaml)
- [ ] T051 [P] [US1] Escrever `web/tests/unit/nav.test.ts` (administrador vê os 13 itens na ordem de [interface.md](./contracts/interface.md); recepção, barbeiro e união conforme a tabela NAV; pendente vê nenhum) e `web/tests/unit/crumbs-titulo.test.ts` (cada rota declara `handle.crumb`; primeiro nível "Cortivo" → `/hoje`; título `<último crumb> · Cortivo`; login `Cortivo — Sparkling Hub`)
- [ ] T052 [P] [US1] Escrever `web/tests/e2e/j01-casca.spec.ts` (Playwright + axe, `cortivo-a` real): login com assinatura principal + endosso; `/hoje` com breadcrumb e 13 itens; cada item com breadcrumb correto, título e "Disponível em breve" nas áreas futuras; 320/360/768/1280 px sem rolagem horizontal (`scrollWidth <= clientWidth`); abaixo de `lg` o menu abre em `Drawer` com foco contido, `Escape` fecha e o foco volta ao botão; login só por teclado; axe sem `serious`/`critical`; sair e cookie antigo → `401`
- [ ] T053 [P] [US1] Escrever `web/tests/e2e/matriz-estados-acesso.spec.ts` que, interceptando `/api/*` com `page.route` (respostas atrasadas, vazias, `401`, `429`, `503` e `500` no formato do envelope), verifica cada célula da matriz de [interface.md](./contracts/interface.md#telas-e-matriz-de-estados-ui-060) para Login (inicial com foco no e-mail, enviando, inválido, erro genérico, `429` com tempo, `503`, sucesso só após a API), Hoje (carregando com `Skeleton`, vazio, erro com Tentar de novo, `503`) e páginas 401/403/404/503 (FR-043, G1/G4)

### Implementation for User Story 1

- [ ] T054 [P] [US1] Criar `api/src/modules/acesso/ip-cliente.ts` usando `getConnInfo` de `@hono/node-server/conninfo` e a regra de R-07 (percorre XFF da direita para a esquerda apenas quando o socket está em `TRUSTED_PROXIES`)
- [ ] T055 [P] [US1] Criar `api/src/modules/acesso/limite-login.ts` (janela deslizante em memória, 20 tentativas / 15 min / IP, teto de 10.000 chaves com descarte do mais antigo)
- [ ] T056 [US1] Criar `api/src/modules/acesso/rotas.ts` com `POST /api/auth/login` (valida `{email ≤ 254, senha 1–128}` sem campos extras; aplica limite → `429 AUTH_THROTTLED` + `Retry-After`; chama `POST /internal/v1/instances/{slug}/sessions` com `clientIp` resolvido e `userAgent` ≤ 300; emite cookie; responde `Sessao`), `POST /api/auth/logout` (registra logout antes de apagar o cookie; falha → log e apaga mesmo assim; `204`), `GET /api/sessao` (FR-031; `situacao` pelo perfil efetivo) e `GET /api/auth/recuperar` (pública; `302` para `${SPARKCORE_PUBLIC_URL}/recuperar`, sem parâmetros do usuário) (INT-030, INT-060, FR-030)
- [ ] T057 [P] [US1] Criar `web/src/app/nav.ts` (constante `NAV` com rota, rótulo, ícone `lucide-react`, `papeis` e `perfis` exatamente como em [interface.md](./contracts/interface.md)) e `web/src/app/titulo.ts` (título pelo último crumb)
- [ ] T058 [P] [US1] Criar `web/src/app/Brand.tsx` (`cortivo-inversa.svg` expandida / `simbolo-inversa.svg` recolhida / `cortivo-principal.svg` em fundo claro, `alt="Cortivo"`) e `web/src/app/PageHeader.tsx` (renderiza `Breadcrumb` do DS a partir de `useMatches()`/`handle.crumb` com `Link` do React Router, depois `h1`, descrição e ações; rótulos sem UUID) (UI-020)
- [ ] T059 [US1] Criar `web/src/app/layouts.tsx` com `AppLayout` (lateral petróleo `--color-sh-dark-surface`/`--color-sh-dark-line`, `w-56`⇄`w-16` com transição 220 ms `cubic-bezier(.16,1,.3,1)` e estado em `localStorage` com try/catch; Sair e Recolher no rodapé; endosso "Uma solução da Sparkling Hub" `text-xs text-white/50` só expandida; cabeçalho claro com botão que abre `Drawer` do DS abaixo de `lg`; conteúdo `min-h-0 flex-1 overflow-y-auto bg-[var(--color-sh-ground)]` → `<main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">`) e `PublicLayout` (fundo ground, `Card`, assinatura principal + endosso) (UI-010)
- [ ] T060 [US1] Criar `web/src/app/MenuPrincipal.tsx` (renderiza `NAV` filtrado por papel/perfis da sessão, item ativo, rótulos ocultos no modo recolhido com `aria-label`) e `web/src/app/auth-guard.tsx` (carrega `GET /api/sessao` via TanStack Query; sem sessão → `/login?retorno=`; só aceita retorno interno iniciado por `/`)
- [ ] T061 [P] [US1] Criar `web/src/api/auth.ts` e `web/src/api/sessao.ts` (login, logout, sessão; chaves de query e invalidação ao sair)
- [ ] T062 [US1] Criar `web/src/pages/login/LoginPage.tsx` (`PublicLayout`, `Field` + `Input type="email" autoComplete="username"`, `Field` + `Input type="password" autoComplete="current-password"`, `Button` com `Spinner` ao enviar, `Alert` para `401` genérico, `429` com tempo de espera e `503`; aviso "Sua sessão terminou" quando vier de `401`; link "Esqueci minha senha" apontando para `/api/auth/recuperar` (redireciona à página `/recuperar` do Core); foco inicial no e-mail; título "Cortivo — Sparkling Hub") (FR-030, UI-060)
- [ ] T063 [P] [US1] Criar `web/src/pages/hoje/HojePage.tsx` (`PageHeader` "Hoje", `StatsBlock` com valores "—", `EmptyState` "Os números do dia aparecem a partir da agenda", `Skeleton` ao carregar, `Alert` em erro/`503`)
- [ ] T064 [P] [US1] Criar `web/src/pages/em-breve/EmBrevePage.tsx` (`PageHeader` com o rótulo da rota e `EmptyState` "Disponível em breve", sem ações) e `web/src/pages/erros/{SemPermissaoPage,NaoEncontradaPage,IndisponivelPage}.tsx` (403 e 404 na casca com breadcrumb "Cortivo › Sem permissão"/"Cortivo › Página não encontrada"; 503 pública com `Alert` e "Tentar de novo")
- [ ] T065 [US1] Criar `web/src/app/routes.tsx`: `/login`, `/indisponivel` (públicas); sob `AppLayout` + `auth-guard`: `/hoje`, as 11 rotas de "em breve" (`/agenda`, `/clientes`, `/vendas`, `/caixa`, `/estoque`, `/comissoes`, `/retornos`, `/relatorios`, `/catalogo`, `/configuracoes`, `/auditoria`), `/equipe` (placeholder até US3), `/sem-permissao`, `*`; cada rota com `handle.crumb`; `/` → `/hoje`; atualização de `document.title` por `titulo.ts`

**Checkpoint**: US1 funcional e demonstrável sozinha (administrador entra, navega, sai).

---

## Phase 4: User Story 2 - Isolamento entre instâncias e efeito imediato das mudanças de acesso (Priority: P1)

**Goal**: provar que A e B não se enxergam por nenhum canal e que logout, rebaixamento,
revogação e suspensão valem na requisição seguinte; atividade (touch) fora do caminho crítico.

**Independent Test**: suíte de integração com os dois pares descartáveis e o Core falso; nenhuma
dependência de telas.

### Tests for User Story 2 ⚠️

- [ ] T066 [P] [US2] Escrever `api/tests/integration/isolamento-ab.test.ts` (G2, NFR-COR-001, AC-COR-003): app de A e app de B lado a lado; cookie de A apresentado a B (e vice-versa) → `401` sem revelar existência; corpo/cabeçalho/rota com `instanceId`, slug, `membershipId` ou nome de banco de B ignorados em A; alternar requisições válidas A/B 200 vezes sem que nenhuma resposta, log `instanceId` verificado ou linha de auditoria cruze instâncias; pool de A nunca recebe consulta destinada a B (contagem por pool); administrador de plataforma sem vínculo → login `401`
- [ ] T067 [P] [US2] Escrever `api/tests/integration/efeito-imediato.test.ts` (AC-COR-002, FR-025): para cada mudança na projeção — logout, `role` → `colaborador`, `status='revogado'`, `account_status='bloqueada'`, `auth_revision` incrementada, `access_instance.state='suspensa'` — a primeira requisição seguinte é recusada (`401`, ou `403` em `POST /api/__teste/admin` no rebaixamento); com vínculos em A e B, revogar em A mantém B `200`; reativar A (`state='ativa'`, `authorization_revision` nova, sessão do Core encerrada) exige novo login; cookie com o formato e nome do Tuteli → `401`
- [ ] T068 [P] [US2] Escrever `api/tests/integration/atividade-touch.test.ts` (INT-051): duas requisições em menos de 5 min → um único `touch`; após 5 min (relógio falso) → novo `touch`; resposta da API não espera o `touch` (Core falso com atraso de 2,5 s não altera a latência); `touch` com timeout de 3 s abortado; `401` do `touch` → a requisição seguinte recebe `401`; `204` (1.3) e `200` (1.4) aceitos e o `role` do corpo nunca usado para autorizar

### Implementation for User Story 2

- [ ] T069 [US2] Criar `api/src/modules/acesso/atividade.ts` (mapa `idHash → último touch` e conjunto de invalidadas com teto e expiração em 12 h; dispara `touch` após a resposta via `c.executionCtx`/`queueMicrotask` sem `await` no caminho da resposta; `401` → marca invalidada; erro de rede → ignora) e ligá-lo em `api/src/middleware/sessao.ts` (consulta invalidadas antes da projeção; agenda touch depois da resposta) (INT-051, R-06)
- [ ] T070 [US2] Revisar `api/src/middleware/erro.ts` e `api/src/modules/comum/erros.ts` para que todo `404` de recurso inexistente ou de outra instância use o mesmo corpo e código `NOT_FOUND`, e ajustar o log para registrar `instanceId` apenas do gerenciador de instância (nunca do cliente) (FR-026, conventions §3)

**Checkpoint**: US1 + US2 — base segura demonstrável; G2 coberto na integração.

---

## Phase 5: User Story 3 - Administrador organiza a equipe: membros, perfis locais e profissionais (Priority: P2)

**Goal**: tela Equipe com membros e convites do Core (convidar com link de uso único, revogar
convite, mudar papel, revogar vínculo), cadastro mínimo de profissional e perfis locais
acumuláveis, tudo auditado.

**Independent Test**: com o par A e o Core falso, um administrador convida, cadastra
profissional, define Recepção + Barbeiro a um colaborador, tenta violações de regra e confere a
auditoria; no E2E, o mesmo fluxo na tela.

### Tests for User Story 3 ⚠️

- [ ] T071 [P] [US3] Escrever `api/tests/integration/profissionais.test.ts`: criar com `nome` "2–120 caracteres após aparar", `apelido` ≤ 40, `telefone` "dígitos brutos (10 ou 11)" normalizado `+55…` em `telefone_e164` e devolvido em dígitos; `telefone` com máscara/letras → `422` com `field="/telefone"`; campo extra → `422`; mesma `Idempotency-Key` + mesmo corpo → mesma resposta e um só registro; mesma chave + corpo diferente → `409 CONFLICT_IDEMPOTENCY_KEY_REUSED`; duas criações concorrentes com a mesma chave → uma `201` e outra `409 CONFLICT_REQUEST_IN_PROGRESS` ou repetição; editar com `version` velha → `409 CONFLICT_VERSION`; inativar profissional de barbeiro com vínculo `ativo` → `409 PROFISSIONAL_EM_USO`; reativar; colaborador → `403`; listagem paginada `offset ≤ 10000`, `limit ≤ 100`
- [ ] T072 [P] [US3] Escrever `api/tests/integration/perfis.test.ts` (D-COR-03, AC-COR-021): definir `["recepcao","barbeiro"]` com profissional ativo → `200`, auditoria `perfil.definir` com antes/depois e `correlation_id`; `barbeiro` sem profissional → `422 PERFIL_BARBEIRO_EXIGE_PROFISSIONAL`; `recepcao` com profissional → `422`; profissional inativo → `422 PROFISSIONAL_INATIVO`; profissional já de outro barbeiro com vínculo `ativo` → `409 PROFISSIONAL_JA_ASSOCIADO`; o mesmo com vínculo `revogado` na projeção → associação liberada e auditada `perfil.liberar_revogado`; alvo administrador → `422 PERFIL_ALVO_ADMINISTRADOR`; alvo de outra instância ou inexistente → `404` idêntico; dois administradores concorrentes com a mesma `version` → um `200` e um `409 CONFLICT_VERSION`; `DELETE` com `version` → colaborador volta a pendente e `perfil.remover` auditado; `perfis` vazio rejeitado pelo banco mesmo se o serviço falhar (CHECK)
- [ ] T073 [P] [US3] Escrever `api/tests/integration/auditoria-privilegio.test.ts` (SEC-BASE-12): com a credencial operacional, `UPDATE auditoria` e `DELETE FROM auditoria` falham por privilégio; nenhuma rota da API altera ou exclui auditoria; telefone gravado em `antes_json`/`depois_json` só mascarado `(**) *****-1234`
- [ ] T074 [P] [US3] Escrever `api/tests/integration/equipe-core.test.ts` (INT-070, CORE-COR-005): `GET /api/equipe/membros` combina membros do Core com perfis locais e não traz e-mail (só `emailMascarado` de convite pendente); convidar repassa `Idempotency-Key` e `X-Instance-Session` do ator e devolve `{link, expiraEm}` sem que o link apareça em log ou auditoria; revogar convite e revogar vínculo exigem `motivo` 3–280; mudar papel exige `motivo` e `version`; `409 CONFLICT_LAST_ADMIN` do Core vira mensagem "A unidade precisa de pelo menos um administrador."; Core fora do ar → `503 SYSTEM_IDENTITY_UNAVAILABLE`; colaborador → `403` em todas; cada operação concluída pelo Core grava na `auditoria` local `equipe.convidar` (entidade `convite`, `entidade_id` nulo, `depois_json` só com o papel, sem e-mail nem link; as outras três ações gravam `entidade_id` com o `invitationId`/`membershipId` do caminho), `equipe.revogar_convite`, `equipe.mudar_papel` (antes/depois do papel) e `equipe.revogar_vinculo`, com `motivo` e o mesmo `correlation_id` enviado ao Core; recusa do Core (`403`/`409`) grava `resultado='recusado'`; falha ao gravar a auditoria após sucesso no Core gera log `auditoria.falha_registro` com a correlação (Princípio VI)
- [ ] T075 [P] [US3] Escrever `api/tests/contract/api-equipe.contract.test.ts` validando as respostas de `/equipe/*` e `/profissionais*` contra [api-cortivo.openapi.yaml](./contracts/api-cortivo.openapi.yaml)
- [ ] T076 [P] [US3] Escrever `web/tests/e2e/equipe.spec.ts` (`cortivo-a` real + axe): convidar colaborador → `Dialog` mostra link uma vez com Copiar; cadastrar profissional digitando `11987654321` → campo exibe `(11) 98765-4321` e a requisição envia `"11987654321"`; definir Recepção + Barbeiro com o profissional; tentar salvar Barbeiro sem profissional → erro no campo; fluxo inteiro só por teclado; colaborador abrindo `/equipe` → página "Sem permissão"; cronometrar a jornada do administrador recém-convidado desde a abertura de `/login` até o perfil salvo, falhar acima de 3 minutos e gravar o tempo em `specs/001-base-acesso-cortivo/evidence.md` (SC-006; a medição com pessoa real fica no T107)
- [ ] T077 [P] [US3] Escrever `web/tests/e2e/matriz-estados-equipe.spec.ts` que, interceptando `/api/equipe/*` e `/api/profissionais*` com `page.route`, verifica para a tela Equipe e seus diálogos: carregando (`Skeleton`), vazio ("Convide a primeira pessoa" / "Nenhum profissional"), inválido por campo a partir de `field`, enviando (botão desabilitado), sucesso só após a API (`Toast`; link de convite exibido uma vez), erro com Tentar de novo, `409 CONFLICT_VERSION` com Recarregar, `409 CONFLICT_LAST_ADMIN` com texto próprio, `403` e `503` com ações desabilitadas (FR-043, G1/G4)

### Implementation for User Story 3

- [ ] T078 [P] [US3] Criar `api/src/modules/auditoria/registrar.ts` (insere em `auditoria` dentro da transação recebida: `id` v7, `ocorrido_em` do servidor, `ator_membership_id` e `ator_nome` da projeção, `acao` do catálogo `perfil.definir | perfil.remover | perfil.liberar_revogado | profissional.criar | profissional.editar | profissional.inativar | profissional.reativar | equipe.convidar | equipe.revogar_convite | equipe.mudar_papel | equipe.revogar_vinculo`, `resultado`, `entidade`, `entidade_id`, `motivo` ≤ 280, `antes_json`/`depois_json` com telefone mascarado `(**) *****-1234`, `correlation_id`)
- [ ] T079 [P] [US3] Criar `api/src/modules/comum/idempotencia.ts` (reserva `(chave, ator_membership_id, operacao)` com `estado='em_processamento'` e `resumo_sha256` do corpo canônico; mesma chave + mesmo resumo concluída → repete `status_http`/`resposta_json`; resumo diferente → `409 CONFLICT_IDEMPOTENCY_KEY_REUSED`; em processamento → `409 CONFLICT_REQUEST_IN_PROGRESS` retryable; `expira_em = criado_em + 24 h`; limpeza dos expirados no início de cada reserva, em lote limitado)
- [ ] T080 [P] [US3] Criar `api/src/modules/equipe/profissionais.repositorio.ts` e `api/src/modules/equipe/profissionais.servico.ts` (criar com idempotência `profissional.criar`; editar com `version`; inativar — `SELECT … FOR UPDATE` e recusa `409 PROFISSIONAL_EM_USO` se houver `perfil_colaborador` barbeiro com esse profissional cujo vínculo esteja `ativo` em `access_member`; reativar; listar paginado; normalização do telefone "10 ou 11 dígitos" → `+55…`; auditoria na mesma transação) e `api/src/modules/equipe/profissionais.rotas.ts` (`GET/POST /api/profissionais`, `PUT /api/profissionais/{id}`, `POST …/inativar`, `POST …/reativar`, todas `requireRole('administrador')`)
- [ ] T081 [US3] Criar `api/src/modules/equipe/perfis.regras.ts` (validação pura: `perfis` não vazio e sem repetição, apenas `recepcao`/`barbeiro`; `profissionalId` obrigatório com `barbeiro` e proibido sem ele), `api/src/modules/equipe/perfis.repositorio.ts` e `api/src/modules/equipe/perfis.servico.ts` com a transação das regras 1–5 de [data-model.md](./data-model.md#perfil_colaborador-v2) (ator administrador; alvo `ativo` + `colaborador` na projeção senão `404`/`422 PERFIL_ALVO_ADMINISTRADOR`; `FOR UPDATE` no profissional e na linha do perfil; liberação de associação de vínculo revogado com `perfil.liberar_revogado`; `409 PROFISSIONAL_JA_ASSOCIADO`; `409 CONFLICT_VERSION`; auditoria `perfil.definir`/`perfil.remover`)
- [ ] T082 [US3] Criar `api/src/modules/equipe/membros.rotas.ts` com `GET /api/equipe/membros` (Core `members` + perfis locais + profissional, paginado), `POST /api/equipe/convites` (repassa `Idempotency-Key`; responde `{link, expiraEm}` sem logar), `POST /api/equipe/convites/{invitationId}/revogar`, `PUT /api/equipe/membros/{membershipId}/papel`, `POST /api/equipe/membros/{membershipId}/revogar`, `PUT` e `DELETE /api/equipe/membros/{membershipId}/perfil`, todas com `requireRole('administrador')`, `X-Instance-Session` do ator e tradução de [core-consumo.md](./contracts/core-consumo.md); após a resposta do Core, gravar a auditoria local `equipe.convidar` / `equipe.revogar_convite` / `equipe.mudar_papel` / `equipe.revogar_vinculo` (sucesso ou `recusado`, com motivo e `correlation_id`, `entidade_id` = id do caminho, ou nulo em `equipe.convidar`, sem e-mail nem link; falha da gravação → log `auditoria.falha_registro` sem desfazer a resposta) (Princípio VI); registrar as rotas de equipe e profissionais em `api/src/app.ts`
- [ ] T083 [P] [US3] Criar `web/src/api/equipe.ts` e `web/src/api/profissionais.ts` (queries e mutações TanStack Query com `Idempotency-Key` por intenção, `version` nas edições, invalidação de `membros`, `profissionais` e `sessao`)
- [ ] T084 [US3] Criar `web/src/pages/equipe/EquipePage.tsx` (`PageHeader` "Equipe"; `Tabs` Membros / Profissionais; `Skeleton`, `EmptyState` "Convide a primeira pessoa" / "Nenhum profissional", `Alert` com Tentar de novo, `Pagination`; `Badge` de papel e situação; revogados em leitura; ações desabilitadas em `503`) e `web/src/pages/equipe/ListaMembros.tsx` (nome, papel, situação, perfis, `emailMascarado` só em convite pendente)
- [ ] T085 [P] [US3] Criar `web/src/pages/equipe/DialogoConvite.tsx` (`Dialog`, `Field` + `Input type="email"`, `Field` + `Select` Administrador/Colaborador; sucesso só após a API; segunda etapa mostra o link uma única vez com botão Copiar e aviso de que não poderá ser consultado de novo; o link não vai para estado persistente nem `localStorage`)
- [ ] T086 [P] [US3] Criar `web/src/pages/equipe/DialogoMotivo.tsx` reutilizado para revogar convite, revogar vínculo e mudar papel (`Field` + `Input` motivo 3–280; `Select` de papel quando for mudança; envia `version`; `409 CONFLICT_LAST_ADMIN` e `409 CONFLICT_VERSION` com textos próprios e ação Recarregar)
- [ ] T087 [P] [US3] Criar `web/src/pages/equipe/DialogoPerfil.tsx` (`Checkbox` Recepção e Barbeiro; `Field` + `Select` de profissionais ativos obrigatório quando Barbeiro; erros por campo a partir de `field`; `409` com Recarregar; botão "Remover perfis" com confirmação)
- [ ] T088 [P] [US3] Criar `web/src/pages/equipe/ListaProfissionais.tsx` e `web/src/pages/equipe/DialogoProfissional.tsx` (`Field` + `Input` nome 2–120, `Field` + `Input` apelido ≤ 40, `Field` + `Input mask="phone"` telefone enviando os dígitos brutos; ações Inativar/Reativar com `version`; `409 PROFISSIONAL_EM_USO` explicado) e trocar o placeholder de `/equipe` em `web/src/app/routes.tsx` pela `EquipePage`

**Checkpoint**: US1–US3 — administrador organiza a equipe com auditoria e concorrência provadas.

---

## Phase 6: User Story 4 - Colaborador acessa conforme os perfis recebidos (Priority: P2)

**Goal**: colaborador sem perfil fica restrito à configuração pendente; com perfis vê a união
das áreas; o servidor recusa ações acima do papel independentemente do menu.

**Independent Test**: com o par A, entrar como colaborador sem perfil, com Recepção, com
Barbeiro, com ambos e após revogação, conferindo `GET /api/sessao`, rotas permitidas e recusas;
no E2E, o menu e o redirecionamento.

### Tests for User Story 4 ⚠️

- [ ] T089 [P] [US4] Escrever `api/tests/integration/colaborador-perfis.test.ts`: colaborador sem perfil → `GET /api/sessao` `200` com `situacao: "configuracao_pendente"`, `POST /api/auth/logout` `204`, qualquer outra rota protegida → `403 PERFIL_PENDENTE`; com `recepcao` → `perfis: ["recepcao"]`; com `barbeiro` → `profissional` preenchido; com ambos → união; barbeiro cujo profissional foi inativado diretamente no banco → pendente; vínculo revogado com perfil cadastrado → `401`; colaborador com qualquer perfil em rota de administrador → `403 AUTH_FORBIDDEN` (FR-021–FR-023)
- [ ] T090 [P] [US4] Escrever `web/tests/e2e/colaborador.spec.ts` (`cortivo-a` real): colaborador sem perfil entra e vê só `/configuracao-pendente` (sem menu de operação; navegar para `/hoje` redireciona); após o administrador definir Recepção → menu com Hoje, Agenda, Clientes, Vendas, Caixa, Estoque, Retornos, Relatórios, Catálogo; Barbeiro → Hoje, Agenda, Comissões; ambos → união; `/equipe` → "Sem permissão"; axe sem violação séria
- [ ] T091 [P] [US4] Escrever `web/tests/e2e/matriz-estados-pendente.spec.ts` (interceptação com `page.route`) cobrindo a tela Configuração pendente em estado inicial e leitura, o redirecionamento de qualquer rota autenticada, a ausência de menu de operação, Sair funcionando e `503` em `GET /api/sessao` levando à página indisponível (FR-043)

### Implementation for User Story 4

- [ ] T092 [US4] Criar `requirePerfil(...perfis)` e o guarda de pendente em `api/src/middleware/autorizacao.ts` (colaborador com perfil efetivo pendente só acessa `GET /api/sessao` e `POST /api/auth/logout`; demais → `403 PERFIL_PENDENTE`; `requirePerfil` aceita a união de perfis e deixa administrador passar) e aplicá-lo globalmente após o middleware `perfil` em `api/src/app.ts`
- [ ] T093 [P] [US4] Criar `web/src/pages/configuracao-pendente/ConfiguracaoPendentePage.tsx` (`PageHeader` "Configuração pendente" com breadcrumb "Cortivo › Configuração pendente", `EmptyState` explicando que o administrador precisa definir o perfil, `Button` Sair; título "Configuração pendente · Cortivo")
- [ ] T094 [US4] Atualizar `web/src/app/auth-guard.tsx` e `web/src/app/layouts.tsx` para que `situacao = configuracao_pendente` redirecione toda rota autenticada a `/configuracao-pendente` e oculte o menu de operação (mantendo Sair), e rota fora do `NAV` do usuário vá para `/sem-permissao`; registrar `/configuracao-pendente` em `web/src/app/routes.tsx`

**Checkpoint**: US1–US4 — acesso por papel e perfil completo de ponta a ponta.

---

## Phase 7: User Story 5 - Funcionamento seguro diante de falhas do Core e da instância (Priority: P2)

**Goal**: Core fora do ar mantém sessões válidas e recusa login/equipe com `503`; projeção
inacessível → `503`; revalidação periódica da conexão com troca de credencial e descarte de
instância não ativa; boot com nova tentativa.

**Independent Test**: com o par A e o Core falso controlável, derrubar o Core, bloquear o `_acc`,
trocar `credentialVersion`, mudar `state` e verificar respostas e logs.

### Tests for User Story 5 ⚠️

- [ ] T095 [P] [US5] Escrever `api/tests/integration/core-indisponivel.test.ts` (AC-COR-004, INT-050.4, SEC-BASE-07): sessão válida + Core derrubado → `GET /api/sessao` `200`; login e `GET /api/equipe/membros` → `503 SYSTEM_IDENTITY_UNAVAILABLE` com `Retry-After` em ≤ 3,5 s (Core falso pendurado); revogar o privilégio de `SELECT` no `_acc` ou derrubar o pool `_acc` → rotas protegidas `503`; sessão com inatividade vencida → `401`
- [ ] T096 [P] [US5] Escrever `api/tests/integration/revalidacao-conexao.test.ts` (INT-020, SEC-BASE-19): com relógio falso, após 10 min o `/connection` é consultado; `credentialVersion` nova → novos pools com a nova credencial e os antigos fechados após drenar, sem erro nas requisições em curso; erro MySQL 1045 provocado → revalidação imediata; `state` diferente de `ativa` → pools fechados e `/api/*` `503`; volta a `ativa` → recupera; `tls=required` → pool criado com `ssl`; fora do dev com `tls` ausente → `ssl` mesmo assim
- [ ] T097 [P] [US5] Escrever `api/tests/integration/boot-retentativa.test.ts`: Core indisponível no boot → servidor HTTP sobe, SPA servida, `/api/saude` `503`, nova tentativa com espera progressiva (5 s → 60 s) e transição para `pronta` quando o Core volta, sem reiniciar o processo

### Implementation for User Story 5

- [ ] T098 [US5] Criar `api/src/instancia/revalidacao.ts` e ligá-lo ao `gerenciador.ts` (intervalo de 10 min com `unref()`; gatilho por erros MySQL 1044/1045 vindos dos repositórios; troca atômica da referência de pools e fechamento dos antigos com `pool.end()` após drenar; `state` não `ativa` → fecha pools e `indisponivel`; retentativa do boot com espera progressiva 5 s → 60 s; logs `instancia.credencial_trocada`, `instancia.indisponivel`, `instancia.recuperada` sem segredos) (INT-020, SEC-BASE-19, R-08)
- [ ] T099 [US5] Atualizar `api/src/modules/acesso/projecao.ts` e `api/src/middleware/sessao.ts` para mapear falha de conexão/consulta no `_acc` em `503 SYSTEM_DEPENDENCY_UNAVAILABLE` retryable (nunca `401`), e `api/src/modules/acesso/rotas.ts` e `api/src/modules/equipe/membros.rotas.ts` para responder `503 SYSTEM_IDENTITY_UNAVAILABLE` com `Retry-After: 5` quando o cliente do Core expira ou falha (INT-050.4)
- [ ] T100 [P] [US5] Atualizar `web/src/api/client.ts` e `web/src/pages/erros/IndisponivelPage.tsx` para que `503` em navegação inicial leve à página indisponível com "Tentar de novo", e `503` em ação dentro de tela mostre `Alert` "Serviço de acesso indisponível, tente em instantes" sem perder o formulário

**Checkpoint**: todas as histórias funcionais e testadas isoladamente.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: prova de ponta a ponta com o Core real, desempenho, varreduras e evidências.

- [ ] T101 Escrever `web/tests/e2e/int110.spec.ts` com a etiqueta `@int110` contra o Core real (`cortivo-a`, `cortivo-b`, Tuteli; T016): 1) credencial de A pedindo `/connection`, `/sessions`, `/sessions/touch` e `/members` de B → recusa idêntica à de inexistente; 2) login, requisição, logout, reuso do cookie → `401`; 3) rebaixar no Core → próxima definição de perfil → `403`; 4) revogar em A preservando B; suspender A e reativar exige novo login; cookie do Tuteli → `401`; 5) Core parado com sessão válida → leitura `200`, login `503`, `_acc` bloqueado → `503`; 6) `X-Forwarded-For` variado do mesmo socket → `429` e IP real no evento. Registrar que o item 7 é da C09 (INT-110, AC-COR-002..004, SEC-BASE-01 com Core 1.4)
- [ ] T102 [P] Escrever `api/tests/integration/desempenho-autorizacao.test.ts` com a massa declarada (10 sessões concorrentes, 12 membros, 12 profissionais) medindo `authzMs` e o tempo total de `GET /api/sessao` e `GET /api/equipe/membros` (Core falso sem atraso), calculando p95 e falhando acima de 800 ms no total; gravar resultado e ambiente em `specs/001-base-acesso-cortivo/evidence.md` (SC-003, FR-042, NFR-COR-004)
- [ ] T103 [P] Criar `scripts/check-bundle.mjs` (falha se `web/dist` contiver `SESSION_SECRET`, `SPARKCORE_APP_CREDENTIAL`, `password`, `process.env`, nomes de variáveis do servidor ou valores do `.env` local) e `api/tests/integration/varredura-segredos.test.ts` (executa os cenários de login, logout, convite e erro e verifica que logs capturados, respostas, auditoria e fixtures não contêm token, senha, link de convite, cookie nem `password` do `/connection`) (FR-040, SC-008)
- [ ] T104 [P] Escrever `web/tests/e2e/csp.spec.ts` que navega por todas as rotas com a CSP de produção servida pela API e falha em qualquer violação de CSP no console; se o DS exigir estilo inline, ajustar `api/src/middleware/cabecalhos.ts` liberando somente `style-src-attr 'unsafe-inline'` e registrar a decisão em `specs/001-base-acesso-cortivo/research.md` (R-09)
- [ ] T105 [P] Rodar `node scripts/check-ui.mjs`, `npm audit --omit=dev --audit-level=moderate` e o teste de marca; registrar resultado e versões de `hono`/`@hono/node-server` em `specs/001-base-acesso-cortivo/evidence.md` (SEC-BASE-09, G3, G6)
- [ ] T106 Completar `specs/001-base-acesso-cortivo/evidence.md` com a matriz requisito → teste → resultado (FR-001..FR-044, SC-001..SC-009, `SEC-BASE-*` aplicáveis, portões G1–G6, `AC-COR-001` remetido à Parte A no Core, `AC-COR-002..004`, `AC-COR-021` parcial) e as dependências abertas (SEC-BASE-01/D-COR-10 bloqueando homologação; D-COR-07 bloqueando dados reais)
- [ ] T107 Executar o roteiro de [quickstart.md](./quickstart.md) (verificações automáticas, jornada J01 manual, roteiro de isolamento), cronometrar a jornada J01 manual com uma pessoa que não participou do desenvolvimento (meta SC-006: perfil atribuído em até 3 minutos, primeira tentativa, sem ajuda), registrar o tempo em `specs/001-base-acesso-cortivo/evidence.md` e corrigir divergências entre o quickstart e o comportamento real
- [ ] T108 [P] Criar `README.md` na raiz com propósito, pré-requisitos, comandos (`npm run dev`, testes, build), variáveis de `api/.env.example`, vínculo com a constituição e com [docs/escopo](../../docs/escopo/) e o aviso de que o artefato de migração vive no Core

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências.
- **Foundational (Phase 2)**: depende do Setup. T012–T016 correm no repositório do Core e podem
  andar em paralelo à base deste repositório; T017–T020 dependem de T012–T014 (artefato
  publicado) e do esquema da projeção do Core. Ordem interna obrigatória (Princípio V):
  utilitários de teste T017–T021 → testes de alto risco T022–T027 (devem falhar) →
  implementação T028–T041 → web T042–T045. Bloqueia todas as histórias.
- **US1 (Phase 3)** e **US2 (Phase 4)**: dependem só da Fase 2; podem correr em paralelo.
- **US3 (Phase 5)**: depende da Fase 2; usa a casca de US1 para a tela (T084–T088 dependem de
  T058–T060, T065); a API de US3 é independente de US1.
- **US4 (Phase 6)**: depende da Fase 2 e de T056 (`GET /api/sessao`); o E2E T090 depende de US3
  (definir perfil pela tela).
- **US5 (Phase 7)**: depende da Fase 2; T099 toca arquivos de US1 (T056) e US3 (T082).
- **Polish (Phase 8)**: depende das histórias desejadas; T101 depende de T016 (instâncias reais)
  e de US1–US4.

### User Story Dependencies

```text
Setup → Foundational ─┬─ US1 (P1) ─┬─ US3 (tela) ─ US4 (E2E)
                      ├─ US2 (P1)  │
                      ├─ US3 (API) ┘
                      ├─ US4 (API)
                      └─ US5 ────────────────────── Polish (INT-110 real, p95, evidências)
```

### Within Each User Story

- Testes escritos antes e falhando; depois regras puras → repositório → serviço → rotas → telas.
- Cada história termina com seu checkpoint verde antes de avançar na ordem de prioridade.

### Parallel Opportunities

- Setup: T003–T011 em paralelo após T001–T002.
- Fundação: Parte A no Core (T012–T016) em paralelo com T028–T032; T035, T036, T022 em paralelo
  entre si; T043–T045 em paralelo.
- Testes de cada história marcados [P] em paralelo; US1 e US2 em paralelo; APIs de US3, US4 e US5
  em paralelo após a fundação.

---

## Parallel Example: User Story 1

```bash
# Testes de US1 juntos (devem falhar):
Task: "T046 ip-cliente em api/tests/unit/ip-cliente.test.ts"
Task: "T047 limite-login em api/tests/unit/limite-login.test.ts"
Task: "T048 login/logout em api/tests/integration/login-logout.test.ts"
Task: "T049 sessão em api/tests/integration/sessao.test.ts"
Task: "T051 nav e crumbs em web/tests/unit/nav.test.ts e crumbs-titulo.test.ts"

# Peças independentes de US1:
Task: "T054 api/src/modules/acesso/ip-cliente.ts"
Task: "T055 api/src/modules/acesso/limite-login.ts"
Task: "T057 web/src/app/nav.ts e titulo.ts"
Task: "T058 web/src/app/Brand.tsx e PageHeader.tsx"
Task: "T063 web/src/pages/hoje/HojePage.tsx"
Task: "T064 páginas em breve e de erro"
```

## Parallel Example: User Story 3

```bash
Task: "T071 api/tests/integration/profissionais.test.ts"
Task: "T072 api/tests/integration/perfis.test.ts"
Task: "T073 api/tests/integration/auditoria-privilegio.test.ts"
Task: "T074 api/tests/integration/equipe-core.test.ts"
Task: "T078 api/src/modules/auditoria/registrar.ts"
Task: "T079 api/src/modules/comum/idempotencia.ts"
Task: "T085 DialogoConvite.tsx"  Task: "T086 DialogoMotivo.tsx"  Task: "T087 DialogoPerfil.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Fase 1 (Setup) → Fase 2 (Fundação, incluindo a Parte A no Core).
2. Fase 3 (US1): administrador entra, vê a casca completa e sai.
3. **PARAR e VALIDAR**: T048–T053 verdes; demonstrar J01 até "vê a casca".

### Incremental Delivery

1. Fundação → US1 (MVP) → US2 (isolamento e efeito imediato provados; G2).
2. US3 (equipe e perfis) → US4 (acesso do colaborador) → fecha `AC-COR-021` parcial.
3. US5 (resiliência) → Polish (INT-110 contra Core real, p95, varreduras, evidências).
4. Homologação só após SEC-BASE-01 com Core 1.4 (`D-COR-10`); dados reais só após `D-COR-07`.

### Parallel Team Strategy

- Pessoa A: Parte A no Core (T012–T016) e depois E2E (T101).
- Pessoa B: API (fundação → US2 → US3 API → US5).
- Pessoa C: Web (fundação web → US1 telas → US3 telas → US4 telas).

---

## Notes

- [P] = arquivos diferentes, sem dependência de tarefa incompleta.
- [CORE] = repositório do SparkCore; nunca editar o Core a partir deste repositório nem alterar
  contratos `/internal/v1`.
- Commits por tarefa ou grupo lógico, com os IDs (`feat(acesso): … [INT-050]`).
- Nenhum segredo em log, URL, resposta, bundle, CSV, auditoria ou fixture; massa sempre sintética.
