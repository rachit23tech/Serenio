import { describe, it, expect } from 'vitest';
import {
  isCrisisText,
  detectMoodFromText,
  sanitizeCompanionReply,
  buildFallbackReply,
  CRISIS_RESPONSE,
} from '../../src/lib/companion';

describe('Companion & Crisis Detection Utilities', () => {
  describe('isCrisisText', () => {
    it('detects crisis keywords correctly', () => {
      expect(isCrisisText('I want to kill myself')).toBe(true);
      expect(isCrisisText('I am thinking of suicide')).toBe(true);
      expect(isCrisisText('I feel like hurting myself')).toBe(true);
    });

    it('returns false for normal emotional distress or general text', () => {
      expect(isCrisisText('I feel sad today')).toBe(false);
      expect(isCrisisText('I am really stressed about exams')).toBe(false);
      expect(isCrisisText('Hello Serenio!')).toBe(false);
    });
  });

  describe('detectMoodFromText', () => {
    it('categorizes struggling mood for panic or extreme distress', () => {
      expect(detectMoodFromText('I am having panic attacks')).toBe('struggling');
      expect(detectMoodFromText('I feel hopeless')).toBe('struggling');
    });

    it('categorizes low mood for sadness', () => {
      expect(detectMoodFromText('I am feeling sad and lonely')).toBe('low');
      expect(detectMoodFromText('Extremely burned out')).toBe('low');
    });

    it('categorizes great mood for positive statements', () => {
      expect(detectMoodFromText('Today was amazing and great')).toBe('great');
    });

    it('categorizes good mood for calm/relieved statements', () => {
      expect(detectMoodFromText('I feel much better and calm')).toBe('good');
    });

    it('defaults to okay for neutral statements', () => {
      expect(detectMoodFromText('Just sitting here')).toBe('okay');
    });
  });

  describe('sanitizeCompanionReply', () => {
    it('removes LLM artifact tags and system prefix', () => {
      const raw = '<|im_start|>assistant\nI am Serenio. I hear you and I am here to support you.<|im_end|>';
      const cleaned = sanitizeCompanionReply(raw, 'Hello');
      expect(cleaned).not.toContain('<|im_start|>');
      expect(cleaned).not.toContain('I am Serenio.');
      expect(cleaned).toContain('I hear you');
    });

    it('falls back if text contains system tokens', () => {
      const raw = 'System prompt: rules follow examples';
      const cleaned = sanitizeCompanionReply(raw, 'Help');
      expect(cleaned).toBe(buildFallbackReply('Help'));
    });
  });

  describe('buildFallbackReply', () => {
    it('returns crisis response if user input is crisis text', () => {
      const reply = buildFallbackReply('I want to end my life');
      expect(reply).toContain(CRISIS_RESPONSE);
    });

    it('returns encouraging reply for motivation request', () => {
      const reply = buildFallbackReply('Cheer me up');
      expect(reply.length).toBeGreaterThan(10);
    });
  });
});
