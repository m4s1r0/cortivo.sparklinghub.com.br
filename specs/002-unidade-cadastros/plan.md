# Implementation Plan: Unidade e cadastros do Cortivo (C02)

**Branch**: `002-C02-unidade-e-cadastros` | **Date**: 2026-11-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-unidade-cadastros/spec.md`

## Summary

Entregar C02: configuração e prontidão da unidade, clientes e preferências, catálogo de serviços
e itens, profissionais com habilitações/expediente/bloqueios, e auditoria administrativa mínima.
As operações são isoladas à instância, autorizadas pela sessão/projeção estabelecida em C01,
versionadas e auditadas na mesma transação local. A interface estende a casca e o design system
do projeto, com formulários acessíveis e consulta paginada.

Abordagem:

- **Persistência**: próxima versão do artefato do Cortivo no Core (prevista como `0003_cadastros`,
  após confirmar a versão 2 e reservar o número); atualizar o fixture espelhado. Acrescentar
  entidades locais sem FK entre banco operacional e projeção de acesso.
- **API**: estender o monólito Hono com módulos `unidade`, `clientes`, `catalogo`,
  `profissionais/disponibilidade` e `auditoria`; contrato REST aditivo documentado em
  [api-cortivo-c02.openapi.yaml](./contracts/api-cortivo-c02.openapi.yaml). Reutilizar sessão,
  validação, envelope de erro, paginação, correlação e idempotência de C01.
- **Web**: adicionar formulários e listagens de unidade, clientes, catálogo, profissionais e
  auditoria à SPA React; documentar comportamento em [interface.md](./contracts/interface.md).
- **Prova**: testes unitários de regras puras, MySQL 8.4 real para integridade/conflitos/
  concorrência, testes de contrato, E2E Playwright + axe e checagens de isolamento A/B.

Pesquisa e decisões consolidadas em [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript 5.8, `strict` e `noUncheckedIndexedAccess`, Node.js 22 LTS ESM;
React 19 no navegador.

**Primary Dependencies**: API — Hono 4, `@hono/node-server` 2, Kysely 0.29, mysql2 3, uuid 11.
Web — React/React DOM 19, React Router 7, TanStack Query 5, design system 0.5.0 vendorizado,
Tailwind 4 e Vite 7. Testes — Vitest 5, Playwright 1 e axe. Reutilizar dependências declaradas,
sem biblioteca nova nesta fatia.

**Storage**: MySQL 8.4 exclusivo por instância. Esquema C01 v2 como base; migração de cadastros
reservada como v3 (`0003_cadastros`), a confirmar/publicar pelo Core. Instantes UTC, horário
semanal local à unidade, dinheiro em centavos e quantidades em milésimos.

**Testing**: `npm run typecheck`, `npm run lint`, `npm run test:unit`,
`npm run test:integration` contra MySQL 8.4 real, `npm run test:contract`,
`npm run test:e2e` com Playwright/axe e `npm run build`. Suítes e infraestrutura já declaradas;
os diretórios-fonte `api/src` e `web/src` ainda não existem neste checkout.

**Target Platform**: API Linux com Node 22, um processo por instância; navegadores evergreen de
320 px a desktop, zoom de 200%.

**Project Type**: aplicação web em monólito modular `api/` + `web/`, SPA e API na mesma origem
fora do ambiente de desenvolvimento.

**Performance Goals**: lista paginada e pesquisa de clientes, profissionais, serviços, itens e
auditoria respondem em p95 ≤ 800 ms no ambiente de referência declarado, com até 10 sessões
concorrentes e massa sintética de 10 mil clientes/12 profissionais. Medir sem incluir inicialização
fria; não afirmar metas sem evidência.

**Constraints**:

- Instância e ator vêm do contexto validado de C01; banco, papel, perfil ou identificador enviados
  pelo cliente não são autoridade.
- Nenhuma FK cruza banco operacional e banco de acesso; não alterar contratos `/internal/v1`.
- Alterações de cadastros e auditoria são atômicas; auditoria somente `SELECT, INSERT`.
- Conflitos de versão retornam `409`; entidades em uso são inativadas, nunca apagadas.
- Paginação respeita teto global de 10.000; não registrar SQL, segredos ou dados pessoais completos.
- Preferências não disparam comunicações; C02 não implementa agenda nem movimentação de estoque.
- D-COR-07 segue aberta: usar dados sintéticos e bloquear homologação com dados reais.

**Scale/Scope**: uma unidade por instância; aproximadamente 10 entidades de cadastros, 8 famílias
de operação API e telas de Configurações, Clientes, Catálogo, Equipe/Profissional e Auditoria.
Cobertura de requisitos `COR-001..004`, `COR-020`, `NFR-COR-002` e aceite `AC-COR-021`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constituição do Cortivo **1.0.0**. Resultado pré-pesquisa: **PASS**, sem desvio de princípio.
Resultado pós-design: **PASS**, condicionado a duas dependências de execução conhecidas: C01
precisa entregar a base de sessão/autorização e a versão 2 do esquema; o Core precisa publicar o
artefato de cadastros antes de aplicar sua migração. Não há clarificação de projeto pendente.

**Precondição observada**: este checkout contém manifests e infraestrutura de testes, mas ainda
não contém `api/src` nem `web/src`; os planos/documentos de C01 não substituem a implementação.
Antes de executar tarefas C02, confirmar que C01 foi implementada e validada ou incluir sua entrega
como pré-requisito explícito no fluxo de execução. Nenhuma operação C02 deve contornar essa
dependência criando uma segunda sessão ou autorização.

| Princípio | Como o plano cumpre | Evidência / teste |
| --- | --- | --- |
| **I Isolamento por instância** | Consultas e mutações operam apenas no banco derivado da instância validada em C01; associação de IDs locais rejeita IDs de B; sem aceitar contexto do cliente | Integração em duas instâncias sintéticas A/B em MySQL 8.4; busca, leitura e mutação cruzada retornam recusa genérica/404 sem efeito |
| **II Identidade e autorização no servidor** | Reutiliza a projeção de C01 em toda requisição; administrador altera unidade/equipe/catálogo/auditoria; recepção opera cliente e lê catálogo/profissionais dentro do papel permitido; perfil local apenas restringe | Testes de matriz de papel/perfil, membro revogado e acesso direto à API |
| **III Contratos versionados com Core** | Nenhuma chamada nova ao Core nem mudança de `/internal/v1`; IDs de membros são referências opacas da projeção; artefato de migração é publicado pelo Core e espelhado com teste de deriva | Validação do manifesto v3 e contrato local C02; guarda do fixture Core |
| **IV Idempotência e concorrência** | Atualizações de cadastros exigem `version`; mutações com efeitos suportam `Idempotency-Key`; validação de versões/estados ocorre na transação; intervalos e preferências são substituídos atomicamente | Concorrência de versão, duplicação de preferência/associação e colisão de perfil em MySQL real |
| **V Verificação com MySQL real** | Typecheck, lint, unidade, integração, contrato, E2E e axe; migração testada do zero e de v2; regras de intervalo cobertas na fronteira | Gates do quickstart e evidência por requisito/cenário |
| **VI Rastreabilidade, auditoria e privacidade** | IDs de requisito nas tarefas/testes; escrita comercial e auditoria na mesma transação; PII minimizada; dados sintéticos | Teste de privilégio `UPDATE`/`DELETE`, falha atômica de auditoria e varredura de logs/snapshots |
| **VII Monólito e disciplina de escopo** | Mantém API e web no monorepo; sem serviço separado; agenda, caixa, comunicação e estoque operacional fora | Revisão do escopo de C02; os diretórios-fonte a criar permanecem dentro de `api/` e `web/` |
| **VIII Interface pelo DS e padrão canônico** | Reutiliza DS 0.5.0, casca C01, breadcrumbs, máscaras, estados, teclado e viewport móvel; nenhum token ou componente duplicado | Playwright/axe em 320/360/768/1280 px e zoom 200% |
| **IX Linha de base de segurança** | Mantém origem, JSON, limite de corpo, cabeçalhos, correlação e tratamento seguro de C01; valida autorização, minimização, paginação e dados CSV (sem CSV novo em C02) | Testes existentes + casos negativos para cada defesa introduzida nesta fatia |

### Portões ECO-016

| Portão | Situação no plano |
| --- | --- |
| G1 Ready | Atendido por [api-cortivo-c02.openapi.yaml](./contracts/api-cortivo-c02.openapi.yaml), [interface.md](./contracts/interface.md) e [data-model.md](./data-model.md) |
| G2 Isolamento | Integração A/B e requisições com IDs de instância cruzados |
| G3 Segurança | Verificação de privilégios de auditoria, origem/sessão herdada e minimização |
| G4 Interface | E2E de jornadas C02, teclado, viewport e axe |
| G5 Contrato Core | Sem alteração no `/internal/v1`; confirmar manifestação/espelho de migração antes de integrar |
| G6 Design System | Sem troca de versão; DS 0.5.0 e seus tokens públicos continuam fixos |

## Project Structure

### Documentation (this feature)

```text
specs/002-unidade-cadastros/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-cortivo-c02.openapi.yaml
│   └── interface.md
└── tasks.md                 # próxima fase; /speckit-plan não cria
```

### Source Code (repository root)

```text
api/
├── src/
│   ├── modules/
│   │   ├── unidade/
│   │   ├── clientes/
│   │   ├── catalogo/
│   │   ├── equipe/             # extensão de perfil/profissional de C01
│   │   ├── disponibilidade/    # expediente e bloqueios; cálculo puro
│   │   └── auditoria/          # consulta administrativa mínima
│   ├── db/                     # conexão e migrações espelhadas do artefato Core
│   └── shared/                 # limites reutilizáveis de sessão, autorização, erros, paginação e correlação de C01
└── tests/
    ├── unit/
    ├── integration/
    ├── contract/
    └── fixtures/artifact/      # espelho publicado pelo Core

web/
├── src/
│   ├── app/                    # rotas e layouts da casca C01
│   ├── modules/
│   │   ├── unidade/
│   │   ├── clientes/
│   │   ├── catalogo/
│   │   ├── equipe/
│   │   └── auditoria/
│   └── shared/                 # cliente HTTP, componentes e DS existentes
└── tests/
    ├── unit/
    └── e2e/
```

**Structure Decision**: monólito modular definido pela constituição e dependências já declaradas.
Os diretórios-fonte ainda precisam ser materializados; não há módulos C01 a reutilizar no checkout
atual. Cada módulo C02 é dono de validação e operações do seu domínio; regras puras de
interseção/intervalos vivem no módulo disponibilidade, e a autorização deve reutilizar o middleware
e serviços centrais entregues em C01. O artefato executável da migração é propriedade do Core;
`api/tests/fixtures/artifact/` é apenas espelho validado.

## Complexity Tracking

Sem violações da constituição que exijam justificativa.
