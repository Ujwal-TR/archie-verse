'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Edges, Float } from '@react-three/drei';

/* Wireframe building that slowly rotates */
function WireframeBuilding() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  const edgeColor = '#6366f1';
  const edgeColor2 = '#818cf8';

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      {/* Main building body */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[3, 3, 2]} />
        <meshStandardMaterial color="#0f0f1a" transparent opacity={0.15} />
        <Edges color={edgeColor} lineWidth={1.5} />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 3.3, 0]}>
        <boxGeometry args={[3.4, 0.15, 2.4]} />
        <meshStandardMaterial color="#0f0f1a" transparent opacity={0.1} />
        <Edges color={edgeColor2} lineWidth={1} />
      </mesh>

      {/* Floor */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[4, 0.1, 3]} />
        <meshStandardMaterial color="#0f0f1a" transparent opacity={0.1} />
        <Edges color={edgeColor} lineWidth={1} />
      </mesh>

      {/* Windows left */}
      {[-0.8, 0.8].map((y) =>
        [-0.5, 0.5].map((z) => (
          <mesh key={`wl-${y}-${z}`} position={[-1.51, y + 1.5, z]}>
            <planeGeometry args={[0.6, 0.5]} />
            <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.3} transparent opacity={0.15} side={THREE.DoubleSide} />
          </mesh>
        ))
      )}

      {/* Windows right */}
      {[-0.8, 0.8].map((y) =>
        [-0.5, 0.5].map((z) => (
          <mesh key={`wr-${y}-${z}`} position={[1.51, y + 1.5, z]}>
            <planeGeometry args={[0.6, 0.5]} />
            <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.3} transparent opacity={0.15} side={THREE.DoubleSide} />
          </mesh>
        ))
      )}

      {/* Door */}
      <mesh position={[0, 0.55, 1.01]}>
        <boxGeometry args={[0.6, 1.1, 0.02]} />
        <meshStandardMaterial color="#0f0f1a" transparent opacity={0.3} />
        <Edges color={edgeColor2} lineWidth={1} />
      </mesh>

      {/* Side extension */}
      <mesh position={[2.5, 0.75, 0]}>
        <boxGeometry args={[2, 1.5, 1.5]} />
        <meshStandardMaterial color="#0f0f1a" transparent opacity={0.1} />
        <Edges color={edgeColor2} lineWidth={1} />
      </mesh>

      {/* Extension roof */}
      <mesh position={[2.5, 1.55, 0]}>
        <boxGeometry args={[2.3, 0.1, 1.8]} />
        <meshStandardMaterial color="#0f0f1a" transparent opacity={0.08} />
        <Edges color={edgeColor} lineWidth={1} />
      </mesh>
    </group>
  );
}

/* Floating particles */
function Particles() {
  const count = 60;
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 16,
        y: (Math.random() - 0.5) * 10,
        z: (Math.random() - 0.5) * 10,
        speed: 0.1 + Math.random() * 0.3,
        scale: 0.02 + Math.random() * 0.04,
      });
    }
    return arr;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    for (let i = 0; i < count; i++) {
      const p = particles[i];
      p.y += p.speed * delta;
      if (p.y > 5) p.y = -5;
      dummy.position.set(p.x, p.y, p.z);
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#6366f1" transparent opacity={0.4} />
    </instancedMesh>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [6, 4, 6], fov: 40 }}
      dpr={[1, 1.5]}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={['transparent']} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={0.6} color="#a5b4fc" />
      <directionalLight position={[-3, 5, -3]} intensity={0.3} color="#c084fc" />

      <Float speed={1} rotationIntensity={0} floatIntensity={0.3}>
        <WireframeBuilding />
      </Float>
      <Particles />
    </Canvas>
  );
}
