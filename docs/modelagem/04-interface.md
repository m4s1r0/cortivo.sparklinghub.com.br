# 04 — Interface do Cortivo

Aplicação direta de `core/.../docs/ecossistema/04-padrao-interface.md`: mesma casca do Tuteli
(`UI-010`), breadcrumb em toda página (`UI-020`), paleta única (`UI-030`), máscaras do DS 0.5.0
(`UI-040`) e marca do Cortivo (`UI-050`).

## Marca

Copiar sem editar de `UX/assets/logomarcas-produtos/final-v1/cortivo/` para `web/public/brand/`:
`cortivo-principal.svg`, `cortivo-inversa.svg`, `simbolo-principal.svg`, `simbolo-inversa.svg`,
`favicon.svg`, `favicon.ico`, `apple-touch-icon.png`. Teste compara sha256 com
`manifesto-sha256.txt`. `Brand` igual ao do Tuteli com `alt="Cortivo"`. Login: assinatura
principal + “Uma solução da Sparkling Hub”. `<title>`: `Cortivo — Sparkling Hub` (login) e
`<Página> · Cortivo` (demais).

## Menu lateral (`NAV`)

| Ordem | Rota | Rótulo | Ícone `lucide-react` | Admin | Recepção | Barbeiro |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `/hoje` | Hoje | `Home` | ✔ | ✔ | ✔ (recorte próprio) |
| 2 | `/agenda` | Agenda | `CalendarDays` | ✔ | ✔ | ✔ (própria) |
| 3 | `/clientes` | Clientes | `Users` | ✔ | ✔ | — |
| 4 | `/vendas` | Vendas | `Receipt` | ✔ | ✔ | — |
| 5 | `/caixa` | Caixa | `Wallet` | ✔ | ✔ | — |
| 6 | `/estoque` | Estoque | `Boxes` | ✔ | ✔ | — |
| 7 | `/comissoes` | Comissões | `Percent` | ✔ | — | ✔ (própria) |
| 8 | `/retornos` | Retornos | `Repeat` | ✔ | ✔ | — |
| 9 | `/relatorios` | Relatórios | `BarChart2` | ✔ | ✔ (dia/caixa) | — |
| 10 | `/catalogo` | Catálogo | `Scissors` | ✔ | ✔ (leitura) | — |
| 11 | `/equipe` | Equipe | `UserCog` | ✔ | — | — |
| 12 | `/configuracoes` | Configurações | `Settings` | ✔ | — | — |
| 13 | `/auditoria` | Auditoria | `BookOpen` | ✔ | — | — |

Colaborador sem perfil vê somente `/configuracao-pendente` (sem menu de operação).

## Rotas e breadcrumbs

Primeiro nível sempre `Cortivo` → `/hoje`.

| Rota | Breadcrumb | Tela |
| --- | --- | --- |
| `/hoje` | Cortivo › Hoje | Painel do dia: próximas reservas, fila, profissionais (livre/ocupado/atrasado), atendimentos em curso, ações |
| `/agenda` | Cortivo › Agenda | Dia × profissional (grade em ≥ lg, lista em < lg e opção de lista sempre), nova reserva |
| `/agenda/nova` | Cortivo › Agenda › Nova reserva | Cliente (busca/cadastro rápido), serviços, profissional, janelas |
| `/agenda/:id` | Cortivo › Agenda › Reserva de *Cliente* | Detalhe, remarcar, cancelar, chegada, falta, iniciar |
| `/hoje/fila/nova` | Cortivo › Hoje › Nova chegada | Entrada na fila |
| `/hoje/fila/:id/encaixe` | Cortivo › Hoje › Encaixe de *Cliente* | Janelas, motivo de passagem, confirmar/iniciar agora |
| `/atendimentos/:id` | Cortivo › Hoje › Atendimento de *Cliente* | Itens, adicionais, consumo, concluir/interromper |
| `/clientes` | Cortivo › Clientes | Busca, lista, novo |
| `/clientes/novo` | Cortivo › Clientes › Novo cliente | Formulário |
| `/clientes/:id` | Cortivo › Clientes › *Nome* | Abas: Dados, Histórico, Preferências, Retornos |
| `/clientes/:id/editar` | Cortivo › Clientes › *Nome* › Editar | Formulário |
| `/vendas` | Cortivo › Vendas | Rascunhos, confirmadas, a receber |
| `/vendas/nova` | Cortivo › Vendas › Venda de balcão | Itens de revenda, cliente opcional, recebimento |
| `/vendas/:id` | Cortivo › Vendas › Comanda nº *n* | Itens, desconto, confirmar, receber, estornar, cancelar |
| `/caixa` | Cortivo › Caixa | Turno atual, totais por meio, suprimento/sangria, fechar |
| `/caixa/turnos/:id` | Cortivo › Caixa › Turno de *dd/mm* | Foto do turno |
| `/estoque` | Cortivo › Estoque | Saldos, abaixo do mínimo, entrada, ajuste |
| `/estoque/:itemId` | Cortivo › Estoque › *Item* | Extrato |
| `/comissoes` | Cortivo › Comissões | Extrato por profissional/competência, fechar competência |
| `/comissoes/regras` | Cortivo › Comissões › Regras | Padrão por profissional e exceções por serviço |
| `/retornos` | Cortivo › Retornos | Filtros, contato, adiar, dispensar |
| `/relatorios` | Cortivo › Relatórios | Indicadores e CSV |
| `/catalogo` | Cortivo › Catálogo | Abas Serviços / Produtos e insumos |
| `/catalogo/servicos/:id` | Cortivo › Catálogo › *Serviço* | Formulário |
| `/catalogo/itens/:id` | Cortivo › Catálogo › *Item* | Formulário |
| `/equipe` | Cortivo › Equipe | Membros (Core), convites, perfis, profissionais |
| `/equipe/profissionais/:id` | Cortivo › Equipe › *Profissional* | Dados, serviços habilitados, expediente, bloqueios |
| `/configuracoes` | Cortivo › Configurações | Unidade, horários, parâmetros, prontidão |
| `/auditoria` | Cortivo › Auditoria | Trilha paginada |

