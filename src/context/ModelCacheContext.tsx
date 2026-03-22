import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { EventBus, ModelCategory, ModelManager } from '@runanywhere/web';
import { initSDK, OFFLINE_MODEL_PACK, PREFERRED_MODEL_IDS } from '../runanywhere';

type CacheState = 'checking' | 'downloading' | 'ready' | 'partial' | 'offline' | 'error';

interface ModelCacheContextValue {
  online: boolean;
  sdkReady: boolean;
  cacheState: CacheState;
  progress: number;
  statusText: string;
  chatReady: boolean;
  voiceReady: boolean;
  packReady: boolean;
  ensureOfflinePack: () => Promise<void>;
}

const ModelCacheContext = createContext<ModelCacheContextValue>({
  online: true,
  sdkReady: false,
  cacheState: 'checking',
  progress: 0,
  statusText: 'Checking offline pack...',
  chatReady: false,
  voiceReady: false,
  packReady: false,
  ensureOfflinePack: async () => {},
});

function isCached(modelId: string): boolean {
  const model = ModelManager.getModels().find((entry) => entry.id === modelId);
  return Boolean(model && (model.status === 'downloaded' || model.status === 'loaded'));
}

export function ModelCacheProvider({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState(() => navigator.onLine);
  const [sdkReady, setSdkReady] = useState(false);
  const [cacheState, setCacheState] = useState<CacheState>('checking');
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Checking offline pack...');
  const runningRef = useRef(false);

  const refreshState = useCallback(() => {
    const chatReady = Boolean(PREFERRED_MODEL_IDS[ModelCategory.Language] && isCached(PREFERRED_MODEL_IDS[ModelCategory.Language]!));
    const voiceReady = [
      PREFERRED_MODEL_IDS[ModelCategory.Language],
      PREFERRED_MODEL_IDS[ModelCategory.SpeechRecognition],
      PREFERRED_MODEL_IDS[ModelCategory.SpeechSynthesis],
      PREFERRED_MODEL_IDS[ModelCategory.Audio],
    ].every((id) => id && isCached(id));
    const packReady = OFFLINE_MODEL_PACK.every((id) => isCached(id));

    if (!sdkReady) {
      setCacheState('checking');
      setStatusText('Initializing AI system...');
      return { chatReady, voiceReady, packReady };
    }

    if (packReady) {
      setCacheState('ready');
      setProgress(1);
      setStatusText('✓ Ready for offline use!');
    } else if (!online) {
      setCacheState(chatReady ? 'partial' : 'offline');
      setStatusText(chatReady
        ? 'Chat works offline. Connect online once to enable voice features.'
        : 'Please connect to the internet once to download AI models for offline use.');
    } else if (!runningRef.current) {
      setCacheState(chatReady ? 'partial' : 'checking');
      setStatusText(chatReady
        ? 'Downloading additional models for offline voice chat...'
        : 'Downloading AI models for offline use...');
    }

    return { chatReady, voiceReady, packReady };
  }, [online, sdkReady]);

  const ensureOfflinePack = useCallback(async () => {
    if (runningRef.current) return;
    if (!navigator.onLine) {
      setOnline(false);
      refreshState();
      return;
    }

    runningRef.current = true;
    setCacheState('downloading');
    setStatusText('Starting download...');

    const unsub = EventBus.shared.on('model.downloadProgress', (evt) => {
      if (!OFFLINE_MODEL_PACK.includes(evt.modelId)) return;
      setProgress(evt.progress ?? 0);
      const model = ModelManager.getModels().find((entry) => entry.id === evt.modelId);
      const percent = Math.round((evt.progress ?? 0) * 100);
      setStatusText(`Downloading ${model?.name ?? 'model'}... ${percent}%`);
    });

    try {
      await initSDK();
      setSdkReady(true);

      // Prioritize downloading the main chat model first for immediate usability
      const priorityModel = PREFERRED_MODEL_IDS[ModelCategory.Language];
      if (priorityModel && !isCached(priorityModel)) {
        await ModelManager.downloadModel(priorityModel);
      }

      // Then download the rest in the background
      for (const modelId of OFFLINE_MODEL_PACK) {
        if (modelId === priorityModel) continue; // Already downloaded
        if (!isCached(modelId)) {
          await ModelManager.downloadModel(modelId);
        }
      }

      setProgress(1);
      setCacheState('ready');
      setStatusText('✓ Ready for offline use!');
    } catch (error) {
      setCacheState('error');
      setStatusText(error instanceof Error ? error.message : 'Failed to download models. Please check your connection.');
    } finally {
      unsub();
      runningRef.current = false;
      refreshState();
    }
  }, [refreshState]);

  useEffect(() => {
    let cancelled = false;

    initSDK()
      .then(() => {
        if (cancelled) return;
        setSdkReady(true);
        refreshState();
        if (navigator.onLine) {
          void ensureOfflinePack();
        }
      })
      .catch((error) => {
        if (cancelled) return;
        setCacheState('error');
        setStatusText(error instanceof Error ? error.message : 'Failed to initialize offline model manager.');
      });

    const handleOnline = () => {
      setOnline(true);
      refreshState();
      void ensureOfflinePack();
    };
    const handleOffline = () => {
      setOnline(false);
      refreshState();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      cancelled = true;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [ensureOfflinePack, refreshState]);

  useEffect(() => {
    refreshState();
  }, [online, refreshState, sdkReady]);

  const value = useMemo(() => {
    const chatReady = Boolean(PREFERRED_MODEL_IDS[ModelCategory.Language] && isCached(PREFERRED_MODEL_IDS[ModelCategory.Language]!));
    const voiceReady = [
      PREFERRED_MODEL_IDS[ModelCategory.Language],
      PREFERRED_MODEL_IDS[ModelCategory.SpeechRecognition],
      PREFERRED_MODEL_IDS[ModelCategory.SpeechSynthesis],
      PREFERRED_MODEL_IDS[ModelCategory.Audio],
    ].every((id) => id && isCached(id));
    const packReady = OFFLINE_MODEL_PACK.every((id) => isCached(id));

    return {
      online,
      sdkReady,
      cacheState,
      progress,
      statusText,
      chatReady,
      voiceReady,
      packReady,
      ensureOfflinePack,
    };
  }, [cacheState, ensureOfflinePack, online, progress, sdkReady, statusText]);

  return <ModelCacheContext.Provider value={value}>{children}</ModelCacheContext.Provider>;
}

export function useModelCache() {
  return useContext(ModelCacheContext);
}
