import React, { useState, useRef, useEffect } from "react";
import styled from "@emotion/styled";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

const InputContainer = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
`;

const TextArea = styled.textarea`
  flex: 1;
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

  &:disabled {
    background: ${props => props.theme.colors.background.disabled};
    cursor: not-allowed;
  }
`;

const ActionButton = styled(Button)`
  padding: 8px;
  min-width: 40px;
  height: 40px;
  border-radius: 20px;
`;

interface ChatInputProps {
  onSend: (text: string) => void;
  onTyping: (isTyping: boolean) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, onTyping, disabled }) => {
  const [text, setText] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const debouncedTyping = useDebounce(onTyping, 500);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "40px";
      const scrollHeight = textAreaRef.current.scrollHeight;
      textAreaRef.current.style.height = Math.min(scrollHeight, 120) + "px";
    }
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    debouncedTyping(newText.length > 0);
  };

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText("");
    onTyping(false);
  };

  return (
    <InputContainer>
      <TextArea
        ref={textAreaRef}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        disabled={disabled}
      />
      <ActionButton
        variant="contained"
        color="primary"
        onClick={handleSend}
        disabled={!text.trim() || disabled}
      >
        <Icon name="send" />
      </ActionButton>
    </InputContainer>
  );
};
