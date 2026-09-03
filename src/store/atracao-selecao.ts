"use client";

/**
 * Estado do painel de Atração & Seleção.
 *
 * Um store só, compartilhado pelas abas: o conjunto é carregado uma vez e os
 * filtros valem para todas as telas. Trocar de aba não perde o recorte, que é
 * o que faz a leitura semanal fluir sem refazer o caminho.
 */

import { create } from "zustand";

import { mesMenos } from "@/lib/rs/stats";
import {
  atracaoSelecaoApi,
  mensagemDeErro,
  type QualidadeDados,
} from "@/services/atracao-selecao-api";
import type { PainelAtracaoSelecao } from "@/types/atracao-selecao";

/** Um recorte aplicado a todas as seções ao mesmo tempo. */
export interface Filtros {
  /** "AAAA-MM", ou "p3"/"p6" para os últimos 3 e 6 meses, ou "" para tudo. */
  periodo: string;
  filial: string;
  cargo: string;
  recrutador: string;
  gestor: string;
  praca: string;
  desfecho: string;
}

export const FILTROS_VAZIOS: Filtros = {
  periodo: "",
  filial: "",
  cargo: "",
  recrutador: "",
  gestor: "",
  praca: "",
  desfecho: "",
};

interface Estado {
  dados: PainelAtracaoSelecao | null;
  qualidade: QualidadeDados | null;
  carregando: boolean;
  erro: string | null;
  filtros: Filtros;
}

interface Acoes {
  carregar: (opcoes?: { forcar?: boolean }) => Promise<void>;
  /** Mesma leitura, por link público. Sem qualidade: ela é da tela de carga. */
  carregarPublico: (token: string) => Promise<void>;
  definirFiltro: (chave: keyof Filtros, valor: string) => void;
  limparFiltros: () => void;
  limparErro: () => void;
}

const estadoInicial: Estado = {
  dados: null,
  qualidade: null,
  carregando: false,
  erro: null,
  filtros: FILTROS_VAZIOS,
};

export const useAtracaoSelecao = create<Estado & Acoes>()((set, get) => ({
  ...estadoInicial,

  carregar: async ({ forcar = false } = {}) => {
    if (get().carregando) return;
    if (get().dados && !forcar) return;
    set({ carregando: true, erro: null });
    try {
      // A qualidade é carregada junto porque o carimbo de frescor precisa
      // aparecer no mesmo instante que os números, não depois deles.
      const [dados, qualidade] = await Promise.all([
        atracaoSelecaoApi.obterPainel(),
        atracaoSelecaoApi.obterQualidade().catch(() => null),
      ]);
      set({ dados, qualidade, carregando: false });
    } catch (erro) {
      set({ erro: mensagemDeErro(erro), carregando: false });
    }
  },

  carregarPublico: async (token: string) => {
    if (get().carregando || get().dados) return;
    set({ carregando: true, erro: null });
    try {
      const dados = await atracaoSelecaoApi.obterPainelPublico(token);
      set({ dados, qualidade: null, carregando: false });
    } catch {
      set({
        erro: "Este link não vale mais. Peça um novo a quem enviou — eles expiram por segurança.",
        carregando: false,
      });
    }
  },

  definirFiltro: (chave, valor) =>
    set((s) => ({ filtros: { ...s.filtros, [chave]: valor } })),

  limparFiltros: () => set({ filtros: FILTROS_VAZIOS }),

  limparErro: () => set({ erro: null }),
}));

/* ------------------------------------------------------------------ *
 * Aplicação dos filtros
 * ------------------------------------------------------------------ */

/** Campos que cada seção usa para casar com um filtro do painel. */
export type MapaDeFiltro<T> = Partial<Record<keyof Filtros, keyof T & string>>;

/**
 * Aplica os filtros ativos a uma lista.
 *
 * O mapa diz qual campo da linha corresponde a cada filtro; uma seção que não
 * tem determinado campo simplesmente ignora aquele filtro, em vez de esvaziar
 * a tela sem explicação.
 */
export function aplicarFiltros<T>(
  linhas: readonly T[],
  filtros: Filtros,
  mapa: MapaDeFiltro<T>,
  mesMaximo?: string,
): T[] {
  const chaves: Array<keyof Filtros> = [
    "filial",
    "cargo",
    "recrutador",
    "gestor",
    "praca",
    "desfecho",
  ];

  return linhas.filter((linha) => {
    if (filtros.periodo && mapa.periodo) {
      const mes = linha[mapa.periodo];
      if (typeof mes !== "string") return false;
      if (filtros.periodo === "p3" || filtros.periodo === "p6") {
        if (!mesMaximo) return true;
        const passos = filtros.periodo === "p3" ? 2 : 5;
        if (mes < mesMenos(mesMaximo, passos)) return false;
      } else if (mes !== filtros.periodo) {
        return false;
      }
    }

    for (const chave of chaves) {
      const valor = filtros[chave];
      const campo = mapa[chave];
      if (!valor || !campo) continue;
      if (String(linha[campo] ?? "") !== valor) return false;
    }
    return true;
  });
}

/** Maior mês presente numa lista, usado pelos atalhos de período. */
export function mesMaximoDe<T>(
  linhas: readonly T[],
  campo: keyof T & string,
): string | undefined {
  let maior: string | undefined;
  for (const l of linhas) {
    const v = l[campo];
    if (typeof v === "string" && (!maior || v > maior)) maior = v;
  }
  return maior;
}

/** Valores distintos de um campo, em ordem alfabética pt-BR, para os seletores. */
export function opcoesDe<T>(linhas: readonly T[], campo: keyof T & string): string[] {
  const vistos = new Set<string>();
  for (const l of linhas) {
    const v = l[campo];
    if (typeof v === "string" && v) vistos.add(v);
  }
  return Array.from(vistos).sort((a, b) => a.localeCompare(b, "pt-BR"));
}
