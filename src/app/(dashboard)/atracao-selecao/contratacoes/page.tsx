"use client";

/** Fluxo: volume, tempos e de onde vêm as pessoas. */

import { useMemo } from "react";

import { Barras, Colunas, Empilhado, Faixa, Placa, tabelaBarras, tabelaEmpilhada, tabelaFaixa } from "@/components/atracao-selecao/graficos";
import { Achados, FaixaLeituras, Forte, Regua, Tabela, type Coluna } from "@/components/atracao-selecao/ui";
import { fmtBRL, fmtData, fmtMes, fmtN, fmtPct } from "@/lib/rs/metricas";
import { contarPor, distribuicaoPor, maiores, mean, mediana, nums, percentil, porMes, proporcao } from "@/lib/rs/stats";
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
  const admissao = nums(vis, "dAceiteAdm");
  const salarios = nums(vis, "salContr");
  const piso = salarios.length ? Math.min(...salarios) : null;
  const semOrigem = vis.filter((c) => c.origem === "Não informado").length;
  const pcd = vis.filter((c) => c.pcd).length;
  const mulheres = vis.filter((c) => c.genero === "Feminino").length;

  const leituras = [
    { rotulo: "Posições fechadas", valor: fmtN(vis.length), contexto: `${fmtN(new Set(vis.map((c) => c.idVaga)).size)} vagas distintas` },
    { rotulo: "Tempo médio da vaga", valor: fmtN(mediana(tempos)), unidade: "d mediana", contexto: `p90 ${fmtN(percentil(tempos, 0.9))} d · ${fmtPct(tempos.length ? tempos.filter((v) => v <= 30).length / tempos.length : null)} em até 30 d` },
    { rotulo: "Aceite até a admissão", valor: fmtN(mediana(admissao)), unidade: "d mediana", contexto: `p90 ${fmtN(percentil(admissao, 0.9))} d · janela da documentação` },
    { rotulo: "Salário contratado", valor: fmtBRL(mediana(salarios)), contexto: piso !== null ? `${fmtPct(salarios.filter((v) => v === piso).length / salarios.length)} no piso da amostra` : "" },
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
    if (admissao.length) {
      achados.push(
        <>
          Entre aceitar a carta e ser admitido passam <Forte>{fmtN(mediana(admissao))} dias medianos</Forte> (p90 de {fmtN(percentil(admissao, 0.9))}). É a janela em que aviso prévio, exame admissional e documentação derrubam candidatos já aprovados.
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
    { chave: "dAceiteAdm", rotulo: "Aceite→admissão", numero: true, texto: (c) => `${fmtN(c.dAceiteAdm)} d` },
    { chave: "salContr", rotulo: "Salário", numero: true, texto: (c) => fmtBRL(c.salContr) },
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

        <Placa titulo="Aceites de carta oferta por mês" nota="Quando o candidato aceitou a proposta." span="rs-c8" tabela={tabelaBarras(aceites, "Mês", "Aceites")}>
          <Colunas dados={aceites} altura={214} agora={fmtMes(mesMaximo)} />
        </Placa>

        <Placa titulo="Origem da candidatura" nota="Canal registrado na Gupy. Cinza é campo em branco." span="rs-c4" tabela={tabelaBarras(porOrigem, "Origem", "Contratações")}>
          <Barras dados={porOrigem} />
        </Placa>

        <Placa titulo="Tempo de posição por filial" nota="Mediana com faixa p25–p75, em dias da aprovação ao aceite." span="rs-c8" tabela={tabelaFaixa(tempoPorFilial, "Filial")}>
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
