import { create } from 'zustand';
import { SceneObject } from './editorStore';

interface ProjectData {
  name: string;
  objects: SceneObject[];
  createdAt: string;
  updatedAt: string;
  version: string;
}

interface ProjectState {
  projectName: string;
  lastSaved: string | null;
  autoSaveEnabled: boolean;
  setProjectName: (name: string) => void;
  saveProject: (objects: SceneObject[]) => void;
  loadProject: () => ProjectData | null;
  listProjects: () => string[];
  deleteProject: (name: string) => void;
  exportProjectJSON: (objects: SceneObject[]) => string;
  importProjectJSON: (json: string) => SceneObject[] | null;
}

const STORAGE_PREFIX = 'archieverse_project_';
const PROJECT_VERSION = '1.0.0';

export const useProjectStore = create<ProjectState>((set, get) => ({
  projectName: 'Untitled Project',
  lastSaved: null,
  autoSaveEnabled: true,

  setProjectName: (name) => set({ projectName: name }),

  saveProject: (objects) => {
    const { projectName } = get();
    const now = new Date().toISOString();
    const data: ProjectData = {
      name: projectName,
      objects,
      createdAt: localStorage.getItem(`${STORAGE_PREFIX}${projectName}`)
        ? JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}${projectName}`) || '{}').createdAt || now
        : now,
      updatedAt: now,
      version: PROJECT_VERSION,
    };
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${projectName}`, JSON.stringify(data));
      set({ lastSaved: now });
    } catch (e) {
      console.error('Failed to save project:', e);
    }
  },

  loadProject: () => {
    const { projectName } = get();
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${projectName}`);
      if (!raw) return null;
      return JSON.parse(raw) as ProjectData;
    } catch (e) {
      console.error('Failed to load project:', e);
      return null;
    }
  },

  listProjects: () => {
    const projects: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        projects.push(key.replace(STORAGE_PREFIX, ''));
      }
    }
    return projects;
  },

  deleteProject: (name) => {
    localStorage.removeItem(`${STORAGE_PREFIX}${name}`);
  },

  exportProjectJSON: (objects) => {
    const { projectName } = get();
    const data: ProjectData = {
      name: projectName,
      objects,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: PROJECT_VERSION,
    };
    return JSON.stringify(data, null, 2);
  },

  importProjectJSON: (json) => {
    try {
      const data = JSON.parse(json) as ProjectData;
      if (!data.objects || !Array.isArray(data.objects)) return null;
      set({ projectName: data.name || 'Imported Project' });
      return data.objects;
    } catch {
      console.error('Failed to import project');
      return null;
    }
  },
}));
