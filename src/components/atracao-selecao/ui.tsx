"use client";

/**
 * Peças do quadro: régua de filtros, faixa de leituras, barra de estado,
 * achados e a tabela que prova.
 *
 * Nada aqui é cartão. Um painel de operação separa por fio e alinha por régua;
 * empilhar caixas com sombra faz tudo competir pela mesma atenção, que foi
 * exatamente o problema da versão anterior.
 */

import { useMemo, useState, type ReactNode } from "react";

import { fmtN } from "@/lib/rs/metricas";
import { useAtracaoSelecao, type Filtros } from "@/store/atracao-selecao";

/* ------------------------------------------------------------------ *
 * Leituras de instrumento
 * ------------------------------------------------------------------ */

export interface Leitura {
  rotulo: string;
  valor: ReactNode;
  unidade?: string;
  /** O que o número significa. Sem isso ele não vira decisão. */
  contexto?: ReactNode;
  /**
   * Ícone do cartão. Vem do vocabulário abaixo, não de qualquer desenho: um
   * ícone que só enfeita ocupa o lugar onde o olho procura estado.
   */
  icone?: keyof typeof ICONES;
  /**
   * Estado da leitura. Muda a cor do ícone e, onde faz diferença, o próprio
   * desenho — é isto que torna o ícone dinâmico em vez de ilustrativo.
   */
  tom?: Severidade;
  /**
   * A dispersão por trás da mediana, desenhada.
   *
   * Uma mediana sozinha esconde o que mais importa numa operação: se a metade
   * do meio dos casos cabe em cinco dias ou em sessenta. O número já vinha no
   * contexto, em texto — "9 em cada 10 em até 56 d" —, e texto obriga a
   * imaginar a régua. A tira desenha a régua.
   */
  distribuicao?: { p25: number; mediana: number; p75: number; p90: number; teto: number };
  /**
   * Quanto do todo este número representa.
   *
   * "46 posições abertas" responde metade da pergunta; "de 128 solicitadas"
   * responde a outra metade, e a barra responde as duas de uma vez.
   */
  parte?: { valor: number; total: number };
}

/**
 * Ícones do quadro, desenhados no mesmo traço dos instrumentos.
 *
 * Traço de 1,6px, canto reto, 18px de caixa: o mesmo peso da tipografia
 * condensada ao lado. Vêm daqui e não de uma biblioteca porque o resto do
 * painel recusa arredondamento, e um conjunto arredondado no meio de placas
 * retas lê como peça de outro sistema.
 */
const ICONES = {
  requisicao: "M4 3h8l3 3v10H4V3Z M11 3v3h3",
  posicao: "M3 8h5v7H3V8Z M8 4h5v11H8V4Z M13 10h3v5h-3v-5Z",
  relogio: "M9 2.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Z M9 5.5V9l2.5 2",
  etapa: "M2.5 9h4l2-4 2 8 2-4h2",
  ausencia: "M6.5 6.5 11.5 11.5 M11.5 6.5 6.5 11.5 M9 2.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Z",
  espera: "M5 2.5h8 M5 15.5h8 M5 2.5c0 4 8 6 8 6s-8 2-8 6",
  pessoa: "M9 3a2.6 2.6 0 1 0 0 5.2A2.6 2.6 0 0 0 9 3Z M3.5 15.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5",
  alerta: "M9 2.5 16 15H2L9 2.5Z M9 7v4 M9 12.8v.2",
  dinheiro: "M9 3v12 M12 6c0-1.4-1.3-2-3-2s-3 .6-3 2 1.3 2 3 2 3 .6 3 2-1.3 2-3 2-3-.6-3-2",
} as const;

const TOM_ICONE: Record<Severidade, string> = {
  alarme: "var(--rs-alarme)",
  atencao: "var(--rs-atencao)",
  processo: "var(--rs-processo)",
  normal: "var(--rs-tinta-3)",
};

/**
 * Os cartões de leitura. Cada um é uma peça fechada, e o rótulo reserva duas
 * linhas mesmo quando ocupa uma, para que os números parem na mesma altura e a
 * comparação aconteça no olho, sem ler.
 *
 * Cartão aqui não é canto redondo com sombra: é superfície própria com fio de
 * topo, o mesmo vocabulário das placas de instrumento. Use isto para leituras
 * independentes; quando os números particionam um mesmo todo, a peça certa é a
 * BarraEstado, que os mostra como uma barra e não como peças soltas.
 */
