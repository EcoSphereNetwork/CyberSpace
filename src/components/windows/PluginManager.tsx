import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { PluginMetadata } from '@/plugins/PluginAPI';
import { useApp } from '@/hooks/useApp';

const Container = styled.div`
  width: 800px;
  height: 600px;
  background: ${props => props.theme.colors.background.paper};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${props => props.theme.colors.surface.hover};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h2`
  margin: 0;
  font-size: ${props => props.theme.typography.fontSizes.xl};
  color: ${props => props.theme.colors.text.primary};
`;

const Content = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }
`;

const PluginList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 16px;
`;

const PluginCard = styled.div<{ enabled: boolean }>`
  background: ${props => props.theme.colors.surface.default};
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid ${props => 
    props.enabled 
      ? props.theme.colors.primary.main 
      : props.theme.colors.surface.hover};
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
  }
`;

const PluginHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const PluginInfo = styled.div`
  flex: 1;
`;

const PluginName = styled.h3`
  margin: 0;
  font-size: ${props => props.theme.typography.fontSizes.lg};
  color: ${props => props.theme.colors.text.primary};
`;

const PluginVersion = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const PluginDescription = styled.p`
  margin: 8px 0;
  font-size: ${props => props.theme.typography.fontSizes.md};
  color: ${props => props.theme.colors.text.secondary};
`;

const PluginMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PluginControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Button = styled.button<{ variant?: 'primary' | 'danger' }>`
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  font-size: ${props => props.theme.typography.fontSizes.sm};
  cursor: pointer;
  transition: all 0.2s;

  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: ${props.theme.colors.primary.main};
          color: ${props.theme.colors.text.primary};
          &:hover {
            background: ${props.theme.colors.primary.dark};
          }
        `;
      case 'danger':
        return `
          background: ${props.theme.colors.status.error};
          color: ${props.theme.colors.text.primary};
          &:hover {
            background: ${props.theme.colors.status.error}dd;
          }
        `;
      default:
        return `
          background: ${props.theme.colors.surface.hover};
          color: ${props.theme.colors.text.primary};
          &:hover {
            background: ${props.theme.colors.surface.active};
          }
        `;
    }
  }}
`;

const Switch = styled.button<{ enabled: boolean }>`
  width: 48px;
  height: 24px;
  border-radius: 12px;
  background: ${props => props.enabled ? props.theme.colors.primary.main : props.theme.colors.surface.hover};
  border: none;
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s;

  &::before {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.enabled ? '26px' : '2px'};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${props => props.theme.colors.text.primary};
    transition: left 0.2s;
  }
`;

interface PluginManagerProps {
  onClose?: () => void;
}

export const PluginManager: React.FC<PluginManagerProps> = ({ onClose }) => {
  const app = useApp();
  const [plugins, setPlugins] = useState<PluginMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlugins();
  }, []);

  const loadPlugins = async () => {
    try {
      setLoading(true);
      const installedPlugins = app.plugins.getInstalledPlugins();
      setPlugins(installedPlugins);
      setError(null);
    } catch (err) {
      setError('Failed to load plugins');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePlugin = async (pluginId: string) => {
    try {
      const enabled = app.plugins.isPluginEnabled(pluginId);
      if (enabled) {
        await app.plugins.disablePlugin(pluginId);
      } else {
        await app.plugins.enablePlugin(pluginId);
      }
      await loadPlugins();
    } catch (err) {
      console.error('Failed to toggle plugin:', err);
      app.notifications.show('Failed to toggle plugin', { type: 'error' });
    }
  };

  const handleUninstallPlugin = async (pluginId: string) => {
    try {
      await app.plugins.uninstallPlugin(pluginId);
      await loadPlugins();
      app.notifications.show('Plugin uninstalled successfully');
    } catch (err) {
      console.error('Failed to uninstall plugin:', err);
      app.notifications.show('Failed to uninstall plugin', { type: 'error' });
    }
  };

  return (
    <Container>
      <Header>
        <Title>Plugin Manager</Title>
        <Button onClick={onClose}>Close</Button>
      </Header>

      <Content>
        {loading ? (
          <div>Loading plugins...</div>
        ) : error ? (
          <div>{error}</div>
        ) : (
          <PluginList>
            {plugins.map(plugin => (
              <PluginCard 
                key={plugin.id}
                enabled={app.plugins.isPluginEnabled(plugin.id)}
              >
                <PluginHeader>
                  <PluginInfo>
                    <PluginName>
                      {plugin.name}
                      <PluginVersion> v{plugin.version}</PluginVersion>
                    </PluginName>
                    <PluginDescription>
                      {plugin.description}
                    </PluginDescription>
                  </PluginInfo>

                  <Switch
                    enabled={app.plugins.isPluginEnabled(plugin.id)}
                    onClick={() => handleTogglePlugin(plugin.id)}
                    aria-label={`Toggle ${plugin.name}`}
                  />
                </PluginHeader>

                <PluginMeta>
                  {plugin.author && (
                    <MetaItem>
                      <span>Author:</span>
                      <span>{plugin.author}</span>
                    </MetaItem>
                  )}
                  {plugin.license && (
                    <MetaItem>
                      <span>License:</span>
                      <span>{plugin.license}</span>
                    </MetaItem>
                  )}
                </PluginMeta>

                <PluginControls>
                  {plugin.homepage && (
                    <Button 
                      onClick={() => window.open(plugin.homepage, '_blank')}
                    >
                      Homepage
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    onClick={() => handleUninstallPlugin(plugin.id)}
                  >
                    Uninstall
                  </Button>
                </PluginControls>
              </PluginCard>
            ))}
          </PluginList>
        )}
      </Content>
    </Container>
  );
};