import React from "react";
import styled from "@emotion/styled";

const MessageContainer = styled.div<{ isOwn?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.isOwn ? "flex-end" : "flex-start"};
  margin-bottom: 16px;
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const MessageAuthor = styled.div`
  font-weight: 500;
`;

const MessageTime = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 0.875rem;
`;

const MessageBubble = styled.div<{ isOwn?: boolean }>`
  background: ${props => props.isOwn ? props.theme.colors.primary.main : props.theme.colors.background.default};
  color: ${props => props.isOwn ? props.theme.colors.primary.contrastText : props.theme.colors.text.primary};
  padding: 8px 12px;
  border-radius: 12px;
  max-width: 70%;
  word-wrap: break-word;
`;

export interface ChatMessageProps {
  message: {
    id: string;
    userId: string;
    userName: string;
    text: string;
    timestamp: string;
  };
  isOwn?: boolean;
}

export const ChatMessageComponent: React.FC<ChatMessageProps> = ({
  message,
  isOwn = false,
}) => {
  const time = new Date(message.timestamp).toLocaleTimeString();

  return (
    <MessageContainer isOwn={isOwn}>
      <MessageHeader>
        <MessageAuthor>{message.userName}</MessageAuthor>
        <MessageTime>{time}</MessageTime>
      </MessageHeader>
      <MessageBubble isOwn={isOwn}>{message.text}</MessageBubble>
    </MessageContainer>
  );
};
