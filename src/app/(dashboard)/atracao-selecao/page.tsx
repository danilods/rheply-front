"use client";

/**
 * O sinóptico: a tela que abre a reunião.
 *
 * Uma pergunta por bloco, na ordem em que a cobrança acontece. O que saiu do
 * prazo, há quantos dias, e de quem é. Cada alarme carrega o responsável na
 * própria linha, sem clique intermediário: da carga até a contraforça.
 */

import { useMemo } from "react";
import { usePathname } from "next/navigation";

import { CorpoSinoptico } from "@/components/atracao-selecao/sinoptico";
import { Regua } from "@/components/atracao-selecao/ui";
import { fmtMes } from "@/lib/rs/metricas";
import { aplicarFiltros, mesMaximoDe, opcoesDe, useAtracaoSelecao } from "@/store/atracao-selecao";

export default function PaginaSinoptico() {
  const { dados, qualidade, filtros } = useAtracaoSelecao();

  // A mesma tela serve /atracao-selecao e /painel/<token>. O prefixo sai do
  // caminho para que os links irmãos apontem para dentro do próprio contexto.
  const caminho = usePathname() ?? "";
  const publico = caminho === "/painel" || caminho.startsWith("/painel/");
  const base = publico ? "/painel" : "/atracao-selecao";

  /*
   * O recorte vale para as quatro bases ao mesmo tempo.
   *
   * Elas não falam a mesma língua: o funil chama de "localidade" o que as
   * outras chamam de "filial", e de "posicao" o que elas chamam de "vaga".
   * Cada base traz o próprio mapa, e por isso a régua daqui oferece só os
   * campos que as quatro sabem responder. Recrutador ficou de fora de
   * propósito: o funil não guarda esse campo, e um filtro que recorta três
   * bases e deixa a quarta inteira devolveria um quadro que se contradiz.
   *
   * Uma exceção fica declarada: posições fechadas não trazem gerência na
   * exportação — trazem departamento, que mistura gerências e executivas.
   * Filtrar por gerência recorta vagas e funil, e não recorta essa base. Em
   * vez de esconder isso, a tela avisa quando o recorte está parcial.
   */
  const recorte = useMemo(() => {
    if (!dados) return null;
    const { abertas, contr, funil } = dados;
    const comum = { gerencia: "gerencia", status: "status", filial: "filial", cargo: "vaga", gestor: "gestor" } as const;
    return {
      abertas: aplicarFiltros(abertas, filtros, { periodo: "mesCriacao", ...comum }, mesMaximoDe(abertas, "mesCriacao")),
      contr: aplicarFiltros(contr, filtros, { periodo: "mes", status: "depto", filial: "filial", cargo: "vaga", gestor: "gestor" }, mesMaximoDe(contr, "mes")),
      funil: aplicarFiltros(funil, filtros, { periodo: "mes", gerencia: "gerencia", status: "status", filial: "localidade", cargo: "posicao", gestor: "gestor" }, mesMaximoDe(funil, "mes")),
    };
  }, [dados, filtros]);

  const meses = useMemo(() => {
    const lista = Array.from(new Set((dados?.abertas ?? []).map((v) => v.mesCriacao).filter(Boolean)))
      .sort()
      .reverse();
    return [
      ...(lista.length > 3
        ? [{ v: "p3", r: "Últimos 3 meses" }, { v: "p6", r: "Últimos 6 meses" }]
        : []),
      ...lista.map((m) => ({ v: m as string, r: fmtMes(m) })),
    ];
  }, [dados]);

  if (!dados || !recorte) return null;

  const recortado = Boolean(
    filtros.periodo || filtros.gerencia || filtros.status || filtros.filial || filtros.cargo || filtros.gestor,
  );
  // Gerência não existe na base de posições fechadas. Quando o recorte usa
  // gerência, os números vindos dela ficam sem recortar, e a tela diz isso.
  const recorteParcial = Boolean(filtros.gerencia);

  return (
    <>
      <Regua
        meses={meses}
        campos={[
          { chave: "gerencia", rotulo: "Gerência", opcoes: opcoesDe(dados.abertas, "gerencia") },
          { chave: "status", rotulo: "Status", opcoes: opcoesDe(dados.abertas, "status") },
          { chave: "filial", rotulo: "Filial", opcoes: opcoesDe(dados.abertas, "filial") },
          { chave: "cargo", rotulo: "Vaga", opcoes: opcoesDe(dados.abertas, "vaga") },
          { chave: "gestor", rotulo: "Gestor(a)", opcoes: opcoesDe(dados.abertas, "gestor") },
        ]}
        contagem={{ visiveis: recorte.abertas.length, total: dados.abertas.length }}
        unidade="vagas abertas"
      />

      <div style={{ marginTop: 16 }}>
        <CorpoSinoptico recorte={recorte} qualidade={qualidade} recortado={recortado} recorteParcial={recorteParcial} interno={!publico} base={base} />
      </div>
    </>
  );
}
