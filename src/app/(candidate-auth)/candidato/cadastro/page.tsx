"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  ArrowRight,
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CVUploader } from "@/components/candidate-auth/cv-uploader";
import { ParsingPreview } from "@/components/candidate-auth/parsing-preview";
import { ConsentCheckbox } from "@/components/candidate-auth/consent-checkbox";
import {
  candidateStep1Schema,
  candidateStep3Schema,
  calculatePasswordStrength,
  type CandidateStep1FormData,
  type CandidateStep3FormData,
} from "@/lib/validations/candidate";
import { useCandidateAuthStore } from "@/store/candidate-auth";
import {
  Availability,
  AREAS_OF_INTEREST,
  UploadStatus,
} from "@/types/candidate";
import { cn } from "@/lib/utils";

export default function CandidateCadastroPage() {
  const router = useRouter();
  const {
    registrationSteps,
    parsedCVData,
    cvUploadState,
    isLoading,
    error,
    setStep1Data,
    setStep3Data,
    nextStep,
    previousStep,
    uploadCV,
    skipCVUpload,
    resetCVUpload,
    completeRegistration,
    clearError,
  } = useCandidateAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "",
    color: "",
  });

  // Step 1 Form
  const step1Form = useForm<CandidateStep1FormData>({
    resolver: zodResolver(candidateStep1Schema),
    defaultValues: {
      fullName: registrationSteps.stepData.step1?.fullName || "",
      email: registrationSteps.stepData.step1?.email || "",
      phone: registrationSteps.stepData.step1?.phone || "",
      password: "",
      confirmPassword: "",
      lgpdConsent: false as unknown as true,
      termsAccepted: false as unknown as true,
    },
  });

  // Step 3 Form
  const step3Form = useForm<CandidateStep3FormData>({
    resolver: zodResolver(candidateStep3Schema),
    defaultValues: {
      areasOfInterest: registrationSteps.stepData.step3?.areasOfInterest || [],
      salaryMin: registrationSteps.stepData.step3?.salaryExpectation?.min || 3000,
      salaryMax: registrationSteps.stepData.step3?.salaryExpectation?.max || 10000,
      availability:
        registrationSteps.stepData.step3?.availability || Availability.THIRTY_DAYS,
      openToRelocation:
        registrationSteps.stepData.step3?.openToRelocation || false,
      receiveJobAlerts:
        registrationSteps.stepData.step3?.receiveJobAlerts ?? true,
    },
  });

  const password = step1Form.watch("password");
  const selectedAreas = step3Form.watch("areasOfInterest");

  useEffect(() => {
    if (password) {
      setPasswordStrength(calculatePasswordStrength(password));
    } else {
      setPasswordStrength({ score: 0, label: "", color: "" });
    }
  }, [password]);

  const handleStep1Submit = async (data: CandidateStep1FormData) => {
    clearError();
    setStep1Data({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || "",
      password: data.password,
      lgpdConsent: data.lgpdConsent,
      termsAccepted: data.termsAccepted,
    });
    nextStep();
  };

  const handleStep2Next = () => {
    if (parsedCVData || cvUploadState.status === UploadStatus.SUCCESS) {
      nextStep();
    }
  };

  const handleStep2Skip = () => {
    skipCVUpload();
    nextStep();
  };

  const handleStep3Submit = async (data: CandidateStep3FormData) => {
    clearError();
    setStep3Data({
      areasOfInterest: data.areasOfInterest,
      salaryExpectation: {
        min: data.salaryMin ?? 3000,
        max: data.salaryMax ?? 10000,
        currency: "BRL",
      },
      availability: (data.availability as Availability) || Availability.THIRTY_DAYS,
      openToRelocation: data.openToRelocation ?? false,
      receiveJobAlerts: data.receiveJobAlerts ?? true,
    });

    try {
      await completeRegistration();
      router.push("/candidato/dashboard");
    } catch {
      // Error handled by store
    }
  };

  const handleFileSelect = async (file: File) => {
    try {
      await uploadCV(file);
    } catch {
      // Error handled by store
    }
  };

  const toggleAreaOfInterest = (area: string) => {
    const current = step3Form.getValues("areasOfInterest");
    if (current.includes(area)) {
      step3Form.setValue(
        "areasOfInterest",
        current.filter((a) => a !== area),
        { shouldValidate: true }
      );
    } else if (current.length < 5) {
      step3Form.setValue("areasOfInterest", [...current, area], {
        shouldValidate: true,
      });
    }
  };

  const formatPhoneInput = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 7)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const renderStep1 = () => (
    <Card className="w-full shadow-lg border-border/50">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Criar conta
        </CardTitle>
        <CardDescription>
          Preencha suas informacoes basicas para comecar
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Security: method="POST" prevents credentials from appearing in URL */}
        <form
          method="POST"
          action=""
          onSubmit={(e) => {
            e.preventDefault();
            step1Form.handleSubmit(handleStep1Submit)(e);
          }}
          className="space-y-4"
        >
          {error && (
            <div
              className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName">Nome completo</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Seu nome completo"
              autoComplete="name"
              {...step1Form.register("fullName")}
            />
            {step1Form.formState.errors.fullName && (
              <p className="text-sm text-destructive">
                {step1Form.formState.errors.fullName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              {...step1Form.register("email")}
            />
            {step1Form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {step1Form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone / WhatsApp</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(11) 99999-9999"
              autoComplete="tel"
              {...step1Form.register("phone", {
                onChange: (e) => {
                  e.target.value = formatPhoneInput(e.target.value);
                },
              })}
            />
            {step1Form.formState.errors.phone && (
              <p className="text-sm text-destructive">
                {step1Form.formState.errors.phone.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Importante para receber notificacoes sobre vagas
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Crie uma senha forte"
                autoComplete="new-password"
                {...step1Form.register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {password && (
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-300",
                        passwordStrength.color
                      )}
                      style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium">
                    {passwordStrength.label}
                  </span>
                </div>
              </div>
            )}
            {step1Form.formState.errors.password && (
              <p className="text-sm text-destructive">
                {step1Form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirme sua senha"
                autoComplete="new-password"
                {...step1Form.register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {step1Form.formState.errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {step1Form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <ConsentCheckbox
            lgpdChecked={step1Form.watch("lgpdConsent") as boolean}
            termsChecked={step1Form.watch("termsAccepted") as boolean}
            onLgpdChange={(checked) =>
              step1Form.setValue("lgpdConsent", checked as true, {
                shouldValidate: true,
              })
            }
            onTermsChange={(checked) =>
              step1Form.setValue("termsAccepted", checked as true, {
                shouldValidate: true,
              })
            }
            lgpdError={step1Form.formState.errors.lgpdConsent?.message}
            termsError={step1Form.formState.errors.termsAccepted?.message}
          />

          <Button type="submit" className="w-full" size="lg">
            Continuar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Ja tem uma conta?{" "}
          <Link
            href="/candidato/login"
            className="text-primary hover:text-primary/80 font-medium"
          >
            Fazer login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="w-full shadow-lg border-border/50">
      <CardHeader className="space-y-1">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <CardTitle className="text-2xl font-bold tracking-tight">
            Envie seu curriculo
          </CardTitle>
        </div>
        <CardDescription>
          Nossa IA analisa seu curriculo e extrai automaticamente suas
          informacoes. Rapido e preciso!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div
            className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20"
            role="alert"
          >
            {error}
          </div>
        )}

        <CVUploader
          onFileSelect={handleFileSelect}
          uploadProgress={cvUploadState.progress}
          uploadStatus={cvUploadState.status}
          error={cvUploadState.error}
          onReset={resetCVUpload}
          selectedFile={cvUploadState.file}
        />

        {parsedCVData && cvUploadState.status === UploadStatus.SUCCESS && (
          <ParsingPreview data={parsedCVData} />
        )}

        <div className="flex items-center justify-between pt-4">
          <Button variant="outline" onClick={previousStep}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              onClick={handleStep2Skip}
              disabled={
                cvUploadState.status === UploadStatus.UPLOADING ||
                cvUploadState.status === UploadStatus.PARSING
              }
            >
              Pular por agora
            </Button>
            <Button
              onClick={handleStep2Next}
              disabled={
                !parsedCVData ||
                cvUploadState.status !== UploadStatus.SUCCESS
              }
            >
              Continuar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card className="w-full shadow-lg border-border/50">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Suas preferencias
        </CardTitle>
        <CardDescription>
          Conte-nos mais sobre o que voce busca para encontrarmos as melhores
          oportunidades
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          method="POST"
          action=""
          onSubmit={(e) => {
            e.preventDefault();
            step3Form.handleSubmit(handleStep3Submit)(e);
          }}
          className="space-y-6"
        >
          {error && (
            <div
              className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="space-y-3">
            <Label>
              Areas de interesse{" "}
              <span className="text-muted-foreground">
                ({selectedAreas.length}/5)
              </span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {AREAS_OF_INTEREST.map((area) => (
                <Badge
                  key={area}
                  variant={selectedAreas.includes(area) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-all hover:scale-105",
                    selectedAreas.includes(area) && "bg-primary"
                  )}
                  onClick={() => toggleAreaOfInterest(area)}
                >
                  {selectedAreas.includes(area) && (
                    <Check className="h-3 w-3 mr-1" />
                  )}
                  {area}
                </Badge>
              ))}
            </div>
            {step3Form.formState.errors.areasOfInterest && (
              <p className="text-sm text-destructive">
                {step3Form.formState.errors.areasOfInterest.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Expectativa salarial (R$)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salaryMin" className="text-xs">
                  Minimo
                </Label>
                <Input
                  id="salaryMin"
                  type="number"
                  min={0}
                  step={500}
                  {...step3Form.register("salaryMin", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryMax" className="text-xs">
                  Maximo
                </Label>
                <Input
                  id="salaryMax"
                  type="number"
                  min={0}
                  step={500}
                  {...step3Form.register("salaryMax", { valueAsNumber: true })}
                />
              </div>
            </div>
            {step3Form.formState.errors.salaryMin && (
              <p className="text-sm text-destructive">
                {step3Form.formState.errors.salaryMin.message}
              </p>
            )}
            {step3Form.formState.errors.salaryMax && (
              <p className="text-sm text-destructive">
                {step3Form.formState.errors.salaryMax.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="availability">Disponibilidade para inicio</Label>
            <Select
              value={step3Form.watch("availability")}
              onValueChange={(value: Availability) =>
                step3Form.setValue("availability", value, {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="availability">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Availability.IMMEDIATE}>Imediato</SelectItem>
                <SelectItem value={Availability.FIFTEEN_DAYS}>
                  15 dias
                </SelectItem>
                <SelectItem value={Availability.THIRTY_DAYS}>
                  30 dias
                </SelectItem>
                <SelectItem value={Availability.SIXTY_DAYS}>
                  60 dias
                </SelectItem>
                <SelectItem value={Availability.NINETY_DAYS}>
                  90 dias
                </SelectItem>
              </SelectContent>
            </Select>
            {step3Form.formState.errors.availability && (
              <p className="text-sm text-destructive">
                {step3Form.formState.errors.availability.message}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="openToRelocation"
                checked={step3Form.watch("openToRelocation")}
                onCheckedChange={(checked) =>
                  step3Form.setValue("openToRelocation", checked as boolean)
                }
              />
              <Label htmlFor="openToRelocation" className="font-normal">
                Estou aberto a mudanca de cidade/estado
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="receiveJobAlerts"
                checked={step3Form.watch("receiveJobAlerts")}
                onCheckedChange={(checked) =>
                  step3Form.setValue("receiveJobAlerts", checked as boolean)
                }
              />
              <Label htmlFor="receiveJobAlerts" className="font-normal">
                Quero receber alertas de vagas por email/WhatsApp
              </Label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <Button variant="outline" onClick={previousStep} type="button">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button type="submit" disabled={isLoading} size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finalizando...
                </>
              ) : (
                <>
                  Criar minha conta
                  <Check className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full">
      {registrationSteps.currentStep === 1 && renderStep1()}
      {registrationSteps.currentStep === 2 && renderStep2()}
      {registrationSteps.currentStep === 3 && renderStep3()}
    </div>
  );
}
