'use client';

import React from 'react';
import {
  MousePointerClick,
  Trash2,
  Copy,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Tag,
} from 'lucide-react';
import { useEditorStore, type SceneObject } from '@/store/editorStore';
import styles from './RightPanel.module.css';

/** Mapping of object type → relevant dimension keys */
const dimensionFields: Record<string, string[]> = {
  wall: ['height', 'length', 'thickness'],
  floor: ['width', 'depth', 'thickness'],
  door: ['height', 'width', 'thickness'],
  window: ['height', 'width', 'sillHeight'],
  roof: ['width', 'depth', 'pitch'],
  stairs: ['height', 'width', 'steps'],
  furniture: ['height', 'width', 'depth'],
  column: ['height', 'radius'],
  beam: ['length', 'height', 'depth', 'elevation'],
  railing: ['length', 'height', 'postCount'],
  bathroom: ['width', 'depth', 'height'],
  kitchen: ['width', 'depth', 'height'],
  lighting: ['height'],
  decor: ['width', 'depth', 'height'],
};

export default function RightPanel() {
  const objects = useEditorStore((s) => s.objects);
  const selectedObjectId = useEditorStore((s) => s.selectedObjectId);
  const updateObject = useEditorStore((s) => s.updateObject);
  const deleteObject = useEditorStore((s) => s.deleteObject);
  const duplicateSelected = useEditorStore((s) => s.duplicateSelected);

  const selectedObject = selectedObjectId
    ? objects.find((o) => o.id === selectedObjectId)
    : undefined;

  if (!selectedObject) {
    return (
      <div className={styles.panel}>
        <div className={styles.header}>
          <span className={styles.headerTitle}>Properties</span>
        </div>
        <div className={styles.emptyState}>
          <MousePointerClick />
          <span className={styles.emptyText}>No Selection</span>
          <span className={styles.emptyHint}>
            Select an object in the viewport to edit its properties
          </span>
        </div>
      </div>
    );
  }

  const obj = selectedObject;

  const handleNameChange = (value: string) => {
    updateObject(obj.id, { name: value });
  };

  // Transform helpers
  const handlePosition = (axis: number, value: string) => {
    const v = parseFloat(value);
    if (isNaN(v)) return;
    const pos: [number, number, number] = [...obj.position];
    pos[axis] = v;
    updateObject(obj.id, { position: pos });
  };

  const handleRotation = (axis: number, value: string) => {
    const deg = parseFloat(value);
    if (isNaN(deg)) return;
    const rot: [number, number, number] = [...obj.rotation];
    rot[axis] = deg;
    updateObject(obj.id, { rotation: rot });
  };

  const handleScale = (axis: number, value: string) => {
    const v = parseFloat(value);
    if (isNaN(v)) return;
    const scl: [number, number, number] = [...obj.scale];
    scl[axis] = v;
    updateObject(obj.id, { scale: scl });
  };

  const handleDimension = (key: string, value: string) => {
    const v = parseFloat(value);
    if (isNaN(v)) return;
    updateObject(obj.id, {
      dimensions: { ...obj.dimensions, [key]: v },
    });
  };

  const handleMaterial = (key: string, value: string | number | boolean) => {
    updateObject(obj.id, {
      material: { ...obj.material, [key]: value },
    });
  };

  // Rotation is already stored in degrees
  const displayDeg = (deg: number) => +deg.toFixed(1);

  const dimKeys = dimensionFields[obj.type] ?? Object.keys(obj.dimensions);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>Properties</span>
      </div>

      <div className={styles.content}>
        {/* ── Name ── */}
        <div className={styles.section}>
          <input
            className={styles.nameInput}
            value={obj.name}
            onChange={(e) => handleNameChange(e.target.value)}
            spellCheck={false}
          />
          <span className={styles.typeBadge}>
            <Tag size={12} /> {obj.type}
            {obj.subType ? ` / ${obj.subType}` : ''}
          </span>
        </div>

        {/* ── Transform: Position ── */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Position</span>
          </div>
          <div className={styles.xyzRow}>
            {(['X', 'Y', 'Z'] as const).map((axis, i) => (
              <div key={axis} className={styles.xyzGroup}>
                <span
                  className={`${styles.axisLabel} ${
                    i === 0 ? styles.axisX : i === 1 ? styles.axisY : styles.axisZ
                  }`}
                >
                  {axis}
                </span>
                <input
                  type="number"
                  className={styles.xyzInput}
                  value={obj.position[i]}
                  step={0.1}
                  onChange={(e) => handlePosition(i, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Rotation (°)</span>
          </div>
          <div className={styles.xyzRow}>
            {(['X', 'Y', 'Z'] as const).map((axis, i) => (
              <div key={axis} className={styles.xyzGroup}>
                <span
                  className={`${styles.axisLabel} ${
                    i === 0 ? styles.axisX : i === 1 ? styles.axisY : styles.axisZ
                  }`}
                >
                  {axis}
                </span>
                <input
                  type="number"
                  className={styles.xyzInput}
                  value={displayDeg(obj.rotation[i])}
                  step={1}
                  onChange={(e) => handleRotation(i, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Scale</span>
          </div>
          <div className={styles.xyzRow}>
            {(['X', 'Y', 'Z'] as const).map((axis, i) => (
              <div key={axis} className={styles.xyzGroup}>
                <span
                  className={`${styles.axisLabel} ${
                    i === 0 ? styles.axisX : i === 1 ? styles.axisY : styles.axisZ
                  }`}
                >
                  {axis}
                </span>
                <input
                  type="number"
                  className={styles.xyzInput}
                  value={obj.scale[i]}
                  step={0.1}
                  onChange={(e) => handleScale(i, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Dimensions ── */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Dimensions</span>
          </div>
          {dimKeys.map((key) => (
            <div key={key} className={styles.dimField}>
              <span className={styles.dimLabel}>{key}</span>
              <input
                type="number"
                className={styles.dimInput}
                value={obj.dimensions[key] ?? 0}
                step={0.1}
                onChange={(e) => handleDimension(key, e.target.value)}
              />
            </div>
          ))}
        </div>

        {/* ── Material ── */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Material</span>
          </div>

          <div className={styles.colorRow}>
            <div className={styles.colorSwatch}>
              <input
                type="color"
                className={styles.colorInput}
                value={obj.material.color}
                onChange={(e) => handleMaterial('color', e.target.value)}
              />
            </div>
            <input
              className={styles.colorHex}
              value={obj.material.color}
              onChange={(e) => handleMaterial('color', e.target.value)}
              spellCheck={false}
            />
          </div>

          <div className={styles.sliderRow}>
            <span className={styles.sliderLabel}>Roughness</span>
            <input
              type="range"
              className={styles.slider}
              min={0}
              max={1}
              step={0.01}
              value={obj.material.roughness}
              onChange={(e) => handleMaterial('roughness', parseFloat(e.target.value))}
            />
            <span className={styles.sliderValue}>{obj.material.roughness.toFixed(2)}</span>
          </div>

          <div className={styles.sliderRow}>
            <span className={styles.sliderLabel}>Metalness</span>
            <input
              type="range"
              className={styles.slider}
              min={0}
              max={1}
              step={0.01}
              value={obj.material.metalness}
              onChange={(e) => handleMaterial('metalness', parseFloat(e.target.value))}
            />
            <span className={styles.sliderValue}>{obj.material.metalness.toFixed(2)}</span>
          </div>

          <div className={styles.sliderRow}>
            <span className={styles.sliderLabel}>Opacity</span>
            <input
              type="range"
              className={styles.slider}
              min={0}
              max={1}
              step={0.01}
              value={obj.material.opacity}
              onChange={(e) => handleMaterial('opacity', parseFloat(e.target.value))}
            />
            <span className={styles.sliderValue}>{obj.material.opacity.toFixed(2)}</span>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Actions</span>
          </div>
          <div className={styles.actionsRow}>
            <button
              className={`${styles.actionBtn} ${styles.danger}`}
              onClick={() => deleteObject(obj.id)}
            >
              <Trash2 /> Delete
            </button>
            <button className={styles.actionBtn} onClick={duplicateSelected}>
              <Copy /> Duplicate
            </button>
          </div>
          <div className={styles.actionsRow} style={{ marginTop: 6 }}>
            <button
              className={`${styles.actionBtn} ${obj.locked ? styles.toggled : ''}`}
              onClick={() => updateObject(obj.id, { locked: !obj.locked })}
            >
              {obj.locked ? <Lock /> : <Unlock />}
              {obj.locked ? 'Locked' : 'Lock'}
            </button>
            <button
              className={`${styles.actionBtn} ${!obj.visible ? styles.toggled : ''}`}
              onClick={() => updateObject(obj.id, { visible: !obj.visible })}
            >
              {obj.visible ? <Eye /> : <EyeOff />}
              {obj.visible ? 'Visible' : 'Hidden'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
