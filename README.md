# 🎮 CSA Caster Production Kit  
**Version 2 – Active Development**

The **CSA Caster Production Kit** is a custom desktop application built to power live Rocket League esports broadcasts.  
It serves as the **central control hub** for overlays, series data, live match state, and broadcast utilities.

Version 2 is a **ground-up rebuild** focused on stability, flexibility, and a fully custom user experience.

---

## ✨ What This Version Is

Version 2 represents a major architectural shift from earlier iterations.

Instead of a single monolithic overlay app, the system is now split into **multiple dedicated views**, each with a clear responsibility:

- **Control Panel** – Operator-facing UI used during broadcasts
- **Overlay** – Browser-based overlay served locally to OBS
- **End Game** – Dedicated end-of-series / post-match presentation scene

Each view runs independently but shares state through WebSockets and internal services.

---

## 🧩 Core Features

### ✅ Control Panel (≈80% Complete)
- Fully custom Electron UI (no default OS chrome)
- Tailwind + daisyUI powered interface
- Live series control:
  - Team selection
  - Custom team name overrides
  - Series length & score management
  - Timeout tracking
  - Top-bar text control
- Real-time **connection status indicators**:
  - Overlay Server
  - Overlay WebSocket
  - Rocket League connection (via ws-relay)
- Designed to scale with future tools (settings, extra features, diagnostics)

### 🟡 Overlay (In Progress)
- Live scoreboard and match state
- Player boost meters
- Player stat cards
- Replay tag handling
- Statfeed events
- Tight integration with Rocket League game data
- Served locally and consumed directly by OBS as a browser source

### 🔜 End Game
- Post-match presentation scene
- Series results and summaries
- MVP / stat-focused layouts
- Designed as a dedicated broadcast moment

---

## 🧠 Architecture Overview

The application uses a **multi-process Electron architecture**:

### Electron Main Process
- Window management
- Local overlay HTTP server
- Background service lifecycle
- Secure IPC bridge

### Renderer Processes
- Control Panel UI
- Overlay UI
- End Game UI

### Background Services
- Overlay server (serves overlay HTML)
- WebSocket relay (Rocket League → app)
- Internal WebSocket messaging

This structure keeps each system isolated, predictable, and easy to debug.

---

## 🛠️ Tech Stack

### Frontend
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **daisyUI**
- **react-icons**

### Desktop / Platform
- **Electron**
- **electron-builder**
- Fully custom window chrome (custom title bar & controls)

### Build & Tooling
- **Vite**
- **TypeScript Compiler**
- **ES Modules**
- Electron preload + IPC

### Communication
- **WebSockets**
- Local HTTP overlay server
- IPC-safe APIs exposed via preload

---

## 🧪 Development Status

This version is **actively under development**.

### Current Priorities
1. Finalize Control Panel logic
2. Fully stabilize Overlay data flow
3. Implement End Game scene
4. Add production safeguards & error handling
5. UX polish for live broadcast conditions

---

## 🎯 Design Philosophy

- **Broadcast-first UX** – fast, readable, predictable
- **No unnecessary abstractions** – clarity over cleverness
- **Modular scenes** – each view does one job well
- **Custom look & feel** – no default Electron appearance
- **Future-proof architecture** – built to scale

---

## 📦 Distribution

The app is packaged using **electron-builder** and distributed as a native installer.

- Windows (NSIS installer)
- Custom app icon & branding
- External services bundled safely at install time

---

## 🚧 Notes

This repository reflects an **internal production tool**.  
Features, structure, and naming may change as the broadcast pipeline evolves.

---

*CSA Caster Production Kit v2 is built to support high-quality, reliable esports broadcasts — and to grow alongside CSA productions. Designed and Developed by NuKEy (support: Blizzy; Christopher)*
