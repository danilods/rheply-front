/**
 * Serviço do módulo Atração & Seleção.
 *
 * Os caminhos são relativos a NEXT_PUBLIC_API_URL, que já termina em /api/v1.
 * O backend monta este módulo em /api/v1/atracao-selecao, com prefixo próprio:
 * /analytics já é servido por dois routers no backend e uma terceira montagem
 * colidiria em silêncio.
 */

import { apiClient } from "@/lib/api";
import type {
  LoteImportacao,
  PainelAtracaoSelecao,
  PreviaImportacao,
} from "@/types/atracao-selecao";

const CAMINHOS = {
  painel: "/atracao-selecao/painel",
  painelPublico: "/atracao-selecao/publico/painel",
  links: "/atracao-selecao/links",
  revogarLink: (id: string) => `/atracao-selecao/links/${id}`,
  qualidade: "/atracao-selecao/qualidade",
  agregado: (campo: string) => `/atracao-selecao/agregados/${campo}`,
  importacoes: "/atracao-selecao/importacoes",
  confirmar: (id: string) => `/atracao-selecao/importacoes/${id}/confirmar`,
  desfazer: (id: string) => `/atracao-selecao/importacoes/${id}/desfazer`,
} as const;

/** Completude de um campo que a diretoria cobra e que hoje falta. */
export interface CompletudeCampo {
  campo: string;
  onde: string;
  total: number;
  faltando: number;
  completude: number | null;
}

export interface QualidadeDados {
  atualizadoEm: string | null;
  campos: CompletudeCampo[];
  vagasSemComplemento: string[];
  lotes: LoteImportacao[];
  totais: Record<string, number>;
}

/** Um link de leitura para quem não tem conta. O token nunca volta numa listagem. */
export interface LinkPublico {
  id: string;
  descricao: string;
  estado: "ativo" | "expirado" | "revogado";
  criadoEm?: string;
  criado_em?: string;
  expira_em: string;
  revogado_em: string | null;
  acessos: number;
  ultimo_acesso_em: string | null;
}

/** Só a criação devolve o token, e só uma vez. */
export interface LinkPublicoCriado extends LinkPublico {
  token: string;
}

/** Contagem de dado sensível com supressão de célula com menos de cinco pessoas. */
export interface AgregadoSensivel {
  valor: string;
  total: number | null;
  suprimido: boolean;
}

export const atracaoSelecaoApi = {
  /**
   * Conjunto completo do painel. São algumas centenas de linhas por seção, o
   * que cabe em uma resposta só; o filtro roda no cliente para que indicador,
   * gráfico e tabela nunca divirjam entre si.
   */
  async obterPainel(referencia?: string): Promise<PainelAtracaoSelecao> {
    const { data } = await apiClient.get<PainelAtracaoSelecao>(
      referencia ? `${CAMINHOS.painel}?referencia=${referencia}` : CAMINHOS.painel,
    );
    return data;
  },

  async obterQualidade(): Promise<QualidadeDados> {
    const { data } = await apiClient.get<QualidadeDados>(CAMINHOS.qualidade);
    return data;
  },

  async obterAgregadoSensivel(campo: string): Promise<AgregadoSensivel[]> {
    const { data } = await apiClient.get<AgregadoSensivel[]>(CAMINHOS.agregado(campo));
    return data;
  },

  /** Envia a planilha e devolve a prévia. Nada é gravado até confirmar. */
  async enviarPlanilha(
    arquivo: File,
    opcoes?: { aba?: string; onProgress?: (p: number) => void },
  ): Promise<PreviaImportacao> {
    const formData = new FormData();
    formData.append("arquivo", arquivo);
    const url = opcoes?.aba
      ? `${CAMINHOS.importacoes}?aba=${encodeURIComponent(opcoes.aba)}`
      : CAMINHOS.importacoes;
    const { data } = await apiClient.uploadFormData<PreviaImportacao>(
      url,
      formData,
      opcoes?.onProgress,
    );
    return data;
  },

  async confirmarImportacao(loteId: string): Promise<PreviaImportacao> {
    const { data } = await apiClient.post<PreviaImportacao>(CAMINHOS.confirmar(loteId), {});
    return data;
  },

  async desfazerImportacao(loteId: string): Promise<PreviaImportacao> {
    const { data } = await apiClient.post<PreviaImportacao>(CAMINHOS.desfazer(loteId), {});
    return data;
  },

  async listarImportacoes(limite = 20): Promise<LoteImportacao[]> {
    const { data } = await apiClient.get<LoteImportacao[]>(
      `${CAMINHOS.importacoes}?limite=${limite}`,
    );
    return data;
  },

  /**
   * Painel por link público. Não passa pelo interceptor de sessão: quem abre
   * este endereço não tem conta, e um 401 aqui não é motivo para mandar
   * ninguém para a tela de login.
   */
  async obterPainelPublico(token: string): Promise<PainelAtracaoSelecao> {
    // Mesma base do apiClient. Duas regras para o mesmo endereço divergem na
    // primeira vez que só uma delas for atualizada.
    const base = apiClient.baseURL;
    // O token vai no cabeçalho, não na query: numa query string ele ficaria
    // gravado no log de acesso do nginx e em qualquer proxy do caminho.
    const resposta = await fetch(`${base}${CAMINHOS.painelPublico}`, {
      headers: { Accept: "application/json", "X-Painel-Token": token },
    });
    if (!resposta.ok) throw new Error("link-invalido");
    return (await resposta.json()) as PainelAtracaoSelecao;
  },

  async listarLinks(): Promise<LinkPublico[]> {
    const { data } = await apiClient.get<LinkPublico[]>(CAMINHOS.links);
    return data;
  },

  async criarLink(descricao: string, dias = 7): Promise<LinkPublicoCriado> {
    const { data } = await apiClient.post<LinkPublicoCriado>(CAMINHOS.links, { descricao, dias });
    return data;
  },

  async revogarLink(id: string): Promise<LinkPublico> {
    const { data } = await apiClient.delete<LinkPublico>(CAMINHOS.revogarLink(id));
    return data;
  },
};

/**
 * Traduz a falha da API para uma frase que o recrutador entende.
 *
 * O backend responde 422 com uma mensagem já escrita para a tela; qualquer
 * outra coisa vira uma frase que diz o que aconteceu e o que fazer, nunca um
 * código HTTP solto.
 */
export function mensagemDeErro(erro: unknown): string {
  const e = erro as { response?: { status?: number; data?: { detail?: unknown } } };
  const detalhe = e?.response?.data?.detail;
  if (typeof detalhe === "string") return detalhe;
  const status = e?.response?.status;
  if (status === 401) return "Sua sessão expirou. Entre de novo para continuar.";
  if (status === 403) return "Seu perfil não tem acesso ao módulo de Atração e Seleção.";
  if (status === 413) return "O arquivo é grande demais. O limite é 20 MB.";
  if (status === 404) return "Não encontrei este recurso. Atualize a página e tente de novo.";
  if (status && status >= 500) {
    return "O servidor não respondeu como esperado. Tente de novo em alguns instantes.";
  }
  return "Não consegui falar com o servidor. Verifique a conexão e tente de novo.";
}
