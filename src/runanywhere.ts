import {
  RunAnywhere,
  SDKEnvironment,
  ModelManager,
  ModelCategory,
  LLMFramework,
  type CompactModelDef,
} from '@runanywhere/web';

import { LlamaCPP, VLMWorkerBridge } from '@runanywhere/web-llamacpp';
import { ONNX } from '@runanywhere/web-onnx';

// @ts-ignore — Vite-specific ?worker&url query
import vlmWorkerUrl from './workers/vlm-worker?worker&url';

const MODELS: CompactModelDef[] = [
  // LLM — Ultra-fast tiny model for maximum speed
  {
    id: 'lfm2-350m-q2_k',
    name: 'LFM2 350M Q2_K (Ultra Fast)',
    repo: 'LiquidAI/LFM2-350M-GGUF',
    files: ['LFM2-350M-Q2_K.gguf'],
    framework: LLMFramework.LlamaCpp,
    modality: ModelCategory.Language,
    memoryRequirement: 150_000_000, // ~40% smaller than Q4
  },
  {
    id: 'lfm2-350m-q4_k_m',
    name: 'LFM2 350M Q4_K_M',
    repo: 'LiquidAI/LFM2-350M-GGUF',
    files: ['LFM2-350M-Q4_K_M.gguf'],
    framework: LLMFramework.LlamaCpp,
    modality: ModelCategory.Language,
    memoryRequirement: 250_000_000,
  },
  // LLM — quality / stability balance for local chat
  {
    id: 'qwen2.5-0.5b-instruct-q4_k_m',
    name: 'Qwen2.5 0.5B Instruct Q4_K_M',
    repo: 'bartowski/Qwen2.5-0.5B-Instruct-GGUF',
    files: ['Qwen2.5-0.5B-Instruct-Q4_K_M.gguf'],
    framework: LLMFramework.LlamaCpp,
    modality: ModelCategory.Language,
    memoryRequirement: 430_000_000,
  },
  {
    id: 'llama-3.2-1b-instruct-q4_k_m',
    name: 'Llama 3.2 1B Instruct',
    repo: 'bartowski/Llama-3.2-1B-Instruct-GGUF',
    files: ['Llama-3.2-1B-Instruct-Q4_K_M.gguf'],
    framework: LLMFramework.LlamaCpp,
    modality: ModelCategory.Language,
    memoryRequirement: 808_000_000,
  },
  // LLM — LFM2 1.2B Tool
  {
    id: 'lfm2-1.2b-tool-q4_k_m',
    name: 'LFM2 1.2B Tool Q4_K_M',
    repo: 'LiquidAI/LFM2-1.2B-Tool-GGUF',
    files: ['LFM2-1.2B-Tool-Q4_K_M.gguf'],
    framework: LLMFramework.LlamaCpp,
    modality: ModelCategory.Language,
    memoryRequirement: 800_000_000,
  },
  // VLM — LFM2-VL 450M
  {
    id: 'lfm2-vl-450m-q4_0',
    name: 'LFM2-VL 450M Q4_0',
    repo: 'runanywhere/LFM2-VL-450M-GGUF',
    files: ['LFM2-VL-450M-Q4_0.gguf', 'mmproj-LFM2-VL-450M-Q8_0.gguf'],
    framework: LLMFramework.LlamaCpp,
    modality: ModelCategory.Multimodal,
    memoryRequirement: 500_000_000,
  },
  // STT — Whisper Tiny
  {
    id: 'sherpa-onnx-whisper-tiny.en',
    name: 'Whisper Tiny English (ONNX)',
    url: 'https://huggingface.co/runanywhere/sherpa-onnx-whisper-tiny.en/resolve/main/sherpa-onnx-whisper-tiny.en.tar.gz',
    framework: LLMFramework.ONNX,
    modality: ModelCategory.SpeechRecognition,
    memoryRequirement: 105_000_000,
    artifactType: 'archive' as const,
  },
  // TTS — Piper US English
  {
    id: 'vits-piper-en_US-lessac-medium',
    name: 'Piper TTS US English (Lessac)',
    url: 'https://huggingface.co/runanywhere/vits-piper-en_US-lessac-medium/resolve/main/vits-piper-en_US-lessac-medium.tar.gz',
    framework: LLMFramework.ONNX,
    modality: ModelCategory.SpeechSynthesis,
    memoryRequirement: 65_000_000,
    artifactType: 'archive' as const,
  },
  // VAD — Silero
  {
    id: 'silero-vad-v5',
    name: 'Silero VAD v5',
    url: 'https://huggingface.co/runanywhere/silero-vad-v5/resolve/main/silero_vad.onnx',
    files: ['silero_vad.onnx'],
    framework: LLMFramework.ONNX,
    modality: ModelCategory.Audio,
    memoryRequirement: 5_000_000,
  },
];

export const PREFERRED_MODEL_IDS: Partial<Record<ModelCategory, string>> = {
  [ModelCategory.Language]: 'llama-3.2-1b-instruct-q4_k_m', // Best balance: fast + smart + understands instructions
  [ModelCategory.Multimodal]: 'lfm2-vl-450m-q4_0',
  [ModelCategory.SpeechRecognition]: 'sherpa-onnx-whisper-tiny.en',
  [ModelCategory.SpeechSynthesis]: 'vits-piper-en_US-lessac-medium',
  [ModelCategory.Audio]: 'silero-vad-v5',
};

export const MODEL_FALLBACK_ORDER: Partial<Record<ModelCategory, string[]>> = {
  [ModelCategory.Language]: [
    'llama-3.2-1b-instruct-q4_k_m', // Best: understands context, reasonably fast
    'lfm2-350m-q4_k_m', // Backup: smaller/faster
  ],
  [ModelCategory.Multimodal]: ['lfm2-vl-450m-q4_0'],
  [ModelCategory.SpeechRecognition]: ['sherpa-onnx-whisper-tiny.en'],
  [ModelCategory.SpeechSynthesis]: ['vits-piper-en_US-lessac-medium'],
  [ModelCategory.Audio]: ['silero-vad-v5'],
};

export const OFFLINE_MODEL_PACK = [
  'llama-3.2-1b-instruct-q4_k_m', // Best balance of speed and comprehension
  PREFERRED_MODEL_IDS[ModelCategory.SpeechRecognition],
  PREFERRED_MODEL_IDS[ModelCategory.SpeechSynthesis],
  PREFERRED_MODEL_IDS[ModelCategory.Audio],
].filter((value, index, array): value is string => Boolean(value) && array.indexOf(value) === index);

let _initPromise: Promise<void> | null = null;

export async function initSDK(): Promise<void> {
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    await RunAnywhere.initialize({
      environment: SDKEnvironment.Development,
      debug: false, // Disable debug logging for better performance
    });

    await LlamaCPP.register();
    await ONNX.register();

    RunAnywhere.registerModels(MODELS);

    VLMWorkerBridge.shared.workerUrl = vlmWorkerUrl;
    RunAnywhere.setVLMLoader({
      get isInitialized() { return VLMWorkerBridge.shared.isInitialized; },
      init: () => VLMWorkerBridge.shared.init(),
      loadModel: (params) => VLMWorkerBridge.shared.loadModel(params),
      unloadModel: () => VLMWorkerBridge.shared.unloadModel(),
    });
  })();

  return _initPromise;
}

export function getAccelerationMode(): string | null {
  return LlamaCPP.isRegistered ? LlamaCPP.accelerationMode : null;
}

export { RunAnywhere, ModelManager, ModelCategory, VLMWorkerBridge };


