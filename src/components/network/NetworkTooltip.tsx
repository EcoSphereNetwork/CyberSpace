import React from "react";
import styled from "@emotion/styled";
import { NetworkNode, NetworkLink } from "@/types/network";

const TooltipContainer = styled.div<{ x: number; y: number }>`
  position: fixed;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  transform: translate(-50%, -100%);
  padding: 8px;
  background: ${props => props.theme.colors.background.paper};
  border-radius: 4px;
  box-shadow: ${props => props.theme.shadows[2]};
  z-index: 1000;
  pointer-events: none;
`;

const TooltipTitle = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
`;

const TooltipContent = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text.secondary};
`;

const TooltipRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
`;

const TooltipLabel = styled.span`
  color: ${props => props.theme.colors.text.secondary};
`;

const TooltipValue = styled.span`
  color: ${props => props.theme.colors.text.primary};
`;

export interface NetworkTooltipProps {
  x: number;
  y: number;
  item: NetworkNode | NetworkLink;
}

export const NetworkTooltip: React.FC<NetworkTooltipProps> = ({
  x,
  y,
  item,
}) => {
  const isNode = "type" in item && !("source" in item);

  return (
    <TooltipContainer x={x} y={y}>
      <TooltipTitle>{item.label || item.id}</TooltipTitle>
      <TooltipContent>
        <TooltipRow>
          <TooltipLabel>Type:</TooltipLabel>
          <TooltipValue>{item.type}</TooltipValue>
        </TooltipRow>
        <TooltipRow>
          <TooltipLabel>Status:</TooltipLabel>
          <TooltipValue>{item.status}</TooltipValue>
        </TooltipRow>
        {isNode ? (
          <>
            {/* Node-specific fields */}
            {item.size && (
              <TooltipRow>
                <TooltipLabel>Size:</TooltipLabel>
                <TooltipValue>{item.size}</TooltipValue>
              </TooltipRow>
            )}
          </>
        ) : (
          <>
            {/* Link-specific fields */}
            <TooltipRow>
              <TooltipLabel>Source:</TooltipLabel>
              <TooltipValue>{(item as NetworkLink).source}</TooltipValue>
            </TooltipRow>
            <TooltipRow>
              <TooltipLabel>Target:</TooltipLabel>
              <TooltipValue>{(item as NetworkLink).target}</TooltipValue>
            </TooltipRow>
            {(item as NetworkLink).width && (
              <TooltipRow>
                <TooltipLabel>Width:</TooltipLabel>
                <TooltipValue>{(item as NetworkLink).width}</TooltipValue>
              </TooltipRow>
            )}
          </>
        )}
      </TooltipContent>
    </TooltipContainer>
  );
};
