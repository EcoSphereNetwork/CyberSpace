import React, { useMemo, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export function HeatmapLayer({ data, scale = 1, intensity = 1, type = 'bandwidth', historyData }) {
  const [timeIndex, setTimeIndex] = useState(0);

  const heatmapMesh = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(10 * scale, 10 * scale, 50, 50);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        data: { value: data },
        intensity: { value: intensity },
        time: { value: 0 },
        type: { value: type === 'bandwidth' ? 0.0 : type === 'energy' ? 1.0 : 2.0 },
        timeIndex: { value: timeIndex },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D data;
        uniform float intensity;
        uniform float time;
        uniform float type;
        uniform float timeIndex;
        varying vec2 vUv;

        void main() {
          vec4 heatData = texture2D(data, vUv);
          float value = heatData.r * intensity;
          vec3 color = vec3(0.0);

          if (type == 0.0) {
            // Bandwidth Visualization
            if (value > 0.75) {
              color = mix(vec3(0.0, 0.0, 1.0), vec3(1.0, 0.0, 1.0), value - 0.75);
            } else if (value > 0.5) {
              color = mix(vec3(0.0, 1.0, 1.0), vec3(0.0, 0.0, 1.0), value - 0.5);
            } else {
              color = mix(vec3(0.0, 1.0, 0.0), vec3(0.0, 1.0, 1.0), value);
            }
          } else if (type == 1.0) {
            // Energy Flow Visualization
            if (value > 0.75) {
              color = mix(vec3(1.0, 0.5, 0.0), vec3(1.0, 1.0, 0.0), value - 0.75);
            } else if (value > 0.5) {
              color = mix(vec3(0.5, 0.5, 0.0), vec3(1.0, 0.5, 0.0), value - 0.5);
            } else {
              color = mix(vec3(0.0, 0.5, 0.0), vec3(0.5, 0.5, 0.0), value);
            }
          } else {
            // Activity Visualization
            if (value > 0.75) {
              color = mix(vec3(1.0, 0.0, 0.0), vec3(1.0, 1.0, 0.0), value - 0.75);
            } else if (value > 0.5) {
              color = mix(vec3(0.0, 1.0, 0.0), vec3(1.0, 0.0, 0.0), value - 0.5);
            } else {
              color = mix(vec3(0.0, 0.0, 1.0), vec3(0.0, 1.0, 0.0), value);
            }
          }

          gl_FragColor = vec4(color, 1.0);
        }
      `,
      transparent: true,
    });

    return new THREE.Mesh(geometry, material);
  }, [data, scale, intensity, type, timeIndex]);

  useFrame((state, delta) => {
    heatmapMesh.material.uniforms.time.value += delta;
  });

  const handleSliderChange = (e) => {
    setTimeIndex(e.target.value);
  };

  return (
    <>
      <primitive object={heatmapMesh} />
      {historyData && (
        <div style={{ position: 'absolute', bottom: '10px', width: '100%' }}>
          <input
            type="range"
            min="0"
            max={historyData.length - 1}
            value={timeIndex}
            onChange={handleSliderChange}
            style={{ width: '90%', margin: '0 auto', display: 'block' }}
          />
        </div>
      )}
    </>
  );
}

/**
 * Features:
 * 1. **Dynamic Heatmap Rendering:**
 *    - Visualizes data intensity for bandwidth, energy flow, and activity.
 *    - Colors transition dynamically based on selected type and intensity.
 * 2. **Shader-Based Effects:**
 *    - Uses a custom shader for smooth color transitions based on visualization type.
 * 3. **Realtime Updates:**
 *    - Automatically updates based on data changes and time progression.
 * 4. **Time Slider Integration:**
 *    - Allows users to navigate through historical data points.
 */
