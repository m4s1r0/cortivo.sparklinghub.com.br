# Research — Unidade e cadastros do Cortivo (C02)

Decisões fundamentadas na constituição, na especificação C02, nos documentos de escopo e modelagem e nos manifestos do repositório. Não há decisão técnica em aberto que impeça o desenho; o artefato de migração do produto continua sendo publicado no Core.

## R-01 — Limite da fatia e precedência de requisitos

**Decision**: C02 entrega configuração da unidade, cadastros de clientes e preferências, catálogo, profissionais, habilitações, expediente, bloqueios e auditoria administrativa básica. Não implementa agenda, fila, atendimento, venda, caixa, movimentação de estoque nem envio automatizado de mensagens. O mínimo de consulta administrativa paginada da auditoria fica em C02 por `COR-020` e FR-023; relatórios, exportação e análise ampliada continuam em C08.

**Rationale**: O plano SDD identifica C02 como “Unidade e cadastros” e associa `COR-001..004`, `COR-020` e `AC-COR-021`. Os requisitos C03 em diante dependem dos registros aqui preparados. A decisão fecha o aparente conflito entre manter auditoria incrementavelmente desde C02 e entregar sua visão de gestão/relatórios em C08.

**Alternatives considered**: Adiar toda consulta de auditoria para C08, o que deixaria FR-023 sem aceite na fatia solicitada; antecipar relatórios e exportações completos, o que traria escopo explícito de C08 para C02.

## R-02 — Stack e organização da aplicação

**Decision**: Continuar o monólito `api/` + `web/` do projeto. A API usa Node.js 22 ESM, TypeScript estrito, Hono, Kysely e mysql2; a SPA usa React 19, React Router 7, TanStack Query 5, Vite 7 e o design system 0.5.0 já vendorizado. Reutilizar dependências existentes, sem introduzir biblioteca nova para C02.

**Rationale**: A constituição exige o monólito modular (`api/` e `web/`), e os manifests atuais já declaram essas dependências. A fatia anterior fixa o padrão de cliente da API, testes e biblioteca de interface. Os diretórios `api/src` e `web/src` ainda não estão presentes no checkout, então o trabalho de C02 deverá criar os módulos conforme a estrutura aprovada, sem presumir implementação existente.

**Alternatives considered**: Criar serviço separado para cadastros ou trazer outra biblioteca de validação/estado; ambos aumentariam a superfície e contrariam a estrutura e as dependências já definidas.

## R-03 — Persistência, versionamento e migração

**Decision**: Persistir na base operacional MySQL 8.4 exclusiva da instância, com tipos e convenções de `docs/modelagem/02-modelo-de-dados.md`: UUID v7 binário, instantes UTC em `DATETIME(6)`, datas civis `DATE`, valores monetários em centavos inteiros e `version` otimista. O modelo C02 estende o marcador de `unidade` já introduzido em 0001 e o profissional/perfil da versão 2; reservar a próxima migração de esquema (`0003`) para os cadastros da fatia, confirmando a versão e publicando o artefato no repositório Core antes da integração.

**Rationale**: A especificação do modelo declara `unidade` em 0001 e `profissional`/integridade do perfil em 0002. A constituição determina que o artefato de migração vive no Core e que o checkout local mantém espelho/guarda contra deriva. A migração precisa funcionar em base vazia e a partir da última versão suportada.

**Alternatives considered**: Criar tabelas diretamente a partir da API ou manter um esquema de produto separado do manifesto do Core; ambas violariam a propriedade e o ciclo de provisionamento definidos para o artefato. A numeração `0003` é a próxima versão prevista, sujeita à confirmação do dono do artefato.

## R-04 — Isolamento, referência a membros e autorização

**Decision**: Derivar instância, ator e papel da sessão e projeção de acesso já validadas em C01. Cada consulta e alteração usa somente o banco operacional da instância corrente. IDs de membros são referências opacas da projeção; validar vínculo/papel na projeção e não criar chaves estrangeiras entre bancos. O administrador configura unidade, equipe operacional, catálogo e auditoria; Recepção e administrador podem operar cadastros de clientes; outros acessos seguem a matriz de perfis já definida.

**Rationale**: Princípios I e II proíbem aceitar instância ou identidade enviada pelo cliente como autoridade, exigem isolamento por banco e fazem o perfil local apenas restringir o papel do Core. A especificação C02 reutiliza estes limites, sem alterar o contrato `/internal/v1`.

**Alternatives considered**: Guardar cópia local autoritativa do papel ou aceitar `membershipId` sem revalidar a projeção; ambas permitem acesso após revogação ou associação a outro contexto.

