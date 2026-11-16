# Research — 001 Base e acesso do Cortivo (C00 + C01)

Fase 0 do plano. Cada decisão segue o formato Decision / Rationale / Alternatives. Fontes
consultadas: constituição do Cortivo 1.0.0; `core/.../contracts/` (`openapi.yaml` **1.4.0**,
`CHANGELOG.md`, `access-projection.md` v2, `conventions.md`, `migration-artifact.md`);
`core/.../docs/ecossistema/01`–`07`; `docs/escopo/`, `docs/modelagem/`; Tuteli como referência de
casca (`tuteli/tuteli.sparklinghub.com.br/web/src/app/`, `api/tests/helpers/`).

Não restou nenhum `NEEDS CLARIFICATION` no Technical Context.

---

## R-01 — Versão do design system e origem do pacote

- **Decision**: usar `@sparkling-hub/design-system` **0.5.0** a partir do `.tgz` já distribuído
  em `tuteli/tuteli.sparklinghub.com.br/vendor/design-system/sparkling-hub-design-system-0.5.0.tgz`
  (sha256 `58381c2ede514b6c2f240f09ea272b8d161b62558cba858f2f734895eb21cf36`), copiado sem
  alteração para `vendor/design-system/` e referenciado com `file:` em `web/package.json`. A
  entrada inicial de `docs/design-system-updates.md` registra versão, sha256, origem, motivo e
  testes executados (portão G6).
- **Rationale**: o pacote 0.5.0 existe e é o que o Tuteli consome; exporta `Breadcrumb`,
  `Drawer`, `EmptyState`, `StatsBlock`, `Input` com `mask`, `MaskedInput`, `Field`, `Dialog`,
  `Pagination`, `Tabs`, `Toast`, `Alert`, `Badge`, `Skeleton`, `Spinner`, e o tipo
  `MaskPreset = cpf | cnpj | cpfCnpj | phone | cep | currency | date | time | creditCard |
  cardExpiry | percent`. Com isso, `CONF-08` não bloqueia a fatia e o plano B (0.4.0 +
  `MaskedInput`) não é necessário.
- **Alternatives**: 0.4.0 com troca pendente (rejeitado: 0.5.0 disponível); aguardar publicação
  em registro npm (rejeitado: `UI-001` determina `.tgz` fixado). Confirmar com o mantenedor do DS
  que o sha256 acima é o da publicação oficial; divergência → nova entrada G6.

## R-02 — Versão do contrato `/internal/v1` consumida

- **Decision**: fixar o consumo em **`/internal/v1` 1.4.0** (`openapi.yaml` atual), convivendo
  com **1.3.3**: `touch` aceita `200 {role, membershipStatus}` e `204`; ausência de `tls` em
  `/connection` é tratada como `disabled` **apenas em desenvolvimento**; fora dele o pool exige
  TLS sempre. Autorização nunca usa o `role` do `touch` nem do login: usa `m.role` da projeção em
  cada requisição (`INT-050.2`). Operações consumidas: `GET /connection`, `POST /sessions`,
  `POST /sessions/touch`, `GET /members`, `POST /invitations`,
  `POST /invitations/{id}/revoke`, `POST /members/{id}/role`, `POST /members/{id}/revoke`, e
  `GET /health/live` do Core. Projeção de acesso **v2** (estado `pronta` tratado como não ativo).
- **Rationale**: o changelog marca v1.4 como compatível; consumir pela especificação mais nova
  e tolerar a anterior cumpre `III` (duas versões declaradas) e `G5`.
- **Alternatives**: fixar só 1.3.3 (rejeitado: obrigaria nova fatia para `tls` e `touch`).

## R-03 — Credencial de aplicação (SEC-BASE-01)

- **Decision**: `SPARKCORE_APP_CREDENTIAL` é uma única variável; em desenvolvimento pode ser
  credencial por produto (Core 1.3.x). Com Core 1.4 implantado, a credencial **precisa** estar
  vinculada à instância (`app-credential bind --instance`), senão o Core responde
  `401 AUTH_APP_CREDENTIAL_INVALID`, e o Cortivo trata como indisponibilidade de configuração
  (`503` + evento de segurança no boot). A homologação fica bloqueada até o Core v1.4 estar em
  homologação (`D-COR-10`); o teste `INT-110.1` só passa contra Core 1.4.
- **Rationale**: nenhuma mudança de código entre os dois modos; o bloqueio é operacional e
  explícito.