## Campos com máscara (`UI-040`)

| Tela | Campo | Preset | Envio |
| --- | --- | --- | --- |
| Configurações | Telefone, WhatsApp da unidade | `phone` | dígitos → E.164 no servidor |
| Configurações | CEP (busca de endereço no `onComplete`) | `cep` | 8 dígitos |
| Clientes | Telefone/WhatsApp | `phone` | E.164 |
| Clientes | Data de nascimento (opcional, D-COR-09) | `date` (ou `SplitDateInput`) | `AAAA-MM-DD` |
| Clientes | E-mail (opcional, D-COR-09) | sem máscara: `Input type="email"`, `autoComplete="email"` | normalizado no servidor |
| Equipe › Profissional | Telefone | `phone` | E.164 |
| Catálogo › Serviço | Preço | `currency` | `precoCents` |
| Catálogo › Item | Preço de venda | `currency` | `precoVendaCents` |
| Vendas | Desconto em valor | `currency` | `descontoCents` |
| Vendas | Desconto em % (só administrador, D-COR-05) | `percent` (`decimals: 1`, `max: 100`) | servidor converte p/ centavos |
| Vendas › Recebimento | Valor, valor entregue (troco) | `currency` | `valorCents`, `entregueCents` |
| Caixa | Fundo, suprimento, sangria, contado | `currency` | `*Cents` |
| Comissões › Regras | Taxa | `percent` (`decimals: 2`, `max: 100`) | servidor converte p/ `taxaBp` |
| Estoque | Quantidade | `NumberStepper`/`Input type=number` com casas do item | `quantidadeMil` |
| Agenda/filtros | Data | `DateField` nativo ou `SplitDateInput` | `AAAA-MM-DD` |
| Equipe › Expediente | Horários | `time` | `HH:MM` |

## Componentes do DS por tela (resumo para o Constitution Check)

Formulários: `Input`/`FloatingInput` com `mask`, `Select`, `Autocomplete` (cliente),
`ChoiceCardGroup` (perfil, meio de pagamento), `ChipInput` (serviços), `NumberStepper`,
`Textarea` (motivos ≤ 280), `Switch`. Dados: `DataTable` (caption visível, ações na caption),
`StatsBlock` (Hoje, Caixa), `Badge` (estados), `EmptyState`, `Skeleton`, `Alert`, `Toast`.
Ações: `Button`, `IconButton`, `DropdownButton` (menu de ações da linha), `Dialog` (confirmações
de estorno, cancelamento, fechamento), `Drawer` (menu móvel; detalhe rápido de reserva), `Tabs`
(ficha do cliente, catálogo). Navegação: `Breadcrumb` via `PageHeader`, `Pagination`.

Lacunas previstas a registrar em `docs/design-system-updates.md`: grade de agenda (o DS não tem
componente de agenda — composição local com tokens, lista acessível obrigatória), `Timeline`
(histórico do cliente), `DateField` com fuso (já proposta pelo Core).
