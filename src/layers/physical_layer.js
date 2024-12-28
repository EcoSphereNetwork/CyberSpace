import React, { useState } from 'react';
import RotatingGlobe from '../components/RotatingGlobe';
import { Landmark } from './Scene';
import { Tooltip } from './Scene';

export function PhysicalLayer() {
  const [tooltip, setTooltip] = useState(null);

  const landmarks = [
    { position: [2, 0, 1], color: 'brown', label: 'Building A', size: 0.8 },
    { position: [-3, 0, -2], color: 'blue', label: 'Building B', size: 0.6 },
    { position: [1, 1, 2], color: 'green', label: 'HQ', size: 1.0 },
    { position: [0, -1, 3], color: 'red', label: 'Data Center', size: 0.7 },
    { position: [-4, -1, -1], color: 'purple', label: 'Research Lab', size: 0.5 },
  ];

  const handleHover = (landmark) => {
    setTooltip({ text: landmark.label, position: [landmark.position[0], landmark.position[1] + 1, landmark.position[2]] });
  };

  const handleLeave = () => {
    setTooltip(null);
  };

  const handleClick = (landmark) => {
    alert(`You clicked on ${landmark.label}`);
  };

  return (
    <group>
      <RotatingGlobe />
      {landmarks.map((landmark, index) => (
        <Landmark
          key={index}
          {...landmark}
          onHover={() => handleHover(landmark)}
          onPointerOut={handleLeave}
          onClick={() => handleClick(landmark)}
        />
      ))}
      {tooltip && <Tooltip text={tooltip.text} position={tooltip.position} />}
    </group>
  );
}
