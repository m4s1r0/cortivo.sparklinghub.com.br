<!--
SYNC IMPACT REPORT — material temporário para revisão humana; remover antes de commitar.

Versão: (template sem valores) → 1.0.0
Tipo: adoção inicial. Nenhuma versão anterior ratificada; todos os placeholders preenchidos.

Origem do conteúdo:
  - Parte B de docs/sdd/prompt-c00-c01.md (entrada declarada para /speckit-constitution).
  - Constituição do SparkCore v1.2.1 (core/core.sparkilnghub.com.br/.specify/memory/constitution.md),
    da qual esta é derivada compatível (ECO-015).
  - Padrões canônicos do ecossistema 1.0.0 (core/.../docs/ecossistema/02, 04, 05).
  - Escopo 0.1 e modelagem 0.1 do Cortivo; decisões D-COR-01..11 de 2026-11-15.

Princípios definidos (numeração alinhada à do Core; IX é o tema adicional de ECO-015):
  I    Isolamento por instância (NÃO NEGOCIÁVEL)
  II   Identidade e autorização decididas no servidor
  III  Contratos versionados com o SparkCore
  IV   Operações críticas idempotentes e seguras sob concorrência
  V    Verificação com MySQL 8.4 real e cenários de falha
  VI   Rastreabilidade, auditoria só-inserção e privacidade
  VII  Monólito modular api/ + web/ e escopo disciplinado
  VIII Interface pelo design system e pelo padrão canônico
  IX   Linha de base de segurança do ecossistema

Seções adicionadas: Restrições técnicas e de dados; Fluxo de desenvolvimento e portões de
qualidade (com subseção "Sequência das fatias e portões de decisão"); Governance.
Seções removidas: nenhuma.

Templates dependentes (lidos em tempo de execução; não alterados por este comando):
  ✅ .specify/templates/plan-template.md — "Constitution Check" genérico, preenchido por fatia.
  ✅ .specify/templates/spec-template.md — sem referência a princípios específicos.
  ✅ .specify/templates/tasks-template.md — sem referência a princípios específicos.

Itens deferidos (não são placeholders; são dependências registradas no texto):
  - SEC-BASE-01 (credencial por instância) depende do endurecimento do Core (CONF-01);
    homologação do Cortivo bloqueada até lá (D-COR-10).
  - Publicação do .tgz do design system 0.5.0 (CONF-08): uso de versão anterior só como exceção
    registrada (Princípio VIII / Governance).
  - D-COR-07 (retenção, anonimização, RPO/RTO, hospedagem) aberta: bloqueia dados reais.
  - D-COR-08 (pedidos e WhatsApp) aberta: bloqueia C11/C12.
  - docs/design-system-updates.md ainda não existe; é criado em C00 com a entrada do DS 0.5.0
    (Princípio VIII, portão G6).

Conferência contra a entrada de /speckit-constitution (2026-11-16): princípios I–IX, precedência,
comunicação de emendas ao Core, portões G1–G6 e registro de troca do DS presentes. Ajuste único:
Princípio IV passa a exigir prova explícita em MySQL 8.4 real. Mantida a 1.0.0, pois a versão
ainda não foi commitada (adoção inicial em curso).
-->

# Cortivo Constitution

Constituição do Cortivo (anteriormente apresentado como SparkBarba), o SaaS de gestão para
barbearias da Sparkling Hub. É derivada da constituição do SparkCore v1.2.1, conforme `ECO-015`
dos padrões canônicos do ecossistema, e mantém a mesma numeração de princípios nos temas
compartilhados. O Cortivo delega ao SparkCore identidade, vínculos, convites, credenciais, ciclo
de vida e provisionamento, e valida cada requisição na projeção de acesso da instância (D-04).
Fontes de produto: o escopo (`docs/escopo/`, IDs `COR-*`, `CORE-COR-*`, `NFR-COR-*`, `AC-COR-*`),
a modelagem (`docs/modelagem/`) e as decisões `D-COR-*`. Fontes normativas externas: os contratos
publicados pelo Core (`contracts/`) e os padrões canônicos do ecossistema
(`docs/ecossistema/`, IDs `ECO-*`, `INT-*`, `UI-*`, `SEC-BASE-*`).

