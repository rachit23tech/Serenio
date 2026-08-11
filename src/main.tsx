import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './styles/index.css'
import { initSDK } from './runanywhere'

import { ThemeProvider } from './context/ThemeContext'
import { HistoryProvider } from './context/HistoryContext'
import { ModelCacheProvider } from './context/ModelCacheContext'
import { WellnessProvider } from './context/WellnessContext'
import { NotificationProvider } from './context/NotificationContext'
import { PrivateModeProvider } from './context/PrivateModeContext'
import SOSButton from './components/SOSButton'
import NotificationCenter from './components/NotificationCenter'

import Landing from './pages/Landing'
import Home    from './pages/Home'
import Session from './pages/Session'
import Mood    from './pages/Mood'
import History from './pages/History'
import VentingSpace from './pages/VentingSpace'
import WellnessHub from './pages/WellnessHub'
import GoalsHub from './pages/GoalsHub'

// Initialize the SDK once at startup.
// Individual pages decide whether to use cached models or local fallback mode.
initSDK().catch(console.error);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ModelCacheProvider>
        <HistoryProvider>
          <WellnessProvider>
            <NotificationProvider>
              <PrivateModeProvider>
                <BrowserRouter>
                  <>
                    <Routes>
                      <Route path="/"          element={<Landing />} />
                      <Route path="/home"      element={<Home />}    />
                      <Route path="/session"   element={<Session />} />
                      <Route path="/mood"      element={<Mood />}    />
                      <Route path="/history"   element={<History />} />
                      <Route path="/venting"   element={<VentingSpace />} />
                      <Route path="/wellness"  element={<WellnessHub />} />
                      <Route path="/goals"     element={<GoalsHub />} />
                      <Route path="*"          element={<Navigate to="/home" replace />} />
                    </Routes>
                    <SOSButton />
                    <div style={{
                      position: 'fixed',
                      top: 20,
                      right: 20,
                      zIndex: 1000,
                    }}>
                      <NotificationCenter />
                    </div>
                  </>
                </BrowserRouter>
              </PrivateModeProvider>
            </NotificationProvider>
          </WellnessProvider>
        </HistoryProvider>
      </ModelCacheProvider>
    </ThemeProvider>
  </StrictMode>
)
