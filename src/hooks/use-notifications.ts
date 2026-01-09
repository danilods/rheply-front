"use client";

import { useState, useEffect, useCallback } from 'react';
import { Notification } from '@/types/lgpd';

interface UseNotificationsOptions {
  autoFetch?: boolean;
  pollInterval?: number; // in milliseconds
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  markAsUnread: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

// Mock data for demonstration
const mockNotifications: Notification[] = [
  {
    id: '1',
    user_id: 'user1',
    type: 'status_update',
    title: 'Candidatura atualizada',
    description: 'Sua candidatura para Desenvolvedor Frontend avançou para a fase de entrevista.',
    link: '/candidato/candidaturas/1',
    is_read: false,
    created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
  },
  {
    id: '2',
    user_id: 'user1',
    type: 'interview_scheduled',
    title: 'Entrevista agendada',
    description: 'Sua entrevista técnica foi agendada para 20/11/2025 às 14:00.',
    link: '/candidato/entrevistas/1',
    is_read: false,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
  },
  {
    id: '3',
    user_id: 'user1',
    type: 'new_message',
    title: 'Nova mensagem',
    description: 'O recrutador João Silva enviou uma mensagem sobre sua candidatura.',
    link: '/candidato/mensagens/1',
    is_read: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: '4',
    user_id: 'user1',
    type: 'job_recommendation',
    title: 'Vaga recomendada',
    description: 'Encontramos uma vaga de Engenheiro de Software que combina com seu perfil.',
    link: '/vagas/123',
    is_read: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    read_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    user_id: 'user1',
    type: 'feedback_received',
    title: 'Feedback recebido',
    description: 'Você recebeu feedback sobre sua entrevista para Product Manager.',
    link: '/candidato/candidaturas/2',
    is_read: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    read_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function useNotifications(
  options: UseNotificationsOptions = {}
): UseNotificationsReturn {
  const { autoFetch = true, pollInterval = 0 } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In production, this would be an API call
      // const response = await fetch('/api/notifications');
      // const data = await response.json();

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setNotifications(mockNotifications);
    } catch (err) {
      setError('Erro ao carregar notificações');
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      // In production, this would be an API call
      // await fetch(`/api/notifications/${notificationId}/read`, { method: 'POST' });

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                is_read: true,
                read_at: new Date().toISOString(),
              }
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      // In production, this would be an API call
      // await fetch('/api/notifications/read-all', { method: 'POST' });

      const now = new Date().toISOString();
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          is_read: true,
          read_at: notification.read_at || now,
        }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      throw err;
    }
  }, []);

  const markAsUnread = useCallback(async (notificationId: string) => {
    try {
      // In production, this would be an API call
      // await fetch(`/api/notifications/${notificationId}/unread`, { method: 'POST' });

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                is_read: false,
                read_at: undefined,
              }
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as unread:', err);
      throw err;
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      // In production, this would be an API call
      // await fetch(`/api/notifications/${notificationId}`, { method: 'DELETE' });

      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId)
      );
    } catch (err) {
      console.error('Error deleting notification:', err);
      throw err;
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      // In production, this would be an API call
      // await fetch('/api/notifications', { method: 'DELETE' });

      setNotifications([]);
    } catch (err) {
      console.error('Error clearing notifications:', err);
      throw err;
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchNotifications();
    }
  }, [autoFetch, fetchNotifications]);

  // Polling for real-time updates (optional)
  useEffect(() => {
    if (pollInterval > 0) {
      const interval = setInterval(fetchNotifications, pollInterval);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [pollInterval, fetchNotifications]);

  // WebSocket support (placeholder for future implementation)
  useEffect(() => {
    // In production, set up WebSocket connection here
    // const ws = new WebSocket('wss://api.example.com/notifications');
    // ws.onmessage = (event) => {
    //   const newNotification = JSON.parse(event.data);
    //   setNotifications(prev => [newNotification, ...prev]);
    // };
    // return () => ws.close();
  }, []);

  return {
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
  };
}
