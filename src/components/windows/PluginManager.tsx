import React, { useState } from "react";
import styled from "@emotion/styled";
import { Plugin, PluginStatus } from "@/types/plugin";
import { IconButton } from "@/components/ui/IconButton";
import { Icon } from "@/components/ui/Icon";
import { Switch } from "@/components/ui/Switch";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${props => props.theme.colors.background.paper};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid ${props => props.theme.colors.divider};
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 500;
`;

const PluginList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const PluginCard = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 4px;
  background: ${props => props.theme.colors.background.default};
  box-shadow: ${props => props.theme.shadows[1]};
`;

const PluginHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const PluginTitle = styled.div`
  flex: 1;
  font-weight: 500;
`;

const PluginDescription = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 8px;
`;

const PluginMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 0.875rem;
`;

const PluginStatus = styled.div<{ status: PluginStatus }>`
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${props => {
    switch (props.status) {
      case "active":
        return props.theme.colors.success.main;
      case "error":
        return props.theme.colors.error.main;
      case "updating":
        return props.theme.colors.warning.main;
      default:
        return props.theme.colors.text.secondary;
    }
  }};
`;

export interface PluginManagerProps {
  plugins: Plugin[];
  onToggle?: (pluginId: string, enabled: boolean) => void;
}

export const PluginManager: React.FC<PluginManagerProps> = ({
  plugins,
  onToggle,
}) => {
  return (
    <Container>
      <Header>
        <Title>Plugins</Title>
        <IconButton aria-label="Add Plugin">
          <Icon name="add" />
        </IconButton>
      </Header>
      <PluginList>
        {plugins.map(plugin => (
          <PluginCard key={plugin.id}>
            <PluginHeader>
              <PluginTitle>{plugin.name}</PluginTitle>
              <Switch
                checked={plugin.enabled}
                onChange={() => onToggle?.(plugin.id, !plugin.enabled)}
              />
            </PluginHeader>
            <PluginDescription>{plugin.description}</PluginDescription>
            <PluginMeta>
              <div>v{plugin.version}</div>
              <div>by {plugin.author}</div>
              <PluginStatus status={plugin.status}>
                <Icon name={
                  plugin.status === "active" ? "check_circle" :
                  plugin.status === "error" ? "error" :
                  plugin.status === "updating" ? "update" :
                  "circle"
                } />
                {plugin.status}
              </PluginStatus>
            </PluginMeta>
          </PluginCard>
        ))}
      </PluginList>
    </Container>
  );
};
