'use client';
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import type { SceneObject } from '@/store/editorStore';

interface KitchenProps { obj: SceneObject; isSelected: boolean; onSelect: (id: string) => void; }

function KitchenComponent({ obj, isSelected, onSelect }: KitchenProps) {
  const subType = obj.subType || 'counter';
  const w = obj.dimensions.width ?? 2;
  const d = obj.dimensions.depth ?? 0.6;
  const h = obj.dimensions.height ?? 0.9;
  const color = obj.material.color || '#94a3b8';

  const bodyMat = useMemo(() => new THREE.MeshStandardMaterial({
    color, roughness: obj.material.roughness ?? 0.5, metalness: obj.material.metalness ?? 0.1,
    opacity: obj.material.opacity ?? 1, transparent: obj.material.opacity < 1,
  }), [color, obj.material.roughness, obj.material.metalness, obj.material.opacity]);

  const topMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#2d2d2d', roughness: 0.15, metalness: 0.3,
  }), []);

  if (!obj.visible) return null;
  const onClick = (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(obj.id); };

  return (
    <group position={obj.position} rotation={obj.rotation.map((r) => (r * Math.PI) / 180) as [number, number, number]} scale={obj.scale}>
      {subType === 'counter' && (
        <group onClick={onClick}>
          <mesh position={[0, h / 2, 0]} material={bodyMat} castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
            {isSelected && <Edges threshold={15} color="#4f9eff" lineWidth={2} />}
          </mesh>
          {/* Granite top */}
          <mesh position={[0, h + 0.015, 0]} material={topMat} castShadow>
            <boxGeometry args={[w + 0.02, 0.03, d + 0.02]} />
          </mesh>
        </group>
      )}
      {subType === 'cabinet' && (
        <group onClick={onClick}>
          <mesh position={[0, h / 2, 0]} material={bodyMat} castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
            {isSelected && <Edges threshold={15} color="#4f9eff" lineWidth={2} />}
          </mesh>
          {/* Door line */}
          <mesh position={[0, h / 2, d / 2 + 0.001]}>
            <planeGeometry args={[0.01, h * 0.85]} />
            <meshBasicMaterial color="#1a1a1a" />
          </mesh>
          {/* Handle */}
          <mesh position={[0.06, h / 2, d / 2 + 0.015]}>
            <boxGeometry args={[0.02, 0.1, 0.02]} />
            <meshStandardMaterial color="#888" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      )}
      {subType === 'fridge' && (
        <group onClick={onClick}>
          {/* Main body */}
          <mesh position={[0, 0.9, 0]} material={bodyMat} castShadow receiveShadow>
            <boxGeometry args={[0.8, 1.8, 0.7]} />
            {isSelected && <Edges threshold={15} color="#4f9eff" lineWidth={2} />}
          </mesh>
          {/* Freezer line */}
          <mesh position={[0, 1.5, 0.351]}>
            <planeGeometry args={[0.75, 0.01]} />
            <meshBasicMaterial color="#1a1a1a" />
          </mesh>
          {/* Handle */}
          <mesh position={[0.32, 1.1, 0.37]}>
            <boxGeometry args={[0.02, 0.25, 0.02]} />
            <meshStandardMaterial color="#666" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      )}
    </group>
  );
}
export const Kitchen = React.memo(KitchenComponent);
export default Kitchen;
