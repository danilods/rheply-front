"use client";

/**
 * Formulário de Pré-Registro - Coleta informações do candidato antes do teste.
 *
 * Este componente implementa um formulário multi-step para coleta de dados
 * do candidato antes do teste de digitação, seguindo os requisitos da empresa.
 */

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import {
  User,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  PreRegistrationForm,
  TestDifficulty,
  DIFFICULTY_LABELS,
  EDUCATION_LABELS,
  HOW_DID_YOU_HEAR_LABELS,
  SCHEDULE_LABELS,
  ESTADOS_BRASILEIROS,
} from "@/types/typing-test";

// Schema de validação Zod
const preRegistrationSchema = z.object({
  // Dados Pessoais
  nomeCompleto: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido"),
  rg: z.string().optional(),
  dataNascimento: z.string().optional(),
  genero: z.string().optional(),

  // Contato
  email: z.string().email("Email inválido"),
  telefone: z.string().min(14, "Telefone inválido"),
  whatsapp: z.string().optional(),

  // Endereço
  cep: z.string().optional(),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),

  // Profissional
  cargoPretendido: z.string().optional(),
  areaInteresse: z.string().optional(),
  disponibilidadeHorario: z.string().optional(),
  pretensaoSalarial: z.string().optional(),
  disponibilidadeViagem: z.boolean().default(false),
  possuiCnh: z.boolean().default(false),
  categoriaCnh: z.string().optional(),

  // Formação
  escolaridade: z.string().optional(),
  curso: z.string().optional(),
  instituicao: z.string().optional(),

  // Diversidade
  pcd: z.boolean().default(false),
  tipoDeficiencia: z.string().optional(),

  // Recrutamento
  comoConheceu: z.string().optional(),
  indicadoPor: z.string().optional(),
  codigoVaga: z.string().optional(),

  // Consentimentos
  termosAceitos: z.boolean().refine((val) => val === true, {
    message: "Você deve aceitar os termos de uso",
  }),
  lgpdAceito: z.boolean().refine((val) => val === true, {
    message: "Você deve aceitar os termos da LGPD",
  }),

  // Teste
  testDifficulty: z.nativeEnum(TestDifficulty).default(TestDifficulty.MEDIUM),
});

type FormData = z.infer<typeof preRegistrationSchema>;

interface PreRegistrationFormProps {
  onSubmit: (data: PreRegistrationForm) => Promise<void>;
  isLoading?: boolean;
  defaultValues?: Partial<PreRegistrationForm>;
}

const STEPS = [
  { id: 1, title: "Dados Pessoais", icon: User },
  { id: 2, title: "Contato", icon: Phone },
  { id: 3, title: "Endereço", icon: MapPin },
  { id: 4, title: "Profissional", icon: Briefcase },
  { id: 5, title: "Formação", icon: GraduationCap },
  { id: 6, title: "Confirmação", icon: FileCheck },
];

