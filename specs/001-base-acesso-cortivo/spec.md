# Feature Specification: Base e acesso do Cortivo (C00 + C01)

**Feature Branch**: `001-base-acesso-cortivo`

**Created**: 2026-11-16

**Status**: Draft

**Input**: User description: "Base e acesso do Cortivo (fatias C00 e C01): instância provisionada
pelo SparkCore é ativada; o administrador convidado entra, configura perfis locais da equipe e vê
a casca completa do produto (menu lateral, breadcrumbs, marca), com isolamento provado entre duas
instâncias e a linha de base de segurança aplicada desde o primeiro commit (jornada J01, P1)."

**Rastreabilidade**: fatias `C00`, `C01`; jornada `J01`; requisitos `CORE-COR-001..006`,
`CORE-COR-008`, `NFR-COR-001`, `NFR-COR-002`, `NFR-COR-004`, `NFR-COR-007`; aceite `AC-COR-001`
(executado pela Parte A no Core), `AC-COR-002..004`, `AC-COR-021` (parcial); integração
`INT-010`, `INT-020`, `INT-030`, `INT-040`, `INT-050`, `INT-051`, `INT-060`, `INT-070`, `INT-110`
(itens 1–6); interface `UI-001`, `UI-010`, `UI-020`, `UI-030`, `UI-040`, `UI-050`, `UI-060`;
segurança `SEC-BASE-01..22` aplicáveis; decisões `D-COR-01`, `D-COR-02`, `D-COR-03`, `D-COR-07`,
`D-COR-10`.

**Fontes normativas (nesta precedência)**: constituição do Cortivo 1.0.0; contratos do Core
(`openapi.yaml` `/internal/v1` v1.3.3 com convivência v1.4, `access-projection.md` v2,
`conventions.md`, `migration-artifact.md`); padrões canônicos do ecossistema (`01`–`07`);
`docs/escopo/`; `docs/modelagem/` (`01`–`05`). O Tuteli é referência de casca, não norma: as
divergências de `06-conformidade-produtos.md` não podem ser repetidas.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Administrador convidado entra e encontra a casca do produto (Priority: P1)

O responsável da plataforma provisiona e ativa a instância Cortivo de uma barbearia no SparkCore e
convida o administrador da unidade. O administrador aceita o convite na página do Core, volta à
tela de login do Cortivo, entra com as credenciais centrais e chega a "Hoje". Ele vê a marca do
Cortivo, o menu lateral completo para o seu papel, o breadcrumb em cada página e, nas áreas de
negócio ainda não entregues, um aviso de "Disponível em breve". Ao sair, a sessão deixa de valer
imediatamente.

**Why this priority**: é a jornada `J01` e o pré-requisito de todas as fatias seguintes; sem
entrar com segurança numa instância ativa, nada mais do produto pode ser operado ou testado.

**Independent Test**: com uma instância sintética ativada pelo Core e um administrador convidado,
entrar, navegar por todas as entradas do menu, conferir breadcrumb, título da página e marca,
sair e tentar reutilizar a sessão antiga.

**Acceptance Scenarios**:

1. **Given** uma instância ativa e um administrador com vínculo válido, **When** ele informa
   credenciais corretas na tela de login, **Then** é levado a "Hoje", vê seu nome, o nome e o fuso
   da unidade, e o menu com as 13 entradas na ordem definida (Hoje, Agenda, Clientes, Vendas,
   Caixa, Estoque, Comissões, Retornos, Relatórios, Catálogo, Equipe, Configurações, Auditoria).
2. **Given** a tela de login, **When** a pessoa informa conta inexistente, senha errada ou conta
   sem vínculo com esta instância, **Then** recebe a mesma mensagem genérica de credenciais
   inválidas, sem indicar qual dado falhou nem se a conta existe.
3. **Given** um administrador autenticado, **When** ele abre qualquer rota autenticada, **Then** a
   página mostra um breadcrumb acima do título, iniciado por "Cortivo" (que leva a Hoje), sem
   identificadores técnicos nos rótulos, e o título da aba segue "<Página> · Cortivo".
4. **Given** uma área de negócio ainda não entregue (por exemplo, Agenda), **When** o
   administrador a abre, **Then** vê o estado vazio "Disponível em breve" com breadcrumb correto e
   nenhuma ação de negócio.
