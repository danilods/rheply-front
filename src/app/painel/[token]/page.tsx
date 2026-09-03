"use client";

/**
 * O painel por link público.
 *
 * Mesma leitura do quadro interno, para quem participa da FUP sem ter conta no
 * sistema. Só leitura: sem importar planilha, sem desfazer carga, sem alcançar
 * outro módulo. O token vem no caminho da URL, não em query string, para não
 * ficar gravado em Referer quando alguém clicar num link de dentro da página.
 */

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { CorpoSinoptico } from "@/components/atracao-selecao/sinoptico";
import { atracaoSelecaoApi } from "@/services/atracao-selecao-api";
import type { PainelAtracaoSelecao } from "@/types/atracao-selecao";

import "@/app/(dashboard)/atracao-selecao/painel.css";

export default function PainelPublico() {
  const params = useParams<{ token: string }>();
  const token = typeof params?.token === "string" ? params.token : "";

  const [dados, setDados] = useState<PainelAtracaoSelecao | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    if (!token) return;
    atracaoSelecaoApi
      .obterPainelPublico(token)
      .then((d: PainelAtracaoSelecao) => { if (vivo) setDados(d); })
      .catch(() =>
        vivo &&
        setErro(
          "Este link não vale mais. Peça um novo a quem enviou — eles expiram por segurança.",
        ),
      );
    return () => {
      vivo = false;
    };
  }, [token]);

  return (
    <div className="rs-painel" data-rh-tema="claro" style={{ minHeight: "100vh" }}>
      <header style={{ paddingBottom: 16 }}>
        <h1 className="rs-titulo">Atração e Seleção</h1>
        <p className="rs-prosa" style={{ margin: "6px 0 0", color: "var(--rs-tinta-2)" }}>
          O que saiu do prazo, há quantos dias e de quem é.
          {dados ? " Somente leitura." : null}
        </p>
      </header>

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
        <CorpoSinoptico
          recorte={{ abertas: dados.abertas, contr: dados.contr, funil: dados.funil, hist: dados.hist }}
          interno={false}
        />
      )}
    </div>
  );
}
