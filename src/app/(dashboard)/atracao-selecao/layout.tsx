"use client";

/**
 * A casca do quadro.
 *
 * O console do dashboard é escuro; a placa é clara. Não é inconsistência: numa
 * sala de operação o mobiliário é escuro e o quadro sinóptico é claro, porque é
 * ele que precisa ser lido de longe com a luz acesa.
 *
 * O carimbo de procedência fica sempre visível. Um painel sem dizer de quando
 * são os dados não pode ser lido com confiança, e esconder isso é a forma mais
 * rápida de perder quem decide.
 */

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { fmtData } from "@/lib/rs/metricas";
import { useAtracaoSelecao } from "@/store/atracao-selecao";

import "./painel.css";

const ABAS = [
  { href: "/atracao-selecao", rotulo: "Visão geral" },
  { href: "/atracao-selecao/vagas", rotulo: "Vagas em aberto" },
  { href: "/atracao-selecao/contratacoes", rotulo: "Contratações" },
  { href: "/atracao-selecao/funil", rotulo: "Funil" },
  { href: "/atracao-selecao/historico", rotulo: "Histórico" },
  { href: "/atracao-selecao/importar", rotulo: "Importar e conferir" },
] as const;

export default function LayoutAtracaoSelecao({ children }: { children: ReactNode }) {
  const caminho = usePathname();
  const { dados, qualidade, carregando, erro, carregar } = useAtracaoSelecao();

  /* Claro é o padrão porque a cena de leitura deste quadro é a projeção na
     parede da FUP, e projetor lava o preto. Quem lê na mesa troca, e a
     escolha fica guardada no próprio navegador de quem escolheu. */
  const [tema, setTema] = useState<"claro" | "escuro">("claro");

  useEffect(() => {
    void carregar();
  }, [carregar]);

  useEffect(() => {
    try {
      const salvo = localStorage.getItem("rs-tema");
      if (salvo === "claro" || salvo === "escuro") setTema(salvo);
    } catch {
      /* navegador com armazenamento bloqueado: fica no padrão claro */
    }
  }, []);

  const trocarTema = () => {
    const proximo = tema === "claro" ? "escuro" : "claro";
    setTema(proximo);
    try {
      localStorage.setItem("rs-tema", proximo);
    } catch {
      /* a troca vale para esta sessão mesmo sem poder gravar */
    }
  };

  return (
    <div className="rs-painel" data-rh-tema={tema}>
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
            O que saiu do prazo, há quantos dias e de quem é. Os filtros valem para
            todas as telas ao mesmo tempo.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
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
          <dd style={{ margin: 0, color: "var(--rs-tinta-2)" }}>
            {dados ? fmtData(dados.ref) : "—"}
          </dd>
          <dt className="rs-rotulo" style={{ textAlign: "right" }}>
            Última carga
          </dt>
          <dd style={{ margin: 0, color: "var(--rs-tinta-2)" }}>
            {qualidade?.atualizadoEm ? fmtData(qualidade.atualizadoEm.slice(0, 10)) : "nenhuma"}
          </dd>
          <dt className="rs-rotulo" style={{ textAlign: "right" }}>
            Dado pessoal
          </dt>
          <dd style={{ margin: 0, color: "var(--rs-tinta-2)" }}>descartado na carga</dd>
        </dl>

        {/* O quadro abre claro porque a cena dele é a projeção. Na mesa,
            quem prefere o escuro troca aqui e o navegador lembra. */}
        <button
          type="button"
          onClick={trocarTema}
          className="rs-botao"
          aria-pressed={tema === "escuro"}
          title={tema === "claro" ? "Passar para o tema escuro" : "Voltar ao tema claro"}
          style={{ display: "flex", alignItems: "center", gap: 7, flex: "none" }}
        >
          <svg aria-hidden width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.3">
            {tema === "claro" ? (
              <path d="M12.5 9.3A5.4 5.4 0 0 1 5.7 2.5a5.5 5.5 0 1 0 6.8 6.8Z" strokeLinejoin="round" />
            ) : (
              <>
                <circle cx="7.5" cy="7.5" r="3" />
                <path d="M7.5 1v1.4M7.5 12.6V14M14 7.5h-1.4M2.4 7.5H1M12.1 2.9l-1 1M3.9 11.1l-1 1M12.1 12.1l-1-1M3.9 3.9l-1-1" strokeLinecap="round" />
              </>
            )}
          </svg>
          {tema === "claro" ? "Escuro" : "Claro"}
        </button>
        </div>
      </header>

      <nav
        aria-label="Telas do quadro"
        style={{
          display: "flex",
          gap: 0,
          flexWrap: "wrap",
          borderTop: "2px solid var(--rs-fio-forte)",
          borderBottom: "1px solid var(--rs-fio)",
          background: "var(--rs-placa)",
        }}
        className="rs-abas"
      >
        {ABAS.map((aba) => {
          const ativa = caminho === aba.href;
          return (
            <Link
              key={aba.href}
              href={aba.href}
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

      {erro ? (
        <div
          role="alert"
          className="rs-placa"
          style={{
            marginTop: 16,
            borderTop: "2px solid var(--rs-alarme)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 14,
          }}
        >
          <span aria-hidden className="rs-marca rs-marca--alarme" style={{ color: "var(--rs-alarme)" }} />
          <p style={{ margin: 0, flex: 1, minWidth: 240, color: "var(--rs-tinta)" }}>{erro}</p>
          <button type="button" className="rs-botao" onClick={() => void carregar({ forcar: true })}>
            Tentar de novo
          </button>
        </div>
      ) : null}

      <div style={{ marginTop: 16 }}>
        {carregando && !dados ? <Aguardando /> : children}
      </div>
    </div>
  );
}

/** Espera com forma, não uma tela em branco: o quadro já mostra sua estrutura. */
function Aguardando() {
  return (
    <div aria-busy="true" aria-label="Lendo o quadro" className="rs-grade">
      <div className="rs-placa rs-c12" style={{ minHeight: 96 }}>
        <p className="rs-rotulo">Lendo o quadro</p>
      </div>
      <div className="rs-placa rs-c8" style={{ minHeight: 250 }} />
      <div className="rs-placa rs-c4" style={{ minHeight: 250 }} />
    </div>
  );
}
