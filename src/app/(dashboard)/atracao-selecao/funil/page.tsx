"use client";

/** Funil: onde os candidatos param, e por quê. */

import { useMemo } from "react";

import { Barras, Colunas, Empilhado, Placa, Funil, tabelaBarras, tabelaEmpilhada, tabelaFunil } from "@/components/atracao-selecao/graficos";
import { Achados, BarraEstado, Etiqueta, FaixaLeituras, Forte, Regua, Tabela, type Classe, type Coluna, type Severidade } from "@/components/atracao-selecao/ui";
import { cascataFunil, COR_DESFECHO, fmtData, fmtMes, fmtN, fmtPct, LIMIARES, NOME_DESFECHO, ORDEM_DESFECHO } from "@/lib/rs/metricas";
import { contarPor, maiores, porMes, proporcao } from "@/lib/rs/stats";
import { aplicarFiltros, mesMaximoDe, opcoesDe, useAtracaoSelecao } from "@/store/atracao-selecao";
import type { Candidatura, ClasseDesfecho } from "@/types/atracao-selecao";

const SEVERIDADE: Record<ClasseDesfecho, Severidade> = {
  aprovado: "normal",
  processo: "processo",
  reprovado: "alarme",
  declinou: "atencao",
  noshow: "alarme",
  seminfo: "normal",
};

/** Mesma lei do desfecho: só o que precisa de ação carrega cor. */
const COR_CATEGORIA: Record<string, string> = {
  "Não compareceu ou sem contato": "var(--rs-alarme)",
  "Condições da vaga (candidato declinou)": "var(--rs-atencao)",
  "Perfil ou requisito (empresa reprovou)": "var(--rs-rampa-1)",
  "Aprovado / carta oferta": "var(--rs-rampa-4)",
  "Sem motivo registrado": "var(--rs-serie-nula)",
};

