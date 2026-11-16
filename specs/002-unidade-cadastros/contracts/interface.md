# Contrato de interface — fatia C02

Aplicação de [modelagem 04](../../../docs/modelagem/04-interface.md) e dos critérios de
acessibilidade `NFR-COR-002`. A casca, o menu, a marca e breadcrumbs permanecem como em C01; este
documento define as telas entregues nesta fatia. Componentes e estilos usam o design system
0.5.0 já fixado pelo projeto.

## Rotas e permissões

| Rota | Tela e ações | Acesso |
| --- | --- | --- |
| `/configuracoes` | Dados da unidade, horários semanais, parâmetros de operação e itens faltantes para prontidão | Administrador |
| `/clientes` | Busca por nome/telefone, lista paginada, aviso de possível coincidência e criação | Administrador, Recepção |
| `/clientes/novo` | Cadastro de cliente mínimo | Administrador, Recepção |
| `/clientes/:id` | Dados, preferências e histórico disponível; inativação exige confirmação e resolução de conflitos | Administrador, Recepção (leitura e edição permitida) |
| `/catalogo` | Abas Serviços e Produtos/insumos; lista, filtros de estado, criar, editar e inativar | Administrador; Recepção com leitura |
| `/equipe` | Membros e perfis existentes da C01 mais a lista de profissionais | Administrador |
| `/equipe/profissionais/novo` | Cadastro mínimo de profissional | Administrador |
| `/equipe/profissionais/:id` | Dados, serviços habilitados, expediente, bloqueios, conflitos e estado | Administrador |
| `/auditoria` | Eventos administrativos de C02, paginados e minimizados | Administrador |

Tentativa de acesso fora da matriz apresenta estado “Sem permissão”; esconder uma ação no menu não
substitui a autorização da API. Colaborador sem perfil continua na configuração pendente de C01.
Não adicionar rotas de agenda, envio de mensagens, caixa, estoque operacional ou exportação nesta
fatia.

A listagem de profissionais existente em C01 é somente leitura para Recepção e administrador;
escritas e configuração do perfil continuam restritas ao administrador. Essa leitura permite
selecionar profissional preferido no cadastro do cliente sem expor controles de equipe.

## Formulários e apresentação

| Tela | Campo/controle | Formatação e validação visível |
| --- | --- | --- |
| Unidade | Telefone e WhatsApp | máscara `phone`; API recebe dígitos e normaliza |
| Unidade | CEP | máscara `cep`; API recebe oito dígitos |
| Unidade | Nome e fuso de origem | nome editável; fuso de origem identificado como central; editar fuso em operação segue fluxo protegido |
| Unidade | Horários | dia da semana e pares início/fim `HH:MM`; adicionar/remover intervalos; erro junto ao intervalo |
| Unidade | Tolerância e passo | minutos inteiros; passo restrito a 5/10/15/20/30; padrões 15/15 |
| Cliente | Telefone | máscara `phone`; opcional; coincidências são exibidas, nunca bloqueiam |
| Cliente | E-mail | opcional, entrada de e-mail normalizada pelo servidor |
| Cliente | Nascimento | opcional, máscara de data e envio `AAAA-MM-DD` |
| Cliente | Observações | até 280 caracteres; orientação para não incluir dados sensíveis desnecessários |
| Cliente | Profissional preferido | opções ativas; não é uma reserva nem autorização de contato |
| Catálogo | Preço de serviço/item | máscara `currency`; envio como centavos inteiros |
| Catálogo | Duração/cadência | inteiros positivos; cadência pode ser vazia |
| Item | Unidade/precisão/uso | opções `un`, `ml`, `g`, 0–3 casas e uma ou ambas as modalidades |
| Profissional | Telefone | máscara `phone`; opcional e enviado como dígitos |
| Profissional | Serviços | seleção múltipla somente de serviços ativos |
| Profissional | Expediente | intervalos por dia em `HH:MM`; lacunas representam pausas |
| Profissional | Bloqueio | início/fim com fuso exibido e motivo; bloqueio semiaberto |
| Perfis | Barbeiro | preserva fluxo C01; exige profissional ativo único e versão do perfil |
| Auditoria | Lista | ator, instante, ação, resultado, tipo de entidade, motivo minimizado; sem contatos integrais |

## Estados e feedback

Cada tela implementa: carregando, vazio, sem resultados, inválido, enviando, sucesso após resposta,
erro recuperável, conflito 409 com opção de recarregar e sem permissão. Erros de validação são
associados ao campo correspondente; conflitos de reserva apresentam os registros afetados e
impedem confirmação até sua resolução. Uma gravação bem-sucedida confirma os dados retornados pela
API, não apenas o estado local.

## Acessibilidade e viewport

- Todos os campos têm rótulo persistente e instruções/erros programaticamente associados.
- Fluxos de cadastro e diálogo de inativação funcionam integralmente por teclado; foco visível e
  restaurado após fechar diálogos.
- Não usar cor isolada para diferenciar estado ou conflito; status têm texto.
- Testar 320, 360, 768 e 1280 px e ampliação de 200%; tabelas podem converter linhas em cartões ou
  rolar em sua própria região sem impor rolagem horizontal à página.
- Avisos, conflitos e confirmações são anunciados sem deslocar o foco inesperadamente; respeitar
  preferência de movimento reduzido.
- Validar com axe sem violações sérias/críticas nas jornadas de unidade, cliente, catálogo,
  profissional e auditoria.