- **Alternatives**: emular credencial por instância no Cortivo (impossível; é regra do Core).

## R-04 — Formato do cookie de sessão (INT-040, SEC-BASE-06)

- **Decision**: cookie `__Host-cortivo_session` (`cortivo_session` só quando
  `NODE_ENV=development` **e** `PUBLIC_ORIGIN` é `http://`), `HttpOnly`, `SameSite=Strict`,
  `Path=/`, sem `Domain`, `Secure` fora do dev local. Valor = `v1.` + base64url(nonce 12 B ‖
  ciphertext ‖ tag 16 B) com **AES-256-GCM**; chave derivada por HKDF-SHA256 de
  `SESSION_SECRET` (≥ 32 bytes, validado no boot) com `info = "cortivo-session-v1"`; AAD = nome do
  cookie. Conteúdo: `{ t: <INSTANCE_TOKEN>, iat, exp }` em segundos UTC, `exp = min(expiresAt do
  Core, iat + 12 h)`. Decifra tentando a chave atual e depois `SESSION_SECRET_PREVIOUS`
  (lista separada por vírgula); emite sempre com a atual. Sem papel, vínculo, e-mail ou nome.
- **Rationale**: atende `SEC-BASE-06` sem estado no servidor; a autoridade continua na projeção.
- **Alternatives**: cookie opaco com tabela de sessões local (rejeitado: duplica a projeção);
  cookie só assinado (é a divergência do Tuteli, proibida).

## R-05 — Autorização por requisição (INT-050) e medição

- **Decision**: middleware `sessao` decifra o cookie, calcula `sha256(token)` em Node e executa
  a **regra normativa** de `access-projection.md` no pool `_acc` (consulta preparada, sem cache).
  Zero linhas → `401 AUTH_SESSION_INVALID` + cookie apagado. Contexto da requisição recebe
  `accountId`, `membershipId`, `displayName`, `role` da linha; o middleware `perfil` carrega
  `perfil_colaborador` pelo `membershipId`. A duração da consulta é medida
  (`performance.now()`) e registrada no log da requisição (`authzMs`); um teste de desempenho de
  integração calcula p95 com massa declarada e grava em `evidence.md`.
- **Rationale**: revogação na requisição seguinte exige leitura sem cache; o custo é uma
  consulta indexada por PK.
- **Alternatives**: cache curto (rejeitado: quebra `SC-002`); `touch` síncrono (divergência do
  Tuteli, proibida).

## R-06 — Atividade (touch, INT-051)

- **Decision**: mapa em memória `idHash → últimoTouch`; após responder, se passaram ≥ 5 min,
  dispara `POST /sessions/touch` com `AbortSignal.timeout(3000)`, sem aguardar. `401` → adiciona o
  `idHash` a um conjunto de invalidadas (consultado no middleware; a próxima requisição recebe
  `401`). Falha de rede → ignora. Mapa com teto de entradas e limpeza por expiração.
- **Rationale**: um processo por instância (`ECO-012.1`) torna o estado em memória suficiente.
- **Alternatives**: tabela local (rejeitado: escrita por requisição sem necessidade).

## R-07 — IP real e limite de login (INT-030, SEC-BASE-02)

- **Decision**: IP do socket via `getConnInfo` de `@hono/node-server/conninfo`. Só se o socket
  pertencer a `TRUSTED_PROXIES` (lista de IPs/CIDR, vazia por padrão), percorre
  `X-Forwarded-For` da direita para a esquerda, descartando saltos confiáveis; o primeiro não
  confiável é o cliente. Limite local de **20 tentativas / 15 min / IP** em janela deslizante em
  memória (teto de chaves), `429 AUTH_THROTTLED` com `Retry-After`. Mensagem única
  `AUTH_INVALID_CREDENTIALS` para toda falha de credencial. O IP enviado ao Core é o resolvido.
- **Rationale**: fecha a divergência "confiança em X-Forwarded-For" do Tuteli.
- **Alternatives**: limite em banco (desnecessário com processo único).

## R-08 — Boot, pools e revalidação (INT-010, INT-020, SEC-BASE-15/19)

