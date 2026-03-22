/**
 * crisisDetection.ts - Enhanced Crisis Detection & Immediate Help
 */

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
      return `🚨 I'm really worried about you right now. This is serious and you deserve immediate help.

**Please do one of these RIGHT NOW:**

• **Call 988** (Suicide & Crisis Lifeline) - Available 24/7
• **Text "HELLO" to 741741** (Crisis Text Line)
• **Call 911** if you're in immediate danger
• **Go to your nearest emergency room**

If you have someone you trust nearby, please tell them what you're feeling right now. Don't go through this alone.

I'm going to stay right here with you. Are you safe right now?`;

    case 'moderate':
      return `⚠️ I hear that you're really struggling, and I'm glad you're talking about it. What you're feeling matters.

**Please reach out for support:**

• **Call 988** (Suicide & Crisis Lifeline) - They can help
• **Text "HELLO" to 741741** (Crisis Text Line)
• **Contact a trusted friend or family member**
• **Call your therapist if you have one**

You don't have to handle this alone. Can you reach out to someone safe?`;

    case 'mild':
      return `I can hear that you're really overwhelmed right now. That's a lot to carry.

**Here's what might help:**

• Take a few slow, deep breaths
• Use the 5-4-3-2-1 grounding technique (check Exercises)
• Reach out to someone you trust
• If it gets worse, call 988 or text 741741

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
        name: '988 Suicide & Crisis Lifeline',
        description: 'Free, confidential 24/7 support',
        action: 'Call 988',
        type: 'phone' as const,
        contact: '988',
      },
      {
        name: 'Crisis Text Line',
        description: 'Text-based crisis support 24/7',
        action: 'Text HELLO to 741741',
        type: 'text' as const,
        contact: '741741',
      },
      {
        name: 'Emergency Services',
        description: 'For immediate danger',
        action: 'Call 911',
        type: 'phone' as const,
        contact: '911',
      },
    ],
    international: [
      {
        name: 'International Association for Suicide Prevention',
        description: 'Crisis centers worldwide',
        action: 'Find your country',
        type: 'web' as const,
        contact: 'https://www.iasp.info/resources/Crisis_Centres/',
      },
    ],
    ongoing: [
      {
        name: 'NAMI Helpline',
        description: 'Mental health information and support',
        action: 'Call 1-800-950-6264',
        type: 'phone' as const,
        contact: '1-800-950-6264',
      },
      {
        name: 'SAMHSA National Helpline',
        description: 'Treatment referral and information',
        action: 'Call 1-800-662-4357',
        type: 'phone' as const,
        contact: '1-800-662-4357',
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
