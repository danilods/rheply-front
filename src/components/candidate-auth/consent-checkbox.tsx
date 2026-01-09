"use client";

import Link from "next/link";
import { Shield, Lock, Eye, FileText } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ConsentCheckboxProps {
  lgpdChecked: boolean;
  termsChecked: boolean;
  onLgpdChange: (checked: boolean) => void;
  onTermsChange: (checked: boolean) => void;
  lgpdError?: string;
  termsError?: string;
}

export function ConsentCheckbox({
  lgpdChecked,
  termsChecked,
  onLgpdChange,
  onTermsChange,
  lgpdError,
  termsError,
}: ConsentCheckboxProps) {
  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* LGPD Consent */}
        <div className="space-y-2">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="lgpdConsent"
              checked={lgpdChecked}
              onCheckedChange={(checked) => onLgpdChange(checked as boolean)}
              className={cn("mt-1", lgpdError && "border-destructive")}
            />
            <div className="space-y-1">
              <Label
                htmlFor="lgpdConsent"
                className="text-sm font-normal cursor-pointer leading-relaxed"
              >
                Autorizo o tratamento dos meus dados pessoais conforme a{" "}
                <Link
                  href="/politica-privacidade"
                  className="text-primary hover:text-primary/80 underline font-medium"
                  target="_blank"
                >
                  Politica de Privacidade
                </Link>{" "}
                e a Lei Geral de Protecao de Dados (LGPD).
              </Label>
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>Seus dados serao usados para:</span>
                </p>
                <ul className="ml-4 space-y-0.5">
                  <li className="flex items-center space-x-1">
                    <span className="h-1 w-1 bg-muted-foreground rounded-full" />
                    <span>Criar e gerenciar seu perfil profissional</span>
                  </li>
                  <li className="flex items-center space-x-1">
                    <span className="h-1 w-1 bg-muted-foreground rounded-full" />
                    <span>Conectar voce a oportunidades relevantes</span>
                  </li>
                  <li className="flex items-center space-x-1">
                    <span className="h-1 w-1 bg-muted-foreground rounded-full" />
                    <span>Enviar notificacoes sobre vagas (se autorizado)</span>
                  </li>
                </ul>
                <div className="flex items-center space-x-2 pt-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-1 text-green-600">
                        <Shield className="h-3 w-3" />
                        <span className="text-xs font-medium">Protegido</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Seus dados sao criptografados e protegidos</p>
                    </TooltipContent>
                  </Tooltip>
                  <span className="text-muted-foreground">|</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-1 text-blue-600">
                        <Lock className="h-3 w-3" />
                        <span className="text-xs font-medium">Privado</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Nao compartilhamos seus dados sem autorizacao</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
          {lgpdError && (
            <p className="text-sm text-destructive ml-7">{lgpdError}</p>
          )}
        </div>

        {/* Terms of Service */}
        <div className="space-y-2">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="termsAccepted"
              checked={termsChecked}
              onCheckedChange={(checked) => onTermsChange(checked as boolean)}
              className={cn("mt-1", termsError && "border-destructive")}
            />
            <div className="space-y-1">
              <Label
                htmlFor="termsAccepted"
                className="text-sm font-normal cursor-pointer leading-relaxed flex items-start"
              >
                <FileText className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                <span>
                  Li e aceito os{" "}
                  <Link
                    href="/termos-uso"
                    className="text-primary hover:text-primary/80 underline font-medium"
                    target="_blank"
                  >
                    Termos de Uso
                  </Link>{" "}
                  da plataforma.
                </span>
              </Label>
            </div>
          </div>
          {termsError && (
            <p className="text-sm text-destructive ml-7">{termsError}</p>
          )}
        </div>

        {/* Security Badges */}
        <div className="bg-muted/50 rounded-lg p-3 mt-4">
          <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Shield className="h-4 w-4 text-green-600" />
              <span>SSL Seguro</span>
            </div>
            <div className="h-4 w-px bg-muted-foreground/30" />
            <div className="flex items-center space-x-1">
              <Lock className="h-4 w-4 text-blue-600" />
              <span>Dados Criptografados</span>
            </div>
            <div className="h-4 w-px bg-muted-foreground/30" />
            <div className="flex items-center space-x-1">
              <FileText className="h-4 w-4 text-purple-600" />
              <span>LGPD Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
