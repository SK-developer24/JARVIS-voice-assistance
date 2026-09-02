import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { CyberGrid } from './CyberGrid';
import { HologramPlatform } from './HologramPlatform';
import { HolographicSphere } from './HolographicSphere';

export function Scene3D({ mode = 'idle' }) {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const controlsRef = useRef();

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 0.4, 7.8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* 360 Degree Orbit Camera Controls */}
        <OrbitControls
          ref={controlsRef}
          enableRotate={true}
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.7}
          dampingFactor={0.05}
          minPolarAngle={Math.PI / 3.5}
          maxPolarAngle={Math.PI / 1.8}
          minAzimuthAngle={-Math.PI / 2.2}
          maxAzimuthAngle={Math.PI / 2.2}
        />

        {/* Cinematic Ambient & Cyber Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} color="#00f0ff" />
        <directionalLight position={[-5, -4, -2]} intensity={0.9} color="#0072ff" />
        <pointLight position={[0, 0.5, 3.5]} intensity={2.0} color="#00f0ff" distance={10} />
        <pointLight position={[0, -2.5, 0]} intensity={2.5} color="#0072ff" distance={6} />

        {/* 3D Scene Assets */}
        <CyberGrid />
        <HologramPlatform mode={mode} />
        <HolographicSphere mode={mode} mousePos={mousePos} />
      </Canvas>
    </div>
  );
}
