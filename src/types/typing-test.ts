/**
 * Typing Test Types - Tipos TypeScript para o módulo de testes de digitação.
 *
 * Este módulo define todas as interfaces e enums relacionados aos testes
 * de digitação de candidatos.
 */

// ============================================================================
// Enums
// ============================================================================

export enum TestDifficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
}

export enum TestStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
}

export enum EvaluationResult {
  APPROVED = "APPROVED",
  PARTIAL = "PARTIAL",
  REJECTED = "REJECTED",
}

// ============================================================================
// Interfaces de Dados
// ============================================================================

/**
 * Dados de um teste de digitação.
 */
export interface TypingTest {
  id: string;
  difficulty: TestDifficulty;
  textSample: string;
  status: TestStatus;

  // Resultados
  wpm?: number;
  accuracy?: number;
  errors?: number;
  durationSeconds?: number;
  evaluationResult?: EvaluationResult;

  // Timestamps
  createdAt: string;
  startedAt?: string;
  completedAt?: string;

  // Anti-fraude
  isSuspicious: boolean;
  pasteAttempts: number;
  focusLostCount: number;
}

/**
 * Dados detalhados de um teste de digitação.
 */
export interface TypingTestDetail extends TypingTest {
  // Dados do candidato
  candidateId?: string;
  candidateName?: string;
  candidateCpf?: string;
  candidateEmail?: string;
  candidatePhone?: string;

  // Processo seletivo
  selectionProcessId?: string;

  // Texto digitado
  typedText?: string;

  // Metadados
  metadata?: Record<string, unknown>;
  updatedAt: string;
}

/**
 * Resposta ao iniciar um teste.
 */
export interface TypingTestStartResponse {
  id: string;
  textSample: string;
  difficulty: TestDifficulty;
  status: TestStatus;
  startedAt: string;
}

/**
 * Resultado do teste após submissão.
 */
export interface TypingTestResult {
  id: string;
  wpm: number;
  accuracy: number;
  errors: number;
  durationSeconds: number;
  evaluationResult: EvaluationResult;
  status: TestStatus;
  completedAt: string;
  feedbackMessage: string;
  wpmPercentile?: number;
  isAboveAverage: boolean;
}

/**
 * Lista paginada de testes.
 */
