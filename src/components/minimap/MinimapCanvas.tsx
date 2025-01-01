import React, { useRef, useEffect } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { useResizeObserver } from "@/hooks/useResizeObserver";
import { MinimapMarker } from "./MinimapMarker";
import { MinimapRegion } from "./MinimapRegion";
import { Point, Region, Marker } from "./types";

interface CanvasContainerProps {
  $width?: number;
  $height?: number;
}

const CanvasContainer = styled.div<CanvasContainerProps>`
  position: relative;
  width: ${props => props.$width || "100%"};
  height: ${props => props.$height || "100%"};
  background: ${props => props.theme.colors.background.paper};
  border-radius: 4px;
  box-shadow: ${props => props.theme.shadows[1]};
  overflow: hidden;
`;

export interface MinimapCanvasProps {
  width?: number;
  height?: number;
  regions?: Region[];
  markers?: Marker[];
  onRegionClick?: (region: Region) => void;
  onMarkerClick?: (marker: Marker) => void;
}

export const MinimapCanvas: React.FC<MinimapCanvasProps> = ({
  width,
  height,
  regions = [],
  markers = [],
  onRegionClick,
  onMarkerClick,
}) => {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef<Point | null>(null);
  const [viewOffset, setViewOffset] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const size = useResizeObserver(containerRef.current);

  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const renderFrame = useCallback(() => {
    if (!canvasRef.current || !size) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size if needed
    if (canvas.width !== size.width || canvas.height !== size.height) {
      canvas.width = size.width;
      canvas.height = size.height;
    }

    // Clear canvas
    ctx.fillStyle = theme.colors.background.paper;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
    ctx.translate(viewOffset.x, viewOffset.y);
    ctx.scale(zoom, zoom);

    // Draw grid
    ctx.strokeStyle = theme.colors.divider + "40";
    ctx.lineWidth = 0.5;
    const gridSize = 50;
    const offsetX = viewOffset.x % gridSize;
    const offsetY = viewOffset.y % gridSize;

    for (let x = -offsetX; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    for (let y = -offsetY; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw border
    ctx.strokeStyle = theme.colors.divider;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.stroke();

    // Draw regions with shadows
    regions.forEach(region => {
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      ctx.fillStyle = region.color || theme.colors.primary.main + "40";
      ctx.strokeStyle = region.color || theme.colors.primary.main;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(region.x, region.y, region.width, region.height);
      ctx.fill();
      ctx.stroke();

      if (region.label) {
        ctx.shadowColor = "transparent";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = theme.colors.text.primary;
        ctx.fillText(
          region.label,
          region.x + region.width / 2,
          region.y + region.height / 2
        );
      }
      ctx.restore();
    });

    // Draw connections between markers
    markers.forEach((marker, i) => {
      markers.slice(i + 1).forEach(otherMarker => {
        if (marker.connections?.includes(otherMarker.id)) {
          ctx.beginPath();
          ctx.strokeStyle = theme.colors.primary.main + "40";
          ctx.lineWidth = 1;
          ctx.moveTo(marker.x, marker.y);
          ctx.lineTo(otherMarker.x, otherMarker.y);
          ctx.stroke();
        }
      });
    });

    // Draw markers with glow effect
    markers.forEach(marker => {
      ctx.save();
      
      // Draw glow
      const gradient = ctx.createRadialGradient(
        marker.x, marker.y, 0,
        marker.x, marker.y, 8
      );
      gradient.addColorStop(0, marker.color || theme.colors.secondary.main);
      gradient.addColorStop(1, "transparent");
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(marker.x, marker.y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Draw marker
      ctx.fillStyle = marker.color || theme.colors.secondary.main;
      ctx.beginPath();
      ctx.arc(marker.x, marker.y, 4, 0, Math.PI * 2);
      ctx.fill();

      if (marker.label) {
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillStyle = theme.colors.text.primary;
        ctx.fillText(marker.label, marker.x, marker.y - 8);
      }
      ctx.restore();
    });

    // Restore context and draw border
    ctx.restore();
    ctx.strokeStyle = theme.colors.primary.main;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.stroke();

    // Request next frame
    animationFrameRef.current = requestAnimationFrame(renderFrame);
  }, [size, regions, markers, theme]);

  // Start rendering on mount
  useEffect(() => {
    renderFrame();
  }, [renderFrame]);

  // Handle mouse events for pan and zoom
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingRef.current || !lastMousePosRef.current) return;

    const deltaX = e.clientX - lastMousePosRef.current.x;
    const deltaY = e.clientY - lastMousePosRef.current.y;
    
    setViewOffset(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }));

    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    lastMousePosRef.current = null;
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.min(Math.max(prev * delta, 0.1), 5));
  }, []);

  return (
    <CanvasContainer
      ref={containerRef}
      $width={width}
      $height={height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <canvas ref={canvasRef} style={{ cursor: isDraggingRef.current ? 'grabbing' : 'grab' }} />
      {regions.map((region, index) => (
        <MinimapRegion
          key={region.id || index}
          region={region}
          onClick={onRegionClick}
          style={{
            transform: `translate(${viewOffset.x}px, ${viewOffset.y}px) scale(${zoom})`,
          }}
        />
      ))}
      {markers.map((marker, index) => (
        <MinimapMarker
          key={marker.id || index}
          marker={marker}
          onClick={onMarkerClick}
          style={{
            transform: `translate(${viewOffset.x}px, ${viewOffset.y}px) scale(${zoom})`,
          }}
        />
      ))}
    </CanvasContainer>
  );
};
