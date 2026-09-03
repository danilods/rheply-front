import { describe, expect, it } from "vitest";

import {
  cascataFunil,
  diasLiquidos,
  faixaAging,
  fmtBRL,
  fmtData,
  fmtMes,
  fmtN,
  fmtPct,
  ORDEM_DESFECHO,
  PRAZO_ALVO_PADRAO,
  prazoAlvo,
  vagaAtrasada,
} from "@/lib/rs/metricas";
import type { Candidatura } from "@/types/atracao-selecao";

describe("prazoAlvo", () => {
  it("usa o SLA operacional para os cargos de alto volume", () => {
    expect(prazoAlvo("Atendente de Call Center")).toBe(25);
    expect(prazoAlvo("Promotor(a) de Vendas")).toBe(25);
  });

  it("cai no padrão para cargos não mapeados", () => {
    expect(prazoAlvo("Analista de Automação")).toBe(PRAZO_ALVO_PADRAO);
  });
});

describe("vagaAtrasada", () => {
  it("compara o tempo bruto com o prazo do cargo", () => {
    expect(vagaAtrasada({ aging: 26, vaga: "Promotor(a) de Vendas" })).toBe(true);
    expect(vagaAtrasada({ aging: 25, vaga: "Promotor(a) de Vendas" })).toBe(false);
  });

  it("não marca atraso quando falta a data de aprovação", () => {
    expect(vagaAtrasada({ aging: null, vaga: "Promotor(a) de Vendas" })).toBe(false);
  });

  it("usa o padrão mais folgado em cargos não operacionais", () => {
    expect(vagaAtrasada({ aging: 30, vaga: "Analista de RH" })).toBe(false);
    expect(vagaAtrasada({ aging: 36, vaga: "Analista de RH" })).toBe(true);
  });
});

describe("faixaAging", () => {
  it("classifica nas faixas calibradas para vagas operacionais", () => {
    expect(faixaAging(0)).toBe("0–15 d");
    expect(faixaAging(15)).toBe("0–15 d");
    expect(faixaAging(16)).toBe("16–30 d");
    expect(faixaAging(60)).toBe("31–60 d");
    expect(faixaAging(61)).toBe("mais de 60 d");
    expect(faixaAging(500)).toBe("mais de 60 d");
  });

  it("separa as vagas sem data em vez de somá-las à primeira faixa", () => {
    expect(faixaAging(null)).toBe("Sem data");
  });
});

describe("diasLiquidos", () => {
  const d = (s: string) => new Date(`${s}T00:00:00Z`);

  it("desconta apenas a interseção do congelamento com o ciclo", () => {
    // Vaga aprovada em 01/05, referência 01/09, congelada de 25/06 a 01/08.
    const r = diasLiquidos(d("2026-05-01"), d("2026-09-01"), [
      { inicio: d("2026-06-25"), fim: d("2026-08-01") },
    ]);
    expect(r).toBe(123 - 37);
  });

  it("nunca devolve negativo quando o congelamento começa antes do ciclo", () => {
    // Este é o caso que produzia −61 e −64 dias na planilha.
    const r = diasLiquidos(d("2026-08-28"), d("2026-09-01"), [
      { inicio: d("2026-06-25"), fim: d("2026-09-01") },
    ]);
    expect(r).toBe(0);
  });

  it("ignora congelamento inteiramente fora do ciclo", () => {
    const r = diasLiquidos(d("2026-05-01"), d("2026-06-01"), [
      { inicio: d("2026-07-01"), fim: d("2026-08-01") },
    ]);
    expect(r).toBe(31);
  });

  it("soma múltiplos períodos de congelamento", () => {
    const r = diasLiquidos(d("2026-01-01"), d("2026-01-31"), [
      { inicio: d("2026-01-05"), fim: d("2026-01-10") },
      { inicio: d("2026-01-20"), fim: d("2026-01-25") },
    ]);
    expect(r).toBe(30 - 10);
  });

  it("devolve o bruto quando não há congelamento", () => {
    expect(diasLiquidos(d("2026-01-01"), d("2026-01-31"), [])).toBe(30);
  });
});

describe("cascataFunil", () => {
  const c = (etapa: Candidatura["etapa"]): Candidatura =>
    ({ etapa }) as Candidatura;

  it("conta cumulativamente: quem chegou à etapa 5 também passou pela 1", () => {
    const rows = [c(1), c(2), c(3), c(4), c(5)];
    expect(cascataFunil(rows).map((x) => x.v)).toEqual([5, 4, 3, 2, 1]);
  });

  it("reproduz a cascata conhecida da planilha", () => {
    // 40 pararam na etapa 1, 130 na 2, 95 na 3, 50 na 4, 31 aprovados.
    const rows = [
      ...Array<Candidatura>(40).fill(c(1)),
      ...Array<Candidatura>(130).fill(c(2)),
      ...Array<Candidatura>(95).fill(c(3)),
      ...Array<Candidatura>(50).fill(c(4)),
      ...Array<Candidatura>(31).fill(c(5)),
    ];
    expect(cascataFunil(rows).map((x) => x.v)).toEqual([346, 306, 176, 81, 31]);
  });

  it("devolve zeros sem candidatos, em vez de quebrar", () => {
    expect(cascataFunil([]).map((x) => x.v)).toEqual([0, 0, 0, 0, 0]);
  });
});

describe("ORDEM_DESFECHO", () => {
  it("mantém verde e âmbar separados na pilha, como exige a validação de daltonismo", () => {
    const i = ORDEM_DESFECHO.indexOf("aprovado");
    const j = ORDEM_DESFECHO.indexOf("noshow");
    expect(Math.abs(i - j)).toBeGreaterThan(1);
  });
});

describe("formatação pt-BR", () => {
  it("usa ponto como separador de milhar", () => {
    expect(fmtN(1836)).toBe("1.836");
    expect(fmtN(0)).toBe("0");
  });

  it("arredonda para inteiro", () => {
    expect(fmtN(16.4)).toBe("16");
  });

  it("mostra travessão em vez de zero quando o dado falta", () => {
    expect(fmtN(null)).toBe("—");
    expect(fmtPct(undefined)).toBe("—");
    expect(fmtBRL(null)).toBe("—");
    expect(fmtMes(null)).toBe("—");
    expect(fmtData(null)).toBe("—");
  });

  it("formata percentual sem casas decimais", () => {
    expect(fmtPct(0.43)).toBe("43%");
  });

  it("formata moeda em reais", () => {
    expect(fmtBRL(1621)).toContain("1.621");
  });

  it("abrevia mês e inverte a data", () => {
    expect(fmtMes("2026-08")).toBe("ago/26");
    expect(fmtData("2026-08-27")).toBe("27/08/2026");
  });
});
