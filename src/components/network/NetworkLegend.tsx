import React from "react";
import styled from "@emotion/styled";
import { NetworkGraphData } from "./types";

const LegendContainer = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  background: ${props => props.theme.colors.background.paper};
  border-radius: 8px;
  padding: 16px;
  box-shadow: ${props => props.theme.shadows[2]};
  min-width: 200px;
`;

const LegendTitle = styled.h3`
  margin: 0 0 12px;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const LegendSection = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const LegendSectionTitle = styled.h4`
  margin: 0 0 8px;
  font-size: 0.75rem;
  font-weight: 500;
  color: ${props => props.theme.colors.text.secondary};
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const LegendColor = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.color};
`;

const LegendLabel = styled.span`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.text.primary};
`;

interface NetworkLegendProps {
  data: NetworkGraphData;
}

export const NetworkLegend: React.FC<NetworkLegendProps> = ({ data }) => {
  // Get unique node types and their colors
  const nodeTypes = Array.from(
    new Set(data.nodes.map(node => node.type))
  ).map(type => ({
    type,
    color: data.nodes.find(node => node.type === type)?.color,
  }));

  // Get unique link types and their colors
  const linkTypes = Array.from(
    new Set(data.links.map(link => link.type))
  ).map(type => ({
    type,
    color: data.links.find(link => link.type === type)?.color,
  }));

  return (
    <LegendContainer>
      <LegendTitle>Network Legend</LegendTitle>
      {nodeTypes.length > 0 && (
        <LegendSection>
          <LegendSectionTitle>Node Types</LegendSectionTitle>
          {nodeTypes.map(({ type, color }) => (
            <LegendItem key={type}>
              <LegendColor color={color || "#666"} />
              <LegendLabel>{type}</LegendLabel>
            </LegendItem>
          ))}
        </LegendSection>
      )}
      {linkTypes.length > 0 && (
        <LegendSection>
          <LegendSectionTitle>Connection Types</LegendSectionTitle>
          {linkTypes.map(({ type, color }) => (
            <LegendItem key={type}>
              <LegendColor color={color || "#666"} />
              <LegendLabel>{type}</LegendLabel>
            </LegendItem>
          ))}
        </LegendSection>
      )}
    </LegendContainer>
  );
};
