import { useState, useCallback, useMemo } from 'react';

interface LocalStorageOptions {
  replacer?: (key: string, value: unknown) => unknown;
  reviver?: (key: string, value: unknown) => unknown;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: LocalStorageOptions
): [T, (value: T | ((val: T) => T)) => void] {
  // Memoize options to prevent unnecessary re-renders
  const memoizedOptions = useMemo(() => options, [options?.replacer, options?.reviver]);

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;

      if (memoizedOptions?.reviver) {
        return JSON.parse(item, memoizedOptions.reviver);
      }
      return JSON.parse(item);
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = typeof value === 'function' ? (value as (val: T) => T)(storedValue) : value;
        setStoredValue(valueToStore);

        if (memoizedOptions?.replacer) {
          window.localStorage.setItem(key, JSON.stringify(valueToStore, memoizedOptions.replacer));
        } else {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch {
        // localStorage 접근 실패 시 silent fail
      }
    },
    [key, storedValue, memoizedOptions]
  );

  return [storedValue, setValue];
}
