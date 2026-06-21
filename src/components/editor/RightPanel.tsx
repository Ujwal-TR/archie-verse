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
  Link,
  Unlink,
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
  const selectedObjectIds = useEditorStore((s) => s.selectedObjectIds);
  const updateObject = useEditorStore((s) => s.updateObject);
  const deleteObject = useEditorStore((s) => s.deleteObject);
  const duplicateSelected = useEditorStore((s) => s.duplicateSelected);
  const updateSelectedObjects = useEditorStore((s) => s.updateSelectedObjects);
  const deleteSelected = useEditorStore((s) => s.deleteSelected);
  const groupSelected = useEditorStore((s) => s.groupSelected);
  const ungroupSelected = useEditorStore((s) => s.ungroupSelected);

  const selectedObjects = objects.filter((o) => selectedObjectIds.includes(o.id));
  const allSameGroup = selectedObjects.length > 0 && selectedObjects.every(o => o.groupId === selectedObjects[0].groupId && o.groupId);
  const canGroup = selectedObjectIds.length > 1 && !allSameGroup;
  const canUngroup = selectedObjectIds.length > 0 && allSameGroup;

  if (selectedObjectIds.length === 0) {
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


  const obj = objects.find((o) => o.id === selectedObjectIds[0])!;

  const handleNameChange = (value: string) => {
    updateSelectedObjects({ name: value });
  };

  // Transform helpers
  const handlePosition = (axis: number, value: string) => {
    const v = parseFloat(value);
    if (isNaN(v)) return;
    updateSelectedObjects((o) => {
      const pos: [number, number, number] = [...o.position];
      pos[axis] = v;
      return { position: pos };
    });
  };

  const handleRotation = (axis: number, value: string) => {
    const deg = parseFloat(value);
    if (isNaN(deg)) return;
    updateSelectedObjects((o) => {
      const rot: [number, number, number] = [...o.rotation];
      rot[axis] = deg;
      return { rotation: rot };
    });
  };

  const handleScale = (axis: number, value: string) => {
    const v = parseFloat(value);
    if (isNaN(v)) return;
    updateSelectedObjects((o) => {
      const scl: [number, number, number] = [...o.scale];
      scl[axis] = v;
      return { scale: scl };
    });
  };

  const handleDimension = (key: string, value: string) => {
    const v = parseFloat(value);
    if (isNaN(v)) return;
    updateSelectedObjects((o) => ({
      dimensions: { ...o.dimensions, [key]: v },
    }));
  };

  const handleMaterial = (key: string, value: string | number | boolean) => {
    updateSelectedObjects((o) => ({
      material: { ...o.material, [key]: value },
    }));
  };

  // Rotation is already stored in degrees
  const displayDeg = (deg: number) => +deg.toFixed(1);

  const dimKeys = dimensionFields[obj.type] ?? Object.keys(obj.dimensions);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>
          {selectedObjectIds.length > 1 ? `Properties (${selectedObjectIds.length} Selected)` : 'Properties'}
        </span>
      </div>

      <div className={styles.content}>
        {/* ── Name ── */}
        <div className={styles.section}>
          <input
            className={styles.nameInput}
            value={selectedObjectIds.length > 1 ? '<Multiple Selected>' : obj.name}
            onChange={(e) => handleNameChange(e.target.value)}
            spellCheck={false}
            disabled={selectedObjectIds.length > 1}
          />
          <span className={styles.typeBadge}>
            <Tag size={12} /> {selectedObjectIds.length > 1 ? 'Multiple Types' : obj.type}
            {obj.subType && selectedObjectIds.length === 1 ? ` / ${obj.subType}` : ''}
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
              onClick={deleteSelected}
            >
              <Trash2 /> Delete
            </button>
            <button className={styles.actionBtn} onClick={duplicateSelected}>
              <Copy /> Duplicate
            </button>
          </div>
          
          {(canGroup || canUngroup) && (
            <div className={styles.actionsRow} style={{ marginTop: 6 }}>
              {canGroup && (
                <button className={styles.actionBtn} onClick={groupSelected}>
                  <Link /> Group
                </button>
              )}
              {canUngroup && (
                <button className={styles.actionBtn} onClick={ungroupSelected}>
                  <Unlink /> Ungroup
                </button>
              )}
            </div>
          )}

          <div className={styles.actionsRow} style={{ marginTop: 6 }}>
            <button
              className={`${styles.actionBtn} ${obj.locked ? styles.toggled : ''}`}
              onClick={() => updateSelectedObjects({ locked: !obj.locked })}
            >
              {obj.locked ? <Lock /> : <Unlock />}
              {obj.locked ? 'Locked' : 'Lock'}
            </button>
            <button
              className={`${styles.actionBtn} ${!obj.visible ? styles.toggled : ''}`}
              onClick={() => updateSelectedObjects({ visible: !obj.visible })}
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
