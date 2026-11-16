# Feature Specification: Unidade e cadastros do Cortivo (C02)

**Feature Branch**: `002-C02-unidade-e-cadastros`

**Created**: 2026-11-16

**Status**: Draft

**Input**: User description: "`COR-001..004`, `COR-020`; modelagem 02 (unidade, profissional, expediente, bloqueio, cliente, serviço, item)"

**Rastreabilidade**: Fatia `C02`; `COR-001..004`, `COR-020`, `NFR-COR-002`; aceite `AC-COR-021`; decisões `D-COR-03`, `D-COR-04`, `D-COR-09`.

**Referências de escopo**: [requisitos funcionais](../../docs/escopo/03-requisitos-funcionais.md), [qualidade e aceite](../../docs/escopo/05-qualidade-e-aceite.md), [plano SDD](../../docs/escopo/06-plano-sdd.md) e [modelo de dados](../../docs/modelagem/02-modelo-de-dados.md).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Preparar a unidade para operar (Priority: P1)

O administrador configura o nome de atendimento, os contatos, o endereço, o fuso e os horários da unidade. A tela informa o que ainda falta para que a unidade possa começar a receber reservas, sem exigir que o administrador descubra sozinho qual configuração está incompleta.

**Why this priority**: Toda operação é vinculada a uma unidade; sua configuração é a base dos cadastros e da disponibilidade das próximas fatias.

**Independent Test**: Em uma unidade recém-ativada, preencher e salvar os dados da unidade e os horários; conferir que os valores persistem, que horários inválidos não são aceitos e que a lista de configurações pendentes se atualiza ao habilitar os pré-requisitos.

**Acceptance Scenarios**:

1. **Given** uma unidade sem configuração operacional, **When** o administrador abre Configurações, **Then** vê a identidade e o fuso recebidos da plataforma, os dados editáveis da unidade e a indicação dos itens pendentes para habilitar reservas.
2. **Given** horários válidos para cada dia, **When** o administrador os salva, **Then** a unidade passa a exibi-los como seus horários e pode manter mais de um intervalo no mesmo dia, sem sobreposição.
3. **Given** intervalos sobrepostos, invertidos ou incompletos, **When** o administrador tenta salvá-los, **Then** a alteração é recusada com indicação do campo ou conflito e os valores válidos já salvos permanecem.
4. **Given** uma unidade ainda sem operação, **When** o administrador configura a tolerância e o passo da agenda, **Then** ambos iniciam em 15 minutos, a tolerância pode ser ajustada em minutos inteiros não negativos e o passo aceita apenas 5, 10, 15, 20 ou 30 minutos.
5. **Given** uma unidade com reservas ou histórico operacional, **When** o administrador tenta mudar o fuso, **Then** a mudança não ocorre sem procedimento explícito que apresente seus impactos e exija confirmação.
6. **Given** qualquer formulário desta fatia, **When** o operador navega por teclado ou amplia a tela para 200%, **Then** o foco permanece visível, erros aparecem junto aos campos e os controles continuam utilizáveis sem rolagem horizontal em largura de 320 px.

### User Story 2 - Cadastrar profissionais e disponibilidade (Priority: P1)

O administrador mantém a equipe operacional, cadastra profissionais que podem ou não ter uma conta da plataforma, associa serviços habilitados e define os intervalos semanais de trabalho. Também registra bloqueios por profissional ou para toda a unidade. Um colaborador com perfil de barbeiro fica associado a exatamente um profissional ativo; perfis Recepção e Barbeiro podem coexistir.

**Why this priority**: Profissionais, habilitações e disponibilidade são pré-requisitos da configuração inicial de reservas e da operação diária.

**Independent Test**: Cadastrar um profissional sem conta, associar serviços, salvar expediente com pausa e criar um bloqueio; em seguida, associar um colaborador com perfil de barbeiro e verificar as regras de unicidade e estado ativo.

**Acceptance Scenarios**:

1. **Given** um profissional ainda não cadastrado, **When** o administrador informa o nome e, quando disponíveis, apelido e telefone e o salva como ativo, **Then** o profissional fica disponível para as configurações compatíveis mesmo sem conta na plataforma.
2. **Given** um profissional e serviços ativos, **When** o administrador habilita serviços para ele, **Then** apenas os serviços selecionados aparecem como habilitados para esse profissional.
3. **Given** intervalos semanais que não se sobrepõem, **When** o administrador define expediente, **Then** os intervalos são preservados e os espaços entre eles representam pausas.
4. **Given** um bloqueio válido com início e fim, **When** o administrador o registra para um profissional ou para a unidade, **Then** o período não fica disponível para reservas e o motivo fica associado ao bloqueio.
5. **Given** alteração de expediente, inativação ou bloqueio que conflita com reservas vigentes, **When** o administrador tenta concluir a alteração, **Then** o sistema lista os conflitos e exige que cada reserva afetada seja resolvida antes de salvar.
6. **Given** um colaborador com perfil Barbeiro, **When** o administrador associa um profissional, **Then** a associação exige exatamente um profissional ativo e não permite que o mesmo profissional ativo seja associado a outro vínculo vigente.
7. **Given** um colaborador com Recepção e Barbeiro, **When** seus perfis são salvos, **Then** ambos permanecem ativos e as permissões correspondem à união dos dois perfis, sem ampliar o papel concedido pela plataforma.
8. **Given** horários de unidade, expediente profissional e bloqueios cadastrados, **When** a unidade avalia disponibilidade, **Then** somente os períodos em comum permanecem disponíveis, descontados os bloqueios e as reservas vigentes existentes.

### User Story 3 - Cadastrar e localizar clientes com privacidade (Priority: P1)

A recepção ou o administrador cadastra e localiza clientes para a unidade, registra os meios de contato e preferências por finalidade, consulta os dados operacionais e preserva o histórico. O cadastro pode ser feito mesmo quando o cliente não informa telefone, e um telefone compartilhado não impede o registro de pessoas diferentes.

**Why this priority**: Clientes e suas preferências sustentam os fluxos de atendimento futuros, sem exigir dados desnecessários para o cadastro inicial.

**Independent Test**: Criar dois clientes com o mesmo telefone, um cliente sem telefone e outro com e-mail e nascimento opcionais; localizar por nome e telefone e verificar preferências e estado de inativação.

**Acceptance Scenarios**:

1. **Given** um cliente com nome, **When** a recepção ou o administrador salva o cadastro, **Then** o cliente fica vinculado somente à unidade atual.
2. **Given** dois clientes com o mesmo telefone, **When** um deles é salvo ou localizado, **Then** o sistema permite ambos, sinaliza a possível coincidência e exibe resultados que permitem distingui-los.
3. **Given** um cliente cadastrado, **When** a recepção ou o administrador busca pelo nome ou telefone, **Then** os registros correspondentes são apresentados sem exigir correspondência única.
4. **Given** e-mail ou data de nascimento não informados, **When** o cadastro é salvo, **Then** ambos permanecem opcionais; o cadastro não solicita CPF.
5. **Given** uma preferência de contato alterada, **When** o cliente ou operador registra a nova escolha para um canal e finalidade, **Then** a escolha vigente é atualizada sem apagar as anteriores e a alteração preserva origem, ator e instante.
6. **Given** um cliente com compromissos ativos, **When** o administrador tenta inativá-lo, **Then** precisa resolver os compromissos antes de concluir; depois de inativado, o cadastro não pode ser usado em novas reservas e seu histórico permanece.
7. **Given** campos de telefone, CEP, data, horário ou moeda, **When** o operador os preenche, **Then** cada campo apresenta o formato correspondente e o valor salvo corresponde ao valor semântico informado.
8. **Given** um cliente sem nome, **When** a recepção ou o administrador tenta salvá-lo, **Then** o cadastro é recusado e o campo de nome é indicado como obrigatório.

### User Story 4 - Manter o catálogo de serviços e itens (Priority: P2)

O administrador cadastra os serviços oferecidos e os itens usados ou revendidos pela unidade. Serviços têm duração e preço claros; itens indicam como são usados, sua unidade de medida e, quando revendidos, seu preço. A inativação impede novas seleções sem apagar referências históricas.

**Why this priority**: O catálogo permite avaliar a prontidão da unidade e prepara os cadastros para agenda e estoque, que serão entregues em fatias posteriores.

**Independent Test**: Cadastrar serviços válidos e inválidos, associar um serviço a um profissional, registrar itens para revenda e insumo, e inativar um serviço e um item já referenciados em histórico.

**Acceptance Scenarios**:

1. **Given** um serviço com nome, duração positiva e preço não negativo, **When** o administrador o salva, **Then** seus valores ficam disponíveis para consulta e habilitação por profissional.
2. **Given** um serviço com duração zero ou negativa, preço negativo ou cadência de retorno não positiva, **When** o administrador tenta salvá-lo, **Then** o cadastro é recusado com indicação do valor inválido.
3. **Given** um serviço ativo habilitado para um profissional ativo, **When** o administrador consulta a habilitação, **Then** a relação é exibida e pode ser removida sem apagar os históricos já associados.
4. **Given** um item usado para revenda, insumo ou ambos, **When** o administrador o cadastra com unidade e precisão válidas, **Then** a modalidade de uso e os dados de venda aplicáveis são preservados.
5. **Given** um serviço ou item inativado, **When** um operador prepara uma nova operação, **Then** ele não pode selecionar esse cadastro, mas as referências e os valores históricos continuam disponíveis.
6. **Given** um item que já possui movimentação de estoque, **When** alguém tenta alterar sua unidade de medida ou precisão, **Then** a alteração é recusada.
7. **Given** os campos de preço do catálogo, **When** o administrador informa um valor monetário, **Then** a exibição permite entrada de moeda e o preço salvo corresponde ao valor indicado, sem arredondamento inesperado.

### User Story 5 - Rastrear alterações administrativas (Priority: P1)

O administrador consegue verificar que mudanças relevantes de configuração, perfis, profissionais, clientes, preferências e catálogo foram registradas com o responsável e o resultado. A trilha não pode ser alterada para ocultar mudanças anteriores e não deve expor dados pessoais completos ou segredos.

**Why this priority**: A trilha dá transparência às alterações que afetam a operação e cumpre a exigência de correção e responsabilização administrativa.

**Independent Test**: Alterar dados da unidade, perfil, profissional, preferência de contato e preço; consultar os registros administrativos e confirmar que cada ação tem ator, instante, ação, resultado, referência e correlação, sem conteúdo sensível desnecessário.

**Acceptance Scenarios**:

1. **Given** uma alteração válida em qualquer cadastro coberto por esta fatia, **When** ela é concluída, **Then** a mesma operação deixa um registro de auditoria com ator, instante, ação, resultado, referência e correlação.
2. **Given** uma alteração que exige justificativa, **When** o administrador a confirma com motivo, **Then** o motivo é preservado junto ao registro correspondente.
3. **Given** registros administrativos de C02, **When** um administrador consulta a trilha, **Then** pode navegar os resultados em páginas e vê somente os dados pessoais necessários à conferência.
4. **Given** um operador sem permissão administrativa, **When** tenta consultar a trilha, **Then** não recebe os registros.
5. **Given** um registro de auditoria existente, **When** alguém tenta alterá-lo ou removê-lo, **Then** a operação é recusada e o registro original permanece íntegro.

### Edge Cases

