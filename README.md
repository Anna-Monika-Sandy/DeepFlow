# 🌊 DeepFlow

**An immersive underwater meditation and education experience for the web.**

Inspired by BBC's *Our Planet: Ocean*, DeepFlow invites you to explore a calm 3D
underwater world — coral, seaweed, and marine life drifting through the deep.
Hidden interactive spots trigger a guided breathing meditation, and sea creatures
reveal educational facts about ocean life. It runs in any desktop or mobile
browser, and in VR headsets via WebXR.

## 🔗 Live Demo

👉 **[Open the experience](https://deep-flow-mu.vercel.app/)**

## ✨ Features

- **First-person exploration** — swim freely with WASD + mouse on desktop, drag-to-look on mobile, and full head tracking in VR.
- **Guided breathing meditation** — approach the glowing meditation point and click (or press **K**) to enter a 1-minute box-breathing session with a spiral particle ring that expands and contracts to guide your breath. The world fades away so you can focus.
- **Interactive sea life** — click the orca, manta ray, or coral plant to open educational info cards about each species.
- **Living ecosystem** — a school of tropical fish splits into dozens of independently swimming fish, plus emperor angelfish, tuna, and a gliding manta ray, all driven by a lightweight steering AI.
- **Atmosphere** — a 360° underwater videosphere background, drifting "marine snow" plankton particles, soft fog, and an ambient ocean soundtrack you can toggle on/off.
- **Cross-platform & VR** — one codebase serves desktop, mobile, and WebXR; VR adds laser-pointer controllers for the same interactions.

## 🎮 Controls

| Action | Desktop | Mobile | VR |
|---|---|---|---|
| Move | `W` `A` `S` `D` | — | — |
| Look around | Click + drag | Drag | Move head |
| Interact | Click | Tap |
| Start meditation | Click point / `K` | Tap point |
| Exit meditation | `Esc` / click | Tap anywhere |
| Toggle sound | Button (top-right) | Button | In-world button |

## 🛠️ Tech Stack

- **[A-Frame 1.5](https://aframe.io/)** — 3D scene graph, WebXR, camera, entity-component architecture
- **[aframe-extras](https://github.com/c-frame/aframe-extras)** — WASD movement, animation mixer, laser controls
- **[Three.js](https://threejs.org/)** — custom particle systems (marine snow, breathing ring) via `Points` + `BufferGeometry`
- **[gltf-transform](https://gltf-transform.dev/)** — GLB model optimization (textures → WebP), reducing model payload by ~75%

## 🚀 Run Locally

```bash
# Clone the repo
git clone <repo-url>
cd DeepFlow

# Serve with any static server (3D assets need http://, not file://)
npx serve .
# or use the VS Code "Live Server" extension
```

Then open the served URL (e.g. `http://localhost:3000`).

## 📁 Project Structure

```
DeepFlow/
├── index.html          # Scene markup + asset declarations
├── css/                # Button styles, cursor overrides
├── js/
│   ├── main.js         # Entry point — registers every component
│   ├── fish.js         # Fish AI: steering, school splitter, spawners
│   ├── marine-snow.js  # Plankton particle system
│   ├── meditation-*.js # Meditation point, attractor, breathing mode
│   ├── breathing-ring.js
│   ├── *-info-popup.js # Educational cards for sea creatures
│   ├── soundplayer.js  # Ambient audio toggle (desktop + VR)
│   └── ...
└── assets/
    ├── models/         # Optimized .glb models
    ├── video/          # Underwater videosphere background
    ├── audio/          # Ambient soundtrack
    └── images/         # UI icons
```

## 👥 Team

- **Monika Kolev**
- **Sandy Shohdy**
- **Anna Baidikova**

Built as a team project for the Frontend Developer program (Hyper Island).


## 🙏 Credits

 3D models from [Sketchfab](https://sketchfab.com/) (Creative Commons)
