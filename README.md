# 😊 Smiley — Desktop AI Companion

A warm, friendly AI chat app built with React + Electron.

---

## ⚡ Quick Setup (5 minutes)

### 1. Prerequisites
- Install **Node.js** (v18 or later): https://nodejs.org
- Get a free **Anthropic API key**: https://console.anthropic.com

### 2. Install dependencies
Open a terminal, navigate to this folder, and run:
```bash
npm install
```

### 3. Run in development mode (instant preview)
```bash
npm run dev
```
This opens Smiley as a real desktop window!

---

## 📦 Build a distributable .exe / .dmg / .AppImage

Once you're happy, package it into a proper installer:

```bash
npm run electron:build
```

The output will be in the `dist/` folder:
- **Windows**: `dist/Smiley Setup 1.0.0.exe`
- **macOS**: `dist/Smiley-1.0.0.dmg`
- **Linux**: `dist/Smiley-1.0.0.AppImage`

---

## 🔑 API Key
On first launch, Smiley will ask for your Anthropic API key.
- Get one free at https://console.anthropic.com
- It's stored locally on your machine (localStorage)
- You can change it anytime via the ⚙ Key button

---

## 📁 Project Structure
```
smiley-app/
├── main.js          ← Electron main process
├── preload.js       ← Secure IPC bridge
├── package.json     ← Dependencies & build config
├── public/
│   └── index.html
└── src/
    ├── App.js       ← Main chat UI
    ├── index.js     ← React entry point
    └── index.css    ← Global styles & animations
```

---

## 🛠 Scripts
| Command | Description |
|---|---|
| `npm run dev` | Run app in development (hot reload) |
| `npm run build` | Build React for production |
| `npm run electron:build` | Package into installer |
