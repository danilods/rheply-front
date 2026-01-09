"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { NotificationSettings } from "@/types/lgpd";
import { getDefaultNotificationSettings } from "@/lib/lgpd";
import { Bell, Mail, MessageSquare, BellRing } from "lucide-react";

interface NotificationPreferencesProps {
  initialSettings?: NotificationSettings;
  onSave?: (settings: NotificationSettings) => void;
}

type NotificationChannel = "email" | "whatsapp" | "push";
type NotificationType = keyof NotificationSettings["email"];

const notificationTypes: {
  key: NotificationType;
  label: string;
  description: string;
}[] = [
  {
    key: "status_updates",
    label: "Atualizações de status",
    description: "Mudanças no status das suas candidaturas",
  },
  {
    key: "interview_reminders",
    label: "Lembretes de entrevistas",
    description: "Notificações sobre entrevistas agendadas",
  },
  {
    key: "new_messages",
    label: "Novas mensagens",
    description: "Mensagens de recrutadores e empresas",
  },
  {
    key: "job_recommendations",
    label: "Recomendações de vagas",
    description: "Vagas que combinam com seu perfil",
  },
  {
    key: "feedback_received",
    label: "Feedback recebido",
    description: "Feedback sobre suas entrevistas",
  },
];

const channels: {
  key: NotificationChannel;
  label: string;
  icon: React.ElementType;
  description: string;
}[] = [
  {
    key: "email",
    label: "Email",
    icon: Mail,
    description: "Receba notificações por email",
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    icon: MessageSquare,
    description: "Receba notificações via WhatsApp",
  },
  {
    key: "push",
    label: "Push",
    icon: BellRing,
    description: "Notificações no navegador",
  },
];

export function NotificationPreferences({
  initialSettings,
  onSave,
}: NotificationPreferencesProps) {
  const [settings, setSettings] = useState<NotificationSettings>(
    initialSettings || getDefaultNotificationSettings()
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleToggle = (
    channel: NotificationChannel,
    type: NotificationType,
    checked: boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [type]: checked,
      },
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // In production, save to API
      // await fetch('/api/notification-settings', {
      //   method: 'PUT',
      //   body: JSON.stringify(settings),
      // });

      await new Promise((resolve) => setTimeout(resolve, 500));

      onSave?.(settings);

      toast({
        title: "Preferências salvas",
        description: "Suas preferências de notificação foram atualizadas.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar suas preferências. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const enableAllChannel = (channel: NotificationChannel) => {
    setSettings((prev) => ({
      ...prev,
      [channel]: Object.fromEntries(
        Object.keys(prev[channel]).map((key) => [key, true])
      ) as NotificationSettings[typeof channel],
    }));
  };

  const disableAllChannel = (channel: NotificationChannel) => {
    setSettings((prev) => ({
      ...prev,
      [channel]: Object.fromEntries(
        Object.keys(prev[channel]).map((key) => [key, false])
      ) as NotificationSettings[typeof channel],
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Preferências de Notificação
        </CardTitle>
        <CardDescription>
          Escolha como e quando deseja ser notificado sobre atividades importantes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Grid */}
        <div className="rounded-lg border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_repeat(3,80px)] bg-muted p-3 text-sm font-medium">
            <div>Tipo de Notificação</div>
            {channels.map((channel) => {
              const Icon = channel.icon;
              return (
                <div key={channel.key} className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{channel.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rows */}
          {notificationTypes.map((type) => (
            <div
              key={type.key}
              className="grid grid-cols-[1fr_repeat(3,80px)] items-center p-3 border-t"
            >
              <div>
                <Label className="text-sm font-medium">{type.label}</Label>
                <p className="text-xs text-muted-foreground">{type.description}</p>
              </div>
              {channels.map((channel) => (
                <div key={channel.key} className="flex justify-center">
                  <Checkbox
                    id={`${channel.key}-${type.key}`}
                    checked={settings[channel.key][type.key]}
                    onCheckedChange={(checked) =>
                      handleToggle(channel.key, type.key, checked as boolean)
                    }
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Ações Rápidas</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {channels.map((channel) => {
              const Icon = channel.icon;
              return (
                <div
                  key={channel.key}
                  className="flex flex-col gap-2 p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{channel.label}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => enableAllChannel(channel.key)}
                    >
                      Ativar todos
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => disableAllChannel(channel.key)}
                    >
                      Desativar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info Box */}
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3 text-xs text-blue-800 dark:text-blue-200">
          <strong>Dica:</strong> Mantenha pelo menos as notificações por email ativas para
          não perder atualizações importantes sobre suas candidaturas e entrevistas.
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar Preferências"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
