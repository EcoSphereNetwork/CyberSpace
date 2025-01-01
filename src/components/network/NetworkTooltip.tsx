import React from "react";
import styled from "@emotion/styled";
import { NetworkNode, NetworkLink } from "./types";

const TooltipContainer = styled.div<{ x: number; y: number }>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  transform: translate(-50%, -100%);
  background: ${props => props.theme.colors.background.paper};
  border-radius: 4px;
  padding: 8px 12px;
  box-shadow: ${props => props.theme.shadows[2]};
  pointer-events: none;
  z-index: 1000;
  min-width: 120px;
  max-width: 300px;
`;

const TooltipTitle = styled.div`
  font-weight: 500;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const TooltipContent = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.text.secondary};
`;

const TooltipRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 2px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const TooltipLabel = styled.span`
  color: ${props => props.theme.colors.text.secondary};
`;

const TooltipValue = styled.span`
  color: ${props => props.theme.colors.text.primary};
  font-family: monospace;
`;

interface NetworkTooltipProps {
  x: number;
  y: number;
  item: NetworkNode | NetworkLink | null;
}

export const NetworkTooltip: React.FC<NetworkTooltipProps> = ({
  x,
  y,
  item,
}) => {
  if (!item) return null;

  const isNode = "type" in item;
  const title = isNode ? "Node Details" : "Connection Details";

  return (
    <TooltipContainer x={x} y={y}>
      <TooltipTitle>{title}</TooltipTitle>
      <TooltipContent>
        {isNode ? (
          <>
            <TooltipRow>
              <TooltipLabel>Type:</TooltipLabel>
              <TooltipValue>{item.type}</TooltipValue>
            </TooltipRow>
            <TooltipRow>
              <TooltipLabel>ID:</TooltipLabel>
              <TooltipValue>{item.id}</TooltipValue>
            </TooltipRow>
            {item.label && (
              <TooltipRow>
                <TooltipLabel>Label:</TooltipLabel>
                <TooltipValue>{item.label}</TooltipValue>
              </TooltipRow>
            )}
            {item.status && (
              <TooltipRow>
                <TooltipLabel>Status:</TooltipLabel>
                <TooltipValue>{item.status}</TooltipValue>
              </TooltipRow>
            )}
          </>
        ) : (
          <>
            <TooltipRow>
              <TooltipLabel>Type:</TooltipLabel>
              <TooltipValue>{item.type}</TooltipValue>
            </TooltipRow>
            <TooltipRow>
              <TooltipLabel>Source:</TooltipLabel>
              <TooltipValue>{item.source}</TooltipValue>
            </TooltipRow>
            <TooltipRow>
              <TooltipLabel>Target:</TooltipLabel>
              <TooltipValue>{item.target}</TooltipValue>
            </TooltipRow>
            {item.label && (
              <TooltipRow>
                <TooltipLabel>Label:</TooltipLabel>
                <TooltipValue>{item.label}</TooltipValue>
              </TooltipRow>
            )}
            {item.value && (
              <TooltipRow>
                <TooltipLabel>Value:</TooltipLabel>
                <TooltipValue>{item.value}</TooltipValue>
              </TooltipRow>
            )}
          </>
        )}
      </TooltipContent>
    </TooltipContainer>
  );
};
