# Quickstart de validação — 001 Base e acesso do Cortivo

Roteiro para provar a fatia de ponta a ponta. Detalhes de rotas e dados em
[contracts/](./contracts/) e [data-model.md](./data-model.md). Toda a massa é sintética.

## Pré-requisitos

- Node 22 LTS, npm 10+, Docker (MySQL 8.4 do ecossistema em `127.0.0.1:3307`).
- Checkout do SparkCore em `../../core/core.sparkilnghub.com.br` (ou `CORE_REPO_DIR`) com a
  **Parte A** aplicada: produto `cortivo` no catálogo, artefato
  `produtos/cortivo/artifact/` (versões 1 e 2) e provisionador registrado.
- Core local no ar (`npm run dev:up` no Core; API em `http://127.0.0.1:5273`).
- No painel do Core (ou CLI), em ambiente `development`:
  - instâncias Cortivo sintéticas **A** (`cortivo-a`) e **B** (`cortivo-b`), ativadas;
  - uma instância Tuteli sintética;
  - uma conta com vínculo `administrador` em A e em B e `colaborador` no Tuteli; uma conta
    `colaborador` em A;
  - credencial de aplicação com escopos `connection`, `sessions`, `members`, vinculada a A
    (Core 1.4: `npm run app-credential -- bind <id> --instance cortivo-a`) e outra a B.

## Configuração

```bash
npm ci                                   # workspaces api e web
cp api/.env.example api/.env             # preencher sem commitar
```

`api/.env` (valores de desenvolvimento): `PUBLIC_ORIGIN=http://127.0.0.1:5177`,
`TRUSTED_PROXIES=` (vazio), `SESSION_SECRET` (≥ 32 bytes aleatórios),
`SESSION_SECRET_PREVIOUS=`, `SPARKCORE_INTERNAL_URL=http://127.0.0.1:5273`,
`SPARKCORE_PUBLIC_URL=http://127.0.0.1:5173`,
`SPARKCORE_APP_CREDENTIAL=<credencial de A>`, `SPARKCORE_INSTANCE_SLUG=cortivo-a`, `PORT=3003`.

## Verificações automáticas

| Comando | Prova |
| --- | --- |
| `npm run typecheck` | TypeScript estrito em `api` e `web` |
| `npm run lint` | ESLint + `scripts/check-ui.mjs` (sem cor literal, sem `!important` em `sh-*`, campos especiais com `mask`) |
| `npm run test:unit` | cookie, IP real, limite, perfil efetivo, menu, CSV, paginação, correlação |
| `npm run test:integration` | MySQL 8.4 real, pares A/B descartáveis + Core falso: `INT-010..070`, isolamento, privilégios, concorrência de perfil, idempotência, `SEC-BASE-*` |
| `npm run test:contract` | Core falso e cliente contra `openapi.yaml` 1.4.0/1.3.3; deriva do artefato e da projeção |
| `npm run test:e2e` | Playwright + axe contra Core real com A, B e Tuteli (abaixo) |
| `npm audit --omit=dev` | sem achado moderado ou superior |
| `npm run build && npm run check:bundle` | `web/dist` sem segredos nem variáveis do servidor |

Resultado esperado: tudo verde; `evidence.md` da fatia registra p95 de autorização e o ambiente.

## Roteiro manual (jornada J01)

1. `npm run dev` (API 3003 + Vite 5177). `GET http://127.0.0.1:3003/api/saude` → `200 {status:"pronta"}`.
2. Abrir `http://127.0.0.1:5177/login`: assinatura Cortivo + "Uma solução da Sparkling Hub";
   título "Cortivo — Sparkling Hub".
3. Entrar como administrador de A → `/hoje`, breadcrumb "Cortivo › Hoje", 13 itens no menu, nome
   da unidade e fuso no cabeçalho/sessão.
4. Visitar cada item do menu: breadcrumb correto, "Disponível em breve" nas áreas futuras.
5. Equipe: convidar e-mail sintético como colaborador → `Dialog` exibe link uma vez; cadastrar
   profissional com telefone `11987654321` digitado (campo mostra `(11) 98765-4321`; API recebe
   dígitos); definir perfis Recepção + Barbeiro para o colaborador de A com esse profissional.
6. Em outra janela anônima, entrar como o colaborador: menu = união dos perfis. Antes do passo 5,
   o mesmo login levava a `/configuracao-pendente`.
7. Redimensionar para 320, 360, 768 px: sem rolagem horizontal; menu em `Drawer`, `Escape` fecha e
   o foco volta ao botão.
8. Sair → reapresentar o cookie antigo (DevTools ou `curl`) em `GET /api/sessao` → `401`.
9. Auditoria: `SELECT acao, entidade FROM auditoria` no banco de A mostra `profissional.criar` e
   `perfil.definir`; tentativa de `UPDATE auditoria` com a credencial operacional falha.

## Roteiro de isolamento e falhas (`INT-110` 1–6, `AC-COR-002..004`)

Executado por `npm run test:e2e -- --grep @int110`; para inspeção manual:

1. Credencial de A pedindo `/connection` de B → resposta idêntica à de slug inexistente.
2. Login em A, requisição, logout, reuso do cookie → `401`.
3. Rebaixar o administrador de A no Core → próxima escrita de administrador (definir perfil) → `403`.
4. Revogar o vínculo em A → `401` em A; B continua acessível. Suspender A → recusa; reativar → novo
   login exigido. Cookie do Tuteli apresentado ao Cortivo → `401`.
5. Parar o Core com sessão válida → `GET /api/sessao` funciona; login → `503`; bloquear o acesso ao
   banco `_acc` → `503`.
6. 25 logins inválidos do mesmo socket com `X-Forwarded-For` variado e `TRUSTED_PROXIES` vazio →
   `429` a partir da 21ª; evento com o IP do socket.
7. Iniciar a API com `SPARKCORE_INSTANCE_SLUG=cortivo-a` e credencial de B, ou com marcador de
   instância alterado num banco descartável → `/api/*` responde `503` e há log
   `seguranca.instancia_divergente`.
