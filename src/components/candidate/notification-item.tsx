"use client";

import { Notification, NotificationType } from "@/types/lgpd";
import { formatRelativeTime } from "@/lib/lgpd";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  RefreshCw,
  Calendar,
  MessageSquare,
  Briefcase,
  Star,
  MoreVertical,
  Check,
  MailOpen,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onMarkAsUnread?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (notification: Notification) => void;
}

const notificationConfig: Record<
  NotificationType,
  { icon: React.ElementType; color: string; bgColor: string }
> = {
  status_update: {
    icon: RefreshCw,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  interview_scheduled: {
    icon: Calendar,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  new_message: {
    icon: MessageSquare,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
  },
  job_recommendation: {
    icon: Briefcase,
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
  feedback_received: {
    icon: Star,
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
  },
};

export function NotificationItem({
  notification,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
  onClick,
}: NotificationItemProps) {
  const config = notificationConfig[notification.type];
  const Icon = config.icon;

  const handleClick = () => {
    if (!notification.is_read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    onClick?.(notification);
  };

  return (
    <div
      className={cn(
        "group relative flex items-start gap-4 p-4 rounded-lg border transition-colors",
        notification.is_read
          ? "bg-background hover:bg-muted/50"
          : "bg-primary/5 border-primary/20 hover:bg-primary/10"
      )}
    >
      {/* Unread Indicator */}
      {!notification.is_read && (
        <div className="absolute top-4 left-2 w-2 h-2 rounded-full bg-primary" />
      )}

      {/* Icon */}
      <div className={cn("p-2 rounded-lg shrink-0", config.bgColor)}>
        <Icon className={cn("h-5 w-5", config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <button
          onClick={handleClick}
          className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4
                className={cn(
                  "text-sm truncate",
                  notification.is_read ? "font-medium" : "font-semibold"
                )}
              >
                {notification.title}
              </h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {notification.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(new Date(notification.created_at))}
            </span>
            {notification.link && (
              <span className="text-xs text-primary flex items-center gap-1">
                <ExternalLink className="h-3 w-3" />
                Ver detalhes
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Actions */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Ações</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {notification.is_read ? (
              <DropdownMenuItem onClick={() => onMarkAsUnread?.(notification.id)}>
                <MailOpen className="h-4 w-4 mr-2" />
                Marcar como não lida
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => onMarkAsRead?.(notification.id)}>
                <Check className="h-4 w-4 mr-2" />
                Marcar como lida
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => onDelete?.(notification.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
