# Data Model — 001 Base e acesso do Cortivo (C00 + C01)

Convenções da [modelagem 02](../../docs/modelagem/02-modelo-de-dados.md): PK `BINARY(16)` com
UUID v7; instantes `DATETIME(6)` UTC; `version INT UNSIGNED` em registros editáveis; referências
a pessoas da plataforma (`membership_id`, `account_id`) são UUIDs opacos do Core, sem FK entre
bancos (`ECO-013`); InnoDB, `utf8mb4_0900_ai_ci`.

O artefato vive no Core (`core/.../produtos/cortivo/artifact/`, [R-13](./research.md#r-13--artefato-de-migração-e-espelho-local));
o Cortivo mantém espelho em `api/tests/fixtures/artifact/`. Faixa de esquema suportada por esta
fatia: **versão 2** (`ESQUEMA_SUPORTADO = [2, 2]`).

**Divisão entre as migrações (atualizada em 16/11/2026, após a spec 009 do Core):**

- **`0001_base` — entregue e publicada no Core (spec 009; T012, T014, T015).** Cria
  `_spark_instance`, `idempotencia`, `auditoria` (só-inserção), `outbox_evento`,
  `perfil_colaborador` (com `profissional_id` NULL, **sem FK** e sem a regra do barbeiro) e
  `unidade` (linha única; nasce vazia e não é usada nesta fatia — é da C02).
- **`0002_equipe_acesso` — a entregar no Core (T013).** Cria `profissional` e, em
  `perfil_colaborador`, acrescenta a FK para `profissional`, a coluna gerada
  `barbeiro_profissional_chave` com `UNIQUE` e os `CHECK` que ligam o perfil barbeiro ao
  profissional. Fica fora da spec 009 (que fixa o esquema na versão 1).

```json
{
  "formatVersion": 1,
  "productCode": "cortivo",
  "databasePrefix": "cortivo_",
  "appendOnlyTables": ["auditoria"],
  "migrations": [
    { "version": 1, "name": "0001_base", "file": "migrations/0001_base.sql" },
    { "version": 2, "name": "0002_equipe_acesso", "file": "migrations/0002_equipe_acesso.sql" }
  ]
}
```

## Banco operacional `cortivo_<uuid>`

### `_spark_instance` (v1) — marcador de identidade

Formato do Core (igual ao artefato do Tuteli); a linha é inserida pelo aplicador.

| Coluna | Tipo | Regra |
| --- | --- | --- |
| `instance_uuid` | `BINARY(16)` PK | conferido no boot com `instanceId` de `/connection` (`INT-010`) |
| `product_code` | `VARCHAR(32)` | `= 'cortivo'`; divergência → indisponível |
| `owner_task_uuid` | `BINARY(16)` NULL | tarefa de provisionamento (Core) |
| `synthetic` | `BOOLEAN` | instâncias de teste = `TRUE` |
| `created_at` | `DATETIME(6)` | — |

Credencial operacional: somente `SELECT` (tabela interna `_spark_*`).

### `idempotencia` (v1)

| Coluna | Tipo | Regra |
| --- | --- | --- |
| `chave` | `BINARY(16)` | UUID enviado em `Idempotency-Key` |
| `ator_membership_id` | `BINARY(16)` | da projeção |
| `operacao` | `VARCHAR(64)` | ex.: `profissional.criar` |
| `resumo_sha256` | `CHAR(64)` | corpo canônico |
| `estado` | `ENUM('em_processamento','concluida')` | concorrente em processamento → `409 CONFLICT_REQUEST_IN_PROGRESS` |
| `status_http` | `SMALLINT UNSIGNED` NULL | — |
| `resposta_json` | `JSON` NULL | sem segredos |
| `criado_em`, `expira_em` | `DATETIME(6)` | `expira_em = criado_em + 24 h`; índice em `expira_em` |

PK (`chave`, `ator_membership_id`, `operacao`). Mesma chave + mesmo resumo → repete resposta;
resumo diferente → `409 CONFLICT_IDEMPOTENCY_KEY_REUSED` (`conventions.md` §6).

### `auditoria` (v1) — **só-inserção** (`SEC-BASE-12`, `appendOnlyTables`)

| Coluna | Tipo | Regra |
| --- | --- | --- |
| `id` | `BINARY(16)` PK | UUID v7 |
| `ocorrido_em` | `DATETIME(6)` | servidor |
| `ator_membership_id` | `BINARY(16)` | da projeção |
| `ator_nome` | `VARCHAR(120)` | `display_name` da projeção |
| `acao` | `VARCHAR(64)` | ver catálogo abaixo |
| `resultado` | `ENUM('sucesso','recusado')` | — |
| `entidade` | `VARCHAR(48)` | `perfil_colaborador`, `profissional` |
| `entidade_id` | `VARCHAR(36)` NULL | UUID texto; nulo apenas em `equipe.convidar`, porque o Core não devolve o id do convite. Nesse caso a ligação com a trilha do Core é o `correlation_id` |
| `motivo` | `VARCHAR(280)` NULL | — |
| `antes_json`, `depois_json` | `JSON` NULL | valores seguros (sem telefone completo: mascarado `(**) *****-1234`) |
| `correlation_id` | `CHAR(36)` | UUID |

Índices: (`ocorrido_em`), (`entidade`, `entidade_id`). A credencial operacional recebe só
`SELECT, INSERT`; teste prova que `UPDATE`/`DELETE` falham por privilégio.

Catálogo de ações desta fatia: `perfil.definir`, `perfil.remover`, `perfil.liberar_revogado`,
`profissional.criar`, `profissional.editar`, `profissional.inativar`, `profissional.reativar`, e
as ações de equipe executadas pelo Core em nome do administrador: `equipe.convidar` (entidade
`convite`, `depois_json` só com o papel), `equipe.revogar_convite`, `equipe.mudar_papel` (papel
antes/depois) e `equipe.revogar_vinculo` (entidade `vinculo`). Essas quatro são gravadas após a
resposta do Core, com `resultado` `sucesso` ou `recusado` (`403`/`409` do Core), o motivo e o
mesmo `correlation_id` repassado ao Core; nunca contêm e-mail nem link de convite. Falha ao gravar
depois de sucesso no Core não desfaz a operação (que já está na trilha do Core) e gera log
`auditoria.falha_registro` com a correlação (Princípio VI).

### `outbox_evento` (v1)

Estrutura obrigatória (`ECO-013`), **sem uso nesta fatia** (utilização é C09).

| Coluna | Tipo | Regra |
| --- | --- | --- |
| `event_id` | `BINARY(16)` PK | — |
| `kind` | `VARCHAR(64)` | — |
| `count` | `INT UNSIGNED` | — |
| `occurred_at` | `DATETIME(6)` | — |
| `batch_id` | `BINARY(16)` NULL | — |
| `estado` | `ENUM('pendente','enviado','falha')` | — |
| `tentativas` | `SMALLINT UNSIGNED` | — |
| `proxima_tentativa_em` | `DATETIME(6)` NULL | índice (`estado`, `proxima_tentativa_em`) |

### `profissional` (v2) — cadastro mínimo

| Coluna | Tipo | Regra |
| --- | --- | --- |
| `id` | `BINARY(16)` PK | — |
| `nome` | `VARCHAR(120)` | obrigatório, 2–120 caracteres após aparar |
| `apelido` | `VARCHAR(40)` NULL | nome curto de exibição na agenda |
| `telefone_e164` | `VARCHAR(16)` NULL | recebido como dígitos brutos (`mask="phone"`), validado BR (10 ou 11 dígitos) e normalizado `+55…` |
| `estado` | `ENUM('ativo','inativo')` | padrão `ativo` |
| `version` | `INT UNSIGNED` | otimista |
| `criado_em`, `atualizado_em` | `DATETIME(6)` | — |

Transições: `ativo → inativo` (recusada com `409 PROFISSIONAL_EM_USO` se associado a perfil
barbeiro de vínculo `ativo` na projeção); `inativo → ativo`. Sem exclusão (`COM-028`).
C02 acrescenta `membership_id`, `cor_agenda`, serviços, expediente e bloqueios em nova migração.

### `perfil_colaborador` (v1 + restrições da v2)

| Coluna | Tipo | Regra |
| --- | --- | --- |
| `membership_id` | `BINARY(16)` PK | vínculo `colaborador` vigente na projeção ao gravar |
| `perfis` | `SET('recepcao','barbeiro')` | não vazio (`CHECK (perfis <> '')`, já na v1) |
| `profissional_id` | `BINARY(16)` NULL | v1: sem FK; **v2: FK → `profissional.id`** |
| `barbeiro_profissional_chave` | **(v2)** gerada `IF(FIND_IN_SET('barbeiro', perfis) > 0, profissional_id, NULL)` STORED | `UNIQUE` → um profissional por vínculo barbeiro |
| `definido_por` | `BINARY(16)` | membership do administrador |
| `version` | `INT UNSIGNED` | otimista |
| `criado_em`, `atualizado_em` | `DATETIME(6)` | — |

Restrições: `CHECK (FIND_IN_SET('barbeiro', perfis) = 0 OR profissional_id IS NOT NULL)`;
`CHECK (FIND_IN_SET('barbeiro', perfis) > 0 OR profissional_id IS NULL)`.

Regras de serviço (transação única, `SELECT … FOR UPDATE` em `profissional` e na linha do perfil):

1. Ator é `administrador` na projeção (`INT-050.2`).
2. Alvo existe em `access_member` com `status='ativo'`, `role='colaborador'`; senão `404`
   (inexistente ou de outra instância) ou `422 PERFIL_ALVO_ADMINISTRADOR`.
3. Com `barbeiro`: profissional `ativo`; se já estiver na `barbeiro_profissional_chave` de
   outro vínculo, e esse vínculo estiver `revogado` na projeção, a associação antiga é liberada e
   auditada (`perfil.liberar_revogado`); se o outro vínculo estiver `ativo` →
   `409 PROFISSIONAL_JA_ASSOCIADO`.
4. `version` diferente → `409 CONFLICT_VERSION`.
5. Grava e audita `perfil.definir` com antes/depois; remoção total do perfil (`DELETE` da linha,
   permitido — o histórico fica na auditoria) audita `perfil.remover`.

Perfil efetivo (puro, testado em unidade):

| Projeção `role` | `perfis` | Efetivo |
| --- | --- | --- |
| `administrador` | qualquer | administrador (perfis ignorados) |
| `colaborador` | ausente | **pendente** → só `/configuracao-pendente` e `GET /api/sessao` |
| `colaborador` | `recepcao` | recepção |
| `colaborador` | `barbeiro` (+ profissional ativo) | barbeiro |
| `colaborador` | `recepcao,barbeiro` | união |
| `colaborador` | `barbeiro` com profissional inativo | pendente (inconsistência registrada em log) |

## Banco de acesso `cortivo_<uuid>_acc` (somente leitura + logout)

Estrutura do Core (`access-projection.md` v2), **não** criada pelo Cortivo. Usada:

| Tabela | Uso pelo Cortivo |
| --- | --- |
| `access_session` | regra normativa (`SELECT`) |
| `access_session_logout` | `INSERT IGNORE` no logout (`INT-060`) |
| `access_member` | regra normativa; validação do alvo de perfil; `display_name` do ator |
| `access_instance` | boot (`instance_id`, `state`) e regra normativa (`state='ativa'`) |

## Estado em memória do processo (não persistido)

| Estrutura | Conteúdo | Limite |
| --- | --- | --- |
| `GerenciadorInstancia` | `instanceId`, `credentialVersion`, `displayName`, `timezone`, pools, estado `iniciando/pronta/indisponivel` | 1 por processo |
| Limite de login | IP → carimbos das tentativas (15 min) | teto de chaves com descarte LRU |
| Atividade | `idHash` → último touch; conjunto de invalidadas | expira com a sessão (12 h) |

## Sessão do navegador (cookie)

`{ t, iat, exp }` cifrado (AES-256-GCM, [R-04](./research.md#r-04--formato-do-cookie-de-sessão-int-040-sec-base-06)).
Sem papel, vínculo, nome ou e-mail.
