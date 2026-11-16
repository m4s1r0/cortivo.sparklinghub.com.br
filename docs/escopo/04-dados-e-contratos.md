# 04 — Dados e contratos do Cortivo

Os nomes a seguir são entidades e operações lógicas. O `plan.md` da fatia define tabelas, índices, chaves estrangeiras, OpenAPI e como provar compatibilidade. O contrato do SparkCore continua em [Relação com o SparkCore](02-integracao-sparkcore.md).

## Modelo lógico por banco operacional

| Entidade | Campos ou relações essenciais | Regra de integridade |
| --- | --- | --- |
| Unidade | Nome de atendimento, contato, fuso, expediente e versão | Uma por instância. A identidade da instância vem do Core. |
| Profissional, habilitação e perfil local | Estado, vínculo operacional opcional, serviços habilitados, perfil e `membership_id` | Associação de barbeiro a um profissional ativo e único por vínculo. O profissional continua no histórico após inativação. |
| Expediente e bloqueio | Profissional ou unidade, dia da semana ou período datado, intervalos | Bloqueios usam instantes resolvidos pelo fuso. Alteração com reserva em conflito exige resolução. |
| Cliente e preferência de contato | Nome, formas de contato, preferência de profissional, estado, canal, finalidade, origem e data da preferência | Preferências têm histórico. Telefone normalizado é indexável e admite coincidência. |
| Serviço e item físico | Estado, nome, duração, preço, cadência, modalidade de uso, unidade de estoque e saldo mínimo | Tipos e valores validados no servidor. Identificadores são estáveis para histórico. |
| Agendamento e itens reservados | Origem, cliente, profissional, início/fim planejados, estado, versão e snapshots de serviço, duração e preço | Intervalo válido, exclusão de sobreposição e transição controlada. |
| Entrada de fila | Cliente, chegada, prioridade ajustada com motivo, preferência, itens, estado e reserva resultante | Uma entrada ativa por cliente. Uma única conversão por entrada. |
| Atendimento e item executado | Reserva, origem, profissional, cliente, início e fim reais, itens executados, motivo de interrupção e snapshots de cadência e regra de comissão | Um atendimento por reserva. Somente um atendimento em curso por profissional e cliente. |
| Comanda, item e vínculo de faturamento | Cliente quando aplicável, tipo, atendimento, quantidade, preço, desconto rateado, total, confirmação e referência a cancelamento | Item de serviço executado tem no máximo um vínculo de venda confirmada vigente. Produtos carregam quantidade e unidade de estoque. |
| Recebimento e turno de caixa | Venda, turno, meio, valor, instante, ator, vínculo com lançamento original, fundo e fechamento | Turno único aberto. Um estorno integral por recebimento. Fechamento imutável. |
| Saldo e movimento de estoque | Item, quantidade com precisão fixa, tipo, origem, instante, ator, motivo e chave de negócio | Extrato é a origem histórica do saldo. Cada efeito de venda, estorno ou entrada de pedido é aplicado uma vez. |
| Regra, lançamento e competência de comissão | Profissional, serviço opcional, vigência, taxa em pontos-base, item, base, valor, quitação ou estorno ou refaturamento, competência | Uma regra aplicável por prioridade e vigência. Lançamentos são compensáveis. Fechamento congela totais. |
| Retorno e contato | Cliente, serviço, item executado de origem, data sugerida, adiamento, reserva vinculada, situação e contatos | Uma sugestão corrente por cliente e serviço. Histórico de substituições e contatos permanece. |
| Auditoria, idempotência e saída de eventos | Ator/contexto, ação, resultado, correlação, chave, resumo e resultado persistido, versão do evento, tentativas e estado | Sem segredos. A trilha de sucesso e o evento saem da transação que efetiva o comando. |
| Fornecedor, pedido e recebimento de pedido | Contato, itens e custos congelados, quantidade pedida, entregue e cancelada, status e histórico | Entrega física confirmada e entrada de estoque atômicas. Fase de evolução. |
| Mensagem e evento de entrega | Finalidade, referência à reserva/retorno, versão, janela de envio, chave do provedor, estado e evidência de permissão | Uma intenção por referência, finalidade e versão. Revalidar a preferência no envio. Fase de evolução. |

## Estados e fronteiras transacionais

| Registro | Estados e transições principais |
| --- | --- |
| Agendamento | `reservado → chegou → em_atendimento → concluido` ou `interrompido`. `reservado → falta` após tolerância. `reservado` ou `chegou → cancelado` antes do início. Remarcação versiona o mesmo registro antes de iniciar. Iniciar pode registrar a chegada na mesma transação. |
| Entrada de fila | `aguardando → convertido`, `desistiu` ou `cancelado`. Ajuste de prioridade preserva a chegada original. |
| Atendimento | `em_atendimento → concluido` ou `interrompido`. Itens registram execução total conforme seleção do barbeiro no encerramento. |
| Comanda | `rascunho → confirmada → cancelada`. Rascunho pode ser descartado. Para venda confirmada, `em_aberto`, `parcial` e `quitada` são estados financeiros derivados do saldo. |
| Turno de caixa | `aberto → fechado`. Correção de turno fechado usa movimento atual com referência ao original. |
| Competência de comissão | `aberta → fechada`, proposta mensal civil. Recebe movimentos da data do evento. Fechamento apenas após fim do período. |
| Retorno | `sugerido → adiado`, `agendado`, `dispensado` ou `substituido`. Cancelamento ou falta da reserva pode reativar a sugestão, respeitando sua elegibilidade. Contato é registro separado. |
| Pedido | `rascunho → emitido → parcialmente_recebido → recebido`. `emitido → recebido` em entrega integral inicial. `emitido` ou `parcialmente_recebido → encerrado_com_saldo_cancelado`. Cancelamento integral exige entrega líquida zero e nenhuma entrada histórica confirmada. |
| Mensagem | `pendente → enviando → aceita`, `falha` ou `incerta`. `incerta` exige reconciliação. `aceita → entregue` quando o provedor confirma. `pendente → cancelada` por perda de elegibilidade. |

