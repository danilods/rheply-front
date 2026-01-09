"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCandidateStore } from "@/store/candidate";
import { Download, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DownloadCVButtonProps {
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "default" | "lg";
  className?: string;
  showIcon?: boolean;
}

export function DownloadCVButton({
  variant = "default",
  size = "default",
  className,
  showIcon = true,
}: DownloadCVButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    profile,
    experiences,
    education,
    skills,
    languages,
    certifications,
    projects,
  } = useCandidateStore();

  const generateATSOptimizedCV = async () => {
    if (!profile) return;

    setIsGenerating(true);
    setIsSuccess(false);

    try {
      // Simulate PDF generation (in production, this would call an API)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create ATS-optimized CV content
      const cvContent = generateCVContent();

      // Create and download the file
      const blob = new Blob([cvContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${profile.firstName}_${profile.lastName}_CV.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error("Error generating CV:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCVContent = () => {
    const lines: string[] = [];

    // Header
    lines.push("=".repeat(60));
    lines.push(`${profile?.firstName?.toUpperCase()} ${profile?.lastName?.toUpperCase()}`);
    lines.push("=".repeat(60));
    if (profile?.headline) lines.push(profile.headline);
    if (profile?.email) lines.push(`Email: ${profile.email}`);
    if (profile?.phone) lines.push(`Telefone: ${profile.phone}`);
    if (profile?.location) lines.push(`Localizacao: ${profile.location}`);
    lines.push("");

    // Summary
    if (profile?.summary) {
      lines.push("RESUMO PROFISSIONAL");
      lines.push("-".repeat(60));
      lines.push(profile.summary);
      lines.push("");
    }

    // Experience
    if (experiences.length > 0) {
      lines.push("EXPERIENCIA PROFISSIONAL");
      lines.push("-".repeat(60));
      experiences.forEach((exp) => {
        lines.push(`${exp.title} | ${exp.company}`);
        if (exp.location) lines.push(`Localizacao: ${exp.location}`);
        const endDate = exp.isCurrent ? "Presente" : exp.endDate;
        lines.push(`${exp.startDate} - ${endDate}`);
        lines.push("");
        lines.push(exp.description);
        if (exp.achievements.length > 0) {
          lines.push("Conquistas:");
          exp.achievements.forEach((achievement) => {
            lines.push(`  - ${achievement}`);
          });
        }
        if (exp.skills.length > 0) {
          lines.push(`Habilidades: ${exp.skills.join(", ")}`);
        }
        lines.push("");
      });
    }

    // Education
    if (education.length > 0) {
      lines.push("FORMACAO ACADEMICA");
      lines.push("-".repeat(60));
      education.forEach((edu) => {
        lines.push(`${edu.degree} em ${edu.fieldOfStudy}`);
        lines.push(edu.institution);
        const endDate = edu.isCurrent ? "Presente" : edu.endDate;
        lines.push(`${edu.startDate} - ${endDate}`);
        if (edu.description) lines.push(edu.description);
        lines.push("");
      });
    }

    // Skills
    if (skills.length > 0) {
      lines.push("HABILIDADES TECNICAS");
      lines.push("-".repeat(60));
      const skillNames = skills.map((s) => s.name);
      lines.push(skillNames.join(" | "));
      lines.push("");
    }

    // Languages
    if (languages.length > 0) {
      lines.push("IDIOMAS");
      lines.push("-".repeat(60));
      languages.forEach((lang) => {
        const proficiencyMap: Record<string, string> = {
          basico: "Basico",
          intermediario: "Intermediario",
          avancado: "Avancado",
          fluente: "Fluente",
          nativo: "Nativo",
        };
        lines.push(`${lang.name} - ${proficiencyMap[lang.proficiency]}`);
      });
      lines.push("");
    }

    // Certifications
    if (certifications.length > 0) {
      lines.push("CERTIFICACOES");
      lines.push("-".repeat(60));
      certifications.forEach((cert) => {
        lines.push(`${cert.name}`);
        lines.push(`Emitido por: ${cert.issuer}`);
        lines.push(`Data: ${cert.issueDate}`);
        if (cert.credentialUrl) lines.push(`URL: ${cert.credentialUrl}`);
        lines.push("");
      });
    }

    // Projects
    if (projects.length > 0) {
      lines.push("PROJETOS / PORTFOLIO");
      lines.push("-".repeat(60));
      projects.forEach((proj) => {
        lines.push(proj.name);
        lines.push(proj.description);
        if (proj.technologies.length > 0) {
          lines.push(`Tecnologias: ${proj.technologies.join(", ")}`);
        }
        if (proj.url) lines.push(`URL: ${proj.url}`);
        lines.push("");
      });
    }

    return lines.join("\n");
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={generateATSOptimizedCV}
      disabled={isGenerating || !profile}
      className={cn(
        "transition-all duration-300",
        isSuccess && "bg-green-500 hover:bg-green-600",
        className
      )}
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Gerando...
        </>
      ) : isSuccess ? (
        <>
          <CheckCircle className="h-4 w-4 mr-2" />
          Baixado!
        </>
      ) : (
        <>
          {showIcon && <Download className="h-4 w-4 mr-2" />}
          Baixar Curriculo Universal
        </>
      )}
    </Button>
  );
}
