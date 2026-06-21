'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import type { SceneObject } from '@/store/editorStore';

interface RoofProps {
  obj: SceneObject;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const DEFAULTS = {
  width: 6.0,
  depth: 6.0,
  height: 2.0, // ridge height for gabled; thickness for flat
  thickness: 0.15,
  overhang: 0.3,
} as const;

/**
 * Creates a triangular-prism geometry for a gabled roof.
 * The ridge runs along the Z axis, with the two sloped faces
 * meeting at the peak (y = ridgeHeight) and the base at y = 0.
 */
function createGabledGeometry(
  width: number,
  depth: number,
  ridgeHeight: number,
  overhang: number
): THREE.BufferGeometry {
  const hw = (width + overhang * 2) / 2;
  const hd = (depth + overhang * 2) / 2;

  // Vertices: 6 unique corners of the prism
  //  0-1: base front-left, front-right
  //  2-3: base back-left, back-right
  //  4-5: ridge front, ridge back
  const vertices = new Float32Array([
    // Left slope
    -hw, 0, -hd,
    0, ridgeHeight, -hd,
    -hw, 0, hd,
    0, ridgeHeight, hd,
    // Right slope
    0, ridgeHeight, -hd,
    hw, 0, -hd,
    0, ridgeHeight, hd,
    hw, 0, hd,
    // Front triangle
    -hw, 0, -hd,
    hw, 0, -hd,
    0, ridgeHeight, -hd,
    // Back triangle
    -hw, 0, hd,
    0, ridgeHeight, hd,
    hw, 0, hd,
    // Bottom quad
    -hw, 0, -hd,
    -hw, 0, hd,
    hw, 0, hd,
    hw, 0, -hd,
  ]);

  const indices = [
    // Left slope (2 triangles)
    0, 1, 2,
    2, 1, 3,
    // Right slope (2 triangles)
    4, 5, 6,
    6, 5, 7,
    // Front triangle
    8, 9, 10,
    // Back triangle
    11, 12, 13,
    // Bottom (2 triangles)
    14, 15, 16,
    14, 16, 17,
  ];

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  return geo;
}

function RoofComponent({ obj, isSelected, onSelect }: RoofProps) {
  const groupRef = useRef<THREE.Group>(null);

  const subType = (obj.subType ?? 'flat') as 'flat' | 'gabled';
  const width = obj.dimensions.width ?? DEFAULTS.width;
  const depth = obj.dimensions.depth ?? DEFAULTS.depth;
  const ridgeHeight = obj.dimensions.height ?? DEFAULTS.height;
  const thickness = obj.dimensions.thickness ?? DEFAULTS.thickness;
  const overhang = obj.dimensions.overhang ?? DEFAULTS.overhang;

  const roofColor = obj.material.color || '#7a7570';

  // Flat roof geometry (simple slab)
  const flatGeo = useMemo(
    () => new THREE.BoxGeometry(width + overhang * 2, thickness, depth + overhang * 2),
    [width, depth, thickness, overhang]
  );

  // Gabled roof geometry
  const gabledGeo = useMemo(
    () => createGabledGeometry(width, depth, ridgeHeight, overhang),
    [width, depth, ridgeHeight, overhang]
  );

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: roofColor,
        roughness: obj.material.roughness ?? 0.8,
        metalness: obj.material.metalness ?? 0.1,
        opacity: obj.material.opacity ?? 1,
        transparent: obj.material.opacity < 1,
        side: THREE.DoubleSide,
      }),
    [roofColor, obj.material.roughness, obj.material.metalness, obj.material.opacity]
  );

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
      {subType === 'flat' ? (
        <>
          <mesh
            geometry={flatGeo}
            material={material}
            onClick={handleClick}
            castShadow
            receiveShadow
          >
            {isSelected && <Edges threshold={15} color="#4f9eff" lineWidth={2} />}
          </mesh>

          {isSelected && (
            <mesh geometry={flatGeo}>
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
        </>
      ) : (
        <>
          <mesh
            geometry={gabledGeo}
            material={material}
            onClick={handleClick}
            castShadow
            receiveShadow
          >
            {isSelected && <Edges threshold={15} color="#4f9eff" lineWidth={2} />}
          </mesh>

          {isSelected && (
            <mesh geometry={gabledGeo}>
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
        </>
      )}
    </group>
  );
}

export const Roof = React.memo(RoofComponent);
export default Roof;
