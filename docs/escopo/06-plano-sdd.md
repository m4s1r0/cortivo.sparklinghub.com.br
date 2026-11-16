# 06 — Plano SDD

## Sequência e rastreabilidade

`C00` fixa o contexto técnico. Cada fatia seguinte entrega uma jornada demonstrável com os requisitos indicados. Os IDs `Cnn` são do plano de produto e permanecem estáveis quando cada `spec.md` receber seu próprio número no Spec Kit. Os cenários compartilhados são exercitados novamente quando a fatia introduz nova condição de negócio.

| Fatia | Entrega verificável | Depende de | Requisitos | Aceite principal |
| --- | --- | --- | --- | --- |
| C00 — Base e decisões | Fixar versões, constituição do Cortivo, código no catálogo, decisões de topologia, ambiente, contratos e massa de referência. | — | `CORE-COR-001`, `CORE-COR-008`, `NFR-COR-007` | Preparar a execução de `AC-COR-001` a `AC-COR-004`. |
| C01 — Instância e acesso | Provisionar duas instâncias, ativar uma, aceitar convite, entrar, sair e demonstrar autorização pela projeção e revogação. | C00, Core F01/F02/F03 | `CORE-COR-001`, `CORE-COR-002`, `CORE-COR-003`, `CORE-COR-004`, `CORE-COR-005`, `CORE-COR-006`, `CORE-COR-008`, `NFR-COR-001` | `AC-COR-001`, `AC-COR-002`, `AC-COR-003`, `AC-COR-004` |
| C02 — Unidade e cadastros | Configurar estabelecimento, cliente, serviço, profissional, perfil local, expediente e bloqueios. | C01 | `COR-001`, `COR-002`, `COR-003`, `COR-004`, `COR-020`, `NFR-COR-002` | `AC-COR-021` |
| C03 — Agenda | Reservar, consultar, remarcar, cancelar, marcar chegada e falta, com capacidade concorrente. | C02 | `COR-005`, `COR-006` | `AC-COR-005`, `AC-COR-007` |
| C04 — Fila, encaixe e atendimento | Operar Hoje do agendado e da chegada espontânea até conclusão ou interrupção. | C03 | `COR-007`, `COR-008`, `COR-009`, `COR-010` | `AC-COR-006`, `AC-COR-008`, `AC-COR-009` |
| C05 — Comanda de serviço e caixa | Confirmar venda do atendimento, registrar recebimento parcial ou integral, conferir turno, estornar e cancelar. | C04 | `COR-011`, `COR-012`, `COR-013`, `COR-014` | `AC-COR-011`, `AC-COR-012`, `AC-COR-013` na parte de serviços. |
| C06 — Revenda e estoque | Controlar insumos, registrar revenda e quantidades concorrentes, confirmar balcão e repor por cancelamento. | C05 | `COR-003`, `COR-011`, `COR-012`, `COR-014`, `COR-015` | `AC-COR-010`, `AC-COR-011`, `AC-COR-013` com revenda. |
| C07 — Comissões | Configurar regra, congelar taxa, apurar quitação, estornar e fechar competência com extrato individual. | C06 | `COR-016`, `COR-017` | `AC-COR-014` |
| C08 — Retorno e gestão | Ver cadências e contatos, consultar relatórios operacionais, exportar e consultar auditoria. | C04, C06, C07 | `COR-018`, `COR-019`, `COR-020`, `NFR-COR-005`, `NFR-COR-008` | `AC-COR-015`, `AC-COR-016` |
| C09 — Utilização no Core | Entregar contagens deduplicadas ao Core e observar atraso e recuperação. | C04, C05, Core F08 validado | `CORE-COR-007`, `NFR-COR-004` | `AC-COR-017` |
| C10 — Prontidão do MVP | Demonstrar continuidade, desempenho, navegação móvel, atualização de esquema e piloto com evidências. | C01 a C09 | `CORE-COR-006`, `CORE-COR-008`, `NFR-COR-001`, `NFR-COR-002`, `NFR-COR-003`, `NFR-COR-004`, `NFR-COR-005`, `NFR-COR-006`, `NFR-COR-007`, `NFR-COR-008` | `AC-COR-018`, `AC-COR-022` e regressão C01 a C09. |
| C11 — Pedidos a fornecedores | Emitir, receber parcialmente, atualizar saldo e encerrar o restante. | C06, MVP homologado | `COR-021`, `COR-022` | `AC-COR-019` |
| C12 — WhatsApp | Configurar políticas, validar elegibilidade, enviar, reconciliar retorno e aplicar descadastramento. | C08, MVP homologado, canal definido | `COR-023`, `COR-024`, `NFR-COR-005` | `AC-COR-020` |

