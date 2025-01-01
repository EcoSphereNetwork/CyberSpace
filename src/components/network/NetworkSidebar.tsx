import React, { useState } from 'react';
import styled from '@emotion/styled';

const SidebarContainer = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  height: 100%;
  width: 300px;
  background-color: rgba(26, 26, 26, 0.9);
  color: white;
  overflow-y: auto;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.5);
  padding: 10px;
  z-index: 100;
`;

const SidebarHeader = styled.div`
  text-align: center;
  font-size: 1.5em;
  margin-bottom: 20px;
  border-bottom: 1px solid #333;
  padding-bottom: 10px;
`;

const SidebarSection = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 1.2em;
  margin-bottom: 10px;
`;

const LogList = styled.ul`
  list-style: none;
  padding: 0;
`;

const LogItem = styled.li<{ type?: 'info' | 'warning' | 'error' }>`
  margin: 5px 0;
  padding: 5px;
  background-color: #2a2a2a;
  border-radius: 3px;
  color: ${({ type }) => {
    switch (type) {
      case 'warning':
        return '#ffaa00';
      case 'error':
        return '#ff0000';
      default:
        return '#ffffff';
    }
  }};
`;

const SearchInput = styled.input`
  width: calc(100% - 20px);
  padding: 5px;
  border: 1px solid #333;
  border-radius: 3px;
  background-color: #2a2a2a;
  color: white;
  margin-bottom: 10px;

  &:focus {
    outline: none;
    border-color: #00cc66;
  }
`;

const FilterLabel = styled.label`
  display: block;
  margin: 5px 0;
  cursor: pointer;

  input[type="checkbox"] {
    margin-right: 10px;
  }
`;

const ResourceBar = styled.div`
  width: 100%;
  height: 20px;
  background-color: #2a2a2a;
  border-radius: 3px;
  margin: 5px 0;
  overflow: hidden;
`;

const ResourceProgress = styled.div<{ value: number; color: string }>`
  width: ${({ value }) => `${value}%`};
  height: 100%;
  background-color: ${({ color }) => color};
  transition: width 0.3s ease;
`;

const ResourceLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
`;

interface NetworkSidebarProps {
  onFilterChange: (filters: { [key: string]: boolean }) => void;
  onSearch: (term: string) => void;
}

export const NetworkSidebar: React.FC<NetworkSidebarProps> = ({
  onFilterChange,
  onSearch,
}) => {
  const [filters, setFilters] = useState({
    activeNodes: true,
    criticalPaths: false,
    warnings: true,
    errors: true,
  });

  const handleFilterChange = (key: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, [key]: event.target.checked };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <SidebarContainer>
      <SidebarHeader>Network Monitor</SidebarHeader>

      <SidebarSection>
        <SectionTitle>Resources</SectionTitle>
        <ResourceLabel>
          <span>Bandwidth</span>
          <span>75%</span>
        </ResourceLabel>
        <ResourceBar>
          <ResourceProgress value={75} color="#00cc66" />
        </ResourceBar>

        <ResourceLabel>
          <span>CPU</span>
          <span>60%</span>
        </ResourceLabel>
        <ResourceBar>
          <ResourceProgress value={60} color="#ffaa00" />
        </ResourceBar>

        <ResourceLabel>
          <span>Memory</span>
          <span>45%</span>
        </ResourceLabel>
        <ResourceBar>
          <ResourceProgress value={45} color="#00aaff" />
        </ResourceBar>
      </SidebarSection>

      <SidebarSection>
        <SectionTitle>Filters</SectionTitle>
        <FilterLabel>
          <input
            type="checkbox"
            checked={filters.activeNodes}
            onChange={handleFilterChange('activeNodes')}
          />
          Active Nodes Only
        </FilterLabel>
        <FilterLabel>
          <input
            type="checkbox"
            checked={filters.criticalPaths}
            onChange={handleFilterChange('criticalPaths')}
          />
          Critical Paths
        </FilterLabel>
        <FilterLabel>
          <input
            type="checkbox"
            checked={filters.warnings}
            onChange={handleFilterChange('warnings')}
          />
          Show Warnings
        </FilterLabel>
        <FilterLabel>
          <input
            type="checkbox"
            checked={filters.errors}
            onChange={handleFilterChange('errors')}
          />
          Show Errors
        </FilterLabel>
      </SidebarSection>

      <SidebarSection>
        <SectionTitle>Search</SectionTitle>
        <SearchInput
          type="text"
          placeholder="Search nodes..."
          onChange={(e) => onSearch(e.target.value)}
        />
      </SidebarSection>

      <SidebarSection>
        <SectionTitle>Logs</SectionTitle>
        <LogList>
          <LogItem>System initialized</LogItem>
          <LogItem type="info">Network scan complete</LogItem>
          <LogItem type="warning">High latency detected on Node A</LogItem>
          <LogItem type="error">Connection lost to Node B</LogItem>
        </LogList>
      </SidebarSection>
    </SidebarContainer>
  );
};
