# 05 — Decisões do Cortivo

Registro das decisões `D-COR-*` do [plano SDD](../escopo/06-plano-sdd.md#decisões-a-confirmar),
mais as que surgiram na modelagem. Decisões confirmadas pelo responsável em **15/11/2026**.

| ID | Tema | Decisão | Situação | Efeito |
| --- | --- | --- | --- | --- |
| D-COR-01 | Código e unidade | Código `cortivo`, prefixo `cortivo_`; uma unidade por instância; portas 3003/5177 | **Confirmada em 16/11/2026 (ambiente de desenvolvimento)** — verificado em `spark_core.product`: só `sparkref`, `sparkpet` e `cortivo`, sem código anterior de barbearia. Migração `0010_cadastro_cortivo` do Core é segura para reaplicação. **Homologação e produção:** repetir a verificação antes de aplicar a 0010 (spec 009, FR-002); se existir produto de barbearia com outro código, preservá-lo e registrar aqui | Registro de produtos do Core (`ECO-001/002`); spec 009 do Core |
| D-COR-02 | Topologia e integração | Um processo por instância (`SPARKCORE_INSTANCE_SLUG`); validação pela projeção D-04 (`INT-050`), **não** o `touch` síncrono do Tuteli; credencial por instância | **Proposta mantida** com padrão canônico | C01 |
| D-COR-03 | Perfis locais | **Acumuláveis**: um vínculo pode ter `recepcao` e `barbeiro`; permissões = união; barbeiro exige 1 profissional ativo | **Confirmada** | `perfil_colaborador.perfis` SET; matriz em [01](./01-arquitetura-e-modulos.md) |
| D-COR-04 | Agenda | Tolerância de falta **15 min** e passo da grade **15 min**, ambos configuráveis por unidade; capacidade por profissional; fila por ordem de chegada entre aptos; encaixe no mesmo dia | **Confirmada** (valores padrão alterados de 10 → 15) | `unidade.tolerancia_falta_min`, `passo_agenda_min`; `AC-COR-007` passa a usar 15 min |
| D-COR-05a | Desconto | Somente **administrador**, com motivo, em valor ou %; gratuidade integral idem | **Confirmada** | `comanda.autorizado_desconto_por` |
| D-COR-05b | Meios de recebimento | **Dinheiro, Pix, cartão de crédito, cartão de débito** (manuais) | **Confirmada** (cartão dividido em dois) | `recebimento.meio`; totais por meio no fechamento |
| D-COR-05c | Demais regras comerciais | Pagamento parcial; venda a receber exige cliente; venda anônima só quitada no ato; um turno aberto; cancelamento integral; devolução parcial fora | **Proposta mantida** | C05/C06 |
| D-COR-06 | Comissão | % sobre o **valor líquido do serviço**, reconhecida na **quitação**; sem produto; estorno gera lançamento inverso na competência corrente; competência mensal civil | **Confirmada** | C07; `AC-COR-014` |
| D-COR-07 | Dados, retenção, continuidade | Retenção, anonimização, RPO/RTO e hospedagem a definir | **Aberta** — bloqueia uso de dados reais, não o desenvolvimento | antes do piloto |
| D-COR-08 | Pedidos e WhatsApp | Prioridade, provedor, custos | **Aberta** | antes de C11/C12 |
| D-COR-09 | Dados do cliente | Nome, telefone (opcional), **e-mail** (opcional), **data de nascimento** (opcional), observação curta, barbeiro preferido. **Sem CPF.** | **Confirmada** | `cliente`; máscaras `phone` e `date` |
| D-COR-10 | Sequenciamento | Cortivo C00/C01 **em paralelo** ao endurecimento do Core (`CONF-01`); homologação do Cortivo só com Core endurecido (credencial por instância, contrato v1.4) | **Confirmada** | C01 já nasce com `SEC-BASE-*` |
| D-COR-11 | Marco do piloto | Primeiro piloto com barbearia: **C00–C05** (piloto operacional do escopo) | **Confirmada** | C06–C08 completam o MVP comercial depois |

## Consequências para o escopo

- `COR-012`/`COR-013`: "cartão" passa a ser `cartao_credito` e `cartao_debito`.
- `COR-006` e `AC-COR-007`: tolerância padrão 15 min.
- `COR-002`: cliente com e-mail e data de nascimento opcionais; sem CPF. Aniversariantes podem
  entrar nos relatórios de C08 sem automação.
- `01-visao-e-recorte.md` (papéis): coluna "Colaborador · recepção" e "Colaborador · barbeiro"
  são acumuláveis no mesmo vínculo.
