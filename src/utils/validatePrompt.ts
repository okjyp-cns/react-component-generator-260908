const MAX_PROMPT_LENGTH = 500;

interface ValidationResult {
  isValid: boolean;
  error?: string;
  charCount: number;
  remainingChars: number;
}

export function validatePrompt(prompt: string): ValidationResult {
  const trimmed = prompt.trim();
  const charCount = trimmed.length;
  const remainingChars = MAX_PROMPT_LENGTH - charCount;

  if (!trimmed) {
    return {
      isValid: false,
      error: '프롬프트를 입력해주세요',
      charCount: 0,
      remainingChars: MAX_PROMPT_LENGTH,
    };
  }

  if (charCount > MAX_PROMPT_LENGTH) {
    return {
      isValid: false,
      error: `프롬프트는 ${MAX_PROMPT_LENGTH}자 이내여야 합니다 (현재: ${charCount}자)`,
      charCount,
      remainingChars,
    };
  }

  return {
    isValid: true,
    charCount,
    remainingChars,
  };
}

export function isPromptValid(prompt: string): boolean {
  return validatePrompt(prompt).isValid;
}

export { MAX_PROMPT_LENGTH };
