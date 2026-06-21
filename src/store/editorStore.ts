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
  groupId?: string;
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
  selectedObjectIds: string[];
}

interface EditorState {
  // Scene
  objects: SceneObject[];
  selectedObjectIds: string[];

  // Tools
  activeTool: ToolType;
  viewMode: ViewMode;

  // Theme
  theme: 'light' | 'dark';

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
  clipboard: Omit<SceneObject, 'id'>[];

  // Actions
  setActiveTool: (tool: ToolType) => void;
  setViewMode: (mode: ViewMode) => void;
  addObject: (obj: Omit<SceneObject, 'id'>) => void;
  selectObject: (id: string | null, multiSelect?: boolean) => void;
  selectAll: () => void;
  updateObject: (id: string, updates: Partial<SceneObject>) => void;
  updateSelectedObjects: (updater: Partial<SceneObject> | ((obj: SceneObject) => Partial<SceneObject>)) => void;
  groupSelected: () => void;
  ungroupSelected: () => void;
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
  loadScene: (objects: SceneObject[]) => void;
  toggleTheme: () => void;
  getSelectedObjects: () => SceneObject[];
}

const MAX_HISTORY = 50;

function pushHistory(state: EditorState): Partial<EditorState> {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push({
    objects: JSON.parse(JSON.stringify(state.objects)),
    selectedObjectIds: [...state.selectedObjectIds],
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
  selectedObjectIds: [],
  activeTool: 'select',
  viewMode: '3d',
  gridSize: 0.5,
  snapEnabled: true,
  showGrid: true,
  showMeasurements: false,
  unitSystem: 'metric',
  history: [{ objects: [], selectedObjectIds: [] }],
  historyIndex: 0,
  canUndo: false,
  canRedo: false,
  showCommandPalette: false,
  showShortcutHelp: false,
  fps: 60,
  theme: 'dark',
  clipboard: [],

  // Actions
  setActiveTool: (tool) => set({ activeTool: tool }),

  setViewMode: (mode) => set({ viewMode: mode }),

  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

  addObject: (objData) => {
    const id = uuidv4();
    const newObj: SceneObject = { ...objData, id };
    set((state) => {
      const newObjects = [...state.objects, newObj];
      const historyUpdate = pushHistory({ ...state, objects: newObjects });
      return {
        objects: newObjects,
        selectedObjectIds: [id],
        activeTool: 'select',
        ...historyUpdate,
      };
    });
  },

  selectObject: (id, multiSelect = false) => set((state) => {
    if (!id) return { selectedObjectIds: [] };
    
    // Find all objects that should be selected together (if it's in a group)
    const targetObj = state.objects.find(o => o.id === id);
    let idsToToggle = [id];
    if (targetObj && targetObj.groupId) {
      idsToToggle = state.objects.filter(o => o.groupId === targetObj.groupId).map(o => o.id);
    }
    
    if (multiSelect) {
      const isSelected = state.selectedObjectIds.includes(id);
      return {
        selectedObjectIds: isSelected 
          ? state.selectedObjectIds.filter(selectedId => !idsToToggle.includes(selectedId))
          : Array.from(new Set([...state.selectedObjectIds, ...idsToToggle]))
      };
    }
    
    return { selectedObjectIds: idsToToggle };
  }),

  selectAll: () => set((state) => {
    const allUnlockedIds = state.objects.filter(o => !o.locked).map(o => o.id);
    return { selectedObjectIds: allUnlockedIds };
  }),

  updateObject: (id, updates) =>
    set((state) => {
      const newObjects = state.objects.map((obj) =>
        obj.id === id ? { ...obj, ...updates } : obj
      );
      const historyUpdate = pushHistory({ ...state, objects: newObjects });
      return { objects: newObjects, ...historyUpdate };
    }),

  updateSelectedObjects: (updater: Partial<SceneObject> | ((obj: SceneObject) => Partial<SceneObject>)) =>
    set((state) => {
      if (state.selectedObjectIds.length === 0) return state;
      const newObjects = state.objects.map((obj) => {
        if (!state.selectedObjectIds.includes(obj.id)) return obj;
        const updates = typeof updater === 'function' ? updater(obj) : updater;
        return { ...obj, ...updates };
      });
      const historyUpdate = pushHistory({ ...state, objects: newObjects });
      return { objects: newObjects, ...historyUpdate };
    }),

  groupSelected: () => set((state) => {
    if (state.selectedObjectIds.length <= 1) return state;
    const newGroupId = uuidv4();
    const newObjects = state.objects.map(obj => 
      state.selectedObjectIds.includes(obj.id) ? { ...obj, groupId: newGroupId } : obj
    );
    const historyUpdate = pushHistory({ ...state, objects: newObjects });
    return { objects: newObjects, ...historyUpdate };
  }),

  ungroupSelected: () => set((state) => {
    if (state.selectedObjectIds.length === 0) return state;
    const newObjects = state.objects.map(obj => 
      state.selectedObjectIds.includes(obj.id) ? { ...obj, groupId: undefined } : obj
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
        selectedObjectIds: state.selectedObjectIds.filter(selectedId => selectedId !== id),
        ...historyUpdate,
      };
    }),

  deleteSelected: () =>
    set((state) => {
      if (state.selectedObjectIds.length === 0) return state;
      const newObjects = state.objects.filter(obj => !state.selectedObjectIds.includes(obj.id));
      const historyUpdate = pushHistory({ ...state, objects: newObjects });
      return {
        objects: newObjects,
        selectedObjectIds: [],
        ...historyUpdate,
      };
    }),

  duplicateSelected: () =>
    set((state) => {
      if (state.selectedObjectIds.length === 0) return state;
      const selectedObjs = state.objects.filter(o => state.selectedObjectIds.includes(o.id));
      
      const newObjectsList: SceneObject[] = [];
      const newSelectedIds: string[] = [];
      
      selectedObjs.forEach(obj => {
        const { id, ...rest } = obj;
        const newId = uuidv4();
        newSelectedIds.push(newId);
        newObjectsList.push({
          ...rest,
          id: newId,
          position: [rest.position[0] + 1, rest.position[1], rest.position[2] + 1],
          name: `${rest.name} (Copy)`,
        });
      });

      const newObjects = [...state.objects, ...newObjectsList];
      const historyUpdate = pushHistory({ ...state, objects: newObjects });
      
      return {
        objects: newObjects,
        selectedObjectIds: newSelectedIds,
        ...historyUpdate
      };
    }),

  copySelected: () => {
    const { selectedObjectIds, objects } = get();
    if (selectedObjectIds.length === 0) return;
    const selectedObjs = objects.filter(o => selectedObjectIds.includes(o.id));
    const clipboardData = selectedObjs.map(obj => {
      const { id, ...rest } = obj;
      return JSON.parse(JSON.stringify(rest));
    });
    set({ clipboard: clipboardData });
  },

  cutSelected: () => {
    const { selectedObjectIds, objects, copySelected, deleteSelected } = get();
    if (selectedObjectIds.length === 0) return;
    copySelected();
    deleteSelected();
  },

  pasteClipboard: () =>
    set((state) => {
      if (state.clipboard.length === 0) return state;
      
      const newObjectsList: SceneObject[] = [];
      const newSelectedIds: string[] = [];
      
      state.clipboard.forEach(clipObj => {
        const newId = uuidv4();
        newSelectedIds.push(newId);
        newObjectsList.push({
          ...JSON.parse(JSON.stringify(clipObj)),
          id: newId,
          position: [clipObj.position[0] + 1, clipObj.position[1], clipObj.position[2] + 1],
          name: `${clipObj.name} (Pasted)`,
        });
      });

      const newObjects = [...state.objects, ...newObjectsList];
      const historyUpdate = pushHistory({ ...state, objects: newObjects });
      
      return {
        objects: newObjects,
        selectedObjectIds: newSelectedIds,
        ...historyUpdate
      };
    }),

  undo: () =>
    set((state) => {
      if (state.historyIndex <= 0) return state;
      const newIndex = state.historyIndex - 1;
      const entry = state.history[newIndex];
      return {
        objects: JSON.parse(JSON.stringify(entry.objects)),
        selectedObjectIds: [...entry.selectedObjectIds],
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
        selectedObjectIds: [...entry.selectedObjectIds],
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
      return { objects: [], ...historyUpdate };
    }),

  loadScene: (objects) => set((state) => {
    const historyUpdate = pushHistory({ ...state, objects });
    return {
      objects,
      selectedObjectIds: [],
      activeTool: 'select',
      ...historyUpdate,
    };
  }),

  getSelectedObjects: () => {
    const { objects, selectedObjectIds } = get();
    return objects.filter((o) => selectedObjectIds.includes(o.id));
  },
}));
