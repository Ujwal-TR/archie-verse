'use client';
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import type { SceneObject } from '@/store/editorStore';

interface RailingProps { obj: SceneObject; isSelected: boolean; onSelect: (id: string) => void; }

function RailingComponent({ obj, isSelected, onSelect }: RailingProps) {
  const length = obj.dimensions.length ?? 3;
  const height = obj.dimensions.height ?? 1;
  const postCount = obj.dimensions.postCount ?? 8;
  const postRadius = 0.02;
  const railRadius = 0.025;
  const color = obj.material.color || '#2a2a2a';

  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color, roughness: obj.material.roughness ?? 0.3, metalness: obj.material.metalness ?? 0.85,
    opacity: obj.material.opacity ?? 1, transparent: obj.material.opacity < 1,
  }), [color, obj.material.roughness, obj.material.metalness, obj.material.opacity]);

  const posts = useMemo(() => {
    const arr: { x: number }[] = [];
    for (let i = 0; i <= postCount; i++) {
      arr.push({ x: (i / postCount) * length - length / 2 });
    }
    return arr;
  }, [length, postCount]);

  if (!obj.visible) return null;
  const selColor = isSelected ? '#4f9eff' : undefined;

  return (
    <group position={obj.position} rotation={obj.rotation.map((r) => (r * Math.PI) / 180) as [number, number, number]} scale={obj.scale}
      onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(obj.id); }}>
      {/* Top rail */}
      <mesh position={[0, height, 0]} material={material} castShadow>
        <boxGeometry args={[length + 0.05, railRadius * 2, railRadius * 2]} />
      </mesh>
      {/* Middle rail */}
      <mesh position={[0, height * 0.5, 0]} material={material} castShadow>
        <boxGeometry args={[length + 0.05, railRadius * 1.5, railRadius * 1.5]} />
      </mesh>
      {/* Posts */}
      {posts.map((p, i) => (
        <mesh key={i} position={[p.x, height / 2, 0]} material={material} castShadow>
          <cylinderGeometry args={[postRadius, postRadius, height, 8]} />
        </mesh>
      ))}
      {isSelected && (
        <mesh position={[0, height / 2, 0]}>
          <boxGeometry args={[length + 0.1, height + 0.1, 0.1]} />
          <meshStandardMaterial color="#4f9eff" emissive="#4f9eff" emissiveIntensity={0.15} transparent opacity={0.1} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}
export const Railing = React.memo(RailingComponent);
export default Railing;