## Core Principles

### I. Isolamento por instância (NÃO NEGOCIÁVEL)

- Cada instância do Cortivo corresponde a uma unidade de barbearia (D-COR-01) e MUST ter banco
  operacional MySQL exclusivo `cortivo_<uuid>` e banco de acesso companheiro `cortivo_<uuid>_acc`,
  ambos derivados do UUID interno validado, com credencial operacional restrita a eles
  (`COM-005`, `ECO-013`).
- No piloto, cada processo da API MUST atender uma única instância, identificada por
  `SPARKCORE_INSTANCE_SLUG` (`ECO-012.1`, D-COR-02). Atender várias instâncias por processo exige
  ADR com prova de isolamento de pools.
- O contexto de instância MUST ser resolvido no servidor; instância, conta, papel, perfil,
  `membership_id`, nome de banco ou conexão enviados pelo cliente MUST NOT ser aceitos como
  autoridade.
- Cada pool MUST pertencer a uma única instância e a uma única versão de credencial; trocar de
  banco por `USE` numa conexão compartilhada é proibido. No boot, `_spark_instance` e
  `access_instance` MUST conferir com o `instanceId` informado pelo Core e com a faixa de schema
  suportada; divergência resulta em `503` e evento de segurança (`INT-010`).
- O Cortivo MUST apenas ler a projeção de acesso e registrar encerramento de sessão
  (`access_session_logout`); criar sessões, alterar vínculos ou desfazer revogações é exclusivo do
  Core.
- Respostas negadas MUST NOT revelar a existência de objetos, slugs ou contas de outra instância.
- Trabalhadores de segundo plano (outbox, mensagens) MUST verificar o estado da instância antes de
  qualquer efeito novo (`ECO-012.3`).
- Toda fatia com rota, consulta, exportação ou tarefa nova MUST ter testes negativos com pelo menos
  duas instâncias Cortivo sintéticas, cobrindo rota, corpo, cabeçalho, cookie, IDs, exportação,
  tarefa de fundo e pool reutilizado (`NFR-COR-001`, portão G2).

Justificativa: o isolamento é a promessa central da plataforma; vazar agenda, clientes ou caixa
de uma barbearia para outra não se corrige depois.

### II. Identidade e autorização decididas no servidor

- Contas, senhas, MFA, convites e vínculos existem apenas no SparkCore. O Cortivo MUST NOT
  armazenar senha nem segredo de autenticação, e MUST NOT expor e-mail de terceiros.
- Toda requisição protegida MUST ser validada pela regra normativa da projeção de acesso
  (`INT-050`, D-04). Papel e `membership_id` vêm da projeção; o cookie MUST NOT ser fonte de papel
  (`SEC-BASE-04`). O `touch` da sessão MUST NOT ser usado como guarda de autorização (D-COR-02).
- A autorização tem duas camadas (`ECO-014`): o papel do vínculo (`administrador` ou
  `colaborador`), que vem da projeção, e o perfil operacional local (`recepcao`, `barbeiro`),
  gravado no banco operacional para o `membership_id` vigente. O perfil local apenas restringe e
  MUST NOT ampliar o papel.
- Perfis locais são acumuláveis, e as permissões resultam da união deles (D-COR-03). O perfil
  `barbeiro` MUST estar associado a exatamente um profissional ativo. Um colaborador sem perfil
  MUST ver apenas a tela de configuração pendente. Vínculo revogado elimina o acesso mesmo com
  perfil e profissional cadastrados.
- Regras que dependem do objeto (por exemplo, "o barbeiro só opera os próprios atendimentos")
  MUST ser verificadas no serviço, além do middleware (`requireRole`, `requirePerfil`).