export interface TypingTestListResponse {
  items: TypingTest[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Estatísticas de testes.
 */
export interface TypingTestStats {
  totalTests: number;
  completedTests: number;
  averageWpm: number;
  averageAccuracy: number;
  approvalRate: number;
  byDifficulty: Record<
    string,
    {
      count: number;
      avgWpm: number;
      avgAccuracy: number;
    }
  >;
  testsToday: number;
  testsThisWeek: number;
  testsThisMonth: number;
}

// ============================================================================
// Interfaces de Pré-Registro
// ============================================================================

/**
 * Níveis de escolaridade.
 */
export enum EducationLevel {
  FUNDAMENTAL = "fundamental",
  MEDIO = "medio",
  TECNICO = "tecnico",
  SUPERIOR_INCOMPLETO = "superior_incompleto",
  SUPERIOR_COMPLETO = "superior_completo",
  POS_GRADUACAO = "pos_graduacao",
  MESTRADO = "mestrado",
  DOUTORADO = "doutorado",
}

/**
 * Como conheceu a empresa.
 */
export enum HowDidYouHear {
  LINKEDIN = "linkedin",
  INDEED = "indeed",
  GLASSDOOR = "glassdoor",
  INDICACAO = "indicacao",
  SITE_EMPRESA = "site_empresa",
  REDES_SOCIAIS = "redes_sociais",
  FEIRA_EMPREGO = "feira_emprego",
  UNIVERSIDADE = "universidade",
  OUTRO = "outro",
}

/**
 * Disponibilidade de horário.
 */
export enum ScheduleAvailability {
  INTEGRAL = "integral",
  MEIO_PERIODO_MANHA = "meio_periodo_manha",
  MEIO_PERIODO_TARDE = "meio_periodo_tarde",
  NOTURNO = "noturno",
  FLEXIVEL = "flexivel",
}

/**
 * Dados do formulário de pré-registro.
 */
export interface PreRegistrationForm {
  // Dados Pessoais (obrigatórios)
  nomeCompleto: string;
  cpf: string;
  rg?: string;
  dataNascimento?: string;
  genero?: string;

  // Contato (obrigatórios)
  email: string;
  telefone: string;
  whatsapp?: string;

  // Endereço
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;

  // Dados Profissionais
  cargoPretendido?: string;
  areaInteresse?: string;
  disponibilidadeHorario?: string;
  pretensaoSalarial?: string;
  disponibilidadeViagem: boolean;
  possuiCnh: boolean;
  categoriaCnh?: string;

  // Formação
  escolaridade?: string;
  curso?: string;
  instituicao?: string;

  // Diversidade
  pcd: boolean;
  tipoDeficiencia?: string;

  // Recrutamento
  comoConheceu?: string;
  indicadoPor?: string;
  codigoVaga?: string;

  // Campos customizáveis
  dadosAdicionais?: Record<string, unknown>;

  // Consentimentos (obrigatórios)
  termosAceitos: boolean;
  lgpdAceito: boolean;

  // Configuração do teste
  testDifficulty?: TestDifficulty;
}

/**
 * Resposta do pré-registro.
 */
export interface PreRegistrationResponse {
  id: string;
  nomeCompleto: string;
  cpf: string;
  email: string;
  telefone: string;
  typingTestId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Resposta ao criar teste com pré-registro.
 */
export interface PublicTestWithPreRegistrationResponse {
  preRegistrationId: string;
  candidateName: string;
  candidateEmail: string;
  testId: string;
  testDifficulty: string;
  testStatus: string;
  testUrl: string;
}

// ============================================================================
// Interfaces de Formulário
// ============================================================================

/**
 * Dados para criar um novo teste.
 */
export interface CreateTypingTestInput {
  difficulty?: TestDifficulty;
  candidateName?: string;
  candidateCpf?: string;
  candidateEmail?: string;
  candidatePhone?: string;
  selectionProcessId?: string;
}

/**
 * Dados para submeter um teste.
 */
export interface SubmitTypingTestInput {
  typedText: string;
  durationSeconds: number;
  pasteAttempts?: number;
  focusLostCount?: number;
  keystrokeData?: Record<string, unknown>;
}

/**
 * Dados para atualizar um teste.
 */
export interface UpdateTypingTestInput {
  status?: TestStatus;
  evaluationResult?: EvaluationResult;
  isSuspicious?: boolean;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Interfaces de Estado (Store)
// ============================================================================

/**
 * Estado da sessão de teste em andamento.
 */
export interface TestSession {
  testId: string;
  textSample: string;
  difficulty: TestDifficulty;
  startedAt: Date;
  typedText: string;
  currentIndex: number;
  errors: number;
  pasteAttempts: number;
  focusLostCount: number;
  isRunning: boolean;
}

/**
 * Métricas calculadas em tempo real.
 */
export interface RealTimeMetrics {
  wpm: number;
  accuracy: number;
  errors: number;
  elapsedSeconds: number;
  progress: number; // 0-100%
}

// ============================================================================
// Interfaces de Configuração
// ============================================================================

/**
 * Configuração do teste de digitação.
 */
export interface TypingTestConfig {
  difficulty: TestDifficulty;
  timeLimitSeconds: number;
  minWpmToPass: number;
  minAccuracyToPass: number;
  allowPaste: boolean;
  trackFocus: boolean;
}

/**
 * Configuração padrão.
 */
export const DEFAULT_TEST_CONFIG: TypingTestConfig = {
  difficulty: TestDifficulty.MEDIUM,
  timeLimitSeconds: 300, // 5 minutos
  minWpmToPass: 40,
  minAccuracyToPass: 95,
  allowPaste: false,
  trackFocus: true,
};

// ============================================================================
// Utilitários
// ============================================================================

/**
 * Labels para exibição de dificuldade.
 */
export const DIFFICULTY_LABELS: Record<TestDifficulty, string> = {
  [TestDifficulty.EASY]: "Fácil",
  [TestDifficulty.MEDIUM]: "Médio",
  [TestDifficulty.HARD]: "Difícil",
};

/**
 * Labels para exibição de status.
 */
export const STATUS_LABELS: Record<TestStatus, string> = {
  [TestStatus.PENDING]: "Pendente",
  [TestStatus.IN_PROGRESS]: "Em Andamento",
  [TestStatus.COMPLETED]: "Concluído",
  [TestStatus.CANCELLED]: "Cancelado",
  [TestStatus.EXPIRED]: "Expirado",
};

/**
 * Labels para exibição de resultado.
 */
export const RESULT_LABELS: Record<EvaluationResult, string> = {
  [EvaluationResult.APPROVED]: "Aprovado",
  [EvaluationResult.PARTIAL]: "Parcial",
  [EvaluationResult.REJECTED]: "Reprovado",
};

/**
 * Cores para exibição de resultado.
 */
export const RESULT_COLORS: Record<EvaluationResult, string> = {
  [EvaluationResult.APPROVED]: "text-green-600 bg-green-50",
  [EvaluationResult.PARTIAL]: "text-yellow-600 bg-yellow-50",
  [EvaluationResult.REJECTED]: "text-red-600 bg-red-50",
};

/**
 * Cores para exibição de status.
 */
export const STATUS_COLORS: Record<TestStatus, string> = {
  [TestStatus.PENDING]: "text-gray-600 bg-gray-50",
  [TestStatus.IN_PROGRESS]: "text-blue-600 bg-blue-50",
  [TestStatus.COMPLETED]: "text-green-600 bg-green-50",
  [TestStatus.CANCELLED]: "text-red-600 bg-red-50",
  [TestStatus.EXPIRED]: "text-orange-600 bg-orange-50",
};

/**
 * Labels para níveis de escolaridade.
 */
export const EDUCATION_LABELS: Record<EducationLevel, string> = {
  [EducationLevel.FUNDAMENTAL]: "Ensino Fundamental",
  [EducationLevel.MEDIO]: "Ensino Médio",
  [EducationLevel.TECNICO]: "Ensino Técnico",
  [EducationLevel.SUPERIOR_INCOMPLETO]: "Superior Incompleto",
  [EducationLevel.SUPERIOR_COMPLETO]: "Superior Completo",
  [EducationLevel.POS_GRADUACAO]: "Pós-Graduação",
  [EducationLevel.MESTRADO]: "Mestrado",
  [EducationLevel.DOUTORADO]: "Doutorado",
};

/**
 * Labels para como conheceu.
 */
export const HOW_DID_YOU_HEAR_LABELS: Record<HowDidYouHear, string> = {
  [HowDidYouHear.LINKEDIN]: "LinkedIn",
  [HowDidYouHear.INDEED]: "Indeed",
  [HowDidYouHear.GLASSDOOR]: "Glassdoor",
  [HowDidYouHear.INDICACAO]: "Indicação",
  [HowDidYouHear.SITE_EMPRESA]: "Site da empresa",
  [HowDidYouHear.REDES_SOCIAIS]: "Redes sociais",
  [HowDidYouHear.FEIRA_EMPREGO]: "Feira de emprego",
  [HowDidYouHear.UNIVERSIDADE]: "Universidade",
  [HowDidYouHear.OUTRO]: "Outro",
};

/**
 * Labels para disponibilidade de horário.
 */
export const SCHEDULE_LABELS: Record<ScheduleAvailability, string> = {
  [ScheduleAvailability.INTEGRAL]: "Integral",
  [ScheduleAvailability.MEIO_PERIODO_MANHA]: "Meio período (manhã)",
  [ScheduleAvailability.MEIO_PERIODO_TARDE]: "Meio período (tarde)",
  [ScheduleAvailability.NOTURNO]: "Noturno",
  [ScheduleAvailability.FLEXIVEL]: "Flexível",
};

/**
 * Lista de estados brasileiros.
 */
export const ESTADOS_BRASILEIROS = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];