5. **Given** um administrador autenticado, **When** ele sai e depois alguém reapresenta a sessão
   antiga, **Then** a sessão é recusada como não autenticada.
6. **Given** a tela de login, **When** ela é exibida, **Then** mostra a assinatura principal do
   Cortivo com o endosso "Uma solução da Sparkling Hub" e o título "Cortivo — Sparkling Hub".
7. **Given** larguras de 320, 360, 768 e 1280 px, **When** o administrador navega pela casca,
   **Then** não há rolagem horizontal; abaixo da largura de desktop o menu abre como painel
   lateral com foco contido, fecha com Escape e devolve o foco ao botão que o abriu.

---

### User Story 2 - Isolamento entre instâncias e efeito imediato das mudanças de acesso (Priority: P1)

Duas barbearias usam o Cortivo em instâncias separadas (A e B), e uma mesma pessoa pode ter
vínculo em A, em B e também no Tuteli. Nenhuma forma de troca de contexto (rota, corpo,
cabeçalho, cookie, identificador) deixa uma instância ler, alterar, exportar ou agendar tarefa na
outra. Logout, rebaixamento de papel, revogação de vínculo e suspensão da instância valem na
requisição seguinte; reativação exige novo login.

**Why this priority**: o isolamento é o princípio não negociável da plataforma
(`NFR-COR-001`); um vazamento entre barbearias não se corrige depois.

**Independent Test**: com duas instâncias sintéticas e uma conta vinculada a A, a B e ao Tuteli,
executar os ensaios `INT-110` 1–6 e `AC-COR-002`/`AC-COR-003` e verificar recusas e
preservações.

**Acceptance Scenarios**:

1. **Given** a credencial ou o endereço da instância A, **When** se tenta obter conexão, sessão,
   atividade ou membros de B, **Then** a recusa é idêntica à de uma instância inexistente.
2. **Given** uma pessoa autenticada em A, **When** ela troca o contexto para B por rota, corpo,
   cabeçalho, cookie ou identificador, **Then** nada de B é lido, alterado, exportado ou agendado,
   e a resposta não revela a existência de objetos, contas ou instâncias de B.
3. **Given** um administrador autenticado em A, **When** o Core o rebaixa a colaborador, **Then**
   a próxima ação exclusiva de administrador em A é recusada por falta de permissão.
4. **Given** uma conta com vínculos em A e B, **When** o vínculo em A é revogado, **Then** a
   próxima ação protegida em A é recusada e B continua acessível.
5. **Given** uma sessão válida em A, **When** a instância A é suspensa e depois reativada,
   **Then** as ações em A são recusadas durante a suspensão e, após a reativação, é exigido novo
   login.
6. **Given** um cookie de sessão do Tuteli para a mesma conta, **When** ele é apresentado ao
   Cortivo, **Then** não concede acesso.
7. **Given** um administrador de plataforma sem vínculo com a unidade, **When** ele tenta acessar
   o Cortivo de A, **Then** não obtém acesso de negócio.

---

### User Story 3 - Administrador organiza a equipe: membros, perfis locais e profissionais (Priority: P2)

Na tela Equipe, o administrador vê os membros da unidade (vindos do Core), os convites pendentes,
os perfis locais e os profissionais. Ele convida pessoas, revoga convites, muda papéis e revoga
vínculos — tudo delegado ao Core. Para cada colaborador, define um ou mais perfis locais
(Recepção, Barbeiro). Para o perfil Barbeiro, associa exatamente um profissional ativo, que pode
ser cadastrado ali mesmo com nome, apelido, telefone e estado. Toda alteração de perfil e de
profissional fica na trilha de auditoria.

**Why this priority**: sem perfis, colaboradores não operam a unidade; mas a fatia já entrega
valor com o administrador sozinho (US1), por isso vem depois.

**Independent Test**: com um administrador e um colaborador recém-convidado, atribuir perfis,
cadastrar profissional, associar, alterar e remover perfis, e conferir o efeito na sessão do
colaborador e os registros de auditoria.

**Acceptance Scenarios**:

