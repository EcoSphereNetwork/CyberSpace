import React from "react";
import styled from "@emotion/styled";

interface IconStyleProps {
  size?: "small" | "medium" | "large";
  color?: string;
}

const IconWrapper = styled.span<IconStyleProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${props => {
    switch (props.size) {
      case "small":
        return "16px";
      case "large":
        return "32px";
      default:
        return "24px";
    }
  }};
  height: ${props => {
    switch (props.size) {
      case "small":
        return "16px";
      case "large":
        return "32px";
      default:
        return "24px";
    }
  }};
  color: ${props => props.color || "inherit"};
  user-select: none;
`;

export interface IconProps extends IconStyleProps {
  name: string;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = "medium",
  color,
  className,
}) => {
  return (
    <IconWrapper
      size={size}
      color={color}
      className={`material-icons ${className || ""}`}
    >
      {name}
    </IconWrapper>
  );
};
