# Cortivo — escopo de produto para SDD

**Versão 0.1 · 15/11/2026 · Proposta para especificação e validação de produto**

O Cortivo, anteriormente apresentado como SparkBarba, é o SaaS de gestão para barbearias da Sparkling Hub. O proprietário acompanha a operação e os resultados. A recepção concilia reservas e chegadas espontâneas. O barbeiro consulta sua agenda, atende e acompanha suas comissões. A unidade usa o SparkCore para contratação administrativa, identidade, provisionamento, estado e acesso à instância.

## Resultado esperado

O SparkCore provisiona e ativa a instância da barbearia e habilita seu primeiro administrador. No Cortivo, a equipe configura serviços e expedientes, agenda um corte, recebe um cliente sem reserva, oferece um horário sem comprometer a próxima reserva, executa o atendimento e registra a comanda e o recebimento. O proprietário confere caixa, estoque, comissões, faltas e retornos sugeridos. A evolução completa o fluxo com pedidos a fornecedores e automação de WhatsApp.

| Documento | Conteúdo |
| --- | --- |
| [01 — Visão e recorte](01-visao-e-recorte.md) | Jornadas, papéis, módulos, limites do MVP e histórico. |
| [02 — Relação com o SparkCore](02-integracao-sparkcore.md) | Responsabilidades, catálogo, bancos, autorização, estados, resiliência e telemetria. |
| [03 — Requisitos do produto](03-requisitos-funcionais.md) | Fluxos de agenda, encaixe, atendimento, venda, caixa, estoque, comissões, retorno, fornecedores e WhatsApp. |
| [04 — Dados e contratos](04-dados-e-contratos.md) | Entidades, transações, regras de consistência e operações para detalhar no planejamento. |
| [05 — Qualidade e aceite](05-qualidade-e-aceite.md) | Metas, cenários verificáveis e evidências de homologação. |
| [06 — Plano SDD](06-plano-sdd.md) | Fatias, dependências, rastreabilidade, decisões pendentes e entrada para o Spec Kit. |

## Como ler

- **[U] Pedido atual.** Nome Cortivo, continuidade da relação com o SparkCore e preparação para SDD.
- **[H] Histórico ou contrato vigente.** Capacidade registrada no briefing de produto, na identidade aprovada ou no SparkCore. Uma capacidade histórica pode ser entregue em fases.
- **[P] Proposta.** Sequência, regra detalhada ou limite operacional elaborado para esta versão. As decisões que pedem confirmação têm ID `D-COR-*`.
- `CORE-COR-*` identifica a integração, `COR-*` identifica funções, `NFR-COR-*` identifica requisitos de qualidade e `AC-COR-*` identifica critérios de aceite. A matriz do plano SDD vincula esses IDs às fatias propostas.

## Base do escopo

- O problema de produto e as seis frentes históricas estão no [briefing SparkBarba](../../../../UX/prompt-claude-code-prototipos.md#sparkbarba--barbearias), no [PRODUCT](../../../../PRODUCT.md) e nos [dados do catálogo institucional](../../../../UX/webdesign/site/shared/data/saas.ts). O nome e o símbolo aprovados constam em [Marcas dos produtos](../../../../UX/marcas-produtos.md).
- O histórico consultado inclui as conversas **“Elaborar escopos SparkCore e Spark色”** e **“Definir escopo do SparkCMS”**, além dos [escopos do hub](../../../../docs/escopos/README.md). A conversa original de concepção da família, citada pelo escopo do Tuteli, não estava acessível na consulta. Os requisitos de barbearia foram recuperados dos três registros locais acima.
- Para a integração, a precedência é **constituição e ADRs vigentes → contratos publicados → implementação do produto de referência e do Tuteli → escopo histórico**. A inspeção local tomou como referências os HEADs `f0a3920` do Core e `51b152e` do Tuteli. A fatia `C00` registra as versões e o comportamento efetivamente validados para a integração.

O pacote permite preparar `C00` e escrever as primeiras especificações. As propostas comerciais e metas de serviço precisam de confirmação nos pontos indicados no plano. Os cenários são critérios de homologação a executar durante o desenvolvimento.
