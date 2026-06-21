'use client';
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import type { SceneObject } from '@/store/editorStore';

interface DecorProps { obj: SceneObject; isSelected: boolean; onSelect: (id: string, multiSelect?: boolean) => void; }

function DecorComponent({ obj, isSelected, onSelect }: DecorProps) {
  const subType = obj.subType || 'plant';
  const color = obj.material.color || '#4ade80';
  if (!obj.visible) return null;
  const onClick = (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(obj.id, e.ctrlKey || e.metaKey || e.shiftKey); };

  return (
    <group position={obj.position} rotation={obj.rotation.map((r) => (r * Math.PI) / 180) as [number, number, number]} scale={obj.scale}>
      {subType === 'plant' && (
        <group onClick={onClick}>
          {/* Pot */}
          <mesh position={[0, 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.12, 0.3, 12]} />
            <meshStandardMaterial color="#8B4513" roughness={0.9} metalness={0} />
          </mesh>
          {/* Soil */}
          <mesh position={[0, 0.31, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 0.02, 12]} />
            <meshStandardMaterial color="#3d2b1f" roughness={1} />
          </mesh>
          {/* Foliage sphere */}
          <mesh position={[0, 0.6, 0]} castShadow>
            <sphereGeometry args={[0.25, 12, 12]} />
            <meshStandardMaterial color="#22c55e" roughness={0.8} metalness={0} />
            {isSelected && <Edges threshold={15} color="#4f9eff" lineWidth={2} />}
          </mesh>
        </group>
      )}
      {subType === 'bookshelf' && (
        <group onClick={onClick}>
          {/* Frame */}
          <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.8, 1.8, 0.3]} />
            <meshStandardMaterial color="#5c4033" roughness={0.7} metalness={0.05} />
            {isSelected && <Edges threshold={15} color="#4f9eff" lineWidth={2} />}
          </mesh>
          {/* Shelves */}
          {[0.3, 0.7, 1.1, 1.5].map((y) => (
            <mesh key={y} position={[0, y, 0]}>
              <boxGeometry args={[0.76, 0.02, 0.28]} />
              <meshStandardMaterial color="#4a3728" roughness={0.7} />
            </mesh>
          ))}
          {/* Some books (colored blocks) */}
          {[
            { x: -0.2, y: 0.48, c: '#ef4444' },
            { x: 0, y: 0.48, c: '#3b82f6' },
            { x: 0.15, y: 0.48, c: '#eab308' },
            { x: -0.15, y: 0.88, c: '#22c55e' },
            { x: 0.1, y: 0.88, c: '#8b5cf6' },
          ].map((b, i) => (
            <mesh key={i} position={[b.x, b.y, 0]}>
              <boxGeometry args={[0.12, 0.3, 0.2]} />
              <meshStandardMaterial color={b.c} roughness={0.6} />
            </mesh>
          ))}
        </group>
      )}
      {subType === 'tv' && (
        <group onClick={onClick}>
          {/* Screen */}
          <mesh position={[0, 0.9, 0]} castShadow>
            <boxGeometry args={[1.2, 0.7, 0.04]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.1} metalness={0.5} />
            {isSelected && <Edges threshold={15} color="#4f9eff" lineWidth={2} />}
          </mesh>
          {/* Stand neck */}
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[0.05, 0.15, 0.05]} />
            <meshStandardMaterial color="#333" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Stand base */}
          <mesh position={[0, 0.42, 0]}>
            <boxGeometry args={[0.4, 0.02, 0.2]} />
            <meshStandardMaterial color="#333" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      )}
      {subType === 'rug' && (
        <group onClick={onClick}>
          <mesh position={[0, 0.005, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[obj.dimensions.width ?? 2, obj.dimensions.depth ?? 1.5]} />
            <meshStandardMaterial color={color} roughness={0.95} metalness={0} side={THREE.DoubleSide} />
            {isSelected && <Edges threshold={15} color="#4f9eff" lineWidth={2} />}
          </mesh>
        </group>
      )}
      {isSelected && subType !== 'rug' && (
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1.4, 1.4, 0.5]} />
          <meshStandardMaterial color="#4f9eff" emissive="#4f9eff" emissiveIntensity={0.12} transparent opacity={0.06} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}
export const Decor = React.memo(DecorComponent);
export default Decor;
