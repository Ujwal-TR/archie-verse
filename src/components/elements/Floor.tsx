'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import type { SceneObject } from '@/store/editorStore';

interface FloorProps {
  obj: SceneObject;
  isSelected: boolean;
  onSelect: (id: string, multiSelect?: boolean) => void;
}

const DEFAULTS = {
  width: 6.0,
  depth: 6.0,
  thickness: 0.15,
} as const;

function FloorComponent({ obj, isSelected, onSelect }: FloorProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const width = obj.dimensions.width ?? DEFAULTS.width;
  const depth = obj.dimensions.depth ?? DEFAULTS.depth;
  const thickness = obj.dimensions.thickness ?? DEFAULTS.thickness;

  const geometry = useMemo(
    () => new THREE.BoxGeometry(width, thickness, depth),
    [width, depth, thickness]
  );

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: obj.material.color || '#b5882c',
        roughness: obj.material.roughness ?? 0.7,
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
    onSelect(obj.id, e.ctrlKey || e.metaKey || e.shiftKey);
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
        receiveShadow
        // Center the slab so the top surface is at y=0
        position={[0, -thickness / 2, 0]}
      >
        {isSelected && (
          <Edges threshold={15} color="#4f9eff" lineWidth={2} />
        )}
      </mesh>

      {/* Grid-pattern lines on the floor surface to hint at planks / tiles */}
      <group position={[0, 0.001, 0]}>
        {useMemo(() => {
          const lines: React.JSX.Element[] = [];
          const plankWidth = 0.15; // 15cm planks
          const halfW = width / 2;
          const halfD = depth / 2;

          // Longitudinal plank lines
          for (let x = -halfW + plankWidth; x < halfW; x += plankWidth) {
            const pts = [
              new THREE.Vector3(x, 0, -halfD),
              new THREE.Vector3(x, 0, halfD),
            ];
            const geo = new THREE.BufferGeometry().setFromPoints(pts);
            const mat = new THREE.LineBasicMaterial({
              color: '#8a6b1a',
              transparent: true,
              opacity: 0.2,
            });
            const lineObj = new THREE.Line(geo, mat);
            lines.push(
              <primitive key={`px-${x}`} object={lineObj} />
            );
          }
          return lines;
        }, [width, depth])}
      </group>

      {/* Selection highlight overlay */}
      {isSelected && (
        <mesh
          geometry={geometry}
          position={[0, -thickness / 2, 0]}
        >
          <meshStandardMaterial
            color="#4f9eff"
            emissive="#4f9eff"
            emissiveIntensity={0.15}
            transparent
            opacity={0.1}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

export const Floor = React.memo(FloorComponent);
export default Floor;
