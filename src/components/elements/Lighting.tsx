'use client';
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import type { SceneObject } from '@/store/editorStore';

interface LightingProps { obj: SceneObject; isSelected: boolean; onSelect: (id: string) => void; }

function LightingComponent({ obj, isSelected, onSelect }: LightingProps) {
  const subType = obj.subType || 'floorLamp';
  const onClick = (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(obj.id); };
  const warmWhite = '#fff9e0';

  if (!obj.visible) return null;

  return (
    <group position={obj.position} rotation={obj.rotation.map((r) => (r * Math.PI) / 180) as [number, number, number]} scale={obj.scale}>
      {subType === 'floorLamp' && (
        <group onClick={onClick}>
          {/* Base disc */}
          <mesh position={[0, 0.02, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.18, 0.04, 16]} />
            <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.8} />
          </mesh>
          {/* Pole */}
          <mesh position={[0, 0.75, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 1.5, 8]} />
            <meshStandardMaterial color="#3a3a3a" roughness={0.3} metalness={0.9} />
          </mesh>
          {/* Light globe */}
          <mesh position={[0, 1.55, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color={warmWhite} emissive={warmWhite} emissiveIntensity={0.8} transparent opacity={0.9} />
          </mesh>
          {/* Actual point light */}
          <pointLight position={[0, 1.55, 0]} color={warmWhite} intensity={2} distance={5} />
        </group>
      )}
      {subType === 'ceilingLight' && (
        <group onClick={onClick}>
          {/* Canopy */}
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.03, 12]} />
            <meshStandardMaterial color="#2a2a2a" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Rod */}
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.005, 0.005, 0.3, 6]} />
            <meshStandardMaterial color="#3a3a3a" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Light disc */}
          <mesh position={[0, -0.32, 0]}>
            <cylinderGeometry args={[0.2, 0.22, 0.04, 24]} />
            <meshStandardMaterial color={warmWhite} emissive={warmWhite} emissiveIntensity={0.6} transparent opacity={0.85} />
          </mesh>
          <pointLight position={[0, -0.35, 0]} color={warmWhite} intensity={3} distance={6} />
        </group>
      )}
      {isSelected && (
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[0.4, 12, 12]} />
          <meshStandardMaterial color="#4f9eff" emissive="#4f9eff" emissiveIntensity={0.12} transparent opacity={0.08} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}
export const Lighting = React.memo(LightingComponent);
export default Lighting;
