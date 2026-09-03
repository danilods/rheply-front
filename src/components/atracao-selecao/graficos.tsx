"use client";

/**
 * Instrumentos do quadro sinóptico.
 *
 * A cor do dado vive presa dentro da moldura da placa. Fora dela, a interface é
 * tinta sobre cinza, e cor significa estado anormal. É essa quarentena que
 * impede o painel de virar um mosaico onde tudo compete.
 *
 * Marcas finas, folga de 2px na cor da superfície entre segmentos, grade em fio
 * sólido, rótulo direto só onde ele muda a leitura. Cada instrumento devolve
 * também a tabela equivalente: nenhum valor depende de passar o mouse.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";

import { fmtN, fmtPct } from "@/lib/rs/metricas";

/* ------------------------------------------------------------------ *
 * Medição e dica
 * ------------------------------------------------------------------ */

/** Largura real do contêiner: o viewBox usa pixels, então o texto não escala. */
function useLargura<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [largura, setLargura] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const medir = () => setLargura(el.clientWidth);
    medir();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, largura };
}

interface Dica {
  rotulo: string;
  valor: string;
  x: number;
  y: number;
}

function useDica() {
  const [dica, setDica] = useState<Dica | null>(null);
  const mostrar =
    (rotulo: string, valor: string) => (e: React.MouseEvent | React.FocusEvent) => {
      const caixa = (e.currentTarget as SVGElement).getBoundingClientRect();
      setDica({ rotulo, valor, x: caixa.left + caixa.width / 2, y: caixa.top });
    };
  return { dica, mostrar, esconder: () => setDica(null) };
}