- Logout, rebaixamento de papel, revogação de vínculo e suspensão MUST ter efeito na requisição
  seguinte. O logout grava `access_session_logout` antes de apagar o cookie (`SEC-BASE-03`).
  Reativação exige novo login.
- Com o Core indisponível e a projeção acessível, sessões válidas continuam operando e o login
  responde `503`. Com a projeção inacessível, rotas protegidas respondem `503`.
- Convidar, revogar convite, mudar papel e revogar vínculo MUST passar por `/internal/v1` em nome
  do ator (`INT-070`). A regra do último administrador pertence ao Core e MUST NOT ser
  reimplementada como autoridade local.

Justificativa: o Core é a fonte de verdade sobre quem pode agir. A projeção torna a revogação
imediata sem fazer do Core uma dependência síncrona de cada requisição da barbearia.

### III. Contratos versionados com o SparkCore

- Apenas `api/src/core/` MUST falar com o SparkCore. Cada fatia MUST fixar no plano a versão de
  `/internal/v1` e da projeção de acesso que consome, com teste de contrato (portão G5).
- O Cortivo MUST NOT alterar contratos do Core. Uma necessidade nova vira pedido ao Core, com
  versão e convivência com a anterior; os contratos consumidos pelo Tuteli e pelo produto de
  referência MUST NOT regredir.
- O artefato de migração do Cortivo vive no Core (`produtos/cortivo/artifact/`, manifesto v1).
  Este repositório MUST manter guarda de deriva entre o fixture de testes e esse diretório.
- Toda chamada ao Core MUST ter timeout (2 s no health de boot, 3 s nas demais) e resultar em
  `503` explícito quando expirar (`SEC-BASE-07`). O `touch` fica fora do caminho crítico, no
  máximo uma vez a cada 5 minutos por sessão (`INT-051`). Quando duas versões de contrato
  convivem, o cliente MUST aceitar as respostas das duas versões declaradas no plano.
- Erros da API do Cortivo MUST trazer código estável, mensagem segura, campo quando cabível,
  indicação de repetição possível e correlação; MUST NOT expor SQL, segredo ou stack trace.
- A telemetria de utilização (`CORE-COR-007`) MUST trafegar apenas contagens e o contexto mínimo
  do contrato, sem valores financeiros, nomes de clientes, profissionais, serviços ou observações.
  Falha de telemetria MUST NOT reverter operação concluída (`NFR-COR-004`).
- A credencial de aplicação MUST ser vinculada à instância (`SEC-BASE-01`), com escopo e rotação.
  Enquanto o Core não a oferecer, a dependência fica registrada e a homologação fica bloqueada
  (D-COR-10).

Justificativa: o Cortivo é o segundo consumidor real do Core. Contratos fixados e um único ponto
de integração evitam que mudanças em um produto quebrem o outro.

### IV. Operações críticas idempotentes e seguras sob concorrência

- Requisições críticas MUST aceitar chave de idempotência vinculada a ator, instância e operação,
  com resumo do payload e resposta persistida por pelo menos 24 horas. A mesma chave com os mesmos
  dados repete o resultado; com dados diferentes, retorna `409` (`COM-026`).
- São críticas, no mínimo: reservar, remarcar e cancelar; encaixar e chamar da fila; iniciar,
  concluir e interromper atendimento; confirmar comanda; registrar recebimento; estornar; cancelar
  venda; abrir e fechar caixa; movimentar estoque; e fechar competência de comissão.
- Capacidade de profissional, ordem da fila, saldo de estoque, valor a receber, turno de caixa
  único e saldo de comissão MUST ser protegidos por transação e trava apropriadas. Consulta prévia
  sem proteção contra corrida não é aceita (`COM-025`). Cadastros editados em paralelo usam versão
  otimista (`COM-027`).
- Saldos MUST derivar de livro de lançamentos. Correção é feita por compensação ou estorno, nunca
  por edição ou exclusão de lançamento, e uma baixa, consumo, recebimento ou compensação MUST NOT
  se repetir para a mesma origem.
