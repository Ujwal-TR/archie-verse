'use client';
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import type { SceneObject } from '@/store/editorStore';

interface BeamProps { obj: SceneObject; isSelected: boolean; onSelect: (id: string) => void; }

function BeamComponent({ obj, isSelected, onSelect }: BeamProps) {
  const length = obj.dimensions.length ?? 4;
  const h = obj.dimensions.height ?? 0.3;
  const d = obj.dimensions.depth ?? 0.3;
  const elevation = obj.dimensions.elevation ?? 2.8;

  const geometry = useMemo(() => new THREE.BoxGeometry(length, h, d), [length, h, d]);
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: obj.material.color || '#8a8a8a', roughness: obj.material.roughness ?? 0.35,
    metalness: obj.material.metalness ?? 0.8, opacity: obj.material.opacity ?? 1,
    transparent: obj.material.opacity < 1,
  }), [obj.material.color, obj.material.roughness, obj.material.metalness, obj.material.opacity]);

  if (!obj.visible) return null;
  return (
    <group position={obj.position} rotation={obj.rotation.map((r) => (r * Math.PI) / 180) as [number, number, number]} scale={obj.scale}>
      <mesh geometry={geometry} material={material} position={[0, elevation, 0]} castShadow receiveShadow
        onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(obj.id); }}>
        {isSelected && <Edges threshold={15} color="#4f9eff" lineWidth={2} />}
      </mesh>
      {isSelected && (
        <mesh geometry={geometry} position={[0, elevation, 0]}>
          <meshStandardMaterial color="#4f9eff" emissive="#4f9eff" emissiveIntensity={0.15} transparent opacity={0.12} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}
export const Beam = React.memo(BeamComponent);
export default Beam;
