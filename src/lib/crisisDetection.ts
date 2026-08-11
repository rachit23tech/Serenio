import type { CrisisLevel, EmotionState } from '../types/wellness';

// Crisis keywords categorized by severity
export const SEVERE_CRISIS_KEYWORDS = [
  'kill myself',
  'killing myself', 
  'suicide',
  'suicidal',
  'end my life',
  'ending my life',
  'want to die',
  'better off dead',
  'no reason to live',
  'goodbye cruel world',
  'final goodbye',
] as const;

export const MODERATE_CRISIS_KEYWORDS = [
  'self harm',
  'hurt myself',
  'hurting myself',
  'cut myself',
  'cutting myself',
  'harm myself',
  'don\'t want to live',
  'dont want to live',
  'can\'t go on',
  'cant go on',
  'give up',
  'no hope',
  'hopeless',
  'worthless',
] as const;

export const MILD_DISTRESS_KEYWORDS = [
  'panic',
  'panic attack',
  'can\'t breathe',
  'cant breathe',
  'heart racing',
  'losing it',
  'falling apart',
  'breaking down',
  'can\'t handle',
  'too much',
  'overwhelmed',
] as const;

export interface CrisisDetectionResult {
  level: CrisisLevel['level'];
  detectedKeywords: string[];
  confidence: number; // 0-1
  recommendedAction: 'immediate' | 'urgent' | 'supportive' | 'none';
  message: string;
}

/**
 * Detect crisis level from user text
 */
export function detectCrisis(text: string): CrisisDetectionResult {
  const lower = text.toLowerCase();
  const detectedKeywords: string[] = [];
  
  // Check severe crisis keywords
  const severeMatches = SEVERE_CRISIS_KEYWORDS.filter(keyword => {
    if (lower.includes(keyword)) {
      detectedKeywords.push(keyword);
      return true;
    }
    return false;
  });

  if (severeMatches.length > 0) {
    return {
      level: 'severe',
      detectedKeywords,
      confidence: 0.95,
      recommendedAction: 'immediate',
      message: getCrisisMessage('severe'),
    };
  }

  // Check moderate crisis keywords
  const moderateMatches = MODERATE_CRISIS_KEYWORDS.filter(keyword => {
    if (lower.includes(keyword)) {
      detectedKeywords.push(keyword);
      return true;
    }
    return false;
  });

  if (moderateMatches.length >= 2) {
    return {
      level: 'severe',
      detectedKeywords,
      confidence: 0.85,
      recommendedAction: 'immediate',
      message: getCrisisMessage('severe'),
    };
  }

  if (moderateMatches.length === 1) {
    return {
      level: 'moderate',
      detectedKeywords,
      confidence: 0.75,
      recommendedAction: 'urgent',
      message: getCrisisMessage('moderate'),
    };
  }

  // Check mild distress keywords
  const mildMatches = MILD_DISTRESS_KEYWORDS.filter(keyword => {
    if (lower.includes(keyword)) {
      detectedKeywords.push(keyword);
      return true;
    }
    return false;
  });

  if (mildMatches.length >= 2) {
    return {
      level: 'moderate',
      detectedKeywords,
      confidence: 0.65,
      recommendedAction: 'urgent',
      message: getCrisisMessage('moderate'),
    };
  }

  if (mildMatches.length === 1) {
    return {
      level: 'mild',
      detectedKeywords,
      confidence: 0.5,
      recommendedAction: 'supportive',
      message: getCrisisMessage('mild'),
    };
  }

  return {
    level: 'none',
    detectedKeywords: [],
    confidence: 0,
    recommendedAction: 'none',
    message: '',
  };
}

/**
 * Get appropriate crisis message based on level
 */
function getCrisisMessage(level: 'severe' | 'moderate' | 'mild'): string {
  switch (level) {
    case 'severe':
      return `🚨 I'm really worried about you right now. This is serious and you deserve immediate support.

**Please reach out right now:**

• **Call iCall: 9152987821** (Mon–Sat, 8am–10pm)
• **Call Vandrevala Foundation: 1860-2662-345** (24/7)
• **Call AASRA: 9820466627** (24/7)
• **Call Tele-MANAS: 14416** (24/7 Toll-Free)
• **Call 988** (US/Canada) or **112 / 911** for emergency services

If you have someone you trust nearby, please tell them what you're feeling right now. Don't go through this alone. I'm right here with you. Are you safe right now?`;

    case 'moderate':
      return `⚠️ I hear that you're really struggling, and I'm glad you're talking about it. What you're feeling matters.

**Please reach out for support:**

• **Call iCall: 9152987821** or **Vandrevala Foundation: 1860-2662-345**
• **Call AASRA: 9820466627** or **Tele-MANAS: 14416**
• **Contact a trusted friend, family member, or therapist**

You don't have to handle this alone. Can you reach out to someone safe?`;

    case 'mild':
      return `I can hear that you're really overwhelmed right now. That's a lot to carry.

**Here's what might help:**

• Take a few slow, deep breaths
• Try a grounding exercise (check Wellness Hub)
• Reach out to a trusted friend or helpline
• If it gets worse, call **9152987821** (iCall) or **988**

I'm here with you. Want to talk about what's happening?`;

    default:
      return '';
  }
}

/**
 * Get crisis resources for display
 */
export function getCrisisResources() {
  return {
    immediate: [
      {
        name: 'iCall Psychosocial Helpline',
        description: 'Free, confidential support (Mon–Sat, 8am–10pm)',
        action: 'Call 9152987821',
        type: 'phone' as const,
        contact: '9152987821',
      },
      {
        name: 'Vandrevala Foundation',
        description: '24/7 Mental Health Helpline',
        action: 'Call 1860-2662-345',
        type: 'phone' as const,
        contact: '1860-2662-345',
      },
      {
        name: 'AASRA Crisis Center',
        description: '24/7 Suicide Prevention Helpline',
        action: 'Call 9820466627',
        type: 'phone' as const,
        contact: '9820466627',
      },
      {
        name: 'Tele-MANAS',
        description: '24/7 Govt. Mental Health Care Helpline',
        action: 'Call 14416',
        type: 'phone' as const,
        contact: '14416',
      },
    ],
    international: [
      {
        name: '988 Suicide & Crisis Lifeline (US/CA)',
        description: '24/7 Free & Confidential Support',
        action: 'Call 988',
        type: 'phone' as const,
        contact: '988',
      },
      {
        name: 'Befrienders Worldwide',
        description: 'Find a crisis hotline anywhere in the world',
        action: 'Find your country',
        type: 'web' as const,
        contact: 'https://www.befrienders.org/',
      },
    ],
    ongoing: [
      {
        name: 'Snehi Helpline',
        description: 'Mental health & emotional support',
        action: 'Call 044-24640050',
        type: 'phone' as const,
        contact: '044-24640050',
      },
    ],
  };
}

/**
 * Check if user is trying to minimize crisis ("I'm fine" but crisis detected)
 */
export function detectMinimization(text: string, crisisLevel: CrisisLevel['level']): boolean {
  if (crisisLevel === 'none') return false;
  
  const lower = text.toLowerCase();
  const minimizingPhrases = [
    'i\'m fine',
    'im fine',
    'i\'m okay',
    'im okay',
    'don\'t worry',
    'dont worry',
    'just kidding',
    'never mind',
    'forget it',
    'not serious',
  ];

  return minimizingPhrases.some(phrase => lower.includes(phrase));
}
