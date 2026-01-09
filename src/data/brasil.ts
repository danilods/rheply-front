/**
 * Base de dados de Estados e Cidades do Brasil
 * Fonte: IBGE
 */

export interface Estado {
  id: number;
  sigla: string;
  nome: string;
  regiao: string;
}

export interface Cidade {
  id: number;
  nome: string;
  estadoId: number;
}

// Lista completa de estados brasileiros (IBGE)
export const ESTADOS_BRASIL: Estado[] = [
  { id: 12, sigla: "AC", nome: "Acre", regiao: "Norte" },
  { id: 27, sigla: "AL", nome: "Alagoas", regiao: "Nordeste" },
  { id: 16, sigla: "AP", nome: "Amapa", regiao: "Norte" },
  { id: 13, sigla: "AM", nome: "Amazonas", regiao: "Norte" },
  { id: 29, sigla: "BA", nome: "Bahia", regiao: "Nordeste" },
  { id: 23, sigla: "CE", nome: "Ceara", regiao: "Nordeste" },
  { id: 53, sigla: "DF", nome: "Distrito Federal", regiao: "Centro-Oeste" },
  { id: 32, sigla: "ES", nome: "Espirito Santo", regiao: "Sudeste" },
  { id: 52, sigla: "GO", nome: "Goias", regiao: "Centro-Oeste" },
  { id: 21, sigla: "MA", nome: "Maranhao", regiao: "Nordeste" },
  { id: 51, sigla: "MT", nome: "Mato Grosso", regiao: "Centro-Oeste" },
  { id: 50, sigla: "MS", nome: "Mato Grosso do Sul", regiao: "Centro-Oeste" },
  { id: 31, sigla: "MG", nome: "Minas Gerais", regiao: "Sudeste" },
  { id: 15, sigla: "PA", nome: "Para", regiao: "Norte" },
  { id: 25, sigla: "PB", nome: "Paraiba", regiao: "Nordeste" },
  { id: 41, sigla: "PR", nome: "Parana", regiao: "Sul" },
  { id: 26, sigla: "PE", nome: "Pernambuco", regiao: "Nordeste" },
  { id: 22, sigla: "PI", nome: "Piaui", regiao: "Nordeste" },
  { id: 33, sigla: "RJ", nome: "Rio de Janeiro", regiao: "Sudeste" },
  { id: 24, sigla: "RN", nome: "Rio Grande do Norte", regiao: "Nordeste" },
  { id: 43, sigla: "RS", nome: "Rio Grande do Sul", regiao: "Sul" },
  { id: 11, sigla: "RO", nome: "Rondonia", regiao: "Norte" },
  { id: 14, sigla: "RR", nome: "Roraima", regiao: "Norte" },
  { id: 42, sigla: "SC", nome: "Santa Catarina", regiao: "Sul" },
  { id: 35, sigla: "SP", nome: "Sao Paulo", regiao: "Sudeste" },
  { id: 28, sigla: "SE", nome: "Sergipe", regiao: "Nordeste" },
  { id: 17, sigla: "TO", nome: "Tocantins", regiao: "Norte" },
];

// Ordenar estados por nome
export const ESTADOS_ORDENADOS = [...ESTADOS_BRASIL].sort((a, b) =>
  a.nome.localeCompare(b.nome)
);

// Função para buscar cidades de um estado via API do backend
export async function fetchCidadesPorEstado(uf: string): Promise<Cidade[]> {
  try {
    // Try backend API first
    const response = await fetch(`/api/v1/localizacao/estados/${uf}/cidades`);

    if (response.ok) {
      const data = await response.json();
      return data.map((cidade: { id: number; nome: string; estado_id: number }) => ({
        id: cidade.id,
        nome: cidade.nome,
        estadoId: cidade.estado_id,
      }));
    }

    // Fallback to IBGE API if backend not available
    const ibgeResponse = await fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`
    );

    if (!ibgeResponse.ok) {
      throw new Error("Erro ao buscar cidades");
    }

    const ibgeData = await ibgeResponse.json();

    return ibgeData.map((cidade: { id: number; nome: string }) => ({
      id: cidade.id,
      nome: cidade.nome,
      estadoId: ESTADOS_BRASIL.find((e) => e.sigla === uf)?.id || 0,
    }));
  } catch (error) {
    console.error("Erro ao buscar cidades:", error);
    return [];
  }
}

// Cache de cidades para evitar múltiplas requisições
const cidadesCache: Record<string, Cidade[]> = {};

export async function getCidadesPorEstado(uf: string): Promise<Cidade[]> {
  if (cidadesCache[uf]) {
    return cidadesCache[uf];
  }

  const cidades = await fetchCidadesPorEstado(uf);
  cidadesCache[uf] = cidades;
  return cidades;
}

// Função para buscar estado por sigla
export function getEstadoPorSigla(sigla: string): Estado | undefined {
  return ESTADOS_BRASIL.find((e) => e.sigla === sigla);
}

// Função para buscar estado por ID
export function getEstadoPorId(id: number): Estado | undefined {
  return ESTADOS_BRASIL.find((e) => e.id === id);
}