export function FaixaLeituras({ itens }: { itens: Leitura[] }) {
  return (
    <div className="rs-cartoes rs-reassenta">
      {itens.map((i) => (
        <div key={i.rotulo} className="rs-cartao">
          <p className="rs-rotulo rs-cartao__topo">
            {i.icone ? (
              <svg
                aria-hidden
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                stroke={TOM_ICONE[i.tom ?? "normal"]}
                strokeWidth="1.6"
                strokeLinecap="square"
                strokeLinejoin="miter"
              >
                <path d={ICONES[i.icone]} />
              </svg>
            ) : null}
            <span>{i.rotulo}</span>
          </p>
          <p className="rs-leitura">
            {i.valor}
            {i.unidade ? <span className="rs-unidade">{i.unidade}</span> : null}
          </p>
          {i.distribuicao && i.distribuicao.teto > 0 ? (
            <Dispersao {...i.distribuicao} />
          ) : null}
          {i.parte && i.parte.total > 0 ? (
            <div
              className="rs-micro"
              role="img"
              aria-label={`${i.parte.valor} de ${i.parte.total}`}
            >
              <div
                className="rs-micro__parte"
                style={{ width: `${Math.min(100, (i.parte.valor / i.parte.total) * 100)}%` }}
              />
            </div>
          ) : null}
          {i.contexto ? <p className="rs-estado__prazo">{i.contexto}</p> : null}
        </div>
      ))}
    </div>
  );
}

/**
 * A tira de dispersão: p25–p75 preenchidos, mediana em traço cheio, p90 marcado.
 *
 * Divs posicionados por porcentagem, e não SVG com viewBox: um viewBox esticado
 * na largura do cartão esticaria junto a espessura do traço da mediana, e a
 * mediana é justamente a marca que não pode engordar.
 */
