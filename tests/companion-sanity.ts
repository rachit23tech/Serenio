function normalizeWhitespace(text: string): string {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

const CRISIS_KEYWORDS = [
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

function isCrisisText(text: string): boolean {
  const value = text.toLowerCase();
  return CRISIS_KEYWORDS.some((keyword) => value.includes(keyword));
}

function buildFallbackReply(userText: string): string {
  const normalized = normalizeWhitespace(userText);
  const value = normalized.toLowerCase();

  if (isCrisisText(value)) {
    return "I'm really glad you said it out loud. Please call or text a crisis helpline right now and stay with someone you trust if you can. If you are in immediate danger, call your local emergency number now.";
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

  if (isCrisisText(value)) return "I'm really glad you said it out loud. Please call or text a crisis helpline right now and stay with someone you trust if you can. If you are in immediate danger, call your local emergency number now.";

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
  if (/(what should i do|what do i do|how do i calm down|why do i feel like this|what's wrong with me|am i broken)/.test(value)) {
    return buildFallbackReply(userText);
  }
  if (isQuestion(value) && value.length <= 120) {
    return buildFallbackReply(userText);
  }

  return null;
}

function isQuestion(text: string): boolean {
  return /\?$/.test(text.trim()) || /^(what|why|how|when|where|who|can|could|should|would|do|did|is|are)\b/i.test(text.trim());
}

const samples = [
  {
    label: 'Crisis - explicit suicide intent',
    text: "I'm going to kill myself",
  },
  {
    label: 'Crisis - suicidal ideation',
    text: 'I want to die',
  },
  {
    label: 'Anxiety - panic',
    text: 'My heart is racing and I feel like I can’t breathe',
  },
  {
    label: 'Anxiety - general',
    text: 'I am so anxious and overthinking everything',
  },
  {
    label: 'Depression - low mood',
    text: 'I feel empty and hopeless',
  },
  {
    label: 'Depression - shame',
    text: 'What’s wrong with me? Am I broken?',
  },
  {
    label: 'Loneliness',
    text: 'I feel so alone and like no one cares',
  },
  {
    label: 'Burnout / stress',
    text: 'I am overwhelmed, burned out, and exhausted',
  },
  {
    label: 'Sleep problems',
    text: 'I can’t sleep and my mind won’t stop racing',
  },
  {
    label: 'Motivation request',
    text: 'Can you motivate me?',
  },
  {
    label: 'General help question',
    text: 'What should I do right now?',
  },
  {
    label: 'Thought question',
    text: 'Why do I feel this way?',
  },
  {
    label: 'Non-question present tense',
    text: 'I need help staying calm',
  },
  {
    label: 'Question with are you',
    text: 'Can you help me?',
  },
];

function run() {
  console.log('Mental health fallback/instant reply test');
  console.log('='.repeat(60));
  for (const sample of samples) {
    const instant = getInstantCompanionReply(sample.text);
    const fallback = buildFallbackReply(sample.text);
    const crisis = isCrisisText(sample.text);
    console.log(`\n[${sample.label}]`);
    console.log(`Input: ${sample.text}`);
    console.log(`isCrisisText: ${crisis}`);
    console.log(`getInstantCompanionReply: ${instant ?? '(no instant reply)'}`);
    console.log(`buildFallbackReply: ${fallback}`);
  }
}

run();
