import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { useAuth } from "@/contexts/AuthContext";
import { ChatMessageComponent } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ChatTypingIndicator } from "./ChatTypingIndicator";
import { ChatUserList } from "./ChatUserList";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${props => props.theme.colors.background.paper};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid ${props => props.theme.colors.divider};
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 500;
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const Sidebar = styled.div`
  width: 240px;
  border-left: 1px solid ${props => props.theme.colors.divider};
  overflow-y: auto;
`;

export interface ChatWindowProps {
  channelId: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ channelId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<ChatUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    const loadChannelData = async () => {
      try {
        setIsLoading(true);
        // TODO: Replace with actual API calls
        const mockMessages = [
          {
            id: "1",
            userId: "1",
            userName: "User 1",
            text: "Hello, world!",
            timestamp: new Date().toISOString(),
          },
        ];

        const mockUsers = [
          {
            id: "1",
            name: "User 1",
            status: "online",
            avatar: "/avatars/user1.jpg",
          },
          {
            id: "2",
            name: "User 2",
            status: "offline",
            avatar: "/avatars/user2.jpg",
          },
        ];

        setMessages(mockMessages);
        setUsers(mockUsers);
        setError(null);
        scrollToBottom();
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load channel data"));
      } finally {
        setIsLoading(false);
      }
    };

    loadChannelData();
  }, [channelId, scrollToBottom]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = (text: string) => {
    if (!user) return;

    const newMessage = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newMessage]);
  };

  const handleTyping = (isTyping: boolean) => {
    if (!user) return;

    if (isTyping) {
      setTypingUsers(prev => {
        if (!prev.find(u => u.id === user.id)) {
          return [...prev, user];
        }
        return prev;
      });
    } else {
      setTypingUsers(prev => prev.filter(u => u.id !== user.id));
    }
  };

  if (error) {
    return (
      <Container>
        <div style={{ padding: '16px', color: 'red' }}>
          Error: {error.message}
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Channel Name</Title>
        {isLoading && <span>Loading...</span>}
      </Header>
      <Content>
        <MessageList>
          {messages.map(message => (
            <ChatMessageComponent
              key={message.id}
              message={message}
              isOwn={message.userId === user?.id}
            />
          ))}
          {typingUsers.length > 0 && (
            <ChatTypingIndicator users={typingUsers} />
          )}
          <div ref={messagesEndRef} style={{ height: 1 }} />
        </MessageList>
        <Sidebar>
          <ChatUserList users={users} />
        </Sidebar>
      </Content>
      <ChatInput 
        onSend={handleSendMessage} 
        onTyping={handleTyping}
        disabled={isLoading || !!error} 
      />
    </Container>
  );
};
