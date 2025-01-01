import React from "react";
import styled from "@emotion/styled";
import { MinimapMarker } from "./MinimapMarker";
import { MinimapRegion } from "./MinimapRegion";
import { Region, Marker } from "./types";

const OverlayContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const OverlayLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: auto;
`;

export interface MinimapOverlayProps {
  regions?: Region[];
  markers?: Marker[];
  onRegionClick?: (region: Region) => void;
  onMarkerClick?: (marker: Marker) => void;
}

export const MinimapOverlay: React.FC<MinimapOverlayProps> = ({
  regions = [],
  markers = [],
  onRegionClick,
  onMarkerClick,
}) => {
  return (
    <OverlayContainer>
      <OverlayLayer>
        {regions.map((region, index) => (
          <MinimapRegion
            key={index}
            region={region}
            onClick={onRegionClick}
          />
        ))}
      </OverlayLayer>
      <OverlayLayer>
        {markers.map((marker, index) => (
          <MinimapMarker
            key={index}
            marker={marker}
            onClick={onMarkerClick}
          />
        ))}
      </OverlayLayer>
    </OverlayContainer>
  );
};