export default function PaginaFunil() {
  const { dados, filtros } = useAtracaoSelecao();
  const todas = useMemo(() => dados?.funil ?? [], [dados]);
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
        { periodo: "mes", gerencia: "gerencia", status: "status", praca: "localidade", cargo: "posicao", gestor: "gestor", desfecho: "desfecho" },
        mesMaximo,
      ),
    [todas, filtros, mesMaximo],
  );

  if (!dados) return null;

  const cascata = cascataFunil(vis);
  const nos = cascata.map((e, i) => ({ k: e.k, v: e.v, perda: cascata[i + 1] ? e.v - cascata[i + 1].v : 0 }));
  const aprovados = vis.filter((c) => c.cls === "aprovado").length;
  const noshow = vis.filter((c) => c.cls === "noshow").length;
  const emProcesso = vis.filter((c) => c.cls === "processo").length;
  const declinaram = vis.filter((c) => c.cls === "declinou").length;
  const semMotivo = vis.filter((c) => c.catMotivo === "Sem motivo registrado").length;

  const classes: Classe[] = [
    { severidade: "alarme", palavra: "Não compareceu", contagem: noshow, prazo: `${fmtPct(proporcao(vis, (c) => c.cls === "noshow"))} · teto de mercado 10%` },
    { severidade: "atencao", palavra: "Declinou", contagem: declinaram, prazo: "condições da vaga" },
    { severidade: "processo", palavra: "Com o gestor", contagem: emProcesso, prazo: "destrava posição nesta semana" },
    { severidade: "normal", palavra: "Aprovado", contagem: aprovados, prazo: `${fmtPct(proporcao(vis, (c) => c.cls === "aprovado"))} dos abordados` },
  ];

  const leituras = [
    { rotulo: "Candidatos abordados", valor: fmtN(vis.length), contexto: `${fmtN(new Set(vis.map((c) => c.codigo)).size)} vagas · ${fmtN(new Set(vis.map((c) => c.posicao)).size)} posições` },
    { rotulo: "Chegam à carta oferta", valor: fmtPct(aprovados / (vis.length || 1)), contexto: `${fmtN(aprovados)} de ${fmtN(vis.length)}` },
    { rotulo: "Sem motivo registrado", valor: fmtPct(proporcao(vis, (c) => c.catMotivo === "Sem motivo registrado")), contexto: `${fmtN(semMotivo)} decisões que não viram aprendizado` },
    { rotulo: "Origem predominante", valor: maiores(contarPor(vis, "origem"))[0]?.k ?? "—", contexto: `${fmtPct((maiores(contarPor(vis, "origem"))[0]?.v ?? 0) / (vis.length || 1))} dos candidatos` },
  ];

  const pracas = maiores(contarPor(vis, "localidade")).filter((x) => x.v >= 3).map((x) => x.k);
  const seriesDesfecho = ORDEM_DESFECHO.filter((c) => vis.some((v) => v.cls === c)).map((c) => ({
    nome: NOME_DESFECHO[c],
    cor: COR_DESFECHO[c],
    valores: Object.fromEntries(pracas.map((p) => [p, vis.filter((v) => v.localidade === p && v.cls === c).length])),
  }));

  const noShowPorPraca = maiores(contarPor(vis, "localidade"))
    .filter((x) => x.v >= 3)
    .map((x) => ({
      k: x.k,
      v: Math.round((vis.filter((v) => v.localidade === x.k && v.cls === "noshow").length / x.v) * 100),
      extra: `n=${fmtN(x.v)}`,
    }))
    .sort((a, b) => b.v - a.v);

  const porCategoria = maiores(contarPor(vis, "catMotivo")).map((x) => ({ ...x, cor: COR_CATEGORIA[x.k] }));
  const motivos = maiores(contarPor(vis.filter((c) => c.catMotivo !== "Sem motivo registrado" && c.catMotivo !== "Não compareceu ou sem contato"), "motivo"), 9);
  const porOrigem = maiores(contarPor(vis, "origem"), 6);
  const porPosicao = maiores(contarPor(vis, "posicao"), 6);
  const porMesAbertura = porMes(vis, "mes").map((x) => ({ k: fmtMes(x.k), v: x.v }));

  const achados: React.ReactNode[] = [];
  if (vis.length) {
    const [, responderam, entrevistaRh] = cascata.map((c) => c.v);
    achados.push(
      <>
        De <Forte>{fmtN(vis.length)} candidatos abordados, {fmtN(aprovados)} chegaram à carta oferta</Forte> ({fmtPct(aprovados / vis.length)}). A maior queda está entre responder ao contato e comparecer à entrevista de RH: {fmtPct(responderam ? entrevistaRh / responderam : 0)} avançam.
      </>,
    );
    if (noshow) {
      achados.push(
        <>
          <Forte>{fmtPct(noshow / vis.length)} dos candidatos não comparecem ou somem</Forte> ({fmtN(noshow)} pessoas). A referência para vagas de alto volume é 10%, e times com lembrete por mensagem e autoagendamento operam entre 8% e 12%.
        </>,
      );
    }
    if (noShowPorPraca.length > 1) {
      const pior = noShowPorPraca[0];
      const melhor = noShowPorPraca[noShowPorPraca.length - 1];
      achados.push(
        <>
          O não comparecimento é muito desigual por localidade: <Forte>{pior.k} com {pior.v}%</Forte> contra {melhor.k} com {melhor.v}%. Isso é convocação, horário e local de entrevista, não perfil de candidato.
        </>,
      );
    }
    const declinio = maiores(contarPor(vis.filter((c) => c.cls === "declinou"), "motivo"));
    if (declinio.length) {
      achados.push(
        <>
          Entre quem declinou, o motivo mais frequente é <Forte>{declinio[0].k}</Forte> ({fmtN(declinio[0].v)} casos). Motivo ligado a remuneração ou escala é insumo para a O&R, não para o recrutamento.
        </>,
      );
    }
    if (semMotivo) {
      achados.push(
        <>
          <Forte>{fmtPct(semMotivo / vis.length)} dos registros não têm motivo preenchido</Forte> ({fmtN(semMotivo)}). Cada um é uma decisão que não vira aprendizado.
        </>,
      );
    }
    if (emProcesso) {
      const fila = maiores(contarPor(vis.filter((c) => c.cls === "processo"), "gestor"));
      achados.push(
        <>
          <Forte>{fmtN(emProcesso)} candidatos aguardam a entrevista ou a decisão do gestor</Forte>
          {fila[0] ? <>, e {fila[0].k} concentra {fmtN(fila[0].v)} deles</> : null}. É a fila que mais rápido destrava posições nesta semana.
        </>,
      );
    }
  }

  const colunas: Array<Coluna<Candidatura>> = [
    { chave: "codigo", rotulo: "Vaga", quebra: true },
    { chave: "posicao", rotulo: "Posição", quebra: true },
    { chave: "localidade", rotulo: "Localidade" },
    { chave: "gestor", rotulo: "Gestor(a)" },
    { chave: "origem", rotulo: "Origem" },
    { chave: "dtAbertura", rotulo: "Abertura", texto: (c) => fmtData(c.dtAbertura) },
    { chave: "desfecho", rotulo: "Situação", render: (c) => <Etiqueta severidade={SEVERIDADE[c.cls]}>{c.desfecho}</Etiqueta> },
    { chave: "catMotivo", rotulo: "Categoria", quebra: true },
    { chave: "motivo", rotulo: "Motivo declarado", quebra: true },
  ];

  return (
    <>
      <Regua
        meses={meses}
        campos={[
          { chave: "gerencia", rotulo: "Gerência", opcoes: opcoesDe(todas, "gerencia") },
          { chave: "status", rotulo: "Status", opcoes: opcoesDe(todas, "status") },
          { chave: "praca", rotulo: "Localidade", opcoes: opcoesDe(todas, "localidade") },
          { chave: "cargo", rotulo: "Posição", opcoes: opcoesDe(todas, "posicao") },
          { chave: "gestor", rotulo: "Gestor(a)", opcoes: opcoesDe(todas, "gestor") },
          { chave: "desfecho", rotulo: "Situação", opcoes: opcoesDe(todas, "desfecho") },
        ]}
        contagem={{ visiveis: vis.length, total: todas.length }}
        unidade="candidatos"
      />

      <div className="rs-grade" style={{ marginTop: 16 }}>
        <div className="rs-c12"><BarraEstado classes={classes} /></div>
        <div className="rs-c12"><FaixaLeituras itens={leituras} /></div>

        <Placa titulo="Funil, da abordagem à carta oferta" nota="A espessura carrega o volume e o trecho aceso é onde mais se perde. Etapa derivada do status e do motivo, porque as datas de etapa da planilha estão vazias." span="rs-c7" tabela={tabelaFunil(nos)}>
          <Funil nos={nos} />
        </Placa>

        <Placa titulo="Não comparecimento por localidade" nota="Faltas e sumiços sobre os abordados na localidade." span="rs-c5" tabela={tabelaBarras(noShowPorPraca, "Localidade", "Não comparecimento", fmtN, "%")}>
          <Barras dados={noShowPorPraca} unidade="%" max={100} destaque={new Set(noShowPorPraca.filter((x) => x.v > LIMIARES.noShow * 100).map((x) => x.k))} limiar={{ valor: LIMIARES.noShow * 100, rotulo: "10%, o teto de mercado" }} />
        </Placa>

        <Placa titulo="Situação por localidade" nota="Proporção dentro de cada localidade." span="rs-c7" legenda={seriesDesfecho.map((s) => ({ nome: s.nome, cor: s.cor }))} tabela={tabelaEmpilhada(pracas, seriesDesfecho, "Localidade", true)}>
          <Empilhado categorias={pracas} series={seriesDesfecho} proporcional />
        </Placa>

        <Placa titulo="Categoria do motivo" nota="Por que o candidato saiu do processo." span="rs-c5" tabela={tabelaBarras(porCategoria, "Categoria", "Candidatos")}>
          <Barras dados={porCategoria} />
        </Placa>

        <Placa titulo="Motivos declarados" nota="Excluindo faltas, sumiços e registros sem motivo." span="rs-c8" tabela={tabelaBarras(motivos, "Motivo", "Candidatos")}>
          <Barras dados={motivos} />
        </Placa>

        <Placa titulo="Origem do candidato" nota="Como chegou ao processo." span="rs-c4" tabela={tabelaBarras(porOrigem, "Origem", "Candidatos")}>
          <Barras dados={porOrigem} />
        </Placa>

        <Placa titulo="Candidatos por posição" span="rs-c6" tabela={tabelaBarras(porPosicao, "Posição", "Candidatos")}>
          <Barras dados={porPosicao} />
        </Placa>

        <Placa titulo="Candidatos por mês de abertura" nota="Safra da vaga que originou a abordagem." span="rs-c6" tabela={tabelaBarras(porMesAbertura, "Mês", "Candidatos")}>
          <Colunas dados={porMesAbertura} altura={196} agora={fmtMes(mesMaximo)} />
        </Placa>

        <Achados itens={achados} />
        <Tabela titulo="Candidatos do funil" linhas={vis} colunas={colunas} ordemInicial="dtAbertura" />
      </div>
    </>
  );
}
