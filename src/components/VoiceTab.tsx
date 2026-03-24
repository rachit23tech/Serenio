import { useState, useRef, useCallback, useEffect } from 'react';
import { ModelCategory, ModelManager, AudioCapture, AudioPlayback, SpeechActivity } from '@runanywhere/web';
import { STT, TTS, VAD } from '@runanywhere/web-onnx';
import { useModelLoader } from '../hooks/useModelLoader';
import { usePrivateMode } from '../context/PrivateModeContext';
import { PrivateModeToggleCompact } from './PrivateModeToggle';
import { ModelBanner } from './ModelBanner';
import {
  FAST_TEMPERATURE,
  FAST_VOICE_MAX_TOKENS,
  HELPLINE_NOTE,
  generateCompanionReply,
  isCrisisText,
  sanitizeCompanionReply,
} from '../lib/companion';

type VoiceState = 'idle' | 'loading-models' | 'listening' | 'processing' | 'speaking';

const CRISIS_RESPONSE = "You matter so much. Please call iCall at 9152987821 right now. I'm here with you.";

export function VoiceTab() {
  const llmLoader = useModelLoader(ModelCategory.Language, true);
  const sttLoader = useModelLoader(ModelCategory.SpeechRecognition, true);
  const ttsLoader = useModelLoader(ModelCategory.SpeechSynthesis, true);
  const vadLoader = useModelLoader(ModelCategory.Audio, true);
  const { isPrivateMode } = usePrivateMode();

  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [error, setError] = useState<string | null>(null);
  const crisisDetected = useRef(false);

  const micRef = useRef<AudioCapture | null>(null);
  const vadUnsub = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      micRef.current?.stop();
      vadUnsub.current?.();
    };
  }, []);

  const ensureModels = useCallback(async (): Promise<boolean> => {
    setVoiceState('loading-models');
    setError(null);

    const results = await Promise.all([
      vadLoader.ensure(),
      sttLoader.ensure(),
      llmLoader.ensure(),
      ttsLoader.ensure(),
    ]);

    if (results.every(Boolean)) {
      setVoiceState('idle');
      return true;
    }

    setError('Failed to load one or more voice models');
    setVoiceState('idle');
    return false;
  }, [vadLoader, sttLoader, llmLoader, ttsLoader]);

  // FIX: saveToHistory now correctly reads isPrivateMode from closure
  const saveToHistory = useCallback((userSaid: string, serenioSaid: string) => {
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
  }, [isPrivateMode]);

  const startListening = useCallback(async () => {
    if (voiceState === 'speaking' || voiceState === 'processing') return;
    setTranscript('');
    setResponse('');
    setError(null);
    crisisDetected.current = false;

    const anyMissing = !ModelManager.getLoadedModel(ModelCategory.Audio)
      || !ModelManager.getLoadedModel(ModelCategory.SpeechRecognition)
      || !ModelManager.getLoadedModel(ModelCategory.Language)
      || !ModelManager.getLoadedModel(ModelCategory.SpeechSynthesis);

    if (anyMissing) {
      const ok = await ensureModels();
      if (!ok) return;
    }

    setVoiceState('listening');

    const mic = new AudioCapture({ sampleRate: 16000 });
    micRef.current = mic;

    VAD.reset();

    vadUnsub.current = VAD.onSpeechActivity((activity) => {
      if (activity === SpeechActivity.Ended) {
        const segment = VAD.popSpeechSegment();
        if (segment && segment.samples.length > 1600) {
          processSpeech(segment.samples);
        } else {
          console.log('Ignored short audio segment');
        }
      }
    });

    await mic.start(
      (chunk) => { VAD.processSamples(chunk); },
      (level) => { setAudioLevel(level); },
    );
  }, [ensureModels, voiceState]);

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
        setAudioLevel(0);
        return;
      }

      let finalResponse = '';

      if (isCrisisText(transcription)) {
        crisisDetected.current = true;
        finalResponse = `${CRISIS_RESPONSE} ${HELPLINE_NOTE}`;
      } else {
        const reply = await generateCompanionReply(transcription, {
          maxTokens: FAST_VOICE_MAX_TOKENS,
          temperature: FAST_TEMPERATURE,
          stream: true,
          onToken: (_token, accumulated) => {
            setResponse(accumulated);
          },
        });
        finalResponse = sanitizeCompanionReply(reply.text, transcription);
      }

      setResponse(finalResponse);

      if (!isPrivateMode) {
        setChatHistory(prev => [
          ...prev,
          { role: 'user', content: transcription },
          { role: 'assistant', content: finalResponse },
        ].slice(-20) as Array<{role: 'user' | 'assistant', content: string}>);
      }
      saveToHistory(transcription, finalResponse);

      if (finalResponse && TTS.isVoiceLoaded) {
        setVoiceState('speaking');
        const speech = await TTS.synthesize(finalResponse, { speed: 1.0 });
        const player = new AudioPlayback({ sampleRate: speech.sampleRate });
        await player.play(speech.audioData, speech.sampleRate);
        player.dispose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }

    setVoiceState('idle');
    setAudioLevel(0);
  }, [isPrivateMode, saveToHistory]);

  const stopListening = useCallback(() => {
    micRef.current?.stop();
    vadUnsub.current?.();
    setVoiceState('idle');
    setAudioLevel(0);
  }, []);

  const pendingLoaders = [
    { label: 'VAD', loader: vadLoader },
    { label: 'STT', loader: sttLoader },
    { label: 'LLM', loader: llmLoader },
    { label: 'TTS', loader: ttsLoader },
  ].filter((l) => l.loader.state !== 'ready');

  return (
    <div className="tab-panel voice-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ flex: 1 }} />
        <PrivateModeToggleCompact />
      </div>

      {pendingLoaders.length > 0 && voiceState === 'idle' && (
        <ModelBanner
          state={pendingLoaders[0].loader.state}
          progress={pendingLoaders[0].loader.progress}
          error={pendingLoaders[0].loader.error}
          onLoad={ensureModels}
          label={`Voice (${pendingLoaders.map((l) => l.label).join(', ')})`}
        />
      )}

      {error && (
        <div className="model-banner">
          <span className="error-text">{error}</span>
        </div>
      )}

      <div className="voice-center">
        <div
          className="voice-orb"
          data-state={voiceState}
          style={{ '--level': audioLevel } as React.CSSProperties}
        >
          <div className="voice-orb-inner" />
        </div>

        <p className="voice-status">
          {voiceState === 'idle' && "Hi, I'm Serenio. Tap to share how you feel..."}
          {voiceState === 'loading-models' && 'Loading models...'}
          {voiceState === 'listening' && "I'm listening... take your time 💙"}
          {voiceState === 'processing' && 'Understanding you...'}
          {voiceState === 'speaking' && 'Serenio is responding...'}
        </p>

        <p style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '8px' }}>
          Speak slowly and clearly for best results
        </p>

        {(voiceState === 'idle' || voiceState === 'loading-models') ? (
          <button
            className="btn btn-primary btn-lg"
            onClick={startListening}
            disabled={voiceState === 'loading-models'}
          >
            Start Listening
          </button>
        ) : voiceState === 'listening' ? (
          <button className="btn btn-lg" onClick={stopListening}>
            Stop
          </button>
        ) : null}
      </div>

      {transcript && (
        <div className="voice-transcript">
          <h4>You shared:</h4>
          <p>{transcript}</p>
        </div>
      )}

      {chatHistory.length > 0 && (
        <button
          className="btn"
          style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '8px' }}
          onClick={() => {
            setChatHistory([]);
            setTranscript('');
            setResponse('');
            crisisDetected.current = false;
          }}
        >
          🔄 Start fresh
        </button>
      )}

      {response && (
        <div className="voice-response">
          <h4>Serenio says:</h4>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}
