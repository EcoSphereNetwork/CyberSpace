import React from 'react';
import styled from '@emotion/styled';

const ToolbarContainer = styled.div`
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  background-color: rgba(26, 26, 26, 0.9);
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 100;
`;

const ToolbarButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.2em;
  margin: 0 5px;
  cursor: pointer;
  transition: transform 0.2s, color 0.2s;
  padding: 8px 16px;
  border-radius: 4px;

  &:hover {
    transform: scale(1.1);
    color: #00cc66;
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const ToolbarDropdown = styled.div`
  position: relative;
  margin: 0 5px;

  &:hover .dropdown-menu {
    display: block;
  }
`;

const DropdownMenu = styled.ul`
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #333;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  list-style: none;
  margin: 0;
  min-width: 150px;
`;

const DropdownItem = styled.li`
  padding: 5px;
  cursor: pointer;
  color: white;

  &:hover {
    background-color: #444;
  }

  label {
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  input {
    margin-right: 8px;
  }
`;

interface NetworkToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetCamera: () => void;
  onLayerChange: (layer: string) => void;
  onHelp: () => void;
}

export const NetworkToolbar: React.FC<NetworkToolbarProps> = ({
  onZoomIn,
  onZoomOut,
  onResetCamera,
  onLayerChange,
  onHelp,
}) => {
  return (
    <ToolbarContainer>
      <ToolbarButton onClick={onZoomIn} title="Zoom In">
        🔍+
      </ToolbarButton>
      <ToolbarButton onClick={onZoomOut} title="Zoom Out">
        🔍-
      </ToolbarButton>
      <ToolbarButton onClick={onResetCamera} title="Reset Camera">
        🔄
      </ToolbarButton>
      <ToolbarDropdown>
        <ToolbarButton title="Layer">🌐 Layer</ToolbarButton>
        <DropdownMenu className="dropdown-menu">
          <DropdownItem>
            <label>
              <input
                type="radio"
                name="layer"
                defaultChecked
                onChange={() => onLayerChange('physical')}
              />
              Physical Layer
            </label>
          </DropdownItem>
          <DropdownItem>
            <label>
              <input
                type="radio"
                name="layer"
                onChange={() => onLayerChange('digital')}
              />
              Digital Layer
            </label>
          </DropdownItem>
          <DropdownItem>
            <label>
              <input
                type="radio"
                name="layer"
                onChange={() => onLayerChange('hybrid')}
              />
              Hybrid Layer
            </label>
          </DropdownItem>
        </DropdownMenu>
      </ToolbarDropdown>
      <ToolbarButton onClick={onHelp} title="Help">
        ❓
      </ToolbarButton>
    </ToolbarContainer>
  );
};
