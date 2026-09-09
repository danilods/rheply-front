"use client";

/** Estoque: quanto está aberto, há quanto tempo e onde parou. */

import { useMemo } from "react";

import { Barras, Colunas, Empilhado, Placa, tabelaBarras, tabelaEmpilhada } from "@/components/atracao-selecao/graficos";
import {
  Achados,
  BarraEstado,
  Etiqueta,
  FaixaLeituras,
  Forte,
  Regua,
  Tabela,
  type Classe,
  type Coluna,
} from "@/components/atracao-selecao/ui";
import {
  FAIXAS_AGING,
  faixaAging,
  fmtBRL,
  fmtData,
  fmtMes,
  fmtN,
  fmtPct,
  prazoAlvo,
  RAMPA_AGING,
  vagaAtrasada,
} from "@/lib/rs/metricas";
import { contarPor, dispersao, maiores, mediana, nums, percentil, porMes, proporcao, somarPor, sum } from "@/lib/rs/stats";
import { aplicarFiltros, mesMaximoDe, opcoesDe, useAtracaoSelecao } from "@/store/atracao-selecao";
import type { VagaAberta } from "@/types/atracao-selecao";

export default function PaginaVagas() {
  const { dados, filtros } = useAtracaoSelecao();
  const todas = useMemo(() => dados?.abertas ?? [], [dados]);
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
        { periodo: "mesCriacao", gerencia: "gerencia", status: "status", filial: "filial", cargo: "vaga", recrutador: "recrutador", gestor: "gestor" },
        mesMaximo,
      ),
    [todas, filtros, mesMaximo],
  );

  if (!dados) return null;

  const agings = nums(vis, "aging");
  const atrasadas = vis.filter(vagaAtrasada);
  const congeladas = vis.filter((v) => v.status === "Congelada");
  const posAbertas = sum(vis, "posAbertas");
  const inscritos = sum(vis, "inscritos");

  const classes: Classe[] = [
    { severidade: "alarme", palavra: "Fora do prazo", contagem: atrasadas.length, prazo: `${fmtPct(proporcao(vis, vagaAtrasada))} das vagas abertas` },
    { severidade: "atencao", palavra: "Congelada", contagem: congeladas.length, prazo: "continua contando dias sem avançar" },
    { severidade: "processo", palavra: "Ativa", contagem: vis.filter((v) => v.status === "Ativa").length, prazo: "publicada e recebendo" },
    { severidade: "normal", palavra: "Aprovada", contagem: vis.filter((v) => v.status === "Aprovada").length, prazo: "aguardando publicação" },
  ];

  const leituras = [
    { rotulo: "Requisições abertas", valor: fmtN(new Set(vis.map((v) => v.req || v.codigo)).size), unidade: "requisições", contexto: `${fmtN(vis.length)} vagas no quadro` },
    { rotulo: "Posições abertas", valor: fmtN(posAbertas), contexto: `de ${fmtN(sum(vis, "posicoes"))} solicitadas`, parte: { valor: posAbertas, total: sum(vis, "posicoes") } },
    // Item 5: o tempo da vaga conta da aprovação até a movimentação para
    // contratação. Nestas, que ainda não fecharam, o relógio corre até hoje —
    // é a mesma conta da planilha (TM FECHAMENTO), com a data de hoje no lugar
    // da movimentação que ainda não aconteceu.
    {
      rotulo: "Tempo médio da vaga",
      valor: fmtN(mediana(agings)),
      unidade: "dias",
      contexto: `na metade dos casos · da aprovação até hoje · 9 em cada 10 em até ${fmtN(percentil(agings, 0.9))} d`,
      distribuicao: dispersao(agings),
    },
    // Item 4: etapas como indicador, nunca somadas ao tempo da vaga.
    { rotulo: "Indicador O&R", valor: fmtN(mediana(nums(vis, "tmOR"))), unidade: "dias", contexto: "criação até a aprovação", distribuicao: dispersao(nums(vis, "tmOR")) },
    { rotulo: "Indicador R&S", valor: fmtN(mediana(nums(vis, "tmRS"))), unidade: "dias", contexto: "aprovação até a publicação", distribuicao: dispersao(nums(vis, "tmRS")) },
    { rotulo: "Inscritos por posição", valor: fmtN(posAbertas ? inscritos / posAbertas : null), contexto: `${fmtN(inscritos)} inscritos no total` },
  ];

  /* -------- gráficos -------- */

  const faixas = FAIXAS_AGING.map((f) => f.rotulo).filter((r) => vis.some((v) => faixaAging(v.aging) === r));
  const porFaixa = faixas.map((f, i) => ({
    k: f,
    v: vis.filter((v) => faixaAging(v.aging) === f).length,
    cor: RAMPA_AGING[Math.min(i, RAMPA_AGING.length - 1)],
  }));
  const porFilial = maiores(somarPor(vis, "filial", "posAbertas")).filter((x) => x.v);
  const porCargo = maiores(contarPor(vis, "vaga"), 7);
  const porMotivo = maiores(contarPor(vis, "motivoAbertura"), 6);
  const porGestor = maiores(contarPor(vis, "gestor"), 8);
  const criadas = porMes(vis, "mesCriacao").map((x) => ({ k: fmtMes(x.k), v: x.v }));

  /*
   * Posições ao lado das vagas.
   *
   * Uma requisição pode pedir uma posição ou doze, e contar requisições esconde
   * isso: dois gestores com cinco vagas cada podem estar pedindo cinco e
   * cinquenta pessoas. As duas séries partem das mesmas chaves e da mesma
   * ordem — quem manda é a lista de vagas, e as posições apenas a acompanham,
   * senão as barras de baixo apontariam para a categoria errada.
   */
  const posPorGestor = somarPor(vis, "gestor", "posAbertas");
  const posGestorSerie = porGestor.map((g) => posPorGestor.get(g.k) ?? 0);
  const posPorMes = somarPor(vis, "mesCriacao", "posAbertas");
  const posMesSerie = porMes(vis, "mesCriacao").map((x) => posPorMes.get(x.k) ?? 0);

  const recrutadores = Array.from(new Set(vis.map((v) => v.recrutador))).filter(Boolean);
  const seriesCiclo = [
    { nome: "O&R, criação até aprovação", cor: "var(--rs-rampa-2)", valores: Object.fromEntries(recrutadores.map((r) => [r, mediana(nums(vis.filter((v) => v.recrutador === r), "tmOR")) ?? 0])) },
    { nome: "R&S, aprovação até publicação", cor: "var(--rs-rampa-4)", valores: Object.fromEntries(recrutadores.map((r) => [r, mediana(nums(vis.filter((v) => v.recrutador === r), "tmRS")) ?? 0])) },
  ];

  /* -------- achados -------- */

  const achados: React.ReactNode[] = [];
  if (vis.length) {
    const cargoTop = porCargo[0];
    const filialTop = porFilial[0];
    const or = mediana(nums(vis, "tmOR"));
    const rs = mediana(nums(vis, "tmRS"));
    const ag = mediana(agings);

    if (congeladas.length) {
      achados.push(
        <>
          <Forte>{fmtPct(congeladas.length / vis.length)} das vagas estão congeladas</Forte> ({fmtN(congeladas.length)} de {fmtN(vis.length)}). Vaga congelada não avança e continua contando como estoque aberto na leitura da gerência.
        </>,
      );
      achados.push(
        <>
          O dado de congelamento vem em bloco da planilha: todas as congeladas compartilham o mesmo par de datas. Por isso o tempo líquido some para vagas aprovadas depois de junho, e o número oficial aqui é o bruto. Registrar o congelamento por vaga é a correção.
        </>,
      );
    }
    if (cargoTop) {
      achados.push(
        <>
          <Forte>{cargoTop.k} concentra {fmtN(cargoTop.v)} das {fmtN(vis.length)} vagas</Forte>
          {filialTop ? <> e {filialTop.k} responde por {fmtN(filialTop.v)} das {fmtN(posAbertas)} posições a preencher</> : null}.
        </>,
      );
    }
    if (or !== null && rs !== null && ag !== null) {
      achados.push(
        <>
          A abertura é rápida: <Forte>{fmtN(or + rs)} dias medianos da criação à publicação</Forte> ({fmtN(or)} na O&R, {fmtN(rs)} no R&S), mas a vaga fica <Forte>{fmtN(ag)} dias</Forte> após a aprovação sem fechar. O gargalo está na seleção, não na abertura.
        </>,
      );
    }
    if (atrasadas.length) {
      const pior = [...atrasadas].sort((a, b) => (b.aging ?? 0) - (a.aging ?? 0))[0];
      achados.push(
        <>
          <Forte>{fmtN(atrasadas.length)} vagas passaram do prazo-alvo.</Forte> A mais antiga é {pior.vaga} em {pior.filial}, com {pior.gestor}, aberta há <Forte>{fmtN(pior.aging)} dias</Forte> contra um alvo de {prazoAlvo(pior.vaga)}.
        </>,
      );
    }
    if (posAbertas) {
      achados.push(
        <>
          São <Forte>{fmtN(inscritos)} inscritos para {fmtN(posAbertas)} posições</Forte>, cerca de {fmtN(inscritos / posAbertas)} por posição. O volume de candidatura não é o problema; a conversão até a aprovação é.
        </>,
      );
    }
  }

  const colunas: Array<Coluna<VagaAberta>> = [
    { chave: "codigo", rotulo: "Código", texto: (v) => String(v.codigo) },
    { chave: "vaga", rotulo: "Vaga", quebra: true },
    {
      chave: "status",
      rotulo: "Estado",
      render: (v) => (
        <Etiqueta severidade={vagaAtrasada(v) ? "alarme" : v.status === "Congelada" ? "atencao" : v.status === "Ativa" ? "processo" : "normal"}>
          {vagaAtrasada(v) ? "Fora do prazo" : v.status}
        </Etiqueta>
      ),
    },
    { chave: "aging", rotulo: "Aberta há", numero: true, texto: (v) => `${fmtN(v.aging)} d` },
    { chave: "agingLiq", rotulo: "Líquido", numero: true, texto: (v) => `${fmtN(v.agingLiq)} d` },
    { chave: "filial", rotulo: "Filial" },
    { chave: "recrutador", rotulo: "Recrutador(a)" },
    { chave: "gestor", rotulo: "Gestor(a)" },
    { chave: "posicoes", rotulo: "Posições", numero: true },
    { chave: "posAbertas", rotulo: "Abertas", numero: true },
    { chave: "aprovados", rotulo: "Aprovados", numero: true },
    { chave: "inscritos", rotulo: "Inscritos", numero: true, texto: (v) => fmtN(v.inscritos) },
    { chave: "dtCriacao", rotulo: "Criação", texto: (v) => fmtData(v.dtCriacao) },
    { chave: "dtPub", rotulo: "Publicação", texto: (v) => fmtData(v.dtPub) },
    { chave: "tmCiclo", rotulo: "Ciclo", numero: true, texto: (v) => `${fmtN(v.tmCiclo)} d` },
    { chave: "tipoAbertura", rotulo: "Tipo de abertura", quebra: true },
    { chave: "salIni", rotulo: "Salário", numero: true, texto: (v) => fmtBRL(v.salIni) },
  ];

  return (
    <>
      <Regua
        meses={meses}
        campos={[
          { chave: "gerencia", rotulo: "Gerência", opcoes: opcoesDe(todas, "gerencia") },
          { chave: "status", rotulo: "Status", opcoes: opcoesDe(todas, "status") },
          { chave: "filial", rotulo: "Filial", opcoes: opcoesDe(todas, "filial") },
          { chave: "cargo", rotulo: "Vaga", opcoes: opcoesDe(todas, "vaga") },
          { chave: "recrutador", rotulo: "Recrutador(a)", opcoes: opcoesDe(todas, "recrutador") },
          { chave: "gestor", rotulo: "Gestor(a)", opcoes: opcoesDe(todas, "gestor") },
        ]}
        contagem={{ visiveis: vis.length, total: todas.length }}
        unidade="vagas"
      />

      <div className="rs-grade" style={{ marginTop: 16 }}>
        <div className="rs-c12"><BarraEstado classes={classes} /></div>
        <div className="rs-c12"><FaixaLeituras itens={leituras} /></div>

        <Placa titulo="Há quanto tempo estão abertas" nota="Dias corridos desde a aprovação. Escala de magnitude: mais escuro é mais tempo parado." span="rs-c5" tabela={tabelaBarras(porFaixa, "Faixa", "Vagas")}>
          <Barras dados={porFaixa} />
        </Placa>

        <Placa titulo="Posições a preencher por filial" nota="Soma das posições ainda abertas." span="rs-c7" tabela={tabelaBarras(porFilial, "Filial", "Posições")}>
          <Barras dados={porFilial} />
        </Placa>

        <Placa titulo="Vagas por cargo" nota="Requisições em aberto." span="rs-c4" tabela={tabelaBarras(porCargo, "Cargo", "Vagas")}>
          <Barras dados={porCargo} />
        </Placa>

        <Placa titulo="Abertura por recrutador(a)" nota="Dias medianos até a aprovação e até a publicação." span="rs-c4" legenda={seriesCiclo.map((s) => ({ nome: s.nome, cor: s.cor }))} tabela={tabelaEmpilhada(recrutadores, seriesCiclo, "Recrutador(a)", false)}>
          <Empilhado categorias={recrutadores} series={seriesCiclo} />
        </Placa>

        <Placa
          titulo="Vagas e posições criadas por mês"
          nota="Requisições que seguem em aberto, e quantas pessoas elas pedem."
          span="rs-c4"
          legenda={[{ nome: "Vagas", cor: "var(--rs-rampa-2)" }, { nome: "Posições", cor: "var(--rs-rampa-1)" }]}
          tabela={{
            cabecalhos: ["Mês", "Vagas", "Posições"],
            linhas: criadas.map((c, i) => [c.k, fmtN(c.v), fmtN(posMesSerie[i])]),
          }}
          total={{ rotulo: "Posições a preencher", valor: fmtN(posAbertas) }}
        >
          <Colunas
            dados={criadas}
            altura={214}
            agora={fmtMes(mesMaximo)}
            serieExtra={{ nome: "Posições", nomeBase: "Vagas", valores: posMesSerie }}
          />
        </Placa>

        <Placa titulo="Motivo da abertura" nota="O que originou a requisição." span="rs-c6" tabela={tabelaBarras(porMotivo, "Motivo", "Vagas")}>
          <Barras dados={porMotivo} />
        </Placa>

        <Placa
          titulo="Vagas e posições por gestor(a)"
          nota="Quem tem requisições aguardando, e quantas pessoas elas somam."
          span="rs-c6"
          legenda={[{ nome: "Vagas", cor: "var(--rs-rampa-2)" }, { nome: "Posições", cor: "var(--rs-rampa-1)" }]}
          tabela={{
            cabecalhos: ["Gestor(a)", "Vagas", "Posições"],
            linhas: porGestor.map((g, i) => [g.k, fmtN(g.v), fmtN(posGestorSerie[i])]),
          }}
        >
          <Barras dados={porGestor} serieExtra={{ nome: "Posições", nomeBase: "Vagas", valores: posGestorSerie }} />
        </Placa>

        <Achados itens={achados} />
        <Tabela titulo="Vagas em aberto" linhas={vis} colunas={colunas} ordemInicial="aging" />
      </div>
    </>
  );
}
