"use client";

/** Histórico: as séries longas que a planilha nunca teve, porque era sobrescrita. */

import { useMemo } from "react";

import { Barras, Colunas, Empilhado, Faixa, Placa, tabelaBarras, tabelaEmpilhada, tabelaFaixa } from "@/components/atracao-selecao/graficos";
import { Achados, FaixaLeituras, Forte, Regua, Tabela, type Coluna } from "@/components/atracao-selecao/ui";
import { fmtBRL, fmtData, fmtMes, fmtN, fmtPct, RAMPA_AGING } from "@/lib/rs/metricas";
import { contarPor, distribuicaoPor, maiores, mediana, nums, percentil, proporcao, sum } from "@/lib/rs/stats";
import { aplicarFiltros, mesMaximoDe, opcoesDe, useAtracaoSelecao } from "@/store/atracao-selecao";
import type { VagaHistorico } from "@/types/atracao-selecao";

const FAIXAS_TTF: Array<[number, number, string]> = [
  [0, 31, "até 30 d"],
  [31, 61, "31–60"],
  [61, 91, "61–90"],
  [91, 181, "91–180"],
  [181, Number.POSITIVE_INFINITY, "mais de 180"],
];

export default function PaginaHistorico() {
  const { dados, filtros } = useAtracaoSelecao();
  const todas = useMemo(() => dados?.hist ?? [], [dados]);
  const mesMaximo = useMemo(() => mesMaximoDe(todas, "mesCriacao"), [todas]);

  const meses = useMemo(() => {
    const lista = Array.from(new Set(todas.map((v) => v.mesCriacao).filter(Boolean))).sort().reverse();
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
        { periodo: "mesCriacao", filial: "filial", cargo: "vaga", recrutador: "recrutador", gestor: "gestor" },
        mesMaximo,
      ),
    [todas, filtros, mesMaximo],
  );

  if (!dados) return null;

  const encerradas = vis.filter((v) => v.status === "Encerrada");
  const ttf = nums(encerradas, "ttf");
  const posicoes = sum(vis, "posicoes");
  const contratados = sum(vis, "contratados");
  const inscritos = sum(vis, "inscritos");
  const semContratacao = encerradas.filter((v) => !v.contratados).length;

  const leituras = [
    { rotulo: "Vagas no período", valor: fmtN(vis.length), contexto: `${fmtN(posicoes)} posições solicitadas` },
    { rotulo: "Contratações", valor: fmtN(contratados), contexto: `preenchimento de ${fmtPct(posicoes ? contratados / posicoes : null)}` },
    { rotulo: "Tempo de preenchimento", valor: fmtN(mediana(ttf)), unidade: "d mediana", contexto: `p90 ${fmtN(percentil(ttf, 0.9))} d · mercado 39 a 44 d` },
    { rotulo: "Aprovação da O&R", valor: fmtN(mediana(nums(vis, "tmOR"))), unidade: "d mediana", contexto: `publicação em ${fmtN(mediana(nums(vis, "tmRS")))} d` },
    { rotulo: "Inscritos por posição", valor: fmtN(posicoes ? inscritos / posicoes : null), contexto: `${fmtN(inscritos)} inscritos acumulados` },
    { rotulo: "Encerradas sem contratar", valor: fmtN(semContratacao), contexto: `${fmtPct(proporcao(encerradas, (v) => !v.contratados))} das encerradas` },
  ];

  const trimestres = Array.from(new Set(vis.map((v) => v.trimestre).filter(Boolean))).sort().map((t) => t as string);
  const seriesTri = [
    { nome: "Posições preenchidas", cor: "var(--rs-rampa-2)", valores: Object.fromEntries(trimestres.map((t) => [t, vis.filter((v) => v.trimestre === t).reduce((a, v) => a + v.contratados, 0)])) },
    { nome: "Não preenchidas", cor: "var(--rs-atencao)", valores: Object.fromEntries(trimestres.map((t) => [t, Math.max(0, vis.filter((v) => v.trimestre === t).reduce((a, v) => a + v.posicoes - v.contratados, 0))])) },
  ];

  const distTtf = FAIXAS_TTF.map(([min, max, rotulo], i) => ({
    k: rotulo,
    v: ttf.filter((d) => d >= min && d < max).length,
    cor: RAMPA_AGING[Math.min(i, RAMPA_AGING.length - 1)],
  }));
  const ttfPorCargo = distribuicaoPor(encerradas, "vaga", "ttf", 4).slice(0, 8);
  const ttfPorFilial = distribuicaoPor(encerradas, "filial", "ttf", 4).slice(0, 8);
  const porTipo = maiores(contarPor(vis, "tipoRecrut"), 5).map((x) => ({ ...x, cor: x.k === "Não informado" ? "var(--rs-serie-nula)" : undefined }));
  const porAbertura = maiores(contarPor(vis, "motivoAbertura"), 6);
  const porStatus = maiores(contarPor(vis, "status"), 5);

  const achados: React.ReactNode[] = [];
  if (vis.length) {
    achados.push(
      <>
        <Forte>{fmtN(vis.length)} vagas, {fmtN(posicoes)} posições e {fmtN(contratados)} contratações</Forte> no período filtrado, com taxa de preenchimento de {fmtPct(posicoes ? contratados / posicoes : null)}.
      </>,
    );
    if (ttf.length) {
      achados.push(
        <>
          O tempo de preenchimento tem <Forte>mediana de {fmtN(mediana(ttf))} dias e p90 de {fmtN(percentil(ttf, 0.9))}</Forte>. A referência da SHRM é uma mediana de 39 a 44 dias, e o setor de energia costuma ficar acima disso.
        </>,
      );
    }
    const or = mediana(nums(vis, "tmOR"));
    const rs = mediana(nums(vis, "tmRS"));
    if (or !== null && rs !== null) {
      achados.push(
        <>
          A abertura consome <Forte>{fmtN(or + rs)} dias medianos</Forte> ({fmtN(or)} até a aprovação da O&R e {fmtN(rs)} até a publicação). É pequena diante do tempo total, o que confirma que o gargalo está na seleção.
        </>,
      );
    }
    if (ttfPorCargo.length > 1) {
      const lento = ttfPorCargo[ttfPorCargo.length - 1];
      const rapido = ttfPorCargo[0];
      achados.push(
        <>
          Por cargo, <Forte>{lento.k} leva {fmtN(lento.v)} dias medianos</Forte> contra {fmtN(rapido.v)} de {rapido.k}. Um prazo-alvo único para todos os cargos esconde essa diferença.
        </>,
      );
    }
    if (semContratacao) {
      achados.push(
        <>
          <Forte>{fmtN(semContratacao)} vagas foram encerradas sem nenhuma contratação</Forte> ({fmtPct(semContratacao / (encerradas.length || 1))} das encerradas), somando {fmtN(encerradas.filter((v) => !v.contratados).reduce((a, v) => a + v.posicoes, 0))} posições. Vale entender se foram canceladas, substituídas ou preenchidas por outra via.
        </>,
      );
    }
    const interno = vis.filter((v) => /Interno|Meritocracia/i.test(v.tipoRecrut)).length;
    achados.push(
      <>
        O recrutamento interno aparece em <Forte>{fmtN(interno)} vagas</Forte> ({fmtPct(interno / vis.length)}), contra uma referência de mercado de 8% a 16% de posições preenchidas internamente.
      </>,
    );
  }

  const colunas: Array<Coluna<VagaHistorico>> = [
    { chave: "codigo", rotulo: "Código", texto: (v) => String(v.codigo) },
    { chave: "vaga", rotulo: "Vaga", quebra: true },
    { chave: "status", rotulo: "Status" },
    { chave: "filial", rotulo: "Filial" },
    { chave: "area", rotulo: "Área", quebra: true },
    { chave: "recrutador", rotulo: "Recrutador(a)" },
    { chave: "gestor", rotulo: "Gestor(a)" },
    { chave: "posicoes", rotulo: "Posições", numero: true },
    { chave: "contratados", rotulo: "Contratados", numero: true },
    { chave: "inscritos", rotulo: "Inscritos", numero: true, texto: (v) => fmtN(v.inscritos) },
    { chave: "dtCriacao", rotulo: "Criação", texto: (v) => fmtData(v.dtCriacao) },
    { chave: "dtFech", rotulo: "Fechamento", texto: (v) => fmtData(v.dtFech) },
    { chave: "ttf", rotulo: "Preenchimento", numero: true, texto: (v) => `${fmtN(v.ttf)} d` },
    { chave: "tmOR", rotulo: "O&R", numero: true, texto: (v) => `${fmtN(v.tmOR)} d` },
    { chave: "motivoReq", rotulo: "Motivo da requisição", quebra: true },
    { chave: "tipoRecrut", rotulo: "Tipo de recrutamento", quebra: true },
    { chave: "salIni", rotulo: "Salário", numero: true, texto: (v) => fmtBRL(v.salIni) },
  ];

  return (
    <>
      <Regua
        meses={meses}
        campos={[
          { chave: "filial", rotulo: "Filial", opcoes: opcoesDe(todas, "filial") },
          { chave: "cargo", rotulo: "Vaga", opcoes: opcoesDe(todas, "vaga") },
          { chave: "recrutador", rotulo: "Recrutador(a)", opcoes: opcoesDe(todas, "recrutador") },
          { chave: "gestor", rotulo: "Gestor(a)", opcoes: opcoesDe(todas, "gestor") },
        ]}
        contagem={{ visiveis: vis.length, total: todas.length }}
        unidade="vagas"
      />

      <div className="rs-grade" style={{ marginTop: 16 }}>
        <div className="rs-c12"><FaixaLeituras itens={leituras} /></div>

        <Placa titulo="Posições por trimestre de criação" nota="Preenchidas e não preenchidas." span="rs-c8" legenda={seriesTri.map((s) => ({ nome: s.nome, cor: s.cor }))} tabela={tabelaEmpilhada(trimestres, seriesTri, "Trimestre", false)}>
          <Empilhado categorias={trimestres} series={seriesTri} />
        </Placa>

        <Placa titulo="Tempo de preenchimento" nota="Vagas encerradas, da criação ao fechamento." span="rs-c4" tabela={tabelaBarras(distTtf, "Faixa", "Vagas")}>
          <Colunas dados={distTtf} altura={200} rotularTodas />
        </Placa>

        <Placa titulo="Preenchimento por cargo" nota="Mediana com faixa p25–p75." span="rs-c6" tabela={tabelaFaixa(ttfPorCargo, "Cargo")}>
          <Faixa dados={ttfPorCargo} />
        </Placa>

        <Placa titulo="Preenchimento por filial" nota="Mediana com faixa p25–p75." span="rs-c6" tabela={tabelaFaixa(ttfPorFilial, "Filial")}>
          <Faixa dados={ttfPorFilial} />
        </Placa>

        <Placa titulo="Tipo de recrutamento" nota="Como a vaga foi preenchida." span="rs-c4" tabela={tabelaBarras(porTipo, "Tipo", "Vagas")}>
          <Barras dados={porTipo} />
        </Placa>

        <Placa titulo="Motivo da abertura" nota="O que gerou a requisição." span="rs-c4" tabela={tabelaBarras(porAbertura, "Motivo", "Vagas")}>
          <Barras dados={porAbertura} />
        </Placa>

        <Placa titulo="Situação das vagas" nota="Estado atual na Gupy." span="rs-c4" tabela={tabelaBarras(porStatus, "Status", "Vagas")}>
          <Barras dados={porStatus} />
        </Placa>

        <Achados itens={achados} />
        <Tabela titulo="Histórico de vagas" linhas={vis} colunas={colunas} ordemInicial="dtCriacao" />
      </div>
    </>
  );
}
