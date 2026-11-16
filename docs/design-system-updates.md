# Atualizações do design system

Registro exigido por UI-001.2 e UI-001.5 do padrão de interface do ecossistema
(`core/core.sparkilnghub.com.br/docs/ecossistema/04-padrao-interface.md`, portão G6) e pelo
Princípio VIII da constituição do Cortivo. O Cortivo consome `@sparkling-hub/design-system` pelo
`.tgz` em `vendor/design-system/`, referenciado por `file:` em `web/package.json`. Toda troca de
versão é mudança revisada e ganha uma entrada aqui, com versão anterior e nova, sha256, motivo,
leitura do changelog e testes de interface reexecutados.

## (nenhuma) → 0.5.0 — 2026-11-16 (adoção inicial, C00)

| Campo | Valor |
| --- | --- |
| Versão anterior | nenhuma (repositório novo) |
| Versão nova | 0.5.0 — `vendor/design-system/sparkling-hub-design-system-0.5.0.tgz` (200.104 bytes), sha256 `58381c2ede514b6c2f240f09ea272b8d161b62558cba858f2f734895eb21cf36` |
| Origem do pacote | Cópia sem alteração de `tuteli/tuteli.sparklinghub.com.br/vendor/design-system/sparkling-hub-design-system-0.5.0.tgz`, o mesmo arquivo registrado pelo Tuteli em `docs/design-system-updates.md` (0.4.0 → 0.5.0, 15/11/2026, CONF-03). O sha256 conferiu byte a byte com o registrado lá. |
| Motivo | Versão vigente do ecossistema (`UI-001.1`, `ECO-011`); traz o atributo `mask` em `Input`, `FloatingInput` e `InputGroupInput`, exigido por `UI-040` (telefone do profissional nesta fatia). Com a 0.5.0 disponível, o plano B (0.4.0 + `MaskedInput`) não é necessário. |
| Changelog lido | `CHANGELOG.md` da 0.5.0 (15/11/2026): atributo `mask` (sem `mask`, mesmo HTML da 0.4.0); `InputGroup` com contorno único; `Pagination` com `controlSize` (herda de `ControlSizeProvider`); `InputProps` ganhou props opcionais (`mask`, `status`, `submit`, …). Nenhum código do Cortivo ainda estende `InputProps` nem usa `Pagination` dentro de `ControlSizeProvider`, então as mudanças perceptíveis não se aplicam. |
| Testes reexecutados | Nenhum de interface ainda (a casca e as telas nascem na fatia 001). Ficam registrados aqui no fechamento da fatia (`evidence.md`, T105 e T106): `npm run typecheck`, `npm run test:unit` (inclui o teste de sha256 da marca), `npm run test:e2e` (Playwright + axe) e `node scripts/check-ui.mjs`. |

**Pendência de confirmação:** o Tuteli registra que o `.tgz` 0.5.0 foi empacotado sobre o commit
`80f969f` do repositório do DS **com alterações ainda não commitadas** (CONF-08). Quando o DS
publicar a 0.5.0 a partir de um commit, o sha256 pode mudar: substituir o arquivo em `vendor/`,
rodar `npm install` na raiz e acrescentar uma entrada aqui com o novo sha256.

**Atenção ao trocar a versão — cache do Vite:** depois de `npm install`, apague
`web/node_modules/.vite` e reinicie qualquer `npm run dev` aberto; senão o servidor continua
entregando a versão anterior do DS.

## Regras de uso (UI-001)

- Importar somente pela API pública (`@sparkling-hub/design-system` e
  `@sparkling-hub/design-system/styles.css`); sem cópia de componentes, estilos de controle ou
  tokens.
- Ordem de CSS na entrada: `layers.css` → `styles.css` do DS → `app.css`; raiz sob `.sh-theme`.
- Sem redefinir `--color-sh-*` e sem `!important` sobre classes `sh-*` (verificado por
  `scripts/check-ui.mjs`).

## Lacunas observadas

Necessidades visuais não atendidas pelo DS viram proposta ao mantenedor (`UI-070`) e são
listadas aqui, sem contorno local por cópia de componente.

| Data | Tela | Necessidade | Proposta ao DS | Situação |
| --- | --- | --- | --- | --- |
| — | — | nenhuma até o momento | — | — |
