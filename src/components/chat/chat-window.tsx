/**
 * Chat window component for real-time messaging.
 */
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { wsClient } from '@/lib/websocket-client';
import { useRealtimeChat } from '@/hooks/use-realtime-notifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Send, Paperclip, Check, CheckCheck, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: string;
  content: string;
  content_type: string;
  attachments: any[];
  sent_at: string;
  read_at: string | null;
  delivered_at: string | null;
  is_edited: boolean;
  edited_at: string | null;
  is_deleted: boolean;
  metadata: any;
}

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
  currentUserType: 'recruiter' | 'candidate';
  token: string;
  onClose?: () => void;
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showStatus: boolean;
}

function MessageBubble({ message, isOwn, showStatus }: MessageBubbleProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = () => {
    if (message.read_at) {
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    }
    if (message.delivered_at) {
      return <CheckCheck className="h-3 w-3 text-gray-400" />;
    }
    return <Check className="h-3 w-3 text-gray-400" />;
  };

  return (
    <div
      className={cn(
        'flex w-full mb-4',
        isOwn ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[70%] rounded-lg px-4 py-2 shadow-sm',
          isOwn
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        )}
      >
        <p className="text-sm break-words whitespace-pre-wrap">
          {message.content}
        </p>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.attachments.map((attachment: any, index: number) => (
              <div
                key={index}
                className="flex items-center space-x-2 text-xs opacity-80"
              >
                <Paperclip className="h-3 w-3" />
                <span>{attachment.name || 'Attachment'}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-end space-x-1 mt-1">
          <span className="text-xs opacity-70">
            {formatTime(message.sent_at)}
          </span>
          {message.is_edited && (
            <span className="text-xs opacity-50 italic">editado</span>
          )}
          {isOwn && showStatus && getStatusIcon()}
        </div>
      </div>
    </div>
  );
}

export function ChatWindow({
  conversationId,
  currentUserId,
  currentUserType,
  token,
  onClose,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { typingUsers, sendTypingIndicator, sendReadReceipt } = useRealtimeChat(token);

  // Check if someone is typing
  const isOtherUserTyping = Array.from(typingUsers.keys()).some(
    key => key.startsWith(conversationId) && !key.includes(currentUserId)
  );

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load message history
  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/v1/chat/conversations/${conversationId}/messages?limit=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load messages');
      }

      const data = await response.json();
      setMessages(data.messages || []);
      setHasMore(data.has_more || false);

      // Mark as read
      sendReadReceipt(conversationId);
    } catch (err) {
      setError('Falha ao carregar mensagens');
      console.error('Failed to load chat history:', err);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, token, sendReadReceipt]);

  // Handle new message from WebSocket
  const handleNewMessage = useCallback(
    (data: any) => {
      if (data.conversation_id === conversationId) {
        const message = data.message as Message;
        setMessages(prev => [...prev, message]);

        // Mark as read if not from current user
        if (message.sender_id !== currentUserId) {
          sendReadReceipt(conversationId);
        }
      }
    },
    [conversationId, currentUserId, sendReadReceipt]
  );

  // Send message
  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);

    try {
      // Send via REST API (which also triggers WebSocket notification)
      const response = await fetch(
        `/api/v1/chat/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: newMessage.trim(),
            content_type: 'text',
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const sentMessage = await response.json();
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');

      // Stop typing indicator
      sendTypingIndicator(conversationId, false);
    } catch (err) {
      setError('Falha ao enviar mensagem');
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  }, [conversationId, newMessage, token, isSending, sendTypingIndicator]);

  // Handle typing
  const handleTyping = useCallback(() => {
    // Send typing indicator
    sendTypingIndicator(conversationId, true);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(conversationId, false);
    }, 3000);
  }, [conversationId, sendTypingIndicator]);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Setup WebSocket listener for new messages
  useEffect(() => {
    wsClient.on('new_message', handleNewMessage);

    return () => {
      wsClient.off('new_message', handleNewMessage);
    };
  }, [handleNewMessage]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarFallback>
              {currentUserType === 'recruiter' ? 'C' : 'R'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">
              {currentUserType === 'recruiter' ? 'Candidato' : 'Recrutador'}
            </h3>
            {isOtherUserTyping && (
              <span className="text-xs text-muted-foreground italic">
                Digitando...
              </span>
            )}
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Fechar
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-destructive">{error}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-muted-foreground">
              Nenhuma mensagem ainda. Inicie a conversa!
            </p>
          </div>
        ) : (
          <>
            {hasMore && (
              <div className="text-center mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Load more messages (pagination)
                  }}
                >
                  Carregar mensagens anteriores
                </Button>
              </div>
            )}
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === currentUserId}
                showStatus={index === messages.length - 1}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            disabled={isSending}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={e => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            disabled={isSending}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isSending}
            size="icon"
            className="shrink-0"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Compact chat list component
interface ConversationListItemProps {
  conversation: any;
  currentUserId: string;
  onClick: () => void;
  isActive: boolean;
}

export function ConversationListItem({
  conversation,
  currentUserId,
  onClick,
  isActive,
}: ConversationListItemProps) {
  const isRecruiter = conversation.recruiter_id === currentUserId;
  const unreadCount = isRecruiter
    ? conversation.recruiter_unread_count
    : conversation.candidate_unread_count;

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (days === 1) {
      return 'Ontem';
    } else if (days < 7) {
      return date.toLocaleDateString('pt-BR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      });
    }
  };

  return (
    <div
      className={cn(
        'flex items-center space-x-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors',
        isActive && 'bg-muted'
      )}
      onClick={onClick}
    >
      <Avatar>
        <AvatarFallback>
          {isRecruiter ? 'C' : 'R'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="font-medium truncate">
            {conversation.subject || 'Conversa'}
          </h4>
          <span className="text-xs text-muted-foreground">
            {formatTime(conversation.last_message_at)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground truncate">
            {conversation.last_message_preview || 'Sem mensagens'}
          </p>
          {unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
