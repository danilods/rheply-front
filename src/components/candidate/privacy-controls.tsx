"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PrivacySettings } from "@/types/lgpd";
import { formatRetentionPeriod, getDefaultPrivacySettings, addConsentRecord } from "@/lib/lgpd";
import { Shield, Eye, Users, Building2, Clock, Info } from "lucide-react";

interface PrivacyControlsProps {
  initialSettings?: PrivacySettings;
  onSave?: (settings: PrivacySettings) => void;
}

export function PrivacyControls({ initialSettings, onSave }: PrivacyControlsProps) {
  const [settings, setSettings] = useState<PrivacySettings>(
    initialSettings || getDefaultPrivacySettings()
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleToggle = (key: keyof PrivacySettings, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
      last_updated: new Date().toISOString(),
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Log consent changes
      await addConsentRecord({
        userId: "current-user",
        consentType: "profile_sharing",
        granted: settings.profile_visible,
      });
      await addConsentRecord({
        userId: "current-user",
        consentType: "partner_sharing",
        granted: settings.share_with_partners,
      });

      // In production, save to API
      // await fetch('/api/privacy-settings', {
      //   method: 'PUT',
      //   body: JSON.stringify(settings),
      // });

      await new Promise((resolve) => setTimeout(resolve, 500));

      onSave?.(settings);

      toast({
        title: "Configurações salvas",
        description: "Suas preferências de privacidade foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar suas configurações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Controles de Privacidade
        </CardTitle>
        <CardDescription>
          Gerencie como seus dados são compartilhados e utilizados. Você tem total controle
          sobre suas informações pessoais conforme a LGPD.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Visibility */}
        <div className="flex items-start justify-between space-x-4 p-4 rounded-lg border bg-muted/50">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-blue-600" />
              <Label htmlFor="profile-visible" className="text-sm font-medium">
                Perfil visível para recrutadores
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Quando ativado, recrutadores podem encontrar seu perfil em buscas e ver suas
              informações profissionais. Seu email e telefone permanecem ocultos até você
              autorizar.
            </p>
          </div>
          <Switch
            id="profile-visible"
            checked={settings.profile_visible}
            onCheckedChange={(checked) => handleToggle("profile_visible", checked)}
          />
        </div>

        {/* Available for Proposals */}
        <div className="flex items-start justify-between space-x-4 p-4 rounded-lg border bg-muted/50">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              <Label htmlFor="available-proposals" className="text-sm font-medium">
                Disponível para propostas
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Indique que você está aberto a novas oportunidades de trabalho. Recrutadores
              verão um indicador de disponibilidade no seu perfil.
            </p>
          </div>
          <Switch
            id="available-proposals"
            checked={settings.available_for_proposals}
            onCheckedChange={(checked) => handleToggle("available_for_proposals", checked)}
          />
        </div>

        {/* Partner Sharing */}
        <div className="flex items-start justify-between space-x-4 p-4 rounded-lg border bg-muted/50">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-purple-600" />
              <Label htmlFor="partner-sharing" className="text-sm font-medium">
                Compartilhar dados com empresas parceiras
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Permita que empresas parceiras da plataforma acessem seu perfil para ofertas
              de emprego relevantes. Você pode revogar esta permissão a qualquer momento.
            </p>
          </div>
          <Switch
            id="partner-sharing"
            checked={settings.share_with_partners}
            onCheckedChange={(checked) => handleToggle("share_with_partners", checked)}
          />
        </div>

        {/* Data Retention Info */}
        <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/30">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Retenção de Dados
              </h4>
              <p className="text-xs text-blue-800 dark:text-blue-200">
                Seus dados são mantidos por{" "}
                <strong>{formatRetentionPeriod(settings.data_retention_period)}</strong> após
                sua última atividade, conforme a LGPD. Após este período, dados inativos são
                automaticamente anonimizados.
              </p>
            </div>
          </div>
        </div>

        {/* LGPD Information */}
        <div className="p-4 rounded-lg border bg-amber-50 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100">
                Seus Direitos (LGPD)
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-200">
                De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito de
                acessar, corrigir, excluir e portar seus dados. Utilize as opções abaixo para
                exercer seus direitos.
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
