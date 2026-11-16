# 01 — Visão e recorte

## Produto e público

[H] O Cortivo atende barbearias que trabalham com horário marcado e atendimento por ordem de chegada. A primeira entrega deve responder três perguntas na operação diária: quem será atendido agora, quem cabe antes da próxima reserva e o que a barbearia vendeu e recebeu. O proprietário é o comprador. Recepção e barbeiros operam o produto. Os clientes finais são pessoas atendidas pela barbearia.

[P] Uma instância atende uma unidade, seguindo o padrão do Tuteli. O mesmo contratante pode ter várias instâncias no SparkCore. Agenda, estoque, caixa e relatórios operam por unidade. Uma pessoa pode ter vínculos em unidades distintas, cada qual com seu próprio contexto de acesso.

## Jornadas em ordem de prioridade

| Jornada | Prioridade | Resultado demonstrável |
| --- | --- | --- |
| J01 — Abrir uma unidade | P1 | O responsável da plataforma provisiona e ativa a instância no SparkCore. O administrador convidado entra e deixa a unidade apta a atender. |
| J02 — Coordenar o dia | P1 | A recepção reserva um corte, registra uma chegada espontânea e oferece um encaixe que respeita expediente, duração e próxima reserva. |
| J03 — Atender e receber | P1 | O barbeiro executa o serviço. A recepção confirma a comanda, registra o recebimento e confere o saldo a receber quando o pagamento for parcial. |
| J04 — Conferir operação e comissão | P1 | O proprietário distingue serviços, vendas, recebimentos, saldo físico, estoque e comissão. O barbeiro consulta somente o próprio extrato. |
| J05 — Estimular retorno | P2 | A recepção vê quem está no período sugerido de retorno, registra o contato manual e acompanha se houve nova reserva. |
| J06 — Repor estoque | P2 | O gestor prepara um pedido ao fornecedor e confere entregas parciais sem duplicar entrada. |
| J07 — Automatizar comunicação | P2 | O Cortivo envia confirmações, lembretes e mensagens de retorno elegíveis e registra entrega e descadastramento. |

## Entregas propostas

| Marco | Inclui |
| --- | --- |
| Piloto operacional | J01 a J03, com agenda, fila e encaixe, atendimento, venda de serviços e caixa básico. Unidades piloto e dados sintéticos na validação técnica. |
| MVP comercial | Piloto mais revenda, estoque, comissões, conciliação diária, relatórios, retorno e contato manual, auditoria e prontidão operacional. J01 a J05. |
| Evolução prevista | J06 e J07. O pedido a fornecedor, seu recebimento e a automação de WhatsApp são capacidades do escopo de produto, com entrega posterior ao MVP proposta. |

Ficam fora deste escopo o agendamento público pelo cliente, aplicativo nativo, operação offline, consolidação entre filiais, assinatura ou clube de cortes, folha ou repasse bancário de comissões, emissão fiscal, captura ou conciliação bancária automática, financeiro contábil e cobrança automática da assinatura SaaS. Atendimento externo, cadastro de cadeiras como recurso independente e sincronização com agendas de terceiros ficam como oportunidades futuras. A capacidade inicial usa um profissional por atendimento.

## Papéis e permissões propostas

| Ação | Administrador da unidade | Colaborador · recepção | Colaborador · barbeiro |
| --- | --- | --- | --- |
| Configurar unidade, serviços, preços, expediente, produtos e parâmetros | Gerencia | Consulta o necessário à operação | Consulta o necessário à operação |
| Convidar, mudar papel ou revogar vínculo | Pelo contrato do Core | — | — |
| Configurar perfil operacional de colaborador | Gerencia na unidade | — | — |
| Cadastrar cliente, agendar, remarcar, cancelar e gerenciar fila | Toda a unidade | Toda a unidade | Consulta sua agenda e atendimentos atribuídos |
| Iniciar, concluir ou interromper atendimento | Toda a unidade | Toda a unidade | Somente os próprios |
| Abrir e fechar caixa, vender e receber | Toda a unidade | Toda a unidade | — |
| Estornar, ajustar estoque, alterar regras ou fechar competência de comissão | Toda a unidade com justificativa quando exigida | — | — |
| Registrar consumo de insumo | Toda a unidade | Toda a unidade | Somente vinculado a atendimento próprio em curso |
| Ver relatórios e exportar | Toda a unidade | Visão do dia e do caixa operacional | Própria agenda e comissão, sem exportação global |
| Retorno e contato manual | Toda a unidade | Toda a unidade | — |
| Pedidos e configuração da automação | Toda a unidade | Consulta da operação necessária | — |

O Core concede `administrador` ou `colaborador` por vínculo. Perfil de recepção ou barbeiro é condição operacional local do Cortivo, associada ao `membership_id` vigente. O colaborador sem perfil recebe uma tela de configuração pendente. O perfil de barbeiro exige associação a um único profissional ativo naquele contexto. Um profissional pode ser cadastrado e agendado sem conta de usuário. A revogação do vínculo elimina o acesso mesmo com perfil e profissional ainda cadastrados. Cada novo vínculo recebe seu próprio perfil.

O administrador da Sparkling Hub opera o ciclo de vida pelo SparkCore. Um proprietário que use o Cortivo precisa de conta e vínculo válidos para a unidade. O cliente da barbearia é um cadastro operacional e não precisa de identidade de plataforma.

## Vocabulário de operação

| Termo | Uso |
| --- | --- |
| Contratante | Pessoa ou empresa que contrata o SaaS, registrada no SparkCore. |
| Instância | Ambiente do Cortivo provisionado pelo Core, com um UUID, um banco de acesso e um banco operacional próprios. |
| Cliente | Pessoa atendida na barbearia. Seus dados e histórico ficam na unidade. |
| Agendamento | Reserva de intervalo para um cliente e um profissional, contendo um ou mais serviços. |
| Fila | Ordem de chegadas espontâneas e disponibilidade para encaixe. Uma entrada pode indicar profissional preferido. |
| Encaixe | Reserva criada a partir de uma entrada da fila, após revalidar capacidade. |
| Atendimento | Execução real, com profissional, itens e horários efetivos. |
| Comanda | Registro comercial de serviços executados e produtos, com total e saldo a receber. |
| Caixa | Turno de recebimentos e movimentos de dinheiro físico. |
| Comissão | Valor operacional apurado para o profissional conforme regra da unidade e histórico do item. |
| Retorno | Sugestão de nova visita derivada de serviço concluído e sua cadência configurada. |
