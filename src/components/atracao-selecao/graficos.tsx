"use client";

/**
 * Instrumentos do quadro.
 *
 * O desenho é do ECharts; a identidade continua sendo do CSS. A cor do dado
 * vive presa dentro da moldura da placa — fora dela a interface é tinta sobre
 * cinza, e cor significa estado anormal. É essa quarentena que impede o painel
 * de virar um mosaico onde tudo compete, e ela não afrouxou por trocarmos de
 * motor: nenhum instrumento aqui chama a paleta categórica do ECharts.
 *
 * O quadro é lido de perto, numa mesa, por quem está investigando. Por isso o
 * sobrevoo virou instrumento de primeira classe e as séries longas ganharam
 * zoom. Mas a regra antiga não caiu: nenhum valor existe *só* no sobrevoo. Cada
 * instrumento devolve a tabela equivalente, e ela continua sendo a via de quem
 * não usa mouse.
 */

import { useMemo, type ReactNode } from "react";

import { fmtN, fmtPct } from "@/lib/rs/metricas";
import {
  Grafico,
  dica,
  eixoCategoria,
  eixoValor,
  usePaleta,
  TIPO,
  type EChartsOption,
  type Paleta,
  type ParamRotulo,
  type RenderAPI,
  type RenderParams,
} from "./motor";

/* ------------------------------------------------------------------ *
 * Placa: a moldura onde o dado (e a cor) vivem
 * ------------------------------------------------------------------ */

export interface TabelaGemea {
  cabecalhos: string[];
  linhas: string[][];
}

