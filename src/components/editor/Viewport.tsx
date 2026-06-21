'use client';

import { useRef, useCallback, Suspense, useState } from 'react';
import { Canvas, useThree, useFrame, ThreeEvent } from '@react-three/fiber';
import {
  OrbitControls,
  Grid,
  Environment,
  GizmoHelper,
  GizmoViewport,
  OrthographicCamera,
  ContactShadows,
} from '@react-three/drei';
import * as THREE from 'three';
import { useEditorStore } from '@/store/editorStore';
import SceneObject from '@/components/elements/SceneObject';
import styles from './Viewport.module.css';

/* ─── FPS counter ─── */
function FPSCounter() {
  const setFps = useEditorStore((s) => s.setFps);
  const frames = useRef(0);
  const lastTime = useRef(performance.now());

  useFrame(() => {
    frames.current++;
    const now = performance.now();
    if (now - lastTime.current >= 1000) {
      setFps(frames.current);
      frames.current = 0;
      lastTime.current = now;
    }
  });

  return null;
}

/* ─── Invisible ground plane used for raycasting during drag ─── */
const GROUND_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

/* ─── Drag controller: handles pointer-based object dragging ─── */
function DragSystem() {
  const { camera, raycaster, gl } = useThree();
  const isDragging = useRef(false);
  const dragObjectIds = useRef<string[]>([]);
  const dragOffsets = useRef<Map<string, THREE.Vector3>>(new Map());
  const intersection = useRef(new THREE.Vector3());

  const getGroundPoint = useCallback(
    (event: PointerEvent): THREE.Vector3 | null => {
      const rect = gl.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(mouse, camera);
      const target = new THREE.Vector3();
      const hit = raycaster.ray.intersectPlane(GROUND_PLANE, target);
      return hit ? target : null;
    },
    [camera, raycaster, gl]
  );

  useFrame(() => {
    // Attach / detach pointer listeners once
  });

  // We use useFrame with a ref-based approach for perf,
  // but the actual event listeners are on the canvas
  const onPointerDown = useCallback(
    (e: PointerEvent) => {
      const state = useEditorStore.getState();
      if (!['select', 'move'].includes(state.activeTool)) return;
      const groundPt = getGroundPoint(e);
      if (!groundPt) return;

      const selectedObjs = state.objects.filter(o => state.selectedObjectIds.includes(o.id));
      if (selectedObjs.length === 0 || selectedObjs.every(o => o.locked)) return;

      dragOffsets.current.clear();
      const draggedIds: string[] = [];

      selectedObjs.forEach(obj => {
        if (!obj.locked) {
          draggedIds.push(obj.id);
          dragOffsets.current.set(obj.id, new THREE.Vector3(
            obj.position[0] - groundPt.x,
            0,
            obj.position[2] - groundPt.z
          ));
        }
      });

      isDragging.current = true;
      dragObjectIds.current = draggedIds;

      // Disable orbit controls during drag
      gl.domElement.style.cursor = 'grabbing';
    },
    [getGroundPoint, gl]
  );

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDragging.current || dragObjectIds.current.length === 0) return;

      const groundPt = getGroundPoint(e);
      if (!groundPt) return;

      const state = useEditorStore.getState();
      
      const updates: Record<string, Partial<any>> = {};

      dragObjectIds.current.forEach(id => {
        const obj = state.objects.find((o) => o.id === id);
        if (!obj) return;

        const offset = dragOffsets.current.get(id);
        if (!offset) return;

        let newX = groundPt.x + offset.x;
        let newZ = groundPt.z + offset.z;

        if (state.snapEnabled) {
          const gs = state.gridSize;
          newX = Math.round(newX / gs) * gs;
          newZ = Math.round(newZ / gs) * gs;
        }

        updates[id] = { position: [newX, obj.position[1], newZ] };
      });

      // Instead of looping updates individually, we can just use updateSelectedObjects
      // BUT they each have unique positions. So we must call updateObject sequentially, 
      // or ideally we update them in batch. For now, sequential is fine.
      Object.entries(updates).forEach(([id, update]) => {
        state.updateObject(id, update);
      });
    },
    [getGroundPoint]
  );

  const onPointerUp = useCallback(() => {
    if (isDragging.current) {
      isDragging.current = false;
      dragObjectIds.current = [];
      gl.domElement.style.cursor = 'default';
    }
  }, [gl]);

  // Attach listeners to the canvas element
  useFrame(() => {
    const el = gl.domElement;
    // We use a trick: store whether listeners are attached
    if (!(el as any).__dragListeners) {
      el.addEventListener('pointerdown', onPointerDown);
      el.addEventListener('pointermove', onPointerMove);
      el.addEventListener('pointerup', onPointerUp);
      el.addEventListener('pointerleave', onPointerUp);
      (el as any).__dragListeners = true;
    }
  });

  return null;
}

