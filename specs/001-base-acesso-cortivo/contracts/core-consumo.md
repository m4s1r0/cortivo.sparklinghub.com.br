# Contrato consumido do SparkCore — fatia 001

Fixação exigida pelo princípio III e pelo portão **G5**. Único ponto de integração:
`api/src/core/`. Fonte: `core/.../contracts/openapi.yaml` **1.4.0** (changelog de 2026-11-15),
convivendo com **1.3.3**; projeção de acesso **v2**; convenções **v1**; artefato de migração
**formatVersion 1**.

## Operações

| Operação Core | Escopo | Uso no Cortivo | Timeout | Tolerância 1.3.3 |
| --- | --- | --- | --- | --- |
| `GET /health/live` | — | boot (`INT-010`) | 2 s | igual |
| `GET /internal/v1/instances/{slug}/connection` | `connection` | boot e revalidação a cada 10 min (`INT-020`) | 3 s | `tls` ausente → `disabled` só em dev; fora do dev o pool usa TLS sempre |
| `POST /internal/v1/instances/{slug}/sessions` | `sessions` | login (`INT-030`) com `clientIp` resolvido | 3 s | igual (limites do Core 1.4 são transparentes) |
| `POST /internal/v1/instances/{slug}/sessions/touch` | `sessions` | atividade ≤ 1/5 min, fora do caminho crítico (`INT-051`) | 3 s | `204` sem corpo aceito; corpo `200` ignorado para autorização |
| `GET /internal/v1/instances/{slug}/members` | `members` + `X-Instance-Session` | lista da Equipe | 3 s | `accountId` presente desde 1.3.2 |
| `POST /internal/v1/instances/{slug}/invitations` | `members` + sessão + `Idempotency-Key` | convidar | 3 s | igual |
| `POST /internal/v1/instances/{slug}/invitations/{id}/revoke` | `members` + sessão | revogar convite (`reason`) | 3 s | igual |
| `POST /internal/v1/instances/{slug}/members/{id}/role` | `members` + sessão + `Idempotency-Key` | mudar papel (`role`, `reason`, `version`) | 3 s | igual |
| `POST /internal/v1/instances/{slug}/members/{id}/revoke` | `members` + sessão + `Idempotency-Key` | revogar vínculo (`reason`, `version`) | 3 s | igual |

Correlação: toda chamada leva `X-Correlation-Id` com o UUID da requisição de origem (ou UUID v7
próprio em boot, revalidação e touch), para casar a trilha do Core com a auditoria local ([R-18](../research.md)).

Autenticação de aplicação: `Authorization: Bearer <SPARKCORE_APP_CREDENTIAL>`; com Core 1.4 a
credencial MUST estar vinculada à instância (`SEC-BASE-01`), senão `401
AUTH_APP_CREDENTIAL_INVALID` → Cortivo `503` + evento `seguranca.credencial_recusada`.

## Leitura direta da projeção (sem chamar o Core)

Regra normativa de `access-projection.md` executada em cada rota protegida no pool `_acc`, com
`sha256(token)` calculado no Cortivo; logout por `INSERT IGNORE INTO access_session_logout`.
Nenhuma outra escrita na base de acesso.

## Tradução de respostas do Core para a API do Cortivo

| Resposta do Core | Resposta do Cortivo |
| --- | --- |
| `401 AUTH_INVALID_CREDENTIALS` (login) | `401 AUTH_INVALID_CREDENTIALS`, mensagem única |
| `429 AUTH_THROTTLED` | `429 AUTH_THROTTLED` com `Retry-After` |
| `401 AUTH_SESSION_INVALID` (members/touch) | `401 AUTH_SESSION_INVALID`, cookie apagado |
| `403 AUTH_FORBIDDEN` | `403 AUTH_FORBIDDEN` |
| `404 NOT_FOUND` | `404 NOT_FOUND` (idêntico a inexistente) |
| `409 CONFLICT_LAST_ADMIN` | `409 CONFLICT_LAST_ADMIN` + mensagem "A unidade precisa de pelo menos um administrador." |
| `409 CONFLICT_VERSION` / `CONFLICT_IDEMPOTENCY_KEY_REUSED` | repassado |
| `422 VALIDATION_*` | repassado com `field` traduzido para o corpo do Cortivo |
| `401 AUTH_APP_CREDENTIAL_INVALID` | `503 SYSTEM_DEPENDENCY_UNAVAILABLE` + evento de segurança |
| `503 SYSTEM_*`, timeout, erro de rede | `503 SYSTEM_IDENTITY_UNAVAILABLE`, `retryable: true`, `Retry-After: 5` |
| outro | `502` não é usado; `503 SYSTEM_DEPENDENCY_UNAVAILABLE` e log com correlação |

`message` do Core nunca é repassada sem passar pelo catálogo de mensagens do Cortivo; segredos
(`password` de `/connection`, `token`, `link` de convite) nunca entram em log.

## Testes de contrato (G5)

1. Respostas do Core falso validadas contra `openapi.yaml` 1.4.0 (Ajv); variante 1.3.3 para
   `touch` (`204`) e `connection` (sem `tls`).
2. Requisições geradas pelo cliente `api/src/core/` validadas contra os `requestBody` do contrato
   (sem campos extras: o Core rejeita com `422`).
3. Deriva: sha256 de `openapi.yaml`, `access-projection.md` e do artefato espelhado conferem com
   o checkout do Core (`CORE_REPO_DIR`); divergência falha o CI e exige revisão deste arquivo.
4. Contra o Core real (E2E): `INT-110` 1–6. O item 7 (lote de utilização) é da C09.

## Pedidos ao Core gerados por esta fatia (Parte A, repositório do Core)

- Cadastrar `cortivo` no catálogo e registrar o provisionador (`CORE-COR-001`).
- Publicar `produtos/cortivo/artifact/`: `0001_base` (**entregue**, spec 009 do Core) e
  `0002_equipe_acesso` (**pendente**: `profissional` + integridade do perfil barbeiro).
- Disponibilizar no ambiente local duas instâncias Cortivo sintéticas e uma Tuteli para E2E.
- Nenhuma mudança de contrato é solicitada.
