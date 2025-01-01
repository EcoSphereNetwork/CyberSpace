import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { ChatMessage } from './ChatMessage';
import { useDebounce } from '@/hooks/useDebounce';

const Container = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 320px;
  height: 100%;
  background: ${props => props.theme.colors.background.paper};
  border-left: 1px solid ${props => props.theme.colors.divider};
  display: flex;
  flex-direction: column;
  transform: translateX(${props => props.isOpen ? '0' : '100%'});
  transition: transform 0.3s ease-in-out;
  z-index: 10;
`;

const Header = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${props => props.theme.colors.divider};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SearchInput = styled(Input)`
  flex: 1;
`;

const Results = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const NoResults = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
  gap: 8px;

  svg {
    font-size: 48px;
    opacity: 0.5;
  }
`;

const ResultItem = styled.div<{ isHighlighted?: boolean }>`
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  background: ${props => props.isHighlighted ? props.theme.colors.action.hover : 'transparent'};

  &:hover {
    background: ${props => props.theme.colors.action.hover};
  }

  .highlight {
    background: ${props => props.theme.colors.warning.light};
    padding: 0 2px;
    border-radius: 2px;
  }
`;

const ResultInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 4px;
`;

interface ChatSearchProps {
  messages: ChatMessage[];
  onClose: () => void;
  onMessageSelect: (messageId: string) => void;
  isOpen: boolean;
}

export const ChatSearch: React.FC<ChatSearchProps> = ({
  messages,
  onClose,
  onMessageSelect,
  isOpen,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce((term: string) => {
    setSelectedIndex(0);
  }, 300);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    debouncedSearch(e.target.value);
  }, [debouncedSearch]);

  const filteredMessages = messages.filter(message =>
    message.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredMessages.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        if (filteredMessages[selectedIndex]) {
          onMessageSelect(filteredMessages[selectedIndex].id);
        }
        break;
    }
  }, [isOpen, filteredMessages, selectedIndex, onClose, onMessageSelect]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Scroll selected item into view
  useEffect(() => {
    if (!resultsRef.current) return;

    const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
    if (selectedElement) {
      selectedElement.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [selectedIndex]);

  const highlightText = (text: string, term: string) => {
    if (!term) return text;

    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === term.toLowerCase() ? 
        <span key={i} className="highlight">{part}</span> : 
        part
    );
  };

  return (
    <Container isOpen={isOpen}>
      <Header>
        <SearchInput
          placeholder="Search messages..."
          value={searchTerm}
          onChange={handleSearchChange}
          autoFocus
          leftIcon={<Icon name="search" />}
          rightIcon={
            searchTerm && (
              <IconButton
                size="small"
                onClick={() => setSearchTerm('')}
              >
                <Icon name="close" />
              </IconButton>
            )
          }
        />
        <IconButton onClick={onClose}>
          <Icon name="close" />
        </IconButton>
      </Header>
      <Results ref={resultsRef}>
        {filteredMessages.length > 0 ? (
          filteredMessages.map((message, index) => (
            <ResultItem
              key={message.id}
              isHighlighted={index === selectedIndex}
              onClick={() => onMessageSelect(message.id)}
            >
              <div>{highlightText(message.text, searchTerm)}</div>
              <ResultInfo>
                <span>{message.userName}</span>
                <span>{new Date(message.timestamp).toLocaleString()}</span>
              </ResultInfo>
            </ResultItem>
          ))
        ) : searchTerm ? (
          <NoResults>
            <Icon name="search_off" />
            <div>No messages found</div>
            <div>Try different keywords</div>
          </NoResults>
        ) : (
          <NoResults>
            <Icon name="search" />
            <div>Search for messages</div>
            <div>Use keywords to find specific messages</div>
          </NoResults>
        )}
      </Results>
    </Container>
  );
};