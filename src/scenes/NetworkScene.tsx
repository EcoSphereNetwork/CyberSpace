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

  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0, z: 50 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeLayer, setActiveLayer] = useState("default");

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev * 0.8, 0.2));
  };

  const handleResetCamera = () => {
    setCameraPosition({ x: 0, y: 0, z: 50 });
    setZoomLevel(1);
  };

  const handleLayerChange = (layer: string) => {
    setActiveLayer(layer);
  };

  const handleHelp = () => {
    // Show help modal or documentation
    console.info("Help requested");
  };

  useFrame((state, delta) => {
    // Smooth camera movement
    state.camera.position.lerp(
      new THREE.Vector3(
        cameraPosition.x,
        cameraPosition.y,
        cameraPosition.z / zoomLevel
      ),
      0.1
    );

    // Update node positions based on simulation
    nodes.forEach(node => {
      if (node.ref?.current) {
        node.ref.current.position.lerp(
          new THREE.Vector3(node.x || 0, node.y || 0, 0),
          0.1
        );
      }
    });

    // Update link positions
    links.forEach(link => {
      if (link.ref?.current) {
        const source = nodes.find(n => n.id === link.source);
        const target = nodes.find(n => n.id === link.target);
        if (source?.ref?.current && target?.ref?.current) {
          const start = source.ref.current.position;
          const end = target.ref.current.position;
          link.ref.current.geometry.setFromPoints([start, end]);
        }
      }
    });
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
