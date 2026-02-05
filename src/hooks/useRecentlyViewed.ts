import { useState, useEffect, useCallback } from 'react';

const RECENTLY_VIEWED_KEY = 'recently-viewed-products';
const MAX_RECENT_ITEMS = 10;

export function useRecentlyViewed() {
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (stored) {
      try {
        setRecentIds(JSON.parse(stored));
      } catch {
        setRecentIds([]);
      }
    }
  }, []);

  const addToRecentlyViewed = useCallback((productId: string) => {
    setRecentIds(prev => {
      // Remove if already exists, then add to front
      const filtered = prev.filter(id => id !== productId);
      const updated = [productId, ...filtered].slice(0, MAX_RECENT_ITEMS);
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentIds([]);
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
  }, []);

  return {
    recentIds,
    addToRecentlyViewed,
    clearRecentlyViewed,
  };
}
