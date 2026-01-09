import { z } from "zod";

export const candidateLoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  rememberMe: z.boolean().optional(),
});

export const candidateRegisterSchema = z.object({
  fullName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Você deve aceitar os termos de uso",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export const passwordRecoverySchema = z.object({
  email: z.string().email("Email inválido"),
});

export const passwordResetSchema = z.object({
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

// Step 1: Basic personal info with password and consent
export const candidateStep1Schema = z.object({
  fullName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  location: z.string().optional(),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  confirmPassword: z.string(),
  lgpdConsent: z.literal(true, {
    errorMap: () => ({ message: "Você deve aceitar a política de privacidade" }),
  }),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "Você deve aceitar os termos de uso" }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

// Step 3: Professional preferences
export const candidateStep3Schema = z.object({
  areasOfInterest: z.array(z.string()).min(1, "Selecione pelo menos uma área"),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  availability: z.string().optional(),
  openToRelocation: z.boolean().optional(),
  receiveJobAlerts: z.boolean().optional(),
});

// CV file validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export interface CVValidationResult {
  valid: boolean;
  error?: string;
}

export function validateCVFile(file: File): CVValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "Arquivo muito grande. O tamanho máximo é 5MB.",
    };
  }

  if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Tipo de arquivo não aceito. Use PDF, DOC ou DOCX.",
    };
  }

  return { valid: true };
}

// Password strength calculator
export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const levels: PasswordStrength[] = [
    { score: 0, label: "Muito fraca", color: "bg-red-500" },
    { score: 1, label: "Fraca", color: "bg-orange-500" },
    { score: 2, label: "Razoável", color: "bg-yellow-500" },
    { score: 3, label: "Boa", color: "bg-lime-500" },
    { score: 4, label: "Forte", color: "bg-green-500" },
  ];

  return levels[Math.min(score, 4)];
}

export type CandidateLoginInput = z.infer<typeof candidateLoginSchema>;
export type CandidateRegisterInput = z.infer<typeof candidateRegisterSchema>;
export type PasswordRecoveryInput = z.infer<typeof passwordRecoverySchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export type CandidateStep1Input = z.infer<typeof candidateStep1Schema>;
export type CandidateStep3Input = z.infer<typeof candidateStep3Schema>;

// Aliases for backward compatibility
export type CandidateStep1FormData = CandidateStep1Input;
export type CandidateStep3FormData = CandidateStep3Input;
export type CandidateLoginFormData = CandidateLoginInput;
export type CandidateRegisterFormData = CandidateRegisterInput;
export type PasswordRecoveryFormData = PasswordRecoveryInput;
export type PasswordResetFormData = PasswordResetInput;
