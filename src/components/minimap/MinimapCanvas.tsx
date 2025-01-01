import React, { useRef, useEffect } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { useViewport } from "@/hooks/useViewport";
import { useResizeObserver } from "@/hooks/useResizeObserver";
import { MinimapMarker } from "./MinimapMarker";
import { MinimapRegion } from "./MinimapRegion";
import { MinimapOverlay } from "./MinimapOverlay";
import { MinimapControls } from "./MinimapControls";
import { Point, Region, Marker } from "./types";

const MinimapContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: ${props => props.theme.colors.background.paper};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows[1]};
`;

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
`;

interface MinimapCanvasProps {
  markers?: Marker[];
  regions?: Region[];
  onMarkerClick?: (marker: Marker) => void;
  onRegionClick?: (region: Region) => void;
  onViewportChange?: (viewport: { x: number; y: number; zoom: number }) => void;
}

export const MinimapCanvas: React.FC<MinimapCanvasProps> = ({
  markers = [],
  regions = [],
  onMarkerClick,
  onRegionClick,
  onViewportChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const { viewport, setViewport } = useViewport();
  const { width, height } = useResizeObserver(containerRef);

  useEffect(() => {
    if (!canvasRef.current || !width || !height) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.fillStyle = theme.colors.background.paper;
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = theme.colors.divider;
    ctx.lineWidth = 1;
    const gridSize = 20;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw regions
    regions.forEach(region => {
      ctx.fillStyle = region.color || theme.colors.primary.main + "40";
      ctx.strokeStyle = region.color || theme.colors.primary.main;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.rect(
        region.x * width,
        region.y * height,
        region.width * width,
        region.height * height
      );
      ctx.fill();
      ctx.stroke();
    });

    // Draw markers
    markers.forEach(marker => {
      const x = marker.x * width;
      const y = marker.y * height;
      const radius = 6;

      ctx.fillStyle = marker.color || theme.colors.secondary.main;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      if (marker.label) {
        ctx.font = "12px sans-serif";
        ctx.fillStyle = theme.colors.text.primary;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(marker.label, x, y - radius - 4);
      }
    });

    // Draw viewport
    ctx.strokeStyle = theme.colors.primary.main;
    ctx.lineWidth = 2;
    ctx.strokeRect(
      viewport.x * width,
      viewport.y * height,
      viewport.zoom * width,
      viewport.zoom * height
    );
  }, [width, height, markers, regions, viewport, theme]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Check if clicked on a marker
    const clickedMarker = markers.find(marker => {
      const dx = x - marker.x;
      const dy = y - marker.y;
      return Math.sqrt(dx * dx + dy * dy) < 0.02; // 2% of canvas size
    });
    if (clickedMarker) {
      onMarkerClick?.(clickedMarker);
      return;
    }

    // Check if clicked on a region
    const clickedRegion = regions.find(region => {
      return (
        x >= region.x &&
        x <= region.x + region.width &&
        y >= region.y &&
        y <= region.y + region.height
      );
    });
    if (clickedRegion) {
      onRegionClick?.(clickedRegion);
      return;
    }

    // Update viewport
    setViewport({
      x: Math.max(0, Math.min(x - viewport.zoom / 2, 1 - viewport.zoom)),
      y: Math.max(0, Math.min(y - viewport.zoom / 2, 1 - viewport.zoom)),
      zoom: viewport.zoom,
    });
  };

  return (
    <MinimapContainer ref={containerRef}>
      <Canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
      />
      <MinimapOverlay
        markers={markers}
        regions={regions}
        viewport={viewport}
        onMarkerClick={onMarkerClick}
        onRegionClick={onRegionClick}
      />
      <MinimapControls
        viewport={viewport}
        onChange={setViewport}
        onViewportChange={onViewportChange}
      />
    </MinimapContainer>
  );
};
