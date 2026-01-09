"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  ArrowLeft,
  Mail,
  CheckCircle,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  passwordRecoverySchema,
  type PasswordRecoveryFormData,
} from "@/lib/validations/candidate";
import { useCandidateAuthStore } from "@/store/candidate-auth";

export default function RecuperarSenhaPage() {
  const { requestPasswordRecovery, isLoading, error, clearError } =
    useCandidateAuthStore();
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordRecoveryFormData>({
    resolver: zodResolver(passwordRecoverySchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: PasswordRecoveryFormData) => {
    clearError();
    try {
      await requestPasswordRecovery(data.email);
      setSentEmail(data.email);
      setEmailSent(true);
    } catch {
      // Error handled by store
    }
  };

  if (emailSent) {
    return (
      <Card className="w-full shadow-lg border-border/50">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-green-100 rounded-full">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-center">
            Email enviado!
          </CardTitle>
          <CardDescription className="text-center">
            Enviamos um link de recuperacao para{" "}
            <strong className="text-foreground">{sentEmail}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-sm">Proximos passos:</h4>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>Verifique sua caixa de entrada (e spam)</li>
              <li>Clique no link de recuperacao no email</li>
              <li>Crie uma nova senha segura</li>
              <li>Acesse sua conta normalmente</li>
            </ol>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Nao recebeu o email?</p>
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => setEmailSent(false)}
            >
              Tentar novamente
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4 text-green-600" />
            <span>Link valido por 24 horas</span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/candidato/login">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg border-border/50">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-primary/10 rounded-full">
            <Mail className="h-10 w-10 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-center">
          Recuperar senha
        </CardTitle>
        <CardDescription className="text-center">
          Informe seu email e enviaremos um link para redefinir sua senha
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          method="POST"
          action=""
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(onSubmit)(e);
          }}
          className="space-y-4"
        >
          {error && (
            <div
              className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email cadastrado</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email")}
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-destructive" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Enviar link de recuperacao
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 bg-muted/50 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-sm">Dicas de seguranca:</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li className="flex items-start space-x-2">
              <span className="h-1.5 w-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
              <span>Use uma senha unica para cada servico</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="h-1.5 w-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
              <span>
                Combine letras maiusculas, minusculas, numeros e simbolos
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="h-1.5 w-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
              <span>Evite informacoes pessoais obvias</span>
            </li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-center w-full">
          <Link href="/candidato/login">
            <Button variant="ghost" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao login
            </Button>
          </Link>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Lembrou a senha?{" "}
            <Link
              href="/candidato/login"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Fazer login
            </Link>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
