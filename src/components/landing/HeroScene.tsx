'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Edges } from '@react-three/drei';

// ---------------------------------------------------------------------------
// Utility: remap a scroll sub-range [start, end] → [0, 1]
// ---------------------------------------------------------------------------
function scrollPhase(scroll: number, start: number, end: number): number {
  return THREE.MathUtils.clamp((scroll - start) / (end - start), 0, 1);
}

// ---------------------------------------------------------------------------
// Ground plane — always visible, fades in right at the start
// ---------------------------------------------------------------------------
function Ground({ scroll }: { scroll: number }) {
  const opacity = THREE.MathUtils.clamp(scroll * 5, 0.4, 1); // quick fade-in
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[12, 12]} />
      <meshStandardMaterial
        color="#c4956a"
        transparent
        opacity={opacity}
        roughness={0.9}
        metalness={0.05}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Walls — rise from ground during scroll 0 → 0.3
// ---------------------------------------------------------------------------
function Walls({ scroll }: { scroll: number }) {
  const t = scrollPhase(scroll, 0, 0.3);
  const scaleY = THREE.MathUtils.lerp(0, 1, t);
  const wallHeight = 2.4;
  const wallThickness = 0.12;
  const depth = 3;
  const width = 4;

  const wallMaterial = useMemo(
    () => (
      <meshStandardMaterial
        color="#e8ddd0"
        roughness={0.85}
        metalness={0.02}
      />
    ),
    [],
  );

  const edgeColor = '#b8a898';

  return (
    <group>
      {/* Back wall */}
      <mesh
        position={[0, (wallHeight * scaleY) / 2, -depth / 2]}
        scale={[1, scaleY, 1]}
      >
        <boxGeometry args={[width, wallHeight, wallThickness]} />
        {wallMaterial}
        <Edges color={edgeColor} lineWidth={1} />
      </mesh>

      {/* Left wall */}
      <mesh
        position={[-width / 2, (wallHeight * scaleY) / 2, 0]}
        scale={[1, scaleY, 1]}
      >
        <boxGeometry args={[wallThickness, wallHeight, depth]} />
        {wallMaterial}
        <Edges color={edgeColor} lineWidth={1} />
      </mesh>

      {/* Right wall */}
      <mesh
        position={[width / 2, (wallHeight * scaleY) / 2, 0]}
        scale={[1, scaleY, 1]}
      >
        <boxGeometry args={[wallThickness, wallHeight, depth]} />
        {wallMaterial}
        <Edges color={edgeColor} lineWidth={1} />
      </mesh>

      {/* Front wall (with gap for door — split into two halves) */}
      {/* Front-left */}
      <mesh
        position={[-(width / 4 + 0.35), (wallHeight * scaleY) / 2, depth / 2]}
        scale={[1, scaleY, 1]}
      >
        <boxGeometry args={[width / 2 - 0.7, wallHeight, wallThickness]} />
        {wallMaterial}
        <Edges color={edgeColor} lineWidth={1} />
      </mesh>
      {/* Front-right */}
      <mesh
        position={[(width / 4 + 0.35), (wallHeight * scaleY) / 2, depth / 2]}
        scale={[1, scaleY, 1]}
      >
        <boxGeometry args={[width / 2 - 0.7, wallHeight, wallThickness]} />
        {wallMaterial}
        <Edges color={edgeColor} lineWidth={1} />
      </mesh>
      {/* Front wall — lintel above door */}
      <mesh
        position={[0, wallHeight * scaleY - 0.3 * scaleY, depth / 2]}
        scale={[1, scaleY, 1]}
      >
        <boxGeometry args={[1.4, 0.6, wallThickness]} />
        {wallMaterial}
        <Edges color={edgeColor} lineWidth={1} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Roof — slides in from above during scroll 0.3 → 0.5
// ---------------------------------------------------------------------------
function Roof({ scroll }: { scroll: number }) {
  const t = scrollPhase(scroll, 0.3, 0.5);
  const yOffset = THREE.MathUtils.lerp(4, 0, t);
  const opacity = THREE.MathUtils.lerp(0, 1, t);

  if (t <= 0) return null;

  return (
    <mesh position={[0, 2.4 + 0.08 + yOffset, 0]}>
      <boxGeometry args={[4.6, 0.16, 3.6]} />
      <meshStandardMaterial
        color="#5a524c"
        roughness={0.8}
        metalness={0.1}
        transparent
        opacity={opacity}
      />
      <Edges color="#4a423c" lineWidth={1.2} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Windows & Door — fade in during scroll 0.5 → 0.7
// ---------------------------------------------------------------------------
function WindowsAndDoor({ scroll }: { scroll: number }) {
  const t = scrollPhase(scroll, 0.5, 0.7);
  const opacity = THREE.MathUtils.lerp(0, 0.45, t);
  const doorOpacity = THREE.MathUtils.lerp(0, 0.85, t);

  if (t <= 0) return null;

  const windowPositions: [number, number, number][] = [
    // Left wall windows
    [-2.0, 1.5, -0.6],
    [-2.0, 1.5, 0.6],
    // Right wall windows
    [2.0, 1.5, -0.6],
    [2.0, 1.5, 0.6],
    // Back wall windows
    [-1.0, 1.5, -1.5],
    [1.0, 1.5, -1.5],
  ];

  return (
    <group>
      {/* Windows on side walls */}
      {windowPositions.slice(0, 4).map((pos, i) => (
        <mesh key={`sw-${i}`} position={pos} rotation-y={Math.PI / 2}>
          <planeGeometry args={[0.7, 0.8]} />
          <meshStandardMaterial
            color="#a8c8e0"
            transparent
            opacity={opacity}
            roughness={0.15}
            metalness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Windows on back wall */}
      {windowPositions.slice(4).map((pos, i) => (
        <mesh key={`bw-${i}`} position={pos}>
          <planeGeometry args={[0.7, 0.8]} />
          <meshStandardMaterial
            color="#a8c8e0"
            transparent
            opacity={opacity}
            roughness={0.15}
            metalness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Door */}
      <mesh position={[0, 0.9, 1.51]}>
        <planeGeometry args={[1.0, 1.8]} />
        <meshStandardMaterial
          color="#8b6f4e"
          transparent
          opacity={doorOpacity}
          roughness={0.75}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Door frame edge (subtle) */}
      <mesh position={[0, 0.9, 1.52]}>
        <boxGeometry args={[1.1, 1.9, 0.02]} />
        <meshStandardMaterial
          color="#7a5f40"
          transparent
          opacity={doorOpacity * 0.5}
          roughness={0.9}
        />
        <Edges color="#6a5030" lineWidth={0.8} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Camera rig — orbits during scroll 0.7 → 1.0, otherwise static
// ---------------------------------------------------------------------------
function CameraRig({ scroll }: { scroll: number }) {
  const { camera } = useThree();
  const angleRef = useRef(Math.atan2(8, 8)); // starting angle ≈ π/4

  useFrame(() => {
    const radius = 11;
    const baseAngle = Math.PI / 4; // 45 degrees — matches initial [8, 5, 8]

    if (scroll <= 0.7) {
      // Static phase: smoothly interpolate to the base position
      const targetX = radius * Math.sin(baseAngle);
      const targetZ = radius * Math.cos(baseAngle);
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 5, 0.05);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);
      angleRef.current = baseAngle;
    } else {
      // Orbit phase: scroll 0.7 → 1.0 maps to ~120 degrees of rotation
      const orbitT = scrollPhase(scroll, 0.7, 1.0);
      const orbitAngle = baseAngle + orbitT * (Math.PI * 0.67);
      angleRef.current = THREE.MathUtils.lerp(angleRef.current, orbitAngle, 0.06);

      const targetX = radius * Math.sin(angleRef.current);
      const targetZ = radius * Math.cos(angleRef.current);
      const targetY = THREE.MathUtils.lerp(5, 3.5, orbitT); // lower slightly
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.06);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.06);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.06);
    }

    camera.lookAt(0, 1.0, 0);
  });

  return null;
}

// ---------------------------------------------------------------------------
// Inner scene — receives scroll as a prop
// ---------------------------------------------------------------------------
function ArchitecturalScene({ scroll }: { scroll: number }) {
  return (
    <>
      <color attach="background" args={['transparent']} />

      {/* Lighting */}
      <ambientLight intensity={0.5} color="#fff5eb" />
      <directionalLight
        position={[6, 10, 4]}
        intensity={0.9}
        color="#ffd699"
        castShadow
      />
      <directionalLight
        position={[-4, 6, -3]}
        intensity={0.25}
        color="#ffe0b2"
      />

      {/* Ground */}
      <Ground scroll={scroll} />

      {/* Structure */}
      <Walls scroll={scroll} />
      <Roof scroll={scroll} />
      <WindowsAndDoor scroll={scroll} />

      {/* Camera */}
      <CameraRig scroll={scroll} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Exported wrapper
// ---------------------------------------------------------------------------
export default function HeroScene({
  scrollProgress,
}: {
  scrollProgress: number;
}) {
  return (
    <Canvas
      camera={{ position: [8, 5, 8], fov: 40 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}
    >
      <ArchitecturalScene scroll={scrollProgress} />
    </Canvas>
  );
}
