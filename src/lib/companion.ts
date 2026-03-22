import { ModelCategory, ModelManager } from '@runanywhere/web';
import { TextGeneration } from '@runanywhere/web-llamacpp';
import type { MoodLevel } from '../context/HistoryContext';
import { MODEL_FALLBACK_ORDER } from '../runanywhere';

export const FAST_CHAT_MAX_TOKENS = 28; // Very short for instant responses
export const FAST_VOICE_MAX_TOKENS = 24; // Very short for instant responses  
export const FAST_TEMPERATURE = 0.7; // Higher for more natural, less robotic

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
  'You are Serenio, a supportive friend for mental health support.',
  'Respond in ONE short sentence (15-20 words max).',
  'React directly to what they said - acknowledge their specific feeling or situation.',
  'Be warm and caring. Use simple, natural language like texting a friend.',
  'Examples: "That sounds really tough, I\'m here with you" or "I hear you - anxiety is exhausting".',
].join(' ');

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
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
  const value = userText.toLowerCase();

  if (isCrisisText(value)) {
    return `${CRISIS_RESPONSE} ${HELPLINE_NOTE}`;
  }
  if (/\?$/.test(value) && /(are you|can you|could you|should i|what do i do|what should i do)/.test(value)) {
    return 'Maybe start with something small - whatever feels most doable for you right now.';
  }
  if (/(panic|anxious|anxiety|overthinking|heart racing|can't breathe|cant breathe)/.test(value)) {
    return 'Hey, I\'m right here with you. Just focus on breathing slowly for a minute, okay?';
  }
  if (/(depress|empty|numb|hopeless|sad|low)/.test(value)) {
    return 'I\'m really sorry it feels this heavy. Please be extra kind to yourself today.';
  }
  if (/(alone|lonely|nobody|no one cares)/.test(value)) {
    return 'I care, and you genuinely matter. I\'m sitting here with you right now.';
  }
  if (/(stress|overwhelmed|too much|burned out|burnt out|exhausted)/.test(value)) {
    return 'That sounds exhausting. You don\'t have to tackle it all - just the next small step.';
  }
  if (/(can't sleep|cant sleep|insomnia|not sleeping|awake)/.test(value)) {
    return 'Sleep issues are the worst. Just rest quietly and be patient with yourself.';
  }
  if (/(angry|mad|frustrated)/.test(value)) {
    return 'Yeah, that would frustrate anyone. It\'s totally okay to feel that way.';
  }
  if (/(thank|thanks|appreciate)/.test(value)) {
    return 'Of course - I\'m really glad I could be here for you.';
  }
  if (/(good|great|better|happy|excited)/.test(value)) {
    return 'I\'m so glad to hear that! That\'s really wonderful.';
  }
  return 'I\'m here and listening. What\'s going on?';
}

function compactUserInput(text: string): string {
  return normalizeWhitespace(text).slice(0, 400); // Preserve more context for better understanding
}

function isQuestion(text: string): boolean {
  return /\?$/.test(text.trim()) || /^(what|why|how|when|where|who|can|could|should|would|do|did|is|are)\b/i.test(text.trim());
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
  const trimmed = sentences.slice(0, 1).join(' ').trim(); // One sentence for fast responses
  return trimmed || buildFallbackReply(userText);
}

export async function ensureLanguageModelLoaded(): Promise<boolean> {
  const current = ModelManager.getLoadedModel(ModelCategory.Language);
  if (current) return true;

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
  },
): Promise<CompanionReplyResult> {
  if (isCrisisText(userText)) {
    return { text: `${CRISIS_RESPONSE} ${HELPLINE_NOTE}`, source: 'fallback' };
  }

  const ready = await ensureLanguageModelLoaded();
  if (!ready) {
    return { text: buildFallbackReply(userText), source: 'fallback' };
  }

  try {
    const prompt = compactUserInput(userText);
    const generationOptions = {
      systemPrompt: COMPANION_SYSTEM_PROMPT,
      maxTokens: options?.maxTokens ?? FAST_CHAT_MAX_TOKENS,
      temperature: options?.temperature ?? FAST_TEMPERATURE,
      // Balanced parameters for speed + quality
      topK: 40,
      topP: 0.92,
      repeatPenalty: 1.1,
    };

    if (!options?.stream) {
      const result = await TextGeneration.generate(prompt, generationOptions);
      return { text: sanitizeCompanionReply(result.text, userText), source: 'model' };
    }

    const { stream, result } = await TextGeneration.generateStream(prompt, generationOptions);

    let accumulated = '';
    for await (const token of stream) {
      accumulated += token;
      options?.onToken?.(token, sanitizeCompanionReply(accumulated, userText));
    }

    const final = await result;
    const text = sanitizeCompanionReply(final.text || accumulated, userText);
    return { text, source: 'model' };
  } catch {
    return { text: buildFallbackReply(userText), source: 'fallback' };
  }
}



