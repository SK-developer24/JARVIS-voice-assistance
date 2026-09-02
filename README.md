# 🤖 J.A.R.V.I.S. — Voice Controlled AI Application Assistant

An advanced, futuristic Desktop & Mobile Voice Assistant featuring a **3D WebGL Holographic HUD**, **Google Gemini Multimodal Vision & Reasoning**, **Real-Time Web RAG Search**, and **Wireless Android ADB Automation**.

---

## 👨‍💻 Project Information
* **Student:** Sourabh Sahu
* **Department:** Artificial Intelligence & Machine Learning (AIML)
* **Mentor:** Dr. Neelam Arya
* **Version:** 2.0.0

---

## ⚡ Key Capabilities & Architecture

```
                         USER (Voice / Text / Multimodal)
                                        │
                                        ▼
                         JARVIS UNIVERSAL AI BRAIN
                                        │
        ┌───────────────────┬───────────┴───────────┬───────────────────┐
        ▼                   ▼                       ▼                   ▼
    COMMANDS            AI CHAT                 WEB SEARCH        FILE / VISION
  (PC & Phone)      (Gemini Reason)         (Live Web RAG)      (Docs, Quiz, Vision)
        │                   │                       │                   │
        ▼                   ▼                       ▼                   ▼
  Allowlist Router      Gemini LLM             Search Engine      Multimodal Engine
(Apps/ADB Unlock)   (Context Memory)        (SSRF Protected)    (Images/PDFs/Code)
        │                   │                       │                   │
        └───────────────────┼───────────────────────┴───────────────────┘
                            ▼
                    JARVIS RESPONSE
                   (UI + Voice TTS)
```

### 1. 🌐 General Web Search & Web RAG
* **Multi-Provider Architecture:** Built-in zero-config organic search (`DuckDuckGoProvider`) + API search (`Tavily`, `Serper`, `Brave`).
* **Hardened SSRF Protection:** Pre-connect DNS resolution check blocking loopback, private IPv4/IPv6 subnets, and cloud metadata endpoints.
* **Anti-Hallucination Synthesis:** Cites live sources with `[1]`, `[2]` inline citations and clickable source cards.

### 2. 👁️ Multimodal Vision & Document Intelligence
* **Image Recognition:** Visual recognition of objects, animal breeds, code screenshots, handwritten text, and scenes via Gemini Multimodal.
* **Document Q&A:** Summarization, key insights, and automated 5-question multiple choice quizzes.

### 3. 📱 POCO M3 Pro 5G Wireless Phone Bridge
* **Auto-Screen Unlock:** Automatically wakes screen, swipes up, and enters security PIN via wireless ADB.
* **App & Communication Automation:** WhatsApp voice & video calls, YouTube song search & auto-tap playback, and app launching.

### 4. 💻 Allowlisted PC Security Layer
* Zero arbitrary shell execution; strictly allowlisted app launchers (Chrome, VS Code, Spotify, WhatsApp Web, Calculator, File Explorer).

---

## 🚀 Getting Started

### Prerequisites
* Python 3.10+
* Node.js 18+ & npm
* Android device with Wireless Debugging enabled (Optional for Phone Bridge)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser!

---

## ⚙️ Configuration
Configure your **Gemini API Key**, **Gemini Model Endpoint**, **Web Search Provider**, and **Phone ADB IP/PIN** directly in the holographic **SETTINGS** modal inside the JARVIS dashboard. Preferences are permanently saved locally.

---

## 📜 License
This project is developed for educational and research purposes in the Department of Artificial Intelligence & Machine Learning.
