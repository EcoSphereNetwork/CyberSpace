import React, { useState, useCallback } from 'react';
import styled from '@emotion/styled';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { NetworkNode, NetworkLink, NetworkCluster } from '@/types/network';

const Container = styled.div`
  position: absolute;
  bottom: 16px;
  left: 16px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: ${props => props.theme.colors.background.paper};
  border-radius: 8px;
  box-shadow: ${props => props.theme.shadows[2]};
  padding: 16px;
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: ${props => props.theme.colors.primary.main};
  color: ${props => props.theme.colors.primary.contrastText};
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: ${props => props.theme.colors.primary.dark};
  }

  &:disabled {
    background: ${props => props.theme.colors.action.disabled};
    cursor: not-allowed;
  }
`;

const ImportButton = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid ${props => props.theme.colors.primary.main};
  border-radius: 4px;
  color: ${props => props.theme.colors.primary.main};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.action.hover};
  }

  input {
    display: none;
  }
`;

interface NetworkData {
  nodes: NetworkNode[];
  links: NetworkLink[];
  clusters: NetworkCluster[];
  metadata?: {
    name?: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
    version?: string;
  };
}

interface NetworkExportProps {
  nodes: NetworkNode[];
  links: NetworkLink[];
  clusters: NetworkCluster[];
  onImport: (data: NetworkData) => void;
}

export const NetworkExport: React.FC<NetworkExportProps> = ({
  nodes,
  links,
  clusters,
  onImport,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = useCallback(async () => {
    try {
      setIsExporting(true);
      setError(null);

      const data: NetworkData = {
        nodes,
        links,
        clusters,
        metadata: {
          name: 'Network Export',
          description: 'Exported network data',
          createdAt: new Date().toISOString(),
          version: '1.0.0',
        },
      };

      // Convert to Blob
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `network-export-${new Date().toISOString()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export network:', error);
      setError('Failed to export network data');
    } finally {
      setIsExporting(false);
    }
  }, [nodes, links, clusters]);

  const handleImport = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsImporting(true);
      setError(null);

      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content) as NetworkData;

          // Validate data structure
          if (!Array.isArray(data.nodes) || !Array.isArray(data.links)) {
            throw new Error('Invalid file format');
          }

          // Validate required fields
          const isValidNode = (node: any): node is NetworkNode =>
            typeof node.id === 'string' &&
            (typeof node.x === 'number' || node.x === undefined) &&
            (typeof node.y === 'number' || node.y === undefined);

          const isValidLink = (link: any): link is NetworkLink =>
            typeof link.source === 'string' &&
            typeof link.target === 'string';

          if (!data.nodes.every(isValidNode) || !data.links.every(isValidLink)) {
            throw new Error('Invalid data format');
          }

          onImport(data);
        } catch (error) {
          console.error('Failed to parse import file:', error);
          setError('Invalid file format');
        }
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('Failed to import network:', error);
      setError('Failed to import network data');
    } finally {
      setIsImporting(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  }, [onImport]);

  return (
    <Container>
      <ExportButton
        onClick={handleExport}
        disabled={isExporting || nodes.length === 0}
      >
        <Icon name="download" />
        {isExporting ? 'Exporting...' : 'Export Network'}
      </ExportButton>
      <ImportButton>
        <Icon name="upload" />
        {isImporting ? 'Importing...' : 'Import Network'}
        <input
          type="file"
          accept=".json"
          onChange={handleImport}
          disabled={isImporting}
        />
      </ImportButton>
      {error && (
        <div style={{ color: 'red', fontSize: '0.875rem', marginTop: 8 }}>
          {error}
          <IconButton size="small" onClick={() => setError(null)}>
            <Icon name="close" />
          </IconButton>
        </div>
      )}
    </Container>
  );
};