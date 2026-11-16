# Contrato de interface — fatia 001

Aplicação de `core/.../docs/ecossistema/04-padrao-interface.md` (`UI-001..070`) e de
[modelagem 04](../../../docs/modelagem/04-interface.md). Componentes são do
`@sparkling-hub/design-system` 0.5.0 (API pública); nenhum componente, estilo ou token copiado.
Portões **G1** (este documento) e **G4** (E2E).

## Casca (`UI-010`)

| Parte | Implementação | Componentes DS |
| --- | --- | --- |
| Lateral `lg+` | `<aside>` petróleo (`--color-sh-dark-surface`, borda `--color-sh-dark-line`), `w-56` ⇄ `w-16`, transição 220 ms `cubic-bezier(.16,1,.3,1)`, estado lembrado em `localStorage` | `Button` (Recolher/Expandir, Sair), ícones `lucide-react` |
| Marca na lateral | `Brand` (`cortivo-inversa.svg` expandida, `simbolo-inversa.svg` recolhida), `alt="Cortivo"`; endosso "Uma solução da Sparkling Hub" `text-xs text-white/50` só expandida | — |
| Cabeçalho `< lg` | claro, botão de menu abre `Drawer` à esquerda com o mesmo `NAV`; foco contido, `Escape` fecha, foco volta ao botão | `Drawer`, `Button` |
| Conteúdo | `min-h-0 flex-1 overflow-y-auto bg-[var(--color-sh-ground)]` → `<main class="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">` | — |
| Página | `PageHeader` local: `Breadcrumb` do DS (itens de `handle.crumb`, `Link` SPA) acima do `h1`, descrição opcional, ações | `Breadcrumb` |
| Pública (login, erros sem sessão) | `PublicLayout`: fundo `ground`, `cortivo-principal.svg` + endosso | `Card` |

Entrada de estilos: `web/src/styles/layers.css` → `@sparkling-hub/design-system/styles.css` →
`web/src/styles/app.css`; `<div class="sh-theme">` na raiz. Proibido: cor literal, `!important`
sobre `sh-*`, redefinição de `--color-sh-*` (verificado por `scripts/check-ui.mjs`).

## Menu (`NAV`) e filtragem (apresentação apenas)

| Ordem | Rota | Rótulo | Ícone | Admin | Recepção | Barbeiro | Nesta fatia |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `/hoje` | Hoje | `Home` | ✔ | ✔ | ✔ | placeholder com `StatsBlock` vazio |
| 2 | `/agenda` | Agenda | `CalendarDays` | ✔ | ✔ | ✔ | em breve |
| 3 | `/clientes` | Clientes | `Users` | ✔ | ✔ | — | em breve |
| 4 | `/vendas` | Vendas | `Receipt` | ✔ | ✔ | — | em breve |
| 5 | `/caixa` | Caixa | `Wallet` | ✔ | ✔ | — | em breve |
| 6 | `/estoque` | Estoque | `Boxes` | ✔ | ✔ | — | em breve |
| 7 | `/comissoes` | Comissões | `Percent` | ✔ | — | ✔ | em breve |
| 8 | `/retornos` | Retornos | `Repeat` | ✔ | ✔ | — | em breve |
| 9 | `/relatorios` | Relatórios | `BarChart2` | ✔ | ✔ | — | em breve |
| 10 | `/catalogo` | Catálogo | `Scissors` | ✔ | ✔ | — | em breve |
| 11 | `/equipe` | Equipe | `UserCog` | ✔ | — | — | **entregue** |
| 12 | `/configuracoes` | Configurações | `Settings` | ✔ | — | — | em breve |
| 13 | `/auditoria` | Auditoria | `BookOpen` | ✔ | — | — | em breve |

Colaborador com `situacao = configuracao_pendente` não vê menu de operação; qualquer rota
autenticada redireciona para `/configuracao-pendente`. Perfis acumulados = união das colunas.
Rota fora do menu do usuário → página "Sem permissão" (a API também recusa).

## Rotas, breadcrumbs e títulos (`UI-020`)

Primeiro nível sempre `Cortivo` → `/hoje`. Título da aba: `<último crumb> · Cortivo`.

| Rota | Breadcrumb | Título | Layout |
| --- | --- | --- | --- |
| `/login` | — | Cortivo — Sparkling Hub | pública |
| `/hoje` | Cortivo › Hoje | Hoje · Cortivo | casca |
| `/agenda`, `/clientes`, `/vendas`, `/caixa`, `/estoque`, `/comissoes`, `/retornos`, `/relatorios`, `/catalogo`, `/configuracoes`, `/auditoria` | Cortivo › *Rótulo* | *Rótulo* · Cortivo | casca, `EmptyState` "Disponível em breve" |
| `/equipe` | Cortivo › Equipe | Equipe · Cortivo | casca |
| `/configuracao-pendente` | Cortivo › Configuração pendente | Configuração pendente · Cortivo | casca sem menu de operação (só Sair) |
| `/sem-permissao` (e 403) | Cortivo › Sem permissão | Sem permissão · Cortivo | casca |
| `*` (404 autenticado) | Cortivo › Página não encontrada | Página não encontrada · Cortivo | casca |
| `/indisponivel` (503) | — | Indisponível · Cortivo | pública |
| 401 | redireciona a `/login?retorno=<rota>` com aviso "Sua sessão terminou" | — | pública |

