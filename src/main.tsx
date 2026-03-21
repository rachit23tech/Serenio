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

import { ThemeProvider } from './context/ThemeContext'
import { HistoryProvider } from './context/HistoryContext'

import Landing from './pages/Landing'
import Home    from './pages/Home'
import Session from './pages/Session'
import Mood    from './pages/Mood'
import History from './pages/History'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <HistoryProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/"        element={<Landing />} />
            <Route path="/home"    element={<Home />}    />
            <Route path="/session" element={<Session />} />
            <Route path="/mood"    element={<Mood />}    />
            <Route path="/history" element={<History />} />
            <Route path="/sdk"     element={<App />}     />
          </Routes>
        </BrowserRouter>
      </HistoryProvider>
    </ThemeProvider>
  </StrictMode>
)