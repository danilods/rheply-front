"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PrivacyControls } from "@/components/candidate/privacy-controls";
import { DataExportButton } from "@/components/candidate/data-export-button";
import { DeleteAccountModal } from "@/components/candidate/delete-account-modal";
import { NotificationPreferences } from "@/components/candidate/notification-preferences";
import { JobAlertForm } from "@/components/candidate/job-alert-form";
import { getConsentHistory, formatRelativeTime } from "@/lib/lgpd";
import {
  Settings,
  User,
  Shield,
  Bell,
  Search,
  Eye,
  EyeOff,
  History,
} from "lucide-react";

export default function CandidateSettingsPage() {
  const [activeTab, setActiveTab] = useState("conta");
  const { toast } = useToast();

  // Account form state
  const [email, setEmail] = useState("joao.silva@email.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("(11) 98765-4321");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoadingAccount, setIsLoadingAccount] = useState(false);

  // Consent history
  const consentHistory = getConsentHistory();

  const handleSaveAccount = async () => {
    setIsLoadingAccount(true);

    try {
      // Validate passwords if changing
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          toast({
            title: "Erro",
            description: "As senhas não coincidem.",
            variant: "destructive",
          });
          return;
        }
        if (newPassword.length < 8) {
          toast({
            title: "Erro",
            description: "A nova senha deve ter pelo menos 8 caracteres.",
            variant: "destructive",
          });
          return;
        }
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Configurações salvas",
        description: "Suas informações de conta foram atualizadas com sucesso.",
      });

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar suas informações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAccount(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Configurações
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie sua conta, privacidade e preferências de notificação.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="conta" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Conta</span>
          </TabsTrigger>
          <TabsTrigger value="privacidade" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Privacidade</span>
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="alertas" className="gap-2">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Alertas</span>
          </TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="conta" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Conta</CardTitle>
              <CardDescription>
                Atualize suas informações de contato e credenciais de acesso.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Este é o email usado para login e comunicações.
                </p>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
                <p className="text-xs text-muted-foreground">
                  Usado para notificações via WhatsApp e contato de recrutadores.
                </p>
              </div>

              {/* Password Change */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="text-sm font-medium">Alterar Senha</h4>

                <div className="space-y-2">
                  <Label htmlFor="current-password">Senha Atual</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Mínimo de 8 caracteres
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveAccount} disabled={isLoadingAccount}>
                  {isLoadingAccount ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Delete Account */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
              <CardDescription>
                Ações irreversíveis relacionadas à sua conta.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Excluir Conta</h4>
                  <p className="text-xs text-muted-foreground">
                    Remove permanentemente sua conta e todos os dados associados (LGPD).
                  </p>
                </div>
                <DeleteAccountModal />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacidade" className="space-y-6">
          <PrivacyControls />

          {/* Data Export & Deletion */}
          <Card>
            <CardHeader>
              <CardTitle>Seus Dados (LGPD)</CardTitle>
              <CardDescription>
                Exerça seus direitos previstos na Lei Geral de Proteção de Dados.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <DataExportButton />
                <DeleteAccountModal />
              </div>
            </CardContent>
          </Card>

          {/* Consent History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico de Consentimento
              </CardTitle>
              <CardDescription>
                Registro de todas as suas autorizações e revogações de consentimento.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {consentHistory.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {consentHistory
                    .slice()
                    .reverse()
                    .map((record, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded border bg-muted/50 text-xs"
                      >
                        <div>
                          <span className="font-medium">
                            {record.type.replace(/_/g, " ")}
                          </span>
                          <span
                            className={`ml-2 px-1.5 py-0.5 rounded ${
                              record.action === "granted"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {record.action === "granted" ? "Concedido" : "Revogado"}
                          </span>
                        </div>
                        <span className="text-muted-foreground">
                          {formatRelativeTime(record.timestamp)}
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum histórico de consentimento registrado ainda.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notificacoes">
          <NotificationPreferences />
        </TabsContent>

        {/* Job Alerts Tab */}
        <TabsContent value="alertas">
          <JobAlertForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
