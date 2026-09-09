"use client";

/** Fluxo: volume, tempos e de onde vêm as pessoas. */

import { useMemo } from "react";

import { Barras, Colunas, Empilhado, Faixa, Placa, tabelaBarras, tabelaEmpilhada, tabelaFaixa } from "@/components/atracao-selecao/graficos";
import { Achados, FaixaLeituras, Forte, Regua, Tabela, type Coluna } from "@/components/atracao-selecao/ui";
import { fmtData, fmtMes, fmtN, fmtPct } from "@/lib/rs/metricas";
import { contarPor, dispersao, distribuicaoPor, maiores, mean, mediana, medianaPorGrupo, nums, porMes, proporcao } from "@/lib/rs/stats";
import { aplicarFiltros, mesMaximoDe, opcoesDe, useAtracaoSelecao } from "@/store/atracao-selecao";
import type { Contratacao } from "@/types/atracao-selecao";

const FAIXAS_ETARIAS = ["18–24", "25–34", "35–44", "45+", "Não informado"];

export default function PaginaContratacoes() {
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
        { periodo: "mes", status: "depto", filial: "filial", cargo: "vaga", recrutador: "recrutador", gestor: "gestor" },
        mesMaximo,
      ),
    [todas, filtros, mesMaximo],
  );

  if (!dados) return null;

  const tempos = nums(vis, "tmPosicao");
  /* As duas etapas da requisição que originou cada posição. Vêm cruzadas do
     servidor com a base de vagas: a planilha de contratações não traz criação
     nem publicação, e o encontro acontece no banco, onde a tabela de vagas está
     inteira — inclusive as requisições que já fecharam. */
  const or = nums(vis, "tmOR");
  const rs = nums(vis, "tmRS");
  // O mesmo relógio da posição, agregado por requisição.
  const porReq = medianaPorGrupo(vis, "codigo", "tmPosicao");
  const semOrigem = vis.filter((c) => c.origem === "Não informado").length;
  const pcd = vis.filter((c) => c.pcd).length;
  const mulheres = vis.filter((c) => c.genero === "Feminino").length;

  const leituras = [
    { rotulo: "Posições fechadas", valor: fmtN(vis.length), contexto: `${fmtN(new Set(vis.map((c) => c.idVaga)).size)} vagas distintas` },
    {
      rotulo: "Tempo médio da vaga",
      valor: fmtN(mediana(tempos)),
      unidade: "dias",
      secundario: { valor: fmtN(porReq), rotulo: "por requisição" },
      contexto: "da aprovação à movimentação · por posição e por requisição",
      distribuicao: dispersao(tempos),
    },
    { rotulo: "Indicador O&R", valor: fmtN(mediana(or)), unidade: "dias", contexto: "criação até a aprovação da requisição", distribuicao: dispersao(or) },
    { rotulo: "Indicador de recrutamento", valor: fmtN(mediana(rs)), unidade: "dias", contexto: "aprovação até a publicação da vaga", distribuicao: dispersao(rs) },
    { rotulo: "Mulheres", valor: fmtPct(proporcao(vis, (c) => c.genero === "Feminino")), contexto: `${fmtN(mulheres)} contratações` },
    { rotulo: "Pessoas com deficiência", valor: fmtN(pcd), contexto: `${fmtPct(proporcao(vis, (c) => c.pcd))} das admissões · a cota é sobre o quadro` },
  ];

  const aceites = porMes(vis, "mes").map((x) => ({ k: fmtMes(x.k), v: x.v }));
  const porOrigem = maiores(contarPor(vis, "origem"), 8).map((x) => ({ ...x, cor: x.k === "Não informado" ? "var(--rs-serie-nula)" : undefined }));
  const porCargo = maiores(contarPor(vis, "vaga"), 7);
  const porGenero = maiores(contarPor(vis, "genero"), 5).map((x) => ({ ...x, cor: x.k === "Não informado" ? "var(--rs-serie-nula)" : undefined }));
  const tempoPorFilial = distribuicaoPor(vis, "filial", "tmPosicao", 3);
  const mapaEtaria = contarPor(vis, "faixaEtaria");
  const porIdade = FAIXAS_ETARIAS.filter((f) => mapaEtaria.get(f)).map((f) => ({ k: f, v: mapaEtaria.get(f) as number }));

  const mesesSerie = porMes(vis, "mes").map((x) => x.k);
  const seriesMotivo = [
    { nome: "Substituição de pessoal", cor: "var(--rs-rampa-2)", valores: Object.fromEntries(mesesSerie.map((m) => [fmtMes(m), vis.filter((c) => c.mes === m && c.motivoReq === "Substituição de pessoal").length])) },
    { nome: "Aumento de quadro", cor: "var(--rs-rampa-4)", valores: Object.fromEntries(mesesSerie.map((m) => [fmtMes(m), vis.filter((c) => c.mes === m && c.motivoReq === "Aumento de quadro").length])) },
  ];

  const achados: React.ReactNode[] = [];
  if (vis.length) {
    const serie = porMes(vis, "mes");
    if (serie.length > 1) {
      const pico = serie.reduce((a, b) => (b.v > a.v ? b : a));
      const vale = serie.reduce((a, b) => (b.v < a.v ? b : a));
      achados.push(
        <>
          <Forte>{fmtN(vis.length)} contratações</Forte> no período, com pico em {fmtMes(pico.k)} ({fmtN(pico.v)}) e vale em {fmtMes(vale.k)} ({fmtN(vale.v)}). O ritmo segue ondas, não um fluxo contínuo.
        </>,
      );
    }
    const cargoTop = maiores(contarPor(vis, "vaga"))[0];
    const filialTop = maiores(contarPor(vis, "filial"))[0];
    if (cargoTop) {
      achados.push(
        <>
          <Forte>{cargoTop.k} responde por {fmtPct(cargoTop.v / vis.length)} das contratações</Forte>
          {filialTop ? <> e {filialTop.k} por {fmtPct(filialTop.v / vis.length)}</> : null}.
        </>,
      );
    }
    if (tempos.length) {
      achados.push(
        <>
          O tempo de posição tem <Forte>mediana de {fmtN(mediana(tempos))} dias mas média de {fmtN(mean(tempos))}</Forte>: {fmtPct(tempos.filter((v) => v <= 30).length / tempos.length)} fecham em até 30 dias e a cauda, de até {fmtN(Math.max(...tempos))} dias, puxa a média. Por isso a mediana é a medida.
        </>,
      );
    }
    if (semOrigem) {
      const conhecidas = maiores(contarPor(vis.filter((c) => c.origem !== "Não informado"), "origem"));
      achados.push(
        <>
          <Forte>{fmtPct(semOrigem / vis.length)} das contratações não têm origem registrada</Forte>
          {conhecidas.length ? <>; entre as conhecidas, {conhecidas[0].k} lidera com {fmtPct(conhecidas[0].v / (vis.length - semOrigem))}</> : null}. Sem origem não dá para saber qual canal vale o investimento.
        </>,
      );
    }
    if (or.length && rs.length) {
      achados.push(
        <>
          Antes de a vaga ir ao ar passam <Forte>{fmtN(mediana(or))} dias até a requisição ser aprovada</Forte> e mais {fmtN(mediana(rs))} até ela ser publicada. Esse trecho acontece antes de existir candidato, e some da conta de quem olha só o tempo do recrutamento.
        </>,
      );
    }
    if (porReq !== null && mediana(tempos) !== null) {
      achados.push(
        <>
          Medido por posição, o tempo da vaga é de <Forte>{fmtN(mediana(tempos))} dias</Forte>; medido por requisição, {fmtN(porReq)}. Quando os dois se afastam é porque as requisições grandes correm em ritmo diferente das pequenas.
        </>,
      );
    }
    achados.push(
      <>
        <Forte>{fmtPct(mulheres / vis.length)} das contratações são de mulheres</Forte> e {fmtN(pcd)} são de pessoas com deficiência ({fmtPct(pcd / vis.length)}). A cota legal é medida sobre o quadro total, não sobre as admissões do período.
      </>,
    );
  }

  const colunas: Array<Coluna<Contratacao>> = [
    { chave: "dtAceite", rotulo: "Aceite", texto: (c) => fmtData(c.dtAceite) },
    { chave: "dtAdmissao", rotulo: "Admissão", texto: (c) => fmtData(c.dtAdmissao) },
    { chave: "vaga", rotulo: "Vaga", quebra: true },
    { chave: "filial", rotulo: "Filial" },
    { chave: "depto", rotulo: "Departamento", quebra: true },
    { chave: "recrutador", rotulo: "Recrutador(a)" },
    { chave: "gestor", rotulo: "Gestor(a)" },
    { chave: "origem", rotulo: "Origem" },
    { chave: "tmPosicao", rotulo: "Posição", numero: true, texto: (c) => `${fmtN(c.tmPosicao)} d` },
    { chave: "dInscAceite", rotulo: "Inscrição→aceite", numero: true, texto: (c) => `${fmtN(c.dInscAceite)} d` },
    { chave: "genero", rotulo: "Gênero" },
    { chave: "faixaEtaria", rotulo: "Faixa etária" },
    { chave: "uf", rotulo: "UF" },
    { chave: "pcd", rotulo: "PcD", texto: (c) => (c.pcd ? "Sim" : "Não") },
    { chave: "motivoReq", rotulo: "Motivo da requisição", quebra: true },
  ];

  return (
    <>
      <Regua
        meses={meses}
        campos={[
          { chave: "status", rotulo: "Departamento", opcoes: opcoesDe(todas, "depto") },
          { chave: "filial", rotulo: "Filial", opcoes: opcoesDe(todas, "filial") },
          { chave: "cargo", rotulo: "Vaga", opcoes: opcoesDe(todas, "vaga") },
          { chave: "recrutador", rotulo: "Recrutador(a)", opcoes: opcoesDe(todas, "recrutador") },
          { chave: "gestor", rotulo: "Gestor(a)", opcoes: opcoesDe(todas, "gestor") },
        ]}
        contagem={{ visiveis: vis.length, total: todas.length }}
        unidade="contratações"
      />

      <div className="rs-grade" style={{ marginTop: 16 }}>
        <div className="rs-c12"><FaixaLeituras itens={leituras} /></div>

        <Placa titulo="Posições fechadas por mês" nota="Quando a posição saiu do quadro de abertas." span="rs-c8" tabela={tabelaBarras(aceites, "Mês", "Aceites")}>
          <Colunas dados={aceites} altura={214} agora={fmtMes(mesMaximo)} />
        </Placa>

        <Placa titulo="Origem da candidatura" nota="Canal registrado na Gupy. Cinza é campo em branco." span="rs-c4" tabela={tabelaBarras(porOrigem, "Origem", "Contratações")}>
          <Barras dados={porOrigem} />
        </Placa>

        <Placa titulo="Tempo de posição por filial" nota="Dias da aprovação ao aceite." span="rs-c8" tabela={tabelaFaixa(tempoPorFilial, "Filial")}>
          <Faixa dados={tempoPorFilial} />
        </Placa>

        <Placa titulo="Faixa etária" nota="Idade na data do aceite, calculada na carga." span="rs-c4" tabela={tabelaBarras(porIdade, "Faixa", "Contratações")}>
          <Colunas dados={porIdade} altura={190} rotularTodas />
        </Placa>

        <Placa titulo="Cargos contratados" nota="Volume por cargo." span="rs-c4" tabela={tabelaBarras(porCargo, "Cargo", "Contratações")}>
          <Barras dados={porCargo} />
        </Placa>

        <Placa titulo="Gênero autodeclarado" nota="Como consta na inscrição." span="rs-c4" tabela={tabelaBarras(porGenero, "Gênero", "Contratações")}>
          <Barras dados={porGenero} />
        </Placa>

        <Placa titulo="Substituição x aumento de quadro" nota="Por mês de aceite." span="rs-c4" legenda={seriesMotivo.map((s) => ({ nome: s.nome, cor: s.cor }))} tabela={tabelaEmpilhada(mesesSerie.map(fmtMes), seriesMotivo, "Mês", false)}>
          <Empilhado categorias={mesesSerie.map(fmtMes)} series={seriesMotivo} />
        </Placa>

        <Achados itens={achados} />
        <Tabela titulo="Contratações, sem dados pessoais" linhas={vis} colunas={colunas} ordemInicial="dtAceite" />
      </div>
    </>
  );
}
