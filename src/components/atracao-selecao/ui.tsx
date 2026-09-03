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
}

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
          <p className="rs-rotulo">{i.rotulo}</p>
          <p className="rs-leitura">
            {i.valor}
            {i.unidade ? <span className="rs-unidade">{i.unidade}</span> : null}
          </p>
          {i.contexto ? <p className="rs-estado__prazo">{i.contexto}</p> : null}
        </div>
      ))}
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