1. **Given** um administrador na tela Equipe, **When** ele convida um e-mail com papel
   colaborador, **Then** o convite é criado pelo Core, aparece como pendente após confirmação e o
   sucesso só é exibido depois da resposta positiva.
2. **Given** um colaborador sem perfil, **When** o administrador define os perfis Recepção e
   Barbeiro e associa um profissional ativo, **Then** a alteração é gravada, auditada (ator,
   colaborador, perfis anterior e novo, instante) e o colaborador passa a ver a união das entradas
   de menu dos dois perfis.
3. **Given** a definição do perfil Barbeiro, **When** o administrador tenta salvar sem
   profissional ou com um profissional inativo ou já associado a outro vínculo vigente, **Then** a
   operação é recusada com mensagem clara indicando o campo.
4. **Given** o cadastro de um profissional, **When** o administrador digita o telefone, **Then** o
   campo aplica a máscara de telefone, e o servidor recebe e revalida apenas os dígitos.
5. **Given** dois administradores editando os perfis do mesmo colaborador, **When** ambos salvam,
   **Then** o segundo recebe um aviso de conflito e não sobrescreve a alteração do primeiro sem
   recarregar.
6. **Given** o único administrador da unidade, **When** ele tenta rebaixar o próprio papel ou
   revogar o próprio vínculo, **Then** a recusa vem do Core e é exibida de forma compreensível,
   sem regra equivalente decidida localmente.
7. **Given** um colaborador, **When** ele tenta abrir a tela Equipe, **Then** recebe a página de
   "sem permissão" e nenhum dado da equipe.

---

### User Story 4 - Colaborador acessa conforme os perfis recebidos (Priority: P2)

Um colaborador recém-convidado entra antes de receber perfil e vê apenas a tela "Configuração
pendente", que explica que o administrador precisa definir o seu perfil. Depois de receber
perfil, passa a ver o menu correspondente. Se o vínculo for revogado, perde o acesso mesmo que o
perfil e o profissional continuem cadastrados.

**Why this priority**: cobre a parte de `AC-COR-021` desta fatia e garante que o perfil local
apenas restringe, nunca amplia o papel.

**Independent Test**: entrar como colaborador sem perfil, depois com Recepção, com Barbeiro, com
ambos, e após revogação do vínculo, conferindo menu, rotas acessíveis e recusas.

**Acceptance Scenarios**:

1. **Given** um colaborador sem perfil, **When** ele entra, **Then** vê somente "Configuração
   pendente", sem menu de operação, e qualquer outra rota o leva a essa tela.
2. **Given** um colaborador com perfil Recepção, **When** ele entra, **Then** vê Hoje, Agenda,
   Clientes, Vendas, Caixa, Estoque, Retornos, Relatórios e Catálogo, e não vê Comissões, Equipe,
   Configurações nem Auditoria.
3. **Given** um colaborador com perfil Barbeiro, **When** ele entra, **Then** vê Hoje, Agenda e
   Comissões.
4. **Given** um colaborador com Recepção e Barbeiro, **When** ele entra, **Then** vê a união das
   entradas dos dois perfis.
5. **Given** um colaborador com perfil cujo vínculo foi revogado no Core, **When** ele faz a
   próxima requisição, **Then** é recusado como não autenticado, apesar do perfil local.
6. **Given** qualquer colaborador, **When** ele chama diretamente uma ação reservada a
   administrador, **Then** o servidor recusa, independentemente do que o menu exibe.

---

### User Story 5 - Funcionamento seguro diante de falhas do Core e da instância (Priority: P2)

Se o Core ficar fora do ar, quem já está autenticado continua trabalhando enquanto a sessão for
válida, mas novos logins e mudanças de equipe ficam temporariamente indisponíveis com mensagem
clara. Se a base de acesso da instância ficar inacessível, ou se a identidade da instância não
conferir com o Core, o produto recusa operar e registra um evento de segurança, em vez de
arriscar atender a barbearia errada.

**Why this priority**: `AC-COR-004` e `INT-010`/`INT-020`; protege a operação diária contra
instabilidade e o isolamento contra configuração errada.

**Independent Test**: com sessão válida, derrubar o Core, consultar, tentar login, derrubar a base
de acesso e repetir; em outro ensaio, iniciar o produto com marcador de instância divergente ou
instância não ativa.

