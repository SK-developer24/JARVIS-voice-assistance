import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function HologramPlatform({ mode = 'idle' }) {
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring3Ref = useRef();
  const discRef = useRef();

  useFrame((state, delta) => {
    const speedMultiplier = mode === 'listening' ? 2.5 : mode === 'processing' ? 4 : 1;
    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 0.4 * speedMultiplier;
    if (ring2Ref.current) ring2Ref.current.rotation.z -= delta * 0.6 * speedMultiplier;
    if (ring3Ref.current) ring3Ref.current.rotation.z += delta * 0.2 * speedMultiplier;
  });

  return (
    <group position={[0, -2.6, 0]} rotation={[-Math.PI / 2.3, 0, 0]}>
      {/* Outer Ground Neon Ring 1 */}
      <mesh ref={ring1Ref}>
        <ringGeometry args={[3.2, 3.28, 64]} />
        <meshBasicMaterial
          color="#00f0ff"
          side={THREE.DoubleSide}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Segmented Middle Ring 2 */}
      <mesh ref={ring2Ref}>
        <ringGeometry args={[2.5, 2.6, 32]} />
        <meshBasicMaterial
          color="#0072ff"
          side={THREE.DoubleSide}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Inner Fast Ring 3 */}
      <mesh ref={ring3Ref}>
        <ringGeometry args={[1.8, 1.86, 48]} />
        <meshBasicMaterial
          color="#00f0ff"
          side={THREE.DoubleSide}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Core Glowing Hologram Disc */}
      <mesh ref={discRef} position={[0, 0, -0.05]}>
        <circleGeometry args={[1.6, 48]} />
        <meshBasicMaterial
          color="#0044aa"
          side={THREE.DoubleSide}
          transparent
          opacity={0.25}
        />
      </mesh>

      {/* Concentric Grid Radiating Lines */}
      <mesh>
        <ringGeometry args={[0.5, 3.3, 16, 1]} />
        <meshBasicMaterial
          color="#00f0ff"
          wireframe
          side={THREE.DoubleSide}
          transparent
          opacity={0.12}
        />
      </mesh>
    </group>
  );
}
