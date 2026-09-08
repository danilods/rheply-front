"use client";

/**
 * O corpo do sinóptico, sem a casca.
 *
 * Vive separado da página porque duas rotas o desenham: a autenticada, que traz
 * régua de filtros e recorta antes de passar, e a pública por link, que mostra
 * a base inteira em modo leitura. Manter uma cópia em cada lugar era garantir
 * que uma das duas ficaria para trás na primeira correção.
 */

import { useMemo } from "react";
import Link from "next/link";

import { Barras, Colunas, Placa, Unifilar, tabelaBarras, tabelaUnifilar } from "@/components/atracao-selecao/graficos";
import { BarraEstado, Etiqueta, FaixaLeituras, type Classe } from "@/components/atracao-selecao/ui";
import {
  cascataFunil,
  fmtMes,
  fmtN,
  fmtPct,
  LIMIARES,
  prazoAlvo,
  vagaAtrasada,
} from "@/lib/rs/metricas";
import { contarPor, maiores, mediana, nums, percentil, porMes, proporcao, sum } from "@/lib/rs/stats";
import type { QualidadeDados } from "@/services/atracao-selecao-api";
import type { Contratacao, Candidatura, VagaAberta } from "@/types/atracao-selecao";

export interface ConjuntoSinoptico {
  abertas: VagaAberta[];
  contr: Contratacao[];
  funil: Candidatura[];
}

