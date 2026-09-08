"use client";

/**
 * Histórico: as posições que fecharam, no tempo.
 *
 * A tela anterior listava as vagas em aberto e chamava aquilo de histórico. Não
 * era: era o presente com outro nome, e a soma acumulada de posições fechadas
 * daquela base dava 1.849 contra 492 posições realmente fechadas no período.
 * Foi o que a analista apontou como número não fidedigno.
 *
 * Agora cada número aqui é rastreável a uma linha da aba de posições fechadas,
 * e o tempo médio é o real: da aprovação da O&R até a data de movimentação
 * para contratação.
 */

import { useMemo } from "react";

import { Barras, Colunas, Faixa, Placa, tabelaBarras, tabelaFaixa } from "@/components/atracao-selecao/graficos";
import { Achados, FaixaLeituras, Forte, Regua, Tabela, type Coluna } from "@/components/atracao-selecao/ui";
import { fmtBRL, fmtData, fmtMes, fmtN, fmtPct, RAMPA_AGING } from "@/lib/rs/metricas";
import { contarPor, distribuicaoPor, maiores, mediana, nums, percentil, porMes, proporcao } from "@/lib/rs/stats";
import { aplicarFiltros, mesMaximoDe, opcoesDe, useAtracaoSelecao } from "@/store/atracao-selecao";
import type { Contratacao } from "@/types/atracao-selecao";

const FAIXAS_TM: Array<[number, number, string]> = [
  [0, 16, "até 15 d"],
  [16, 31, "16–30"],
  [31, 61, "31–60"],
  [61, 91, "61–90"],
  [91, Number.POSITIVE_INFINITY, "mais de 90"],
];

