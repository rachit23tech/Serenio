/**
 * main.tsx — App entry point
 * Routes:
 *   /           → Landing (splash)
 *   /home       → Home (voice orb)
 *   /session    → Session (chat)
 *   /mood       → Mood check-in
 *   /history    → Journal history
 *   /sdk        → Original RunAnywhere SDK UI
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/index.css'
import { initSDK } from './runanywhere'
import { ModelManager } from '@runanywhere/web'

import { ThemeProvider } from './context/ThemeContext'
import { HistoryProvider } from './context/HistoryContext'
import SOSButton from './components/SOSButton'

import Landing from './pages/Landing'
import Home    from './pages/Home'
import Session from './pages/Session'
import Mood    from './pages/Mood'
import History from './pages/History'
import { App } from './App'

// Initialize SDK and preload ALL models at app startup
// Models cache in browser after first download — instant on next visit
initSDK().then(async () => {
  console.log('✅ SDK Ready — preloading models...');
  try {
    await Promise.all([
      ModelManager.loadModel('lfm2-350m-q4_k_m'),
      ModelManager.loadModel('sherpa-onnx-whisper-tiny.en'),
      ModelManager.loadModel('vits-piper-en_US-lessac-medium'),
      ModelManager.loadModel('silero-vad-v5'),
    ]);
    console.log('✅ All models loaded and cached!');
  } catch (err) {
    console.warn('⚠️ Some models failed to preload:', err);
  }
}).catch(console.error);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <HistoryProvider>
        <BrowserRouter>
          <>
            <Routes>
              <Route path="/"        element={<Landing />} />
              <Route path="/home"    element={<Home />}    />
              <Route path="/session" element={<Session />} />
              <Route path="/mood"    element={<Mood />}    />
              <Route path="/history" element={<History />} />
              <Route path="/sdk"     element={<App />}     />
            </Routes>
            <SOSButton />
          </>
        </BrowserRouter>
      </HistoryProvider>
    </ThemeProvider>
  </StrictMode>
)