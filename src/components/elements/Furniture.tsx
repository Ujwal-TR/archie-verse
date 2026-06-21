'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import type { SceneObject } from '@/store/editorStore';

interface FurnitureProps {
  obj: SceneObject;
  isSelected: boolean;
  onSelect: (id: string, multiSelect?: boolean) => void;
}

type FurnitureSubType = 'table' | 'chair' | 'sofa' | 'bed';

const DEFAULT_COLORS: Record<FurnitureSubType, string> = {
  table: '#8b5e3c',  // medium oak
  chair: '#6b4226',  // dark walnut
  sofa: '#4a6741',   // olive green fabric
  bed: '#f5f0e8',    // off-white linen
};

// ──────────────────────────────────────────
// Sub-components for each furniture type
// ──────────────────────────────────────────

interface SubProps {
  color: string;
  material: THREE.MeshStandardMaterial;
  onClick: (e: ThreeEvent<MouseEvent>) => void;
  isSelected: boolean;
  dims: Record<string, number>;
}

/** Table: top slab + 4 legs */
function TableMesh({ material, onClick, isSelected, dims }: SubProps) {
  const w = dims.width ?? 1.2;
  const d = dims.depth ?? 0.7;
  const h = dims.height ?? 0.75;
  const topThick = 0.04;
  const legSize = 0.05;

  const topGeo = useMemo(() => new THREE.BoxGeometry(w, topThick, d), [w, d, topThick]);
  const legGeo = useMemo(() => new THREE.BoxGeometry(legSize, h - topThick, legSize), [h, topThick]);

  const legPositions: [number, number, number][] = useMemo(() => {
    const inset = 0.06;
    const hx = w / 2 - inset;
    const hz = d / 2 - inset;
    const ly = (h - topThick) / 2;
    return [
      [-hx, ly, -hz],
      [hx, ly, -hz],
      [-hx, ly, hz],
      [hx, ly, hz],
    ];
  }, [w, d, h, topThick]);

  return (
    <>
      <mesh
        geometry={topGeo}
        material={material}
        position={[0, h - topThick / 2, 0]}
        onClick={onClick}
        castShadow
        receiveShadow
      >
        {isSelected && <Edges threshold={15} color="#4f9eff" lineWidth={2} />}
      </mesh>
      {legPositions.map((pos, i) => (
        <mesh
          key={i}
          geometry={legGeo}
          material={material}
          position={pos}
          onClick={onClick}
          castShadow
        />
      ))}
    </>
  );
}

/** Chair: seat + backrest + 4 legs */
function ChairMesh({ material, onClick, isSelected, dims }: SubProps) {
  const w = dims.width ?? 0.45;
  const d = dims.depth ?? 0.45;
  const seatH = dims.seatHeight ?? 0.45;
  const backH = dims.backHeight ?? 0.45;
  const seatThick = 0.04;
  const legSize = 0.04;

  const seatGeo = useMemo(() => new THREE.BoxGeometry(w, seatThick, d), [w, d, seatThick]);
  const backGeo = useMemo(() => new THREE.BoxGeometry(w, backH, seatThick), [w, backH, seatThick]);
  const legGeo = useMemo(() => new THREE.BoxGeometry(legSize, seatH, legSize), [seatH]);

  const inset = 0.03;
  const hx = w / 2 - inset;
  const hz = d / 2 - inset;

  return (
    <>
      {/* Seat */}
      <mesh
        geometry={seatGeo}
        material={material}
        position={[0, seatH + seatThick / 2, 0]}
        onClick={onClick}
        castShadow
        receiveShadow
      >
        {isSelected && <Edges threshold={15} color="#4f9eff" lineWidth={2} />}
      </mesh>
      {/* Backrest */}
      <mesh
        geometry={backGeo}
        material={material}
        position={[0, seatH + seatThick + backH / 2, -d / 2 + seatThick / 2]}
        onClick={onClick}
        castShadow
      >
        {isSelected && <Edges threshold={15} color="#4f9eff" lineWidth={1.5} />}
      </mesh>
      {/* Legs */}
      {(
        [
          [-hx, seatH / 2, -hz],
          [hx, seatH / 2, -hz],
          [-hx, seatH / 2, hz],
          [hx, seatH / 2, hz],
        ] as [number, number, number][]
      ).map((pos, i) => (
        <mesh
          key={i}
          geometry={legGeo}
          material={material}
          position={pos}
          onClick={onClick}
          castShadow
        />
      ))}
    </>
  );
}

