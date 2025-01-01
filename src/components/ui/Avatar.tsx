import React from "react";
import styled from "@emotion/styled";

interface AvatarContainerProps {
  $size?: "small" | "medium" | "large";
  $color?: string;
}

const AvatarContainer = styled.div<AvatarContainerProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: ${props => props.$color || props.theme.colors.primary.main};
  color: ${props => props.theme.colors.primary.contrastText};
  font-weight: 500;
  overflow: hidden;

  ${props => {
    switch (props.$size) {
      case "small":
        return `
          width: 24px;
          height: 24px;
          font-size: 0.75rem;
        `;
      case "large":
        return `
          width: 48px;
          height: 48px;
          font-size: 1.25rem;
        `;
      default:
        return `
          width: 36px;
          height: 36px;
          font-size: 1rem;
        `;
    }
  }}
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: "small" | "medium" | "large";
  color?: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size,
  color,
  className,
}) => {
  const initials = name
    ?.split(" ")
    .map(word => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <AvatarContainer
      $size={size}
      $color={color}
      className={className}
    >
      {src ? (
        <AvatarImage src={src} alt={alt || name || ""} />
      ) : (
        initials || "?"
      )}
    </AvatarContainer>
  );
};
