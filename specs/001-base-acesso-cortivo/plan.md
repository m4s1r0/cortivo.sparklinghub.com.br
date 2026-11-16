# Implementation Plan: Base e acesso do Cortivo (C00 + C01)

**Branch**: `001-base-acesso-cortivo` | **Date**: 2026-11-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-base-acesso-cortivo/spec.md`

## Summary

Criar o repositório do Cortivo (C00) e a camada de instância e acesso (C01). Ao final, uma
instância provisionada pelo SparkCore sobe num processo próprio e confere a própria identidade.
O administrador convidado entra e define os perfis locais da equipe. Todas as telas usam a casca
canônica do ecossistema, com breadcrumbs e a marca do Cortivo.

Abordagem:
- **Estrutura:** monólito `api/` (Hono + Kysely + mysql2) e `web/` (React 19 + React Router 7 +
  TanStack Query 5 + Vite 7 + Tailwind 4), com design system 0.5.0 vendorizado.
- **Integração com o Core:** um único cliente em `api/src/core/`, com contrato `/internal/v1`
  1.4.0 que tolera respostas da 1.3.3.
- **Autorização:** em toda requisição, pela regra normativa da projeção de acesso v2. Não há
  cache e o cookie não carrega papel; o conteúdo é cifrado com AES-256-GCM.
- **Linha de base de segurança:** aplicada como middleware desde o primeiro commit.
- **Prova:** isolamento demonstrado com dois pares de bancos sintéticos (A e B) em MySQL 8.4 real
  e com E2E contra o Core real.

Decisões em [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript 5.8 (`strict`, `noUncheckedIndexedAccess`) em Node.js 22 LTS
(ESM); React 19 no navegador.

**Primary Dependencies**: API — `hono` 4, `@hono/node-server` 1 (acima das versões de
`SEC-BASE-09`), `kysely` 0.29, `mysql2` 3, `uuid` 11. Web — `react`/`react-dom` 19,
`react-router` 7, `@tanstack/react-query` 5, `lucide-react`, `@sparkling-hub/design-system`
0.5.0 (`file:../vendor/design-system/sparkling-hub-design-system-0.5.0.tgz`, sha256
`58381c2e…cf36`), `tailwindcss` 4 + `@tailwindcss/vite`, `vite` 7. Dev — `vitest`,
`@playwright/test` + `@axe-core/playwright`, `ajv` (contrato), ESLint 9 + `typescript-eslint` +
`react-hooks` + `jsx-a11y`, Prettier.

**Storage**: MySQL 8.4, banco operacional `cortivo_<uuid>` (migrações 1–2 do artefato no Core)
e banco de acesso `cortivo_<uuid>_acc` (projeção v2, somente leitura + `INSERT` de logout).

**Testing**: Vitest (unit, integração com MySQL 8.4 real em `127.0.0.1:3307` e dois pares
descartáveis `t_*`, contrato com Ajv), Playwright + axe (E2E contra o SparkCore local com duas
instâncias Cortivo e uma Tuteli).

**Target Platform**: servidor Linux com Node 22 (um processo por instância, `ECO-012.1`);
navegadores evergreen de 320 px a desktop.

**Project Type**: aplicação web (monólito modular `api/` + `web/`, mesma origem fora do dev).

**Performance Goals**: p95 de uma leitura protegida completa ≤ 800 ms (com a autorização pela
projeção medida separadamente e registrada em `evidence.md`), com ambiente e massa declarados
(10 sessões concorrentes, 12 membros, 12 profissionais).

**Constraints**:
- Revogação, rebaixamento, logout e suspensão valem na requisição seguinte, sem cache de
  autorização.
- Timeouts do Core: 2 s no boot, 3 s nas demais chamadas.
- Corpo de requisição até 1 MiB; paginação até 10.000.
- Nenhum segredo em log, URL, `web/dist`, CSV ou fixture.
- Dados sintéticos apenas (`D-COR-07` aberta).

**Scale/Scope**:
- Uma unidade por instância e piloto com dezenas de instâncias.
- Nesta fatia: telas de Login, Hoje, Equipe e Configuração pendente, páginas de erro, 11
  placeholders e 17 rotas de API.
- Tabelas usadas: `profissional` e `perfil_colaborador` (de negócio) e quatro de infraestrutura;
  `unidade` já existe na 0001 mas só é usada na C02.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constituição do Cortivo **1.0.0**. Resultado pré-pesquisa: **PASS** (sem violação; uma
dependência externa registrada). Resultado pós-design: **PASS** (abaixo).

| Princípio | Como o plano cumpre | Evidência / teste |
| --- | --- | --- |
| **I Isolamento** | Bases `cortivo_<uuid>`/`_acc` exclusivas; um processo por instância (`SPARKCORE_INSTANCE_SLUG`); pools atados a `instanceId` + `credentialVersion`, sem `USE`; marcadores conferidos no boot (`503` + evento); nada do cliente é autoridade; `404` idêntico para outra instância | integração A/B (rota, corpo, cabeçalho, cookie, IDs, pool reutilizado); E2E `INT-110.1`, `AC-COR-003`; G2 |
| **II Identidade no servidor** | Login delegado ao Core; regra normativa da projeção a cada requisição; papel e `membership_id` da projeção; perfil local só restringe; `touch` fora do caminho crítico; logout grava `access_session_logout`; equipe só via `/internal/v1`; último administrador é do Core | unit perfil efetivo; integração `INT-050`/`060`/`070`; E2E `INT-110.2–5`, `AC-COR-002/004` |
| **III Contratos com o Core** | Cliente único `api/src/core/`; `/internal/v1` **1.4.0** + tolerância 1.3.3; projeção v2; timeouts; envelope de erro; espelho do artefato com teste de deriva; nenhum pedido de mudança de contrato | [core-consumo.md](./contracts/core-consumo.md); `test:contract`; G5 |
| **IV Idempotência e concorrência** | `Idempotency-Key` repassado ao Core em convite/papel/revogação; tabela `idempotencia` em `POST /profissionais`; `version` otimista em perfil e profissional; `UNIQUE` gerada para barbeiro↔profissional; `FOR UPDATE` no profissional | integração concorrente em MySQL real (dois administradores, mesmo profissional, chave repetida) |
| **V Verificação** | typecheck, lint, unit, integração MySQL 8.4 real, contrato, E2E + axe; testes de alto risco escritos falhando antes (na fundação, bloco "Testes de alto risco" precede a implementação de cookie, instância, projeção e borda); matriz de estados testada por tela; `evidence.md` por requisito | CI ([quickstart](./quickstart.md)) |
| **VI Rastreabilidade e privacidade** | IDs em spec/plano/tarefas/commits; auditoria só-inserção (`appendOnlyTables`, privilégio `SELECT, INSERT`) cobrindo perfis, profissionais e as ações de equipe feitas via Core ([R-12](./research.md)); `X-Correlation-Id` repassado ao Core ([R-18](./research.md)); telefone mascarado na auditoria; link de convite e segredos nunca logados; sem e-mail de terceiros (só `emailMasked` de convite pendente); dados sintéticos | integração de privilégio; varredura de logs/bundle |
| **VII Monólito e escopo** | `api/` + `web/` com stack `ECO-011`; regras de C02+ fora; associação admin↔profissional adiada para C02 ([R-10](./research.md)) | revisão de escopo no `/speckit-analyze` |
| **VIII Interface** | DS 0.5.0 vendorizado, ordem `layers → DS → app`, `.sh-theme`; casca `UI-010`; `PageHeader` + `Breadcrumb` em toda rota; `NAV` da modelagem; tokens apenas; `mask="phone"`; marca com sha256; matriz `UI-060` por tela | [interface.md](./contracts/interface.md); `check-ui.mjs`; E2E G4 |
| **IX Linha de base** | Todos os `SEC-BASE` aplicáveis implementados nesta fatia (tabela abaixo); `-01` registrado como dependência do Core | teste por item, falhando sem a defesa; G3 |

### Portões ECO-016

| Portão | Situação no plano |
| --- | --- |
| G1 Ready | Atendido por [interface.md](./contracts/interface.md) (estados, breadcrumbs, campos com máscara, papéis/perfis), [api-cortivo.openapi.yaml](./contracts/api-cortivo.openapi.yaml) (erros, idempotência, versão) e [data-model.md](./data-model.md) (concorrência) |
| G2 Isolamento | Suíte de integração A/B + E2E `INT-110.1`/`AC-COR-003` |
| G3 Segurança | Tabela `SEC-BASE` abaixo + `npm audit --omit=dev` no CI |
| G4 Interface | E2E: casca, breadcrumb, 320/360/768/1280 px, teclado, axe |
| G5 Contrato Core | `/internal/v1` 1.4.0 (+1.3.3) fixado; `test:contract`; Tuteli não é afetado (nenhuma mudança de contrato) |
| G6 DS | Entrada inicial em `docs/design-system-updates.md` (0.5.0, sha256, origem, testes) |

### Linha de base de segurança → teste (falha sem a defesa)

| Item | Aplicável | Defesa | Teste |
| --- | --- | --- | --- |
| SEC-BASE-01 | dependência do Core | credencial vinculada à instância quando Core 1.4 | E2E `INT-110.1` (bloqueia homologação até passar, `D-COR-10`) |
| SEC-BASE-02 | sim | IP real (`TRUSTED_PROXIES`, salto à direita), 20/15 min/IP | unit `ip-cliente`, integração `429` com XFF forjado |
| SEC-BASE-03 | sim | `INSERT IGNORE` logout antes de apagar cookie | integração: cookie antigo → `401`; falha de gravação ainda apaga cookie |
| SEC-BASE-04 | sim | papel da projeção | integração: rebaixar na projeção → `403` na próxima escrita |
| SEC-BASE-05 | sim | origem + JSON + `SameSite=Strict` | integração: `Origin` alheio → `403`; `text/plain` → `415` |
| SEC-BASE-06 | sim | AES-256-GCM, `iat`/`exp`, `__Host-`, rotação | unit: adulterado/expirado/chave anterior; integração: atributos do `Set-Cookie` |
| SEC-BASE-07 | sim | timeouts 2 s/3 s → `503` | integração com Core falso lento |
| SEC-BASE-08 | sim | `bodyLimit` 1 MiB → `413` | integração |
| SEC-BASE-09 | sim | dependências sem moderado+ | CI `npm audit --omit=dev` |
| SEC-BASE-10 | sim | cabeçalhos em SPA, API e erro | integração em `/`, `/api/sessao`, `404` |
| SEC-BASE-11 | não (sem documento; `D-COR-09`) | — | — |
| SEC-BASE-12 | sim | `auditoria` em `appendOnlyTables` | integração: `UPDATE`/`DELETE` falham por privilégio |
| SEC-BASE-13/14/16/22 | Core | — | — |
| SEC-BASE-15 | sim | `ssl` no pool com `tls=required` e fora do dev | unit da configuração do pool; homologação |
| SEC-BASE-17 | sim | correlação só UUID | integração: valor não UUID substituído |
| SEC-BASE-18 | sim | `onError` sem SQL/valores | integração: erro de banco provocado → log sem SQL |
| SEC-BASE-19 | sim | revalidação 10 min + 1044/1045; descarte se não ativa | integração com Core falso trocando `credentialVersion`/`state` |
| SEC-BASE-20 | sim | `offset ≤ 10000`, `limit ≤ 100` | unit + integração `422` |
| SEC-BASE-21 | sim (utilitário) | neutralização CSV | unit |

### Mapa de telas (detalhe em [interface.md](./contracts/interface.md))

| Tela | Breadcrumb | Componentes DS | Máscaras |
| --- | --- | --- | --- |
| Login | — (pública) | `Card`, `Field`, `Input`, `Button`, `Alert`, `Spinner` | — (e-mail/senha) |
| Hoje | Cortivo › Hoje | `Breadcrumb`, `StatsBlock`, `EmptyState`, `Skeleton`, `Alert` | — |
| Equipe | Cortivo › Equipe | `Breadcrumb`, `Tabs`, `Badge`, `Pagination`, `Dialog`, `Field`, `Input`, `Select`, `Checkbox`, `Button`, `Toast`, `Alert`, `EmptyState`, `Skeleton` | telefone `phone` |
| Configuração pendente | Cortivo › Configuração pendente | `Breadcrumb`, `EmptyState`, `Button` | — |
| Placeholders (11) | Cortivo › *Rótulo* | `Breadcrumb`, `EmptyState` | — |
| 403 / 404 | Cortivo › Sem permissão / Página não encontrada | `Breadcrumb`, `EmptyState`, `Button` | — |
| 503 / 401 | pública | `Card`, `Alert`, `Button` | — |
| Casca | — | `Drawer`, `Button`, ícones `lucide-react` | — |

## Project Structure

### Documentation (this feature)

```text
specs/001-base-acesso-cortivo/
├── plan.md              # este arquivo
├── research.md          # Fase 0
├── data-model.md        # Fase 1
├── quickstart.md        # Fase 1
├── contracts/
│   ├── api-cortivo.openapi.yaml   # API própria (SPA ↔ API)
│   ├── core-consumo.md            # /internal/v1 consumido (G5)
│   └── interface.md               # casca, rotas, campos, estados (G1/G4)
├── checklists/requirements.md
├── evidence.md          # criado na implementação (p95, ensaios, SEC-BASE)
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
package.json                 # workspaces api, web; scripts typecheck/lint/test:*/build
eslint.config.js · .prettierrc · tsconfig.base.json
scripts/check-ui.mjs         # cor literal, !important em sh-*, campo especial sem mask
scripts/check-bundle.mjs     # segredos/variáveis do servidor em web/dist
vendor/design-system/sparkling-hub-design-system-0.5.0.tgz
docs/design-system-updates.md
.github/workflows/ci.yml     # typecheck, lint, unit, integração (MySQL 8.4), contrato, e2e, audit

