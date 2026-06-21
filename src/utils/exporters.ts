import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';

function downloadFile(data: string | ArrayBuffer, filename: string, mimeType: string) {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportGLTF(scene: THREE.Scene, filename: string = 'archieverse-model') {
  const exporter = new GLTFExporter();

  return new Promise<void>((resolve, reject) => {
    exporter.parse(
      scene,
      (result: ArrayBuffer | object) => {
        if (result instanceof ArrayBuffer) {
          downloadFile(result, `${filename}.glb`, 'application/octet-stream');
        } else {
          const json = JSON.stringify(result, null, 2);
          downloadFile(json, `${filename}.gltf`, 'application/json');
        }
        resolve();
      },
      (error: ErrorEvent) => {
        console.error('GLTF export error:', error);
        reject(error);
      },
      { binary: true }
    );
  });
}

export function exportOBJ(scene: THREE.Scene, filename: string = 'archieverse-model') {
  const exporter = new OBJExporter();
  const result = exporter.parse(scene);
  downloadFile(result, `${filename}.obj`, 'text/plain');
}

export function exportScreenshot(
  renderer: THREE.WebGLRenderer,
  filename: string = 'archieverse-screenshot'
) {
  const canvas = renderer.domElement;
  const dataURL = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = `${filename}.png`;
  link.click();
}

export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

export function generateObjectName(type: string, count: number): string {
  const typeNames: Record<string, string> = {
    wall: 'Wall',
    floor: 'Floor',
    door: 'Door',
    window: 'Window',
    roof: 'Roof',
    stairs: 'Stairs',
    furniture: 'Furniture',
  };
  return `${typeNames[type] || type} ${count + 1}`;
}

export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

export function formatDimension(meters: number, unit: 'metric' | 'imperial' = 'metric'): string {
  if (unit === 'imperial') {
    const feet = meters * 3.28084;
    const wholeFeet = Math.floor(feet);
    const inches = Math.round((feet - wholeFeet) * 12);
    return `${wholeFeet}'${inches}"`;
  }
  if (meters < 1) {
    return `${(meters * 100).toFixed(0)} cm`;
  }
  return `${meters.toFixed(2)} m`;
}