**Acceptance Scenarios**:

1. **Given** uma sessão válida e o Core fora do ar com a base de acesso funcional, **When** o
   usuário consulta uma página protegida, **Then** a consulta funciona.
2. **Given** o Core fora do ar, **When** alguém tenta entrar ou alterar a equipe, **Then** recebe
   indisponibilidade temporária com orientação para tentar mais tarde, sem expor detalhes
   internos.
3. **Given** a base de acesso inacessível, **When** o usuário repete a consulta, **Then** recebe
   indisponibilidade temporária.
4. **Given** uma sessão com inatividade vencida, **When** o usuário faz uma requisição, **Then** é
   recusado como não autenticado.
5. **Given** a inicialização do produto, **When** o marcador de identidade gravado na base da
   instância ou na base de acesso não confere com o informado pelo Core, ou a versão de esquema
   está fora da faixa suportada, **Then** o produto responde indisponibilidade a todas as rotas de
   negócio e registra evento de segurança.
6. **Given** o produto em funcionamento, **When** o Core informa nova versão de credencial ou a
   instância deixa de estar ativa, **Then** o produto passa a usar a nova credencial ou descarta as
   conexões da instância e recusa novas requisições.
7. **Given** muitas tentativas de login vindas do mesmo endereço, **When** o limite é atingido,
   **Then** novas tentativas são recusadas por excesso de tentativas, mesmo que o cliente forje
   cabeçalhos de origem, e o evento registra o endereço real.

---

### Edge Cases

- Sessão cujo conteúdo foi adulterado, tem validade vencida ou foi cifrada com chave já
  descartada: recusada como não autenticada. Sessão cifrada com a chave anterior ainda aceita
  continua válida até expirar.
- Requisição de escrita vinda de outra origem, sem corpo JSON ou com tipo de conteúdo diferente:
  recusada antes de qualquer efeito.
- Corpo acima do limite de tamanho: recusado sem processamento.
- Identificador de correlação enviado pelo cliente que não é um UUID: ignorado e substituído.
- Logout com a base de acesso inacessível: a falha de registro é logada e a sessão do navegador é
  apagada mesmo assim.
- Registro de atividade (touch) que falha por rede: ignorado e tentado no intervalo seguinte; se o
  Core responder que a sessão é inválida, a próxima requisição é recusada.
- Core em versão anterior do contrato respondendo atividade sem corpo: aceito como sucesso.
- Profissional associado a um perfil Barbeiro vigente sendo inativado: recusado até que o perfil
  seja ajustado (ver Assumptions).
- Colaborador promovido a administrador: passa a ter acesso de administrador; os perfis locais
  permanecem gravados, mas não restringem o administrador.
- Pessoa revogada e reconvidada: recebe novo vínculo; perfis do vínculo anterior não são
  herdados automaticamente.
- Lista de membros ou de profissionais acima de uma página: paginada, com teto.
- Página inexistente: página amigável "não encontrada" com breadcrumb e caminho de volta.
- Tentativa de usar a aplicação com a instância suspensa durante uma transação já autorizada: a
  transação pode concluir; a próxima autorização é recusada.

## Requirements *(mandatory)*

### Functional Requirements

**Base do produto (C00)**

- **FR-001**: O produto DEVE ser entregue como um único aplicativo com servidor e interface no
  mesmo repositório e artefato, seguindo a estrutura e a stack fixadas pela constituição
  (`ECO-010`, `ECO-011`).
- **FR-002**: O produto DEVE validar toda a configuração na inicialização e falhar cedo quando
  faltar ou for inválido algum valor; o exemplo de configuração versionado DEVE listar todas as
  variáveis necessárias (origem pública, proxies confiáveis, segredo de sessão atual e anterior,
  credencial de aplicação, identificação da instância, endereço do Core) sem valores secretos.
- **FR-003**: A interface DEVE consumir exclusivamente o design system da Sparkling Hub na versão
  vigente (0.5.0) pela sua API pública, sem cópia nem sobrescrita de componentes, estilos ou
  tokens; a versão adotada DEVE ser registrada no histórico de atualizações do design system com
  impressão digital do pacote. Se a 0.5.0 não estiver publicada, DEVE ser usada a 0.4.0 e
  registrada a troca pendente como exceção.