api/
├── .env.example
├── src/
│   ├── main.ts              # sobe HTTP, inicia GerenciadorInstancia
│   ├── app.ts               # composição Hono, ordem dos middlewares, SPA estática
│   ├── env.ts               # validação de configuração (falha cedo)
│   ├── core/                # ÚNICO cliente do SparkCore (tipos, timeouts, tradução de erros)
│   ├── instancia/           # boot, pools, conferência de marcador e esquema, revalidação
│   ├── middleware/          # correlacao, cabecalhos, origem-json, prontidao, sessao, perfil, erro
│   ├── modules/
│   │   ├── acesso/          # login, logout, sessão, cookie, ip-cliente, limite-login, projecao, atividade
│   │   ├── equipe/          # proxy de membros/convites, perfis (regras puras + serviço + repositório), profissionais
│   │   ├── auditoria/       # registrar (só-inserção)
│   │   └── comum/           # erros, validacao, paginacao, csv, idempotencia, uuid, log
│   └── db/                  # tipos Kysely do operacional e do _acc
└── tests/
    ├── unit/
    ├── integration/         # A/B, INT-0xx, SEC-BASE, concorrência, p95
    ├── contract/            # Ajv contra openapi do Core; deriva
    ├── fixtures/
    │   ├── artifact/        # espelho de core/.../produtos/cortivo/artifact
    │   └── access_projection/  # espelho do esquema da projeção do Core
    └── helpers/             # banco-descartavel (pares A/B), core-falso, app-teste

