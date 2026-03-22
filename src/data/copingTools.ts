/**
 * copingTools.ts - Comprehensive coping toolkit library
 */

import type { CopingTool, EmotionState } from '../types/wellness';

export const COPING_TOOLS: CopingTool[] = [
  // BREATHING EXERCISES
  {
    id: 'box-breathing',
    type: 'breathing',
    name: 'Box Breathing',
    description: 'Military technique to calm anxiety instantly',
    duration: '4 minutes',
    effectiveFor: ['anxious', 'stressed', 'overwhelmed'],
    icon: '🫁',
    instructions: [
      'Breathe in slowly for 4 counts',
      'Hold your breath for 4 counts',
      'Exhale slowly for 4 counts',
      'Hold empty for 4 counts',
      'Repeat 4 times',
    ],
  },
  {
    id: '478-breathing',
    type: 'breathing',
    name: '4-7-8 Breathing',
    description: 'Natural sedative for the nervous system',
    duration: '3 minutes',
    effectiveFor: ['anxious', 'stressed', 'tired'],
    icon: '🌬️',
    instructions: [
      'Breathe in through your nose for 4 counts',
      'Hold your breath for 7 counts',
      'Exhale completely through your mouth for 8 counts',
      'Repeat 4 cycles',
      'Notice your body relaxing',
    ],
  },

  // GROUNDING TECHNIQUES
  {
    id: '54321-grounding',
    type: 'grounding',
    name: '5-4-3-2-1 Grounding',
    description: 'Anchor yourself in the present moment',
    duration: '5 minutes',
    effectiveFor: ['anxious', 'overwhelmed', 'stressed'],
    icon: '🌿',
    instructions: [
      'Name 5 things you can SEE around you',
      'Name 4 things you can TOUCH',
      'Name 3 things you can HEAR',
      'Name 2 things you can SMELL',
      'Name 1 thing you can TASTE',
    ],
  },
  {
    id: 'body-scan',
    type: 'grounding',
    name: 'Body Scan',
    description: 'Release tension by noticing physical sensations',
    duration: '8 minutes',
    effectiveFor: ['anxious', 'stressed', 'tired'],
    icon: '🧘',
    instructions: [
      'Lie down or sit comfortably',
      'Close your eyes and breathe naturally',
      'Notice your toes - any tension? Let it go',
      'Move up through legs, stomach, chest, arms',
      'Notice your neck, jaw, face',
      'Breathe into any tense areas',
    ],
  },

  // PHYSICAL ACTIVITIES
  {
    id: 'cold-water',
    type: 'physical',
    name: 'Cold Water Reset',
    description: 'Instantly activate your vagus nerve',
    duration: '2 minutes',
    effectiveFor: ['anxious', 'overwhelmed', 'angry'],
    icon: '💧',
    instructions: [
      'Run cold water over your hands and wrists for 30 seconds',
      'Splash cold water on your face',
      'Or hold an ice cube in your hand',
      'Notice the sensation - it brings you to the present',
      'Your nervous system will calm down',
    ],
  },
  {
    id: 'progressive-muscle',
    type: 'physical',
    name: 'Progressive Muscle Relaxation',
    description: 'Tense and release to reduce physical anxiety',
    duration: '10 minutes',
    effectiveFor: ['anxious', 'stressed', 'tired'],
    icon: '💪',
    instructions: [
      'Tense your toes for 5 seconds, then release',
      'Move up: calves, thighs, stomach, hands, arms',
      'Tense shoulders up to ears, then drop',
      'Clench jaw, then relax',
      'Notice the difference between tension and relaxation',
    ],
  },
  {
    id: 'quick-walk',
    type: 'physical',
    name: '5-Minute Walk',
    description: 'Movement shifts your mental state',
    duration: '5 minutes',
    effectiveFor: ['sad', 'stressed', 'tired', 'angry'],
    icon: '🚶',
    instructions: [
      'Stand up and go outside (or just move)',
      'Walk at whatever pace feels right',
      'No phone, no music - just notice your surroundings',
      'Feel your feet touching the ground',
      'Movement changes chemistry in your brain',
    ],
  },

  // DISTRACTION TECHNIQUES
  {
    id: 'count-backwards',
    type: 'distraction',
    name: 'Count Backwards from 100',
    description: 'Occupy your anxious mind',
    duration: '3 minutes',
    effectiveFor: ['anxious', 'overwhelmed'],
    icon: '🔢',
    instructions: [
      'Count backwards from 100 by 7s: 100, 93, 86...',
      'Or recite the alphabet backwards',
      'Or name animals alphabetically',
      'The mental effort interrupts anxious thoughts',
    ],
  },
  {
    id: 'sensory-focus',
    type: 'distraction',
    name: 'Sensory Focus',
    description: 'Fully engage one sense at a time',
    duration: '4 minutes',
    effectiveFor: ['anxious', 'overwhelmed'],
    icon: '👂',
    instructions: [
      'Pick one sense to focus on',
      'If sound: Close your eyes and list every sound you hear',
      'If touch: Feel the texture of your clothes, chair, floor',
      'If sight: Notice every color in the room',
      'Stay with that one sense for 2 minutes',
    ],
  },

  // SOCIAL TECHNIQUES
  {
    id: 'reach-out',
    type: 'social',
    name: 'Text One Person',
    description: 'Connection reduces distress',
    duration: '2 minutes',
    effectiveFor: ['lonely', 'sad', 'anxious'],
    icon: '📱',
    instructions: [
      'Think of one safe person',
      'Send them a simple text: "Hey, thinking of you"',
      'Or "I\'m having a rough moment. Can we talk later?"',
      'Or just "I need to hear a friendly voice"',
      'You don\'t have to explain everything',
    ],
  },
  {
    id: 'self-hug',
    type: 'social',
    name: 'Self-Hug (Butterfly Hug)',
    description: 'Self-soothing through touch',
    duration: '2 minutes',
    effectiveFor: ['sad', 'lonely', 'anxious'],
    icon: '🤗',
    instructions: [
      'Cross your arms over your chest',
      'Place each hand on the opposite shoulder',
      'Gently tap alternating sides (left, right, left, right)',
      'Do this slowly for 30 seconds',
      'Tell yourself: "I\'m here for me"',
    ],
  },

  // EMERGENCY TECHNIQUES
  {
    id: 'emergency-plan',
    type: 'emergency',
    name: 'Crisis Action Plan',
    description: 'When you\'re in crisis right now',
    duration: 'Use immediately',
    effectiveFor: ['overwhelmed', 'anxious', 'sad'],
    icon: '🆘',
    instructions: [
      'If thinking about self-harm: Call crisis line NOW (988)',
      'Tell someone you trust: "I need help right now"',
      'Remove yourself from unsafe situations',
      'Go to a public place if you\'re alone',
      'Stay with someone until the crisis passes',
    ],
  },
  {
    id: 'comfort-kit',
    type: 'emergency',
    name: 'Use Your Comfort Kit',
    description: 'Items that soothe you',
    duration: '10 minutes',
    effectiveFor: ['sad', 'anxious', 'lonely', 'stressed'],
    icon: '🎁',
    instructions: [
      'Get your comfort item: blanket, stuffed animal, photo',
      'Put on your favorite comfort show or movie',
      'Make a warm drink (tea, hot chocolate)',
      'Wrap yourself in something soft',
      'Sometimes we just need gentle comfort',
    ],
  },
];

// Get recommended tools based on emotion
export function getRecommendedTools(emotion: EmotionState): CopingTool[] {
  return COPING_TOOLS.filter(tool => tool.effectiveFor.includes(emotion));
}

// Get tools by type
export function getToolsByType(type: CopingTool['type']): CopingTool[] {
  return COPING_TOOLS.filter(tool => tool.type === type);
}