- Preço, duração e taxa de comissão vigentes no momento da operação MUST ser gravados como
  snapshot; mudança de catálogo ou de regra MUST NOT reescrever operações já confirmadas.
- Transições de estado (reserva, entrada de fila, atendimento, comanda, caixa e competência) MUST
  seguir as máquinas de estado do escopo e checar suas pré-condições; editar o campo de estado
  diretamente é proibido.
- Cadastros já usados são inativados, não apagados (`COM-028`).
- Idempotência, travas e proteção contra corrida MUST ser provadas em MySQL 8.4 real, com
  requisições concorrentes independentes (Princípio V); garantia afirmada só em memória ou com
  banco simulado não é aceita.

Justificativa: em uma barbearia, clique duplo, rede instável e dois atendentes no mesmo horário
são rotina. Sem essas garantias aparecem horário vendido duas vezes, caixa divergente e comissão
paga em dobro.

### V. Verificação com MySQL 8.4 real e cenários de falha

- Cada fatia MUST passar por verificação de tipos, análise estática, testes unitários das regras,
  testes de integração contra MySQL 8.4 real, testes de contrato e jornadas E2E (Playwright + axe)
  aplicáveis.
- Persistência, concorrência, idempotência e isolamento MUST ser provados em MySQL real, com
  processos ou requisições independentes (`NFR-COR-007`). Mock de banco não serve como evidência.
- Os cenários de integração usam duas instâncias Cortivo sintéticas e, quando o teste envolve
  cookie ou sessão de outro produto, um vínculo da mesma conta no Tuteli (`INT-110`).
- Para regras de alto risco (isolamento, autorização, estados, idempotência, saldos, comissão), o
  teste MUST ser escrito e visto falhando antes da implementação que o satisfaz.
- Cada `SEC-BASE-*` aplicável MUST ter teste que falharia sem a defesa (Princípio IX).
- Agenda, datas civis, intervalos, totais, descontos e comissão MUST ter testes unitários das
  regras puras, com casos de fronteira de fuso, de intervalo e de arredondamento.
- Migrações MUST ser reproduzíveis em banco vazio e a partir da versão anterior suportada, com
  dados sintéticos preexistentes.
- Cobertura percentual isolada MUST NOT ser critério de aceite. A evidência é por requisito e
  cenário, registrada em `specs/NNN-<fatia>/evidence.md`.

Justificativa: as falhas que importam aqui (corrida pela mesma cadeira, commit parcial, pool na
instância errada, sessão revogada que continua valendo) só aparecem com banco real e testes de
falha.

### VI. Rastreabilidade, auditoria só-inserção e privacidade

- Especificações, planos, tarefas, testes e commits MUST referenciar os identificadores estáveis
  (`Cnn`, `COR-*`, `CORE-COR-*`, `NFR-COR-*`, `AC-COR-*`, `D-COR-*` e os IDs canônicos `ECO-*`,
  `INT-*`, `UI-*`, `SEC-BASE-*`). Requisito alterado ou excluído MUST registrar origem e motivo.
- Ações administrativas, financeiras e de segurança MUST gerar auditoria com ator, objeto, ação,
  alteração segura (valor anterior e novo), correlação e instante. Isso inclui, no mínimo, mudança
  de perfil local, desconto e gratuidade, estorno, cancelamento, ajuste de estoque, alteração de
  regra de comissão e fechamento de competência.
- A tabela `auditoria` MUST ser só-inserção: o artefato a declara como tal e a credencial
  operacional recebe apenas `SELECT, INSERT` (`SEC-BASE-12`). A aplicação MUST NOT oferecer edição
  nem exclusão de registros de auditoria.
- Segredos, tokens, cookies e credenciais MUST NOT aparecer em log, URL, resposta, bundle
  (`web/dist`), CSV, auditoria, fixture ou captura de tela.