## R-05 — Dados pessoais e busca de clientes

**Decision**: Coletar somente nome obrigatório, telefone opcional, e-mail opcional, nascimento opcional, observação até 280 caracteres e profissional preferido. Não solicitar CPF. Armazenar telefone normalizado para exibição e uma forma de busca por dígitos, com índice não único; detectar possíveis coincidências sem mesclar ou recusar o cliente. Preferências de contato mantêm histórico com canal, finalidade, permissão, origem, ator e instante; ausência de permissão não autoriza contato.

**Rationale**: Decisão confirmada D-COR-09 e modelo C02. Um telefone pode ser compartilhado por família ou domicílio. Nenhum fluxo de mensagem automatizada faz parte de C02.

**Alternatives considered**: Tornar telefone obrigatório ou único, coletar documento, substituir preferências antigas ou assumir consentimento por ausência de registro; cada alternativa contradiz as decisões de minimização e as regras do modelo.

## R-06 — Intervalos e disponibilidade

**Decision**: Representar horários de unidade e expediente como conjuntos semanais de intervalos locais válidos, sem sobreposição. Representar bloqueios como instantes UTC no intervalo semiaberto `[início, fim)`, vinculados a profissional ou unidade. A disponibilidade potencial é a interseção dos horários de unidade e expediente individual menos bloqueios; reservas vigentes serão consideradas quando C03 introduzir agenda. Alterações que conflitariam com reservas existentes precisam apresentá-las e exigir resolução antes de confirmar.

**Rationale**: Esta é a regra de `COR-004` e do modelo 02; explicitar que a consulta a reservas só se aplica quando a entidade existir evita antecipar C03 sem enfraquecer a regra.

**Alternatives considered**: Intervalos com fim inclusivo ou persistir disponibilidade como cópias de cada slot; ambos complicam fronteiras e duplicam a fonte da regra.

## R-07 — Auditoria, idempotência e concorrência

**Decision**: Toda alteração confirmada coberta por C02 grava metadados de auditoria e alteração segura na mesma transação local que a efetiva. Não registrar credenciais, tokens, telefone ou e-mail completos, nem observações completas nos snapshots. A tabela segue append-only, com a credencial operacional limitada a leitura e inserção. Cadastros editáveis recebem controle de versão; mutações repetíveis seguem o envelope de idempotência do projeto quando criam efeitos ou quando o contrato-base exigir. A consulta mínima de auditoria é administrativa e paginada.

**Rationale**: Princípios IV, V e VI e `SEC-BASE-12` exigem versionamento, transação real no MySQL e trilha imutável. A consulta mínima cobre `COR-020`; a visão analítica e exportável fica fora até C08.

**Alternatives considered**: Registrar auditoria depois da transação em chamadas independentes, permitir editar/excluir histórico, ou gravar snapshots integrais de PII; esses caminhos quebram atomicidade, integridade ou minimização.

## R-08 — Interface e contratos locais

**Decision**: Aplicar `docs/modelagem/04-interface.md`: casca e breadcrumbs existentes no plano C01, formulários com campos formatados do design system, tabelas/listas paginadas, estados de vazio/carregamento/erro/conflito, operação por teclado e suporte a 320 px/zoom 200%. Documentar as novas rotas da API como extensão aditiva do OpenAPI local do Cortivo; não modificar o contrato do SparkCore. Documentar também o comportamento de telas e permissões.

**Rationale**: O Princípio VIII exige o padrão canônico, e o Princípio III proíbe o Cortivo de alterar contratos do Core. A interface e API do produto são contratos próprios e a especificação exige aceite de UX.

**Alternatives considered**: Acrescentar C02 ao contrato do Core ou deixar comportamento de telas implícito; a primeira opção viola a fronteira de integração e a segunda inviabiliza os gates de interface.

## R-09 — Estratégia de validação

**Decision**: Executar typecheck, lint, testes unitários de regras puras, testes de integração contra MySQL 8.4 real, testes de contrato, E2E com Playwright/axe e build. Incluir testes negativos com duas instâncias sintéticas em toda rota nova; provar isolamento, autorização, versionamento otimista, imutabilidade de auditoria e cenários de conflito. Usar apenas dados sintéticos até fechar D-COR-07.

**Rationale**: Princípios I, V e IX e os scripts do monorepo definem estes gates. A infraestrutura de testes está declarada nos manifests, embora os diretórios-fonte ainda estejam ausentes.

**Alternatives considered**: Substituir MySQL por mocks em testes de persistência ou usar dados reais para acelerar o ensaio; ambos são proibidos pela constituição.
