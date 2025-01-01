import React, { useState, useEffect, useRef } from "react";
import styled from "@emotion/styled";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuth } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ChatHeader } from "./ChatHeader";
import { ChatUserList } from "./ChatUserList";
import { ChatTypingIndicator } from "./ChatTypingIndicator";

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${props => props.theme.colors.background.paper};
  border-radius: 8px;
  overflow: hidden;
`;

const ChatBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column-reverse;
`;

const ChatFooter = styled.div`
  padding: 16px;
  border-top: 1px solid ${props => props.theme.colors.divider};
`;

interface ChatWindowProps {
  channelId: string;
  onClose?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ channelId, onClose }) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [users, setUsers] = useState<ChatUserType[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { socket, isConnected } = useWebSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Load initial messages
    socket.emit("chat:join", channelId);
    socket.emit("chat:history", { channelId, limit: 50 });

    // Handle incoming messages
    socket.on("chat:message", (message: ChatMessageType) => {
      setMessages(prev => [message, ...prev]);
    });

    // Handle user presence
    socket.on("chat:users", (channelUsers: ChatUserType[]) => {
      setUsers(channelUsers);
    });

    // Handle typing indicators
    socket.on("chat:typing", (data: { userId: string; isTyping: boolean }) => {
      setTypingUsers(prev => {
        if (data.isTyping) {
          return [...prev, data.userId];
        } else {
          return prev.filter(id => id !== data.userId);
        }
      });
    });

    return () => {
      socket.emit("chat:leave", channelId);
      socket.off("chat:message");
      socket.off("chat:users");
      socket.off("chat:typing");
    };
  }, [socket, isConnected, channelId]);

  const handleSendMessage = (text: string) => {
    if (!socket || !isConnected) return;

    socket.emit("chat:message", {
      channelId,
      text,
      timestamp: new Date().toISOString(),
    });
  };

  const handleTyping = (isTyping: boolean) => {
    if (!socket || !isConnected) return;

    socket.emit("chat:typing", {
      channelId,
      isTyping,
    });
  };

  return (
    <ErrorBoundary>
      <ChatContainer>
        <ChatHeader
          channelId={channelId}
          onClose={onClose}
          userCount={users.length}
        />
        <ChatBody ref={chatBodyRef}>
          {messages.map(message => (
            <ChatMessage
              key={message.id}
              message={message}
              isOwnMessage={message.userId === user?.id}
            />
          ))}
        </ChatBody>
        <ChatTypingIndicator users={users} typingUsers={typingUsers} />
        <ChatFooter>
          <ChatInput
            onSend={handleSendMessage}
            onTyping={handleTyping}
            disabled={!isConnected}
          />
        </ChatFooter>
        <ChatUserList users={users} />
      </ChatContainer>
    </ErrorBoundary>
  );
};
