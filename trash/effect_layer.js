import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function ParticleEffect({ position, color, particleCount = 100 }) {
  const particlesRef = useRef();

  useFrame(() => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.01;
    }
  });

  const particlePositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 2;
      const y = (Math.random() - 0.5) * 2;
      const z = (Math.random() - 0.5) * 2;
      positions.push(x, y, z);
    }
    return new Float32Array(positions);
  }, [particleCount]);

  return (
    <points ref={particlesRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={particlePositions}
          count={particlePositions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color={color || 'white'} />
    </points>
  );
}

export function GlowingEdge({ start, end, color = 'cyan', speed = 0.02, pulseSpeed = 1 }) {
  const ref = useRef();

  const glowingMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        glowColor: { value: new THREE.Color(color) },
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalMatrix * normal;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.5 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
          gl_FragColor = vec4(glowColor, 1.0) * intensity;
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
  }, [color]);

  useFrame((state, delta) => {
    ref.current.material.uniforms.time.value += delta * speed * pulseSpeed;
  });

  return (
    <line ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={new Float32Array([...start, ...end])}
          count={2}
          itemSize={3}
        />
      </bufferGeometry>
      <primitive attach="material" object={glowingMaterial} />
    </line>
  );
}

export function PortalEffect({ position, innerColor = 'cyan', outerColor = 'blue', pulseSpeed = 1 }) {
  const portalRef = useRef();

  const portalMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        innerColor: { value: new THREE.Color(innerColor) },
        outerColor: { value: new THREE.Color(outerColor) },
      },
      vertexShader: `
        varying vec3 vPosition;
        void main() {
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 innerColor;
        uniform vec3 outerColor;
        varying vec3 vPosition;
        void main() {
          float distance = length(vPosition.xy);
          float alpha = 1.0 - smoothstep(0.5, 1.0, distance);
          vec3 color = mix(innerColor, outerColor, distance + sin(time * 3.0) * 0.1);
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
  }, [innerColor, outerColor]);

  useFrame((state, delta) => {
    portalRef.current.material.uniforms.time.value += delta * pulseSpeed;
  });

  return (
    <mesh ref={portalRef} position={position}>
      <ringGeometry args={[0.8, 1, 64]} />
      <primitive attach="material" object={portalMaterial} />
    </mesh>
  );
}
