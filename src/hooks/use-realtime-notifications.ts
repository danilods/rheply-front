/**
 * React hook for real-time notifications via WebSocket.
 */
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { wsClient } from '@/lib/websocket-client';

interface Notification {
  id: string;
  type: string;
  timestamp: string;
  data: any;
  read: boolean;
}

interface UseRealtimeNotificationsOptions {
  enabled?: boolean;
  maxNotifications?: number;
  autoConnect?: boolean;
}

interface UseRealtimeNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export function useRealtimeNotifications(
  token: string | null,
  options: UseRealtimeNotificationsOptions = {}
): UseRealtimeNotificationsReturn {
  const {
    enabled = true,
    maxNotifications = 100,
    autoConnect = true,
  } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const notificationIdCounter = useRef(0);

  // Generate unique notification ID
  const generateId = useCallback(() => {
    notificationIdCounter.current += 1;
    return `notif-${Date.now()}-${notificationIdCounter.current}`;
  }, []);

  // Handle status update notification
  const handleStatusUpdate = useCallback((data: any) => {
    const notification: Notification = {
      id: generateId(),
      type: 'status_update',
      timestamp: data.timestamp || new Date().toISOString(),
      data: {
        applicationId: data.application_id,
        newStatus: data.new_status,
        jobTitle: data.job_title,
        oldStatus: data.old_status,
      },
      read: false,
    };
    setNotifications(prev => [notification, ...prev].slice(0, maxNotifications));
  }, [generateId, maxNotifications]);

  // Handle new message notification
  const handleNewMessage = useCallback((data: any) => {
    const notification: Notification = {
      id: generateId(),
      type: 'new_message',
      timestamp: data.message?.sent_at || new Date().toISOString(),
      data: {
        conversationId: data.conversation_id,
        message: data.message,
      },
      read: false,
    };
    setNotifications(prev => [notification, ...prev].slice(0, maxNotifications));
  }, [generateId, maxNotifications]);

  // Handle job match notification
  const handleJobMatch = useCallback((data: any) => {
    const notification: Notification = {
      id: generateId(),
      type: 'job_match',
      timestamp: data.timestamp || new Date().toISOString(),
      data: {
        job: data.job,
        matchScore: data.match_score,
        matchingSkills: data.matching_skills,
      },
      read: false,
    };
    setNotifications(prev => [notification, ...prev].slice(0, maxNotifications));
  }, [generateId, maxNotifications]);

  // Handle interview scheduled notification
  const handleInterviewScheduled = useCallback((data: any) => {
    const notification: Notification = {
      id: generateId(),
      type: 'interview_scheduled',
      timestamp: data.timestamp || new Date().toISOString(),
      data: {
        interviewId: data.interview_id,
        jobTitle: data.job_title,
        scheduledTime: data.scheduled_time,
        interviewType: data.interview_type,
        location: data.location,
        meetingLink: data.meeting_link,
      },
      read: false,
    };
    setNotifications(prev => [notification, ...prev].slice(0, maxNotifications));
  }, [generateId, maxNotifications]);

  // Handle interview reminder
  const handleInterviewReminder = useCallback((data: any) => {
    const notification: Notification = {
      id: generateId(),
      type: 'interview_reminder',
      timestamp: data.timestamp || new Date().toISOString(),
      data: {
        interview: data.interview,
        minutesBefore: data.minutes_before,
      },
      read: false,
    };
    setNotifications(prev => [notification, ...prev].slice(0, maxNotifications));
  }, [generateId, maxNotifications]);

  // Handle new application notification (for recruiters)
  const handleNewApplication = useCallback((data: any) => {
    const notification: Notification = {
      id: generateId(),
      type: 'new_application',
      timestamp: data.timestamp || new Date().toISOString(),
      data: {
        applicationId: data.application_id,
        jobId: data.job_id,
        jobTitle: data.job_title,
        candidateName: data.candidate_name,
        matchScore: data.match_score,
      },
      read: false,
    };
    setNotifications(prev => [notification, ...prev].slice(0, maxNotifications));
  }, [generateId, maxNotifications]);

  // Handle system notification
  const handleSystemNotification = useCallback((data: any) => {
    const notification: Notification = {
      id: generateId(),
      type: 'system_notification',
      timestamp: data.timestamp || new Date().toISOString(),
      data: {
        title: data.title,
        message: data.message,
        priority: data.priority,
        actionUrl: data.action_url,
        actionText: data.action_text,
      },
      read: false,
    };
    setNotifications(prev => [notification, ...prev].slice(0, maxNotifications));
  }, [generateId, maxNotifications]);

  // Handle task completed notification
  const handleTaskCompleted = useCallback((data: any) => {
    const notification: Notification = {
      id: generateId(),
      type: 'task_completed',
      timestamp: data.timestamp || new Date().toISOString(),
      data: {
        taskType: data.task_type,
        taskId: data.task_id,
        result: data.result,
      },
      read: false,
    };
    setNotifications(prev => [notification, ...prev].slice(0, maxNotifications));
  }, [generateId, maxNotifications]);

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Setup WebSocket connection and listeners
  useEffect(() => {
    if (!enabled || !token || !autoConnect) return;

    // Connect to WebSocket
    wsClient.connect(token);

    // Setup connection handlers
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    wsClient.onConnect(handleConnect);
    wsClient.onDisconnect(handleDisconnect);

    // Setup message listeners
    wsClient.on('status_update', handleStatusUpdate);
    wsClient.on('new_message', handleNewMessage);
    wsClient.on('job_match', handleJobMatch);
    wsClient.on('interview_scheduled', handleInterviewScheduled);
    wsClient.on('interview_reminder', handleInterviewReminder);
    wsClient.on('new_application', handleNewApplication);
    wsClient.on('system_notification', handleSystemNotification);
    wsClient.on('task_completed', handleTaskCompleted);

    // Update connection state
    setIsConnected(wsClient.isConnected);

    // Cleanup
    return () => {
      wsClient.off('status_update', handleStatusUpdate);
      wsClient.off('new_message', handleNewMessage);
      wsClient.off('job_match', handleJobMatch);
      wsClient.off('interview_scheduled', handleInterviewScheduled);
      wsClient.off('interview_reminder', handleInterviewReminder);
      wsClient.off('new_application', handleNewApplication);
      wsClient.off('system_notification', handleSystemNotification);
      wsClient.off('task_completed', handleTaskCompleted);
    };
  }, [
    token,
    enabled,
    autoConnect,
    handleStatusUpdate,
    handleNewMessage,
    handleJobMatch,
    handleInterviewScheduled,
    handleInterviewReminder,
    handleNewApplication,
    handleSystemNotification,
    handleTaskCompleted,
  ]);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
}

