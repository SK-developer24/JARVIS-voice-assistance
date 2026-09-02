import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function CyberGrid() {
  const pointsRef = useRef();
  const cylinderGridRef = useRef();

  // Generate 350 floating cyber dust particles distributed in 360 space
  const particleCount = 350;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const radius = 4 + Math.random() * 16;
      const theta = Math.random() * Math.PI * 2;
      pos[i * 3] = radius * Math.cos(theta);                  // x
      pos[i * 3 + 1] = (Math.random() - 0.5) * 18;           // y
      pos[i * 3 + 2] = radius * Math.sin(theta);              // z
    }
    return pos;
  }, [particleCount]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.04;
    }
    if (cylinderGridRef.current) {
      cylinderGridRef.current.rotation.y -= delta * 0.015;
    }
  });

  return (
    <group>
      {/* 360 Panoramic Cybernetic Room Grid */}
      <mesh ref={cylinderGridRef} position={[0, 0, 0]}>
        <cylinderGeometry args={[14, 14, 20, 36, 16, true]} />
        <meshBasicMaterial
          color="#0072ff"
          wireframe
          side={THREE.BackSide}
          transparent
          opacity={0.07}
        />
      </mesh>

      {/* Floating 360 Cyan & Blue Particle Starfield */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.09}
          color="#00f0ff"
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
