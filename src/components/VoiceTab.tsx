import { useState, useRef, useCallback, useEffect } from 'react';
import { VoicePipeline, ModelCategory, ModelManager, AudioCapture, AudioPlayback, SpeechActivity } from '@runanywhere/web';
import { VAD } from '@runanywhere/web-onnx';
import { useModelLoader } from '../hooks/useModelLoader';
import { usePrivateMode } from '../context/PrivateModeContext';
import { PrivateModeToggleCompact } from './PrivateModeToggle';
import { ModelBanner } from './ModelBanner';

type VoiceState = 'idle' | 'loading-models' | 'listening' | 'processing' | 'speaking';

const CRISIS_KEYWORDS = ['kill myself', 'killing myself', 'suicide', 'end my life', 'self harm', 'hurt myself', 'want to die'];
const CRISIS_RESPONSE = "You matter so much. Please call iCall at 9152987821 right now. I'm here with you.";

const SYSTEM_PROMPT = `You are Serenio. You ONLY respond like a caring close friend texting someone.

STRICT OUTPUT RULES:
- Maximum 1-2 sentences ONLY. Never more.
- No lists. No bullets. No headers. No bold.
- No formal language. No clinical words.
- Never start with "I understand" or "I hear you"
- Never give unsolicited advice
- Always ask ONE gentle follow up question
- Sound like a 25 year old friend texting

BAD response example:
"I understand you're feeling anxious. Here are some strategies: 1) Deep breathing 2) Meditation"

GOOD response example:
"That sounds really overwhelming. How long has it been feeling this way?"

ANOTHER GOOD example:
"Honestly that makes so much sense. What's been the hardest part of your day?"

ANOTHER GOOD example:
"You don't have to have it all figured out. What happened?"

Remember: Short. Warm. Curious. Friend. NOT therapist.`;

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
  const pipelineRef = useRef<VoicePipeline | null>(null);
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

  const isCrisis = (text: string) =>
    CRISIS_KEYWORDS.some(kw => text.toLowerCase().includes(kw));

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

    if (!pipelineRef.current) {
      pipelineRef.current = new VoicePipeline();
    }

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
    const pipeline = pipelineRef.current;
    if (!pipeline) return;

    micRef.current?.stop();
    vadUnsub.current?.();
    setVoiceState('processing');
    crisisDetected.current = false;

    try {
       const result = await pipeline.processTurn(audioData, {
         maxTokens: 35,
         temperature: 0.7,
         systemPrompt: SYSTEM_PROMPT,
       }, {
         onTranscription: (text) => {
           setTranscript(text);
           // Detect crisis immediately after transcription
           if (isCrisis(text)) {
             crisisDetected.current = true;
             setResponse(CRISIS_RESPONSE);
             saveToHistory(text, CRISIS_RESPONSE);
             if (!isPrivateMode) {
               setChatHistory(prev => [
                 ...prev,
                 { role: 'user', content: text },
                 { role: 'assistant', content: CRISIS_RESPONSE },
               ]);
             }
           }
         },
         onResponseToken: (_token, accumulated) => {
           // Don't override crisis response
           if (!crisisDetected.current) {
             setResponse(accumulated);
           }
         },
         onResponseComplete: (text) => {
           // Don't override crisis response
           if (!crisisDetected.current) {
             setResponse(text);
           }
         },
         onSynthesisComplete: async (audio, sampleRate) => {
           // Don't play TTS if crisis — too cold for crisis situation
           if (!crisisDetected.current) {
             setVoiceState('speaking');
             const player = new AudioPlayback({ sampleRate });
             await player.play(audio, sampleRate);
             player.dispose();
           }
         },
         onStateChange: (s) => {
           if (s === 'processingSTT') setVoiceState('processing');
           if (s === 'generatingResponse') setVoiceState('processing');
           if (s === 'playingTTS' && !crisisDetected.current) setVoiceState('speaking');
         },
       });

       if (result && !crisisDetected.current) {
         setTranscript(result.transcription);
         setResponse(result.response);
         if (!isPrivateMode) {
           setChatHistory(prev => [
             ...prev,
             { role: 'user', content: result.transcription },
             { role: 'assistant', content: result.response },
           ]);
         }
         saveToHistory(result.transcription, result.response);
       }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }

    setVoiceState('idle');
    setAudioLevel(0);
  }, []);

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


