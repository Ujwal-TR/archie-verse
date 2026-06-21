# Archie-Verse 🏛️

**Archie-Verse** is a professional-grade, browser-based 3D architectural modeling tool. It allows users to design, visualize, and interact with architectural spaces in real-time, entirely within their browser—no downloads, plugins, or costs required.

## ✨ Features

- **Parametric Elements**: Easily place and adjust walls, floors, roofs, stairs, furniture, lighting, and plumbing with real-world dimensions (in meters).
- **60 FPS Real-time Rendering**: Powered by WebGL and React Three Fiber, featuring smooth camera controls, HDRI lighting, and dynamic contact shadows.
- **Drag & Drop**: Seamlessly move and position elements across the 3D ground plane with snapping and grid alignment.
- **Multi-View Modes**: Switch between 3D perspective, 2D floor plans, and immersive walkthrough modes.
- **Export Options**: Download your creations as GLTF, OBJ, JSON, or instantly capture high-resolution PNG screenshots.
- **Session Persistence**: Your project automatically saves to your local browser storage—never lose your work on accidental refreshes.
- **Zero Install**: Jump straight into the editor. Cross-platform compatibility for desktops, tablets, and laptops.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **3D Engine**: Three.js & React Three Fiber (R3F)
- **State Management**: Zustand
- **Styling**: Vanilla CSS Modules (Cinematic & Glassmorphic UI)
- **Icons**: Lucide React

## 🚀 Getting Started

First, clone the repository and install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The cinematic landing page will welcome you, and you can jump right into the `/editor` to start building!

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Ctrl+C** | Copy selected element |
| **Ctrl+X** | Cut selected element |
| **Ctrl+V** | Paste clipboard |
| **Ctrl+D** | Duplicate selected element |
| **Ctrl+Z** | Undo |
| **Ctrl+Shift+Z** | Redo |
| **Ctrl+K** | Open Command Palette |
| **Del** | Delete Selected Element |
| **Esc** | Deselect / Cancel |

## 🎨 Architecture & Design
Archie-Verse embraces a minimalist, premium dark-mode aesthetic with smooth scroll-reveal animations, glowing interactive elements, and an overarching "glassmorphism" look for all editor panels. 

---
*Built with passion for modern web-based 3D modeling.*