- Logs MUST ser estruturados, com correlação UUID (`SEC-BASE-17`), instância verificada e
  operação. O tratamento global de erros MUST NOT registrar SQL nem valores (`SEC-BASE-18`).
- Minimização: o cliente da barbearia tem apenas nome, telefone, e-mail e data de nascimento
  (opcionais), observação curta e barbeiro preferido; sem CPF nem outro documento (D-COR-09). Um
  campo pessoal novo exige decisão registrada. Se algum documento vier a ser exigido, aplica-se
  `SEC-BASE-11` (cifra, índice HMAC, máscara para não administrador e leitura auditada).
- Exportações CSV MUST respeitar filtros e autorização, informar significado e momento de geração
  e neutralizar conteúdo interpretável como fórmula (`SEC-BASE-21`). Listagens MUST ser paginadas,
  com teto (`SEC-BASE-20`).
- Desenvolvimento e homologação MUST usar dados sintéticos. Dados reais MUST NOT ser usados antes
  de D-COR-07 (retenção, anonimização, continuidade e hospedagem) estar fechada (`NFR-COR-005`,
  `NFR-COR-006`).

Justificativa: o proprietário e o suporte respondem a disputas de caixa e comissão com evidência;
sem trilha imutável e sem minimização, o produto vira risco em vez de ferramenta.

### VII. Monólito modular api/ + web/ e escopo disciplinado

- O Cortivo MUST ser um monólito modular com a estrutura `ECO-010`: `api/` (Node.js 22 ESM,
  TypeScript estrito) e `web/` (SPA React), no mesmo repositório e artefato. Os trabalhadores de
  segundo plano usam o mesmo código. Microserviços, broker externo, Kubernetes, service mesh e
  event sourcing MUST NOT ser introduzidos no MVP.
- A stack é a de `ECO-011`: Hono + `@hono/node-server`, Kysely + `mysql2`, MySQL 8.4, React 19,
  React Router 7, TanStack Query 5, Vite 7, Tailwind CSS 4, `lucide-react`, Vitest e
  Playwright + axe. Desvio exige ADR no produto e registro na seção de complexidade do plano.
- Módulos de domínio separam regra pura, repositório e serviço; rotas HTTP são finas (validam a
  entrada, chamam o serviço e montam o envelope de erro).
- Itens fora do escopo (agendamento público pelo cliente, app nativo, operação offline,
  consolidação entre filiais, clube de assinatura, folha ou repasse de comissão, emissão fiscal,
  captura ou conciliação bancária automática, financeiro contábil, cobrança da assinatura SaaS)
  MUST NOT ser implementados sem decisão registrada que os promova ao escopo.
- Propostas `[P]` e decisões `D-COR-*` abertas são tratadas como propostas até a confirmação
  registrada. Trabalho que depende de decisão estrutural aberta MUST esperar ou declarar a
  suposição e o ponto de confirmação. Pendência de decisão não autoriza construir duas
  alternativas completas.
- Complexidade adicional (dependência relevante, nova camada de abstração, padrão distribuído)
  MUST ser justificada no plano, com a alternativa mais simples considerada e o motivo da
  rejeição.

Justificativa: produto operado por equipe pequena, com recorte deliberado; o escopo cresce por
decisão, não por conveniência, e repetir a stack do Tuteli reaproveita guias, scripts e
evidências.

### VIII. Interface pelo design system e pelo padrão canônico

- Toda interface MUST consumir `@sparkling-hub/design-system` na versão vigente do ecossistema
  (hoje 0.5.0), por `.tgz` em `vendor/design-system/` referenciado com `file:` em
  `web/package.json` (`UI-001`), e somente pela API pública. Cópias de componentes, estilos de
  controle ou tokens, redefinição de tokens e `!important` sobre classes `sh-*` MUST NOT existir.
  Necessidade visual não atendida vira proposta ao DS e é registrada em "Lacunas observadas" de
  `docs/design-system-updates.md`.
