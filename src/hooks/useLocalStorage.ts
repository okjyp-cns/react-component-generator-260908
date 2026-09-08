import { useState, useCallback } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: {
    replacer?: (key: string, value: unknown) => unknown;
    reviver?: (key: string, value: unknown) => unknown;
  }
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;

      const parsed = JSON.parse(item);
      if (options?.reviver) {
        return JSON.parse(item, options.reviver);
      }
      return parsed;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (options?.replacer) {
        window.localStorage.setItem(key, JSON.stringify(valueToStore, options.replacer));
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch {
      // localStorage 접근 실패 시 silent fail
    }
  }, [key, storedValue, options]);

  return [storedValue, setValue];
}