- **Decision**: `GerenciadorInstancia` com estados `iniciando → pronta | indisponivel`. Boot:
  `GET /health/live` do Core (2 s) → `GET /connection` (3 s) → abre pool operacional e pool `_acc`
  (mysql2, sem `USE`, `ssl` quando `tls=required` ou fora do dev) → confere
  `_spark_instance.instance_id` e `access_instance.instance_id` = `instanceId` do Core → confere
  versão de esquema efetiva (`_spark_schema_history`, última aplicada sem `falha`) dentro de
  `ESQUEMA_SUPORTADO = [2, 2]` → `access_instance.state = 'ativa'`. Qualquer falha: servidor HTTP
  sobe, SPA é servida, `/api/*` (exceto `/api/saude`) responde `503 SYSTEM_INSTANCE_UNAVAILABLE`,
  log `seguranca.instancia_divergente` quando for divergência; nova tentativa com espera
  progressiva (5 s → 60 s). Revalidação a cada **10 min** e ao receber erro MySQL 1044/1045:
  `credentialVersion` nova → cria pools novos, troca a referência e fecha os antigos após drenar;
  instância não `ativa` → fecha pools e passa a `indisponivel`.
- **Rationale**: cumpre `INT-010`/`INT-020` e fecha "pool sem revalidação".
- **Alternatives**: encerrar o processo em divergência (rejeitado: sem página amigável `503`).

## R-09 — Proteções de borda (SEC-BASE-05/08/10/17/18/20/21)

- **Decision**: ordem de middlewares em `/api`: correlação → cabeçalhos → `bodyLimit(1 MiB)` →
  origem + JSON → prontidão da instância → sessão → perfil → rota → `onError`.
  - Origem: métodos `POST/PUT/PATCH/DELETE` exigem `Sec-Fetch-Site: same-origin` **ou**
    `Origin === PUBLIC_ORIGIN`; senão `403 AUTH_ORIGIN_REFUSED`. `Content-Type` diferente de
    `application/json` → `415`.
  - Cabeçalhos em todas as respostas (SPA, API, erro): CSP `default-src 'self'; frame-ancestors
    'none'; base-uri 'none'; form-action 'self'; object-src 'none'`, `nosniff`,
    `Referrer-Policy: no-referrer`, `Permissions-Policy` restritiva, HSTS fora do dev,
    `Cache-Control: no-store` em `/api`. Se o DS exigir estilo inline, libera-se somente
    `style-src-attr 'unsafe-inline'`, decidido por teste E2E com CSP ativa.
  - Correlação: aceita `X-Correlation-Id` só se UUID; senão gera UUID v7.
  - `onError`: log `{nome, codigo, correlationId}` sem mensagem de driver, SQL ou valores;
    resposta envelope `500 SYSTEM_UNEXPECTED`.
  - Paginação: `offset ≤ 10000`, `limit ≤ 100`; utilitário CSV neutraliza `= + - @ \t \r`.
- **Rationale**: cada item tem teste que falha sem a defesa (`IX`).

## R-10 — Perfis locais, profissional e concorrência

- **Decision**: tabelas `profissional` (cadastro mínimo) e `perfil_colaborador` na migração
  **0002** do artefato. `perfis` é `SET('recepcao','barbeiro')` não vazio; coluna gerada
  `barbeiro_profissional_chave = IF(FIND_IN_SET('barbeiro', perfis), profissional_id, NULL)` com
  `UNIQUE` garante um profissional por vínculo barbeiro. Edição com `version` (`If-Match` →
  `409 CONFLICT_VERSION`). A transação de definição de perfil: `SELECT … FOR UPDATE` no
  profissional, confere `estado='ativo'`, lê `access_member` na projeção para confirmar o vínculo
  `ativo` e `colaborador`; se o profissional estiver preso a um vínculo **revogado** na projeção,
  libera essa associação (auditada) na mesma transação. Inativar profissional associado a
  barbeiro de vínculo ativo → `409 PROFISSIONAL_EM_USO`. Revogado e reconvidado recebe novo
  `membership_id` e, portanto, sem perfil herdado.
- **Rationale**: invariantes no banco + checagens no serviço (`IV`); vínculo vigente vem da
  projeção, que o Cortivo pode ler.
- **Alternatives**: `JSON` de perfis (rejeitado: sem unicidade declarativa); apagar perfil na
  revogação (rejeitado: o Cortivo não recebe evento de revogação).
- **Deferido para C02**: associação de **administrador** a profissional (`profissional.membership_id`),
  serviços habilitados, expediente, bloqueios e `cor_agenda`.

## R-11 — Idempotência nesta fatia

