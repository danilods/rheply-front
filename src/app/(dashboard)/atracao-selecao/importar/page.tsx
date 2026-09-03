"use client";

/**
 * Carga e qualidade.
 *
 * Cinco camadas antes de gravar: enviar, reconhecer, validar, ver o diff,
 * confirmar. E uma sexta depois: desfazer o lote inteiro. Cada camada é
 * imperfeita sozinha; juntas evitam que uma planilha errada entre sem ninguém
 * perceber.
 */

import { useRef, useState } from "react";

import { LinksPublicos } from "@/components/atracao-selecao/links-publicos";
import { fmtData, fmtN, fmtPct } from "@/lib/rs/metricas";
import { atracaoSelecaoApi, mensagemDeErro, type QualidadeDados } from "@/services/atracao-selecao-api";
import { useAtracaoSelecao } from "@/store/atracao-selecao";
import type { PreviaImportacao } from "@/types/atracao-selecao";

const NOME_TIPO: Record<string, string> = {
  vagas: "Exportação de vagas",
  contratacoes: "Exportação de contratados",
  funil: "Funil consolidado",
  desconhecido: "Não reconhecida",
};

export default function PaginaCarga() {
  const { qualidade, carregar } = useAtracaoSelecao();
  const [previa, setPrevia] = useState<PreviaImportacao | null>(null);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [progresso, setProgresso] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [aplicando, setAplicando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [arrastando, setArrastando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function enviar(f: File, aba?: string) {
    setEnviando(true);
    setErro(null);
    setOk(null);
    setProgresso(0);
    try {
      setPrevia(await atracaoSelecaoApi.enviarPlanilha(f, { aba, onProgress: setProgresso }));
      setArquivo(f);
    } catch (e) {
      setErro(mensagemDeErro(e));
      setPrevia(null);
    } finally {
      setEnviando(false);
    }
  }

  async function confirmar() {
    if (!previa) return;
    setAplicando(true);
    setErro(null);
    try {
      const aplicado = await atracaoSelecaoApi.confirmarImportacao(previa.loteId);
      setPrevia(aplicado);
      setOk(`${fmtN(aplicado.novas)} novas, ${fmtN(aplicado.alteradas)} alteradas e ${fmtN(aplicado.inalteradas)} inalteradas. O quadro já está com os dados novos.`);
      await carregar({ forcar: true });
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setAplicando(false);
    }
  }

  async function desfazer(loteId: string) {
    setAplicando(true);
    setErro(null);
    try {
      await atracaoSelecaoApi.desfazerImportacao(loteId);
      setOk("Lote desfeito. Os registros voltaram ao estado anterior.");
      setPrevia(null);
      await carregar({ forcar: true });
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setAplicando(false);
    }
  }

  const aplicado = previa?.estado === "aplicado";

  return (
    <div className="rs-grade">
      <section className="rs-placa rs-c7">
        <h2 className="rs-cabeca">Enviar planilha</h2>
        <p className="rs-sub">
          Aceita a exportação de vagas, a de contratados e o funil consolidado. O tipo é
          reconhecido pelo cabeçalho, e as colunas com dado pessoal são descartadas antes de
          qualquer gravação.
        </p>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setArrastando(true);
          }}
          onDragLeave={() => setArrastando(false)}
          onDrop={(e) => {
            e.preventDefault();
            setArrastando(false);
            const f = e.dataTransfer.files?.[0];
            if (f) void enviar(f);
          }}
          style={{
            border: `1px dashed ${arrastando ? "var(--rs-tinta)" : "var(--rs-fio-forte)"}`,
            background: arrastando ? "var(--rs-placa-funda)" : "transparent",
            padding: "30px 20px",
            textAlign: "center",
          }}
        >
          <p style={{ margin: 0, color: "var(--rs-tinta-2)" }}>
            Arraste o arquivo aqui ou{" "}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              style={{
                background: "none",
                border: 0,
                padding: 0,
                font: "inherit",
                color: "var(--rs-tinta)",
                textDecoration: "underline",
                textUnderlineOffset: 3,
                cursor: "pointer",
              }}
            >
              escolha no computador
            </button>
          </p>
          <p className="rs-rotulo" style={{ marginTop: 8 }}>
            xlsx · xlsm · xls · csv · até 20 MB
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xlsm,.xls,.csv"
            style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void enviar(f);
              e.target.value = "";
            }}
          />
        </div>

        {enviando ? (
          <div style={{ marginTop: 16 }}>
            <p className="rs-rotulo" style={{ marginBottom: 6 }}>
              Lendo e validando linha a linha · {progresso}%
            </p>
            <div style={{ height: 4, background: "var(--rs-placa-funda)" }}>
              <div style={{ height: "100%", width: `${progresso}%`, background: "var(--rs-tinta)" }} />
            </div>
          </div>
        ) : null}

        {erro ? (
          <p role="alert" style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "flex-start", color: "var(--rs-alarme)" }}>
            <span aria-hidden className="rs-marca rs-marca--alarme" style={{ marginTop: 5 }} />
            <span style={{ color: "var(--rs-tinta)" }}>{erro}</span>
          </p>
        ) : null}

        {ok ? (
          <p style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "flex-start", color: "var(--rs-normal)" }}>
            <span aria-hidden className="rs-marca rs-marca--normal" style={{ marginTop: 5 }} />
            <span style={{ color: "var(--rs-tinta)" }}>{ok}</span>
          </p>
        ) : null}
      </section>

      <section className="rs-placa rs-c5">
        <h2 className="rs-cabeca">Completude</h2>
        <p className="rs-sub">
          Diz se o quadro pode ser lido com confiança. Um gráfico sobre um campo preenchido pela
          metade parece um fato, e não é.
        </p>
        {qualidade ? (
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {qualidade.campos.map((c) => {
              const pct = c.completude ?? 0;
              const tom = pct >= 0.95 ? "var(--rs-normal)" : pct >= 0.75 ? "var(--rs-atencao)" : "var(--rs-alarme)";
              return (
                <li key={`${c.onde}-${c.campo}`} style={{ display: "grid", gridTemplateColumns: "1fr 46px", gap: 10, alignItems: "center", padding: "7px 0", borderTop: "1px solid var(--rs-fio)" }}>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", color: "var(--rs-tinta)", fontSize: 14 }}>{c.campo}</span>
                    <span className="rs-estado__prazo">
                      {c.onde} · {fmtN(c.faltando)} em branco
                    </span>
                    <span style={{ display: "block", height: 3, background: "var(--rs-placa-funda)", marginTop: 5 }}>
                      <span style={{ display: "block", height: "100%", width: `${pct * 100}%`, background: tom }} />
                    </span>
                  </span>
                  <span className="rs-num" style={{ textAlign: "right", color: tom, fontWeight: 600 }}>
                    {fmtPct(c.completude)}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="rs-vazio">Nenhuma carga ainda.</p>
        )}
      </section>

      {previa ? (
        <section className="rs-placa rs-c12" style={{ borderTop: `2px solid ${aplicado ? "var(--rs-normal)" : "var(--rs-tinta)"}` }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
            <div>
              <h2 className="rs-cabeca">{aplicado ? "Carga aplicada" : "O que vai mudar"}</h2>
              <p className="rs-sub" style={{ marginBottom: 0 }}>
                {NOME_TIPO[previa.tipo] ?? previa.tipo}
                {previa.aba ? ` · aba "${previa.aba}"` : ""} · {fmtN(previa.totalLinhas)} linhas lidas
              </p>
            </div>
            {aplicado ? (
              <button type="button" className="rs-botao" disabled={aplicando} onClick={() => void desfazer(previa.loteId)}>
                Desfazer este lote
              </button>
            ) : (
              <button type="button" className="rs-botao rs-botao--forte" disabled={aplicando} onClick={() => void confirmar()}>
                {aplicando ? "Aplicando…" : "Confirmar carga"}
              </button>
            )}
          </div>

          <dl className="rs-estados" style={{ marginTop: 16, borderTop: "1px solid var(--rs-fio)" }}>
            {[
              { r: "Novas", v: previa.novas },
              { r: "Alteradas", v: previa.alteradas },
              { r: "Inalteradas", v: previa.inalteradas },
              { r: "Rejeitadas", v: previa.rejeicoes.length },
              { r: "Ausentes", v: previa.ausentes },
            ].map((x) => (
              <div key={x.r} className="rs-estado">
                <dt className="rs-rotulo">{x.r}</dt>
                <dd className="rs-leitura rs-leitura--peq" style={{ margin: "6px 0 0" }}>
                  {fmtN(x.v)}
                </dd>
              </div>
            ))}
          </dl>

          {previa.ausentes ? (
            <p className="rs-sub" style={{ marginTop: 12, marginBottom: 0 }}>
              {fmtN(previa.ausentes)} registros existem na base e não vieram nesta exportação. Não
              são apagados: normalmente significa que a vaga foi encerrada.
            </p>
          ) : null}

          {previa.colunasIgnoradas.length ? (
            <details className="rs-numeros">
              <summary>
                <svg aria-hidden width="6" height="9" viewBox="0 0 6 9"><path d="M0.5 0.5 L5 4.5 L0.5 8.5" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg>
                {fmtN(previa.colunasIgnoradas.length)} colunas com dado pessoal descartadas
              </summary>
              <p className="rs-sub" style={{ marginTop: 8, marginBottom: 0 }}>{previa.colunasIgnoradas.join(" · ")}</p>
            </details>
          ) : null}

          {previa.avisos.length ? (
            <details className="rs-numeros" open>
              <summary style={{ color: "var(--rs-atencao)" }}>
                <svg aria-hidden width="6" height="9" viewBox="0 0 6 9"><path d="M0.5 0.5 L5 4.5 L0.5 8.5" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg>
                {fmtN(previa.avisos.length)} avisos: a linha entrou, mas vale conferir
              </summary>
              <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 14, color: "var(--rs-tinta-2)" }}>
                {previa.avisos.slice(0, 10).map((a, i) => (
                  <li key={i}>
                    <span className="rs-num">linha {a.linha}</span> · {a.coluna} — {a.motivo}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}

          {previa.rejeicoes.length ? (
            <details className="rs-numeros" open>
              <summary style={{ color: "var(--rs-alarme)" }}>
                <svg aria-hidden width="6" height="9" viewBox="0 0 6 9"><path d="M0.5 0.5 L5 4.5 L0.5 8.5" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg>
                {fmtN(previa.rejeicoes.length)} linhas precisam de correção na planilha
              </summary>
              <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 14, color: "var(--rs-tinta-2)" }}>
                {previa.rejeicoes.slice(0, 20).map((r, i) => (
                  <li key={i}>
                    <span className="rs-num">linha {r.linha}</span> · {r.coluna} — {r.motivo}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}

          {previa.abasDisponiveis.length > 1 && arquivo ? (
            <div style={{ marginTop: 16, borderTop: "1px solid var(--rs-fio)", paddingTop: 12 }}>
              <p className="rs-rotulo">Outras abas reconhecidas neste arquivo</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                {previa.abasDisponiveis.map((a) => (
                  <button
                    key={a.aba}
                    type="button"
                    className="rs-botao"
                    disabled={a.aba === previa.aba || enviando}
                    onClick={() => void enviar(arquivo, a.aba)}
                  >
                    {a.aba}
                    <span className="rs-num" style={{ marginLeft: 8, color: "var(--rs-tinta-3)" }}>
                      {fmtN(a.linhas)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      <HistoricoDeCargas qualidade={qualidade} aoDesfazer={desfazer} desabilitado={aplicando} />
      <LinksPublicos />
    </div>
  );
}

function HistoricoDeCargas({
  qualidade,
  aoDesfazer,
  desabilitado,
}: {
  qualidade: QualidadeDados | null;
  aoDesfazer: (loteId: string) => void;
  desabilitado: boolean;
}) {
  if (!qualidade?.lotes.length) return null;
  return (
    <section className="rs-placa rs-c12" style={{ padding: 0 }}>
      <h2 className="rs-cabeca" style={{ padding: "14px 16px", borderBottom: "1px solid var(--rs-fio)" }}>
        Histórico de cargas
      </h2>
      <div data-rolagem style={{ overflowX: "auto" }}>
        <table className="rs-tabela">
          <thead>
            <tr>
              {["Arquivo", "Tipo", "Estado", "Data", "Lidas", "Novas", "Alteradas", ""].map((h, i) => (
                <th key={h || i} scope="col" className={i >= 4 ? "rs-num-col" : ""}>
                  <button type="button" tabIndex={-1} style={{ cursor: "default" }}>
                    {h}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {qualidade.lotes.map((l) => (
              <tr key={l.id}>
                <td className="rs-quebra">{l.arquivo}</td>
                <td>{NOME_TIPO[l.tipo] ?? l.tipo}</td>
                <td>{l.estado}</td>
                <td>{fmtData(l.criadoEm?.slice(0, 10))}</td>
                <td className="rs-num-col">{fmtN(l.lidas)}</td>
                <td className="rs-num-col">{fmtN(l.novas)}</td>
                <td className="rs-num-col">{fmtN(l.alteradas)}</td>
                <td className="rs-num-col">
                  {l.estado === "aplicado" ? (
                    <button type="button" className="rs-botao" style={{ height: 26, fontSize: 13 }} disabled={desabilitado} onClick={() => aoDesfazer(l.id)}>
                      Desfazer
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