- Um cliente pode não informar telefone, e vários clientes podem compartilhar o mesmo telefone; a busca deve continuar útil sem fundir cadastros.
- Nenhum profissional ativo ou serviço habilitado impede que a unidade seja considerada pronta para receber reservas; a tela identifica o item faltante.
- Expedientes ou horários de unidade com intervalos inválidos, repetidos ou sobrepostos não podem ser salvos parcialmente.
- Um bloqueio que coincida com uma reserva vigente ou uma mudança de expediente que afete reservas não pode ser aplicado sem resolução explícita dos conflitos.
- Um colaborador pode acumular perfis, mas não pode operar com o perfil Barbeiro sem associação válida a um profissional ativo.
- Inativar clientes, profissionais, serviços ou itens não apaga histórico nem permite novas seleções; compromissos vigentes precisam ser resolvidos quando aplicável.
- A ausência de preferência registrada não autoriza contato. Esta fatia mantém preferências, mas não envia mensagens nem automatiza contatos.
- Datas e horários próximos a mudanças de fuso ou horário de verão devem ser apresentados no fuso da unidade; horário local inexistente ou ambíguo exige validação clara, não gravação silenciosa.
- Dados livres de observação não podem exceder 280 caracteres nem ser replicados integralmente na trilha de auditoria.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST apresentar ao administrador o nome e o fuso associados à unidade pela plataforma, identificando esses dados como origem da unidade.
- **FR-002**: O sistema MUST permitir ao administrador configurar nome de atendimento, contatos, endereço e horários de funcionamento da unidade, mantendo uma unidade operacional por instância.
- **FR-003**: O sistema MUST validar os intervalos de funcionamento, permitir intervalos separados no mesmo dia e impedir sobreposições, fim anterior ao início e períodos incompletos.
- **FR-004**: O sistema MUST apresentar quais configurações ainda faltam para habilitar reservas; a unidade somente fica pronta quando tem ao menos um serviço ativo, um profissional habilitado e disponibilidade configurada.
- **FR-005**: O sistema MUST aplicar os valores iniciais de 15 minutos para tolerância de falta e passo da agenda; o administrador MUST poder ajustar a tolerância em minutos inteiros não negativos e escolher apenas passos de 5, 10, 15, 20 ou 30 minutos.
- **FR-006**: O sistema MUST impedir mudança de fuso de uma unidade com operação sem um procedimento explícito que avalie e apresente o impacto sobre agenda e relatórios e exija confirmação.
- **FR-007**: O sistema MUST permitir cadastrar profissionais operacionais ativos ou inativos com nome obrigatório, apelido e telefone opcionais, com conta da plataforma ou sem conta, e preservar o profissional inativado para consulta histórica.
- **FR-008**: O sistema MUST permitir habilitar serviços para profissionais e MUST NOT oferecer para novas operações serviços ou profissionais inativos.
- **FR-009**: O sistema MUST permitir definir expediente semanal por profissional em um ou mais intervalos por dia; intervalos sobrepostos ou inválidos MUST ser recusados.
- **FR-010**: O sistema MUST permitir bloqueios datados para um profissional ou para toda a unidade, com motivo, início e fim; o início pertence ao bloqueio e o fim não pertence. A disponibilidade efetiva MUST corresponder aos períodos comuns entre o horário da unidade e o expediente profissional, descontados bloqueios e, quando existentes, reservas vigentes.
- **FR-011**: Quando alteração de expediente, inativação de profissional ou bloqueio afetar reservas vigentes, o sistema MUST listar os conflitos e exigir a resolução de cada reserva antes de concluir.
- **FR-012**: O sistema MUST permitir perfis locais Recepção e Barbeiro acumuláveis em um colaborador; o perfil Barbeiro MUST estar associado a exatamente um profissional ativo e único entre vínculos vigentes.
- **FR-013**: Perfis locais MUST restringir, nunca ampliar, o papel concedido pela plataforma; a alteração de perfil deve manter o vínculo e o histórico operacional separados.
- **FR-014**: O sistema MUST permitir criar e editar clientes com nome obrigatório, telefone opcional, e-mail opcional, data de nascimento opcional, observação operacional de até 280 caracteres, profissional preferido e estado; MUST NOT solicitar CPF.
- **FR-015**: O sistema MUST normalizar telefones para busca, localizar clientes por nome ou telefone e sinalizar possíveis coincidências sem exigir telefone único nem bloquear o cadastro.
- **FR-016**: O sistema MUST permitir registrar preferências por canal (WhatsApp, telefone ou SMS) e finalidade (confirmação, lembrete ou retorno), preservando histórico, origem, ator e instante de cada alteração e identificando a escolha vigente.
- **FR-017**: O sistema MUST permitir inativar um cliente sem apagar seu histórico; compromissos vigentes devem ser resolvidos antes da inativação, e clientes inativos não podem ser usados em novas reservas.
- **FR-018**: O sistema MUST permitir cadastrar serviços com nome, duração positiva em minutos, preço não negativo e cadência de retorno opcional em dias inteiros positivos.
- **FR-019**: O sistema MUST permitir cadastrar itens para revenda, insumo ou ambos, com unidade de medida `un`, `ml` ou `g`, precisão de zero a três casas decimais e preço de venda quando habilitados para revenda.
- **FR-020**: A unidade de medida e a precisão de um item MUST permanecer imutáveis depois de sua primeira movimentação; a inativação de serviço ou item MUST preservar as referências históricas e impedir novas seleções.
- **FR-021**: O sistema MUST registrar na auditoria cada alteração concluída de configuração da unidade, perfil local, profissional, expediente, bloqueio, cliente, preferência, serviço ou item, incluindo ator, instância, instante, ação, resultado, referência e correlação.
- **FR-022**: O sistema MUST preservar os registros de auditoria sem permitir alteração ou remoção e MUST evitar incluir segredos ou dados pessoais completos na trilha.
- **FR-023**: O sistema MUST permitir consulta administrativa paginada dos registros de C02, minimizando dados pessoais e recusando acesso a quem não tenha permissão administrativa.
- **FR-024**: Os formulários e estados desta fatia MUST ser utilizáveis por teclado, manter foco visível, distinguir carregamento, vazio, ausência de resultados, erro e conflito, apresentar erros junto aos campos correspondentes e permanecer legíveis sem rolagem horizontal em largura de 320 px e com zoom de 200%.
- **FR-025**: Campos de telefone, CEP, data, horário e moeda MUST exibir formatação adequada à entrada, sem alterar o valor semântico salvo pelo usuário.

### Key Entities

