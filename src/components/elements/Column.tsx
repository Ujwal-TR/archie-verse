'use client';
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import type { SceneObject } from '@/store/editorStore';

interface ColumnProps { obj: SceneObject; isSelected: boolean; onSelect: (id: string) => void; }

function ColumnComponent({ obj, isSelected, onSelect }: ColumnProps) {
  const radius = obj.dimensions.radius ?? 0.2;
  const height = obj.dimensions.height ?? 3;

  const geometry = useMemo(() => new THREE.CylinderGeometry(radius, radius, height, 24), [radius, height]);
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: obj.material.color || '#c8c0b8', roughness: obj.material.roughness ?? 0.85,
    metalness: obj.material.metalness ?? 0.05, opacity: obj.material.opacity ?? 1,
    transparent: obj.material.opacity < 1,
  }), [obj.material.color, obj.material.roughness, obj.material.metalness, obj.material.opacity]);

  if (!obj.visible) return null;
  return (
    <group position={obj.position} rotation={obj.rotation.map((r) => (r * Math.PI) / 180) as [number, number, number]} scale={obj.scale}>
      <mesh geometry={geometry} material={material} position={[0, height / 2, 0]} castShadow receiveShadow
        onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(obj.id); }}>
        {isSelected && <Edges threshold={15} color="#4f9eff" lineWidth={2} />}
      </mesh>
      {isSelected && (
        <mesh geometry={geometry} position={[0, height / 2, 0]}>
          <meshStandardMaterial color="#4f9eff" emissive="#4f9eff" emissiveIntensity={0.15} transparent opacity={0.12} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}
export const Column = React.memo(ColumnComponent);
export default Column;