- A entrada carrega `layers.css` → `styles.css` do DS → `app.css`, com a raiz sob `.sh-theme`.
- O shell MUST seguir exatamente `UI-010`: lateral petróleo colapsável (`w-56`/`w-16`), header
  claro com `Drawer` abaixo de `lg`, conteúdo `max-w-5xl` sobre `--color-sh-ground`, Sair e
  Recolher no rodapé, endosso "Uma solução da Sparkling Hub". O menu é a constante `NAV` de
  `docs/modelagem/04-interface.md`. A filtragem por papel e perfil é apenas apresentação.
- Toda página autenticada MUST exibir breadcrumb acima do `h1` (`UI-020`), pelo `PageHeader` local
  que renderiza o `Breadcrumb` do DS com navegação SPA. Os níveis são declarados em
  `handle.crumb`, o primeiro nível é "Cortivo" → `/hoje` e rótulos dinâmicos MUST NOT mostrar
  identificadores.
- Cores MUST vir somente dos tokens `--color-sh-*` da paleta única da família (`UI-030`); cor
  literal e cor própria do produto são proibidas.
- Todo campo de telefone, documento, CEP, valor, porcentagem, data ou hora MUST usar o atributo
  `mask` do DS (`UI-040`), com rótulo visível e envio do valor bruto à API. Máscara própria,
  `pattern` livre e biblioteca de máscara de terceiros são proibidos. O servidor revalida tudo.
- A marca MUST ser a aprovada do Cortivo (`UI-050`): os sete arquivos de `final-v1/cortivo/`
  copiados sem edição para `web/public/brand/`, com teste de sha256 contra o manifesto.
- Cada tela MUST especificar a matriz de estados (`UI-060`): inicial, vazio, carregando,
  inválido, enviando, sucesso, erro, conflito `409`, sem permissão `403`, indisponível `503` e
  leitura. Sucesso só aparece após confirmação da API.
- Código de interface MUST NOT decidir autorização, isolamento, validação autoritativa ou
  persistência.
- Alvo de projeto WCAG AA, sem alegar certificação: labels visíveis, foco visível, teclado nas
  tarefas críticas, uso de 320 px a desktop sem rolagem horizontal, e agenda e fila com
  alternativa em lista, sem depender de cor, hover ou arrastar (`NFR-COR-002`).
- As divergências do Tuteli listadas em `06-conformidade-produtos.md` MUST NOT ser repetidas; o
  Tuteli é referência de casca, não norma.

Justificativa: quem conhece um produto Spark reconhece os demais; cada desvio do design system
vira custo de manutenção e inconsistência para toda a família.

### IX. Linha de base de segurança do ecossistema

- Os itens `SEC-BASE-01` a `SEC-BASE-22` de `05-baseline-seguranca.md` aplicáveis ao produto são
  requisitos da fatia que toca a superfície correspondente, não débito para fatia futura. Cada
  um MUST ter teste de aceite que falharia sem a defesa.
- No mínimo, desde C01: IP real só via `TRUSTED_PROXIES`, com o salto mais à direita não
  confiável, e limite de login por IP (`-02`); logout pela projeção (`-03`); papel vindo da
  projeção (`-04`); verificação de origem, somente JSON e `SameSite=Strict` (`-05`); cookie
  `__Host-cortivo_session` cifrado com AES-256-GCM, com `iat`/`exp` no servidor e rotação de chave
  (`-06`); timeouts para o Core (`-07`); `bodyLimit` de 1 MiB (`-08`); dependências sem achado
  moderado ou superior (`-09`); cabeçalhos de segurança na SPA e na API (`-10`); auditoria
  só-inserção (`-12`); TLS nos pools fora do dev (`-15`); correlação aceita só como UUID (`-17`);
  erro global sem SQL (`-18`); revalidação de `/connection` com descarte de pool de instância não
  ativa (`-19`); paginação com teto (`-20`); CSV neutralizado (`-21`).
- Itens que dependem do Core (`-01`) ficam registrados como dependência com o bloqueio
  correspondente (D-COR-10), nunca como conformidade presumida.