// Hook for chat-specific real-time features
export function useRealtimeChat(token: string | null) {
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const [readReceipts, setReadReceipts] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    if (!token) return;

    const handleTyping = (data: any) => {
      const key = `${data.conversation_id}-${data.user_id}`;
      if (data.is_typing) {
        setTypingUsers(prev => new Map(prev).set(key, data.timestamp));
      } else {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          newMap.delete(key);
          return newMap;
        });
      }
    };

    const handleReadReceipt = (data: any) => {
      const key = data.conversation_id;
      setReadReceipts(prev => new Map(prev).set(key, data.timestamp));
    };

    wsClient.on('typing_indicator', handleTyping);
    wsClient.on('read_receipt', handleReadReceipt);

    return () => {
      wsClient.off('typing_indicator', handleTyping);
      wsClient.off('read_receipt', handleReadReceipt);
    };
  }, [token]);

  const sendTypingIndicator = useCallback((conversationId: string, isTyping: boolean) => {
    wsClient.send('typing', {
      conversation_id: conversationId,
      is_typing: isTyping,
    });
  }, []);

  const sendReadReceipt = useCallback((conversationId: string) => {
    wsClient.send('read_receipt', {
      conversation_id: conversationId,
    });
  }, []);

  return {
    typingUsers,
    readReceipts,
    sendTypingIndicator,
    sendReadReceipt,
  };
}
