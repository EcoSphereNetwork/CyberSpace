import React from "react";
import styled from "@emotion/styled";

const SwitchContainer = styled.label`
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
  cursor: pointer;
`;

const SwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: ${props => props.theme.colors.primary.main};
  }

  &:checked + span:before {
    transform: translateX(16px);
  }

  &:focus + span {
    box-shadow: 0 0 1px ${props => props.theme.colors.primary.main};
  }

  &:disabled + span {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SwitchSlider = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.theme.colors.action.disabled};
  transition: 0.4s;
  border-radius: 34px;

  &:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

export interface SwitchProps {
  checked?: boolean;
  disabled?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Switch: React.FC<SwitchProps> = ({
  checked = false,
  disabled = false,
  onChange,
}) => {
  return (
    <SwitchContainer>
      <SwitchInput
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      <SwitchSlider />
    </SwitchContainer>
  );
};
