'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import type { SceneObject } from '@/store/editorStore';

interface WindowProps {
  obj: SceneObject;
  isSelected: boolean;
  onSelect: (id: string, multiSelect?: boolean) => void;
}

const DEFAULTS = {
  width: 1.2,
  height: 1.0,
  frameThickness: 0.04,
  frameDepth: 0.08,
  glassThickness: 0.006,
  sillHeight: 0.9,
} as const;

function WindowComponent({ obj, isSelected, onSelect }: WindowProps) {
  const groupRef = useRef<THREE.Group>(null);

  const width = obj.dimensions.width ?? DEFAULTS.width;
  const height = obj.dimensions.height ?? DEFAULTS.height;
  const frameThickness = obj.dimensions.frameThickness ?? DEFAULTS.frameThickness;
  const frameDepth = obj.dimensions.frameDepth ?? DEFAULTS.frameDepth;
  const glassThickness = obj.dimensions.glassThickness ?? DEFAULTS.glassThickness;
  const sillHeight = obj.dimensions.sillHeight ?? DEFAULTS.sillHeight;

  const frameColor = '#a0a0a8'; // Aluminum
  const glassColor = obj.material.color || '#88bbee';

  // Frame pieces
  const frameLeftGeo = useMemo(
    () => new THREE.BoxGeometry(frameThickness, height, frameDepth),
    [frameThickness, height, frameDepth]
  );
  const frameRightGeo = useMemo(
    () => new THREE.BoxGeometry(frameThickness, height, frameDepth),
    [frameThickness, height, frameDepth]
  );
  const frameTopGeo = useMemo(
    () => new THREE.BoxGeometry(width + frameThickness * 2, frameThickness, frameDepth),
    [width, frameThickness, frameDepth]
  );
  const frameBottomGeo = useMemo(
    () => new THREE.BoxGeometry(width + frameThickness * 2, frameThickness, frameDepth + 0.02),
    [width, frameThickness, frameDepth]
  );
  // Horizontal center divider
  const frameDividerHGeo = useMemo(
    () => new THREE.BoxGeometry(width, frameThickness * 0.6, frameDepth * 0.6),
    [width, frameThickness, frameDepth]
  );
  // Vertical center divider
  const frameDividerVGeo = useMemo(
    () => new THREE.BoxGeometry(frameThickness * 0.6, height, frameDepth * 0.6),
    [frameThickness, height, frameDepth]
  );

  // Glass pane
  const glassGeo = useMemo(
    () => new THREE.BoxGeometry(width, height, glassThickness),
    [width, height, glassThickness]
  );

  const frameMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: frameColor,
        roughness: 0.3,
        metalness: 0.7,
      }),
    []
  );

  const glassMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: glassColor,
        roughness: 0.05,
        metalness: 0.0,
        transmission: 0.9,
        transparent: true,
        opacity: obj.material.opacity ?? 0.35,
        ior: 1.5,
        thickness: 0.01,
        side: THREE.DoubleSide,
      }),
    [glassColor, obj.material.opacity]
  );

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(obj.id, e.ctrlKey || e.metaKey || e.shiftKey);
  };

  if (!obj.visible) return null;

  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const cy = sillHeight + halfHeight; // center Y of the window

  return (
    <group
      ref={groupRef}
      position={obj.position}
      rotation={obj.rotation.map((r) => (r * Math.PI) / 180) as [number, number, number]}
      scale={obj.scale}
    >
      {/* Glass pane */}
      <mesh
        geometry={glassGeo}
        material={glassMat}
        position={[0, cy, 0]}
        onClick={handleClick}
      >
        {isSelected && <Edges threshold={15} color="#4f9eff" lineWidth={2} />}
      </mesh>

      {/* Frame - Left */}
      <mesh
        geometry={frameLeftGeo}
        material={frameMat}
        position={[-(halfWidth + frameThickness / 2), cy, 0]}
        onClick={handleClick}
        castShadow
      />

      {/* Frame - Right */}
      <mesh
        geometry={frameRightGeo}
        material={frameMat}
        position={[halfWidth + frameThickness / 2, cy, 0]}
        onClick={handleClick}
        castShadow
      />

      {/* Frame - Top */}
      <mesh
        geometry={frameTopGeo}
        material={frameMat}
        position={[0, cy + halfHeight + frameThickness / 2, 0]}
        onClick={handleClick}
        castShadow
      />

      {/* Frame - Bottom (sill, slightly deeper) */}
      <mesh
        geometry={frameBottomGeo}
        material={frameMat}
        position={[0, cy - halfHeight - frameThickness / 2, 0]}
        onClick={handleClick}
        castShadow
      />

      {/* Center dividers – cross pattern */}
      <mesh
        geometry={frameDividerHGeo}
        material={frameMat}
        position={[0, cy, 0]}
        onClick={handleClick}
      />
      <mesh
        geometry={frameDividerVGeo}
        material={frameMat}
        position={[0, cy, 0]}
        onClick={handleClick}
      />

      {/* Selection glow */}
      {isSelected && (
        <mesh geometry={glassGeo} position={[0, cy, 0]}>
          <meshStandardMaterial
            color="#4f9eff"
            emissive="#4f9eff"
            emissiveIntensity={0.2}
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

export const Window = React.memo(WindowComponent);
export default Window;