- **Unidade**: estabelecimento operacional único da instância, com identidade e fuso de origem, nome de atendimento, contatos, endereço, horários e parâmetros operacionais.
- **Horário da unidade**: intervalos de funcionamento associados a cada dia da semana, sem sobreposição.
- **Profissional**: pessoa que pode executar serviços na unidade, com nome, apelido, contato, estado e associação opcional a um vínculo da plataforma.
- **Perfil local**: conjunto acumulável de capacidades de Recepção e Barbeiro associado a um vínculo; o perfil Barbeiro requer um profissional ativo.
- **Habilitação de serviço**: relação entre profissional e serviço que define quais serviços aquele profissional pode executar.
- **Expediente**: intervalos semanais em que um profissional trabalha; lacunas entre intervalos representam pausas.
- **Bloqueio**: período datado indisponível para um profissional ou para a unidade, com motivo e estado.
- **Cliente**: pessoa atendida pela unidade, com dados de contato opcionais, observação curta, preferência de profissional, estado e histórico operacional.
- **Preferência de contato**: decisão histórica do cliente por canal e finalidade, com origem, ator e instante de registro; a decisão mais recente de cada combinação é a vigente.
- **Serviço**: opção oferecida pela unidade, com nome, duração, preço, estado e cadência de retorno opcional.
- **Item**: produto físico usado como insumo, vendido para revenda ou ambos, com unidade de medida, precisão, estado e dados de venda aplicáveis.
- **Registro de auditoria**: evidência imutável de uma ação administrativa, com ator, instância, instante, ação, resultado, referência, motivo quando aplicável e correlação.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em um teste de usabilidade com cinco administradores usando uma unidade vazia, ao menos quatro conseguem configurar a unidade, cadastrar um profissional e habilitar um serviço em até 10 minutos, sem ajuda de um operador.
- **SC-002**: 100% dos cenários de aceite de unidade, expediente, bloqueio, cliente, perfil, catálogo e auditoria passam com os casos válidos e inválidos definidos nesta especificação.
- **SC-003**: 100% das alterações administrativas concluídas nos cadastros cobertos por C02 produzem um registro de auditoria consultável, e nenhum registro anterior pode ser alterado ou removido.
- **SC-004**: Em 100% dos casos de busca testados por nome ou telefone, clientes coincidentes são apresentados sem fundir cadastros nem impedir que um telefone compartilhado seja salvo.
- **SC-005**: Usuários completam os fluxos primários com teclado; as telas permanecem utilizáveis em 320 px e com ampliação de 200%, sem perda de campos, ações ou indicação de erros.
- **SC-006**: Em testes com clientes que não informaram dados opcionais, o cadastro continua concluível sem telefone, e-mail ou data de nascimento, e nenhuma tela solicita CPF.
- **SC-007**: Em validação com cinco operadores, ao menos quatro identificam corretamente qual configuração falta para habilitar reservas, sem consultar documentação externa.
- **SC-008**: Em pesquisa pós-tarefa com cinco operadores, ao menos quatro classificam como claras as instruções de configuração pendente e conseguem explicar qual é o próximo passo.

## Assumptions

- A unidade, a autenticação, os vínculos da equipe e a origem do fuso já são fornecidos pela fatia C01; C02 não cria credenciais nem modifica os contratos de identidade da plataforma.
- A instância corresponde a uma única unidade operacional. O fuso inicial é herdado da plataforma; mudar fuso depois do início da operação exige avaliação explícita de impactos.
- A administração de configurações, equipe, expediente, bloqueios, catálogo e auditoria é restrita ao administrador; recepção pode cadastrar e localizar clientes, consultar o catálogo e ler a lista de profissionais necessária à preferência do cliente, conforme as permissões existentes.
- Clientes, profissionais, serviços e itens são sempre isolados à unidade atual; identificadores de outra instância não são aceitos como autoridade.
- Preferências são registradas por finalidade e canal, mas C02 não envia mensagens nem agenda automações de contato.
- C02 estabelece os cadastros necessários à agenda e ao estoque, mas não implementa reserva, fila, atendimento, venda, caixa ou movimentação de estoque; essas capacidades pertencem a fatias posteriores.
- O histórico de reservas, atendimentos e retornos é preservado quando existir; as telas podem exibir estado vazio até que as fatias correspondentes estejam disponíveis.
- A trilha de auditoria de C02 cobre as alterações aqui descritas; relatórios mais amplos e a consulta analítica de auditoria evoluem junto à fatia C08.
- Os testes usam dados sintéticos; retenção de dados reais, anonimização e continuidade permanecem sujeitos à decisão D-COR-07.
