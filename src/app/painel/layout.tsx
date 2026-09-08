"use client";

/**
 * A casca do painel público.
 *
 * O endereço não carrega o token. Quem chega sem código passa pela portaria;
 * quem já entrou nesta aba segue direto, porque o código fica em
 * sessionStorage até a aba fechar.
 *
 * As telas são as mesmas de /atracao-selecao, não cópias: elas leem do mesmo
 * store, que aqui é abastecido pelo endpoint público.
 */

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAtracaoSelecao } from "@/store/atracao-selecao";
import { fmtData } from "@/lib/rs/metricas";

import { Portaria, esquecerToken, lerToken } from "./gate";

import "@/app/(dashboard)/atracao-selecao/painel.css";

const ABAS = [
  { href: "/painel", rotulo: "Visão geral" },
  { href: "/painel/vagas", rotulo: "Vagas em aberto" },
  { href: "/painel/contratacoes", rotulo: "Posições fechadas" },
  { href: "/painel/funil", rotulo: "Funil" },
  { href: "/painel/historico", rotulo: "Histórico" },
] as const;

export default function LayoutPainelPublico({ children }: { children: ReactNode }) {
  const caminho = usePathname();
  const { dados, erro, carregarPublico } = useAtracaoSelecao();

  // Só depois de montar dá para ler sessionStorage. Antes disso não sabemos se
  // há código, e desenhar a portaria por padrão faria ela piscar em toda troca
  // de aba de quem já entrou.
  const [pronto, setPronto] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    setToken(lerToken());
    setPronto(true);
  }, []);

  useEffect(() => {
    if (token) void carregarPublico(token);
  }, [token, carregarPublico]);

  const sair = useCallback(() => {
    esquecerToken();
    window.location.href = "/painel";
  }, []);

  if (!pronto) return null;

  // /painel/<token> é o atalho dos links antigos: ele precisa montar para
  // guardar o código e limpar a URL. Barrá-lo na portaria faria o link antigo
  // parecer quebrado, porque a página que resolve o problema nunca rodaria.
  const rotaConhecida = ABAS.some((a) => a.href === caminho);
  if (!rotaConhecida) return <>{children}</>;

  // A portaria precisa viver dentro de .rs-painel: todo o vocabulário visual
  // é escopado por essa classe, e fora dela a tela sai sem fundo, sem fio e
  // com o campo invisível.
  if (!token) {
    return (
      <div className="rs-painel" data-rh-tema="claro" style={{ minHeight: "100vh" }}>
        <Portaria aoEntrar={setToken} />
      </div>
    );
  }

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
          <h1 className="rs-titulo">Mapa de Vagas · Equatorial Serviços</h1>
          <p className="rs-prosa" style={{ margin: "6px 0 0", color: "var(--rs-tinta-2)" }}>
            O que saiu do prazo, há quantos dias e de quem é. Somente leitura.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
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
          <button type="button" className="rs-botao" onClick={sair} style={{ flex: "none" }}>
            Sair
          </button>
        </div>
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
      )}

      <div style={{ marginTop: 16 }}>
        {erro ? (
          <section className="rs-placa" style={{ borderTop: "2px solid var(--rs-alarme)" }}>
            <h2 className="rs-cabeca">Código expirado ou revogado</h2>
            <p className="rs-prosa" style={{ margin: "8px 0 12px", color: "var(--rs-tinta-2)" }}>
              {erro}
            </p>
            <button type="button" className="rs-botao" onClick={sair}>
              Entrar com outro código
            </button>
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
