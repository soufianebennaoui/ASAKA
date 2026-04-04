import { useState, useEffect } from 'react';

/**
 * Like useState, but:
 *  1. Initialises from localStorage (survives page refresh)
 *  2. Saves to localStorage on every change
 *  3. Syncs across browser tabs in real-time via the `storage` event
 */
export function useSharedState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Persist every change to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);

  // Listen for changes made in OTHER browser tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key !== key) return;
      try {
        setState(e.newValue ? JSON.parse(e.newValue) : initialValue);
      } catch {}
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [key, initialValue]);

  return [state, setState];
}
