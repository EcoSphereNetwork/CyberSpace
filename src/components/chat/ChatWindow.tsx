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
  const [messages, setMessages] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<any[]>([]);

  useEffect(() => {
    // Mock data
    setMessages([
      {
        id: "1",
        userId: "1",
        userName: "User 1",
        text: "Hello, world!",
        timestamp: new Date().toISOString(),
      },
    ]);

    setUsers([
      {
        id: "1",
        name: "User 1",
        status: "online",
      },
      {
        id: "2",
        name: "User 2",
        status: "offline",
      },
    ]);
  }, [channelId]);

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

  return (
    <Container>
      <Header>
        <Title>Channel Name</Title>
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
        </MessageList>
        <Sidebar>
          <ChatUserList users={users} />
        </Sidebar>
      </Content>
      <ChatInput onSend={handleSendMessage} onTyping={handleTyping} />
    </Container>
  );
};
