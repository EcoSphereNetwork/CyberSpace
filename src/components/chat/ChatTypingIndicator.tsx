import React from "react";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";

const bounce = keyframes`
  0%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-4px);
  }
`;

const TypingContainer = styled.div`
  padding: 4px 16px;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text.secondary};
  min-height: 24px;
`;

const TypingDots = styled.div`
  display: inline-flex;
  gap: 2px;
  margin-left: 4px;
`;

const Dot = styled.div`
  width: 4px;
  height: 4px;
  background-color: currentColor;
  border-radius: 50%;
  animation: ${bounce} 1s infinite;

  &:nth-of-type(2) {
    animation-delay: 0.2s;
  }

  &:nth-of-type(3) {
    animation-delay: 0.4s;
  }
`;

interface ChatTypingIndicatorProps {
  users: ChatUserType[];
  typingUsers: string[];
}

export const ChatTypingIndicator: React.FC<ChatTypingIndicatorProps> = ({
  users,
  typingUsers,
}) => {
  if (typingUsers.length === 0) return null;

  const typingNames = users
    .filter(user => typingUsers.includes(user.id))
    .map(user => user.name);

  let message = "";
  if (typingNames.length === 1) {
    message = `${typingNames[0]} is typing`;
  } else if (typingNames.length === 2) {
    message = `${typingNames[0]} and ${typingNames[1]} are typing`;
  } else if (typingNames.length === 3) {
    message = `${typingNames[0]}, ${typingNames[1]}, and ${typingNames[2]} are typing`;
  } else {
    message = "Several people are typing";
  }

  return (
    <TypingContainer>
      {message}
      <TypingDots>
        <Dot />
        <Dot />
        <Dot />
      </TypingDots>
    </TypingContainer>
  );
};