export function CorpoSinoptico({
  recorte,
  qualidade,
  recortado = false,
  recorteParcial = false,
  interno = true,
  base = "/atracao-selecao",
}: {
  recorte: ConjuntoSinoptico;
  qualidade?: QualidadeDados | null;
  /** Muda a frase de "base inteira" para "recorte visível". */
  recortado?: boolean;
  /**
   * O recorte não alcança todas as bases. Acontece com gerência: a exportação
   * de posições fechadas não traz o campo, então filtrar por gerência recorta
   * vagas e funil e deixa aquela base inteira. Dizer isso na tela é o que
   * separa um número parcial de um número errado.
   */
  recorteParcial?: boolean;
  /**
   * Na tela interna há para onde navegar; no link público não há. Mandar quem
   * não tem conta para uma rota autenticada devolve a pessoa ao login e faz o
   * link parecer quebrado.
   */
  interno?: boolean;
  /** Prefixo das rotas irmãs: /atracao-selecao ou /painel/<token>. */
  base?: string;
}) {
  const c = useMemo(() => {
    if (!recorte) return null;
    const { abertas, contr, funil } = recorte;

    const cascata = cascataFunil(funil);
    const nos = cascata.map((e, i) => ({
      k: e.k,
      v: e.v,
      perda: cascata[i + 1] ? e.v - cascata[i + 1].v : 0,
    }));

    /* As três classes precisam somar exatamente as vagas abertas, senão a barra
       de estado promete uma partição e entrega uma sobreposição. Uma vaga
       congelada que já passou do prazo conta como fora do prazo: é a classe
       que exige ação nesta sexta-feira. */
    const atrasadas = abertas.filter(vagaAtrasada).sort((a, b) => (b.aging ?? 0) - (a.aging ?? 0));
    const eAtrasada = new Set(atrasadas);
    const congeladas = abertas.filter((v) => v.status === "Congelada");
    const congeladasNoPrazo = congeladas.filter((v) => !eAtrasada.has(v));
    const noPrazo = abertas.filter((v) => !eAtrasada.has(v) && v.status !== "Congelada");
    const esperandoGestor = funil.filter((x) => x.cls === "processo");
    const filaGestor = maiores(contarPor(esperandoGestor, "gestor"));

    const noShow = proporcao(funil, (x) => x.cls === "noshow");
    const porPraca = maiores(contarPor(funil, "localidade"))
      .filter((x) => x.v >= 5)
      .map((x) => ({
        k: x.k,
        v: Math.round((funil.filter((f) => f.localidade === x.k && f.cls === "noshow").length / x.v) * 100),
        extra: `n=${fmtN(x.v)}`,
      }))
      .sort((a, b) => b.v - a.v);

    const posicaoDia = abertas.reduce((t, v) => t + v.posAbertas * (v.aging ?? 0), 0);
    const paradoPorFilial = maiores(
      abertas.reduce((m, v) => {
        m.set(v.filial, (m.get(v.filial) ?? 0) + v.posAbertas * (v.aging ?? 0));
        return m;
      }, new Map<string, number>()),
      6,
    );

    const serieAceites = porMes(contr, "mes");
    const temposPosicao = nums(contr, "tmPosicao");
    // Quantas vezes o mesmo posto, na mesma filial, precisou ser reposto.
    // Antes isto contava requisições numa base histórica que não existe mais;
    // agora conta posições efetivamente fechadas, que é o fato observável.
    const reaberturas = maiores(
      contr.reduce((m, c) => {
        const k = `${c.vaga} · ${c.filial}`;
        m.set(k, (m.get(k) ?? 0) + 1);
        return m;
      }, new Map<string, number>()),
      7,
    );

    return {
      abertas, contr, funil, nos, atrasadas, congeladas, congeladasNoPrazo, noPrazo,
      esperandoGestor, filaGestor,
      noShow, porPraca, posicaoDia, paradoPorFilial, serieAceites, temposPosicao, reaberturas,
    };
  }, [recorte]);


  if (!c) return null;


  /* ---------------- barra de estado ---------------- */

  /* A barra conta vagas, e só vagas. "Com o gestor" é fila de candidatos e
     mudou para as leituras, onde a unidade vem escrita ao lado do número. */
  const classes: Classe[] = [
    {
      severidade: "alarme",
      palavra: "Fora do prazo",
      contagem: c.atrasadas.length,
      prazo: `alvo de ${prazoAlvo("Promotor(a) de Vendas")} d nos cargos operacionais`,
    },
    {
      severidade: "atencao",
      palavra: "Congelada, no prazo",
      contagem: c.congeladasNoPrazo.length,
      prazo: "não avança e continua contando dias",
    },
    {
      severidade: "normal",
      palavra: "Dentro do prazo",
      contagem: c.noPrazo.length,
      prazo:
        c.noPrazo.length === 0
          ? "nenhuma vaga aberta está em dia"
          : `de ${fmtN(c.abertas.length)} vagas abertas`,
    },
  ];

  /* ---------------- leituras ---------------- */

  //: Marca as leituras que vêm de posições fechadas, base que não tem gerência.
  const semGerencia = recorteParcial ? " · não recortado por gerência" : "";

  const leituras = [
    {
      rotulo: "Requisições abertas",
      valor: fmtN(new Set(c.abertas.map((v) => v.req || v.codigo)).size),
      unidade: "requisições",
      contexto: `${fmtN(c.abertas.length)} vagas no quadro`,
    },
    {
      rotulo: "Posições abertas",
      valor: fmtN(sum(c.abertas, "posAbertas")),
      unidade: "posições",
      contexto: `${fmtN(sum(c.abertas, "posFechadas"))} já fechadas nessas vagas`,
    },
    {
      // Itens 3 e 5: o tempo real da vaga é da aprovação até a movimentação
      // para contratação. Não é a soma das etapas, nem o tempo desde a criação.
      rotulo: "Tempo médio da vaga",
      valor: fmtN(mediana(c.temposPosicao)),
      unidade: "d mediana",
      contexto: `p90 ${fmtN(percentil(c.temposPosicao, 0.9))} d · aprovação → movimentação${semGerencia}`,
    },
    {
      // Item 4: os dois tempos de etapa entram como indicador, não como o
      // tempo da vaga — somá-los daria um número que não existe no processo.
      rotulo: "Indicador O&R",
      valor: fmtN(mediana(nums(c.abertas, "tmOR"))),
      unidade: "d mediana",
      contexto: "criação até a aprovação",
    },
    {
      rotulo: "Indicador R&S",
      valor: fmtN(mediana(nums(c.abertas, "tmRS"))),
      unidade: "d mediana",
      contexto: "aprovação até a publicação",
    },
    {
      rotulo: "Não comparecimento",
      valor: fmtPct(c.noShow),
      contexto: `teto de mercado 10% · pior localidade ${c.porPraca[0]?.k ?? "—"}`,
    },
    {
      rotulo: "Aguardando o gestor",
      valor: fmtN(c.esperandoGestor.length),
      unidade: "candidatos",
      contexto: c.filaGestor[0]
        ? `${fmtN(c.filaGestor[0].v)} deles com ${c.filaGestor[0].k}`
        : "sem fila aguardando decisão",
    },
    {
      rotulo: "Espera acumulada",
      valor: fmtN(c.posicaoDia),
      unidade: "dias somados",
      contexto: `média de ${fmtN(sum(c.abertas, "posAbertas") ? c.posicaoDia / sum(c.abertas, "posAbertas") : null)} dias por posição`,
    },
  ];

  /* ---------------- alarmes ---------------- */

  // Cinco linhas, não sete: é o que emparelha a altura da lista com a do funil
  // ao lado, e o resto da fila está a um clique no rodapé da placa.
  const alarmes = c.atrasadas.slice(0, 5);

  return (
    <div className="rs-grade">
      <div className="rs-c12">
        <BarraEstado classes={classes} />
      </div>

      <div className="rs-c12">
        <FaixaLeituras itens={leituras} />
      </div>

      <Placa
        titulo="Funil, da abordagem à carta oferta"
        nota="A espessura carrega o volume. O trecho aceso é onde mais se perde. Etapa derivada do status e do motivo, porque as datas de etapa da planilha estão vazias."
        span="rs-c7"
        tabela={tabelaUnifilar(c.nos)}
      >
        <Unifilar nos={c.nos} />
      </Placa>

      <section className="rs-placa rs-c5">
        <h3 className="rs-cabeca">Fora do prazo agora</h3>
        <p className="rs-sub">Cada linha traz há quantos dias e de quem é.</p>
        {alarmes.length ? (
          <ol style={{ margin: 0, padding: 0, listStyle: "none" }} className="rs-reassenta">
            {alarmes.map((v, i) => (
              <li
                key={String(v.codigo)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto",
                  alignItems: "baseline",
                  gap: 12,
                  padding: "9px 0",
                  borderTop: i === 0 ? "none" : "1px solid var(--rs-fio)",
                }}
              >
                <span
                  className="rs-leitura rs-leitura--peq"
                  style={{ color: "var(--rs-alarme)", minWidth: 52 }}
                >
                  {fmtN(v.aging)}
                  <span className="rs-unidade">d</span>
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", color: "var(--rs-tinta)" }}>{v.vaga}</span>
                  <span className="rs-estado__prazo">
                    {v.filial} · {v.gestor} · alvo {prazoAlvo(v.vaga)} d
                  </span>
                </span>
                <Etiqueta severidade={v.status === "Congelada" ? "atencao" : "alarme"}>
                  {v.status === "Congelada" ? "Congelada" : "Atrasada"}
                </Etiqueta>
              </li>
            ))}
          </ol>
        ) : (
          <p className="rs-vazio">Nenhuma vaga passou do prazo-alvo.</p>
        )}
        <p style={{ marginTop: 14, marginBottom: 0 }}>
          <Link href={`${base}/vagas`} className="rs-rotulo" style={{ color: "var(--rs-tinta)" }}>
            Ver as {fmtN(c.atrasadas.length)} vagas fora do prazo →
          </Link>
        </p>
      </section>

      <Placa
        titulo="Não comparecimento por localidade"
        nota="Faltas e sumiços sobre os candidatos abordados na localidade."
        span="rs-c6"
        tabela={tabelaBarras(c.porPraca, "Localidade", "Não comparecimento", fmtN, "%")}
      >
        <Barras
          dados={c.porPraca}
          unidade="%"
          max={100}
          destaque={new Set(c.porPraca.filter((x) => x.v > LIMIARES.noShow * 100).map((x) => x.k))}
          limiar={{ valor: LIMIARES.noShow * 100, rotulo: "10%, o teto de mercado" }}
        />
      </Placa>

      <Placa
        titulo="Onde as vagas estão paradas"
        nota="Posição-dia: posições abertas multiplicadas pelos dias desde a aprovação."
        span="rs-c6"
        tabela={tabelaBarras(c.paradoPorFilial, "Filial", "Posição-dia")}
      >
        <Barras dados={c.paradoPorFilial} />
      </Placa>

      <Placa
        titulo="Aceites de carta oferta por mês"
        nota="A série inteira, não a comparação com o mês anterior: o volume vem em ondas."
        span="rs-c7"
        tabela={tabelaBarras(
          c.serieAceites.map((x) => ({ k: fmtMes(x.k), v: x.v })),
          "Mês",
          "Aceites",
        )}
      >
        <Colunas
          dados={c.serieAceites.map((x) => ({ k: fmtMes(x.k), v: x.v }))}
          altura={210}
          agora={fmtMes(c.serieAceites[c.serieAceites.length - 1]?.k)}
        />
      </Placa>

      <Placa
        titulo="Posições que mais voltam a abrir"
        nota="Requisições distintas por cargo e filial no histórico."
        span="rs-c5"
        tabela={tabelaBarras(c.reaberturas, "Cargo e filial", "Requisições")}
      >
        <Barras dados={c.reaberturas} />
      </Placa>

      <section className="rs-placa rs-c12">
        <h2 className="rs-cabeca">O que isso quer dizer</h2>
        <p className="rs-sub">
            {recortado
              ? "Recalculado sobre o recorte visível agora."
              : "Recalculado sobre a base inteira a cada carga."}
          </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 0,
          }}
        >
          {[
            {
              t: "O topo do funil não é o problema",
              d: `De ${fmtN(c.nos[0]?.v)} candidatos abordados, ${fmtN(c.nos[c.nos.length - 1]?.v)} chegaram à carta oferta — ${fmtPct((c.nos[c.nos.length - 1]?.v ?? 0) / (c.nos[0]?.v || 1))} do topo. A maior queda está no meio do funil, não na entrada: investir em mais atração rende menos que consertar o comparecimento e a decisão do gestor.`,
            },
            {
              t: "A espera está concentrada",
              d: `As três filiais com mais posições paradas somam ${fmtPct(c.paradoPorFilial.slice(0, 3).reduce((t, x) => t + x.v, 0) / (c.posicaoDia || 1))} de toda a espera acumulada. Atacar ${c.paradoPorFilial.slice(0, 3).map((p) => p.k).join(", ")} resolve mais que qualquer ação distribuída por igual.`,
            },
            {
              t: "As mesmas posições voltam a abrir",
              d: `${c.reaberturas[0]?.k} teve ${fmtN(c.reaberturas[0]?.v)} posições fechadas no período, e ${fmtPct(proporcao(c.contr, (v) => v.motivoReq === "Substituição de pessoal"))} das aberturas são substituição. Enquanto a permanência não entrar na conta, o time repõe o mesmo posto.`,
            },
            {
              t: "Não dá para dizer qual canal funciona",
              d: `${fmtPct(proporcao(c.contr, (x) => x.origem === "Não informado"))} das contratações não têm origem registrada. É o campo mais barato de corrigir e o que mais muda a conversa sobre orçamento.`,
            },
          ].map((x, i) => (
            <article
              key={x.t}
              style={{
                padding: "14px 20px 14px 0",
                borderTop: "1px solid var(--rs-fio)",
                marginTop: i < 2 ? 0 : 0,
              }}
            >
              <h3 className="rs-rotulo" style={{ color: "var(--rs-tinta)" }}>
                {x.t}
              </h3>
              <p className="rs-prosa" style={{ margin: "7px 0 0", color: "var(--rs-tinta-2)" }}>
                {x.d}
              </p>
            </article>
          ))}
        </div>
      </section>

      {qualidade?.vagasSemComplemento?.length ? (
        <section className="rs-placa rs-c12" style={{ borderTop: "2px solid var(--rs-atencao)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
            <span aria-hidden className="rs-marca rs-marca--atencao" style={{ color: "var(--rs-atencao)" }} />
            <p style={{ margin: 0, flex: 1, minWidth: 260 }}>
              {fmtN(qualidade.vagasSemComplemento.length)} vagas em aberto ainda sem centro de custo
              ou tipo de abertura. A leitura por área fica incompleta até isso ser preenchido.
            </p>
            {interno ? (
              <Link href="/atracao-selecao/importar" className="rs-botao" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
                Ver qualidade
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}

