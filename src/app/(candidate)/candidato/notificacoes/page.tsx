"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationItem } from "@/components/candidate/notification-item";
import { Notification } from "@/types/lgpd";
import { useToast } from "@/hooks/use-toast";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  RefreshCw,
  Settings,
  Loader2,
} from "lucide-react";
import Link from "next/link";

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    markAsUnread,
    deleteNotification,
    clearAll,
  } = useNotifications();
  const { toast } = useToast();

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.is_read)
      : notifications;

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast({
        title: "Notificações marcadas como lidas",
        description: "Todas as notificações foram marcadas como lidas.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível marcar as notificações como lidas.",
        variant: "destructive",
      });
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAll();
      toast({
        title: "Notificações excluídas",
        description: "Todas as notificações foram removidas.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir as notificações.",
        variant: "destructive",
      });
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.link) {
      // In production, use router.push(notification.link)
      window.location.href = notification.link;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      toast({
        title: "Notificação excluída",
        description: "A notificação foi removida com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a notificação.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Notificações
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} {unreadCount === 1 ? "nova" : "novas"}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe atualizações sobre suas candidaturas, entrevistas e oportunidades.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNotifications}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Atualizar
          </Button>
          <Link href="/candidato/configuracoes">
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Central de Notificações</CardTitle>
              <CardDescription>
                {notifications.length === 0
                  ? "Você não tem notificações"
                  : `${notifications.length} notificações, ${unreadCount} não lidas`}
              </CardDescription>
            </div>

            {/* Actions */}
            {notifications.length > 0 && (
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="gap-2"
                  >
                    <CheckCheck className="h-4 w-4" />
                    Marcar todas como lidas
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Limpar
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter Tabs */}
          <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "unread")}>
            <TabsList className="mb-4">
              <TabsTrigger value="all" className="gap-2">
                <Bell className="h-4 w-4" />
                Todas ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread" className="gap-2">
                <BellOff className="h-4 w-4" />
                Não Lidas ({unreadCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-0">
              {renderNotificationsList()}
            </TabsContent>
            <TabsContent value="unread" className="space-y-0">
              {renderNotificationsList()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Notification Types Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tipos de Notificação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <RefreshCw className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Atualização de Status</p>
                <p className="text-xs text-muted-foreground">
                  Mudanças no status da candidatura
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Entrevista Agendada</p>
                <p className="text-xs text-muted-foreground">
                  Lembretes de entrevistas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <Bell className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Nova Mensagem</p>
                <p className="text-xs text-muted-foreground">
                  Mensagens de recrutadores
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Bell className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Vaga Recomendada</p>
                <p className="text-xs text-muted-foreground">
                  Oportunidades personalizadas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Bell className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Feedback Recebido</p>
                <p className="text-xs text-muted-foreground">
                  Retorno sobre entrevistas
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  function renderNotificationsList() {
    if (isLoading && filteredNotifications.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">Carregando notificações...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-destructive mb-4">
            <BellOff className="h-12 w-12" />
          </div>
          <p className="text-sm text-destructive font-medium">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNotifications}
            className="mt-4"
          >
            Tentar novamente
          </Button>
        </div>
      );
    }

    if (filteredNotifications.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-muted-foreground mb-4">
            <BellOff className="h-12 w-12" />
          </div>
          <p className="text-sm text-muted-foreground">
            {filter === "unread"
              ? "Todas as notificações foram lidas!"
              : "Você não tem notificações no momento."}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {filteredNotifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={markAsRead}
            onMarkAsUnread={markAsUnread}
            onDelete={handleDelete}
            onClick={handleNotificationClick}
          />
        ))}
      </div>
    );
  }
}
