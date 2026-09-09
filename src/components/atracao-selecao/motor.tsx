"use client";

/**
 * O motor de desenho dos instrumentos.
 *
 * Os gráficos deixaram de ser SVG escrito à mão e passaram a ser ECharts, mas a
 * identidade não mudou de dono: quem manda na cor, na fonte e na folga continua
 * sendo o CSS. Este arquivo é a única ponte entre os dois mundos, e existe por
 * um motivo estrutural — o ECharts calcula realce, gradiente e sombra em
 * JavaScript, e para isso precisa da cor resolvida (#2563eb), não da referência
 * (var(--rs-rampa-2)). Um `fill="var(...)"` que o navegador resolveria sozinho
 * no SVG manuscrito aqui chega no motor como string opaca e sai como preto.
 *
 * Concentrar a resolução num lugar só tem uma consequência boa: quando o tema
 * troca, é aqui que se descobre, e todos os instrumentos redesenham juntos.
 */

import { useEffect, useState } from "react";

import dynamic from "next/dynamic";

import type { EChartsOption } from "echarts";

export type { EChartsOption };

/* ------------------------------------------------------------------ *
 * A paleta resolvida
 * ------------------------------------------------------------------ */

export interface Paleta {
  tinta: string;
  tinta2: string;
  tinta3: string;
  fio: string;
  fioForte: string;
  placa: string;
  placaFunda: string;
  alarme: string;
  atencao: string;
  processo: string;
  rampa: [string, string, string, string];
  /** Matiz para categoria, sem ordem implícita. Ver a lei de cor no DESIGN.md. */
  cat: [string, string, string, string];
  nulo: string;
  foco: string;
  /** Tinta declarada para ir por cima de cada preenchimento, na mesma ordem. */
  sobreRampa: [string, string, string, string];
  sobreCat: [string, string, string, string];
  sobreNulo: string;
  sobreAlarme: string;
  fonte: string;
  escuro: boolean;
}

const PADRAO: Paleta = {
  tinta: "#0f172a",
  tinta2: "#475569",
  tinta3: "#64748b",
  fio: "#cbd5e1",
  fioForte: "#94a3b8",
  placa: "#ffffff",
  placaFunda: "#e2e8f0",
  alarme: "#b91c1c",
  atencao: "#d97706",
  processo: "#0f766e",
  rampa: ["#3b82f6", "#4f46e5", "#4c1d95", "#172554"],
  cat: ["#1e3a8a", "#7c3aed", "#0f766e", "#93c5fd"],
  nulo: "#94a3b8",
  foco: "#0ea5a4",
  sobreRampa: ["#0f172a", "#ffffff", "#ffffff", "#ffffff"],
  sobreCat: ["#ffffff", "#ffffff", "#ffffff", "#0f172a"],
  sobreNulo: "#0f172a",
  sobreAlarme: "#ffffff",
  fonte: "system-ui, sans-serif",
  escuro: false,
};

/**
 * De onde os tokens são lidos.
 *
 * Não da raiz do documento: `data-rh-tema` vive na div `.rs-painel`, e as
 * propriedades customizadas do tema escuro nascem ali. Lendo de
 * `documentElement` sempre se recebe a paleta clara — no escuro isso pinta
 * rótulo quase preto sobre superfície quase preta e inverte a rampa, sem erro
 * nenhum no console. A cascata resolve isso sozinha desde que se pergunte de
 * dentro do escopo certo.
 */
function escopo(): HTMLElement {
  if (typeof document === "undefined") return null as unknown as HTMLElement;
  return document.querySelector<HTMLElement>(".rs-painel") ?? document.documentElement;
}

function lerPaleta(): Paleta {
  if (typeof window === "undefined") return PADRAO;
  const raiz = escopo();
  const cs = getComputedStyle(raiz);
  /* getPropertyValue devolve "" para token inexistente, e "" num campo de cor
     do ECharts vira transparente — o instrumento sumiria em silêncio. O padrão
     entra como rede, não como conveniência. */
  const t = (nome: string, reserva: string) => cs.getPropertyValue(nome).trim() || reserva;
  return {
    tinta: t("--rh-tinta", PADRAO.tinta),
    tinta2: t("--rh-tinta-2", PADRAO.tinta2),
    tinta3: t("--rh-tinta-3", PADRAO.tinta3),
    fio: t("--rh-fio", PADRAO.fio),
    fioForte: t("--rh-fio-forte", PADRAO.fioForte),
    placa: t("--rh-superficie", PADRAO.placa),
    placaFunda: t("--rh-superficie-funda", PADRAO.placaFunda),
    alarme: t("--rh-alarme", PADRAO.alarme),
    atencao: t("--rh-atencao", PADRAO.atencao),
    processo: t("--rh-processo", PADRAO.processo),
    rampa: [
      t("--rh-rampa-1", PADRAO.rampa[0]),
      t("--rh-rampa-2", PADRAO.rampa[1]),
      t("--rh-rampa-3", PADRAO.rampa[2]),
      t("--rh-rampa-4", PADRAO.rampa[3]),
    ],
    cat: [
      t("--rh-cat-1", PADRAO.cat[0]),
      t("--rh-cat-2", PADRAO.cat[1]),
      t("--rh-cat-3", PADRAO.cat[2]),
      t("--rh-cat-4", PADRAO.cat[3]),
    ],
    nulo: t("--rh-nulo", PADRAO.nulo),
    foco: t("--rh-foco", PADRAO.foco),
    sobreRampa: [
      t("--rh-sobre-rampa-1", PADRAO.sobreRampa[0]),
      t("--rh-sobre-rampa-2", PADRAO.sobreRampa[1]),
      t("--rh-sobre-rampa-3", PADRAO.sobreRampa[2]),
      t("--rh-sobre-rampa-4", PADRAO.sobreRampa[3]),
    ],
    sobreCat: [
      t("--rh-sobre-cat-1", PADRAO.sobreCat[0]),
      t("--rh-sobre-cat-2", PADRAO.sobreCat[1]),
      t("--rh-sobre-cat-3", PADRAO.sobreCat[2]),
      t("--rh-sobre-cat-4", PADRAO.sobreCat[3]),
    ],
    sobreNulo: t("--rh-sobre-nulo", PADRAO.sobreNulo),
    sobreAlarme: t("--rh-sobre-alarme", PADRAO.sobreAlarme),
    fonte: t("--rh-fonte", PADRAO.fonte),
    escuro: raiz.getAttribute("data-rh-tema") === "escuro",
  };
}