function Dispersao({
  p25,
  mediana: med,
  p75,
  p90,
  teto,
}: {
  p25: number;
  mediana: number;
  p75: number;
  p90: number;
  teto: number;
}) {
  const pc = (v: number) => Math.max(0, Math.min(100, (v / teto) * 100));
  const a = pc(p25);
  const b = pc(p75);
  return (
    <div
      className="rs-micro"
      role="img"
      aria-label={`metade dos casos entre ${p25} e ${p75}, mediana ${med}, nove em cada dez até ${p90}`}
    >
      <div className="rs-micro__faixa" style={{ left: `${a}%`, width: `${Math.max(b - a, 1)}%` }} />
      <div className="rs-micro__p90" style={{ left: `${pc(p90)}%` }} />
      <div className="rs-micro__mediana" style={{ left: `${pc(med)}%` }} />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Barra de estado
 * ------------------------------------------------------------------ */

export type Severidade = "alarme" | "atencao" | "processo" | "normal";

export interface Classe {
  severidade: Severidade;
  /** A palavra. A cor nunca informa sozinha. */
  palavra: string;
  contagem: number;
  /** O prazo ou a régua da classe. */
  prazo: string;
}

const FORMA: Record<Severidade, string> = {
  alarme: "rs-marca--alarme",
  atencao: "rs-marca--atencao",
  processo: "rs-marca--processo",
  normal: "rs-marca--normal",
};

/**
 * As classes com contagem, palavra e prazo. Cada uma tem forma própria antes de
 * ter cor: quadrado é alarme, losango é atenção, círculo cheio é movimento e
 * círculo vazado é normal. Quem não distingue as cores continua lendo o quadro.
 */
export function BarraEstado({ classes }: { classes: Classe[] }) {
  return (
    <div className="rs-estados rs-reassenta">
      {classes.map((c) => (
        <div key={c.palavra} className={`rs-estado rs-estado--${c.severidade}`}>
          <div className="rs-estado__topo">
            <span aria-hidden className={`rs-marca ${FORMA[c.severidade]}`} />
            <span className="rs-rotulo" style={{ color: "inherit" }}>
              {c.palavra}
            </span>
          </div>
          <p className="rs-leitura rs-leitura--peq rs-estado__valor">{fmtN(c.contagem)}</p>
          <p className="rs-estado__prazo" style={{ marginTop: 4 }}>
            {c.prazo}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Etiqueta
 * ------------------------------------------------------------------ */

export function Etiqueta({
  severidade = "normal",
  children,
}: {
  severidade?: Severidade;
  children: ReactNode;
}) {
  return (
    <span className={`rs-etiqueta rs-etiqueta--${severidade}`}>
      <span aria-hidden className={`rs-marca ${FORMA[severidade]}`} />
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * Régua de filtros
 * ------------------------------------------------------------------ */

export interface CampoFiltro {
  chave: keyof Filtros;
  rotulo: string;
  opcoes: string[];
}

function Seletor({
  id,
  rotulo,
  valor,
  opcoes,
  aoMudar,
}: {
  id: string;
  rotulo: string;
  valor: string;
  opcoes: Array<{ v: string; r: string }>;
  aoMudar: (v: string) => void;
}) {
  return (
    <div className="rs-campo">
      <label className="rs-rotulo" htmlFor={id}>
        {rotulo}
      </label>
      <select id={id} value={valor} onChange={(e) => aoMudar(e.target.value)}>
        {opcoes.map((o) => (
          <option key={o.v} value={o.v}>
            {o.r}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Regua({
  campos,
  meses,
  contagem,
  unidade,
}: {
  campos: CampoFiltro[];
  meses?: Array<{ v: string; r: string }>;
  contagem: { visiveis: number; total: number };
  unidade: string;
}) {
  const { filtros, definirFiltro, limparFiltros } = useAtracaoSelecao();
  const algumAtivo = Object.values(filtros).some(Boolean);

  return (
    <div className="rs-regua">
      {meses?.length ? (
        <Seletor
          id="rs-periodo"
          rotulo="Período"
          valor={filtros.periodo}
          opcoes={[{ v: "", r: "Tudo" }, ...meses]}
          aoMudar={(v) => definirFiltro("periodo", v)}
        />
      ) : null}

      {campos.map((c) => (
        <Seletor
          key={c.chave}
          id={`rs-${c.chave}`}
          rotulo={c.rotulo}
          valor={filtros[c.chave]}
          opcoes={[{ v: "", r: "Todos" }, ...c.opcoes.map((v) => ({ v, r: v }))]}
          aoMudar={(v) => definirFiltro(c.chave, v)}
        />
      ))}

      {algumAtivo ? (
        <button type="button" className="rs-botao" onClick={limparFiltros}>
          Limpar
        </button>
      ) : null}

      <p className="rs-contagem">
        <b>{fmtN(contagem.visiveis)}</b> de {fmtN(contagem.total)} {unidade}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Achados
 * ------------------------------------------------------------------ */

/** Ênfase dentro de um achado. */
export function Forte({ children }: { children: ReactNode }) {
  return <b style={{ color: "var(--rs-tinta)", fontWeight: 600 }}>{children}</b>;
}

/**
 * Os achados são recalculados a cada filtro. O painel estático que originou este
 * módulo precisava avisar em rodapé que os insights não acompanhavam o recorte.
 */
export function Achados({ itens }: { itens: ReactNode[] }) {
  if (!itens.length) {
    return (
      <section className="rs-placa rs-c12">
        <h2 className="rs-cabeca">Leitura</h2>
        <p className="rs-sub" style={{ margin: 0 }}>
          Não há registros suficientes para uma leitura com este recorte.
        </p>
      </section>
    );
  }
  return (
    <section className="rs-placa rs-c12">
      <h2 className="rs-cabeca">Leitura</h2>
      <p className="rs-sub">Recalculada a cada filtro, sobre o que está visível agora.</p>
      <ol
        className="rs-reassenta"
        style={{
          display: "grid",
          gap: 0,
          margin: 0,
          padding: 0,
          listStyle: "none",
        }}
      >
        {itens.map((t, i) => (
          <li
            key={i}
            style={{
              padding: "11px 0",
              borderTop: i === 0 ? "none" : "1px solid var(--rs-fio)",
            }}
          >
            <p className="rs-prosa" style={{ margin: 0, color: "var(--rs-tinta-2)" }}>
              {t}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Tabela auditável
 * ------------------------------------------------------------------ */

export interface Coluna<T> {
  chave: keyof T & string;
  rotulo: string;
  numero?: boolean;
  quebra?: boolean;
  texto?: (linha: T) => string;
  render?: (linha: T) => ReactNode;
}

export function Tabela<T>({
  titulo,
  linhas,
  colunas,
  ordemInicial,
  direcaoInicial = "desc",
}: {
  titulo: string;
  linhas: readonly T[];
  colunas: Array<Coluna<T>>;
  ordemInicial: keyof T & string;
  direcaoInicial?: "asc" | "desc";
}) {
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<{ chave: string; dir: "asc" | "desc" }>({
    chave: ordemInicial,
    dir: direcaoInicial,
  });
  const [limite, setLimite] = useState(40);

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const base = termo
      ? linhas.filter((l) =>
          colunas.some((c) =>
            String(c.texto ? c.texto(l) : ((l as Record<string, unknown>)[c.chave] ?? ""))
              .toLowerCase()
              .includes(termo),
          ),
        )
      : [...linhas];

    return base.sort((a, b) => {
      const x = (a as Record<string, unknown>)[ordem.chave];
      const y = (b as Record<string, unknown>)[ordem.chave];
      if (x === null || x === undefined) return 1;
      if (y === null || y === undefined) return -1;
      if (typeof x === "number" && typeof y === "number") {
        return ordem.dir === "asc" ? x - y : y - x;
      }
      return ordem.dir === "asc"
        ? String(x).localeCompare(String(y), "pt-BR")
        : String(y).localeCompare(String(x), "pt-BR");
    });
  }, [linhas, colunas, busca, ordem]);

  const mostradas = visiveis.slice(0, limite);

  return (
    <section className="rs-placa rs-c12" style={{ padding: 0 }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          borderBottom: "1px solid var(--rs-fio)",
        }}
      >
        <h2 className="rs-cabeca">{titulo}</h2>
        <input
          className="rs-busca"
          type="search"
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setLimite(40);
          }}
          placeholder="Pesquisar"
          aria-label={`Pesquisar em ${titulo}`}
        />
      </div>

      <div data-rolagem style={{ maxHeight: 540, overflow: "auto" }}>
        <table className="rs-tabela">
          <thead>
            <tr>
              {colunas.map((c) => {
                const ativa = ordem.chave === c.chave;
                return (
                  <th key={c.chave} scope="col" className={c.numero ? "rs-num-col" : ""}>
                    <button
                      type="button"
                      aria-sort={ativa ? (ordem.dir === "asc" ? "ascending" : "descending") : "none"}
                      onClick={() =>
                        setOrdem((o) =>
                          o.chave === c.chave
                            ? { chave: c.chave, dir: o.dir === "asc" ? "desc" : "asc" }
                            : { chave: c.chave, dir: "desc" },
                        )
                      }
                    >
                      {c.rotulo}
                      <svg
                        aria-hidden
                        width="9"
                        height="6"
                        viewBox="0 0 9 6"
                        style={{
                          opacity: ativa ? 1 : 0,
                          transform: ordem.dir === "asc" ? "rotate(180deg)" : "none",
                        }}
                      >
                        <path d="M0.5 0.5 L4.5 5 L8.5 0.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
                      </svg>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {mostradas.length ? (
              mostradas.map((l, i) => (
                <tr key={i}>
                  {colunas.map((c) => (
                    <td
                      key={c.chave}
                      className={`${c.numero ? "rs-num-col " : ""}${c.quebra ? "rs-quebra" : ""}`}
                    >
                      {c.render
                        ? c.render(l)
                        : c.texto
                          ? c.texto(l)
                          : String((l as Record<string, unknown>)[c.chave] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={colunas.length} className="rs-vazio">
                  Nenhum registro atende à busca
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "11px 16px",
          borderTop: "1px solid var(--rs-fio)",
          fontSize: 13,
          color: "var(--rs-tinta-3)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <span>
          {fmtN(mostradas.length)} de {fmtN(visiveis.length)} registros
        </span>
        {mostradas.length < visiveis.length ? (
          <button type="button" className="rs-botao" onClick={() => setLimite((l) => l + 60)}>
            Mostrar mais
          </button>
        ) : null}
      </div>
    </section>
  );
}