export function Placa({
  titulo,
  nota,
  span = "rs-c6",
  children,
  tabela,
  legenda,
  total,
}: {
  titulo: string;
  nota?: string;
  span?: string;
  children: ReactNode;
  tabela?: TabelaGemea;
  legenda?: Array<{ nome: string; cor: string }>;
  /**
   * O que as barras somam. Um gráfico responde a proporção; o total responde
   * "de quantos estamos falando", e sem ele o leitor precisa somar de cabeça
   * para saber se a fatia grande é grande de verdade.
   */
  total?: { rotulo: string; valor: ReactNode };
}) {
  return (
    <section className={`rs-placa ${span}`}>
      <h3 className="rs-cabeca">{titulo}</h3>
      {nota ? <p className="rs-sub">{nota}</p> : null}
      {/* A placa estica até a altura da linha da grade. Sem isto o instrumento
          fica grudado no topo e sobra um vão morto embaixo dele. */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 0 }}>
        {children}
      </div>

      {total ? (
        <p className="rs-total">
          <span>{total.rotulo}</span>
          <b className="rs-num">{total.valor}</b>
        </p>
      ) : null}

      {legenda?.length ? (
        <ul className="rs-legenda">
          {legenda.map((l) => (
            <li key={l.nome} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <i aria-hidden style={{ background: l.cor }} />
              {l.nome}
            </li>
          ))}
        </ul>
      ) : null}

      {tabela ? (
        <details className="rs-numeros">
          <summary>
            <svg aria-hidden width="6" height="9" viewBox="0 0 6 9">
              <path d="M0.5 0.5 L5 4.5 L0.5 8.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            Os números
          </summary>
          <div data-rolagem style={{ maxHeight: 230, overflow: "auto", marginTop: 8 }}>
            <table className="rs-tabela" style={{ fontSize: 13 }}>
              <thead>
                <tr>
                  {tabela.cabecalhos.map((h, i) => (
                    <th key={h} scope="col" className={i ? "rs-num-col" : ""}>
                      <button type="button" tabIndex={-1} style={{ cursor: "default" }}>
                        {h}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tabela.linhas.map((linha, i) => (
                  <tr key={i}>
                    {linha.map((c, j) => (
                      <td key={j} className={j ? "rs-num-col" : ""}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ) : null}
    </section>
  );
}

function Vazio({ mensagem = "Sem registros para este recorte" }: { mensagem?: string }) {
  return <p className="rs-vazio">{mensagem}</p>;
}

/* ------------------------------------------------------------------ *
 * Tradução de cor
 * ------------------------------------------------------------------ */

/**
 * De token CSS para cor literal.
 *
 * As páginas continuam declarando a cor como `var(--rs-rampa-2)`, que é a forma
 * certa de falar de cor neste produto. O ECharts, porém, precisa do valor
 * resolvido para calcular realce e sombra — entregar-lhe a string `var(...)`
 * devolve um preenchimento preto sem erro nenhum no console. A tradução mora
 * aqui, e só aqui.
 */
function corDe(cor: string | undefined, p: Paleta, reserva: string): string {
  if (!cor) return reserva;
  if (cor.startsWith("#") || cor.startsWith("rgb")) return cor;
  if (cor.includes("--rs-rampa-1") || cor.includes("--rh-rampa-1")) return p.rampa[0];
  if (cor.includes("--rs-rampa-2") || cor.includes("--rh-rampa-2")) return p.rampa[1];
  if (cor.includes("--rs-rampa-3") || cor.includes("--rh-rampa-3")) return p.rampa[2];
  if (cor.includes("--rs-rampa-4") || cor.includes("--rh-rampa-4")) return p.rampa[3];
  if (cor.includes("serie-nula") || cor.includes("--rh-nulo")) return p.nulo;
  if (cor.includes("alarme")) return p.alarme;
  if (cor.includes("atencao")) return p.atencao;
  if (cor.includes("processo")) return p.processo;
  return reserva;
}

/**
 * O degrau da rampa que corresponde a um valor.
 *
 * Num gráfico de barras ordenado, a posição na lista já é ordinal: quem está
 * no topo tem mais. Pintar todas as barras do mesmo azul desperdiça um canal
 * que o dado já paga — a magnitude fica só no comprimento, e o quadro inteiro
 * lê como uma parede de retângulos iguais.
 *
 * Codificar a mesma grandeza duas vezes, em comprimento e em luminância, não
 * inventa informação nenhuma: é redundância, e redundância acelera a leitura
 * em vez de confundi-la. O que seria desonesto é dar matizes diferentes a
 * categorias nominais, fingindo agrupamento onde não existe — e é por isso que
 * o que varia aqui é o degrau da mesma rampa, não a cor.
 */
function degrauDe(valor: number, teto: number, p: Paleta): string {
  if (teto <= 0) return p.rampa[0];
  const fracao = Math.max(0, Math.min(1, valor / teto));
  return p.rampa[Math.min(3, Math.floor(fracao * 4))];
}

/** A tinta que vai por cima de um preenchimento, declarada e não adivinhada. */
function tintaSobre(preenchimento: string, p: Paleta): string {
  const i = p.rampa.indexOf(preenchimento);
  if (i >= 0) return p.sobreRampa[i];
  if (preenchimento === p.nulo) return p.sobreNulo;
  if (preenchimento === p.alarme) return p.sobreAlarme;
  return p.sobreRampa[2];
}

/**
 * Corte de rótulo que preserva o que distingue.
 *
 * "Promotor(a) de Vendas · Belém" e "Promotor(a) de Vendas · Macapá" cortados
 * pela ponta viram duas linhas idênticas, e duas linhas idênticas num quadro de
 * operação são pior que nenhuma. Num rótulo composto o meio é o que cede — e é
 * exatamente isso que o `overflow: truncate` do ECharts não sabe fazer, razão
 * de esta função ter sobrevivido à troca de motor.
 */
function cortar(s: string, max: number): string {
  if (s.length <= max) return s;
  const sep = s.lastIndexOf(" · ");
  if (sep > 0) {
    const cauda = s.slice(sep);
    const cabeca = max - cauda.length - 1;
    if (cabeca >= 6) return `${s.slice(0, cabeca)}…${cauda}`;
  }
  return `${s.slice(0, Math.max(1, max - 1))}…`;
}

/*
 * A calha do eixo e o orçamento de caracteres.
 *
 * Os dois números precisam sair do mesmo cálculo. Reservar a largura com uma
 * constante e depois dividi-la pela mesma constante para saber quantas letras
 * cabem perde um caractere no arredondamento: "Filial 10 · Região Norte" tem 24
 * letras, a calha reservava 170px e o orçamento devolvia 23, e o rótulo era
 * cortado exatamente onde estava o número que o distingue dos vizinhos.
 */
const PX_POR_LETRA = 7.1;
function calha(chaves: string[], teto = 30) {
  const letras = Math.max(...chaves.map((k) => Math.min(k.length, teto)));
  const largura = Math.min(300, Math.max(76, Math.round(letras * PX_POR_LETRA)));
  return { largura, letras: Math.max(letras, Math.floor(largura / PX_POR_LETRA)) };
}

/* ------------------------------------------------------------------ *
 * Barras horizontais
 * ------------------------------------------------------------------ */

export interface ItemBarra {
  k: string;
  v: number;
  cor?: string;
  extra?: string;
}

/** Acima disto a leitura vira rolagem, e a rolagem precisa de controle. */
const LINHAS_SEM_ZOOM = 14;

export function Barras({
  dados,
  unidade = "",
  formatar = fmtN,
  destaque,
  limiar,
  max,
}: {
  dados: ItemBarra[];
  unidade?: string;
  formatar?: (v: number | null) => string;
  destaque?: Set<string>;
  limiar?: { valor: number; rotulo: string };
  max?: number;
}) {
  const p = usePaleta();
  const vazio = !dados.length || dados.every((d) => !d.v);

  const visiveis = Math.min(dados.length, LINHAS_SEM_ZOOM);
  const altura = visiveis * 30 + (limiar ? 34 : 18);

  const option = useMemo<EChartsOption>(() => {
    const { largura: wRot, letras } = calha(dados.map((d) => d.k));
    const comZoom = dados.length > LINHAS_SEM_ZOOM;
    /* A escada mede contra o maior valor presente, não contra o teto do eixo:
       num recorte onde tudo é pequeno, o maior ainda é o maior, e achatar todas
       as barras no degrau mais claro esconderia a ordenação. */
    const tetoRampa = Math.max(...dados.map((d) => d.v), 1);

    return {
      animationDuration: 320,
      grid: { left: wRot + 10, right: comZoom ? 78 : 58, top: limiar ? 30 : 6, bottom: 4, containLabel: false },
      tooltip: {
        ...dica(p),
        formatter: (a: unknown) => {
          const d = (a as { dataIndex: number }).dataIndex;
          const it = dados[d];
          const extra = it.extra ? `<br><span style="opacity:.75">${it.extra}</span>` : "";
          return `${it.k}<br><b style="font-size:15px">${formatar(it.v)}${unidade}</b>${extra}`;
        },
      },
      xAxis: eixoValor(p, { max, axisLabel: { show: false }, splitLine: { show: false } }),
      yAxis: eixoCategoria(p, {
        inverse: true,
        data: dados.map((d) => d.k),
        axisLine: { show: false },
        axisLabel: {
          color: p.tinta2,
          fontSize: TIPO.rotulo,
          fontFamily: p.fonte,
          width: wRot,
          formatter: (v: string) => cortar(v, letras),
        },
      }),
      /* Um zoom só por roda do mouse é invisível: o leitor vê catorze linhas e
         conclui que são todas as que existem. A barra à direita é a única parte
         do instrumento que precisa ser vista antes de ser usada. */
      ...(comZoom
        ? {
            dataZoom: [
              { type: "inside", yAxisIndex: 0, startValue: 0, endValue: LINHAS_SEM_ZOOM - 1, zoomOnMouseWheel: false, moveOnMouseWheel: true },
              {
                type: "slider",
                yAxisIndex: 0,
                startValue: 0,
                endValue: LINHAS_SEM_ZOOM - 1,
                width: 11,
                right: 8,
                showDetail: false,
                brushSelect: false,
                borderColor: "transparent",
                backgroundColor: p.placaFunda,
                fillerColor: p.escuro ? "#ffffff2e" : "#0f172a24",
                handleStyle: { color: p.fioForte, borderWidth: 0 },
                moveHandleStyle: { color: p.fioForte },
              },
            ],
          }
        : {}),
      series: [
        {
          type: "bar",
          barMaxWidth: 16,
          itemStyle: {
            /* Os 4px da ponta são herança deliberada do desenho anterior, que
               os documentava como "base reta, ponta do dado arredondada". A
               base fica reta porque é onde a barra encosta no eixo, e a ponta
               cede porque é onde o dado termina. É a única exceção à Regra do
               Canto Reto neste módulo, e ela vem de trás — não foi inventada
               na troca de motor. */
            borderRadius: [0, 4, 4, 0],
            color: (a: ParamRotulo) => {
              const it = dados[a.dataIndex];
              // Destaque é estado anormal, e estado anormal tem cor própria.
              if (destaque?.has(it.k)) return p.alarme;
              // Cor declarada pela página manda; sem ela, quem escolhe é o valor.
              return it.cor ? corDe(it.cor, p, p.rampa[1]) : degrauDe(it.v, tetoRampa, p);
            },
          },
          emphasis: { itemStyle: { color: p.foco } },
          /* O rótulo direto no fim da barra, sempre. Na mesa o leitor compara
             valores exatos, não silhuetas, e mandá-lo ao sobrevoo item a item
             para ler um número é cobrar um clique por dado. */
          label: {
            show: true,
            position: "right",
            distance: 7,
            color: p.tinta,
            fontSize: TIPO.valor,
            fontFamily: p.fonte,
            fontWeight: 600,
            formatter: (a: ParamRotulo) => `${formatar(dados[a.dataIndex].v)}${unidade}`,
          },
          data: dados.map((d) => d.v),
          ...(limiar
            ? {
                markLine: {
                  silent: true,
                  symbol: "none",
                  lineStyle: { color: p.alarme, width: 1.4, type: [5, 4] },
                  label: {
                    formatter: limiar.rotulo,
                    color: p.alarme,
                    fontSize: TIPO.marca,
                    fontFamily: p.fonte,
                    // Acima do traço, não na ponta: na ponta o rótulo caía fora
                    // da moldura e simplesmente não era desenhado.
                    position: "start",
                    distance: 6,
                  },
                  data: [{ xAxis: limiar.valor }],
                },
              }
            : {}),
        },
      ],
    };
  }, [dados, p, unidade, formatar, destaque, limiar, max]);

  if (vazio) return <Vazio />;
  return <Grafico option={option} altura={altura} aria={`Barras: ${dados.map((d) => `${d.k} ${formatar(d.v)}${unidade}`).join(", ")}`} />;
}

export const tabelaBarras = (
  dados: ItemBarra[],
  colK: string,
  colV: string,
  formatar: (v: number | null) => string = fmtN,
  unidade = "",
): TabelaGemea => ({
  cabecalhos: [colK, colV],
  linhas: dados.map((d) => [d.k, `${formatar(d.v)}${unidade}`]),
});

/* ------------------------------------------------------------------ *
 * Colunas
 * ------------------------------------------------------------------ */

export function Colunas({
  dados,
  altura = 200,
  rotularTodas = false,
  agora,
  serieExtra,
}: {
  dados: ItemBarra[];
  altura?: number;
  rotularTodas?: boolean;
  /** Chave do período corrente: fica sempre marcada, sem o leitor procurar. */
  agora?: string;
  /**
   * A segunda medida da mesma categoria, lado a lado.
   *
   * Vagas e posições são grandezas diferentes da mesma requisição: uma vaga com
   * doze posições conta como uma no eixo e como doze na necessidade real. Vistas
   * separadas, em duas placas, ninguém cruza; vistas em par, a diferença entre
   * as duas colunas *é* o dado.
   */
  serieExtra?: { nome: string; nomeBase: string; valores: number[] };
}) {
  const p = usePaleta();
  const vazio = !dados.length || dados.every((d) => !d.v);

  const option = useMemo<EChartsOption>(() => {
    const maior = Math.max(...dados.map((d) => d.v), 1);
    const muitas = dados.length > 16;

    const base = {
      type: "bar" as const,
      barMaxWidth: serieExtra ? 15 : 26,
      itemStyle: {
        borderRadius: [4, 4, 0, 0] as [number, number, number, number],
        color: (a: ParamRotulo) =>
          // O período corrente nunca se confunde com os fechados.
          agora && dados[a.dataIndex].k === agora
            ? p.rampa[3]
            // Lado a lado, dois degraus vizinhos da rampa não se distinguem: o
            // par abre a distância entre eles.
            : corDe(dados[a.dataIndex].cor, p, serieExtra ? p.rampa[2] : p.rampa[1]),
      },
      emphasis: { itemStyle: { color: p.foco } },
      label: {
        /* Rotular tudo empasta um eixo de trinta meses. Sem pedido explícito,
           fala só o que muda a leitura: o pico e o período corrente. */
        show: true,
        position: "top" as const,
        color: p.tinta,
        fontSize: TIPO.valor,
        fontFamily: p.fonte,
        fontWeight: 600,
        formatter: (a: ParamRotulo) => {
          const d = dados[a.dataIndex];
          if (rotularTodas || !muitas || d.k === agora || d.v === maior) return fmtN(Number(a.value));
          return "";
        },
      },
      data: dados.map((d) => d.v),
    };

    return {
      animationDuration: 320,
      grid: { left: 46, right: 12, top: 26, bottom: dados.length > 10 ? 46 : 26, containLabel: false },
      tooltip: {
        ...dica(p),
        trigger: "axis",
        axisPointer: { type: "shadow", shadowStyle: { color: p.escuro ? "#ffffff12" : "#0f172a0d" } },
      },
      ...(serieExtra ? { legend: { show: false } } : {}),
      xAxis: eixoCategoria(p, {
        data: dados.map((d) => d.k),
        axisLabel: {
          color: p.tinta2,
          fontSize: TIPO.marca,
          fontFamily: p.fonte,
          hideOverlap: true,
          rotate: dados.length > 10 ? 38 : 0,
        },
      }),
      yAxis: eixoValor(p),
      ...(dados.length > 18
        ? { dataZoom: [{ type: "inside", xAxisIndex: 0, zoomOnMouseWheel: false, moveOnMouseWheel: true }] }
        : {}),
      series: serieExtra
        ? [
            { ...base, name: serieExtra.nomeBase },
            {
              ...base,
              name: serieExtra.nome,
              itemStyle: { borderRadius: [4, 4, 0, 0] as [number, number, number, number], color: p.rampa[0] },
              label: {
                ...base.label,
                formatter: (a: ParamRotulo) => (rotularTodas || !muitas ? fmtN(Number(a.value)) : ""),
              },
              data: serieExtra.valores,
            },
          ]
        : [base],
    };
  }, [dados, p, rotularTodas, agora, serieExtra]);

  if (vazio) return <Vazio />;
  return <Grafico option={option} altura={altura} aria={`Colunas: ${dados.map((d) => `${d.k} ${fmtN(d.v)}`).join(", ")}`} />;
}

/* ------------------------------------------------------------------ *
 * Empilhado
 * ------------------------------------------------------------------ */

export interface Serie {
  nome: string;
  cor: string;
  valores: Record<string, number>;
}

export function Empilhado({
  categorias,
  series,
  proporcional = false,
}: {
  categorias: string[];
  series: Serie[];
  proporcional?: boolean;
}) {
  const p = usePaleta();
  const vazio = !categorias.length || !series.length;

  const altura = Math.min(categorias.length, LINHAS_SEM_ZOOM) * 34 + 16;

  const option = useMemo<EChartsOption>(() => {
    const { largura: wRot, letras } = calha(categorias, 26);
    const totais = categorias.map((c) => series.reduce((t, s) => t + (s.valores[c] ?? 0), 0));

    return {
      animationDuration: 320,
      grid: { left: wRot + 10, right: proporcional ? 14 : 54, top: 6, bottom: 4, containLabel: false },
      tooltip: {
        ...dica(p),
        trigger: "axis",
        axisPointer: { type: "shadow", shadowStyle: { color: p.escuro ? "#ffffff12" : "#0f172a0d" } },
        /* Empilhado com sobrevoo por eixo é o ganho real da troca de motor: o
           leitor vê a composição inteira da categoria de uma vez, em vez de
           caçar segmento por segmento. */
        formatter: (a: unknown) => {
          const linhas = a as Array<{ dataIndex: number; seriesName: string; value: number; color: string }>;
          if (!linhas.length) return "";
          const i = linhas[0].dataIndex;
          const total = totais[i] || 1;
          const corpo = linhas
            .filter((l) => l.value)
            .map(
              (l) =>
                `<div style="display:flex;gap:8px;align-items:center;margin-top:3px">` +
                `<i style="width:9px;height:9px;background:${l.color}"></i>` +
                `<span style="flex:1">${l.seriesName}</span>` +
                `<b>${fmtN(l.value)}${proporcional ? ` · ${fmtPct(l.value / total)}` : ""}</b></div>`,
            )
            .join("");
          return `${categorias[i]} <span style="opacity:.7">(n=${fmtN(totais[i])})</span>${corpo}`;
        },
      },
      xAxis: eixoValor(p, {
        max: proporcional ? 100 : undefined,
        axisLabel: { show: false },
        splitLine: { show: false },
      }),
      yAxis: eixoCategoria(p, {
        inverse: true,
        data: categorias,
        axisLine: { show: false },
        axisLabel: {
          color: p.tinta2,
          fontSize: TIPO.rotulo,
          fontFamily: p.fonte,
          width: wRot,
          formatter: (v: string) => cortar(v, letras),
        },
      }),
      ...(categorias.length > LINHAS_SEM_ZOOM
        ? {
            dataZoom: [
              { type: "inside", yAxisIndex: 0, startValue: 0, endValue: LINHAS_SEM_ZOOM - 1, zoomOnMouseWheel: false, moveOnMouseWheel: true },
            ],
          }
        : {}),
      series: series.map((s) => {
        const cor = corDe(s.cor, p, p.rampa[1]);
        return {
          name: s.nome,
          type: "bar" as const,
          stack: "t",
          barMaxWidth: 20,
          /* A folga de 2px na cor da placa entre segmentos: é ela que faz a
             pilha ler como partes, e não como um borrão degradê. */
          itemStyle: { color: cor, borderColor: p.placa, borderWidth: 1.5 },
          emphasis: { focus: "series" as const },
          label: {
            show: true,
            color: tintaSobre(cor, p),
            fontSize: TIPO.marca,
            fontFamily: p.fonte,
            fontWeight: 600,
            // Segmento estreito não comporta número; o sobrevoo cobre esses.
            formatter: (a: ParamRotulo) => {
              const v = Number(a.value);
              const largo = proporcional ? v >= 14 : v / (Math.max(...totais) || 1) >= 0.1;
              if (!v || !largo) return "";
              return proporcional ? `${Math.round(v)}%` : fmtN(v);
            },
          },
          data: categorias.map((c, i) => {
            const bruto = s.valores[c] ?? 0;
            return proporcional ? ((bruto / (totais[i] || 1)) * 100) : bruto;
          }),
        };
      }),
    };
  }, [categorias, series, proporcional, p]);

  if (vazio) return <Vazio />;
  return <Grafico option={option} altura={altura} aria={`Empilhado por ${categorias.length} categorias`} />;
}

export const tabelaEmpilhada = (
  categorias: string[],
  series: Serie[],
  colK: string,
  proporcional: boolean,
): TabelaGemea => {
  const totais = categorias.map((c) => series.reduce((t, s) => t + (s.valores[c] ?? 0), 0));
  return {
    cabecalhos: [colK, ...series.map((s) => s.nome)],
    linhas: categorias.map((c, i) => [
      proporcional ? `${c} (n=${fmtN(totais[i])})` : c,
      ...series.map((s) =>
        proporcional ? fmtPct((s.valores[c] ?? 0) / (totais[i] || 1)) : fmtN(s.valores[c] ?? 0),
      ),
    ]),
  };
};

/* ------------------------------------------------------------------ *
 * Mediana com faixa p25–p75
 * ------------------------------------------------------------------ */

export interface ItemFaixa {
  k: string;
  v: number;
  p25: number;
  p75: number;
  n: number;
}

/**
 * A faixa interquartil desenhada como haltere.
 *
 * Uma barra até a mediana mente: sugere que o tempo cresce de zero até ali,
 * quando o que existe é uma nuvem de casos entre p25 e p75. O traço mostra a
 * dispersão e a marca mostra o centro — quem tem faixa larga é imprevisível,
 * não necessariamente lento, e essa distinção é a razão da placa existir.
 *
 * É série `custom` porque nenhum tipo pronto do ECharts desenha isto: `boxplot`
 * exigiria os cinco números e desenharia bigodes que não temos.
 */
export function Faixa({ dados }: { dados: ItemFaixa[] }) {
  const p = usePaleta();
  const vazio = !dados.length;

  const altura = Math.min(dados.length, LINHAS_SEM_ZOOM) * 32 + 26;

  const option = useMemo<EChartsOption>(() => {
    const { largura: wRot, letras } = calha(dados.map((d) => d.k), 26);

    return {
      animationDuration: 320,
      grid: { left: wRot + 10, right: 60, top: 6, bottom: 26, containLabel: false },
      tooltip: {
        ...dica(p),
        formatter: (a: unknown) => {
          const d = dados[(a as { dataIndex: number }).dataIndex];
          return (
            `${d.k}<br><b style="font-size:15px">${fmtN(d.v)} dias</b> <span style="opacity:.75">mediana</span>` +
            `<br><span style="opacity:.75">metade dos casos entre ${fmtN(d.p25)} e ${fmtN(d.p75)} · n=${fmtN(d.n)}</span>`
          );
        },
      },
      xAxis: eixoValor(p, { name: "dias", nameLocation: "end", nameTextStyle: { color: p.tinta3, fontSize: TIPO.marca } }),
      yAxis: eixoCategoria(p, {
        inverse: true,
        data: dados.map((d) => d.k),
        axisLine: { show: false },
        axisLabel: {
          color: p.tinta2,
          fontSize: TIPO.rotulo,
          fontFamily: p.fonte,
          width: wRot,
          formatter: (v: string) => cortar(v, letras),
        },
      }),
      ...(dados.length > LINHAS_SEM_ZOOM
        ? {
            dataZoom: [
              { type: "inside", yAxisIndex: 0, startValue: 0, endValue: LINHAS_SEM_ZOOM - 1, zoomOnMouseWheel: false, moveOnMouseWheel: true },
            ],
          }
        : {}),
      series: [
        {
          type: "custom",
          renderItem: (params: RenderParams, api: RenderAPI) => {
            const i = params.dataIndex;
            const d = dados[i];
            const y = api.coord([0, i])[1];
            const x25 = api.coord([d.p25, i])[0];
            const x75 = api.coord([d.p75, i])[0];
            const xMed = api.coord([d.v, i])[0];
            const hFaixa = 9;

            return {
              type: "group",
              children: [
                {
                  // A faixa: onde metade dos casos cai.
                  type: "rect",
                  shape: { x: x25, y: y - hFaixa / 2, width: Math.max(x75 - x25, 1.5), height: hFaixa },
                  style: { fill: p.rampa[1], opacity: p.escuro ? 0.55 : 0.42 },
                },
                {
                  // A mediana: traço cheio, atravessando a faixa.
                  type: "rect",
                  shape: { x: xMed - 1.4, y: y - 11, width: 2.8, height: 22 },
                  style: { fill: p.rampa[2] },
                },
              ],
            };
          },
          label: { show: false },
          data: dados.map((d) => [d.v, d.p25, d.p75]),
        },
        {
          // Série invisível só para pendurar o rótulo do valor na ponta direita.
          type: "bar",
          barWidth: 0,
          itemStyle: { color: "transparent" },
          silent: true,
          label: {
            show: true,
            position: "right",
            distance: 8,
            color: p.tinta,
            fontSize: TIPO.valor,
            fontFamily: p.fonte,
            fontWeight: 600,
            formatter: (a: ParamRotulo) => `${fmtN(dados[a.dataIndex].v)} d`,
          },
          data: dados.map((d) => d.p75),
        },
      ],
    };
  }, [dados, p]);

  if (vazio) return <Vazio />;
  return <Grafico option={option} altura={altura} aria={`Mediana e faixa p25–p75 por ${dados.length} categorias`} />;
}

export const tabelaFaixa = (dados: ItemFaixa[], colK: string): TabelaGemea => ({
  cabecalhos: [colK, "Mediana (d)", "p25", "p75", "n"],
  linhas: dados.map((d) => [d.k, fmtN(d.v), fmtN(d.p25), fmtN(d.p75), fmtN(d.n)]),
});

/* ------------------------------------------------------------------ *
 * Funil
 * ------------------------------------------------------------------ */

export interface NoFunil {
  k: string;
  v: number;
  /** Quantos saem aqui. Acende a etapa quando a perda é a maior da linha. */
  perda: number;
}

/**
 * O funil, desenhado como funil.
 *
 * Antes era uma linha de espessura variável — correto na proporção e mudo na
 * metáfora: quem lê "funil" procura um funil. O trapézio devolve a forma que o
 * nome promete, e a largura continua sendo o volume, então nada se perdeu de
 * rigor. A etapa onde mais gente sai vem acesa em alarme, porque é a única
 * pergunta que esta placa existe para responder.
 */
export function Funil({ nos }: { nos: NoFunil[] }) {
  const p = usePaleta();
  const vazio = nos.length < 2;

  const option = useMemo<EChartsOption>(() => {
    const topo = nos[0]?.v || 1;
    // Sem perda nenhuma não há trecho crítico: um funil vazio não deve acender.
    const maiorPerda = Math.max(...nos.slice(0, -1).map((n) => n.perda), 0);
    const uniforme = nos.every((n) => n.v === nos[0].v);
    const iCritico = maiorPerda > 0 ? nos.findIndex((n, i) => i < nos.length - 1 && n.perda === maiorPerda) : -1;

    return {
      animationDuration: 380,
      tooltip: {
        ...dica(p),
        formatter: (a: unknown) => {
          const i = (a as { dataIndex: number }).dataIndex;
          const n = nos[i];
          const prox = nos[i + 1];
          const passa = prox ? `<br><span style="opacity:.75">avançam ${fmtPct(prox.v / (n.v || 1))} · saem aqui ${fmtN(n.perda)}</span>` : "";
          return `${n.k}<br><b style="font-size:15px">${fmtN(n.v)}</b> <span style="opacity:.75">· ${fmtPct(n.v / topo)} do topo</span>${passa}`;
        },
      },
      series: [
        {
          type: "funnel",
          top: 8,
          bottom: 8,
          left: "8%",
          right: "8%",
          /* A largura sai de uma régua declarada, não do intervalo dos próprios
             dados: assim a etapa lê como fração do topo, e não como posição
             relativa entre a maior e a menor do recorte. */
          min: 0,
          max: nos[0]?.v || 1,
          /* O último segmento afunila por construção no ECharts — é o bico do
             funil. Num recorte onde ninguém saiu ainda, esse bico desenha uma
             perda que não existe. Quando todas as etapas têm o mesmo número não
             há funil: há um tubo, e o piso de largura passa a ser o teto. */
          minSize: uniforme ? "100%" : "22%",
          // `none` respeita a ordem das etapas: o funil é cronológico, não um
          // ranking. Ordenar por valor inventaria um processo que não existe.
          sort: "none",
          gap: 3,
          data: nos.map((n, i) => {
            /* Arredondar, e não truncar: truncando, cinco etapas recebem os
               degraus 0,0,1,2,3 e as duas primeiras — que são os dois maiores
               segmentos do funil — saem da mesma cor. Arredondando, a etapa
               repetida cai no meio, onde os trapézios são menores e a
               diferença importa menos. */
            const degrau = Math.min(3, Math.round((i / Math.max(nos.length - 1, 1)) * 3));
            return {
              name: n.k,
              value: n.v,
              itemStyle: {
                /* A rampa ordinal carrega a posição na esteira, não o juízo.
                   Preencher de vermelho a etapa de maior perda pinta sempre a
                   maior do funil, e diz "abordar é o problema" — quando o que
                   sangra é a passagem dela para a seguinte, não ela. O alarme
                   fica no contorno e no texto: aponta a transição sem
                   reivindicar o volume inteiro. */
                color: p.rampa[degrau],
                borderColor: i === iCritico ? p.alarme : "transparent",
                borderWidth: i === iCritico ? 2.5 : 0,
              },
              label: { color: p.sobreRampa[degrau] },
            };
          }),
          label: {
            show: true,
            position: "inside",
            fontSize: TIPO.rotulo,
            fontFamily: p.fonte,
            fontWeight: 600,
            // Na etapa crítica o rótulo diz quanto se perde na passagem. É a
            // única pergunta que esta placa existe para responder, e ela não
            // pode depender de sobrevoo.
            formatter: (a: ParamRotulo) =>
              a.dataIndex === iCritico
                ? `${a.name}  ${fmtN(Number(a.value))}   −${fmtN(nos[a.dataIndex].perda)} na passagem`
                : `${a.name}  ${fmtN(Number(a.value))}`,
          },
          emphasis: { label: { fontSize: TIPO.destaque } },
        },
      ],
    };
  }, [nos, p]);

  if (vazio) return <Vazio />;
  return (
    <Grafico
      option={option}
      altura={Math.max(210, nos.length * 46)}
      aria={`Funil: ${nos.map((n) => `${n.k} ${fmtN(n.v)}`).join(", ")}`}
    />
  );
}

export const tabelaFunil = (nos: NoFunil[]): TabelaGemea => {
  const topo = nos[0]?.v || 1;
  return {
    cabecalhos: ["Etapa", "Candidatos", "% do topo", "Avançam", "Saem aqui"],
    linhas: nos.map((n, i) => [
      n.k,
      fmtN(n.v),
      fmtPct(n.v / topo),
      nos[i + 1] ? fmtPct(nos[i + 1].v / (n.v || 1)) : "—",
      nos[i + 1] ? fmtN(n.perda) : "—",
    ]),
  };
};
