import { describe, expect, it } from "vitest";

import {
  contarPor,
  distribuicaoPor,
  maiores,
  mean,
  mediana,
  mesMenos,
  nums,
  percentil,
  porMes,
  proporcao,
  somarPor,
  sum,
} from "@/lib/rs/stats";

interface Linha {
  filial: string;
  dias: number | null;
  posicoes: number;
  mes: string | null;
}

const linhas: Linha[] = [
  { filial: "Teresina", dias: 10, posicoes: 3, mes: "2026-01" },
  { filial: "Teresina", dias: 20, posicoes: 2, mes: "2026-01" },
  { filial: "Teresina", dias: 30, posicoes: 1, mes: "2026-02" },
  { filial: "Belém", dias: 100, posicoes: 5, mes: "2026-02" },
  { filial: "Belém", dias: null, posicoes: 0, mes: null },
  { filial: "", dias: 40, posicoes: 4, mes: "2026-03" },
];

describe("nums e sum", () => {
  it("descarta nulos e NaN ao extrair valores", () => {
    expect(nums(linhas, "dias")).toEqual([10, 20, 30, 100, 40]);
  });

  it("soma tratando ausência como zero", () => {
    expect(sum(linhas, "posicoes")).toBe(15);
  });

  it("devolve lista vazia e soma zero quando não há linhas", () => {
    expect(nums([] as Linha[], "dias")).toEqual([]);
    expect(sum([] as Linha[], "posicoes")).toBe(0);
  });
});

describe("percentil", () => {
  it("interpola linearmente como o PERCENTIL do Excel", () => {
    const a = [1, 2, 3, 4];
    expect(percentil(a, 0)).toBe(1);
    expect(percentil(a, 0.25)).toBe(1.75);
    expect(percentil(a, 0.5)).toBe(2.5);
    expect(percentil(a, 0.75)).toBe(3.25);
    expect(percentil(a, 1)).toBe(4);
  });

  it("devolve o próprio valor com um único elemento", () => {
    expect(percentil([7], 0.9)).toBe(7);
  });

  it("devolve null sem dados", () => {
    expect(percentil([], 0.5)).toBeNull();
    expect(mediana([])).toBeNull();
    expect(mean([])).toBeNull();
  });

  it("não altera o array recebido", () => {
    const a = [3, 1, 2];
    percentil(a, 0.5);
    expect(a).toEqual([3, 1, 2]);
  });

  it("calcula mediana com número par e ímpar de elementos", () => {
    expect(mediana([1, 3])).toBe(2);
    expect(mediana([1, 2, 3])).toBe(2);
  });
});

describe("proporcao", () => {
  it("calcula a fração que satisfaz o predicado", () => {
    expect(proporcao(linhas, (r) => r.filial === "Teresina")).toBeCloseTo(0.5);
  });

  it("devolve null quando não há linhas, em vez de dividir por zero", () => {
    expect(proporcao([] as Linha[], () => true)).toBeNull();
  });
});

describe("contarPor e somarPor", () => {
  it("agrupa valores vazios sob Não informado", () => {
    const m = contarPor(linhas, "filial");
    expect(m.get("Teresina")).toBe(3);
    expect(m.get("Belém")).toBe(2);
    expect(m.get("Não informado")).toBe(1);
  });

  it("soma um campo agrupado por outro", () => {
    const m = somarPor(linhas, "filial", "posicoes");
    expect(m.get("Teresina")).toBe(6);
    expect(m.get("Belém")).toBe(5);
  });
});

describe("maiores", () => {
  it("ordena do maior para o menor", () => {
    const r = maiores(contarPor(linhas, "filial"));
    expect(r.map((x) => x.k)).toEqual(["Teresina", "Belém", "Não informado"]);
  });

  it("dobra a cauda em Outros ao passar do limite, sem inventar categorias", () => {
    const m = new Map([
      ["a", 10],
      ["b", 5],
      ["c", 3],
      ["d", 2],
    ]);
    const r = maiores(m, 3);
    expect(r).toEqual([
      { k: "a", v: 10 },
      { k: "b", v: 5 },
      { k: "Outros", v: 5 },
    ]);
  });

  it("não cria Outros quando cabe no limite", () => {
    expect(maiores(new Map([["a", 1]]), 3)).toEqual([{ k: "a", v: 1 }]);
  });
});

describe("porMes", () => {
  it("ordena cronologicamente e descarta linhas sem mês", () => {
    expect(porMes(linhas, "mes")).toEqual([
      { k: "2026-01", v: 2 },
      { k: "2026-02", v: 2 },
      { k: "2026-03", v: 1 },
    ]);
  });
});

describe("distribuicaoPor", () => {
  it("calcula mediana e quartis por grupo, ignorando grupos pequenos", () => {
    const r = distribuicaoPor(linhas, "filial", "dias", 3);
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ k: "Teresina", v: 20, p25: 15, p75: 25, n: 3 });
  });

  it("ordena do menor para o maior tempo", () => {
    const dados = [
      { g: "lento", d: 100 },
      { g: "lento", d: 100 },
      { g: "rápido", d: 5 },
      { g: "rápido", d: 5 },
    ];
    const r = distribuicaoPor(dados, "g", "d", 2);
    expect(r.map((x) => x.k)).toEqual(["rápido", "lento"]);
  });
});

describe("mesMenos", () => {
  it("volta meses dentro do mesmo ano", () => {
    expect(mesMenos("2026-08", 2)).toBe("2026-06");
  });

  it("atravessa a virada de ano", () => {
    expect(mesMenos("2026-02", 3)).toBe("2025-11");
    expect(mesMenos("2026-01", 12)).toBe("2025-01");
  });

  it("mantém o mês quando o deslocamento é zero", () => {
    expect(mesMenos("2026-08", 0)).toBe("2026-08");
  });
});
