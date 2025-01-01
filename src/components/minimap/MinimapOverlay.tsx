import React from "react";
import styled from "@emotion/styled";
import { MinimapMarker } from "./MinimapMarker";
import { MinimapRegion } from "./MinimapRegion";
import { Point, Region, Marker } from "./types";

const OverlayContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
`;

const ViewportIndicator = styled.div<{
  x: number;
  y: number;
  zoom: number;
}>`
  position: absolute;
  left: ${props => props.x * 100}%;
  top: ${props => props.y * 100}%;
  width: ${props => props.zoom * 100}%;
  height: ${props => props.zoom * 100}%;
  border: 2px solid ${props => props.theme.colors.primary.main};
  border-radius: 4px;
  pointer-events: none;
`;

interface MinimapOverlayProps {
  markers?: Marker[];
  regions?: Region[];
  viewport: Point & { zoom: number };
  onMarkerClick?: (marker: Marker) => void;
  onRegionClick?: (region: Region) => void;
}

export const MinimapOverlay: React.FC<MinimapOverlayProps> = ({
  markers = [],
  regions = [],
  viewport,
  onMarkerClick,
  onRegionClick,
}) => {
  return (
    <OverlayContainer>
      {regions.map(region => (
        <MinimapRegion
          key={region.id}
          region={region}
          onClick={onRegionClick}
        />
      ))}
      {markers.map(marker => (
        <MinimapMarker
          key={marker.id}
          marker={marker}
          onClick={onMarkerClick}
        />
      ))}
      <ViewportIndicator
        x={viewport.x}
        y={viewport.y}
        zoom={viewport.zoom}
      />
    </OverlayContainer>
  );
};
