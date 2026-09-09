/**
 * Módulo Atração & Seleção — tipos de domínio.
 *
 * As linhas chegam do backend já normalizadas e sem dado pessoal de candidato:
 * nome, CPF, e-mail, telefone, endereço e data de nascimento são descartados na
 * importação. A idade aparece apenas em faixa. Ver docs/superpowers/specs.
 */

/** Status da vaga, consolidado a partir do status da Gupy. */
export type StatusVaga = "Ativa" | "Congelada" | "Aprovada";

/** Classe do desfecho de uma candidatura, derivada do status e do motivo. */
export type ClasseDesfecho =
  | "aprovado"
  | "processo"
  | "reprovado"
  | "declinou"
  | "noshow"
  | "seminfo";

/** Vaga em aberto no snapshot mais recente. */
export interface VagaAberta {
  codigo: number | string;
  req: string | null;
  vaga: string;
  cargo: string;
  status: StatusVaga;
  area: string;
  filial: string;
  cidade: string | null;
  pcd: boolean;
  pub: string | null;
  motivoReq: string | null;
  salIni: number | null;
  posicoes: number;
  posAbertas: number;
  posFechadas: number;
  aprovados: number;
  recrutador: string;
  gestor: string;
  dtCriacao: string | null;
  dtAprov: string | null;
  dtPub: string | null;
  mesCriacao: string | null;
  inscritos: number;
  /** Dias entre criação e aprovação da requisição (O&R). */
  tmOR: number | null;
  /** Dias entre aprovação e publicação (R&S). */
  tmRS: number | null;
  /** Dias entre criação e publicação. */
  tmCiclo: number | null;
  /** Dias corridos desde a aprovação até a data de referência. Número oficial. */
  aging: number | null;
  /** Aging descontando os períodos de congelamento que caem dentro do ciclo. */
  agingLiq: number | null;
  tipoAbertura: string;
  motivoAbertura: string;
  qualificacao: string;
  congelada: boolean;
  /** Nível de gerência, canonizado no backend. */
  gerencia: string;
}

/** Uma contratação (uma pessoa admitida em uma posição). */
export interface Contratacao {
  idVaga: number | string;
  codigo: string;
  vaga: string;
  cargo: string;
  filial: string;
  depto: string;
  origem: string;
  recrutador: string;
  gestor: string;
  salVaga: number | null;
  salContr: number | null;
  motivoReq: string | null;
  genero: string;
  pcd: boolean;
  uf: string;
  faixaEtaria: string;
  dtAceite: string | null;
  dtAdmissao: string | null;
  mes: string | null;
  mesAdm: string | null;
  /** Dias entre a aprovação da O&R e o aceite da carta oferta. */
  tmPosicao: number | null;
  /** Dias entre o aceite da carta e a admissão. */
  dAceiteAdm: number | null;
  /** Dias entre a inscrição na Gupy e o aceite. Negativo quando a inscrição é posterior. */
  dInscAceite: number | null;
  /**
   * Etapas da requisição que originou esta posição, cruzadas no servidor com a
   * base de vagas. A planilha de contratações não traz criação nem publicação;
   * o encontro acontece no banco, onde a tabela de vagas está inteira —
   * inclusive as que já fecharam.
   */
  tmOR: number | null;
  tmRS: number | null;
  indicacao: string | null;
  interno: boolean;
}

/** Uma candidatura trabalhada no funil (candidato × vaga). */
export interface Candidatura {
  codigo: string;
  localidade: string;
  posicao: string;
  gerencia: string | null;
  gestor: string;
  origem: string;
  status: string;
  motivo: string;
  desfecho: string;
  cls: ClasseDesfecho;
  /** Etapa mais avançada alcançada, de 1 (abordado) a 5 (aprovado). */
  etapa: 1 | 2 | 3 | 4 | 5;
  catMotivo: string;
  dtAbertura: string | null;
  mes: string | null;
  anotacao: string | null;
}

/** Conjunto completo entregue pelo backend para o painel. */
export interface PainelAtracaoSelecao {
  /** Data de referência do snapshot, em AAAA-MM-DD. */
  ref: string;
  abertas: VagaAberta[];
  contr: Contratacao[];
  funil: Candidatura[];
}

/** Resultado de um lote de importação de planilha. */
export interface LoteImportacao {
  id: string;
  tipo: TipoPlanilha;
  arquivo: string;
  hash: string;
  criadoEm: string;
  criadoPor: string | null;
  lidas: number;
  novas: number;
  alteradas: number;
  inalteradas: number;
  rejeitadas: number;
  ausentes: number;
  estado: "previa" | "aplicado" | "desfeito";
}

export type TipoPlanilha = "vagas" | "contratacoes" | "funil" | "desconhecido";

/** Uma linha que não passou na validação da importação. */
export interface RejeicaoImportacao {
  linha: number | null;
  coluna: string | null;
  valor: string | null;
  motivo: string;
}

/** Uma aba reconhecida dentro do mesmo arquivo. */
export interface AbaDisponivel {
  aba: string;
  tipo: TipoPlanilha;
  linhas: number;
  visivel: boolean;
}

/** Prévia devolvida pelo backend antes de confirmar a importação. */
export interface PreviaImportacao {
  loteId: string;
  tipo: TipoPlanilha;
  aba: string | null;
  arquivo: string;
  estado: "previa" | "aplicado" | "desfeito";
  colunasReconhecidas: string[];
  /** Colunas com dado pessoal, descartadas antes de qualquer gravação. */
  colunasIgnoradas: string[];
  totalLinhas: number;
  novas: number;
  alteradas: number;
  inalteradas: number;
  /** Registros que existem na base e não vieram nesta exportação. Não são apagados. */
  ausentes: number;
  /** Linhas bloqueadas: precisam de correção na planilha. */
  rejeicoes: RejeicaoImportacao[];
  /** Incoerências que não impediram a importação. */
  avisos: RejeicaoImportacao[];
  abasDisponiveis: AbaDisponivel[];
  camposAlterados: string[];
}
