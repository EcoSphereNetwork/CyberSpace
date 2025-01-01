import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";
import { Plugin, PluginStatus } from "./types";

const PluginContainer = styled.div`
  padding: 16px;
`;

const SearchBar = styled.div`
  margin-bottom: 16px;
`;

const PluginList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
`;

const PluginCard = styled.div`
  background: ${props => props.theme.colors.background.default};
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PluginHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PluginIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.theme.colors.primary.main}20;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.primary.main};
`;

const PluginInfo = styled.div`
  flex: 1;
`;

const PluginTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: ${props => props.theme.colors.text.primary};
`;

const PluginAuthor = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text.secondary};
`;

const PluginDescription = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text.secondary};
`;

const PluginFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PluginStatus = styled.div<{ status: PluginStatus }>`
  font-size: 0.75rem;
  color: ${props => {
    switch (props.status) {
      case "active":
        return props.theme.colors.success.main;
      case "inactive":
        return props.theme.colors.text.disabled;
      case "error":
        return props.theme.colors.error.main;
      default:
        return props.theme.colors.text.secondary;
    }
  }};
`;

interface PluginManagerProps {
  plugins: Plugin[];
  onInstall?: (plugin: Plugin) => void;
  onUninstall?: (plugin: Plugin) => void;
  onEnable?: (plugin: Plugin) => void;
  onDisable?: (plugin: Plugin) => void;
}

export const PluginManager: React.FC<PluginManagerProps> = ({
  plugins,
  onInstall,
  onUninstall,
  onEnable,
  onDisable,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPlugins, setFilteredPlugins] = useState(plugins);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    setFilteredPlugins(
      plugins.filter(plugin =>
        plugin.name.toLowerCase().includes(query) ||
        plugin.description.toLowerCase().includes(query) ||
        plugin.author.toLowerCase().includes(query)
      )
    );
  }, [searchQuery, plugins]);

  const handleAction = (plugin: Plugin) => {
    switch (plugin.status) {
      case "available":
        onInstall?.(plugin);
        break;
      case "installed":
        onEnable?.(plugin);
        break;
      case "active":
        onDisable?.(plugin);
        break;
      case "error":
        onUninstall?.(plugin);
        break;
    }
  };

  const getActionButton = (plugin: Plugin) => {
    switch (plugin.status) {
      case "available":
        return (
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => handleAction(plugin)}
          >
            Install
          </Button>
        );
      case "installed":
        return (
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={() => handleAction(plugin)}
          >
            Enable
          </Button>
        );
      case "active":
        return (
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => handleAction(plugin)}
          >
            Disable
          </Button>
        );
      case "error":
        return (
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => handleAction(plugin)}
          >
            Uninstall
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <PluginContainer>
      <SearchBar>
        <Input
          fullWidth
          placeholder="Search plugins..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          startAdornment={<Icon name="search" />}
        />
      </SearchBar>
      <PluginList>
        {filteredPlugins.map(plugin => (
          <PluginCard key={plugin.id}>
            <PluginHeader>
              <PluginIcon>
                <Icon name={plugin.icon || "extension"} />
              </PluginIcon>
              <PluginInfo>
                <PluginTitle>{plugin.name}</PluginTitle>
                <PluginAuthor>{plugin.author}</PluginAuthor>
              </PluginInfo>
            </PluginHeader>
            <PluginDescription>{plugin.description}</PluginDescription>
            <PluginFooter>
              <PluginStatus status={plugin.status}>
                {plugin.status.charAt(0).toUpperCase() + plugin.status.slice(1)}
              </PluginStatus>
              {getActionButton(plugin)}
            </PluginFooter>
          </PluginCard>
        ))}
      </PluginList>
    </PluginContainer>
  );
};
