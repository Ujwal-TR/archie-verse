import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface MaterialConfig {
  color: string;
  roughness: number;
  metalness: number;
  opacity: number;
  transparent: boolean;
}

export interface SceneObject {
  id: string;
  type: 'wall' | 'floor' | 'door' | 'window' | 'roof' | 'stairs' | 'furniture' | 'column' | 'beam' | 'railing' | 'bathroom' | 'kitchen' | 'lighting' | 'decor';
  subType?: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  dimensions: Record<string, number>;
  material: MaterialConfig;
  name: string;
  locked: boolean;
  visible: boolean;
}

export type ToolType =
  | 'select'
  | 'move'
  | 'rotate'
  | 'scale'
  | 'wall'
  | 'floor'
  | 'door'
  | 'window'
  | 'roof'
  | 'stairs'
  | 'furniture'
  | 'column'
  | 'beam'
  | 'railing'
  | 'bathroom'
  | 'kitchen'
  | 'lighting'
  | 'decor'
  | 'delete'
  | 'measure';

export type ViewMode = '3d' | '2d' | 'walkthrough';

interface HistoryEntry {
  objects: SceneObject[];
  selectedObjectId: string | null;
}

interface EditorState {
  // Scene
  objects: SceneObject[];
  selectedObjectId: string | null;

  // Tools
  activeTool: ToolType;
  viewMode: ViewMode;

  // Settings
  gridSize: number;
  snapEnabled: boolean;
  showGrid: boolean;
  showMeasurements: boolean;
  unitSystem: 'metric' | 'imperial';