- **FR-004**: O produto DEVE exibir a marca aprovada do Cortivo usando os sete arquivos oficiais
  sem edição, com verificação automatizada de que cada arquivo confere com o manifesto oficial;
  ícones de aba e de atalho DEVEM usar os arquivos oficiais.
- **FR-005**: Toda página autenticada DEVE usar a casca canônica do ecossistema (`UI-010`): menu
  lateral escuro recolhível, cabeçalho claro com menu em painel abaixo da largura de desktop,
  conteúdo em largura máxima padronizada, ações Sair e Recolher no rodapé do menu e o endosso "Uma
  solução da Sparkling Hub" com o menu expandido.
- **FR-006**: Toda página autenticada DEVE exibir breadcrumb acima do título (`UI-020`), declarado
  por rota, com primeiro nível "Cortivo" levando a Hoje e navegação sem recarregar a página.
- **FR-007**: O menu DEVE conter as 13 entradas da modelagem, na ordem definida, filtradas por
  papel e perfis; essa filtragem é apenas apresentação e não substitui a autorização no servidor.
- **FR-008**: As áreas de negócio fora desta fatia DEVEM existir como páginas com estado vazio
  "Disponível em breve", breadcrumb correto e nenhuma ação de negócio.
- **FR-009**: Cores DEVEM vir apenas dos tokens da paleta única do ecossistema; campos de
  telefone, documento, CEP, valor, porcentagem, data e hora DEVEM usar as máscaras do design
  system, com rótulo visível e envio do valor bruto.
- **FR-010**: A esteira de integração DEVE executar, em toda mudança, verificação de tipos,
  análise estática, testes unitários, testes de integração com banco MySQL 8.4 real, testes de
  contrato, jornadas de interface com verificação automática de acessibilidade e auditoria de
  dependências sem achados de severidade moderada ou superior.

**Instância e conexão (C01 — `INT-010`, `INT-020`)**

- **FR-011**: Na inicialização, o produto DEVE consultar a saúde do Core com tempo limite curto,
  obter os dados de conexão da sua instância e conferir os marcadores de identidade da base
  operacional e da base de acesso contra o identificador informado pelo Core e contra a faixa de
  versões de esquema suportada; qualquer divergência DEVE resultar em indisponibilidade das rotas
  de negócio e evento de segurança.
- **FR-012**: Cada conjunto de conexões DEVE pertencer a uma única instância e a uma única versão
  de credencial, sem troca de base em conexão compartilhada.
- **FR-013**: O produto DEVE revalidar os dados de conexão periodicamente (a cada 10 minutos) e
  ao detectar erro de autenticação no banco; nova versão de credencial DEVE substituir as
  conexões; instância não ativa DEVE descartar as conexões e recusar requisições.
- **FR-014**: Fora do ambiente de desenvolvimento, as conexões com o banco DEVEM ser cifradas.

**Autenticação e sessão (`INT-030`, `INT-040`, `INT-051`, `INT-060`)**

- **FR-015**: O login DEVE ser delegado ao Core, informando o endereço real do cliente, obtido da
  conexão e só aceito de cabeçalho de encaminhamento quando vier de proxy confiável configurado,
  ignorando o salto mais à direita não confiável.
- **FR-016**: O produto DEVE limitar tentativas de login a 20 por endereço em 15 minutos,
  respondendo "excesso de tentativas" acima do limite, e DEVE usar uma única resposta genérica
  para qualquer falha de credencial.
- **FR-017**: A sessão do navegador DEVE ser guardada em cookie exclusivo da origem do Cortivo,
  inacessível a scripts, restrito ao mesmo site, seguro fora do desenvolvimento local, com
  conteúdo cifrado e autenticado, validade emitida e verificada pelo servidor e suporte a rotação
  da chave (chave atual e anterior). O cookie NÃO DEVE ser fonte de papel nem de vínculo.
- **FR-018**: O produto DEVE registrar a atividade da sessão no Core no máximo uma vez a cada 5
  minutos por sessão, fora do caminho da resposta, com tempo limite; DEVE aceitar as respostas das
  duas versões do contrato em convivência; resposta de sessão inválida DEVE invalidar a sessão
  local na requisição seguinte.