Auditoria, acessibilidade e isolamento são incrementais. A consulta administrativa de auditoria chega em C08. O roteiro de piloto operacional após C05 demonstra ponta a ponta com venda de serviço. Antes de usar dados reais, aplicar os controles de continuidade e privacidade mesmo se o piloto anteceder C10. C06 e C07 definem a ativação de estoque e comissões sobre dados existentes: entradas iniciais auditadas para saldo e data de corte explícita para comissão. O plano de comissão define como tratar vendas ainda pendentes na data de corte. Métricas operacionais passam a registrar eventos de origem antes da entrega em C09 ou têm marco de início documentado, conforme a decisão de implantação.

## Decisões a confirmar

| ID | Proposta ou questão | Verificar até |
| --- | --- | --- |
| `D-COR-01` | Uma unidade por instância. Código `cortivo` para cadastro novo. Verificar se existe código anterior no ambiente-alvo, confirmar origem e reservar portas. | C00, antes da primeira migração de catálogo ou artefato. |
| `D-COR-02` | Um processo lógico por instância no piloto. Registrar versão do Core, topologia, origem, rotação de credenciais, versão do esquema e canal de convites. Confirmar teste de D-04 e compatibilidade F08. | C00/C01, antes de integrar. F08 precisa estar provado antes de C09. |
| `D-COR-03` | Recepção e barbeiro como perfis locais do colaborador. Confirmar permissões, visibilidade de clientes e possibilidade de a mesma pessoa acumular funções. O recorte proposto usa um perfil por vínculo. | C02, antes de fechar matriz de ações. |
| `D-COR-04` | Capacidade por profissional, fila por chegada entre entradas aptas, tolerância inicial de 10 min e encaixe no mesmo dia. Validar política de atraso, atendimento com preferência e alteração de serviços com a operação piloto. | C03/C04, antes dos respectivos contratos. |
| `D-COR-05` | Pagamento manual parcial, venda anônima quitada no ato, um turno aberto, descarte de rascunho e cancelamento integral, estoque com consumo manual. Confirmar descontos, vendas a receber, devoluções e unidades de medida com o proprietário. | C05/C06, antes do modelo financeiro e de estoque. |
| `D-COR-06` | Comissão percentual sobre serviço líquido reconhecida na quitação, sem produto, competência mensal e correção no período atual. Confirmar regra de taxa, arredondamento, data de corte e tratamento de vendas preexistentes. | C07, antes de migrar ou apurar. |
| `D-COR-07` | Confirmar cadências, contato permitido, campos, retenção, anonimização, capacidade, metas de continuidade, hospedagem e aceite do piloto. | C08 para retorno e dados, antes de uso real para privacidade e recuperação, C10 para metas medidas. |
| `D-COR-08` | Validar prioridade comercial de pedidos e automação, responsável pelas preferências, canal/provedor, custos, modelos, retorno e reconciliação. | Antes de C11/C12, nos pontos aplicáveis a cada fatia. |

## Artefatos por fatia