  // History
  history: HistoryEntry[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;

  // UI
  showCommandPalette: boolean;
  showShortcutHelp: boolean;
  fps: number;

  // Clipboard
  clipboard: Omit<SceneObject, 'id'> | null;

  // Actions
  setActiveTool: (tool: ToolType) => void;
  setViewMode: (mode: ViewMode) => void;
  addObject: (obj: Omit<SceneObject, 'id'>) => void;
  selectObject: (id: string | null) => void;
  updateObject: (id: string, updates: Partial<SceneObject>) => void;
  deleteObject: (id: string) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  copySelected: () => void;
  cutSelected: () => void;
  pasteClipboard: () => void;
  undo: () => void;
  redo: () => void;
  toggleGrid: () => void;
  toggleSnap: () => void;
  toggleMeasurements: () => void;
  setGridSize: (size: number) => void;
  setShowCommandPalette: (show: boolean) => void;
  setShowShortcutHelp: (show: boolean) => void;
  setFps: (fps: number) => void;
  clearScene: () => void;
  getSelectedObject: () => SceneObject | undefined;
}

const MAX_HISTORY = 50;

function pushHistory(state: EditorState): Partial<EditorState> {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push({
    objects: JSON.parse(JSON.stringify(state.objects)),
    selectedObjectId: state.selectedObjectId,
  });
  if (newHistory.length > MAX_HISTORY) {
    newHistory.shift();
  }
  return {
    history: newHistory,
    historyIndex: newHistory.length - 1,
    canUndo: newHistory.length > 1,
    canRedo: false,
  };
}

export const useEditorStore = create<EditorState>((set, get) => ({
  // Initial state
  objects: [],
  selectedObjectId: null,
  activeTool: 'select',
  viewMode: '3d',
  gridSize: 0.5,
  snapEnabled: true,
  showGrid: true,
  showMeasurements: false,
  unitSystem: 'metric',
  history: [{ objects: [], selectedObjectId: null }],
  historyIndex: 0,
  canUndo: false,
  canRedo: false,
  showCommandPalette: false,
  showShortcutHelp: false,
  fps: 60,
  clipboard: null,

  // Actions
  setActiveTool: (tool) => set({ activeTool: tool }),

  setViewMode: (mode) => set({ viewMode: mode }),

  addObject: (objData) => {
    const id = uuidv4();
    const newObj: SceneObject = { ...objData, id };
    set((state) => {
      const newObjects = [...state.objects, newObj];
      const historyUpdate = pushHistory({ ...state, objects: newObjects });
      return {
        objects: newObjects,
        selectedObjectId: id,
        activeTool: 'select',
        ...historyUpdate,
      };
    });
  },

  selectObject: (id) => set({ selectedObjectId: id }),

  updateObject: (id, updates) =>
    set((state) => {
      const newObjects = state.objects.map((obj) =>
        obj.id === id ? { ...obj, ...updates } : obj
      );
      const historyUpdate = pushHistory({ ...state, objects: newObjects });
      return { objects: newObjects, ...historyUpdate };
    }),

  deleteObject: (id) =>
    set((state) => {
      const newObjects = state.objects.filter((obj) => obj.id !== id);
      const historyUpdate = pushHistory({ ...state, objects: newObjects });
      return {
        objects: newObjects,
        selectedObjectId:
          state.selectedObjectId === id ? null : state.selectedObjectId,
        ...historyUpdate,
      };
    }),

  deleteSelected: () => {
    const { selectedObjectId, deleteObject } = get();
    if (selectedObjectId) {
      deleteObject(selectedObjectId);
    }
  },

  duplicateSelected: () => {
    const { selectedObjectId, objects, addObject } = get();
    if (!selectedObjectId) return;
    const obj = objects.find((o) => o.id === selectedObjectId);
    if (!obj) return;
    const { id, ...rest } = obj;
    addObject({
      ...rest,
      position: [rest.position[0] + 1, rest.position[1], rest.position[2] + 1],
      name: `${rest.name} (Copy)`,
    });
  },

  copySelected: () => {
    const { selectedObjectId, objects } = get();
    if (!selectedObjectId) return;
    const obj = objects.find((o) => o.id === selectedObjectId);
    if (!obj) return;
    const { id, ...rest } = obj;
    set({ clipboard: JSON.parse(JSON.stringify(rest)) });
  },

  cutSelected: () => {
    const { selectedObjectId, objects, deleteObject } = get();
    if (!selectedObjectId) return;
    const obj = objects.find((o) => o.id === selectedObjectId);
    if (!obj) return;
    const { id, ...rest } = obj;
    set({ clipboard: JSON.parse(JSON.stringify(rest)) });
    deleteObject(selectedObjectId);
  },

  pasteClipboard: () => {
    const { clipboard, addObject } = get();
    if (!clipboard) return;
    addObject({
      ...JSON.parse(JSON.stringify(clipboard)),
      position: [
        clipboard.position[0] + 1,
        clipboard.position[1],
        clipboard.position[2] + 1,
      ],
      name: `${clipboard.name} (Pasted)`,
    });
  },

  undo: () =>
    set((state) => {
      if (state.historyIndex <= 0) return state;
      const newIndex = state.historyIndex - 1;
      const entry = state.history[newIndex];
      return {
        objects: JSON.parse(JSON.stringify(entry.objects)),
        selectedObjectId: entry.selectedObjectId,
        historyIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: true,
      };
    }),

  redo: () =>
    set((state) => {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      const entry = state.history[newIndex];
      return {
        objects: JSON.parse(JSON.stringify(entry.objects)),
        selectedObjectId: entry.selectedObjectId,
        historyIndex: newIndex,
        canUndo: true,
        canRedo: newIndex < state.history.length - 1,
      };
    }),

  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  toggleSnap: () => set((state) => ({ snapEnabled: !state.snapEnabled })),
  toggleMeasurements: () =>
    set((state) => ({ showMeasurements: !state.showMeasurements })),
  setGridSize: (size) => set({ gridSize: size }),
  setShowCommandPalette: (show) => set({ showCommandPalette: show }),
  setShowShortcutHelp: (show) => set({ showShortcutHelp: show }),
  setFps: (fps) => set({ fps }),

  clearScene: () =>
    set((state) => {
      const historyUpdate = pushHistory({ ...state, objects: [] });
      return { objects: [], selectedObjectId: null, ...historyUpdate };
    }),

  getSelectedObject: () => {
    const { objects, selectedObjectId } = get();
    return objects.find((o) => o.id === selectedObjectId);
  },
}));
