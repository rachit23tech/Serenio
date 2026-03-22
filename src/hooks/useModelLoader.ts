import { useState, useCallback, useRef } from 'react';
import { ModelManager, ModelCategory, EventBus } from '@runanywhere/web';
import { MODEL_FALLBACK_ORDER, PREFERRED_MODEL_IDS } from '../runanywhere';

export type LoaderState = 'idle' | 'downloading' | 'loading' | 'ready' | 'error';

interface ModelLoaderResult {
  state: LoaderState;
  progress: number;
  error: string | null;
  ensure: () => Promise<boolean>;
}

/**
 * Hook to download + load models for a given category.
 * Tracks download progress and loading state.
 *
 * @param category - Which model category to ensure is loaded.
 * @param coexist  - If true, only unload same-category models (allows STT+LLM+TTS to coexist).
 */
export function useModelLoader(category: ModelCategory, coexist = false): ModelLoaderResult {
  const [state, setState] = useState<LoaderState>(() =>
    ModelManager.getLoadedModel(category) ? 'ready' : 'idle',
  );
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);
  const inFlightRef = useRef<Promise<boolean> | null>(null);

  const ensure = useCallback(async (): Promise<boolean> => {
    // Already loaded
    if (ModelManager.getLoadedModel(category)) {
      setState('ready');
      return true;
    }

    if (loadingRef.current && inFlightRef.current) {
      return inFlightRef.current;
    }
    loadingRef.current = true;

    const task = (async () => {
      try {
      // Find a model for this category
      const models = ModelManager.getModels().filter((m) => m.modality === category);
      if (models.length === 0) {
        setError(`No ${category} model registered`);
        setState('error');
        return false;
      }

      const preferredId = PREFERRED_MODEL_IDS[category];
      const fallbackOrder = MODEL_FALLBACK_ORDER[category] ?? [];
      const orderedModels = [
        ...fallbackOrder
          .map((id) => models.find((entry) => entry.id === id))
          .filter((entry): entry is (typeof models)[number] => Boolean(entry)),
        ...models.filter((entry) => !fallbackOrder.includes(entry.id)),
      ];

      if (preferredId) {
        orderedModels.sort((left, right) => {
          if (left.id === preferredId) return -1;
          if (right.id === preferredId) return 1;
          return 0;
        });
      }

      for (const model of orderedModels) {
        try {
          if (model.status !== 'downloaded' && model.status !== 'loaded') {
            if (!navigator.onLine) {
              continue;
            }

            setState('downloading');
            setProgress(0);

            const unsub = EventBus.shared.on('model.downloadProgress', (evt) => {
              if (evt.modelId === model.id) {
                setProgress(evt.progress ?? 0);
              }
            });

            await ModelManager.downloadModel(model.id);
            unsub();
            setProgress(1);
          }

          setState('loading');
          const ok = await ModelManager.loadModel(model.id, { coexist });
          if (ok) {
            setState('ready');
            setError(null);
            return true;
          }
        } catch (modelError) {
          setError(modelError instanceof Error ? modelError.message : String(modelError));
        }
      }

      setError('No compatible cached model could be loaded. Connect once online or use chat fallback mode.');
      setState('error');
      return false;
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setState('error');
        return false;
      } finally {
        loadingRef.current = false;
        inFlightRef.current = null;
      }
    })();

    inFlightRef.current = task;
    return task;
  }, [category, coexist]);

  return { state, progress, error, ensure };
}