export function PreRegistrationFormComponent({
  onSubmit,
  isLoading = false,
  defaultValues,
}: PreRegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<FormData>({
    resolver: zodResolver(preRegistrationSchema),
    defaultValues: {
      nomeCompleto: "",
      cpf: "",
      email: "",
      telefone: "",
      disponibilidadeViagem: false,
      possuiCnh: false,
      pcd: false,
      termosAceitos: false,
      lgpdAceito: false,
      testDifficulty: TestDifficulty.MEDIUM,
      ...defaultValues,
    },
    mode: "onChange",
  });

  // Formatação de CPF
  const formatCpf = useCallback((value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9)
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  }, []);

  // Formatação de telefone
  const formatPhone = useCallback((value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }, []);

  // Formatação de CEP
  const formatCep = useCallback((value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  }, []);

  // Navegar entre steps
  const nextStep = useCallback(async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid && currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, form]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  // Campos por step
  function getFieldsForStep(step: number): (keyof FormData)[] {
    switch (step) {
      case 1:
        return ["nomeCompleto", "cpf"];
      case 2:
        return ["email", "telefone"];
      case 3:
        return [];
      case 4:
        return [];
      case 5:
        return [];
      case 6:
        return ["termosAceitos", "lgpdAceito"];
      default:
        return [];
    }
  }

  // Submit do formulário
  const handleSubmit = async (data: FormData) => {
    await onSubmit(data as PreRegistrationForm);
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  isActive ? "text-primary" : isCompleted ? "text-green-600" : "text-muted-foreground"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    isActive
                      ? "border-primary bg-primary/10"
                      : isCompleted
                      ? "border-green-600 bg-green-50"
                      : "border-muted"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs mt-1 hidden sm:block">{step.title}</span>
              </div>
            );
          })}
        </div>
        <Progress value={progress} className="h-2" />
        <CardTitle className="mt-4">
          {STEPS[currentStep - 1].title}
        </CardTitle>
        <CardDescription>
          Passo {currentStep} de {STEPS.length}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Step 1: Dados Pessoais */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="nomeCompleto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo *</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="000.000.000-00"
                          maxLength={14}
                          {...field}
                          onChange={(e) => field.onChange(formatCpf(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RG</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu RG" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dataNascimento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="genero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gênero</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="feminino">Feminino</SelectItem>
                          <SelectItem value="nao_binario">Não-binário</SelectItem>
                          <SelectItem value="prefiro_nao_informar">Prefiro não informar</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 2: Contato */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="seu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(00) 00000-0000"
                          maxLength={15}
                          {...field}
                          onChange={(e) => field.onChange(formatPhone(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(00) 00000-0000"
                          maxLength={15}
                          {...field}
                          onChange={(e) => field.onChange(formatPhone(e.target.value || ""))}
                        />
                      </FormControl>
                      <FormDescription>Se diferente do telefone</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 3: Endereço */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="cep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="00000-000"
                          maxLength={9}
                          {...field}
                          onChange={(e) => field.onChange(formatCep(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="logradouro"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Logradouro</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua, Avenida..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="numero"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input placeholder="123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="complemento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input placeholder="Apartamento, bloco..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bairro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu bairro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cidade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input placeholder="Sua cidade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="UF" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ESTADOS_BRASILEIROS.map((estado) => (
                              <SelectItem key={estado.value} value={estado.value}>
                                {estado.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Profissional */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="cargoPretendido"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo Pretendido</FormLabel>
                      <FormControl>
                        <Input placeholder="Cargo que deseja ocupar" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="areaInteresse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Área de Interesse</FormLabel>
                      <FormControl>
                        <Input placeholder="Área de atuação" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="disponibilidadeHorario"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disponibilidade de Horário</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(SCHEDULE_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pretensaoSalarial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pretensão Salarial</FormLabel>
                      <FormControl>
                        <Input placeholder="R$ 0.000,00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="disponibilidadeViagem"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="!mt-0">Disponibilidade para viagem</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="possuiCnh"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="!mt-0">Possui CNH</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch("possuiCnh") && (
                  <FormField
                    control={form.control}
                    name="categoriaCnh"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria da CNH</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="A">A</SelectItem>
                            <SelectItem value="B">B</SelectItem>
                            <SelectItem value="C">C</SelectItem>
                            <SelectItem value="D">D</SelectItem>
                            <SelectItem value="E">E</SelectItem>
                            <SelectItem value="AB">AB</SelectItem>
                            <SelectItem value="AC">AC</SelectItem>
                            <SelectItem value="AD">AD</SelectItem>
                            <SelectItem value="AE">AE</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="comoConheceu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Como conheceu a empresa?</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(HOW_DID_YOU_HEAR_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("comoConheceu") === "indicacao" && (
                  <FormField
                    control={form.control}
                    name="indicadoPor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Indicado por</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome de quem indicou" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="codigoVaga"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código da Vaga</FormLabel>
                      <FormControl>
                        <Input placeholder="Se tiver, informe o código" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 5: Formação */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="escolaridade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Escolaridade</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(EDUCATION_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="curso"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Curso</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do curso" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instituicao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instituição</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da instituição" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-4">Diversidade</h4>

                  <FormField
                    control={form.control}
                    name="pcd"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="!mt-0">
                          Pessoa com Deficiência (PcD)
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  {form.watch("pcd") && (
                    <FormField
                      control={form.control}
                      name="tipoDeficiencia"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Tipo de Deficiência</FormLabel>
                          <FormControl>
                            <Input placeholder="Descreva o tipo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Step 6: Confirmação */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Resumo dos Dados</h4>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <dt className="text-muted-foreground">Nome:</dt>
                    <dd>{form.watch("nomeCompleto")}</dd>
                    <dt className="text-muted-foreground">CPF:</dt>
                    <dd>{form.watch("cpf")}</dd>
                    <dt className="text-muted-foreground">Email:</dt>
                    <dd>{form.watch("email")}</dd>
                    <dt className="text-muted-foreground">Telefone:</dt>
                    <dd>{form.watch("telefone")}</dd>
                    {form.watch("cargoPretendido") && (
                      <>
                        <dt className="text-muted-foreground">Cargo:</dt>
                        <dd>{form.watch("cargoPretendido")}</dd>
                      </>
                    )}
                  </dl>
                </div>

                <FormField
                  control={form.control}
                  name="testDifficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dificuldade do Teste</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Escolha a dificuldade do teste de digitação
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4 border-t pt-4">
                  <FormField
                    control={form.control}
                    name="termosAceitos"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Li e aceito os Termos de Uso *
                          </FormLabel>
                          <FormDescription>
                            Você concorda com as regras e condições de uso da plataforma.
                          </FormDescription>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lgpdAceito"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Li e aceito a Política de Privacidade (LGPD) *
                          </FormLabel>
                          <FormDescription>
                            Você autoriza o tratamento de seus dados pessoais conforme a LGPD.
                          </FormDescription>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Navegação */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>

              {currentStep < STEPS.length ? (
                <Button type="button" onClick={nextStep}>
                  Próximo
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    "Iniciar Teste"
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