export default function PaginaHistorico() {
  const { dados, filtros } = useAtracaoSelecao();
  const todas = useMemo(() => dados?.contr ?? [], [dados]);
  const mesMaximo = useMemo(() => mesMaximoDe(todas, "mes"), [todas]);

  const meses = useMemo(() => {
    const lista = Array.from(new Set(todas.map((c) => c.mes).filter(Boolean))).sort().reverse();
    return [
      ...(lista.length > 3 ? [{ v: "p3", r: "Últimos 3 meses" }, { v: "p6", r: "Últimos 6 meses" }] : []),
      ...lista.map((m) => ({ v: m as string, r: fmtMes(m) })),
    ];
  }, [todas]);

  const vis = useMemo(
    () =>
      aplicarFiltros(
        todas,
        filtros,
        // A aba de posições fechadas não traz Gerência: traz Departamento, que
        // mistura gerências e executivas. O filtro aqui é honesto sobre isso.
        { periodo: "mes", status: "depto", filial: "filial", cargo: "vaga", recrutador: "recrutador", gestor: "gestor" },
        mesMaximo,
      ),
    [todas, filtros, mesMaximo],
  );

  if (!dados) return null;

  const tm = nums(vis, "tmPosicao");
  const meses_ = porMes(vis, "mes");
  const distTm = FAIXAS_TM.map(([min, max, rotulo], i) => ({
    k: rotulo,
    v: tm.filter((d) => d >= min && d < max).length,
    cor: RAMPA_AGING[Math.min(i, RAMPA_AGING.length - 1)],
  }));

  const leituras = [
    { rotulo: "Posições fechadas", valor: fmtN(vis.length), contexto: `em ${fmtN(new Set(vis.map((c) => c.codigo)).size)} vagas distintas` },
    { rotulo: "Tempo médio da vaga", valor: fmtN(mediana(tm)), unidade: "dias", contexto: `na metade dos casos · da aprovação à movimentação · 9 em cada 10 em até ${fmtN(percentil(tm, 0.9))} d` },
    { rotulo: "Mês mais forte", valor: meses_.length ? fmtMes(maiores(contarPor(vis, "mes"), 1)[0]?.k) : "—", contexto: `${fmtN(maiores(contarPor(vis, "mes"), 1)[0]?.v)} posições` },
    { rotulo: "Recrutamento interno", valor: fmtPct(proporcao(vis, (c) => c.interno)), contexto: `${fmtN(vis.filter((c) => c.interno).length)} das ${fmtN(vis.length)}` },
    { rotulo: "Salário contratado", valor: fmtBRL(mediana(nums(vis, "salContr"))), contexto: "mediana do período" },
  ];

  const porMesSerie = meses_.map((m) => ({ k: fmtMes(m.k), v: m.v }));
  const tmPorCargo = distribuicaoPor(vis, "vaga", "tmPosicao", 4).slice(0, 8);
  const tmPorFilial = distribuicaoPor(vis, "filial", "tmPosicao", 4).slice(0, 8);
  const porDepto = maiores(contarPor(vis, "depto"), 8);
  const porOrigem = maiores(contarPor(vis, "origem"), 6);

  const achados: React.ReactNode[] = [];
  if (vis.length) {
    achados.push(
      <>
        <Forte>{fmtN(vis.length)} posições fechadas</Forte> no período filtrado, em{" "}
        {fmtN(new Set(vis.map((c) => c.codigo)).size)} vagas distintas. Cada linha aqui é uma posição
        que saiu do quadro de abertas, não uma soma acumulada.
      </>,
    );
    if (tm.length) {
      achados.push(
        <>
          O tempo médio da vaga é de <Forte>{fmtN(mediana(tm))} dias na metade dos casos, e 9 em cada 10 fecham em até {fmtN(percentil(tm, 0.9))}</Forte>,
          contados da aprovação da O&amp;R até a movimentação para contratação. É o tempo real do
          ciclo, não a soma de etapas.
        </>,
      );
    }
    if (tmPorCargo.length > 1) {
      const lento = tmPorCargo[tmPorCargo.length - 1];
      const rapido = tmPorCargo[0];
      achados.push(
        <>
          Por cargo, <Forte>{lento.k} leva {fmtN(lento.v)} dias medianos</Forte> contra {fmtN(rapido.v)} de{" "}
          {rapido.k}. Um prazo-alvo único para todos os cargos esconde essa diferença.
        </>,
      );
    }
    const semOrigem = vis.filter((c) => !c.origem || c.origem === "Não informado").length;
    if (semOrigem) {
      achados.push(
        <>
          <Forte>{fmtPct(semOrigem / vis.length)} das posições não têm origem registrada</Forte>. Sem
          isso não dá para saber qual canal vale o investimento.
        </>,
      );
    }
  }

  const colunas: Array<Coluna<Contratacao>> = [
    { chave: "dtAceite", rotulo: "Movimentação", texto: (c) => fmtData(c.dtAceite) },
    { chave: "codigo", rotulo: "Vaga", quebra: true },
    { chave: "vaga", rotulo: "Posição", quebra: true },
    { chave: "depto", rotulo: "Departamento", quebra: true },
    { chave: "filial", rotulo: "Filial" },
    { chave: "recrutador", rotulo: "Recrutador(a)" },
    { chave: "gestor", rotulo: "Gestor(a)" },
    { chave: "tmPosicao", rotulo: "Tempo da vaga", numero: true, texto: (c) => `${fmtN(c.tmPosicao)} d` },
    { chave: "origem", rotulo: "Origem" },
    { chave: "salContr", rotulo: "Salário", numero: true, texto: (c) => fmtBRL(c.salContr) },
  ];

  return (
    <>
      <Regua
        meses={meses}
        campos={[
          { chave: "status", rotulo: "Departamento", opcoes: opcoesDe(todas, "depto") },
          { chave: "filial", rotulo: "Filial", opcoes: opcoesDe(todas, "filial") },
          { chave: "cargo", rotulo: "Posição", opcoes: opcoesDe(todas, "vaga") },
          { chave: "recrutador", rotulo: "Recrutador(a)", opcoes: opcoesDe(todas, "recrutador") },
          { chave: "gestor", rotulo: "Gestor(a)", opcoes: opcoesDe(todas, "gestor") },
        ]}
        contagem={{ visiveis: vis.length, total: todas.length }}
        unidade="posições fechadas"
      />

      <div className="rs-grade" style={{ marginTop: 16 }}>
        <div className="rs-c12">
          <FaixaLeituras itens={leituras} />
        </div>

        <Placa
          titulo="Posições fechadas por mês"
          nota="Quando a posição saiu do quadro de abertas."
          span="rs-c7"
          tabela={tabelaBarras(porMesSerie, "Mês", "Posições")}
        >
          <Colunas dados={porMesSerie} altura={230} agora={porMesSerie[porMesSerie.length - 1]?.k} />
        </Placa>

        <Placa
          titulo="Tempo da vaga por faixa"
          nota="Da aprovação da O&R à movimentação. Mais escuro é mais tempo."
          span="rs-c5"
          tabela={tabelaBarras(distTm, "Faixa", "Posições")}
        >
          <Colunas dados={distTm} altura={230} rotularTodas />
        </Placa>

        <Placa titulo="Tempo da vaga por posição" nota="Mediana com faixa p25–p75." span="rs-c6" tabela={tabelaFaixa(tmPorCargo, "Posição")}>
          <Faixa dados={tmPorCargo} />
        </Placa>

        <Placa titulo="Tempo da vaga por filial" nota="Mediana com faixa p25–p75." span="rs-c6" tabela={tabelaFaixa(tmPorFilial, "Filial")}>
          <Faixa dados={tmPorFilial} />
        </Placa>

        <Placa titulo="Posições por departamento" nota="Onde o quadro foi reposto." span="rs-c6" tabela={tabelaBarras(porDepto, "Departamento", "Posições")}>
          <Barras dados={porDepto} />
        </Placa>

        <Placa titulo="Origem da candidatura" nota="Canal registrado na Gupy." span="rs-c6" tabela={tabelaBarras(porOrigem, "Origem", "Posições")}>
          <Barras dados={porOrigem} />
        </Placa>

        <Achados itens={achados} />
        <Tabela titulo="Posições fechadas no período" linhas={vis} colunas={colunas} ordemInicial="dtAceite" />
      </div>
    </>
  );
}
