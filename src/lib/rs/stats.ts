/**
 * Estatística e agregação para o painel de Atração & Seleção.
 *
 * Funções puras, sem dependência de React ou do backend, para que as regras de
 * cálculo do painel possam ser testadas contra os números conhecidos da planilha.
 */

/** Extrai os valores numéricos de um campo, descartando nulos e NaN. */
export function nums<T>(rows: readonly T[], key: keyof T): number[] {
  const out: number[] = [];
  for (const r of rows) {
    const v = r[key];
    if (typeof v === "number" && !Number.isNaN(v)) out.push(v);
  }
  return out;
}

/** Soma um campo numérico, tratando ausência como zero. */
export function sum<T>(rows: readonly T[], key: keyof T): number {
  let t = 0;
  for (const r of rows) {
    const v = r[key];
    if (typeof v === "number" && !Number.isNaN(v)) t += v;
  }
  return t;
}

export function mean(a: readonly number[]): number | null {
  if (!a.length) return null;
  return a.reduce((x, y) => x + y, 0) / a.length;
}

/**
 * Percentil por interpolação linear, o mesmo método do `PERCENTIL` do Excel,
 * para que os números batam com a planilha que a analista já usa.
 */
export function percentil(a: readonly number[], p: number): number | null {
  if (!a.length) return null;
  const s = [...a].sort((x, y) => x - y);
  const i = (s.length - 1) * p;
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  return lo === hi ? s[lo] : s[lo] + (s[hi] - s[lo]) * (i - lo);
}

export function mediana(a: readonly number[]): number | null {
  return percentil(a, 0.5);
}

/** Proporção de linhas que satisfazem o predicado. Null quando não há linhas. */
export function proporcao<T>(rows: readonly T[], fn: (r: T) => boolean): number | null {
  if (!rows.length) return null;
  return rows.filter(fn).length / rows.length;
}

const VAZIO = "Não informado";

/** Contagem por valor de um campo. Valores ausentes viram "Não informado". */
export function contarPor<T>(rows: readonly T[], key: keyof T): Map<string, number> {
  const m = new Map<string, number>();
  for (const r of rows) {
    const raw = r[key];
    const v = raw === null || raw === undefined || raw === "" ? VAZIO : String(raw);
    m.set(v, (m.get(v) ?? 0) + 1);
  }
  return m;
}

/** Soma de um campo numérico agrupada por outro campo. */
export function somarPor<T>(rows: readonly T[], key: keyof T, valor: keyof T): Map<string, number> {
  const m = new Map<string, number>();
  for (const r of rows) {
    const raw = r[key];
    const k = raw === null || raw === undefined || raw === "" ? VAZIO : String(raw);
    const v = r[valor];
    m.set(k, (m.get(k) ?? 0) + (typeof v === "number" && !Number.isNaN(v) ? v : 0));
  }
  return m;
}

export interface ParChaveValor {
  k: string;
  v: number;
}

/**
 * Ordena um mapa do maior para o menor e, acima do limite, dobra a cauda em
 * "Outros" — nunca gera uma cor nova para a nona série.
 */
export function maiores(m: Map<string, number>, limite?: number): ParChaveValor[] {
  let a = Array.from(m.entries()).sort((x, y) => y[1] - x[1]);
  if (limite && a.length > limite) {
    const resto = a.slice(limite - 1).reduce((t, x) => t + x[1], 0);
    a = a.slice(0, limite - 1);
    if (resto) a.push(["Outros", resto]);
  }
  return a.map(([k, v]) => ({ k, v }));
}

/** Série mensal ordenada cronologicamente, descartando linhas sem mês. */
export function porMes<T>(rows: readonly T[], key: keyof T): ParChaveValor[] {
  return Array.from(contarPor(rows, key).entries())
    .filter(([k]) => k !== VAZIO)
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([k, v]) => ({ k, v }));
}

/** Distribuição de um campo numérico dentro de um grupo, para o gráfico de faixa. */
export interface Distribuicao {
  k: string;
  v: number;
  p25: number;
  p75: number;
  n: number;
}

export function distribuicaoPor<T>(
  rows: readonly T[],
  grupo: keyof T,
  valor: keyof T,
  minimo = 3,
): Distribuicao[] {
  const grupos = new Map<string, number[]>();
  for (const r of rows) {
    const raw = r[grupo];
    const k = raw === null || raw === undefined || raw === "" ? VAZIO : String(raw);
    const v = r[valor];
    if (typeof v !== "number" || Number.isNaN(v)) continue;
    const arr = grupos.get(k);
    if (arr) arr.push(v);
    else grupos.set(k, [v]);
  }
  const out: Distribuicao[] = [];
  for (const [k, a] of Array.from(grupos.entries())) {
    if (a.length < minimo) continue;
    out.push({
      k,
      v: mediana(a) as number,
      p25: percentil(a, 0.25) as number,
      p75: percentil(a, 0.75) as number,
      n: a.length,
    });
  }
  return out.sort((a, b) => a.v - b.v);
}

/** Subtrai meses de uma chave "AAAA-MM", para os atalhos de período. */
export function mesMenos(m: string, k: number): string {
  let ano = Number(m.slice(0, 4));
  let mes = Number(m.slice(5, 7)) - k;
  while (mes <= 0) {
    mes += 12;
    ano -= 1;
  }
  return `${ano}-${String(mes).padStart(2, "0")}`;
}
