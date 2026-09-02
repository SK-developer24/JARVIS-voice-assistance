import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function HolographicSphere({ mode = 'idle', mousePos = { x: 0, y: 0 } }) {
  const groupRef = useRef();
  const sphereWireRef = useRef();
  const leftEyeRef = useRef();
  const rightEyeRef = useRef();
  const leftEyeGlowRef = useRef();
  const rightEyeGlowRef = useRef();
  const mouthLineRef = useRef();
  const innerEnergyRingRef = useRef();
  const orbitalRingRef = useRef();

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Floating breathing hover motion
    if (groupRef.current) {
      groupRef.current.position.y = 0.4 + Math.sin(time * 1.4) * 0.08;

      // Mouse Parallax tracking
      const targetRotY = (mousePos.x - 0.5) * 0.45;
      const targetRotX = (mousePos.y - 0.5) * -0.28;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.06);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.06);
    }

    // Outer wireframe sphere smooth slow rotation
    if (sphereWireRef.current) {
      sphereWireRef.current.rotation.y += delta * 0.18;
      sphereWireRef.current.rotation.x += delta * 0.06;
    }

    // State Flags
    const isListening = mode === 'listening';
    const isSpeaking = mode === 'speaking';
    const isProcessing = mode === 'processing';

    // Cinematic Natural Eye Blinking & Glow Modulation
    const blinkCycle = time % 4.0;
    const isNaturalBlink = blinkCycle > 3.82;

    let eyeScaleY = 1.0;
    let eyeOpacity = 0.95;

    if (isListening) {
      const pulse = (Math.sin(time * 6) + 1) * 0.5;
      eyeScaleY = 0.9 + pulse * 0.35;
      eyeOpacity = 0.75 + pulse * 0.25;
    } else if (isProcessing) {
      eyeScaleY = 0.8 + Math.sin(time * 8) * 0.2;
      eyeOpacity = 0.6 + Math.sin(time * 8) * 0.3;
    } else if (isSpeaking) {
      eyeScaleY = 0.9 + Math.sin(time * 5) * 0.25;
      eyeOpacity = 0.8 + Math.sin(time * 6) * 0.2;
    } else {
      eyeScaleY = isNaturalBlink ? 0.08 : 1.0;
      eyeOpacity = isNaturalBlink ? 0.2 : 0.95;
    }

    if (leftEyeRef.current && rightEyeRef.current) {
      leftEyeRef.current.scale.y = eyeScaleY;
      rightEyeRef.current.scale.y = eyeScaleY;
      leftEyeRef.current.material.opacity = eyeOpacity;
      rightEyeRef.current.material.opacity = eyeOpacity;
    }

    if (leftEyeGlowRef.current && rightEyeGlowRef.current) {
      leftEyeGlowRef.current.scale.y = eyeScaleY * 1.3;
      rightEyeGlowRef.current.scale.y = eyeScaleY * 1.3;
      leftEyeGlowRef.current.material.opacity = eyeOpacity * 0.45;
      rightEyeGlowRef.current.material.opacity = eyeOpacity * 0.45;
    }

    // Mouth Synthesizer Glow
    if (mouthLineRef.current) {
      const mouthOpacity = isSpeaking ? 0.8 + Math.sin(time * 10) * 0.2 : isListening ? 0.75 : 0.3;
      mouthLineRef.current.material.opacity = mouthOpacity;
    }

    // Inner Energy Ring (Strictly inside sphere)
    if (innerEnergyRingRef.current) {
      if (isListening) {
        innerEnergyRingRef.current.visible = true;
        innerEnergyRingRef.current.rotation.z += delta * 1.2;
        const subtlePulse = 0.95 + Math.sin(time * 4) * 0.05;
        innerEnergyRingRef.current.scale.set(subtlePulse, subtlePulse, subtlePulse);
        innerEnergyRingRef.current.material.opacity = 0.6 + Math.sin(time * 5) * 0.2;
      } else {
        innerEnergyRingRef.current.visible = false;
      }
    }

    if (orbitalRingRef.current) {
      orbitalRingRef.current.rotation.z += delta * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.4, 0]}>
      
      {/* Precision Colored Cyber Spotlights */}
      <pointLight position={[0, 0.4, 2.4]} intensity={2.8} color="#00f0ff" distance={5} />
      <pointLight position={[0, -0.4, 1.8]} intensity={1.8} color="#0072ff" distance={4} />
      <pointLight position={[0, 1.5, 0]} intensity={1.2} color="#00f0ff" distance={3} />

      {/* ========================================================================= */}
      {/* 1. THE 3D ROBOT HEAD (Perfect Theme Color-Matched to Cyberpunk Navy/Cyan)  */}
      {/* ========================================================================= */}
      <group position={[0, 0, 0.1]} scale={[1.4, 1.4, 1.4]} renderOrder={1}>
        
        {/* Cranium Shell - Deep Metallic Cyber Navy with Cyan Edge Emission */}
        <mesh position={[0, 0.18, -0.05]}>
          <sphereGeometry args={[0.78, 36, 36, 0, Math.PI * 2, 0, Math.PI * 0.75]} />
          <meshStandardMaterial
            color="#06132d"
            metalness={0.9}
            roughness={0.15}
            emissive="#003366"
            emissiveIntensity={0.4}
          />
        </mesh>

        {/* Visor Face Mask - Polished Obsidian Indigo */}
        <mesh position={[0, 0.05, 0.38]} scale={[0.72, 0.9, 0.48]}>
          <sphereGeometry args={[0.74, 36, 36]} />
          <meshStandardMaterial
            color="#020817"
            metalness={0.96}
            roughness={0.06}
            emissive="#010e26"
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* ========================================================= */}
        {/* ELECTRIC CYAN VISOR EYES (Exact #00F0FF Theme Color)       */}
        {/* ========================================================= */}
        <group position={[0, 0.12, 0.72]}>
          {/* Left Eye - Ice-White Core */}
          <mesh
            ref={leftEyeRef}
            position={[-0.23, 0.02, 0]}
            rotation={[0.08, -0.28, -0.22]}
            renderOrder={2}
          >
            <boxGeometry args={[0.22, 0.06, 0.03]} />
            <meshBasicMaterial color="#e0faff" transparent opacity={1.0} />
          </mesh>

          {/* Left Eye - Cyan Neon Aura */}
          <mesh
            ref={leftEyeGlowRef}
            position={[-0.23, 0.02, -0.01]}
            rotation={[0.08, -0.28, -0.22]}
            renderOrder={2}
          >
            <boxGeometry args={[0.26, 0.09, 0.02]} />
            <meshBasicMaterial color="#00f0ff" transparent opacity={0.65} blending={THREE.AdditiveBlending} />
          </mesh>

          {/* Right Eye - Ice-White Core */}
          <mesh
            ref={rightEyeRef}
            position={[0.23, 0.02, 0]}
            rotation={[0.08, 0.28, 0.22]}
            renderOrder={2}
          >
            <boxGeometry args={[0.22, 0.06, 0.03]} />
            <meshBasicMaterial color="#e0faff" transparent opacity={1.0} />
          </mesh>

          {/* Right Eye - Cyan Neon Aura */}
          <mesh
            ref={rightEyeGlowRef}
            position={[0.23, 0.02, -0.01]}
            rotation={[0.08, 0.28, 0.22]}
            renderOrder={2}
          >
            <boxGeometry args={[0.26, 0.09, 0.02]} />
            <meshBasicMaterial color="#00f0ff" transparent opacity={0.65} blending={THREE.AdditiveBlending} />
          </mesh>
        </group>

        {/* Glowing Mouth Synthesizer Slit (#00F0FF) */}
        <mesh
          ref={mouthLineRef}
          position={[0, -0.22, 0.72]}
          renderOrder={2}
        >
          <boxGeometry args={[0.22, 0.025, 0.02]} />
          <meshBasicMaterial color="#00f0ff" transparent opacity={0.6} />
        </mesh>

        {/* Chin Contour - Electric Blue Accent */}
        <mesh position={[0, -0.34, 0.54]} rotation={[Math.PI / 4, 0, 0]}>
          <boxGeometry args={[0.28, 0.12, 0.12]} />
          <meshStandardMaterial
            color="#081c3d"
            metalness={0.9}
            roughness={0.2}
            emissive="#0072ff"
            emissiveIntensity={0.25}
          />
        </mesh>

        {/* ========================================================= */}
        {/* CYBERNETIC HEADSET (Electric Blue & Cyan LED Rings)       */}
        {/* ========================================================= */}
        {/* Left Ear Module */}
        <group position={[-0.85, 0.12, 0]} rotation={[0, 0, Math.PI / 2]}>
          <mesh>
            <cylinderGeometry args={[0.28, 0.28, 0.2, 36]} />
            <meshStandardMaterial color="#061838" metalness={0.88} roughness={0.18} />
          </mesh>
          <mesh position={[0, 0.11, 0]}>
            <ringGeometry args={[0.16, 0.26, 36]} />
            <meshBasicMaterial color="#00f0ff" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <circleGeometry args={[0.1, 24]} />
            <meshBasicMaterial color="#0072ff" side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* Right Ear Module */}
        <group position={[0.85, 0.12, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <mesh>
            <cylinderGeometry args={[0.28, 0.28, 0.2, 36]} />
            <meshStandardMaterial color="#061838" metalness={0.88} roughness={0.18} />
          </mesh>
          <mesh position={[0, 0.11, 0]}>
            <ringGeometry args={[0.16, 0.26, 36]} />
            <meshBasicMaterial color="#00f0ff" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <circleGeometry args={[0.1, 24]} />
            <meshBasicMaterial color="#0072ff" side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* Headset Top Band - Electric Blue Finish */}
        <mesh position={[0, 0.82, 0]}>
          <torusGeometry args={[0.88, 0.05, 16, 64, Math.PI]} />
          <meshStandardMaterial
            color="#0072ff"
            metalness={0.92}
            roughness={0.12}
            emissive="#003880"
            emissiveIntensity={0.4}
          />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* 2. HOLOGRAPHIC SPHERE & ORBITAL RINGS (#00F0FF & #0072FF)                 */}
      {/* ========================================================================= */}
      
      {/* Outer Wireframe Sphere */}
      <mesh ref={sphereWireRef} renderOrder={3}>
        <sphereGeometry args={[2.15, 36, 28]} />
        <meshBasicMaterial
          color="#00f0ff"
          wireframe
          transparent
          opacity={0.24}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Inner Contained Energy Ring */}
      <mesh ref={innerEnergyRingRef} visible={false} renderOrder={3} rotation={[Math.PI / 2.5, 0, 0]}>
        <ringGeometry args={[1.9, 2.05, 48]} />
        <meshBasicMaterial
          color="#00f0ff"
          transparent
          opacity={0.65}
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Sleek Cyan Orbital Ring */}
      <mesh ref={orbitalRingRef} rotation={[Math.PI / 3.2, 0, 0]} renderOrder={3}>
        <ringGeometry args={[2.25, 2.28, 64]} />
        <meshBasicMaterial
          color="#00f0ff"
          transparent
          opacity={0.5}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