- **FR-019**: O logout DEVE registrar o encerramento da sessão na base de acesso antes de apagar o
  cookie; falha nesse registro DEVE ser logada e o cookie DEVE ser apagado mesmo assim.

**Autorização (`INT-050`, `ECO-014`, `D-COR-03`)**

- **FR-020**: Toda rota protegida DEVE aplicar a regra normativa da projeção de acesso da
  instância; papel e identificador do vínculo DEVEM vir da projeção; ausência de linha válida DEVE
  resultar em não autenticado com cookie apagado.
- **FR-021**: O perfil local DEVE ser lido do banco operacional pelo vínculo vigente e DEVE apenas
  restringir o papel; administrador dispensa perfil local.
- **FR-022**: Perfis locais são Recepção e Barbeiro, acumuláveis; as permissões efetivas DEVEM
  ser a união dos perfis; Barbeiro DEVE estar associado a exatamente um profissional ativo, não
  associado a outro vínculo vigente.
- **FR-023**: Colaborador sem perfil DEVE ter acesso somente à tela "Configuração pendente" e às
  informações da própria sessão.
- **FR-024**: Com o Core indisponível e a projeção acessível, sessões válidas DEVEM continuar
  operando; login e mudanças de equipe DEVEM responder indisponibilidade temporária. Com a
  projeção inacessível, rotas protegidas DEVEM responder indisponibilidade temporária.
- **FR-025**: Logout, rebaixamento, revogação de vínculo e suspensão DEVEM valer na requisição
  seguinte à sua efetivação na projeção; reativação DEVE exigir novo login.
- **FR-026**: Recusas DEVEM ser idênticas para objeto, conta ou instância inexistente e para os
  pertencentes a outra instância.

**Equipe e perfis (`INT-070`, `CORE-COR-005`)**

- **FR-027**: Somente o administrador DEVE poder listar membros, convidar, revogar convite, mudar
  papel e revogar vínculo, sempre por meio do Core em nome do próprio administrador; o produto
  NÃO DEVE gravar vínculo, papel ou senha localmente nem decidir a regra do último administrador.
- **FR-028**: Somente o administrador DEVE poder definir perfis locais e cadastrar, editar e
  inativar profissionais (nome, apelido, telefone e estado ativo/inativo); edições concorrentes
  DEVEM ser detectadas e recusadas com aviso de conflito.
- **FR-029**: Toda alteração de perfil local e de profissional, e todo convite, revogação de
  convite, mudança de papel e revogação de vínculo feitos pela tela Equipe, DEVE gerar registro de
  auditoria local com ator, objeto, ação, resultado, valores anterior e novo, correlação e
  instante, sem e-mail de terceiros nem link de convite.
- **FR-030**: Aceite de convite e recuperação de senha DEVEM acontecer nas páginas do Core; o
  Cortivo DEVE oferecer, na tela de login, o caminho de recuperação mantido pelo Core.

**Sessão exposta à interface**

- **FR-031**: O produto DEVE oferecer à interface os dados da sessão atual: nome da conta, papel,
  perfis, profissional associado e unidade (nome e fuso informado pelo Core), sem e-mail de
  terceiros nem segredos.

**Linha de base de segurança e observabilidade (`SEC-BASE-*`)**

- **FR-032**: Operações de escrita autenticadas por cookie DEVEM verificar a origem, aceitar
  somente JSON e recusar outros tipos de conteúdo (`SEC-BASE-05`).
- **FR-033**: Corpos de requisição DEVEM ter limite de 1 MiB (`SEC-BASE-08`).
- **FR-034**: Interface e servidor DEVEM enviar os cabeçalhos de segurança da linha de base
  (`SEC-BASE-10`).
- **FR-035**: Registros de auditoria DEVEM ser somente inclusão, sem edição nem exclusão
  oferecida pela aplicação e sem permissão de alteração para a credencial operacional
  (`SEC-BASE-12`).
- **FR-036**: Logs DEVEM ser estruturados, com correlação aceita somente no formato UUID
  (gerada quando ausente ou inválida), instância verificada e operação; o tratamento global de
  erros NÃO DEVE registrar comandos de banco nem valores (`SEC-BASE-17`, `SEC-BASE-18`).
