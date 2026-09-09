/**
 * Regras de negócio do painel de Atração & Seleção.
 *
 * Cada regra aqui substitui uma fórmula que hoje vive na planilha. Os limiares
 * de alerta vêm dos benchmarks levantados na pesquisa (SHRM, Gem, Ashby, Gupy)
 * e estão documentados em docs/superpowers/specs.
 */

import type { Candidatura, ClasseDesfecho, VagaAberta } from "@/types/atracao-selecao";

/* ------------------------------------------------------------------ *
 * Prazo-alvo por cargo
 * ------------------------------------------------------------------ */

/**
 * Prazo-alvo provisório, em dias, da aprovação da requisição ao fechamento.
 * Calibrado pelo SLA de mercado para vagas operacionais no Brasil (15 a 25
 * dias, referência Gupy). Deve ser validado pela gerência e, na onda 3, passa
 * a vir de MetaCargo no backend.
 */
export const PRAZO_ALVO_PADRAO = 35;

const PRAZO_ALVO: Record<string, number> = {
  "Atendente de Call Center": 25,
  "Atendente de Televendas": 25,
  "Promotor(a) de Vendas": 25,
  "Assistente Comercial": 25,
  "Atendente de Varejo": 25,
  Recepcionista: 25,
};

export function prazoAlvo(vaga: string): number {
  return PRAZO_ALVO[vaga] ?? PRAZO_ALVO_PADRAO;
}

/**
 * Uma vaga está atrasada quando os dias corridos desde a aprovação passam do
 * prazo-alvo do cargo. Usa o tempo bruto, não o líquido de congelamento: o
 * bruto é o número comparável com o mercado e é o que a gerência enxerga.
 */
export function vagaAtrasada(v: Pick<VagaAberta, "aging" | "vaga">): boolean {
  return v.aging !== null && v.aging > prazoAlvo(v.vaga);
}

/* ------------------------------------------------------------------ *
 * Faixas de aging
 * ------------------------------------------------------------------ */

export const FAIXAS_AGING: ReadonlyArray<{ min: number; max: number; rotulo: string }> = [
  { min: 0, max: 16, rotulo: "0–15 d" },
  { min: 16, max: 31, rotulo: "16–30 d" },
  { min: 31, max: 61, rotulo: "31–60 d" },
  { min: 61, max: Number.POSITIVE_INFINITY, rotulo: "mais de 60 d" },
];

export function faixaAging(dias: number | null): string {
  if (dias === null) return "Sem data";
  const f = FAIXAS_AGING.find((x) => dias >= x.min && dias < x.max);
  return (f ?? FAIXAS_AGING[FAIXAS_AGING.length - 1]).rotulo;
}

/* ------------------------------------------------------------------ *
 * Congelamento
 * ------------------------------------------------------------------ */

/**
 * Dias líquidos de um ciclo, descontando apenas a interseção entre o período de
 * congelamento e o ciclo da vaga.
 *
 * A planilha subtraía o congelamento inteiro, o que produzia valores negativos
 * em vagas aprovadas depois do início do congelamento (aparecem −61 e −64 dias
 * no arquivo original).
 */
export function diasLiquidos(
  inicioCiclo: Date,
  fimCiclo: Date,
  congelamentos: ReadonlyArray<{ inicio: Date; fim: Date }>,
): number {
  const DIA = 86_400_000;
  const bruto = Math.round((fimCiclo.getTime() - inicioCiclo.getTime()) / DIA);
  let congelado = 0;
  for (const c of congelamentos) {
    const ini = Math.max(c.inicio.getTime(), inicioCiclo.getTime());
    const fim = Math.min(c.fim.getTime(), fimCiclo.getTime());
    if (fim > ini) congelado += Math.round((fim - ini) / DIA);
  }
  return Math.max(0, bruto - congelado);
}

/* ------------------------------------------------------------------ *
 * Funil
 * ------------------------------------------------------------------ */

/**
 * Etapas da cascata. Como as seis colunas de data de etapa da planilha estão
 * vazias, a cascata mostra a etapa mais avançada alcançada, não o tempo em
 * cada etapa. Capturar o evento no ato é o que resolve isso (onda 2).
 */
export const ETAPAS_FUNIL: ReadonlyArray<{ nivel: number; rotulo: string }> = [
  { nivel: 1, rotulo: "Abordados" },
  { nivel: 2, rotulo: "Responderam" },
  { nivel: 3, rotulo: "Entrevista de RH" },
  { nivel: 4, rotulo: "Entrevista com o gestor" },
  { nivel: 5, rotulo: "Carta oferta" },
];

export function cascataFunil(rows: readonly Candidatura[]): Array<{ k: string; v: number }> {
  return ETAPAS_FUNIL.map(({ nivel, rotulo }) => ({
    k: rotulo,
    v: rows.filter((r) => r.etapa >= nivel).length,
  }));
}