Rótulos dinâmicos nunca mostram UUID; o retorno pós-login só aceita caminhos internos.

## Campos e máscaras (`UI-040`)

| Tela | Campo | Componente | `mask` | Envio à API |
| --- | --- | --- | --- | --- |
| Login | E-mail | `Field` + `Input type="email" autoComplete="username"` | — (e-mail não tem máscara) | texto |
| Login | Senha | `Field` + `Input type="password" autoComplete="current-password"` | — | texto |
| Login | "Esqueci minha senha" | link para `/api/auth/recuperar` (redireciona a `/recuperar` do Core) | — | — |
| Equipe › Convidar | E-mail | `Field` + `Input type="email"` | — | texto |
| Equipe › Convidar | Papel | `Field` + `Select` (Administrador/Colaborador) | — | enum |
| Equipe › Perfil | Perfis | `Checkbox` × 2 (Recepção, Barbeiro) | — | lista |
| Equipe › Perfil | Profissional | `Field` + `Select` (profissionais ativos) — obrigatório com Barbeiro | — | UUID |
| Equipe › Mudar papel / Revogar / Revogar convite | Motivo | `Field` + `Input` (3–280) | — | texto |
| Equipe › Profissional | Nome | `Field` + `Input` | — | texto |
| Equipe › Profissional | Apelido | `Field` + `Input` | — | texto |
| Equipe › Profissional | Telefone | `Field` + `Input mask="phone"` | **`phone`** | dígitos brutos (10–11) |
| Equipe › Profissional | Estado | ações Inativar/Reativar (`Button`) | — | — |

Todos com rótulo visível; erros da API (`field` JSON Pointer) ligados ao `Field` correspondente.

## Telas e matriz de estados (`UI-060`)

| Estado | Login | Hoje | Equipe | Configuração pendente | Erros (401/403/404/503) |
| --- | --- | --- | --- | --- | --- |
| Inicial | formulário vazio, foco no e-mail | `PageHeader` + `StatsBlock` sem valores | lista de membros | mensagem + Sair | mensagem + ação de saída |
| Carregando | botão `Spinner` | `Skeleton` | `Skeleton` de linhas | — | — |
| Vazio | — | `StatsBlock` com "—" e `EmptyState` "Os números do dia aparecem a partir da agenda" | `EmptyState` "Convide a primeira pessoa" / "Nenhum profissional" | — | — |
| Inválido | erro por campo | — | erro por campo nos diálogos | — | — |
| Enviando | botão desabilitado com `Spinner` | — | botão do diálogo desabilitado | — | — |
| Sucesso (após API) | navega a `/hoje` (ou retorno) | — | `Toast`; convite: `Dialog` com link uma vez + Copiar | — | — |
| Erro | `Alert` genérico de credenciais | `Alert` + Tentar de novo | `Alert` + Tentar de novo | — | — |
| Conflito 409 | — | — | `Alert` "Alguém alterou antes; recarregue" + recarregar; último administrador com texto próprio | — | — |
| Sem permissão 403 | — | página Sem permissão | página Sem permissão | — | página própria |
| Indisponível 503 | `Alert` "Serviço de acesso indisponível, tente em instantes" | `Alert` | `Alert`; ações de equipe desabilitadas | — | página própria |
| Leitura | — | — | colaborador nunca vê; administrador vê revogados em leitura | leitura | — |
| Excesso de tentativas 429 | `Alert` com tempo de espera | — | — | — | — |

## Acessibilidade (`NFR-COR-002`, G4)

Login e Equipe operáveis só por teclado (inclusive diálogos e `Drawer`); foco visível; ordem de
foco lógica; anúncios de erro via região viva do DS; 320, 360, 768, 1280 px sem rolagem
horizontal; axe sem violação `serious`/`critical`.

## Marca (`UI-050`)

Copiados sem edição de `UX/assets/logomarcas-produtos/final-v1/cortivo/` para
`web/public/brand/`: `cortivo-principal.svg`, `cortivo-inversa.svg`, `simbolo-principal.svg`,
`simbolo-inversa.svg`, `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`. Manifesto copiado
como fixture de teste; teste compara sha256 dos sete. `index.html` declara favicon SVG + ICO +
`apple-touch-icon`.
