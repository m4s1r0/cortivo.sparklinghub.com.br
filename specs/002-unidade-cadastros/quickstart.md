# Quickstart de validação — 002 Unidade e cadastros do Cortivo (C02)

Guia de prova da fatia C02. A implementação ainda deve criar os diretórios-fonte `api/src` e
`web/src`; este roteiro passa a ser executável após a implementação. Os detalhes de persistência e
contratos estão em [data-model.md](./data-model.md) e [contracts/](./contracts/). Usar somente dados
sintéticos.

## Pré-requisitos

- Node.js 22 LTS, npm 10+ e Docker.
- MySQL 8.4 de desenvolvimento acessível em `127.0.0.1:3307`.
- Instância Cortivo sintética criada pelo SparkCore, com C01 aplicado até a versão 2 do esquema,
  administrador e colaborador de Recepção vinculados; nenhum dado real.
- Core local e credencial de desenvolvimento configurados como em
  [quickstart C01](../001-base-acesso-cortivo/quickstart.md).
- O artefato de migração C02 publicado/espelhado e validado contra a versão 2 antes de iniciar os
  testes de integração.

## Instalar e iniciar

```powershell
npm ci
Copy-Item api\.env.example api\.env
# Preencher api\.env com valores sintéticos de desenvolvimento, sem commitar o arquivo.
npm run dev
```

Confirmar a prontidão com `GET http://127.0.0.1:3003/api/saude` e abrir a aplicação em
`http://127.0.0.1:5177`.

## Gates automatizados

Executar na raiz do repositório:

```powershell
npm run typecheck
npm run lint
npm run test:unit
npm run test:integration
npm run test:contract
npm run test:e2e
npm run build
```

Esperado: todas as verificações passam; integração usa MySQL 8.4 real e dois bancos descartáveis
de instâncias sintéticas A/B. E2E usa Playwright e axe. `npm run test:integration` não deve ser
substituído por mock de persistência.

## Jornadas manuais

1. Entre como administrador e abra Configurações. Confirme a origem do nome/fuso, preencha os dados
   da unidade, defina dois intervalos no mesmo dia e salve. Abra novamente a tela e confirme a
   persistência e o aumento da versão.
2. Tente salvar intervalos sobrepostos, invertidos ou parciais. O formulário deve apontar o erro,
   preservar o estado anterior e não deixar configuração parcial.
3. Confira a prontidão: sem serviço, profissional habilitado ou disponibilidade, a tela identifica
   cada item faltante. Cadastre serviço e profissional e confirme a atualização do estado.
4. Cadastre um cliente sem telefone, depois dois clientes com telefone compartilhado; busque por
   nome e telefone. Os cadastros devem permanecer separados e a coincidência deve ser informativa.
   Confirme também e-mail/nascimento opcionais e ausência de campo CPF.
5. Registre e altere preferências de contato em canais/finalidades diferentes. Confirme que o
   histórico permanece e que não há envio automatizado nem permissão implícita de contato.
6. Cadastre serviço, item de revenda e item de insumo; teste duração, preço, precisão e unidade
   inválidos. Inative um serviço e confirme que referências históricas permanecem e novas
   seleções deixam de oferecê-lo.
7. Cadastre expediente com pausa, bloqueio profissional e bloqueio de unidade. Confirme a
   interseção da disponibilidade; tente produzir conflito com reserva, quando a fixture C03
   existir, e confirme que a mutação é impedida até resolver cada reserva.
8. Defina perfis de colaborador Recepção e Barbeiro. Confirme que o perfil Barbeiro exige
   profissional ativo e não permite associar o mesmo profissional a dois vínculos ativos.
9. Execute uma alteração em cada família de cadastro. Consulte a auditoria paginada como
   administrador e confirme ator, instante, ação, resultado, entidade e correlação; verifique
   que os snapshots não contêm telefone/e-mail completos nem observações integrais.
10. Tente consultar auditoria como colaborador e alterar/remover um registro diretamente com a
    credencial operacional. A primeira ação deve ser recusada; as operações `UPDATE`/`DELETE`
    devem falhar por privilégio.
11. Repita chamadas e alterações de forma concorrente contra MySQL real: versão vencida retorna
    conflito; nenhuma concorrência duplica preferência/associação nem confirma dados sem auditoria.
12. Com sessão de A, tente consultar/alterar por identificadores de B; não deve haver leitura,
    escrita nem indicação da existência do recurso em B.
13. Percorra as telas com teclado, em 320/360/768/1280 px e zoom 200%; confirme foco visível,
    mensagens acessíveis e ausência de rolagem horizontal na página.

## Evidência

Registrar resultado por requisito `FR-*`, história de usuário, `COR-001..004`, `COR-020`,
`AC-COR-021`, `NFR-COR-001/002/007`, `D-COR-03/04/09`, versão do artefato e versão do MySQL em
`evidence.md` da fatia. Usar IDs e massa sintética; não salvar tokens, contatos completos ou
capturas com dados pessoais.
