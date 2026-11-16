// Verificação estática da interface (UI-030, UI-040, UI-001; portão G4).
//
// Falha, com arquivo:linha, quando encontra em web/src:
//   1. cor literal (#hex, rgb(), hsl(), oklch(), nome de cor em propriedade CSS, classe de cor da
//      paleta padrão do Tailwind) fora de var(--color-sh-*);
//   2. `!important` em regra que mira classes `sh-*` do design system;
//   3. redefinição de token `--color-sh-*`;
//   4. campo de telefone, documento, CEP, valor, porcentagem, data ou hora sem `mask`.
//
// Exceção pontual: comentário `check-ui-ignore: <motivo>` na linha anterior ou na própria linha.
// A raiz pode ser trocada por CHECK_UI_ROOT (usado nos testes do próprio verificador).

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const raizRepo = resolve(fileURLToPath(new URL("..", import.meta.url)));
const raiz = process.env.CHECK_UI_ROOT
  ? resolve(process.env.CHECK_UI_ROOT)
  : join(raizRepo, "web", "src");

const EXTENSOES = new Set([".ts", ".tsx", ".css"]);

function listar(dir) {
  const saida = [];
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) saida.push(...listar(caminho));
    else if (EXTENSOES.has(nome.slice(nome.lastIndexOf(".")))) saida.push(caminho);
  }
  return saida;
}

const achados = [];
function achar(arquivo, linha, regra, detalhe) {
  achados.push(`${relative(process.cwd(), arquivo)}:${linha}  [${regra}]  ${detalhe}`);
}

/** Linhas (1-based) isentas por `check-ui-ignore` na própria linha ou na anterior. */
function linhasIsentas(linhas) {
  const isentas = new Set();
  linhas.forEach((l, i) => {
    if (l.includes("check-ui-ignore")) {
      isentas.add(i + 1);
      isentas.add(i + 2);
    }
  });
  return isentas;
}

function numeroDaLinha(texto, indice) {
  let n = 1;
  for (let i = 0; i < indice; i++) if (texto.charCodeAt(i) === 10) n++;
  return n;
}

// ---------------------------------------------------------------- 1. cor literal

const NOMES_DE_COR = [
  "red", "blue", "green", "yellow", "orange", "purple", "pink", "brown", "black", "white", "gray",
  "grey", "cyan", "magenta", "teal", "navy", "maroon", "olive", "lime", "aqua", "fuchsia", "silver",
  "gold", "indigo", "violet", "crimson", "coral", "salmon", "tomato", "turquoise", "tan", "beige",
];
const PROP_COR =
  "(?:color|background|background-color|border|border-color|border-(?:top|right|bottom|left)(?:-color)?|outline|outline-color|fill|stroke|box-shadow|text-shadow|caret-color|accent-color)";
