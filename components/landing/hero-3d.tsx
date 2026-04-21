'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Shared mouse position in normalised device coords [-1, 1]
const mouse = { x: 0, y: 0 };
if (typeof window !== 'undefined') {
  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });
}

function MainOrb() {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current || !groupRef.current) return;
    meshRef.current.rotation.x = clock.getElapsedTime() * 0.12;
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.18;
    // Follow mouse with spring-like lerp
    groupRef.current.position.x += (mouse.x * 1.8 - groupRef.current.position.x) * 0.05;
    groupRef.current.position.y += (mouse.y * 1.2 - groupRef.current.position.y) * 0.05;
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.8}>
        <Sphere ref={meshRef} args={[1.6, 128, 128]}>
          <MeshDistortMaterial
            color="#2563eb"
            attach="material"
            distort={0.45}
            speed={1.8}
            roughness={0.1}
            metalness={0.8}
            emissive="#1d4ed8"
            emissiveIntensity={0.4}
          />
        </Sphere>
      </Float>
    </group>
  );
}

function OrbitingSpheres() {
  const group = useRef<THREE.Group>(null);

  const satellites = useMemo(() => [
    { pos: [3, 0.5, 0] as [number, number, number], size: 0.28, color: '#7c3aed', speed: 2.2 },
    { pos: [-2.8, -0.8, 0.5] as [number, number, number], size: 0.18, color: '#0ea5e9', speed: 1.6 },
    { pos: [1.2, 2.8, -0.5] as [number, number, number], size: 0.22, color: '#6366f1', speed: 2.8 },
    { pos: [-1.5, -2.6, 0.8] as [number, number, number], size: 0.14, color: '#3b82f6', speed: 1.2 },
  ], []);

  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.y = clock.getElapsedTime() * 0.3;
    group.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.15;
    // Subtle parallax away from main orb movement
    group.current.position.x += (-mouse.x * 0.6 - group.current.position.x) * 0.03;
    group.current.position.y += (-mouse.y * 0.4 - group.current.position.y) * 0.03;
  });

  return (
    <group ref={group}>
      {satellites.map((s, i) => (
        <Float key={i} speed={s.speed} floatIntensity={0.5} rotationIntensity={0.3}>
          <Sphere position={s.pos} args={[s.size, 32, 32]}>
            <MeshDistortMaterial
              color={s.color}
              distort={0.3}
              speed={s.speed}
              roughness={0.2}
              metalness={0.6}
              emissive={s.color}
              emissiveIntensity={0.5}
            />
          </Sphere>
        </Float>
      ))}
    </group>
  );
}

function ParticleRing() {
  const points = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const count = 800;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 3.5 + (Math.random() - 0.5) * 1.2;
      const spread = (Math.random() - 0.5) * 0.8;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = spread;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return positions;
  }, []);

  useFrame(({ clock }) => {
    if (!points.current) return;
    points.current.rotation.y = clock.getElapsedTime() * 0.06;
    points.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.1) * 0.05;
    // Tilt ring toward mouse
    points.current.rotation.z += (mouse.x * 0.15 - points.current.rotation.z) * 0.02;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[particles, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#60a5fa" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

// Camera subtly follows mouse
function CameraRig() {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.x += (mouse.x * 0.8 - camera.position.x) * 0.03;
    camera.position.y += (mouse.y * 0.5 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export function Hero3D() {
  return (
    // pointer-events-auto so mouse events reach the canvas
    <div className="absolute inset-0 pointer-events-auto cursor-none">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#60a5fa" />
        <pointLight position={[-10, -5, -8]} intensity={0.8} color="#7c3aed" />
        <pointLight position={[0, -10, 5]} intensity={0.5} color="#0ea5e9" />

        <CameraRig />
        <Stars radius={80} depth={50} count={1500} factor={3} fade speed={0.5} />
        <ParticleRing />
        <MainOrb />
        <OrbitingSpheres />
      </Canvas>
    </div>
  );
}
