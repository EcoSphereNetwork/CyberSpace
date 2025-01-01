import React from "react";
import styled from "@emotion/styled";
import { User } from "@/contexts/AuthContext";

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  color: ${props => props.theme.colors.text.secondary};
  font-style: italic;
`;

const Dots = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Dot = styled.div`
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: ${props => props.theme.colors.text.secondary};
  animation: bounce 1.4s infinite ease-in-out both;

  &:nth-of-type(1) {
    animation-delay: -0.32s;
  }

  &:nth-of-type(2) {
    animation-delay: -0.16s;
  }

  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }
`;

export interface ChatTypingIndicatorProps {
  users: User[];
}

export const ChatTypingIndicator: React.FC<ChatTypingIndicatorProps> = ({
  users,
}) => {
  if (users.length === 0) return null;

  const text = users.length === 1
    ? `${users[0].name} is typing...`
    : users.length === 2
    ? `${users[0].name} and ${users[1].name} are typing...`
    : `${users.length} users are typing...`;

  return (
    <Container>
      {text}
      <Dots>
        <Dot />
        <Dot />
        <Dot />
      </Dots>
    </Container>
  );
};