function Dica({ dica }: { dica: Dica | null }) {
  if (!dica) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="rs-dica"
      style={{ left: dica.x, top: dica.y - 10, transform: "translate(-50%, -100%)" }}
    >
      {dica.rotulo}
      <b>{dica.valor}</b>
    </div>
  );
}

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
}: {
  titulo: string;
  nota?: string;
  span?: string;
  children: ReactNode;
  tabela?: TabelaGemea;
  legenda?: Array<{ nome: string; cor: string }>;
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
 * Formas
 * ------------------------------------------------------------------ */

/** Barra horizontal: base reta, ponta do dado arredondada em 4px. */
function barraH(x: number, y: number, w: number, h: number): string {
  const r = Math.min(4, Math.max(0, w));
  if (w <= r) return `M${x} ${y} h${Math.max(w, 1)} v${h} h${-Math.max(w, 1)} Z`;
  return `M${x} ${y} H${x + w - r} a${r} ${r} 0 0 1 ${r} ${r} V${y + h - r} a${r} ${r} 0 0 1 ${-r} ${r} H${x} Z`;
}

/** Coluna vertical: base reta, topo arredondado. */
function coluna(x: number, y: number, w: number, h: number): string {
  const r = Math.min(4, Math.max(0, h));
  if (h <= r) return `M${x} ${y} h${w} v${Math.max(h, 1)} h${-w} Z`;
  return `M${x} ${y + h} V${y + r} a${r} ${r} 0 0 1 ${r} ${-r} H${x + w - r} a${r} ${r} 0 0 1 ${r} ${r} V${y + h} Z`;
}

/**
 * Tinta que vai por cima de um segmento colorido.
 *
 * Não se adivinha por luminância em tempo de execução: cada preenchimento do
 * sistema já vem com a sua tinta declarada em globals.css, e as duas trocam
 * juntas quando o tema troca. Adivinhar daria certo num tema e erraria no
 * outro, porque no escuro o preenchimento claro é que pede tinta escura.
 */
const TINTA_SOBRE: ReadonlyArray<[string, string]> = [
  ["--rs-rampa-1", "var(--rh-sobre-rampa-1)"],
  ["--rs-rampa-2", "var(--rh-sobre-rampa-2)"],
  ["--rs-rampa-3", "var(--rh-sobre-rampa-3)"],
  ["--rs-rampa-4", "var(--rh-sobre-rampa-4)"],
  ["--rs-serie-nula", "var(--rh-sobre-nulo)"],
  ["--rs-alarme", "var(--rh-sobre-alarme)"],
  ["--rs-atencao", "var(--rh-sobre-atencao)"],
  ["--rs-processo", "var(--rh-sobre-processo)"],
];
const tintaSobre = (cor: string) =>
  TINTA_SOBRE.find(([token]) => cor.includes(token))?.[1] ?? "var(--rh-sobre-rampa-3)";

/**
 * Corte de rótulo que preserva o que distingue.
 *
 * "Promotor(a) de Vendas · Belém" e "Promotor(a) de Vendas · Macapá" cortados
 * pela ponta viram duas linhas idênticas, e duas linhas idênticas num quadro
 * de operação são pior que nenhuma. Num rótulo composto o meio é o que cede.
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

/**
 * Escala do eixo.
 *
 * O passo é que precisa ser redondo, não o teto: dividir um teto redondo por
 * quatro devolve 0 · 38 · 75 · 113 · 150, que ninguém lê de longe. Escolhendo
 * primeiro um passo de 1, 2, 2,5 ou 5 vezes uma potência de dez, o teto sai
 * redondo por consequência e as marcas caem em números inteiros.
 */
function escala(maiorValor: number, alvo = 5): { teto: number; marcas: number[] } {
  const valor = Math.max(maiorValor, 1);
  const bruto = valor / alvo;
  const p = Math.pow(10, Math.floor(Math.log10(bruto)));
  const passo = [1, 2, 2.5, 5, 10].map((m) => m * p).find((s) => s >= bruto) ?? 10 * p;
  const teto = Math.ceil(valor / passo) * passo;
  const marcas: number[] = [];
  for (let v = 0; v <= teto + passo / 1000; v += passo) marcas.push(Math.round(v * 1000) / 1000);
  return { teto, marcas };
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
  const { ref, largura } = useLargura<HTMLDivElement>();
  const { dica, mostrar, esconder } = useDica();

  const corpo = (() => {
    if (!largura || !dados.length || dados.every((d) => !d.v)) return null;
    // Numa placa estreita o rótulo precisa de uma fatia maior, senão dois cargos
    // do mesmo prefixo viram a mesma linha cortada.
    const wRot = Math.min(300, Math.max(80, Math.round(largura * (largura < 470 ? 0.46 : 0.36))));
    const x0 = wRot + 12;
    const wPlot = Math.max(40, largura - x0 - 56);
    const hBarra = 15;
    const passo = hBarra + 12;
    const hLim = limiar ? 17 : 0;
    const altura = dados.length * passo + 6 + hLim;
    const teto = max ?? Math.max(...dados.map((d) => d.v), 1);

    return (
      <svg viewBox={`0 0 ${largura} ${altura}`} width="100%" height={altura} role="img">
        {limiar && limiar.valor <= teto
          ? (() => {
              const x = x0 + (wPlot * limiar.valor) / teto;
              return (
                <g key="limiar">
                  <line className="rs-g-limiar" x1={x} y1={0} x2={x} y2={dados.length * passo - 5} />
                  <text
                    className="rs-t-limiar"
                    x={x}
                    y={altura - 3}
                    textAnchor={x > largura * 0.6 ? "end" : "start"}
                  >
                    {limiar.rotulo}
                  </text>
                </g>
              );
            })()
          : null}

        {dados.map((d, i) => {
          const y = i * passo;
          const w = (wPlot * d.v) / teto;
          const fraca = destaque ? !destaque.has(d.k) : false;
          const texto = `${formatar(d.v)}${unidade}${d.extra ? ` · ${d.extra}` : ""}`;
          return (
            <g key={d.k}>
              <text className="rs-t-rotulo" x={wRot} y={y + hBarra - 2} textAnchor="end">
                {cortar(d.k, Math.floor(wRot / 6.3))}
              </text>
              <path
                d={barraH(x0, y, w, hBarra)}
                className={fraca ? "rs-mk rs-mk--fraca" : "rs-mk"}
                style={d.cor ? { fill: d.cor } : undefined}
                tabIndex={dados.length <= 16 ? 0 : -1}
                role="img"
                aria-label={`${d.k}: ${texto}`}
                onMouseEnter={mostrar(d.k, texto)}
                onMouseLeave={esconder}
                onFocus={mostrar(d.k, texto)}
                onBlur={esconder}
              />
              <text className="rs-t-valor" x={x0 + w + 7} y={y + hBarra - 2}>
                {formatar(d.v)}
                {unidade}
              </text>
            </g>
          );
        })}
      </svg>
    );
  })();

  return (
    <div ref={ref} className="rs-grafico">
      {corpo ?? <Vazio />}
      <Dica dica={dica} />
    </div>
  );
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
}: {
  dados: ItemBarra[];
  altura?: number;
  rotularTodas?: boolean;
  /** Chave do período corrente: fica sempre marcada, sem o leitor procurar. */
  agora?: string;
}) {
  const { ref, largura } = useLargura<HTMLDivElement>();
  const { dica, mostrar, esconder } = useDica();

  const corpo = (() => {
    if (!largura || !dados.length || dados.every((d) => !d.v)) return null;
    const esq = 40;
    const dir = 10;
    const topo = 20;
    const base = 30;
    const wPlot = Math.max(40, largura - esq - dir);
    const hPlot = altura - topo - base;
    const { teto, marcas } = escala(Math.max(...dados.map((d) => d.v), 1));
    const vaga = wPlot / dados.length;
    const wCol = Math.min(26, Math.max(5, vaga - 9));
    const maior = Math.max(...dados.map((d) => d.v));
    /* O rótulo de categoria rareia quando não cabe no vão, não quando as
       categorias passam de vinte: oito meses num telefone se encavalam tanto
       quanto trinta num monitor. A paridade escolhida preserva o período
       corrente, que é o único que nunca pode sumir. */
    const iAgora = agora ? dados.findIndex((d) => d.k === agora) : -1;
    const larguraRotulo = Math.max(...dados.map((d) => Math.min(d.k.length, 11))) * 6.2;
    const rarear = larguraRotulo + 6 > vaga;
    const paridade = rarear && iAgora >= 0 ? iAgora % 2 : 0;

    return (
      <svg viewBox={`0 0 ${largura} ${altura}`} width="100%" height={altura} role="img">
        {marcas.map((t) => {
          const y = topo + hPlot - (hPlot * t) / teto;
          return (
            <g key={t}>
              <line className="rs-g-fio" x1={esq} y1={y} x2={largura - dir} y2={y} />
              <text className="rs-t-marca" x={esq - 7} y={y + 3.5} textAnchor="end">
                {fmtN(t)}
              </text>
            </g>
          );
        })}

        {dados.map((d, i) => {
          const x = esq + vaga * i + (vaga - wCol) / 2;
          const h = (hPlot * d.v) / teto;
          const y = topo + hPlot - h;
          const eAgora = agora === d.k;
          return (
            <g key={d.k}>
              {eAgora ? (
                <rect
                  x={esq + vaga * i}
                  y={topo - 6}
                  width={vaga}
                  height={hPlot + 6}
                  fill="var(--rs-placa-funda)"
                />
              ) : null}
              <path
                d={coluna(x, y, wCol, h)}
                className="rs-mk"
                style={d.cor ? { fill: d.cor } : undefined}
                tabIndex={dados.length <= 16 ? 0 : -1}
                role="img"
                aria-label={`${d.k}: ${fmtN(d.v)}`}
                onMouseEnter={mostrar(d.k, fmtN(d.v))}
                onMouseLeave={esconder}
                onFocus={mostrar(d.k, fmtN(d.v))}
                onBlur={esconder}
              />
              {rotularTodas || d.v === maior || eAgora ? (
                <text className="rs-t-valor" x={x + wCol / 2} y={y - 6} textAnchor="middle">
                  {fmtN(d.v)}
                </text>
              ) : null}
              {!rarear || i % 2 === paridade ? (
                <text
                  className="rs-t-rotulo"
                  x={x + wCol / 2}
                  y={altura - 12}
                  textAnchor="middle"
                  style={eAgora ? { fill: "var(--rs-tinta)", fontWeight: 600 } : undefined}
                >
                  {cortar(d.k, 11)}
                </text>
              ) : null}
            </g>
          );
        })}
        <line className="rs-g-eixo" x1={esq} y1={topo + hPlot} x2={largura - dir} y2={topo + hPlot} />
        {agora ? (
          <text className="rs-t-marca" x={largura - dir} y={altura - 1} textAnchor="end">
            período corrente marcado
          </text>
        ) : null}
      </svg>
    );
  })();

  return (
    <div ref={ref} className="rs-grafico">
      {corpo ?? <Vazio />}
      <Dica dica={dica} />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Barras empilhadas
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
  const { ref, largura } = useLargura<HTMLDivElement>();
  const { dica, mostrar, esconder } = useDica();

  const corpo = (() => {
    if (!largura || !categorias.length) return null;
    const wRot = Math.min(260, Math.max(74, Math.round(largura * 0.30)));
    const x0 = wRot + 12;
    const wPlot = Math.max(40, largura - x0 - (proporcional ? 12 : 54));
    const hBarra = 18;
    const passo = hBarra + 12;
    const altura = categorias.length * passo + 4;
    const totais = categorias.map((c) => series.reduce((t, s) => t + (s.valores[c] ?? 0), 0));
    const teto = proporcional ? 1 : Math.max(...totais, 1);

    return (
      <svg viewBox={`0 0 ${largura} ${altura}`} width="100%" height={altura} role="img">
        {categorias.map((c, i) => {
          const y = i * passo;
          const total = totais[i] || 1;
          let x = x0;
          return (
            <g key={c}>
              {series.map((s) => {
                const bruto = s.valores[c] ?? 0;
                if (!bruto) return null;
                const p = proporcional ? bruto / total : bruto;
                const seg = (wPlot * p) / teto;
                // Folga de 2px na cor da superfície: o branco separa, não o traço.
                const w = Math.max(0, seg - 2);
                const atual = x;
                x += seg;
                if (w <= 0.4) return null;
                return (
                  <g key={s.nome}>
                    <rect
                      x={atual}
                      y={y}
                      width={w}
                      height={hBarra}
                      fill={s.cor}
                      onMouseEnter={mostrar(
                        `${c} · ${s.nome}`,
                        `${fmtN(bruto)} (${fmtPct(bruto / total)})`,
                      )}
                      onMouseLeave={esconder}
                    />
                    {(() => {
                      const marca = proporcional ? fmtPct(bruto / total) : fmtN(bruto);
                      return w > marca.length * 7.4 + 10;
                    })() ? (
                      <text
                        className="rs-t-valor"
                        style={{ fill: tintaSobre(s.cor) }}
                        x={atual + w / 2}
                        y={y + hBarra - 5}
                        textAnchor="middle"
                      >
                        {proporcional ? fmtPct(bruto / total) : fmtN(bruto)}
                      </text>
                    ) : null}
                  </g>
                );
              })}
              <text className="rs-t-rotulo" x={wRot} y={y + hBarra - 4} textAnchor="end">
                {cortar(c, Math.floor(wRot / 6.3))}
              </text>
              {!proporcional ? (
                <text
                  className="rs-t-valor"
                  x={x0 + (wPlot * totais[i]) / teto + 7}
                  y={y + hBarra - 4}
                >
                  {fmtN(totais[i])}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    );
  })();

  return (
    <div ref={ref} className="rs-grafico">
      {corpo ?? <Vazio />}
      <Dica dica={dica} />
    </div>
  );
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

export function Faixa({ dados }: { dados: ItemFaixa[] }) {
  const { ref, largura } = useLargura<HTMLDivElement>();
  const { dica, mostrar, esconder } = useDica();

  const corpo = (() => {
    if (!largura || !dados.length) return null;
    const wRot = Math.min(160, Math.max(80, Math.round(largura * 0.3)));
    const x0 = wRot + 12;
    const wPlot = Math.max(40, largura - x0 - 58);
    const passo = 27;
    const altura = dados.length * passo + 24;
    const { teto, marcas } = escala(Math.max(...dados.map((d) => d.p75 || d.v), 1));
    const px = (v: number) => x0 + (wPlot * Math.min(v, teto)) / teto;

    return (
      <svg viewBox={`0 0 ${largura} ${altura}`} width="100%" height={altura} role="img">
        {marcas.map((t) => (
          <g key={t}>
            <line className="rs-g-fio" x1={px(t)} y1={0} x2={px(t)} y2={dados.length * passo - 7} />
            <text className="rs-t-marca" x={px(t)} y={altura - 7} textAnchor="middle">
              {fmtN(t)}
            </text>
          </g>
        ))}
        {dados.map((d, i) => {
          const y = i * passo + 10;
          const texto = `mediana ${fmtN(d.v)} d · p25 ${fmtN(d.p25)} · p75 ${fmtN(d.p75)} · n=${fmtN(d.n)}`;
          return (
            <g key={d.k}>
              <text className="rs-t-rotulo" x={wRot} y={y + 4} textAnchor="end">
                {cortar(d.k, Math.floor(wRot / 6.3))}
              </text>
              <rect
                x={px(d.p25)}
                y={y - 3.5}
                width={Math.max(2, px(d.p75) - px(d.p25))}
                height={7}
                fill="var(--rs-rampa-1)"
                onMouseEnter={mostrar(d.k, texto)}
                onMouseLeave={esconder}
              />
              <circle
                cx={px(d.v)}
                cy={y}
                r={5}
                fill="var(--rs-rampa-4)"
                stroke="var(--rs-placa)"
                strokeWidth={2}
                tabIndex={0}
                role="img"
                aria-label={`${d.k}: ${texto}`}
                onMouseEnter={mostrar(d.k, texto)}
                onMouseLeave={esconder}
                onFocus={mostrar(d.k, texto)}
                onBlur={esconder}
              />
              <text className="rs-t-valor" x={largura - 4} y={y + 4} textAnchor="end">
                {fmtN(d.v)} d
              </text>
            </g>
          );
        })}
      </svg>
    );
  })();

  return (
    <div ref={ref} className="rs-grafico">
      {corpo ?? <Vazio />}
      <Dica dica={dica} />
    </div>
  );
}

export const tabelaFaixa = (dados: ItemFaixa[], colK: string): TabelaGemea => ({
  cabecalhos: [colK, "Mediana (d)", "p25", "p75", "n"],
  linhas: dados.map((d) => [d.k, fmtN(d.v), fmtN(d.p25), fmtN(d.p75), fmtN(d.n)]),
});

/* ------------------------------------------------------------------ *
 * Unifilar: o funil como uma linha de fluxo
 * ------------------------------------------------------------------ */

export interface NoUnifilar {
  k: string;
  v: number;
  /** Quantos saem aqui. Acende o nó quando a perda é a maior da linha. */
  perda: number;
}

/**
 * O momento do painel. Uma linha só, da esquerda para a direita, com a
 * espessura carregando o volume e o nó aceso exatamente onde mais se perde.
 * É o único lugar onde o diagrama literal aparece, porque é o único lugar do
 * produto onde existe fluxo de verdade.
 */
export function Unifilar({ nos }: { nos: NoUnifilar[] }) {
  const { ref, largura } = useLargura<HTMLDivElement>();
  const { dica, mostrar, esconder } = useDica();

  const corpo = (() => {
    if (!largura || nos.length < 2) return null;
    /* A altura acompanha a largura: no projetor a placa fica ao lado de uma
       lista de alarmes bem mais alta, e um instrumento de altura fixa deixa
       um vão de painel vazio justamente na leitura de abertura. */
    const altura = Math.round(Math.min(220, Math.max(150, 150 + (largura - 620) * 0.13)));
    const esq = 8;
    const dir = 8;
    const wPlot = Math.max(120, largura - esq - dir);
    const vao = wPlot / (nos.length - 1);
    const eixoY = Math.round(altura * 0.44);
    const maior = nos[0].v || 1;
    /* A espessura acompanha a altura da placa: é o traço que cresce, não o ar
       em volta dele. */
    const espMax = Math.round(altura * 0.22);
    const espessura = (v: number) => Math.max(2, Math.round((v / maior) * espMax));
    const piorPerda = Math.max(...nos.slice(0, -1).map((n) => n.perda));

    return (
      <svg viewBox={`0 0 ${largura} ${altura}`} width="100%" height={altura} role="img">
        {nos.slice(0, -1).map((n, i) => {
          const x1 = esq + vao * i;
          const x2 = esq + vao * (i + 1);
          const e = espessura(nos[i + 1].v);
          const critico = n.perda === piorPerda;
          const conversao = n.v ? nos[i + 1].v / n.v : 0;
          return (
            <g key={`t${i}`}>
              <rect
                x={x1}
                y={eixoY - e / 2}
                width={x2 - x1}
                height={e}
                fill={critico ? "var(--rs-alarme)" : "var(--rs-rampa-2)"}
                opacity={critico ? 1 : 0.9}
                onMouseEnter={mostrar(
                  `${n.k} até ${nos[i + 1].k}`,
                  `${fmtPct(conversao)} avançam · ${fmtN(n.perda)} saem`,
                )}
                onMouseLeave={esconder}
              />
              <text
                className="rs-t-nota"
                x={(x1 + x2) / 2}
                y={eixoY + e / 2 + 20}
                textAnchor="middle"
                style={critico ? { fill: "var(--rs-alarme)", fontWeight: 600 } : undefined}
              >
                {fmtPct(conversao)}
              </text>
              <text
                className="rs-t-nota"
                x={(x1 + x2) / 2}
                y={eixoY + e / 2 + 36}
                textAnchor="middle"
              >
                −{fmtN(n.perda)}
              </text>
            </g>
          );
        })}

        {nos.map((n, i) => {
          const x = esq + vao * i;
          return (
            <g key={n.k}>
              <circle
                cx={x}
                cy={eixoY}
                r={9}
                fill="var(--rs-placa)"
                stroke="var(--rs-tinta)"
                strokeWidth={2}
                tabIndex={0}
                role="img"
                aria-label={`${n.k}: ${fmtN(n.v)} candidatos, ${fmtPct(n.v / maior)} do topo`}
                onMouseEnter={mostrar(n.k, `${fmtN(n.v)} candidatos · ${fmtPct(n.v / maior)} do topo`)}
                onMouseLeave={esconder}
                onFocus={mostrar(n.k, `${fmtN(n.v)} candidatos · ${fmtPct(n.v / maior)} do topo`)}
                onBlur={esconder}
              />
              <text
                className="rs-t-valor"
                x={x}
                y={eixoY - espMax / 2 - 13}
                textAnchor="middle"
                style={{ fontSize: 18 }}
              >
                {fmtN(n.v)}
              </text>
            </g>
          );
        })}
      </svg>
    );
  })();

  return (
    <div ref={ref} className="rs-grafico">
      {/* Os rótulos de etapa vivem em HTML, não no viewBox: são cinco nomes
          longos em versalete com entreletra, e só o navegador sabe quebrá-los
          na largura de cada vão sem que um invada o outro. */}
      {corpo ? (
        <div className="rs-unifilar__rotulos" style={{ ["--rs-vaos" as string]: nos.length - 1 }}>
          {nos.map((n, i) => {
            const ultimo = i === nos.length - 1;
            return (
              <span
                key={n.k}
                className="rs-unifilar__rotulo"
                style={{
                  left: `${(i / (nos.length - 1)) * 100}%`,
                  transform: i === 0 ? "none" : ultimo ? "translateX(-100%)" : "translateX(-50%)",
                  textAlign: i === 0 ? "left" : ultimo ? "right" : "center",
                }}
              >
                {n.k}
              </span>
            );
          })}
        </div>
      ) : null}
      {corpo ?? <Vazio />}
      <Dica dica={dica} />
    </div>
  );
}

export const tabelaUnifilar = (nos: NoUnifilar[]): TabelaGemea => {
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
