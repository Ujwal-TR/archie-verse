'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import type { SceneObject } from '@/store/editorStore';

interface DoorProps {
  obj: SceneObject;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const DEFAULTS = {
  width: 0.9,
  height: 2.1,
  thickness: 0.04,
  frameThickness: 0.05,
  frameDepth: 0.1,
} as const;

function DoorComponent({ obj, isSelected, onSelect }: DoorProps) {
  const groupRef = useRef<THREE.Group>(null);

  const width = obj.dimensions.width ?? DEFAULTS.width;
  const height = obj.dimensions.height ?? DEFAULTS.height;
  const thickness = obj.dimensions.thickness ?? DEFAULTS.thickness;
  const frameThickness = obj.dimensions.frameThickness ?? DEFAULTS.frameThickness;
  const frameDepth = obj.dimensions.frameDepth ?? DEFAULTS.frameDepth;

  const doorColor = obj.material.color || '#5c4033';
  const frameColor = '#8a8a8a';

  // Door panel geometry
  const panelGeo = useMemo(
    () => new THREE.BoxGeometry(width, height, thickness),
    [width, height, thickness]
  );

  // Frame pieces
  const frameLeftGeo = useMemo(
    () => new THREE.BoxGeometry(frameThickness, height + frameThickness, frameDepth),
    [frameThickness, height, frameDepth]
  );
  const frameRightGeo = useMemo(
    () => new THREE.BoxGeometry(frameThickness, height + frameThickness, frameDepth),
    [frameThickness, height, frameDepth]
  );
  const frameTopGeo = useMemo(
    () => new THREE.BoxGeometry(width + frameThickness * 2, frameThickness, frameDepth),
    [width, frameThickness, frameDepth]
  );

  const doorMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: doorColor,
        roughness: obj.material.roughness ?? 0.6,
        metalness: obj.material.metalness ?? 0.05,
        opacity: obj.material.opacity ?? 1,
        transparent: obj.material.opacity < 1,
      }),
    [doorColor, obj.material.roughness, obj.material.metalness, obj.material.opacity]
  );

  const frameMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: frameColor,
        roughness: 0.4,
        metalness: 0.6,
      }),
    []
  );

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(obj.id);
  };

  if (!obj.visible) return null;

  const halfWidth = width / 2;
  const halfHeight = height / 2;

  return (
    <group
      ref={groupRef}
      position={obj.position}
      rotation={obj.rotation.map((r) => (r * Math.PI) / 180) as [number, number, number]}
      scale={obj.scale}
    >
      {/* Door panel */}
      <mesh
        geometry={panelGeo}
        material={doorMaterial}
        position={[0, halfHeight, 0]}
        onClick={handleClick}
        castShadow
        receiveShadow
      >
        {isSelected && <Edges threshold={15} color="#4f9eff" lineWidth={2} />}
      </mesh>

      {/* Door knob (small sphere) */}
      <mesh
        position={[halfWidth - 0.08, halfHeight, thickness / 2 + 0.015]}
        onClick={handleClick}
        castShadow
      >
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshStandardMaterial color="#c0a050" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Frame - Left */}
      <mesh
        geometry={frameLeftGeo}
        material={frameMaterial}
        position={[-(halfWidth + frameThickness / 2), halfHeight - frameThickness / 2, 0]}
        onClick={handleClick}
        castShadow
      >
        {isSelected && <Edges threshold={15} color="#4f9eff" lineWidth={1.5} />}
      </mesh>

      {/* Frame - Right */}
      <mesh
        geometry={frameRightGeo}
        material={frameMaterial}
        position={[halfWidth + frameThickness / 2, halfHeight - frameThickness / 2, 0]}
        onClick={handleClick}
        castShadow
      >
        {isSelected && <Edges threshold={15} color="#4f9eff" lineWidth={1.5} />}
      </mesh>

      {/* Frame - Top */}
      <mesh
        geometry={frameTopGeo}
        material={frameMaterial}
        position={[0, height + frameThickness / 2, 0]}
        onClick={handleClick}
        castShadow
      >
        {isSelected && <Edges threshold={15} color="#4f9eff" lineWidth={1.5} />}
      </mesh>

      {/* Selection glow overlay */}
      {isSelected && (
        <mesh
          geometry={panelGeo}
          position={[0, halfHeight, 0]}
        >
          <meshStandardMaterial
            color="#4f9eff"
            emissive="#4f9eff"
            emissiveIntensity={0.2}
            transparent
            opacity={0.1}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

export const Door = React.memo(DoorComponent);
export default Door;
