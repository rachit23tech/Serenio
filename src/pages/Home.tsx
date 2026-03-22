/**
 * Home.tsx — Voice orb screen connected to real pipeline
 * Route: /home
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../context/ThemeContext";
import { useHistory } from "../context/HistoryContext";
import { useModelCache } from "../context/ModelCacheContext";
import { usePrivateMode } from "../context/PrivateModeContext";
import { PrivateModeToggleCompact } from "../components/PrivateModeToggle";
import { getTheme } from "../tokens";
import { ModelCategory, ModelManager, AudioCapture, AudioPlayback, SpeechActivity } from '@runanywhere/web';
import { STT, TTS, VAD } from '@runanywhere/web-onnx';
import { useModelLoader } from '../hooks/useModelLoader';
import {
  CRISIS_RESPONSE,
  FAST_TEMPERATURE,
  FAST_VOICE_MAX_TOKENS,
  HELPLINE_NOTE,
  detectMoodFromText,
  generateCompanionReply,
  isCrisisText,
  sanitizeCompanionReply,
} from '../lib/companion';

type VoiceState = "idle" | "loading-models" | "listening" | "processing" | "responding";

function getOrbStyle(state: VoiceState, dark: boolean) {
  if (dark) {
    return {
      idle:       { bg: "radial-gradient(circle at 38% 32%, #9090CC 0%, #7AAAC0 45%, #68C0B8 80%, #60BEB0 100%)", glow: "rgba(96,190,176,0.3)"  },
      'loading-models': { bg: "radial-gradient(circle at 38% 32%, #8080BC 0%, #6898B0 100%)", glow: "rgba(104,152,176,0.2)" },
      listening:  { bg: "radial-gradient(circle at 38% 32%, #A8A8E0 0%, #88C0D0 45%, #78D0C8 100%)", glow: "rgba(120,208,200,0.45)" },
      processing: { bg: "radial-gradient(circle at 38% 32%, #8080BC 0%, #6898B0 100%)", glow: "rgba(104,152,176,0.35)" },
      responding: { bg: "radial-gradient(circle at 38% 32%, #68C0B8 0%, #5898B0 100%)", glow: "rgba(96,190,176,0.4)" },
    }[state];
  }
  return {
    idle:       { bg: "radial-gradient(circle at 38% 32%, #D4845A 0%, #C07888 40%, #A888AA 75%, #9880B8 100%)", glow: "rgba(192,120,136,0.3)" },
    'loading-models': { bg: "radial-gradient(circle at 38% 32%, #C07858 0%, #A06890 100%)", glow: "rgba(176,104,128,0.2)" },
    listening:  { bg: "radial-gradient(circle at 38% 32%, #E09060 0%, #D08090 45%, #B898C0 100%)", glow: "rgba(208,128,144,0.45)" },
    processing: { bg: "radial-gradient(circle at 38% 32%, #C07858 0%, #A06890 100%)", glow: "rgba(176,104,128,0.35)" },
    responding: { bg: "radial-gradient(circle at 38% 32%, #88B898 0%, #78A0B8 100%)", glow: "rgba(136,184,152,0.4)" },
  }[state];
}

export default function Home() {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const t = getTheme(dark);
  const { addSession } = useHistory();
  const { cacheState, online, packReady, progress, statusText, voiceReady } = useModelCache();
  const { isPrivateMode } = usePrivateMode();

  const sttLoader = useModelLoader(ModelCategory.SpeechRecognition, true);
  const ttsLoader = useModelLoader(ModelCategory.SpeechSynthesis, true);
  const vadLoader = useModelLoader(ModelCategory.Audio, true);

  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [responseText, setResponseText] = useState("");
  const [orbScale, setOrbScale] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<string | null>(null);

  const micRef = useRef<AudioCapture | null>(null);
  const vadUnsub = useRef<(() => void) | null>(null);
  const crisisDetected = useRef(false);

  useEffect(() => {
    if (voiceState !== "listening") { setOrbScale(1); return; }
    let up = true;
    const id = setInterval(() => { setOrbScale(up ? 1.07 : 1); up = !up; }, 700);
    return () => clearInterval(id);
  }, [voiceState]);

  useEffect(() => {
    return () => {
      micRef.current?.stop();
      vadUnsub.current?.();
    };
  }, []);

   const saveToHistory = (userSaid: string, serenioSaid: string) => {
     // Skip saving if in private mode
     if (isPrivateMode) return;
     
     const entry = {
       time: new Date().toLocaleString(),
       userSaid,
       serenioSaid,
       mood: null,
     };
     const existing = JSON.parse(localStorage.getItem('serenio-history') || '[]');
     existing.unshift(entry);
     localStorage.setItem('serenio-history', JSON.stringify(existing));
   };

  const ensureModels = async (): Promise<boolean> => {
    setVoiceState('loading-models');
    setError(null);
    setLoadingDetail(null);

    const steps = [
      { label: 'Loading voice activity detector...', run: vadLoader.ensure },
      { label: 'Loading speech recognition...', run: sttLoader.ensure },
      { label: 'Loading text to speech...', run: ttsLoader.ensure },
    ];

    for (const step of steps) {
      setLoadingDetail(step.label);
      const ok = await step.run();
      if (!ok) {
        setLoadingDetail(null);
        setError(online
          ? 'Serenio is still caching or loading the voice stack. Give it a moment or use chat meanwhile.'
          : 'Voice mode needs cached speech models on this device. Connect once online so Serenio can save them.');
        setVoiceState('idle');
        return false;
      }
    }

    if (
      ModelManager.getLoadedModel(ModelCategory.Audio)
      && ModelManager.getLoadedModel(ModelCategory.SpeechRecognition)
      && ModelManager.getLoadedModel(ModelCategory.SpeechSynthesis)
    ) {
      setLoadingDetail(null);
      setError(null);
      setVoiceState('idle');
      return true;
    }

    setLoadingDetail(null);
    setError('Voice stack did not finish loading cleanly. Try once more.');
    setVoiceState('idle');
    return false;
  };

  const processSpeech = useCallback(async (audioData: Float32Array) => {
    micRef.current?.stop();
    vadUnsub.current?.();
    setVoiceState('processing');
    crisisDetected.current = false;

    try {
      const sttResult = await STT.transcribe(audioData, { sampleRate: 16000 });
      const transcription = sttResult.text.trim();
      setTranscript(transcription);

      if (!transcription) {
        setVoiceState('idle');
        return;
      }

      let cleanResponse = '';

       if (isCrisisText(transcription)) {
         crisisDetected.current = true;
         cleanResponse = `${CRISIS_RESPONSE} ${HELPLINE_NOTE}`;
         setResponseText(cleanResponse);
         saveToHistory(transcription, cleanResponse);
         if (!isPrivateMode) {
           addSession({
             type: 'voice',
             date: new Date(),
             mood: 'struggling',
             userText: transcription,
             serenioResponse: cleanResponse,
           });
         }
       } else {
         const reply = await generateCompanionReply(transcription, {
           maxTokens: FAST_VOICE_MAX_TOKENS,
           temperature: FAST_TEMPERATURE,
           stream: false,
         });
         cleanResponse = sanitizeCompanionReply(reply.text, transcription);
         setResponseText(cleanResponse);
         saveToHistory(transcription, cleanResponse);
         if (!isPrivateMode) {
           addSession({
             type: 'voice',
             date: new Date(),
             mood: detectMoodFromText(transcription),
             userText: transcription,
             serenioResponse: cleanResponse,
           });
         }
       }

      if (cleanResponse && TTS.isVoiceLoaded) {
        setVoiceState('responding');
        const speech = await TTS.synthesize(cleanResponse, { speed: 1.0 });
        const player = new AudioPlayback({ sampleRate: speech.sampleRate });
        await player.play(speech.audioData, speech.sampleRate);
        player.dispose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }

     setVoiceState('idle');
   }, [addSession, isPrivateMode]);

  const handleOrbClick = async () => {
    // If already active — stop
    if (voiceState === 'listening') {
      micRef.current?.stop();
      vadUnsub.current?.();
      setVoiceState('idle');
      return;
    }

    if (voiceState !== 'idle') return;

    setTranscript('');
    setResponseText('');
    setError(null);
    setLoadingDetail(null);
    crisisDetected.current = false;

    const anyMissing = !ModelManager.getLoadedModel(ModelCategory.Audio)
      || !ModelManager.getLoadedModel(ModelCategory.SpeechRecognition)
      || !ModelManager.getLoadedModel(ModelCategory.SpeechSynthesis);

    if (anyMissing) {
      const ok = await ensureModels();
      if (!ok) return;
    }

    setVoiceState('listening');

    const mic = new AudioCapture({ sampleRate: 16000 });
    micRef.current = mic;

    VAD.reset();

    vadUnsub.current = VAD.onSpeechActivity((activity: any) => {
      if (activity === SpeechActivity.Ended) {
        const segment = VAD.popSpeechSegment();
        if (segment && segment.samples.length > 1600) {
          processSpeech(segment.samples);
        }
      }
    });

    await mic.start(
      (chunk: Float32Array) => { VAD.processSamples(chunk); },
      () => {},
    );
  };

  const orb = getOrbStyle(voiceState, dark);

  return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex" }}>
      <Sidebar active="home" />

      <main style={{
        flex: 1, marginLeft: 240,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "24px", position: "relative", overflow: "hidden",
        minHeight: "100vh",
      }}>
        {/* Subtle bg warmth */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: dark
            ? "radial-gradient(ellipse at 60% 40%, rgba(144,144,204,0.06) 0%, transparent 55%)"
            : "radial-gradient(ellipse at 55% 45%, rgba(212,132,90,0.06) 0%, transparent 55%)",
        }} />

        {/* Error banner */}
        {error && (
          <div style={{
            position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 8, padding: '10px 20px', color: '#fca5a5', fontSize: 13, zIndex: 10,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span>⚠️ {error}</span>
            <button
              onClick={() => navigate('/session')}
              style={{
                padding: '6px 12px',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.06)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              Open chat
            </button>
          </div>
        )}

        {!error && (
          <div style={{
            position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)',
            background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.72)',
            border: `1px solid ${t.border}`,
            borderRadius: 999, padding: '10px 18px', color: t.textMuted, fontSize: 13, zIndex: 10,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span>
              {voiceState === 'loading-models' && loadingDetail
                ? loadingDetail
                : voiceReady
                ? 'Offline voice pack ready'
                : cacheState === 'downloading'
                  ? `${statusText} ${Math.round(progress * 100)}%`
                  : packReady
                    ? 'Offline model pack ready'
                    : statusText}
            </span>
          </div>
        )}

        {/* Private Mode Toggle */}
        <div style={{
          position: 'absolute', top: 24, right: 24,
          zIndex: 10,
        }}>
          <PrivateModeToggleCompact />
        </div>

        {/* Outer glow */}
        <div style={{
          position: "absolute", width: 380, height: 380,
          borderRadius: "50%", pointerEvents: "none",
          background: `radial-gradient(circle, ${orb.glow} 0%, transparent 70%)`,
          transition: "all 0.7s",
        }} />

        {/* Orb */}
        <button
          onClick={handleOrbClick}
          disabled={voiceState === 'loading-models' || voiceState === 'processing'}
          style={{
            width: 200, height: 200, borderRadius: "50%",
            background: orb.bg,
            transform: `scale(${orbScale})`,
            boxShadow: `0 24px 64px ${orb.glow}`,
            border: "none",
            cursor: voiceState === 'loading-models' || voiceState === 'processing' ? 'not-allowed' : 'pointer',
            transition: "all 0.5s",
            marginBottom: 32, position: "relative", zIndex: 1,
            opacity: voiceState === 'loading-models' ? 0.7 : 1,
          }}
        >
          {(voiceState === "processing" || voiceState === 'loading-models') && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>
              <svg style={{ width: 40, height: 40, color: "rgba(255,255,255,0.5)", animation: "spin 1s linear infinite" }} fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.2 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path style={{ opacity: 0.6 }} fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            </div>
          )}
          {voiceState === "listening" && (
            <>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", animation: "ripple 1.5s ease-out infinite" }} />
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.15)", animation: "ripple 1.5s ease-out infinite 0.5s" }} />
            </>
          )}
        </button>

        {/* Status text */}
        <h2 style={{
          fontSize: 20, fontWeight: 600, color: t.textPrimary,
          margin: "0 0 8px", textAlign: "center",
          zIndex: 1, fontFamily: "var(--font-sans)",
        }}>
          {voiceState === "idle"           && "Hi, I'm Serenio. I'm here to listen."}
          {voiceState === "loading-models" && "Loading models..."}
          {voiceState === "listening"      && "Listening…"}
          {voiceState === "processing"     && "Understanding your thoughts…"}
          {voiceState === "responding"     && "Here's what I'm thinking…"}
        </h2>
        <p style={{
          fontSize: 14, color: t.textMuted,
          margin: "0 0 24px", zIndex: 1,
          fontFamily: "var(--font-sans)",
        }}>
          {voiceState === "idle"           && "Tap the orb to start speaking"}
          {voiceState === "loading-models" && "Please wait..."}
          {voiceState === "listening"      && "Speak freely, I'm here • tap orb to stop"}
          {voiceState === "processing"     && "Just a moment…"}
          {voiceState === "responding"     && "Serenio is responding..."}
        </p>

        {/* Transcript */}
        {transcript && (
          <div style={{
            maxWidth: 480, width: "100%",
            background: t.card, borderRadius: 16,
            padding: "16px 24px", marginBottom: 12,
            border: `1px solid ${t.border}`,
            position: "relative", zIndex: 1,
            fontFamily: "var(--font-sans)",
          }}>
            <p style={{ fontSize: 12, color: t.textMuted, fontWeight: 700, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>You shared</p>
            <p style={{ fontSize: 14, color: t.textPrimary, lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>{transcript}</p>
          </div>
        )}

        {/* Response card */}
        {responseText && (
          <div style={{
            maxWidth: 480, width: "100%",
            background: t.card, borderRadius: 16,
            padding: "20px 24px", marginBottom: 24,
            border: `1px solid ${t.border}`,
            boxShadow: t.cardShadow,
            position: "relative", zIndex: 1,
            fontFamily: "var(--font-sans)",
          }}>
            <p style={{ fontSize: 12, color: t.accent, fontWeight: 700, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Serenio</p>
            <p style={{ fontSize: 14, color: t.textPrimary, lineHeight: 1.7, margin: 0 }}>{responseText}</p>
          </div>
        )}

        {/* Start fresh */}
        {(transcript || responseText) && voiceState === 'idle' && (
          <button
            onClick={() => { setTranscript(''); setResponseText(''); crisisDetected.current = false; }}
            style={{
              background: 'transparent', border: `1px solid ${t.border}`,
              borderRadius: 50, padding: '6px 16px',
              fontSize: 12, color: t.textMuted, cursor: 'pointer',
              marginBottom: 16, zIndex: 1,
            }}
          >
            🔄 Start fresh
          </button>
        )}

        {/* Privacy */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          fontSize: 13, color: t.textMuted, zIndex: 1,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          Your voice never leaves this device
        </div>
      </main>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes ripple  { 0%{transform:scale(1);opacity:1} 100%{transform:scale(1.6);opacity:0} }
      `}</style>
    </div>
  );
}



