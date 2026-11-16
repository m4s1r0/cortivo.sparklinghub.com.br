# 03 — API do Cortivo (`/api`, preliminar)

Rotas que a SPA consome. Convenções `INT-090`: JSON `camelCase`, `*Cents`, envelope de erro do
Core, `X-Correlation-Id` UUID, `Idempotency-Key` (★) nas mutações críticas, `If-Match`/`version`
(◆) nas edições concorrentes, paginação por cursor ou `offset` ≤ 10.000. Todas exigem sessão,
exceto as marcadas "pública". O OpenAPI definitivo nasce em `specs/<fatia>/contracts/`.

Legenda de acesso: **A** administrador · **R** recepção · **B** barbeiro (próprios).

## Acesso e equipe (C01/C02)

| Método e rota | Acesso | Observação |
| --- | --- | --- |
| `POST /api/auth/login` | pública | `INT-030`; limite por IP; `401` único |
| `POST /api/auth/logout` | sessão | `INT-060` |
| `GET /api/sessao` | sessão | conta, papel, perfil local, profissional, unidade (nome, fuso), prontidão |
| `GET /api/equipe/membros` | A | proxy `GET /internal/v1/.../members` |
| `POST /api/equipe/convites` ★ | A | proxy `/invitations` |
| `POST /api/equipe/convites/{id}/revogar` | A | proxy |
| `PUT /api/equipe/membros/{membershipId}/papel` | A | proxy `/role` |
| `POST /api/equipe/membros/{membershipId}/revogar` | A | proxy `/revoke` |
| `PUT /api/equipe/membros/{membershipId}/perfil` ◆ | A | perfil local + profissional associado |

## Configuração e cadastros (C02)

| Método e rota | Acesso |
| --- | --- |
| `GET/PUT ◆ /api/unidade` · `GET /api/unidade/prontidao` · `GET /api/unidade/historico` | A (GET: todos) |
| `GET/POST/PUT ◆ /api/profissionais[/{id}]` · `POST /api/profissionais/{id}/inativar` | A (GET: todos) |
| `PUT ◆ /api/profissionais/{id}/servicos` · `PUT ◆ /api/profissionais/{id}/expediente` | A |
| `GET/POST /api/bloqueios` · `POST /api/bloqueios/{id}/cancelar` | A (GET: A, R, B próprio) |
| `GET /api/profissionais/{id}/conflitos?ate=` | A — reservas afetadas antes de salvar expediente/bloqueio |
| `GET/POST/PUT ◆ /api/servicos[/{id}]` · `POST …/inativar` | A (GET: todos) |
| `GET/POST/PUT ◆ /api/itens[/{id}]` · `POST …/inativar` | A (GET: A, R) |
| `GET /api/clientes?busca=&cursor=` · `POST` · `PUT ◆ /{id}` · `POST /{id}/inativar` | A, R (B: leitura dos atendidos) |
| `GET /api/clientes/{id}/historico` · `PUT /api/clientes/{id}/preferencias` | A, R |

## Agenda, fila e atendimento (C03/C04)

| Método e rota | Acesso |
| --- | --- |
| `GET /api/agenda?data=AAAA-MM-DD&profissionalId=` | A, R; B só o próprio |
| `GET /api/disponibilidade?data=&servicoIds=&profissionalId=` | A, R |
| `POST /api/agendamentos` ★ | A, R |
| `POST /api/agendamentos/{id}/remarcar` ★◆ | A, R |
| `POST /api/agendamentos/{id}/cancelar` ◆ `{motivo}` | A, R |
| `POST /api/agendamentos/{id}/chegada` ◆ | A, R |
| `POST /api/agendamentos/{id}/falta` ◆ | A, R (após tolerância) |
| `GET /api/fila` · `POST /api/fila` ★ | A, R |
| `GET /api/fila/{id}/encaixes` | A, R — janelas e motivo de passagem |
| `POST /api/fila/{id}/encaixe` ★ `{profissionalId, inicio, iniciarAgora?}` | A, R |
| `POST /api/fila/{id}/prioridade` ◆ `{ajuste, motivo}` · `/desistencia` · `/cancelar` | A, R |
| `GET /api/hoje` | todos (B: recorte próprio) |
| `POST /api/agendamentos/{id}/iniciar` ★ | A, R, B próprio |
| `POST /api/atendimentos/{id}/itens` ★ `{servicoId, autorizadoPor}` | A, R (B solicita) |
| `POST /api/atendimentos/{id}/concluir` ★ `{itensExecutados[]}` | A, R, B próprio |
| `POST /api/atendimentos/{id}/interromper` ★ `{motivo, itensExecutados[]}` | A, R, B próprio |
| `POST /api/atendimentos/{id}/consumos` ★ `{itemId, quantidadeMil}` | A, R, B próprio em curso |

