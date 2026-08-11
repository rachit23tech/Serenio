# Serenio — Your Private Mental Wellness Companion

A voice-first mental health companion web app built with React + TypeScript, powered by **on-device AI** using the [`@runanywhere/web`](https://www.npmjs.com/package/@runanywhere/web) SDK. All AI inference runs locally in the browser via WebAssembly — no server, no API key, 100% private.

> "Would you share your deepest feelings with an app that sends everything to a server? Serenio keeps it all on your device. Always."

---

## 🌟 Features

| Page | What it does |
|------|-------------|
| **Voice** | Speak naturally — Serenio listens, understands, and responds like a caring friend. Full STT → LLM → TTS pipeline runs on-device. |
| **Chat** | Type your thoughts and get warm, casual responses from Serenio — no cloud, no data leaving your device. |
| **Mood** | Log your daily mood, get personalized activity recommendations, and track your mood trends. |
| **Journal & History** | Your private journal — every voice and chat session saved locally on your device only. |
| **Venting Space** | A dedicated non-judgmental space to express raw feelings without unprompted advice. |
| **Wellness Hub** | Guided CBT/mindfulness exercises and local sleep habit tracking with AI insights. |
| **Goals Hub** | Gentle habit tracker, medication reminders, and therapy appointment scheduling. |

---

## 🔒 Privacy by Design

- **Zero cloud costs** — all inference runs on your device
- **True privacy** — your voice, thoughts and feelings never leave your browser
- **Works offline** — airplane mode? No problem
- **Instant responses** — no network latency, sub-100ms time to first token
- **Crisis detection** — immediate helpline shown for sensitive situations

---

## 🆘 Crisis Support

Serenio automatically detects crisis situations and immediately shows verified mental health helplines:

| Helpline | Number | Hours |
|---------|--------|-------|
| iCall | 9152987821 | Mon–Sat, 8am–10pm |
| Vandrevala Foundation | 1860-2662-345 | 24/7 |
| AASRA | 9820466627 | 24/7 |
| Tele-MANAS | 14416 | 24/7 Toll-Free |
| 988 Lifeline | 988 | 24/7 (US/CA) |

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
├── main.tsx                  # React root + routing & providers
├── runanywhere.ts            # SDK init + model catalog
├── pages/
│   ├── Landing.tsx           # Splash / welcome screen
│   ├── Home.tsx              # Voice orb — main voice experience
│   ├── Session.tsx           # Text chat interface
│   ├── Mood.tsx              # Mood check-in & recommendations
│   ├── History.tsx           # Journal / session history
│   ├── VentingSpace.tsx      # Unfiltered private venting space
│   ├── WellnessHub.tsx       # Guided exercises & sleep tracking
│   └── GoalsHub.tsx          # Habit tracking, meds, and appointments
├── components/
│   ├── Sidebar.tsx           # Navigation sidebar with accessible controls
│   ├── SOSButton.tsx         # Always-visible emergency helpline modal
│   ├── NotificationCenter.tsx# Local scheduled notifications
│   ├── ExerciseModal.tsx     # Step-by-step guided CBT exercise modal
│   ├── PrivateModeToggle.tsx # Incognito session toggle
│   ├── VoiceTab.tsx          # On-device voice pipeline component
│   └── ChatTab.tsx           # On-device text chat component
├── context/
│   ├── ThemeContext.tsx      # Dark/light mode theme provider
│   ├── HistoryContext.tsx    # Local storage session & mood persistence
│   ├── WellnessContext.tsx   # Comprehensive wellness data store
│   ├── ModelCacheContext.tsx # Offline model pack management
│   ├── NotificationContext.tsx# Browser notification scheduler
│   └── PrivateModeContext.tsx# Private mode state manager
├── lib/
│   ├── companion.ts          # Companion prompt & response sanitizer
│   └── crisisDetection.ts    # Multi-level crisis detection logic
├── tokens.ts                 # Design tokens (colors, gradients, shadows)
└── styles/
    └── index.css             # Design system styles & Tailwind setup
```

---

## 🎨 Design

- **Color palette** — Warm cream `#FDF6EC`, Muted teal `#68A8A8`, Coral accent `#E8845A`
- **Typography** — Nunito (calm, friendly, readable)
- **Theme** — Light mode default, dark mode supported with persistent theme selection
- **Feel** — A warm, safe space in app form. Empathetic, not clinical.

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

## 👤 Author

Designed and built as a personal project exploring 100% on-device AI for privacy-first mental health companion applications.

---

## 📚 Resources

- [RunAnywhere Docs](https://docs.runanywhere.ai)
- [RunAnywhere npm](https://www.npmjs.com/package/@runanywhere/web)
- [RunAnywhere GitHub](https://github.com/RunanywhereAI/runanywhere-sdks)
- [RunAnywhere Discord](https://discord.com/invite/N359FBbDVd)

---

## 📄 License

MIT