/**
 * A paleta viva.
 *
 * O CSS troca de tema sozinho; o ECharts não fica sabendo, porque as cores dele
 * já foram copiadas para dentro do objeto de opções. Sem este observador o
 * quadro escureceria em volta e os gráficos continuariam claros no meio.
 */
export function usePaleta(): Paleta {
  const [paleta, setPaleta] = useState<Paleta>(PADRAO);

  useEffect(() => {
    const reler = () => setPaleta(lerPaleta());
    reler();

    const obs = new MutationObserver(reler);
    const alvo = escopo();
    obs.observe(alvo, { attributes: true, attributeFilter: ["data-rh-tema", "class", "style"] });
    if (alvo !== document.documentElement) {
      obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-rh-tema", "class"] });
    }

    // Tema "sistema" não mexe em atributo nenhum: quem muda é o sistema
    // operacional, e só a media query avisa.
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", reler);

    return () => {
      obs.disconnect();
      mq.removeEventListener("change", reler);
    };
  }, []);

  return paleta;
}

/**
 * Tipografia dos instrumentos.
 *
 * Vive aqui, e não no CSS, porque o ECharts mede o texto para decidir se um
 * rótulo cabe dentro do segmento — e para medir precisa do número, não de uma
 * classe. É a mesma escala do resto do quadro, declarada duas vezes de
 * propósito: a duplicação é o preço de o motor não ler cascata.
 */
export const TIPO = {
  rotulo: 14,
  marca: 13,
  valor: 13,
  destaque: 15,
} as const;

/* ------------------------------------------------------------------ *
 * Peças compartilhadas de opção
 * ------------------------------------------------------------------ */

/**
 * A dica de sobrevoo.
 *
 * O painel agora é lido de perto, e a dica virou instrumento de primeira
 * classe: é ela que carrega o detalhe que não cabe no rótulo. Mas continua
 * valendo a regra antiga — nenhum valor existe *só* na dica; a tabela gêmea
 * repete tudo.
 */
export const dica = (p: Paleta): EChartsOption["tooltip"] => ({
  trigger: "item",
  backgroundColor: p.escuro ? p.placaFunda : p.tinta,
  borderWidth: 0,
  padding: [8, 11],
  textStyle: { color: p.escuro ? p.tinta : p.placa, fontSize: TIPO.marca, fontFamily: p.fonte },
  // Canto reto, como a dica que este sobrevoo substituiu: a Regra do Canto
  // Reto do sistema nomeia a dica entre os instrumentos de raio zero.
  extraCssText: "border-radius:0; box-shadow:0 6px 22px -8px rgb(15 23 42 / 45%);",
  confine: true,
});

/** Eixo de valor: fio sólido fino, sem linha de eixo, marcas em número redondo. */
export const eixoValor = (p: Paleta, extra: Record<string, unknown> = {}) => ({
  type: "value" as const,
  splitLine: { lineStyle: { color: p.fio, width: 1 } },
  axisLine: { show: false },
  axisTick: { show: false },
  axisLabel: { color: p.tinta3, fontSize: TIPO.marca, fontFamily: p.fonte },
  ...extra,
});

/** Eixo de categoria: sem grade, o rótulo é que orienta. */
export const eixoCategoria = (p: Paleta, extra: Record<string, unknown> = {}) => ({
  type: "category" as const,
  splitLine: { show: false },
  axisLine: { lineStyle: { color: p.fio } },
  axisTick: { show: false },
  axisLabel: { color: p.tinta2, fontSize: TIPO.marca, fontFamily: p.fonte },
  ...extra,
});

/*
 * Os tipos de retorno de chamada do ECharts.
 *
 * Cada rótulo, cor e desenho customizado recebe um objeto do motor. Declarar
 * uma versão estreita dele em cada instrumento compila hoje e quebra na
 * primeira propriedade nova; importar o tipo real de um lugar só mantém os seis
 * instrumentos falando a mesma língua que a biblioteca.
 */
export type {
  CallbackDataParams as ParamRotulo,
  CustomSeriesRenderItemAPI as RenderAPI,
  CustomSeriesRenderItemParams as RenderParams,
  CustomSeriesRenderItemReturn as RenderRetorno,
} from "echarts/types/dist/shared";

/* ------------------------------------------------------------------ *
 * O invólucro, carregado sob demanda
 * ------------------------------------------------------------------ */

/**
 * O motor de desenho pesa 230 kB comprimidos — mais que todo o resto do painel
 * somado. Carregá-lo antes da primeira pintura atrasa justamente o que já está
 * pronto para ser lido: os cartões, a régua de filtros e os alarmes, que são
 * texto e não dependem de gráfico nenhum.
 *
 * `ssr: false` não é otimização, é correção: `echarts.init` mede o contêiner, e
 * no servidor não existe contêiner para medir.
 */
export const Grafico = dynamic(() => import("./motor-grafico").then((m) => m.Grafico), {
  ssr: false,
  loading: () => <div className="rs-grafico rs-grafico--carregando" aria-hidden />,
});