## Comercial e caixa (C05/C06)

| Método e rota | Acesso |
| --- | --- |
| `POST /api/comandas` (rascunho de atendimento ou balcão) · `PUT ◆ /{id}` · `DELETE /{id}` (só rascunho) | A, R |
| `POST /api/comandas/{id}/confirmar` ★ `{recebimento?}` (balcão anônimo exige recebimento integral) | A, R |
| `POST /api/comandas/{id}/cancelar` ★ `{motivo, reporEstoque: [...]}` | A |
| `GET /api/comandas?periodo=&situacao=` · `GET /{id}` | A, R |
| `POST /api/comandas/{id}/recebimentos` ★ `{meio, valorCents, entregueCents?}` | A, R |
| `POST /api/recebimentos/{id}/estorno` ★ `{motivo}` | A |
| `GET /api/caixa/turno-atual` · `POST /api/caixa/turnos` ★ `{fundoCents}` | A, R |
| `POST /api/caixa/turnos/{id}/movimentos` ★ `{tipo, valorCents, motivo}` | A, R |
| `POST /api/caixa/turnos/{id}/fechar` ★ `{contadoCents, justificativa?}` | A, R |
| `GET /api/estoque/saldos?abaixoMinimo=` · `GET /api/estoque/itens/{id}/extrato` | A, R |
| `POST /api/estoque/entradas` ★ · `POST /api/estoque/ajustes` ★ `{motivo}` | A |

## Gestão (C07/C08)

| Método e rota | Acesso |
| --- | --- |
| `GET/POST /api/comissoes/regras` · `POST /api/comissoes/regras/{id}/encerrar` | A |
| `GET /api/comissoes/extrato?profissionalId=&competencia=` | A; B só o próprio |
| `POST /api/comissoes/competencias/{AAAA-MM}/fechar` ★ | A |
| `GET /api/retornos?de=&ate=&profissionalId=&situacao=` | A, R |
| `POST /api/retornos/{id}/contatos` ★ · `/adiar` · `/dispensar` | A, R |
| `GET /api/relatorios/{indicador}?de=&ate=` | A; R: dia/caixa; B: próprio |
| `GET /api/exportacoes/{indicador}.csv?de=&ate=` | A (SEC-BASE-21) |
| `GET /api/auditoria?cursor=&acao=&entidade=` | A |

## Códigos de erro de domínio (prefixos)

`AGENDA_CONFLITO_PROFISSIONAL`, `AGENDA_CONFLITO_CLIENTE`, `AGENDA_FORA_EXPEDIENTE`,
`AGENDA_PROFISSIONAL_INELEGIVEL`, `AGENDA_TOLERANCIA_NAO_ATINGIDA`, `FILA_ENTRADA_ATIVA_EXISTENTE`,
`FILA_SEM_JANELA`, `ATENDIMENTO_EM_CURSO_EXISTENTE`, `COMANDA_ITEM_JA_FATURADO`,
`ESTOQUE_SALDO_INSUFICIENTE`, `CAIXA_SEM_TURNO_ABERTO`, `CAIXA_TURNO_JA_ABERTO`,
`RECEBIMENTO_ACIMA_DO_SALDO`, `VENDA_ANONIMA_EXIGE_QUITACAO`, `COMISSAO_COMPETENCIA_FECHADA`,
`PERFIL_PENDENTE`, `CONFLICT_VERSION`, `CONFLICT_IDEMPOTENCY_KEY_REUSED` — todos com `field` e
`retryable` conforme `conventions.md`.
