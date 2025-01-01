import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { NetworkNode, NetworkLink } from '@/types/network';
import { useDebounce } from '@/hooks/useDebounce';

const Container = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 320px;
  background: ${props => props.theme.colors.background.paper};
  border-radius: 8px;
  box-shadow: ${props => props.theme.shadows[2]};
  padding: 16px;
`;

const SearchInput = styled(Input)`
  width: 100%;
`;

const FilterSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const FilterChip = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: 1px solid ${props => props.theme.colors.divider};
  border-radius: 16px;
  background: ${props => props.$active ? props.theme.colors.primary.main : 'transparent'};
  color: ${props => props.$active ? props.theme.colors.primary.contrastText : props.theme.colors.text.primary};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$active ? props.theme.colors.primary.dark : props.theme.colors.action.hover};
  }
`;

const Results = styled.div`
  max-height: 300px;
  overflow-y: auto;
  margin-top: 8px;
`;

const ResultItem = styled.div<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  background: ${props => props.$selected ? props.theme.colors.action.selected : 'transparent'};

  &:hover {
    background: ${props => props.theme.colors.action.hover};
  }
`;

const ResultIcon = styled.div<{ $color?: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.$color || props.theme.colors.primary.main};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const ResultInfo = styled.div`
  flex: 1;
  min-width: 0;

  h4 {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 500;
  }

  p {
    margin: 0;
    font-size: 0.75rem;
    color: ${props => props.theme.colors.text.secondary};
  }
`;

interface NetworkSearchProps {
  nodes: NetworkNode[];
  links: NetworkLink[];
  onNodeSelect: (node: NetworkNode) => void;
  onFilterChange: (filters: {
    types: string[];
    statuses: string[];
  }) => void;
  selectedNode?: NetworkNode;
}

export const NetworkSearch: React.FC<NetworkSearchProps> = ({
  nodes,
  links,
  onNodeSelect,
  onFilterChange,
  selectedNode,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce((term: string) => {
    setSelectedIndex(0);
  }, 300);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    debouncedSearch(e.target.value);
  }, [debouncedSearch]);

  const handleTypeToggle = useCallback((type: string) => {
    setSelectedTypes(prev => {
      const newTypes = prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type];
      onFilterChange({ types: newTypes, statuses: selectedStatuses });
      return newTypes;
    });
  }, [selectedStatuses, onFilterChange]);

  const handleStatusToggle = useCallback((status: string) => {
    setSelectedStatuses(prev => {
      const newStatuses = prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status];
      onFilterChange({ types: selectedTypes, statuses: newStatuses });
      return newStatuses;
    });
  }, [selectedTypes, onFilterChange]);

  const filteredNodes = nodes.filter(node => {
    const matchesSearch = !searchTerm || 
      node.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedTypes.length === 0 || 
      (node.type && selectedTypes.includes(node.type));

    const matchesStatus = selectedStatuses.length === 0 || 
      (node.status && selectedStatuses.includes(node.status));

    return matchesSearch && matchesType && matchesStatus;
  });

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredNodes.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          if (filteredNodes[selectedIndex]) {
            onNodeSelect(filteredNodes[selectedIndex]);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [filteredNodes, selectedIndex, onNodeSelect]);

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

  // Get unique types and statuses
  const types = Array.from(new Set(nodes.map(node => node.type).filter(Boolean)));
  const statuses = Array.from(new Set(nodes.map(node => node.status).filter(Boolean)));

  return (
    <Container>
      <SearchInput
        placeholder="Search nodes..."
        value={searchTerm}
        onChange={handleSearchChange}
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
      <FilterSection>
        {types.map(type => (
          <FilterChip
            key={type}
            $active={selectedTypes.includes(type)}
            onClick={() => handleTypeToggle(type)}
          >
            {type}
          </FilterChip>
        ))}
      </FilterSection>
      <FilterSection>
        {statuses.map(status => (
          <FilterChip
            key={status}
            $active={selectedStatuses.includes(status)}
            onClick={() => handleStatusToggle(status)}
          >
            {status}
          </FilterChip>
        ))}
      </FilterSection>
      <Results ref={resultsRef}>
        {filteredNodes.map((node, index) => (
          <ResultItem
            key={node.id}
            $selected={node === selectedNode || index === selectedIndex}
            onClick={() => onNodeSelect(node)}
          >
            <ResultIcon $color={node.color}>
              <Icon name={
                node.type === 'cluster' ? 'hub' :
                node.type === 'server' ? 'dns' :
                node.type === 'client' ? 'computer' :
                'device_hub'
              } />
            </ResultIcon>
            <ResultInfo>
              <h4>{node.label || node.id}</h4>
              <p>
                {node.type}
                {node.status && ` • ${node.status}`}
              </p>
            </ResultInfo>
            {node === selectedNode && (
              <Icon name="check" style={{ color: 'green' }} />
            )}
          </ResultItem>
        ))}
      </Results>
    </Container>
  );
};