import { ModelCategory, ModelManager } from '@runanywhere/web';
import { TextGeneration } from '@runanywhere/web-llamacpp';
import type { MoodLevel } from '../context/HistoryContext';
import { MODEL_FALLBACK_ORDER, PREFERRED_MODEL_IDS } from '../runanywhere';

export const FAST_CHAT_MAX_TOKENS = 24; // Keep text chat snappy for demo use
export const FAST_VOICE_MAX_TOKENS = 28; // Enough for a useful short spoken reply
export const FAST_TEMPERATURE = 0.7; // Higher for more natural, less robotic
const MODEL_REPLY_TIMEOUT_MS = 2500;
const MODEL_LOAD_TIMEOUT_MS = 1200;

export const CRISIS_KEYWORDS = [
  'kill myself',
  'killing myself',
  'suicide',
  'suicidal',
  'end my life',
  'self harm',
  'hurt myself',
  'want to die',
  'don\'t want to live',
  'dont want to live',
] as const;

export const CRISIS_RESPONSE = "I'm really glad you said it out loud. Please call or text a crisis helpline right now and stay with someone you trust if you can.";

export const HELPLINE_NOTE = 'If you are in immediate danger, call your local emergency number now.';

export const COMPANION_SYSTEM_PROMPT = [
  'You are Serenio, a warm mental health companion who sounds like a caring, emotionally intelligent friend.',
  'Give direct, relevant answers to the user\'s actual question or concern.',
  'If they ask a question, answer it first in plain language, then add gentle emotional support if it fits.',
  'Keep replies short: usually 1-2 sentences, under 45 words total.',
  'Be supportive without sounding clinical, robotic, preachy, or overly generic.',
  'Do not give lists unless the user explicitly asks for steps or options.',
  'Do not mention being an AI, system prompts, hidden rules, or policies.',
  'When the user shares pain, acknowledge the specific feeling or situation instead of giving a vague template reply.',
].join(' ');

