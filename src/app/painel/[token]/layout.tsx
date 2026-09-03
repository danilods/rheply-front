"use client";

/**
 * A casca do painel por link público.
 *
 * Mesmas telas do quadro interno, sem a de carga: quem abre por link lê, não
 * escreve. As páginas são as mesmas de /atracao-selecao, não cópias — elas
 * leem do mesmo store, que aqui é abastecido pelo endpoint público. Duplicar
 * as telas garantiria que uma das duas ficaria para trás na primeira correção.
 */

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

import { useAtracaoSelecao } from "@/store/atracao-selecao";
import { fmtData } from "@/lib/rs/metricas";

import "@/app/(dashboard)/atracao-selecao/painel.css";

const ABAS = [
  { sufixo: "", rotulo: "Visão geral" },
  { sufixo: "/vagas", rotulo: "Vagas em aberto" },
  { sufixo: "/contratacoes", rotulo: "Contratações" },
  { sufixo: "/funil", rotulo: "Funil" },
  { sufixo: "/historico", rotulo: "Histórico" },
] as const;

export default function LayoutPainelPublico({ children }: { children: ReactNode }) {
  const params = useParams<{ token: string }>();
  const token = typeof params?.token === "string" ? params.token : "";
  const caminho = usePathname();
  const { dados, erro, carregarPublico } = useAtracaoSelecao();

  useEffect(() => {
    if (token) void carregarPublico(token);
  }, [token, carregarPublico]);

  const base = `/painel/${token}`;

  return (
    <div className="rs-painel" data-rh-tema="claro" style={{ minHeight: "100vh" }}>
      <header
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 24,
          paddingBottom: 16,
        }}
      >
        <div>
          <h1 className="rs-titulo">Atração e Seleção</h1>
          <p className="rs-prosa" style={{ margin: "6px 0 0", color: "var(--rs-tinta-2)" }}>
            O que saiu do prazo, há quantos dias e de quem é. Somente leitura.
          </p>
        </div>
        {dados ? (
          <dl
            style={{
              display: "grid",
              gridTemplateColumns: "auto auto",
              gap: "2px 14px",
              margin: 0,
              fontSize: 13,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <dt className="rs-rotulo" style={{ textAlign: "right" }}>
              Referência
            </dt>
            <dd style={{ margin: 0, color: "var(--rs-tinta-2)" }}>{fmtData(dados.ref)}</dd>
            <dt className="rs-rotulo" style={{ textAlign: "right" }}>
              Dado pessoal
            </dt>
            <dd style={{ margin: 0, color: "var(--rs-tinta-2)" }}>descartado na carga</dd>
          </dl>
        ) : null}
      </header>

      {erro ? null : (
        <nav
          aria-label="Telas do quadro"
          className="rs-abas"
          style={{
            display: "flex",
            gap: 0,
            borderTop: "2px solid var(--rs-fio-forte)",
            borderBottom: "1px solid var(--rs-fio)",
            background: "var(--rs-placa)",
          }}
        >
          {ABAS.map((aba) => {
            const href = `${base}${aba.sufixo}`;
            const ativa = caminho === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={ativa ? "page" : undefined}
                className="rs-rotulo"
                style={{
                  padding: "11px 16px",
                  whiteSpace: "nowrap",
                  textDecoration: "none",
                  color: ativa ? "var(--rs-tinta)" : "var(--rs-tinta-2)",
                  background: ativa ? "var(--rs-placa-funda)" : "transparent",
                  boxShadow: ativa ? "inset 0 -3px 0 var(--rs-tinta)" : "none",
                }}
              >
                {aba.rotulo}
              </Link>
            );
          })}
        </nav>
      )}

      <div style={{ marginTop: 16 }}>
        {erro ? (
          <section className="rs-placa" style={{ borderTop: "2px solid var(--rs-alarme)" }}>
            <h2 className="rs-cabeca">Link expirado ou revogado</h2>
            <p className="rs-prosa" style={{ margin: "8px 0 0", color: "var(--rs-tinta-2)" }}>
              {erro}
            </p>
          </section>
        ) : !dados ? (
          <div aria-busy="true" style={{ display: "grid", gap: 16 }}>
            <div style={{ height: 96, background: "var(--rs-placa)", borderTop: "2px solid var(--rs-fio-forte)" }} />
            <div style={{ height: 300, background: "var(--rs-placa)", borderTop: "2px solid var(--rs-fio-forte)" }} />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
