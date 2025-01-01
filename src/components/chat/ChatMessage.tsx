import React from "react";
import styled from "@emotion/styled";
import { formatDistanceToNow } from "date-fns";
import { Avatar } from "@/components/ui/Avatar";
import { Tooltip } from "@/components/ui/Tooltip";

const MessageContainer = styled.div<{ isOwnMessage: boolean }>`
  display: flex;
  flex-direction: ${props => props.isOwnMessage ? "row-reverse" : "row"};
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 8px;
`;

const MessageContent = styled.div<{ isOwnMessage: boolean }>`
  background: ${props => props.isOwnMessage ? props.theme.colors.primary.main : props.theme.colors.background.default};
  color: ${props => props.isOwnMessage ? props.theme.colors.primary.contrastText : props.theme.colors.text.primary};
  padding: 8px 12px;
  border-radius: 12px;
  max-width: 70%;
  word-wrap: break-word;
`;

const MessageMeta = styled.div<{ isOwnMessage: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: ${props => props.theme.colors.text.secondary};
  justify-content: ${props => props.isOwnMessage ? "flex-end" : "flex-start"};
`;

const MessageStatus = styled.div<{ status: "sent" | "delivered" | "read" }>`
  width: 16px;
  height: 16px;
  color: ${props => {
    switch (props.status) {
      case "read":
        return props.theme.colors.success.main;
      case "delivered":
        return props.theme.colors.info.main;
      default:
        return props.theme.colors.text.secondary;
    }
  }};
`;

interface ChatMessageProps {
  message: ChatMessageType;
  isOwnMessage: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isOwnMessage }) => {
  const formattedTime = formatDistanceToNow(new Date(message.timestamp), { addSuffix: true });

  return (
    <MessageContainer isOwnMessage={isOwnMessage}>
      {!isOwnMessage && (
        <Tooltip content={message.user.name}>
          <Avatar src={message.user.avatar} alt={message.user.name} size="small" />
        </Tooltip>
      )}
      <div>
        <MessageContent isOwnMessage={isOwnMessage}>
          {message.text}
        </MessageContent>
        <MessageMeta isOwnMessage={isOwnMessage}>
          <span>{formattedTime}</span>
          {isOwnMessage && (
            <MessageStatus status={message.status} />
          )}
        </MessageMeta>
      </div>
    </MessageContainer>
  );
};
