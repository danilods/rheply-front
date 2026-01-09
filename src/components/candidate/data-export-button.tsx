"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { downloadJSON, generateDataExport, getConsentHistory } from "@/lib/lgpd";
import { Download, FileJson, FileText, CheckCircle2, Loader2 } from "lucide-react";

export function DataExportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<"json" | "pdf">("json");
  const { toast } = useToast();

  const dataCategories = [
    { name: "Informações pessoais", description: "Nome, email, telefone" },
    { name: "Dados do perfil", description: "Habilidades, experiência, formação" },
    { name: "Candidaturas", description: "Histórico de candidaturas e status" },
    { name: "Configurações de privacidade", description: "Preferências de compartilhamento" },
    { name: "Histórico de consentimento", description: "Registro de autorizações LGPD" },
    { name: "Notificações", description: "Histórico de notificações recebidas" },
    { name: "Log de atividades", description: "Ações realizadas na plataforma" },
  ];

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // In production, fetch actual user data from API
      // const response = await fetch('/api/user/export');
      // const userData = await response.json();

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock user data
      const userData = generateDataExport({
        personal_info: {
          name: "João da Silva",
          email: "joao.silva@email.com",
          phone: "(11) 98765-4321",
          created_at: "2024-01-15T10:30:00Z",
        },
        profile_data: {
          skills: ["JavaScript", "React", "Node.js", "TypeScript"],
          experience: [
            {
              company: "Tech Corp",
              title: "Desenvolvedor Frontend",
              start_date: "2022-03-01",
              end_date: null,
              is_current: true,
            },
          ],
          education: [
            {
              institution: "Universidade XYZ",
              degree: "Bacharelado",
              field_of_study: "Ciência da Computação",
              start_date: "2018-02-01",
              end_date: "2022-12-15",
            },
          ],
        },
        applications: [
          {
            job_title: "Senior Frontend Developer",
            company: "StartupABC",
            applied_at: "2024-10-01",
            status: "interviewing",
          },
        ],
        consent_history: getConsentHistory(),
        notifications: [],
        activity_log: [
          { action: "profile_updated", timestamp: "2024-11-10T14:30:00Z" },
          { action: "application_submitted", timestamp: "2024-10-01T09:15:00Z" },
        ],
      });

      if (exportFormat === "json") {
        downloadJSON(userData, "meus-dados-rheply.json");
        toast({
          title: "Exportação concluída",
          description: "Seus dados foram baixados em formato JSON.",
        });
      } else {
        // PDF export would be handled differently
        toast({
          title: "Exportação iniciada",
          description: "Você receberá um email com o link para download do PDF.",
        });
      }

      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar seus dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Baixar meus dados
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Exportar Meus Dados
          </DialogTitle>
          <DialogDescription>
            De acordo com a LGPD, você tem o direito de baixar todos os dados pessoais que
            armazenamos sobre você.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Format Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Formato de exportação</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setExportFormat("json")}
                className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                  exportFormat === "json"
                    ? "border-primary bg-primary/5"
                    : "border-input hover:border-primary/50"
                }`}
              >
                <FileJson className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <div className="text-sm font-medium">JSON</div>
                  <div className="text-xs text-muted-foreground">Download imediato</div>
                </div>
              </button>
              <button
                onClick={() => setExportFormat("pdf")}
                className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                  exportFormat === "pdf"
                    ? "border-primary bg-primary/5"
                    : "border-input hover:border-primary/50"
                }`}
              >
                <FileText className="h-5 w-5 text-red-600" />
                <div className="text-left">
                  <div className="text-sm font-medium">PDF</div>
                  <div className="text-xs text-muted-foreground">Enviado por email</div>
                </div>
              </button>
            </div>
          </div>

          {/* Data Categories */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Dados incluídos na exportação</label>
            <div className="rounded-lg border bg-muted/50 p-3">
              <div className="space-y-2">
                {dataCategories.map((category, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-medium">{category.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {category.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3 text-xs text-blue-800 dark:text-blue-200">
            <strong>Nota de Segurança:</strong> O arquivo exportado conterá informações
            sensíveis. Mantenha-o em local seguro e não compartilhe com terceiros.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={isExporting} className="gap-2">
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Exportar Dados
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
