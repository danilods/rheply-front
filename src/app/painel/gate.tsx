"use client";

/**
 * A portaria do painel público.
 *
 * O endereço não carrega o token: quem tem o código digita aqui, e ele é
 * verificado por uma chamada com o token no cabeçalho. Assim a URL sozinha não
 * abre nada — nem no histórico de quem recebeu, nem numa captura de tela, nem
 * no log de borda de quem serve a página.
 *
 * O código fica em sessionStorage, não em localStorage: morre quando a aba
 * fecha, que é o tempo de vida certo para uma credencial emprestada.
 */

import { useCallback, useEffect, useState } from "react";

import { atracaoSelecaoApi } from "@/services/atracao-selecao-api";

export const CHAVE_SESSAO = "rs-painel-token";

export function lerToken(): string {
  if (typeof window === "undefined") return "";
  try {
    return sessionStorage.getItem(CHAVE_SESSAO) ?? "";
  } catch {
    return "";
  }
}

export function guardarToken(token: string) {
  try {
    sessionStorage.setItem(CHAVE_SESSAO, token);
  } catch {
    /* armazenamento bloqueado: vale para esta navegação e ponto */
  }
}

export function esquecerToken() {
  try {
    sessionStorage.removeItem(CHAVE_SESSAO);
  } catch {
    /* nada a fazer */
  }
}

export function Portaria({ aoEntrar }: { aoEntrar: (token: string) => void }) {
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(false);

  const entrar = useCallback(async () => {
    const limpo = codigo.trim();
    if (!limpo || verificando) return;
    setVerificando(true);
    setErro(null);
    try {
      // A própria leitura do painel é a verificação: se o token não vale, o
      // servidor devolve 404 e nada é gravado na sessão.
      await atracaoSelecaoApi.obterPainelPublico(limpo);
      guardarToken(limpo);
      aoEntrar(limpo);
    } catch {
      setErro("Código inválido, expirado ou revogado. Peça um novo a quem enviou.");
      setVerificando(false);
    }
  }, [codigo, verificando, aoEntrar]);

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Enter") void entrar();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [entrar]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rs-portaria-titulo"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <section
        className="rs-placa"
        style={{ width: "100%", maxWidth: 460, borderTop: "2px solid var(--rs-fio-forte)" }}
      >
        <h1 id="rs-portaria-titulo" className="rs-cabeca" style={{ marginTop: 0 }}>
          Atração e Seleção
        </h1>
        <p className="rs-sub">
          Digite o código de seis dígitos que você recebeu. Ele vale por tempo limitado
          e pode ser revogado por quem enviou.
        </p>

        <label className="rs-campo" style={{ width: "100%" }}>
          <span className="rs-rotulo">Código de acesso</span>
          <input
            className="rs-busca rs-num"
            style={{
              width: "100%",
              maxWidth: "none",
              minWidth: 0,
              marginTop: 4,
              fontSize: 22,
              letterSpacing: "0.28em",
              textAlign: "center",
            }}
            value={codigo}
            autoFocus
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            spellCheck={false}
            aria-invalid={erro ? true : undefined}
            aria-describedby={erro ? "rs-portaria-erro" : undefined}
            onChange={(e) => {
              // Colar "código: 123 456" é comum. O campo aceita e limpa.
              setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6));
              if (erro) setErro(null);
            }}
          />
        </label>

        {erro ? (
          <p
            id="rs-portaria-erro"
            role="alert"
            className="rs-sub"
            style={{ color: "var(--rs-alarme)", marginTop: 10, marginBottom: 0 }}
          >
            {erro}
          </p>
        ) : null}

        <button
          type="button"
          className="rs-botao rs-botao--forte"
          style={{ marginTop: 16 }}
          onClick={() => void entrar()}
          disabled={codigo.length < 6 || verificando}
        >
          {verificando ? "Verificando…" : "Abrir painel"}
        </button>
      </section>
    </div>
  );
}
