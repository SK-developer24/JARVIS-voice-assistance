# JARVIS — Voice Controlled AI Application Assistant
**Project Type:** AIML Major College Project  
**Student:** Sourabh Sahu (Artificial Intelligence & Machine Learning)  
**Mentor:** Dr. Neelam Arya  
**Target Workspace:** `C:\Users\user\OneDrive\Desktop\JARVIS`

---

## 1. Executive Summary & Objective
JARVIS is an intelligent, voice-controlled desktop AI command center that provides:
1. **Natural Voice Interaction:** Full speech-to-text (STT) input and text-to-speech (TTS) voice responses.
2. **Deterministic & Generative Brain:** Dual-route intent router for fast local PC actions and an LLM fallback (Gemini API) for conversational knowledge and coding queries.
3. **PC & Phone Control:** Automates desktop applications (VS Code, Chrome, YouTube, File Manager, System Tools) and controls Android phones via ADB over Wi-Fi (e.g., WhatsApp video calls, app launching).
4. **Futuristic 3D Command Center UI:** A sci-fi 2-layer interface built with **React, Three.js (React Three Fiber), and Tailwind CSS**.

---

## 2. Complete End-to-End System Architecture

```text
User Voice / UI Input
       │
       ▼
React Frontend (Three.js 3D WebGL Canvas + Glassmorphism HUD)
       │
       ▼ (WebSockets / REST API)
FastAPI Python Backend
       │
       ▼
Speech-to-Text & Intent Router
  ├── Local Command Engine ───────────────► PC Automation & Apps
  ├── ADB Phone Automation Bridge ────────► Android Phone (WhatsApp, Calls)
  └── LLM Brain (Gemini API) ─────────────► Generative AI Reasoning & Q&A
       │
       ▼
Text-to-Speech Engine (pyttsx3 / edge-tts) & Audio Frequency Stream
       │
       ▼
FastAPI Backend ──► WebSockets ──► React 3D Equalizers & Voice Response
```

---

## 3. UI/UX 3D Design Specifications (From Mockup)

The interface follows a **2-Layer Architecture**:

### Layer 1: 3D WebGL Environment (Three.js / React Three Fiber)
- **Atmosphere:** Deep obsidian navy (`#030712` to `#060D24`) futuristic control deck overlooking a distant cyberpunk skyline with neon lighting and atmospheric volumetric fog.
- **Mouse Parallax:** 360° subtle camera parallax responding smoothly to cursor movement.
- **Central Holographic AI Core:**
  - Floating 3D holographic sphere with glowing cyan wireframe edges.
  - Sleek 3D robotic humanoid head inside wearing futuristic cybernetic headphones with glowing neon cyan slit eyes (`#00F0FF`).
  - Concentric rotating laser rings on the ground platform.
  - Ambient glowing cyber dust particles.
  - Interactive states: **Idle** (floating/breathing), **Listening** (energy ripples expand), **Thinking** (data particle vortex), **Speaking** (laser pulses).

### Layer 2: Fixed Holographic HUD Overlay (React Glassmorphism)
- **Top Navigation Bar:** `J.A.R.V.I.S. AI VOICE ASSISTANT` logo + Tabs (`HOME`, `DASHBOARD`, `APPS`, `TOOLS`, `SETTINGS`, `ABOUT`) + Mic/Keyboard utility icons.
- **Left Column Cards:**
  1. *Location Card:* 📍 Bengaluru, India (or Gwalior), coordinates, and futuristic skyline wireframe.
  2. *System Status Card:* Circular gauges for CPU (42%), RAM (58%), Battery (86%), Network (Connected).
  3. *Quick Apps:* One-click tiles for YouTube, Chrome, VS Code, Spotify, WhatsApp, Calculator.
  4. *Activity Monitor:* Live timestamped log of executed tasks (`16:10:24 Opened YouTube`, etc.).
- **Right Column Cards:**
  1. *System Info:* Digital Clock (`16:16:24`), Date, Weather (`30°C Clear Sky`), Uptime, User (`Sourabh Sahu`).
  2. *Voice Commands:* Interactive clickable suggestion cards (`"Open YouTube"`, `"Search Python tutorials"`, etc.).
  3. *AI Chat:* Text input drawer with `START CHAT` for typing queries.
  4. *System Log:* Security shield badge (`All systems functioning normally`).
- **Center Voice Control Capsule:** Floating glass pill with real-time stereo cyan audio waveforms reacting dynamically to microphone audio frequency.
- **Bottom Quick Actions:** 5 Large glass tiles (`FILE MANAGER`, `WEB SEARCH`, `SYSTEM TOOLS`, `SETTINGS`, `SHUTDOWN`).
- **Bottom Status Bar:** `🟢 JARVIS is online and ready to assist you!`.

---

## 4. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **React + Vite** | High performance, modular UI component tree |
| **3D Graphics Engine** | **Three.js (`@react-three/fiber`, `@react-three/drei`)** | 100% Free & Open-source 3D WebGL rendering |
| **Styling & Icons** | **Tailwind CSS + Lucide React + Framer Motion** | Glassmorphism, animations, futuristic neon glows |
| **Audio Processing** | **Web Audio API** | Real-time frequency analyzer for dynamic waveforms |
| **Backend Framework** | **Python (FastAPI + Uvicorn)** | Asynchronous REST and WebSockets server |
| **Speech-to-Text (STT)** | `SpeechRecognition` (Google STT / Vosk) | Real-time voice capture and transcription |
| **Text-to-Speech (TTS)** | `pyttsx3` / `edge-tts` | Zero-latency and natural voice synthesis |
| **Generative AI** | **Google Gemini API** (`google-genai`) | LLM reasoning, code explanations, open Q&A |
| **Phone Automation** | **ADB (Android Debug Bridge) via Wi-Fi** | Zero-app Android control (WhatsApp calls, apps) |
| **System Automation** | `subprocess`, `os`, `webbrowser`, `psutil` | Safe OS task automation and hardware stats |

---

## 5. Phased Development Roadmap

1. **Phase 1: Project Scaffolding & Setup**
   - Initialize React + Vite frontend with Three.js & Tailwind CSS.
   - Initialize Python FastAPI backend with WebSockets endpoint.
2. **Phase 2: 3D Holographic UI & Frontend Dashboard**
   - Build the Three.js 3D Holographic Sphere, Robot Head, and concentric laser floor rings.
   - Implement the complete Glassmorphic HUD overlay (Navigation, Cards, Waveforms, Quick Actions).
3. **Phase 3: Python Backend Audio Pipeline & Intent Engine**
   - Implement STT listener and TTS speaker with real-time WebSocket communication.
   - Build rule-based intent router for instant local commands.
4. **Phase 4: Phone Control & System Integration**
   - Integrate ADB over Wi-Fi for Android automation (WhatsApp video call to Papaji, etc.).
   - Connect live CPU, RAM, battery, and weather data feeds.
5. **Phase 5: LLM Brain & Polish**
   - Connect Gemini API for conversational AI and coding answers.
   - Final end-to-end testing and presentation readiness.