web/
├── index.html               # favicons, título
├── public/brand/            # 7 arquivos oficiais
├── src/
│   ├── main.tsx
│   ├── styles/{layers.css,app.css}
│   ├── app/                 # routes.tsx, layouts.tsx, nav.ts, MenuPrincipal.tsx, Brand.tsx, PageHeader.tsx, auth-guard.tsx, titulo.ts
│   ├── api/                 # client.ts (envelope, correlação, Idempotency-Key), sessao.ts, auth.ts, equipe.ts, profissionais.ts
│   └── pages/               # login/, hoje/, equipe/, configuracao-pendente/, em-breve/, erros/
└── tests/
    ├── unit/                # nav por papel/perfil, crumbs, títulos
    ├── fixtures/brand-manifesto-sha256.txt
    └── e2e/                 # J01, INT-110 (@int110), responsivo, teclado, axe
```

**Structure Decision**: monólito `api/` + `web/` (`ECO-010`), com nomes de diretório e arquivo
seguindo o Tuteli para reaproveitar guias. O artefato de migração **não** fica aqui: é autorado e
publicado no repositório do Core (Parte A) e espelhado em `api/tests/fixtures/artifact/` com
guarda de deriva. `tasks.md` deve separar as tarefas do repositório do Core das tarefas deste
repositório.

## Post-design Constitution Check

Reavaliado após [data-model.md](./data-model.md) e [contracts/](./contracts/): **PASS**.
- Nenhum princípio foi violado.
- Nenhum `NEEDS CLARIFICATION` ficou aberto.
- Nenhum pedido de mudança de contrato ao Core.
- As decisões que restringem além do mínimo estão justificadas na pesquisa: estado em memória por
  processo, logger próprio e validadores próprios.

Dependências externas (não são violações):
- **SEC-BASE-01 / D-COR-10:** a homologação fica bloqueada até haver credencial vinculada à
  instância com o Core 1.4 implantado.
- **Parte A no Core:** catálogo `cortivo`, artefato v1–v2 e provisionador são pré-requisito do
  E2E. A integração com o Core falso não depende deles.

## Complexity Tracking

Sem violações da constituição a justificar. Registros de decisão com alternativa mais simples:

| Decisão | Por que é necessária | Alternativa mais simples rejeitada porque |
| --- | --- | --- |
| Trabalho em dois repositórios (artefato e catálogo no Core) | O artefato e o provisionador pertencem ao Core (`III`, `migration-artifact.md`) | Aplicar migrações pelo Cortivo violaria privilégios e o contrato |
| Estado em memória (limite de login, touch, invalidadas) | Um processo por instância (`ECO-012.1`) torna suficiente e evita escrita por requisição | Tabela local acrescentaria escrita e migração sem ganho; revisar se houver multi-processo (exige ADR) |
| Core falso além do Core real nos testes | Provocar timeout, `204`/`200`, `tls` ausente e troca de credencial de forma determinística | Só Core real deixaria `INT-020` e `SEC-BASE-07/19` sem prova repetível |