- **Decision**: proxies de equipe repassam o `Idempotency-Key` gerado pela interface por
  intenção (o Core persiste e responde `409 CONFLICT_IDEMPOTENCY_KEY_REUSED`). Localmente, a
  tabela `idempotencia` é exercitada por `POST /api/profissionais` (criação), com escopo ator +
  operação + resumo sha256 do corpo canônico, retenção 24 h. Perfis usam `version`.
- **Rationale**: valida desde já o mecanismo comum que C03+ usará.

## R-12 — Convite: link de uso único

- **Decision**: o Core devolve `OneTimeLink {link, expiresAt}` exibido **uma vez** ao
  administrador (D-07 do Core). A tela Equipe mostra o link num `Dialog` com botão de copiar e
  aviso de que não poderá ser consultado de novo; o link nunca é logado, auditado nem guardado.
  Revogar convite e revogar vínculo exigem motivo; mudar papel exige motivo e `version` do
  membro. `CONFLICT_LAST_ADMIN` vira mensagem compreensível. Lista de membros mostra
  `displayName`, papel e situação; `emailMasked` só para convites pendentes (contrato do Core).
- **Auditoria (Princípio VI)**: as quatro ações de equipe são auditadas **também** na trilha
  local (`equipe.convidar`, `equipe.revogar_convite`, `equipe.mudar_papel`,
  `equipe.revogar_vinculo`), após a resposta do Core, com resultado, motivo e a correlação
  repassada ao Core (R-18), sem e-mail nem link. Assim o proprietário consulta a trilha da unidade
  num só lugar, e a correlação liga as duas trilhas.
- **Rationale**: segue o contrato publicado; nenhum e-mail de terceiros é exposto.
- **Alternatives**: confiar apenas na trilha do Core (rejeitado: a constituição exige auditoria de
  ações administrativas e o Cortivo não tem leitura da trilha do Core).

## R-18 — Correlação de ponta a ponta com o Core

- **Decision**: o cliente `api/src/core/` repassa o `X-Correlation-Id` (UUID) da requisição
  corrente em toda chamada ao Core; o Core reutiliza UUID válido (`conventions.md` §3). Chamadas
  sem requisição de origem (boot, revalidação, touch) geram UUID v7 próprio e o registram no log.
- **Rationale**: Princípios III e VI; uma disputa sobre equipe pode ser seguida nas duas trilhas.

## R-19 — Recuperação de senha a partir do login (FR-030)

- **Decision**: nova variável `SPARKCORE_PUBLIC_URL` (endereço público da interface do Core; dev
  `http://127.0.0.1:5173`, https fora do dev). A tela de login aponta "Esqueci minha senha" para
  `GET /api/auth/recuperar`, que responde `302` para `${SPARKCORE_PUBLIC_URL}/recuperar` (página
  pública de pedido de recuperação do Core, `web/src/app/routes.tsx` do Core). Nenhum parâmetro do
  usuário é repassado.
- **Rationale**: `INT-070.3` (recuperação nas páginas do Core); a SPA não precisa conhecer
  configuração do servidor, e o endereço muda por ambiente sem rebuild.
- **Alternatives**: variável de build no Vite (rejeitado: exige rebuild por ambiente); expor a URL
  em `/api/saude` (rejeitado: mistura prontidão com configuração).

## R-13 — Artefato de migração e espelho local

- **Decision**: a fonte do artefato é o repositório do Core
  (`core/.../produtos/cortivo/artifact/`, `productCode = cortivo`, `databasePrefix = cortivo_`,
  `appendOnlyTables: ["auditoria"]`): `0001_base.sql` (publicada pela spec 009 do Core:
  `_spark_instance`, `idempotencia`, `auditoria`, `outbox_evento`, `perfil_colaborador` sem FK e
  `unidade` de linha única) e `0002_equipe_acesso.sql` (a entregar: `profissional` e a
  integridade do perfil barbeiro em `perfil_colaborador`).
  O Cortivo mantém espelho em `api/tests/fixtures/artifact/` e o esquema da projeção em
  `api/tests/fixtures/access_projection/`, com teste de deriva que compara sha256 com o Core
  quando `CORE_REPO_DIR` está disponível (CI faz checkout do Core). Registro do catálogo e do
  provisionador acontece no Core (Parte A).
- **Rationale**: `III` e `migration-artifact.md`; o produto não aplica migração.

## R-14 — Estratégia de testes (V)