export const NOME_DESFECHO: Record<ClasseDesfecho, string> = {
  aprovado: "Aprovado",
  processo: "Em processo",
  reprovado: "Reprovado pela empresa",
  declinou: "Candidato declinou",
  noshow: "Não compareceu / sem contato",
  seminfo: "Sem informação",
};

/**
 * Ordem fixa das classes na pilha. A ordem foi escolhida para que cores quentes
 * não fiquem adjacentes: a validação de daltonismo reprova âmbar ao lado de
 * verde, e aprova esta sequência nos dois temas.
 */
export const ORDEM_DESFECHO: readonly ClasseDesfecho[] = [
  "aprovado",
  "processo",
  "reprovado",
  "declinou",
  "noshow",
  "seminfo",
];

/**
 * Cor de série, e ela só existe dentro da moldura de um gráfico. Fora dali, a
 * interface é tinta sobre cinza e cor significa estado anormal.
 *
 * A ordem em ORDEM_DESFECHO mantém verde e âmbar afastados na pilha, que é o
 * par reprovado na verificação de daltonismo.
 */
/**
 * Desfecho, na lei de cor do quadro.
 *
 * O que é curso normal do processo fica na rampa fria e cala: aprovado no tom
 * mais fundo, em processo no meio, reprovado pela empresa no mais claro. Só
 * as duas saídas que o painel existe para combater acendem — quem não
 * compareceu no alarme, quem declinou na atenção — e o registro ausente fica
 * no cinza de dado que falta. Nenhuma categoria ordinária gasta vermelho.
 */
/*
 * Desfecho é categoria, não escala: ser reprovado não é "mais" que declinar.
 * Por isso a paleta aqui é a categórica, de matiz, e não a rampa ordinal, que
 * antes afirmava uma ordem entre desfechos que não existe.
 *
 * Duas exceções guardam significado: aprovado fica no teal, a única matiz do
 * sistema com valência positiva, e declinou fica na cor de atenção, porque é
 * um desfecho sobre o qual se age. Sem informação fica no cinza de dado
 * ausente, que não é uma categoria.
 */
export const COR_DESFECHO: Record<ClasseDesfecho, string> = {
  aprovado: "var(--rs-cat-3)",
  processo: "var(--rs-cat-4)",
  reprovado: "var(--rs-cat-1)",
  declinou: "var(--rs-atencao)",
  noshow: "var(--rs-cat-2)",
  seminfo: "var(--rs-serie-nula)",
};

/** Rampa ordinal do aging: magnitude, um matiz só, claro para escuro. */
export const RAMPA_AGING = [
  "var(--rs-rampa-1)",
  "var(--rs-rampa-2)",
  "var(--rs-rampa-3)",
  "var(--rs-rampa-4)",
] as const;

/* ------------------------------------------------------------------ *
 * Limiares de alerta (benchmarks de mercado)
 * ------------------------------------------------------------------ */

export const LIMIARES = {
  /** Acima disso o não comparecimento sai do aceitável. Fonte: KPI Depot, CloudApper. */
  noShow: 0.1,
  /** Abaixo disso o aceite de oferta indica problema de remuneração. Fonte: Metaview, Gem. */
  aceiteOferta: 0.75,
  /** Acima disso, salário virou a restrição principal. Fonte: Metaview. */
  salarioComoMotivo: 0.3,
  /** Dias sem evento antes de a candidatura virar pendência. Prazo já usado pela equipe. */
  diasSemRetorno: 5,
  /** Dias em uma etapa antes de virar atrito. Fonte: Metaview. */
  diasEmEtapa: 14,
  /** Vagas por recrutador. Mediana de mercado. Fonte: SHRM. */
  vagasPorRecrutador: 20,
} as const;

/* ------------------------------------------------------------------ *
 * Formatação pt-BR
 * ------------------------------------------------------------------ */

const NF = new Intl.NumberFormat("pt-BR");
const NF1 = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
const NFP = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 0 });
const NFR = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const vazio = (v: number | null | undefined): v is null | undefined =>
  v === null || v === undefined || Number.isNaN(v);

export const fmtN = (v: number | null | undefined): string =>
  vazio(v) ? "—" : NF.format(Math.round(v));
export const fmt1 = (v: number | null | undefined): string => (vazio(v) ? "—" : NF1.format(v));
export const fmtPct = (v: number | null | undefined): string => (vazio(v) ? "—" : NFP.format(v));
export const fmtBRL = (v: number | null | undefined): string => (vazio(v) ? "—" : NFR.format(v));

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** "2026-08" vira "ago/26". */
export const fmtMes = (m: string | null | undefined): string =>
  m ? `${MESES[Number(m.slice(5, 7)) - 1]}/${m.slice(2, 4)}` : "—";

/** "2026-08-27" vira "27/08/2026". */
export const fmtData = (s: string | null | undefined): string =>
  s ? `${s.slice(8, 10)}/${s.slice(5, 7)}/${s.slice(0, 4)}` : "—";