/** Sofa: base cushion + back + two arms */
function SofaMesh({ color, onClick, isSelected, dims }: SubProps) {
  const w = dims.width ?? 2.0;
  const d = dims.depth ?? 0.85;
  const seatH = dims.seatHeight ?? 0.42;
  const backH = dims.backHeight ?? 0.4;
  const armW = dims.armWidth ?? 0.12;

  const cushionColor = color;
  const structureColor = new THREE.Color(color).offsetHSL(0, 0, -0.15).getHexString();

  const baseGeo = useMemo(
    () => new THREE.BoxGeometry(w, seatH, d),
    [w, seatH, d]
  );
  const backGeo = useMemo(
    () => new THREE.BoxGeometry(w - armW * 2, backH, 0.12),
    [w, backH, armW]
  );
  const armGeo = useMemo(
    () => new THREE.BoxGeometry(armW, seatH + backH * 0.6, d),
    [armW, seatH, backH, d]
  );

  const baseMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: cushionColor, roughness: 0.85, metalness: 0 }),
    [cushionColor]
  );
  const frameMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: `#${structureColor}`, roughness: 0.7, metalness: 0.05 }),
    [structureColor]
  );

  return (
    <>
      {/* Base / seat */}
      <mesh
        geometry={baseGeo}
        material={baseMat}
        position={[0, seatH / 2, 0]}
        onClick={onClick}
        castShadow
        receiveShadow
      >
        {isSelected && <Edges threshold={15} color="#4f9eff" lineWidth={2} />}
      </mesh>
      {/* Back */}
      <mesh
        geometry={backGeo}
        material={frameMat}
        position={[0, seatH + backH / 2, -(d / 2 - 0.06)]}
        onClick={onClick}
        castShadow
      >
        {isSelected && <Edges threshold={15} color="#4f9eff" lineWidth={1.5} />}
      </mesh>
      {/* Left arm */}
      <mesh
        geometry={armGeo}
        material={frameMat}
        position={[-(w / 2 - armW / 2), (seatH + backH * 0.6) / 2, 0]}
        onClick={onClick}
        castShadow
      />
      {/* Right arm */}
      <mesh
        geometry={armGeo}
        material={frameMat}
        position={[w / 2 - armW / 2, (seatH + backH * 0.6) / 2, 0]}
        onClick={onClick}
        castShadow
      />
    </>
  );
}

/** Bed: base platform + mattress + headboard */
function BedMesh({ color, onClick, isSelected, dims }: SubProps) {
  const w = dims.width ?? 1.6; // queen
  const d = dims.depth ?? 2.0;
  const baseH = dims.baseHeight ?? 0.3;
  const mattressH = dims.mattressHeight ?? 0.2;
  const headboardH = dims.headboardHeight ?? 0.6;

  const baseColor = '#6b5b4f'; // dark wood
  const mattressColor = color;

  const baseGeo = useMemo(
    () => new THREE.BoxGeometry(w, baseH, d),
    [w, baseH, d]
  );
  const mattressGeo = useMemo(
    () => new THREE.BoxGeometry(w - 0.04, mattressH, d - 0.04),
    [w, mattressH, d]
  );
  const headboardGeo = useMemo(
    () => new THREE.BoxGeometry(w + 0.04, headboardH, 0.06),
    [w, headboardH]
  );

  const baseMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.7, metalness: 0.05 }),
    []
  );
  const mattressMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: mattressColor, roughness: 0.9, metalness: 0 }),
    [mattressColor]
  );

  return (
    <>
      {/* Base frame */}
      <mesh
        geometry={baseGeo}
        material={baseMat}
        position={[0, baseH / 2, 0]}
        onClick={onClick}
        castShadow
        receiveShadow
      />
      {/* Mattress */}
      <mesh
        geometry={mattressGeo}
        material={mattressMat}
        position={[0, baseH + mattressH / 2, 0]}
        onClick={onClick}
        castShadow
      >
        {isSelected && <Edges threshold={15} color="#4f9eff" lineWidth={2} />}
      </mesh>
      {/* Headboard */}
      <mesh
        geometry={headboardGeo}
        material={baseMat}
        position={[0, baseH + headboardH / 2, -(d / 2)]}
        onClick={onClick}
        castShadow
      >
        {isSelected && <Edges threshold={15} color="#4f9eff" lineWidth={1.5} />}
      </mesh>
    </>
  );
}

// ──────────────────────────────────────────
// Main Furniture wrapper
// ──────────────────────────────────────────

function FurnitureComponent({ obj, isSelected, onSelect }: FurnitureProps) {
  const groupRef = useRef<THREE.Group>(null);

  const subType = (obj.subType ?? 'table') as FurnitureSubType;
  const color = obj.material.color || DEFAULT_COLORS[subType] || '#8b5e3c';

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: obj.material.roughness ?? 0.65,
        metalness: obj.material.metalness ?? 0.05,
        opacity: obj.material.opacity ?? 1,
        transparent: obj.material.opacity < 1,
      }),
    [color, obj.material.roughness, obj.material.metalness, obj.material.opacity]
  );

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(obj.id, e.ctrlKey || e.metaKey || e.shiftKey);
  };

  if (!obj.visible) return null;

  const subProps: SubProps = {
    color,
    material,
    onClick: handleClick,
    isSelected,
    dims: obj.dimensions,
  };

  return (
    <group
      ref={groupRef}
      position={obj.position}
      rotation={obj.rotation.map((r) => (r * Math.PI) / 180) as [number, number, number]}
      scale={obj.scale}
    >
      {subType === 'table' && <TableMesh {...subProps} />}
      {subType === 'chair' && <ChairMesh {...subProps} />}
      {subType === 'sofa' && <SofaMesh {...subProps} />}
      {subType === 'bed' && <BedMesh {...subProps} />}
    </group>
  );
}

export const Furniture = React.memo(FurnitureComponent);
export default Furniture;
