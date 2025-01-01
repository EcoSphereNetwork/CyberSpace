import React, { useState, useEffect } from "react";
import { useTheme } from "@emotion/react";
import { useFrame } from "@react-three/fiber";
import { NetworkGraph } from "@/components/network/NetworkGraph";
import { NetworkToolbar } from "@/components/network/NetworkToolbar";
import { NetworkSidebar } from "@/components/network/NetworkSidebar";
import { NetworkContextMenu } from "@/components/network/NetworkContextMenu";
import { NetworkLegend } from "@/components/network/NetworkLegend";
import { NetworkControls } from "@/components/network/NetworkControls";
import { useViewport } from "@/hooks/useViewport";
import { NetworkNode, NetworkLink } from "@/types/network";

interface NetworkSceneProps {
  nodes: NetworkNode[];
  links: NetworkLink[];
  onNodeClick?: (node: NetworkNode) => void;
  onLinkClick?: (link: NetworkLink) => void;
  onNodeHover?: (node: NetworkNode | null) => void;
  onLinkHover?: (link: NetworkLink | null) => void;
}

export const NetworkScene: React.FC<NetworkSceneProps> = ({
  nodes,
  links,
  onNodeClick,
  onLinkClick,
  onNodeHover,
  onLinkHover,
}) => {
  const theme = useTheme();
  const viewport = useViewport();
  const [activeFilters, setActiveFilters] = useState({
    activeNodes: true,
    criticalPaths: true,
    warnings: true,
    errors: true,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    node?: NetworkNode;
    link?: NetworkLink;
  } | null>(null);

  const handleZoomIn = () => {
    // Implementation
  };

  const handleZoomOut = () => {
    // Implementation
  };

  const handleResetCamera = () => {
    // Implementation
  };

  const handleLayerChange = (layer: string) => {
    // Implementation
  };

  const handleHelp = () => {
    // Implementation
  };

  useFrame((_state, delta) => {
    // Implementation
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "Escape":
          setContextMenu(null);
          break;
        case "+":
          handleZoomIn();
          break;
        case "-":
          handleZoomOut();
          break;
        case "r":
          handleResetCamera();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleContextMenu = (event: MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleNodeContextMenu = (node: NetworkNode, event: MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      node,
    });
  };

  const handleLinkContextMenu = (link: NetworkLink, event: MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      link,
    });
  };

  const handleFilterChange = (filters: Record<string, boolean>) => {
    setActiveFilters({
      activeNodes: filters.activeNodes || false,
      criticalPaths: filters.criticalPaths || false,
      warnings: filters.warnings || false,
      errors: filters.errors || false,
    });
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const graphData = {
    nodes,
    links,
    filters: activeFilters,
    search: searchTerm,
  };

  return (
    <>
      <NetworkGraph
        nodes={nodes}
        links={links}
        onNodeClick={onNodeClick}
        onLinkClick={onLinkClick}
        onNodeHover={onNodeHover}
        onLinkHover={onLinkHover}
      />
      <NetworkToolbar
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetCamera={handleResetCamera}
        onLayerChange={handleLayerChange}
        onHelp={handleHelp}
      />
      <NetworkSidebar
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
      />
      <NetworkLegend data={graphData} />
      <NetworkControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onCenter={handleResetCamera}
      />
      {contextMenu && contextMenu.node && (
        <NetworkContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          object={contextMenu.node}
          onAction={() => setContextMenu(null)}
          onClose={() => setContextMenu(null)}
        />
      )}
      {contextMenu && contextMenu.link && (
        <NetworkContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          object={contextMenu.link}
          onAction={() => setContextMenu(null)}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
};