- Reservar, remarcar, confirmar encaixe, mudar horário ou bloqueio e iniciar atendimento serializam a validação contra os mesmos recursos profissionais e clientes envolvidos. A política de travas precisa abranger todas as janelas afetadas, inclusive mudança de dia e reservas que cruzem meia-noite. A operação de encaixe confirma reserva e atualiza fila juntas. A estratégia exata de travas deve ser demonstrada com MySQL real.
- Ao confirmar venda, bloquear a comanda e as linhas de saldo de estoque envolvidas. Persistir itens, desconto, histórico de faturamento e baixas juntos. Venda anônima também bloqueia o turno e inclui o pagamento integral na mesma transação. Se qualquer passo falha, a operação pode ser repetida sem saldo, venda ou recebimento órfão.
- Receber ou estornar serializa venda e turno. Revalidar saldo, estado aberto, unicidade do estorno e efeito em comissão. Fechamento usa o mesmo mecanismo de exclusão do turno. Registros monetários concluídos recebem lançamentos compensatórios. Estornar pagamento, cancelar venda e repor produto são efeitos distintos, com estados e referências próprias.
- Regras de comissão têm vigência por profissional e serviço, com taxa inteira em pontos-base. Definir ordem de arredondamento e casos de empate. Fechamento e lançamentos serializam a competência. Nova quitação após estorno cria uma nova ocorrência, com unicidade por item e fato de quitação.
- Em todas as transações críticas, repetir requisição com mesma chave, ator, instância e operação devolve o resultado persistido se o conteúdo for igual. Conteúdo diferente gera `409`. Manter resultado por pelo menos 24 h e proteger efeitos permanentes por chaves de negócio após a janela. Versão divergente em cadastro editável ou reserva exige revisão dos dados atuais.

## Convenções de tempo e valores

- Instantes persistidos em UTC. Dia civil, tolerância, janela de comunicação e ciclo mensal usam o fuso IANA da instância. O servidor resolve a data/hora de entrada e trata horário local inexistente ou ambíguo explicitamente. Define-se intervalo de agenda como `[início, fim)`. Datas de retorno sem hora ficam como data civil.
- Dinheiro em centavos inteiros em contratos e cálculo. Preço, base e taxa usam snapshots próprios. Desconto de linha ou total mantém total líquido não negativo. Excedente em dinheiro é troco, com valor líquido alocado ao caixa. Quantidades de insumos usam precisão fixa por unidade, independente da representação de dinheiro.
- Exemplo de comissão. Serviço R$ 100, produto R$ 20 e desconto total R$ 12 geram bases líquidas de R$ 90 e R$ 18. A 40%, o serviço rende R$ 36 na quitação dos R$ 108. Pagar R$ 40 primeiro não gera comissão. Se o restante for recebido depois, a comissão entra na data da quitação. Estornar o pagamento de R$ 68 reduz o recebido líquido a R$ 40, reabre R$ 68 e lança −R$ 36 na competência atual.

## Operações a detalhar em OpenAPI

| Área | Comandos e consultas | Condições a explicitar na spec |
| --- | --- | --- |
| Sessão e acesso | Entrar, sair, consultar sessão, listar/convidar membros e definir perfil | Contexto, cookie, autorização de ator e comportamento de Core ou projeção indisponível. |
| Cadastros | Criar, editar, inativar e pesquisar clientes, profissionais e catálogo, cadastrar expediente e bloqueio | Paginação, filtros, versão, uso histórico e conflitos ativos. |
| Agenda e fila | Consultar agenda/disponibilidade e fila, reservar, remarcar, cancelar, marcar chegada ou falta, criar entrada e confirmar encaixe | Permissões, intervalos, payload por transição, versão e chave em mutações críticas. |
| Atendimento | Iniciar, acrescentar item autorizado, registrar execução, concluir ou interromper, registrar consumo | Profissional, reserva, estado atual, execução parcial e correlação. |
| Comercial | Rascunhar, confirmar, cancelar, receber, estornar, abrir, movimentar e fechar caixa | Chaves, dinheiro em centavos, troco, gravar em transação, saldo e referências. |
| Estoque e comissões | Consultar saldo/extrato, entrada, ajuste, regra de comissão e fechar competência | Unidade de medida, privilégios, vigência, integridade e lançamentos concorrentes. |
| Retornos e relatórios | Consultar, adiar, dispensar e registrar contato, filtrar relatório, exportar CSV e consultar auditoria | Fuso, visibilidade, dados pessoais, escape no CSV e limites. |
| Evolução | Emitir pedido, receber parcialmente, encerrar saldo, programar envio, reconciliar e receber status de mensagem | Autorização, autenticação do provedor, deduplicação e comportamento incerto. |

Usar API de produto versionada. Erros têm código estável, mensagem em português, campo quando aplicável, possibilidade de reenvio e identificador de correlação. Usar `401` para sessão inválida, `403` para ação proibida no contexto, `404` para recurso invisível ou inexistente, `409` para conflito ou estado concorrente, `422` para entrada inválida e `503` para indisponibilidade de dependência necessária. O sucesso retorna a versão ou estado confirmado. Na perda de resposta de mutação, a UI recupera o resultado ou reenvia com a mesma chave.
