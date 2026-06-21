'use client';
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import type { SceneObject } from '@/store/editorStore';

interface BathroomProps { obj: SceneObject; isSelected: boolean; onSelect: (id: string) => void; }

function BathroomComponent({ obj, isSelected, onSelect }: BathroomProps) {
  const subType = obj.subType || 'bathtub';
  const color = obj.material.color || '#f0ece4';
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color, roughness: obj.material.roughness ?? 0.3, metalness: obj.material.metalness ?? 0.1,
    opacity: obj.material.opacity ?? 1, transparent: obj.material.opacity < 1,
  }), [color, obj.material.roughness, obj.material.metalness, obj.material.opacity]);

  if (!obj.visible) return null;

  const onClick = (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(obj.id); };

  return (
    <group position={obj.position} rotation={obj.rotation.map((r) => (r * Math.PI) / 180) as [number, number, number]} scale={obj.scale}>
      {subType === 'bathtub' && (
        <group onClick={onClick}>
          {/* Outer shell */}
          <mesh position={[0, 0.3, 0]} material={mat} castShadow receiveShadow>
            <boxGeometry args={[1.7, 0.6, 0.75]} />
            {isSelected && <Edges threshold={15} color="#4f9eff" lineWidth={2} />}
          </mesh>
          {/* Inner cavity */}
          <mesh position={[0, 0.38, 0]}>
            <boxGeometry args={[1.5, 0.5, 0.55]} />
            <meshStandardMaterial color="#dfe6ed" roughness={0.2} metalness={0.05} />
          </mesh>
        </group>
      )}
      {subType === 'toilet' && (
        <group onClick={onClick}>
          {/* Base */}
          <mesh position={[0, 0.2, 0]} material={mat} castShadow>
            <boxGeometry args={[0.4, 0.4, 0.55]} />
            {isSelected && <Edges threshold={15} color="#4f9eff" lineWidth={2} />}
          </mesh>
          {/* Tank */}
          <mesh position={[0, 0.45, -0.2]} material={mat} castShadow>
            <boxGeometry args={[0.35, 0.5, 0.18]} />
          </mesh>
          {/* Seat */}
          <mesh position={[0, 0.42, 0.05]} material={mat}>
            <cylinderGeometry args={[0.18, 0.18, 0.04, 16]} />
          </mesh>
        </group>
      )}
      {subType === 'sink' && (
        <group onClick={onClick}>
          {/* Pedestal */}
          <mesh position={[0, 0.4, 0]} material={mat} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 0.8, 12]} />
            {isSelected && <Edges threshold={15} color="#4f9eff" lineWidth={2} />}
          </mesh>
          {/* Basin */}
          <mesh position={[0, 0.82, 0]} material={mat} castShadow>
            <cylinderGeometry args={[0.25, 0.2, 0.12, 16]} />
          </mesh>
        </group>
      )}
      {isSelected && (
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[1.8, 0.8, 0.8]} />
          <meshStandardMaterial color="#4f9eff" emissive="#4f9eff" emissiveIntensity={0.12} transparent opacity={0.08} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}
export const Bathroom = React.memo(BathroomComponent);
export default Bathroom;