- **Decision**:
  - **Unit** (Vitest): cookie (cifra, rotação, adulteração, `exp`), IP real, limite de login,
    regras de perfil (união, pendente, barbeiro), menu por papel/perfil, CSV, paginação,
    correlação, tradução de erros do Core.
  - **Integração** (Vitest + MySQL 8.4 real do ecossistema em `127.0.0.1:3307`, credencial de
    teste que só cria `t_*`): helper cria **dois pares** descartáveis (A e B) com o esquema da
    projeção e o artefato, usuários operacionais com privilégios iguais aos do Core (`SELECT`,
    `INSERT` só em `auditoria` e `access_session_logout`), e um **Core falso** HTTP que implementa
    o subconjunto consumido. Cobre `INT-010..070`, isolamento A/B (rota, corpo, cabeçalho, cookie,
    IDs, pool reutilizado), concorrência de perfis e p95 de autorização.
  - **Contrato**: respostas do Core falso e requisições do cliente validadas contra
    `openapi.yaml` 1.4.0 (e variante 1.3.3 do `touch`/`connection`) com Ajv; teste de deriva do
    espelho do artefato.
  - **E2E** (Playwright + axe) contra **SparkCore real local** (`dev:up`, porta 5273) com duas
    instâncias Cortivo provisionadas e uma instância Tuteli: `INT-110` 1–6, `AC-COR-002..004`,
    jornada J01, larguras 320/360/768/1280, teclado, foco do Drawer, breadcrumbs, marca, máscara.
    Depende da Parte A no Core.
- **Rationale**: mock de banco não é evidência (`V`); o Core falso cobre falhas difíceis de
  provocar no Core real (timeout, 204/200, `tls` ausente), e o E2E prova o conjunto.

## R-15 — Interface: casca, rotas e títulos

- **Decision**: reproduzir a casca `UI-010` do Tuteli (`layouts.tsx`, `MenuPrincipal.tsx`,
  `Brand.tsx`, `PageHeader.tsx`) **sem** as divergências: breadcrumb obrigatório via `handle.crumb`
  de cada rota (React Router 7 `useMatches`), `PageHeader` renderiza `Breadcrumb` do DS com
  `Link` SPA; `NAV` como constante única com `papeis` e `perfis` por entrada; título pelo último
  crumb (`<Página> · Cortivo`; login `Cortivo — Sparkling Hub`). Entrada de estilos:
  `layers.css` → `@sparkling-hub/design-system/styles.css` → `app.css`; raiz `.sh-theme`; nenhum
  `!important` sobre `sh-*`, nenhuma cor literal (verificação estática `scripts/check-ui.mjs`
  que também recusa `<input>`/`Input` de telefone, documento, CEP, valor, porcentagem, data ou
  hora sem `mask`).
- **Rationale**: `VIII`, portão `G4`.

## R-16 — Convenções do repositório (fixadas na C00)

- **Decision**: npm workspaces (`api`, `web`), Node 22 ESM, TypeScript `strict` +
  `noUncheckedIndexedAccess`. Identificadores de domínio, rotas, tabelas e mensagens em pt-BR
  (`perfilColaborador`, `/api/equipe`), infraestrutura técnica pode usar inglês consagrado
  (`middleware`, `pool`); arquivos `kebab-case`, componentes `PascalCase`; banco `snake_case`.
  Lint: ESLint 9 (flat) + `typescript-eslint` + `eslint-plugin-react-hooks` +
  `eslint-plugin-jsx-a11y`; formatação Prettier. Commits: Conventional Commits com IDs
  (`feat(acesso): … [INT-050]`). Logger JSON próprio (~60 linhas) com lista de campos
  proibidos, evitando dependência nova; validação de entrada por validadores próprios em
  `comum/validacao.ts` (padrão do Tuteli); Ajv apenas em `devDependencies` para contrato.
- **Alternatives**: `pino` e `zod` (rejeitados nesta fatia para não ampliar a stack de
  `ECO-011` sem ADR; reavaliar se o volume justificar).

## R-17 — Serviço da SPA e desenvolvimento

- **Decision**: desenvolvimento: Vite 5177 (`strictPort`) com proxy `/api → 127.0.0.1:3003`.
  Homologação/produção: a API serve `web/dist` na mesma origem (`ECO-012.2`) com fallback para
  `index.html` e os mesmos cabeçalhos. Teste de build varre `web/dist` por segredos e variáveis
  de ambiente do servidor.
