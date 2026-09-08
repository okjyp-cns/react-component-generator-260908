import { describe, it, expect } from 'vitest';
import { validatePrompt, isPromptValid, MAX_PROMPT_LENGTH } from './validatePrompt';

describe('validatePrompt', () => {
  it('should return valid for normal prompt', () => {
    const result = validatePrompt('검색 필터 바를 만들어줘');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.charCount).toBe(13);
    expect(result.remainingChars).toBe(MAX_PROMPT_LENGTH - 13);
  });

  it('should return invalid for empty prompt', () => {
    const result = validatePrompt('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('프롬프트를 입력해주세요');
    expect(result.charCount).toBe(0);
  });

  it('should return invalid for whitespace-only prompt', () => {
    const result = validatePrompt('   \n  ');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('프롬프트를 입력해주세요');
  });

  it('should return invalid for prompt exceeding 500 chars', () => {
    const longPrompt = 'a'.repeat(501);
    const result = validatePrompt(longPrompt);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('500자 이내');
    expect(result.charCount).toBe(501);
    expect(result.remainingChars).toBe(-1);
  });

  it('should return valid for prompt exactly 500 chars', () => {
    const prompt = 'a'.repeat(500);
    const result = validatePrompt(prompt);
    expect(result.isValid).toBe(true);
    expect(result.charCount).toBe(500);
    expect(result.remainingChars).toBe(0);
  });

  it('should trim whitespace before validation', () => {
    const result = validatePrompt('  검색 필터   ');
    expect(result.charCount).toBe(5);
    expect(result.isValid).toBe(true);
  });
});

describe('isPromptValid', () => {
  it('should return true for valid prompt', () => {
    expect(isPromptValid('유효한 프롬프트')).toBe(true);
  });

  it('should return false for invalid prompt', () => {
    expect(isPromptValid('')).toBe(false);
    expect(isPromptValid('a'.repeat(501))).toBe(false);
  });
});
