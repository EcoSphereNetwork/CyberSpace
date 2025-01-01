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
  const size = useResizeObserver(containerRef.current);

  useEffect(() => {
    if (!canvasRef.current || !size) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = size.width;
    canvas.height = size.height;

    ctx.fillStyle = theme.colors.background.paper;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = theme.colors.divider;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.stroke();

    regions.forEach(region => {
      ctx.fillStyle = region.color || theme.colors.primary.main + "40";
      ctx.strokeStyle = region.color || theme.colors.primary.main;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(region.x, region.y, region.width, region.height);
      ctx.fill();
      ctx.stroke();

      if (region.label) {
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
    });

    markers.forEach(marker => {
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
    });

    ctx.strokeStyle = theme.colors.primary.main;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.stroke();
  }, [size, regions, markers, theme]);

  return (
    <CanvasContainer
      ref={containerRef}
      $width={width}
      $height={height}
    >
      <canvas ref={canvasRef} />
      {regions.map((region, index) => (
        <MinimapRegion
          key={index}
          region={region}
          onClick={onRegionClick}
        />
      ))}
      {markers.map((marker, index) => (
        <MinimapMarker
          key={index}
          marker={marker}
          onClick={onMarkerClick}
        />
      ))}
    </CanvasContainer>
  );
};