1. **Especificar.** Use `spec.md` para jornada priorizada e demonstrável, comportamento, requisitos, exceções, entidades e métricas observáveis, com referências a `COR-*`, `CORE-COR-*`, `NFR-COR-*` e `AC-COR-*`. Registre ambiguidades que afetam regra, contrato ou aceite. Use a [estrutura de especificação do workspace](../../../../.specify/templates/spec-template.md).
2. **Planejar.** Use `plan.md` com a constituição do produto, ADRs, estratégias de testes, transações e efeitos sobre operação. Gere `research.md`, `data-model.md`, `contracts/` e `quickstart.md` quando houver conteúdo correspondente. Fixe a versão dos contratos Core consumidos, o manifesto e as evidências de compatibilidade. Use o [modelo de plano](../../../../.specify/templates/plan-template.md).
3. **Decompor.** Use `tasks.md` na ordem de dependências, com caminho de arquivo esperado, tarefa de verificação e requisito associado. Separe trabalho do Core e do Cortivo quando houver mudança nos dois repositórios. Mantenha os testes de contrato, concorrência ou isolamento necessários próximos à fatia. Use o [modelo de tarefas](../../../../.specify/templates/tasks-template.md).
4. **Verificar e implementar.** Registre evidências em `evidence.md` ou artefato de verificação equivalente. Use o [fluxo Spec Kit versionado no workspace](../../../../.specify/workflows/speckit/workflow.yml) para controlar especificação, plano, tarefas e implementação no repositório do Cortivo, após preparar sua configuração.

### Pronta para implementar

- Jornada, inclusão e exclusão da fatia, IDs e aceite estão escritos. Decisões que alteram segurança, dados ou comportamento foram registradas e fechadas no ponto correspondente.
- Estados, atores, permissões, transações, reenvio, falhas e testes de intervalo/saldo têm exemplos compatíveis com os requisitos.
- Mudança de integração tem versão, compatibilidade, contrato e prova com instâncias sintéticas. A fatia registra a origem que deve permanecer estável.
- Telas têm rótulos, estado vazio, carregamento, erro, conflito e fluxo de teclado com critérios observáveis no [contrato visual SDD](../../../../UX/design-system/docs/SDD.md).

### Concluída

- Jornada demonstrada pela entrada normal da interface ou contrato, com os casos de sucesso e negativa previstos. Alterações de estado estão cobertas no banco real.
- Migração validada em banco novo e banco com dados sintéticos anteriores. Fluxos afetados e versão do esquema são documentados.
- Build, verificação estática, testes de domínio, integração, contrato e interface aplicáveis passaram. Evidência registra versão, caso e resultado. A integração não introduz regressão nos contratos que o Tuteli e o produto de referência consomem.
- Permissões, auditoria e comportamento durante indisponibilidade foram exercitados. Pendências de liberação entram no registro da fatia que as resolve.

## Instrução de entrada para a primeira sessão

> Use `docs/escopo/README.md` e os seis documentos vinculados como entrada de produto. Comece pela C00 e prepare a especificação de C01. Recupere os contratos publicados do SparkCore e fixe a base validada. Preserve o catálogo e a identidade central, os dois bancos exclusivos por instância e a D-04 para validar sessões opacas na projeção. Use os IDs do escopo nos requisitos, testes e evidências. Confirme D-COR-01 e D-COR-02 antes da migração de catálogo e do contrato com o Core. Documente a prova de provisionamento de duas instâncias, isolamento, suspensão e continuidade com sessão válida e Core indisponível. Planeje C02 em diante respeitando as dependências e as decisões por fatia.

## Decisões confirmadas em 15/11/2026

D-COR-03 (perfis acumuláveis), D-COR-04 (tolerância e passo de 15 min), D-COR-05a/b (desconto só
administrador; dinheiro, Pix, crédito e débito), D-COR-06 (comissão na quitação sobre serviço
líquido), D-COR-09 (cliente com e-mail e nascimento opcionais, sem CPF), D-COR-10 (Cortivo em
paralelo ao endurecimento do Core) e D-COR-11 (piloto em C00–C05) estão registradas em
[modelagem/05-decisoes.md](../modelagem/05-decisoes.md), que prevalece sobre as propostas
anteriores deste pacote. Os padrões de integração, interface e segurança passam a ser os do
diretório canônico do Core, `docs/ecossistema/`.
