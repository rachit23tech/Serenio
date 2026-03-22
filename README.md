# Serenio — Your Private Mental Wellness Companion

A voice-first mental health companion web app built with React + TypeScript, powered by **on-device AI** using the [`@runanywhere/web`](https://www.npmjs.com/package/@runanywhere/web) SDK. All AI inference runs locally in the browser via WebAssembly — no server, no API key, 100% private.

> "Would you share your deepest feelings with an app that sends everything to a server? Serenio keeps it all on your device. Always."

---

## 🌟 Features

| Page | What it does |
|------|-------------|
| **Voice** | Speak naturally — Serenio listens, understands, and responds like a caring friend. Full STT → LLM → TTS pipeline runs on-device. |
| **Chat** | Type your thoughts and get warm, casual responses from Serenio — no cloud, no data leaving your device. |
| **Mood** | Log your daily mood, get 15 personalized activity suggestions with quotes, and track your 7-day mood history. |
| **History** | Your private journal — every voice and chat session saved locally on your device only. |

---

## 🔒 Privacy by Design

- **Zero cloud costs** — all inference runs on your device
- **True privacy** — your voice, thoughts and feelings never leave your browser
- **Works offline** — airplane mode? No problem
- **Instant responses** — no network latency, sub-100ms time to first token
- **Crisis detection** — immediate helpline shown for sensitive situations

---

## 🆘 Crisis Support

Serenio automatically detects crisis situations and immediately shows verified Indian mental health helplines:

| Helpline | Number | Hours |
|---------|--------|-------|
| iCall | 9152987821 | Mon–Sat, 8am–10pm |
| Vandrevala Foundation | 1860-2662-345 | 24/7 |
| AASRA | 9820466627 | 24/7 |
| Snehi | 044-24640050 | Mon–Sat, 8am–10pm |

---

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Models download on first use and are cached in the browser's Origin Private File System (OPFS) — subsequent visits load instantly.

---

## 🤖 AI Models Used

| Model | Purpose | Size |
|-------|---------|------|
| LFM2 350M (LiquidAI) | LLM — conversation responses | ~250MB |
| Whisper Tiny | STT — speech to text | ~105MB |
| Piper TTS (Lessac) | TTS — text to speech | ~65MB |
| Silero VAD v5 | Voice activity detection | ~5MB |

---

## 🏗️ How It Works

```
@runanywhere/web (npm package)
  ├── WASM engine (llama.cpp, whisper.cpp, sherpa-onnx)
  ├── Model management (download, OPFS cache, load/unload)
  └── TypeScript API (TextGeneration, STT, TTS, VAD, VoicePipeline)
```

Voice pipeline flow:
```
User speaks → VAD detects speech → Whisper transcribes → LFM2 responds → Piper speaks back
     ↓
Everything runs locally. Nothing sent to any server.
```

---

## 📁 Project Structure

```
src/
├── main.tsx                  # React root + SDK preload + SOS button
├── App.tsx                   # Tab navigation fallback
├── runanywhere.ts            # SDK init + model catalog
├── pages/
│   ├── Landing.tsx           # Splash / welcome screen
│   ├── Home.tsx              # Voice orb — main experience
│   ├── Session.tsx           # Chat interface
│   ├── Mood.tsx              # Mood check-in + activity suggestions
│   └── History.tsx           # Journal / session history
├── components/
│   ├── Sidebar.tsx           # Navigation sidebar
│   ├── SOSButton.tsx         # Always-visible crisis help button
│   ├── VoiceTab.tsx          # Voice pipeline (fallback)
│   └── ChatTab.tsx           # Chat (fallback)
├── context/
│   ├── ThemeContext.tsx       # Light/dark mode
│   └── HistoryContext.tsx     # Session + mood persistence (localStorage)
├── workers/
│   └── vlm-worker.ts         # VLM Web Worker
├── hooks/
│   └── useModelLoader.ts     # Model download/load hook
└── styles/
    └── index.css             # Global styles + Tailwind
```

---

## 🎨 Design

- **Color palette** — Warm cream `#FDF6EC`, Soft peach `#F4A261`, Sage green `#84A98C`
- **Typography** — Nunito (calm, friendly, readable)
- **Theme** — Light mode default, dark mode supported
- **Feel** — Like a warm hug in app form. Not clinical, not scary.

---

## 🚢 Deployment

### Vercel
```bash
npm run build
npx vercel --prod
```
The included `vercel.json` sets the required Cross-Origin-Isolation headers.

### Netlify
Add a `_headers` file:
```
/*
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: credentialless
```

### Any static host
Serve the `dist/` folder with these HTTP headers:
```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: credentialless
```

---

## 🌐 Browser Requirements

- Chrome 96+ or Edge 96+ (recommended: 120+)
- WebAssembly (required)
- SharedArrayBuffer (requires Cross-Origin Isolation headers)
- OPFS (for persistent model cache)
- Microphone access (for voice features)

---

## 👥 Team

Built at HackXtreme with help of my Teammates Ayush and Somesh using the RunAnywhere SDK for fully on-device AI.

---

## 📚 Resources

- [RunAnywhere Docs](https://docs.runanywhere.ai)
- [RunAnywhere npm](https://www.npmjs.com/package/@runanywhere/web)
- [RunAnywhere GitHub](https://github.com/RunanywhereAI/runanywhere-sdks)
- [RunAnywhere Discord](https://discord.com/invite/N359FBbDVd)

---

## 📄 License

MIT
