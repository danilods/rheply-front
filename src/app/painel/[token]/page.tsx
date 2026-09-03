"use client";

/**
 * Compatibilidade com os links já distribuídos.
 *
 * O endereço passou a ser /painel, com o código digitado na portaria. Um link
 * antigo, com o token no caminho, continua funcionando: a página guarda o
 * código na sessão e troca a URL na mesma hora, para que ele pare de aparecer
 * na barra de endereço, no histórico e em qualquer captura de tela.
 *
 * Isto some quando os links da primeira leva expirarem.
 */

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import { guardarToken } from "../gate";

export default function LinkAntigo() {
  const params = useParams<{ token: string }>();
  const router = useRouter();

  useEffect(() => {
    const token = typeof params?.token === "string" ? params.token : "";
    if (token) guardarToken(token);
    // replace, não push: o endereço com o token não fica no histórico.
    router.replace("/painel");
  }, [params, router]);

  return null;
}
