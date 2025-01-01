import React, { useState, useRef, useEffect } from "react";
import styled from "@emotion/styled";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";

const Container = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid ${props => props.theme.colors.divider};
`;

const InputContainer = styled.div`
  flex: 1;
  position: relative;
`;

const Input = styled.textarea`
  width: 100%;
  min-height: 40px;
  max-height: 120px;
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.divider};
  border-radius: 20px;
  resize: none;
  font-family: inherit;
  font-size: inherit;
  line-height: 1.5;
  background: ${props => props.theme.colors.background.default};
  color: ${props => props.theme.colors.text.primary};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.secondary};
  }
`;

export interface ChatInputProps {
  onSend: (text: string) => void;
  onTyping: (isTyping: boolean) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onTyping,
}) => {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);

    onTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 1000);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const trimmedText = text.trim();
    if (trimmedText) {
      onSend(trimmedText);
      setText("");
      onTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  return (
    <Container>
      <InputContainer>
        <Input
          ref={inputRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
        />
      </InputContainer>
      <IconButton
        aria-label="Send"
        onClick={handleSend}
        disabled={!text.trim()}
      >
        <Icon name="send" />
      </IconButton>
    </Container>
  );
};