- Uma versão nova da linha de base passa a valer para a fatia seguinte à sua publicação, e o
  plano dessa fatia MUST registrar a conformidade com ela.

Justificativa: a auditoria do Tuteli mostrou que segurança adiada vira retrabalho em todo o
produto; o Cortivo nasce com a linha de base aplicada.

## Restrições técnicas e de dados

- Persistência: MySQL 8.4 (`COM-003`). Bancos por instância: `cortivo_<uuid>` (operacional) e
  `cortivo_<uuid>_acc` (projeção de acesso, escrita só pelo Core). Sem chaves estrangeiras entre
  bancos. Tabelas obrigatórias desde a migração 0001: `_spark_instance`, `idempotencia`,
  `auditoria` (só-inserção), `outbox_evento`; tabelas de negócio entram nas migrações das fatias.
- Privilégios: a credencial operacional MUST NOT criar bancos nem alterar estrutura. Migrações são
  aplicadas pelo provisionador do Core a partir do artefato. O código da aplicação MUST NOT conter
  `DROP DATABASE`.
- Valores monetários em centavos inteiros (`*_cents BIGINT`), nunca ponto flutuante (`COM-021`).
  Porcentagens são persistidas em pontos-base inteiros, e o arredondamento é definido na regra que
  o usa.
- Instantes em UTC (`DATETIME(6)`); datas civis e períodos no fuso da instância informado pelo Core
  (inicialmente `America/Sao_Paulo`); intervalos `[início, fim)` (`COM-023`).
- Portas (`ECO-002`): API 3003, Vite 5177 (`strictPort`). Em homologação e produção, a API serve
  `web/dist` na mesma origem (`ECO-012.2`).
- Configuração por variáveis validadas no boot (`api/src/env.ts`), com falha cedo. O
  `.env.example` não contém valores secretos. Segredos ficam em armazenamento de segredos ou
  variável protegida, nunca em código, repositório ou saída de log.
- Interface em pt-BR e moeda BRL. A convenção de nomes de código, identificadores e mensagens de
  commit é fixada no plano de C00 e mantida consistente no repositório.

## Fluxo de desenvolvimento e portões de qualidade

- Repositório: o Cortivo é desenvolvido no repositório git `cortivo/cortivo.sparklinghub.com.br`.
  Mudanças necessárias no Core (catálogo, artefato, provisionador, privilégios, contratos) são
  especificadas e entregues no repositório do Core, por fluxo próprio. O `tasks.md` de uma fatia
  separa explicitamente o trabalho de cada repositório.
- Fluxo Spec Kit por fatia: `/speckit-specify` → `/speckit-clarify` → `/speckit-plan` →
  `/speckit-tasks` → `/speckit-analyze` → `/speckit-implement` → `/speckit-converge`, até
  convergência. Código de aplicação não é criado fora desse fluxo.
- Os portões G1–G6 de `ECO-016` são obrigatórios: G1 Ready (estados, breadcrumbs, campos com
  máscara, papéis e perfis, erros, idempotência e concorrência especificados), G2 Isolamento,
  G3 Segurança, G4 Interface, G5 Contrato Core e G6 troca de versão do DS. Somam-se a eles a
  Definition of Ready ("Pronta para implementar") e a Definition of Done ("Concluída") de
  `docs/escopo/06-plano-sdd.md`.
- Cada `plan.md` MUST conter o Constitution Check, mapeando cada tela e campo para componentes do
  DS, breadcrumbs e máscaras, cada `SEC-BASE-*` aplicável para o seu teste e a versão de contrato
  do Core consumida. Exceções vão para a seção de complexidade, com justificativa, prazo e
  responsável.
- Integração contínua: typecheck, lint, testes unitários, integração com MySQL 8.4 real, contrato,
  E2E com Playwright + axe e `npm audit --omit=dev` sem achado moderado ou superior.
- Trabalho em branch por fatia, com revisão antes da integração. Nenhuma fatia pode regredir
  invariantes, isolamento ou contratos de fatias anteriores, do Tuteli ou do produto de referência.
