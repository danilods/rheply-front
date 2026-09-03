"use client";

/**
 * Links de leitura para quem não tem conta.
 *
 * O token aparece uma vez, no momento da criação, e nunca mais: a listagem
 * carrega estado, não credencial. Se a pessoa perder o link, o caminho é gerar
 * outro e revogar o antigo — que é também o que se faz quando alguém sai da
 * empresa e o link já circulou.
 */

import { useCallback, useEffect, useState } from "react";

import { atracaoSelecaoApi, mensagemDeErro, type LinkPublico } from "@/services/atracao-selecao-api";
import { fmtData } from "@/lib/rs/metricas";

import { Etiqueta } from "./ui";

const SEVERIDADE = { ativo: "normal", expirado: "atencao", revogado: "alarme" } as const;

export function LinksPublicos() {
  const [links, setLinks] = useState<LinkPublico[]>([]);
  const [descricao, setDescricao] = useState("");
  const [dias, setDias] = useState(7);
  const [recemCriado, setRecemCriado] = useState<{ url: string; descricao: string } | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setLinks(await atracaoSelecaoApi.listarLinks());
    } catch (e) {
      setErro(mensagemDeErro(e));
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const criar = async () => {
    if (!descricao.trim() || ocupado) return;
    setOcupado(true);
    setErro(null);
    try {
      const criado = await atracaoSelecaoApi.criarLink(descricao.trim(), dias);
      setRecemCriado({
        url: `${window.location.origin}/painel/${criado.token}`,
        descricao: criado.descricao,
      });
      setDescricao("");
      await carregar();
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setOcupado(false);
    }
  };

  const revogar = async (id: string) => {
    setOcupado(true);
    try {
      await atracaoSelecaoApi.revogarLink(id);
      await carregar();
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setOcupado(false);
    }
  };

  return (
    <section className="rs-placa rs-c12">
      <h2 className="rs-cabeca">Links de leitura</h2>
      <p className="rs-sub">
        Para quem participa da reunião sem ter conta no sistema. O link abre o mesmo quadro,
        só leitura, e para de funcionar na data de validade ou quando você revogar.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
        <label className="rs-campo" style={{ flex: "1 1 260px" }}>
          <span className="rs-rotulo">Para quem é</span>
          <input
            className="rs-busca"
            value={descricao}
            maxLength={160}
            placeholder="Diretoria — FUP de sexta"
            onChange={(e) => setDescricao(e.target.value)}
          />
        </label>
        <label className="rs-campo">
          <span className="rs-rotulo">Validade</span>
          <select value={dias} onChange={(e) => setDias(Number(e.target.value))}>
            <option value={7}>7 dias</option>
            <option value={15}>15 dias</option>
            <option value={30}>30 dias</option>
            <option value={90}>90 dias</option>
          </select>
        </label>
        <button
          type="button"
          className="rs-botao rs-botao--forte"
          onClick={criar}
          disabled={!descricao.trim() || ocupado}
        >
          Gerar link
        </button>
      </div>

      {recemCriado ? (
        <div
          style={{
            marginTop: 16,
            padding: 14,
            background: "var(--rs-placa-funda)",
            borderTop: "2px solid var(--rs-processo)",
          }}
        >
          <p className="rs-rotulo" style={{ margin: 0 }}>
            Copie agora — este endereço não aparece de novo
          </p>
          <p
            className="rs-num"
            style={{ margin: "8px 0 0", wordBreak: "break-all", fontSize: 14, color: "var(--rs-tinta)" }}
          >
            {recemCriado.url}
          </p>
          <button
            type="button"
            className="rs-botao"
            style={{ marginTop: 10 }}
            onClick={() => void navigator.clipboard?.writeText(recemCriado.url)}
          >
            Copiar
          </button>
        </div>
      ) : null}

      {erro ? (
        <p className="rs-sub" style={{ color: "var(--rs-alarme)", marginTop: 12 }}>
          {erro}
        </p>
      ) : null}

      {links.length ? (
        <div data-rolagem style={{ overflowX: "auto", marginTop: 18 }}>
          <table className="rs-tabela">
            <thead>
              <tr>
                {["Para quem", "Estado", "Validade", "Aberturas", "Último acesso", ""].map((h) => (
                  <th key={h} scope="col">
                    <button type="button" tabIndex={-1} style={{ cursor: "default" }}>
                      {h}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {links.map((l) => (
                <tr key={l.id}>
                  <td className="rs-quebra">{l.descricao}</td>
                  <td>
                    <Etiqueta severidade={SEVERIDADE[l.estado]}>{l.estado}</Etiqueta>
                  </td>
                  <td>{fmtData(l.expira_em.slice(0, 10))}</td>
                  <td className="rs-num-col">{l.acessos}</td>
                  <td>{l.ultimo_acesso_em ? fmtData(l.ultimo_acesso_em.slice(0, 10)) : "—"}</td>
                  <td>
                    {l.estado === "ativo" ? (
                      <button
                        type="button"
                        className="rs-botao"
                        disabled={ocupado}
                        onClick={() => void revogar(l.id)}
                      >
                        Revogar
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rs-vazio">Nenhum link gerado ainda.</p>
      )}
    </section>
  );
}