const RE_NOME_EM_PROP = new RegExp(
  `(?<![\\w-])${PROP_COR}\\s*:\\s*[^;{}]*?\\b(?:${NOMES_DE_COR.join("|")})\\b`,
  "i",
);
const RE_HEX = /(?<![\w&/#-])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/;
const RE_FUNCAO_COR = /(?<![\w-])(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/i;
const RE_TAILWIND_PALETA = new RegExp(
  `(?<![\\w-])(?:bg|text|border|ring|outline|fill|stroke|from|via|to|divide|decoration|shadow|accent|caret|placeholder)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\\d{2,3}(?![\\w-])`,
);

function verificarCores(arquivo, linhas, isentas) {
  const ehCss = arquivo.endsWith(".css");
  linhas.forEach((linha, i) => {
    const n = i + 1;
    if (isentas.has(n)) return;
    const semComentario = linha.replace(/\/\*.*?\*\//g, "").replace(/(^|\s)\/\/.*$/, "");
    // Remove var(--color-sh-*) antes de procurar literais, para não gerar falso positivo.
    const limpa = semComentario.replace(/var\(\s*--color-sh-[\w-]+[^)]*\)/g, "var()");
    if (RE_HEX.test(limpa) && !/(?:href|to|id)\s*=\s*["']#/.test(limpa)) {
      achar(arquivo, n, "cor-literal", "cor hexadecimal; use var(--color-sh-*) (UI-030)");
    }
    if (RE_FUNCAO_COR.test(limpa)) {
      achar(arquivo, n, "cor-literal", "função de cor (rgb/hsl/oklch…); use var(--color-sh-*) (UI-030)");
    }
    if (ehCss && RE_NOME_EM_PROP.test(limpa)) {
      achar(arquivo, n, "cor-literal", "nome de cor em propriedade CSS; use var(--color-sh-*) (UI-030)");
    }
    if (!ehCss && RE_TAILWIND_PALETA.test(limpa)) {
      achar(arquivo, n, "cor-literal", "classe da paleta padrão do Tailwind; use token --color-sh-* (UI-030)");
    }
  });
}

// ---------------------------------------------------------------- 2. !important em sh-*

function verificarImportant(arquivo, texto, isentas) {
  if (!arquivo.endsWith(".css")) return;
  const semComentario = texto.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(semComentario)) !== null) {
    const seletor = m[1];
    const corpo = m[2];
    if (!/\.sh-|\[class[*^~]?=["']?[^\]]*\bsh-/.test(seletor)) continue;
    const dentro = corpo.search(/!important/i);
    if (dentro < 0) continue;
    const indice = m.index + m[1].length + 1 + dentro;
    const n = numeroDaLinha(semComentario, indice);
    if (!isentas.has(n)) {
      achar(arquivo, n, "important-sh", "`!important` sobre classe sh-* do design system (UI-001.3)");
    }
  }
}

// ---------------------------------------------------------------- 3. redefinição de token

function verificarTokens(arquivo, linhas, isentas) {
  linhas.forEach((linha, i) => {
    const n = i + 1;
    if (isentas.has(n)) return;
    if (/--color-sh-[\w-]+["']?\s*:/.test(linha)) {
      achar(arquivo, n, "token-redefinido", "redefinição de token --color-sh-* (UI-001.3, UI-030)");
    }
  });
}

// ---------------------------------------------------------------- 4. campo especial sem mask

const L = "(?<![\\p{L}\\d])";
const R = "(?![\\p{L}\\d])";
const RE_CAMPO_ESPECIAL = new RegExp(
  `${L}(?:telefone|phone|celular|whatsapp|tel|documento|cpf|cnpj|cep|valor|pre[cç]o|price|amount|currency|moeda|porcentagem|percentual|percent|desconto|data|date|nascimento|hora|time|hor[aá]rio|datetime-local)${R}`,
  "iu",
);
const TAGS_DE_CAMPO = /<(Input|FloatingInput|InputGroupInput|input)\b/g;
const ATRIBUTOS_DE_NOME = /\b(?:name|id|label|aria-label|placeholder|type|autoComplete|inputMode)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*["'`]([^"'`]*)["'`]\s*\})/g;

/** Fim da tag que começa em `ini` (respeita chaves e aspas em atributos). */
function fimDaTag(texto, ini) {
  let chaves = 0;
  let aspas = null;
  for (let i = ini; i < texto.length; i++) {
    const c = texto[i];
    if (aspas) {
      if (c === aspas) aspas = null;
      continue;
    }
    if (c === '"' || c === "'") aspas = c;
    else if (c === "{") chaves++;
    else if (c === "}") chaves--;
    else if (c === ">" && chaves === 0) return i;
  }
  return texto.length - 1;
}

function textoDosAtributos(tag) {
  const partes = [];
  let m;
  ATRIBUTOS_DE_NOME.lastIndex = 0;
  while ((m = ATRIBUTOS_DE_NOME.exec(tag)) !== null) partes.push(m[1] ?? m[2] ?? m[3] ?? "");
  return partes.join(" ");
}

function verificarMascaras(arquivo, texto, isentas) {
  if (!arquivo.endsWith(".tsx")) return;
  // Campos que ficam dentro de um <Field label="..."> herdam o rótulo do Field.
  const campos = [...texto.matchAll(/<Field\b/g)].map((m) => {
    const fim = fimDaTag(texto, m.index);
    const fechamento = texto.indexOf("</Field>", fim);
    return {
      inicio: m.index,
      fimDoBloco: fechamento < 0 ? texto.length : fechamento,
      rotulo: textoDosAtributos(texto.slice(m.index, fim + 1)),
    };
  });

  let m;
  TAGS_DE_CAMPO.lastIndex = 0;
  while ((m = TAGS_DE_CAMPO.exec(texto)) !== null) {
    const fim = fimDaTag(texto, m.index);
    const tag = texto.slice(m.index, fim + 1);
    if (/\bmask\s*=/.test(tag)) continue;
    if (/\{\s*\.\.\./.test(tag) && !textoDosAtributos(tag)) continue; // props repassadas: verificado no uso
    const tipo = /\btype\s*=\s*["']([^"']*)["']/.exec(tag)?.[1] ?? "";
    if (["email", "password", "file", "checkbox", "radio", "hidden", "search", "url", "number"].includes(tipo)) {
      continue;
    }
    const pai = campos.filter((c) => c.inicio < m.index && m.index < c.fimDoBloco).at(-1);
    const rotulo = `${textoDosAtributos(tag)} ${pai?.rotulo ?? ""} ${tipo === "tel" ? "telefone" : ""}`;
    if (!RE_CAMPO_ESPECIAL.test(rotulo)) continue;
    const n = numeroDaLinha(texto, m.index);
    if (isentas.has(n)) continue;
    achar(
      arquivo,
      n,
      "campo-sem-mask",
      `campo de telefone/documento/CEP/valor/porcentagem/data/hora sem atributo mask (UI-040): ${rotulo.trim().slice(0, 60)}`,
    );
  }
}

// ---------------------------------------------------------------- execução

if (!existsSync(raiz)) {
  console.log(`check-ui: ${relative(process.cwd(), raiz)} ainda não existe; nada a verificar.`);
  process.exit(0);
}

const arquivos = listar(raiz);
for (const arquivo of arquivos) {
  const texto = readFileSync(arquivo, "utf8").replace(/\r\n/g, "\n");
  const linhas = texto.split("\n");
  const isentas = linhasIsentas(linhas);
  verificarCores(arquivo, linhas, isentas);
  verificarImportant(arquivo, texto, isentas);
  verificarTokens(arquivo, linhas, isentas);
  verificarMascaras(arquivo, texto, isentas);
}

if (achados.length > 0) {
  console.error(`check-ui: ${achados.length} problema(s) em ${arquivos.length} arquivo(s):\n`);
  for (const a of achados) console.error(`  ${a}`);
  process.exit(1);
}
console.log(`check-ui: ${arquivos.length} arquivo(s) verificado(s), nenhum problema.`);
