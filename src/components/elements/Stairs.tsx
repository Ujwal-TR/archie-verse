'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import type { SceneObject } from '@/store/editorStore';

interface StairsProps {
  obj: SceneObject;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const DEFAULTS = {
  steps: 12,
  width: 1.0,
  totalHeight: 2.8,
  totalDepth: 3.6, // run: how far forward the staircase extends
} as const;

interface StepData {
  width: number;
  stepHeight: number;
  stepDepth: number;
  x: number;
  y: number;
  z: number;
}

function StairsComponent({ obj, isSelected, onSelect }: StairsProps) {
  const groupRef = useRef<THREE.Group>(null);

  const steps = Math.max(2, Math.round(obj.dimensions.steps ?? DEFAULTS.steps));
  const width = obj.dimensions.width ?? DEFAULTS.width;
  const totalHeight = obj.dimensions.totalHeight ?? DEFAULTS.totalHeight;
  const totalDepth = obj.dimensions.totalDepth ?? DEFAULTS.totalDepth;

  const stairColor = obj.material.color || '#c8c0b8';

  const stepHeight = totalHeight / steps;
  const stepDepth = totalDepth / steps;

  // Pre-calculate all step positions
  const stepsData: StepData[] = useMemo(() => {
    const data: StepData[] = [];
    for (let i = 0; i < steps; i++) {
      data.push({
        width,
        stepHeight,
        stepDepth,
        x: 0,
        y: stepHeight * i + stepHeight / 2,
        z: -stepDepth * i,
      });
    }
    return data;
  }, [steps, width, stepHeight, stepDepth]);

  const stepGeo = useMemo(
    () => new THREE.BoxGeometry(width, stepHeight, stepDepth),
    [width, stepHeight, stepDepth]
  );

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: stairColor,
        roughness: obj.material.roughness ?? 0.75,
        metalness: obj.material.metalness ?? 0.05,
        opacity: obj.material.opacity ?? 1,
        transparent: obj.material.opacity < 1,
      }),
    [stairColor, obj.material.roughness, obj.material.metalness, obj.material.opacity]
  );

  // Side stringer geometry (the angled side panels)
  const stringerGeo = useMemo(() => {
    const stringerThickness = 0.03;
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0, totalHeight);
    shape.lineTo(-totalDepth + stepDepth, totalHeight);
    shape.lineTo(-totalDepth + stepDepth, totalHeight - stepHeight);
    shape.lineTo(0, 0);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      steps: 1,
      depth: stringerThickness,
      bevelEnabled: false,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [totalHeight, totalDepth, stepDepth, stepHeight]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(obj.id);
  };

  if (!obj.visible) return null;

  return (
    <group
      ref={groupRef}
      position={obj.position}
      rotation={obj.rotation.map((r) => (r * Math.PI) / 180) as [number, number, number]}
      scale={obj.scale}
    >
      {/* Steps */}
      {stepsData.map((step, i) => (
        <mesh
          key={i}
          geometry={stepGeo}
          material={material}
          position={[step.x, step.y, step.z]}
          onClick={handleClick}
          castShadow
          receiveShadow
        >
          {isSelected && i === 0 && (
            <Edges threshold={15} color="#4f9eff" lineWidth={2} />
          )}
        </mesh>
      ))}

      {/* Left stringer */}
      <mesh
        geometry={stringerGeo}
        material={material}
        position={[width / 2, 0, stepDepth / 2]}
        castShadow
      />

      {/* Right stringer */}
      <mesh
        geometry={stringerGeo}
        material={material}
        position={[-(width / 2) - 0.03, 0, stepDepth / 2]}
        castShadow
      />

      {/* Selection overlay on all steps */}
      {isSelected &&
        stepsData.map((step, i) => (
          <mesh
            key={`sel-${i}`}
            geometry={stepGeo}
            position={[step.x, step.y, step.z]}
          >
            <meshStandardMaterial
              color="#4f9eff"
              emissive="#4f9eff"
              emissiveIntensity={0.15}
              transparent
              opacity={0.1}
              depthWrite={false}
            />
          </mesh>
        ))}
    </group>
  );
}

export const Stairs = React.memo(StairsComponent);
export default Stairs;