- Segurança, auditoria, testes e tratamento de erros acompanham cada fatia desde o início.

### Sequência das fatias e portões de decisão

- Ordem do plano SDD: C00 (base) → C01 (instância e acesso) → C02 (unidade e cadastros) → C03
  (agenda) → C04 (fila, encaixe e atendimento) → C05 (comanda de serviço e caixa) → C06 (revenda e
  estoque) → C07 (comissões) → C08 (retorno e gestão) → C09 (utilização no Core) → C10 (prontidão
  do MVP) → C11 (pedidos) → C12 (WhatsApp), respeitando as dependências declaradas no plano.
- O piloto operacional com barbearia corresponde a C00–C05 (D-COR-11).
- Portões de decisão: dados reais só depois de fechada a D-COR-07; homologação só com o Core
  endurecido, com credencial por instância e contrato v1.4 (D-COR-10); C09 só com o F08 do Core
  validado; C11 e C12 só com o MVP homologado e a D-COR-08 fechada.

## Governance

- Esta constituição prevalece sobre as demais práticas deste repositório. Ela é derivada da
  constituição do SparkCore e MUST permanecer compatível com ela, com os contratos publicados e
  com os padrões canônicos do ecossistema. Ordem de precedência das fontes: constituição e ADRs do
  Core → contratos publicados → padrões canônicos do ecossistema → esta constituição e as
  deliberações do Cortivo → escopo → modelagem → implementação do Tuteli (referência, não norma).
  Esta constituição pode ser mais restritiva que as fontes superiores, nunca menos. Em conflito,
  prevalece a regra mais restritiva até que uma decisão registrada resolva a divergência.
- Correspondência com o Core (`ECO-015`): os princípios I a VIII correspondem, em tema e ordem,
  aos princípios I a VIII da constituição do SparkCore. O IX corresponde à linha de base de
  segurança exigida por `ECO-015`.
- Emendas MUST ser propostas como mudança versionada neste arquivo, com Sync Impact Report,
  justificativa, impacto em especificações, planos e contratos existentes e, quando necessário,
  plano de migração. A aprovação cabe ao responsável técnico da Sparkling Hub.
- Uma emenda que toque os temas compartilhados (isolamento, identidade, contratos, idempotência,
  verificação, privacidade, interface e segurança) MUST ser comunicada aos mantenedores do Core e
  dos padrões do ecossistema. Uma emenda da constituição do Core ou dos padrões nesses temas MUST
  ser avaliada aqui antes do plano da fatia seguinte.
- Versionamento semântico: MAJOR para remoção ou redefinição incompatível de princípio ou regra
  de governança; MINOR para princípio ou seção nova ou orientação materialmente ampliada; PATCH
  para esclarecimentos e correções sem efeito semântico.
- A conformidade é verificada no Constitution Check de cada plano, em `/speckit-analyze` antes da
  implementação e na revisão de cada mudança integrada. Violação conhecida só pode ser aceita como
  exceção registrada, com prazo e responsável.
- Trocar a versão do design system é mudança revisada (portão G6): MUST registrar em
  `docs/design-system-updates.md` a versão anterior e a nova, o sha256, o motivo, a leitura do
  changelog e os testes de interface reexecutados. Usar versão anterior à vigente no ecossistema
  só é aceito como exceção registrada, com a troca pendente.
- Mudança de escopo (requisito novo, promovido ou alterado) ou de decisão `D-COR-*` MUST atualizar
  `docs/escopo/`, `docs/modelagem/05-decisoes.md` e as especificações afetadas antes do código.
- Linguagem normativa: MUST / MUST NOT equivalem a DEVE / NÃO DEVE dos padrões do ecossistema;
  SHOULD equivale a DEVERIA, e o desvio é registrado na seção de complexidade do plano.

**Version**: 1.0.0 | **Ratified**: 2026-11-15 | **Last Amended**: 2026-11-15
