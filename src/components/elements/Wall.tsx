'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import type { SceneObject } from '@/store/editorStore';

interface WallProps {
  obj: SceneObject;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const DEFAULTS = {
  height: 2.8,
  length: 3.0,
  thickness: 0.2,
} as const;

function WallComponent({ obj, isSelected, onSelect }: WallProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const height = obj.dimensions.height ?? DEFAULTS.height;
  const length = obj.dimensions.length ?? DEFAULTS.length;
  const thickness = obj.dimensions.thickness ?? DEFAULTS.thickness;

  const geometry = useMemo(
    () => new THREE.BoxGeometry(length, height, thickness),
    [length, height, thickness]
  );

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: obj.material.color || '#e8e0d8',
        roughness: obj.material.roughness ?? 0.85,
        metalness: obj.material.metalness ?? 0.05,
        opacity: obj.material.opacity ?? 1,
        transparent: obj.material.opacity < 1,
        side: THREE.DoubleSide,
      }),
    [
      obj.material.color,
      obj.material.roughness,
      obj.material.metalness,
      obj.material.opacity,
    ]
  );

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(obj.id);
  };

  if (!obj.visible) return null;

  return (
    <group
      position={obj.position}
      rotation={obj.rotation.map((r) => (r * Math.PI) / 180) as [number, number, number]}
      scale={obj.scale}
    >
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        onClick={handleClick}
        castShadow
        receiveShadow
        // Elevate so the wall sits on the ground plane (pivot at bottom)
        position={[0, height / 2, 0]}
      >
        {isSelected && (
          <Edges
            threshold={15}
            color="#4f9eff"
            lineWidth={2}
          />
        )}
      </mesh>

      {/* Emissive overlay when selected */}
      {isSelected && (
        <mesh
          geometry={geometry}
          position={[0, height / 2, 0]}
        >
          <meshStandardMaterial
            color="#4f9eff"
            emissive="#4f9eff"
            emissiveIntensity={0.15}
            transparent
            opacity={0.12}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

export const Wall = React.memo(WallComponent);
export default Wall;