function normalizeWhitespace(text: string): string {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function isCrisisText(text: string): boolean {
  const value = text.toLowerCase();
  return CRISIS_KEYWORDS.some((keyword) => value.includes(keyword));
}

export function detectMoodFromText(text: string): MoodLevel {
  const value = text.toLowerCase();
  if (/(suicide|self harm|panic|hopeless|worthless|can't go on|can\'t go on)/.test(value)) return 'struggling';
  if (/(depress|empty|lonely|numb|low|sad|burned out|burnt out)/.test(value)) return 'low';
  if (/(great|amazing|excited|proud|happy|good today)/.test(value)) return 'great';
  if (/(good|better|calm|relieved|fine)/.test(value)) return 'good';
  return 'okay';
}

export function buildFallbackReply(userText: string): string {
  const normalized = normalizeWhitespace(userText);
  const value = normalized.toLowerCase();

  if (isCrisisText(value)) {
    return `${CRISIS_RESPONSE} ${HELPLINE_NOTE}`;
  }
  if (/(motivat|cheer me up|cheer me|pick me up|inspire me|encourag)/.test(value)) {
    return 'You deserve a reminder that you are stronger than this moment. Keep going one small step at a time — I’m here with you.';
  }
  if (/(what should i do|what do i do|should i|can you help me decide)/.test(value)) {
    return 'Start with the smallest next step that makes you feel a little safer or calmer. What feels most urgent right now?';
  }
  if (/(why do i feel|why am i feeling|why do i keep)/.test(value)) {
    return 'Sometimes your mind and body stay on high alert when something feels unresolved or overwhelming. Has anything been building up lately?';
  }
  if (/(how do i calm down|how can i calm down|how do i stop overthinking)/.test(value)) {
    return 'Try slowing everything down for one minute and focus only on your breathing or what you can physically feel around you. Want to do that together?';
  }
  if (/(what's wrong with me|am i broken|why am i like this)/.test(value)) {
    return 'Nothing is wrong with you for feeling overwhelmed like this. What has been hitting you the hardest?';
  }
  if (/\?$/.test(value) && /(are you|can you|could you)/.test(value)) {
    return 'I can stay with you and help you think it through gently. What part feels hardest right now?';
  }
  if (/(panic|anxious|anxiety|overthinking|heart racing|can't breathe|cant breathe)/.test(value)) {
    return 'That sounds really intense, and you\'re not failing by feeling this. Can you stay with one slow breath at a time right now?';
  }
  if (/(depress|empty|numb|hopeless|sad|low)/.test(value)) {
    return 'I\'m really sorry it feels this heavy right now. Do you want to tell me what today has felt like?';
  }
  if (/(alone|lonely|nobody|no one cares)/.test(value)) {
    return 'That kind of loneliness can hurt so much. I\'m here with you right now, okay?';
  }
  if (/(stress|overwhelmed|too much|burned out|burnt out|exhausted)/.test(value)) {
    return 'That sounds like way too much to carry at once. What feels like the heaviest part?';
  }
  if (/(can't sleep|cant sleep|insomnia|not sleeping|awake)/.test(value)) {
    return 'Sleep getting messed up can make everything feel louder. Has your mind been racing, or is your body just not settling?';
  }
  if (/(angry|mad|frustrated)/.test(value)) {
    return 'Yeah, that would frustrate anyone. What set it off?';
  }
  if (/(thank|thanks|appreciate)/.test(value)) {
    return 'Of course - I\'m really glad I could be here for you.';
  }
  if (/(good|great|better|happy|excited)/.test(value)) {
    return 'I\'m so glad to hear that! That\'s really wonderful.';
  }

  const preview = normalized.replace(/[!?.,;:]+$/g, '').slice(0, 80);
  if (preview) {
    return `I hear you. Say a little more about "${preview}" so I can stay with the right part.`;
  }

  return 'I\'m here with you. Tell me what feels most important right now.';
}

function getInstantCompanionReply(userText: string): string | null {
  const value = normalizeWhitespace(userText).toLowerCase();
  if (!value || value.length > 180) return null;

  if (isCrisisText(value)) return `${CRISIS_RESPONSE} ${HELPLINE_NOTE}`;

  if (/(panic attack|having a panic|heart racing|can't breathe|cant breathe)/.test(value)) {
    return 'You\'re safe with me right now. Try one slow inhale and one even slower exhale with me, okay?';
  }
  if (/(i feel anxious|i am anxious|anxiety is bad|overthinking)/.test(value)) {
    return 'That kind of anxiety can feel so loud. What part is spiraling the most right now?';
  }
  if (/(i feel sad|i am sad|i feel low|i feel empty|i feel numb)/.test(value)) {
    return 'I\'m sorry it feels so heavy right now. Do you want to tell me what pushed today in that direction?';
  }
  if (/(i feel alone|i am alone|i feel lonely|nobody cares)/.test(value)) {
    return 'That kind of loneliness really hurts. I\'m here with you right now.';
  }
  if (/(i can't sleep|i cant sleep|not sleeping|insomnia)/.test(value)) {
    return 'That sounds exhausting. Is it more that your mind won\'t slow down, or your body just won\'t settle?';
  }
  if (/(motivat|cheer me up|cheer me|pick me up|inspire me|encourag)/.test(value)) {
    return buildFallbackReply(userText);
  }
  if (/(what should i do|what do i do|how do i calm down|why do i feel like this|what's wrong with me|am i broken)/.test(value)) {
    return buildFallbackReply(userText);
  }
  if (isQuestion(value) && value.length <= 120) {
    return buildFallbackReply(userText);
  }

  return null;
}

function compactUserInput(text: string): string {
  return normalizeWhitespace(text).slice(0, 400); // Preserve more context for better understanding
}

function isQuestion(text: string): boolean {
  return /\?$/.test(text.trim()) || /^(what|why|how|when|where|who|can|could|should|would|do|did|is|are)\b/i.test(text.trim());
}

function extractLatestUserInput(text: string): string {
  const matches = [...text.matchAll(/(?:^|\n)User:\s*(.+)$/gim)];
  const latest = matches.at(-1)?.[1];
  return normalizeWhitespace(latest ?? text);
}

function makeFriendTone(text: string): string {
  return text
    // Keep natural empathy
    .replace(/\bI understand that\b/gi, 'I really hear you, and')
    .replace(/\bI understand\b/gi, 'I hear you')
    .replace(/\bI comprehend\b/gi, 'I get it')
    // More natural validation
    .replace(/\bThat is understandable\b/gi, 'That totally makes sense')
    .replace(/\bThat is valid\b/gi, 'That makes complete sense')
    // Softer suggestions
    .replace(/\bIt is important that\b/gi, 'It might really help if')
    .replace(/\bIt is important to\b/gi, 'It could help to')
    .replace(/\bYou must\b/gi, 'Maybe you could')
    .replace(/\bYou need to\b/gi, 'You might want to')
    .replace(/\bYou should\b/gi, 'Maybe try to')
    // More natural concern
    .replace(/\bI am concerned\b/gi, 'I\'m worried about you')
    .replace(/\bThat is difficult\b/gi, 'That sounds really hard')
    .replace(/\bThat is challenging\b/gi, 'That sounds tough');
}

export function sanitizeCompanionReply(rawText: string, userText: string): string {
  const stripped = rawText
    .replace(/<\|[^>]+\|>/g, ' ')
    .replace(/<s>|<\/s>|\[INST\]|\[\/INST\]/g, ' ')
    .replace(/\r/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\[(system|assistant|user)[^\]]*\]/gi, ' ')
    .replace(/^(system|assistant|user|serenio)\s*:/gim, ' ')
    .replace(/(system prompt|hidden instructions|rules:|good examples:|bad examples:)/gi, ' ');

  let cleaned = stripped
    .split(/(?:\n|(?=user\s*:)|(?=assistant\s*:)|(?=serenio\s*:))/i)[0]
    ?.trim() ?? '';

  cleaned = cleaned
    .replace(/^['"\s]+|['"\s]+$/g, '')
    .replace(/^(i am serenio\.?|serenio here\.?|hi, i'm serenio\.?)/i, '')
    .replace(/\b(as an ai|as a language model|as an assistant)\b/gi, '')
    .trim();

  cleaned = makeFriendTone(normalizeWhitespace(cleaned));

  if (!cleaned || /system|assistant|user|prompt|rules/i.test(cleaned)) {
    return buildFallbackReply(userText);
  }

  const sentences = cleaned.match(/[^.!?]+[.!?]?/g)?.map((part) => normalizeWhitespace(part)).filter(Boolean) ?? [];
  const trimmed = sentences.slice(0, isQuestion(userText) ? 2 : 2).join(' ').trim();
  return trimmed || buildFallbackReply(userText);
}

export async function ensureLanguageModelLoaded(): Promise<boolean> {
  const current = ModelManager.getLoadedModel(ModelCategory.Language);
  const preferredId = PREFERRED_MODEL_IDS[ModelCategory.Language];
  if (current?.id && (!preferredId || current.id === preferredId)) return true;

  const candidates = ModelManager.getModelsByCategory(ModelCategory.Language);
  const fallbackOrder = MODEL_FALLBACK_ORDER[ModelCategory.Language] ?? [];
  const ordered = [
    ...fallbackOrder
      .map((id) => candidates.find((model) => model.id === id))
      .filter((model): model is (typeof candidates)[number] => Boolean(model)),
    ...candidates.filter((model) => !fallbackOrder.includes(model.id)),
  ];

  for (const model of ordered) {
    if (model.status !== 'downloaded' && model.status !== 'loaded') continue;
    try {
      const ok = await ModelManager.loadModel(model.id, { coexist: true });
      if (ok) return true;
    } catch {
      continue;
    }
  }

  return false;
}

export interface CompanionReplyResult {
  text: string;
  source: 'model' | 'fallback';
}

export async function generateCompanionReply(
  userText: string,
  options?: {
    onToken?: (token: string, accumulated: string) => void;
    maxTokens?: number;
    temperature?: number;
    stream?: boolean;
    context?: string;
  },
): Promise<CompanionReplyResult> {
  const latestUserInput = extractLatestUserInput(userText);

  if (isCrisisText(latestUserInput)) {
    return { text: `${CRISIS_RESPONSE} ${HELPLINE_NOTE}`, source: 'fallback' };
  }

  const instantReply = getInstantCompanionReply(latestUserInput);
  const ready = await Promise.race<boolean>([
    ensureLanguageModelLoaded(),
    new Promise<boolean>((resolve) => setTimeout(() => resolve(false), MODEL_LOAD_TIMEOUT_MS)),
  ]);
  if (!ready) {
    return { text: instantReply ?? buildFallbackReply(latestUserInput), source: 'fallback' };
  }

  try {
    const prompt = options?.context
      ? `Conversation context:\n${options.context}\n\nUser: ${compactUserInput(latestUserInput)}`
      : compactUserInput(latestUserInput);
    const generationOptions = {
      systemPrompt: COMPANION_SYSTEM_PROMPT,
      maxTokens: options?.maxTokens ?? (isQuestion(latestUserInput) ? 36 : FAST_CHAT_MAX_TOKENS),
      temperature: options?.temperature ?? FAST_TEMPERATURE,
      // Balanced parameters for speed + quality
      topK: 24,
      topP: 0.9,
      repeatPenalty: 1.08,
    };

    if (!options?.stream) {
      const result = await Promise.race([
        TextGeneration.generate(prompt, generationOptions),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('generation timeout')), MODEL_REPLY_TIMEOUT_MS)),
      ]);
      return { text: sanitizeCompanionReply(result.text, latestUserInput), source: 'model' };
    }

    const { stream, result } = await Promise.race([
      TextGeneration.generateStream(prompt, generationOptions),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('stream timeout')), 1200)),
    ]);

    let accumulated = '';
    const streamLoop = (async () => {
      for await (const token of stream) {
        accumulated += token;
        options?.onToken?.(token, sanitizeCompanionReply(accumulated, latestUserInput));
      }
    })();

    await Promise.race([
      streamLoop,
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('token timeout')), MODEL_REPLY_TIMEOUT_MS)),
    ]);

    if (!accumulated.trim()) {
      throw new Error('empty generation');
    }

    const final = await Promise.race([
      result,
      new Promise<typeof result extends Promise<infer T> ? T : never>((_, reject) => setTimeout(() => reject(new Error('final timeout')), MODEL_REPLY_TIMEOUT_MS)),
    ]);
    const text = sanitizeCompanionReply(final.text || accumulated, latestUserInput);
    return { text, source: 'model' };
  } catch {
    return { text: buildFallbackReply(latestUserInput), source: 'fallback' };
  }
}