- **FR-037**: Erros da API DEVEM trazer código estável, mensagem segura, campo quando cabível,
  indicação de repetição possível e correlação, sem detalhes internos.
- **FR-038**: Listagens DEVEM ser paginadas com teto de 10.000 itens (`SEC-BASE-20`), e o
  utilitário de exportação CSV DEVE neutralizar conteúdo interpretável como fórmula
  (`SEC-BASE-21`), mesmo sem exportação de negócio nesta fatia.
- **FR-039**: Toda chamada ao Core DEVE ter tempo limite (2 s na saúde de inicialização, 3 s nas
  demais) e resultar em indisponibilidade explícita ao expirar (`SEC-BASE-07`).
- **FR-040**: Segredos, tokens, cookies e credenciais NÃO DEVEM aparecer em log, endereço,
  resposta, pacote da interface, CSV, auditoria, dados de teste ou captura de tela.
- **FR-041**: A credencial de aplicação DEVE ser vinculada à instância assim que o Core a
  oferecer (`SEC-BASE-01`); até lá, a dependência fica registrada e a homologação bloqueada
  (`D-COR-10`).
- **FR-042**: O produto DEVE medir e registrar a latência da autorização pela projeção.

**Telas (`UI-060`)**

- **FR-043**: As telas desta fatia são Login, Hoje (resumo vazio), Equipe, Configuração
  pendente e as páginas amigáveis de não autenticado, sem permissão, não encontrado e
  indisponível; cada uma DEVE especificar e implementar a matriz de estados do design system
  (inicial, vazio, carregando, inválido, enviando, sucesso após confirmação, erro, conflito, sem
  permissão, indisponível, leitura) e, quando autenticada, breadcrumb.
- **FR-044**: Login e Equipe DEVEM ser operáveis apenas por teclado, com rótulos visíveis e foco
  visível, sem violações sérias ou críticas na verificação automática de acessibilidade.

### Restrições normativas herdadas

Fixadas pela constituição e pelos padrões do ecossistema; detalhadas no plano, não rediscutidas
nesta especificação: portas da API (3003) e da interface de desenvolvimento (5177, fixa) e
endereço local do Core (`ECO-002`); um processo por instância (`ECO-012.1`, `D-COR-02`); bases
`cortivo_<uuid>` e `cortivo_<uuid>_acc` (`ECO-013`); cookie `__Host-cortivo_session` (com nome
sem prefixo apenas em desenvolvimento HTTP) cifrado com AES-256-GCM (`INT-040`); ordem de
estilos e raiz do tema do design system (`UI-001`); dinheiro em centavos inteiros, instantes em
UTC, datas civis no fuso da instância e intervalos `[início, fim)`. O Cortivo não altera contratos
`/internal/v1`; qualquer necessidade nova vira pedido versionado ao Core.

### Key Entities *(include if feature involves data)*

- **Instância (unidade)**: uma barbearia; identificada pelo Core (identificador, endereço curto,
  estado, fuso, versão de credencial); dona exclusiva de uma base operacional e de uma base de
  acesso.
- **Marcador de identidade da instância**: registro gravado em cada base na migração inicial,
  conferido com o Core na inicialização.
- **Projeção de acesso**: visão, mantida pelo Core na base de acesso, de sessões, vínculos,
  papéis e estado da instância; o Cortivo apenas lê e registra encerramentos de sessão.
- **Encerramento de sessão**: registro de logout gravado pelo Cortivo na base de acesso.
- **Sessão do produto**: referência cifrada no navegador à sessão central; sem papel nem vínculo.
- **Membro e convite**: pessoas vinculadas à unidade e convites pendentes, mantidos no Core e
  exibidos pelo Cortivo.
- **Perfil do colaborador**: conjunto não vazio de perfis locais (Recepção, Barbeiro) por vínculo
  vigente, com profissional associado quando houver Barbeiro e controle de versão para edição
  concorrente.
- **Profissional (cadastro mínimo)**: nome, apelido, telefone, estado; pode ser associado a no
  máximo um vínculo vigente; pode existir sem conta.