/* ─── Orbit controls that disable during drag ─── */
function SmartOrbitControls() {
  const controlsRef = useRef<any>(null);

  // Listen for dragging state changes
  useFrame(() => {
    // The DragSystem changes cursor to 'grabbing' when dragging
    // We can check that to disable orbit
    if (controlsRef.current) {
      const canvas = controlsRef.current.domElement;
      if (canvas) {
        controlsRef.current.enabled = canvas.style.cursor !== 'grabbing';
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.05}
      minDistance={1}
      maxDistance={200}
      maxPolarAngle={Math.PI / 2 - 0.05}
    />
  );
}

/* ─── Main 3D scene ─── */
function SceneContent() {
  const objects = useEditorStore((s) => s.objects);
  const selectedObjectIds = useEditorStore((s) => s.selectedObjectIds);
  const selectObject = useEditorStore((s) => s.selectObject);
  const activeTool = useEditorStore((s) => s.activeTool);
  const showGrid = useEditorStore((s) => s.showGrid);
  const theme = useEditorStore((s) => s.theme);

  const gridCellColor = theme === 'light' ? '#b0b8c4' : '#3a3a5c';
  const gridSectionColor = theme === 'light' ? '#8891a0' : '#4a4a7c';

  const handleBackgroundClick = useCallback(() => {
    selectObject(null);
  }, [selectObject]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <directionalLight position={[-5, 8, -5]} intensity={0.3} />
      <hemisphereLight color="#b1e1ff" groundColor="#1a1a2e" intensity={0.5} />

      {/* Environment for reflections */}
      <Environment preset="city" background={false} />

      {/* Grid */}
      {showGrid && (
        <Grid
          position={[0, -0.001, 0]}
          args={[100, 100]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor={gridCellColor}
          sectionSize={5}
          sectionThickness={1}
          sectionColor={gridSectionColor}
          fadeDistance={50}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid
        />
      )}

      {/* Ground plane for clicking empty space & raycasting */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        onClick={handleBackgroundClick}
      >
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>

      {/* Contact shadows */}
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.4}
        scale={50}
        blur={2}
        far={10}
        color="#000000"
      />

      {/* Scene objects */}
      {objects.map((obj) => (
        <SceneObject
          key={obj.id}
          obj={obj}
          isSelected={selectedObjectIds.includes(obj.id)}
          onSelect={(id, multi) => {
            if (activeTool === 'delete') {
              useEditorStore.getState().deleteObject(id);
            } else {
              // Pass a boolean indicating if Ctrl/Cmd is held (we'll assume the SceneObject can pass it, or we infer it from global state)
              // Actually, SceneObject's onSelect signature is just (id). Let's update SceneObject to pass event.
              selectObject(id, multi);
            }
          }}
        />
      ))}

      {/* Drag system */}
      <DragSystem />

      {/* Camera controls (disable during drag) */}
      <SmartOrbitControls />

      {/* Gizmo helper */}
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport
          axisColors={['#ef4444', '#22c55e', '#3b82f6']}
          labelColor="white"
        />
      </GizmoHelper>

      <FPSCounter />
    </>
  );
}

/* ─── 2D Floor Plan view ─── */
function Scene2D() {
  const objects = useEditorStore((s) => s.objects);
  const selectedObjectIds = useEditorStore((s) => s.selectedObjectIds);
  const selectObject = useEditorStore((s) => s.selectObject);
  const showGrid = useEditorStore((s) => s.showGrid);

  return (
    <>
      <ambientLight intensity={1} />

      <OrthographicCamera
        makeDefault
        position={[0, 50, 0]}
        zoom={40}
        near={0.1}
        far={1000}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      <OrbitControls
        makeDefault
        enableRotate={false}
        enableDamping
        dampingFactor={0.05}
        minZoom={5}
        maxZoom={200}
      />

      {showGrid && (
        <Grid
          position={[0, -0.001, 0]}
          args={[100, 100]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#3a3a5c"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#4a4a7c"
          fadeDistance={80}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid
        />
      )}

      {objects.map((obj) => (
        <SceneObject
          key={obj.id}
          obj={obj}
          isSelected={selectedObjectIds.includes(obj.id)}
          onSelect={(id, multi) => selectObject(id, multi)}
        />
      ))}

      <FPSCounter />
    </>
  );
}

/* ─── Viewport wrapper ─── */
export default function Viewport() {
  const viewMode = useEditorStore((s) => s.viewMode);
  const theme = useEditorStore((s) => s.theme);

  const canvasBg = theme === 'light' ? '#eef2f6' : '#0d0d14';

  return (
    <div className={styles.viewport}>
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
          preserveDrawingBuffer: true,
        }}
        camera={{ position: [12, 10, 12], fov: 50, near: 0.1, far: 1000 }}
        onCreated={({ gl, scene }) => {
          (window as any).__archieverse_renderer = gl;
          (window as any).__archieverse_scene = scene;
        }}
      >
        <color attach="background" args={[canvasBg]} />
        <fog attach="fog" args={[canvasBg, 60, 120]} />
        <Suspense fallback={null}>
          {viewMode === '2d' ? <Scene2D /> : <SceneContent />}
        </Suspense>
      </Canvas>

      {/* Viewport overlay */}
      <div className={styles.viewportBadge}>
        {viewMode === '3d' && '3D Perspective'}
        {viewMode === '2d' && '2D Floor Plan'}
        {viewMode === 'walkthrough' && 'Walkthrough'}
      </div>

      {/* Drag hint */}
      <div className={styles.dragHint}>
        Click an element, then drag to move it
      </div>
    </div>
  );
}