- **Registro de auditoria**: ator, objeto, ação, valores anterior e novo, correlação e instante;
  somente inclusão.
- **Registro de idempotência e fila de eventos de saída**: estruturas obrigatórias desde a
  migração inicial, sem uso de negócio nesta fatia.
- **Atualização do design system**: entrada de histórico com versão, impressão digital, motivo e
  testes reexecutados.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos ensaios automatizados com duas instâncias sintéticas (rota, corpo,
  cabeçalho, cookie, identificadores, pool reutilizado), nenhuma informação de uma instância é
  lida, alterada ou revelada pela outra, e a recusa é indistinguível da de algo inexistente.
- **SC-002**: Em 100% dos ensaios, logout, rebaixamento, revogação de vínculo e suspensão são
  efetivos na primeira requisição após a efetivação, e a reativação exige novo login.
- **SC-003**: A latência da autorização pela projeção é medida e registrada com ambiente e massa
  declarados; o p95 de uma leitura protegida completa fica em até 800 ms.
- **SC-004**: Com o Core indisponível, 100% das leituras com sessão válida continuam funcionando
  e 100% das tentativas de login recebem indisponibilidade temporária; com a base de acesso
  indisponível, 100% das rotas protegidas recebem indisponibilidade temporária.
- **SC-005**: 100% dos itens da linha de base de segurança aplicáveis a esta fatia têm teste de
  aceite que falha quando a defesa é removida.
- **SC-006**: Um administrador recém-convidado entra e atribui perfil a um colaborador em até 3
  minutos, sem ajuda, na primeira tentativa.
- **SC-007**: 100% das rotas autenticadas exibem breadcrumb correto; nenhuma tela apresenta
  rolagem horizontal em 320, 360, 768 e 1280 px; zero violações sérias ou críticas de
  acessibilidade nas jornadas automatizadas.
- **SC-008**: Os 7 arquivos de marca conferem com o manifesto oficial; zero segredos encontrados
  na varredura de logs, respostas, pacote da interface, CSV e dados de teste.
- **SC-009**: Todas as alterações de perfil e de profissional feitas nos ensaios aparecem na
  trilha de auditoria, e nenhuma tentativa de alterar ou excluir registros de auditoria é aceita.

## Assumptions

- O Core oferece o contrato `/internal/v1` v1.3.3 e, durante a fatia, pode passar a responder
  conforme v1.4; o produto convive com as duas versões declaradas no plano.
- A credencial de aplicação por instância (`SEC-BASE-01`) ainda não existe no Core; o
  desenvolvimento usa a credencial disponível, e a homologação fica bloqueada até o endurecimento
  do Core (`D-COR-10`).
- `AC-COR-001` (provisionamento concorrente e retomada) é executado pela Parte A no repositório do
  Core; esta fatia consome a instância já ativada.
- O item 7 de `INT-110` (lote de utilização contado uma vez) depende da utilização F08 e fica para
  a fatia C09; esta fatia cobre os itens 1–6.
- Ensaios usam duas instâncias Cortivo sintéticas (A e B) e um vínculo da mesma conta no Tuteli;
  nenhum dado real é usado enquanto `D-COR-07` estiver aberta.
- O envio e a experiência de aceite de convite são do Core; o Cortivo exibe convites pendentes
  como o Core os devolve, sem persistir nem registrar em log e-mails de terceiros.
- Inativar um profissional associado a um perfil Barbeiro vigente é recusado com conflito até
  que o administrador ajuste o perfil, preservando a regra "Barbeiro exige exatamente um
  profissional ativo".
- Administradores não precisam de perfil local. A associação de um administrador que também
  atende a um profissional fica para a fatia C02 (com expediente e agenda); nesta fatia, só o
  perfil Barbeiro de um colaborador associa vínculo e profissional.
- O cadastro de profissional desta fatia é mínimo; serviços habilitados, expedientes e bloqueios
  entram em C02.
- A meta de 800 ms refere-se ao tempo total de uma leitura protegida, com ambiente e massa
  declarados no plano; o p95 é registrado como evidência, não como limite de desempenho geral.
- Fora do escopo: regras de negócio de C02 em diante, utilização F08 (C09), pedidos e WhatsApp,
  MFA para usuários do produto e implantação em produção.
