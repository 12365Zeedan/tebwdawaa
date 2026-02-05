import { useState, useEffect, useCallback } from 'react';

const COMPARISON_STORAGE_KEY = 'product-comparison';
const MAX_COMPARE_ITEMS = 4;

export function useProductComparison() {
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(COMPARISON_STORAGE_KEY);
    if (stored) {
      try {
        setComparisonIds(JSON.parse(stored));
      } catch {
        setComparisonIds([]);
      }
    }
  }, []);

  const saveToStorage = useCallback((ids: string[]) => {
    localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(ids));
  }, []);

  const addToComparison = useCallback((productId: string) => {
    setComparisonIds(prev => {
      if (prev.includes(productId)) return prev;
      if (prev.length >= MAX_COMPARE_ITEMS) return prev;
      const updated = [...prev, productId];
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const removeFromComparison = useCallback((productId: string) => {
    setComparisonIds(prev => {
      const updated = prev.filter(id => id !== productId);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const clearComparison = useCallback(() => {
    setComparisonIds([]);
    localStorage.removeItem(COMPARISON_STORAGE_KEY);
  }, []);

  const isInComparison = useCallback((productId: string) => {
    return comparisonIds.includes(productId);
  }, [comparisonIds]);

  const toggleComparison = useCallback((productId: string) => {
    if (isInComparison(productId)) {
      removeFromComparison(productId);
      return false;
    } else {
      addToComparison(productId);
      return true;
    }
  }, [isInComparison, addToComparison, removeFromComparison]);

  return {
    comparisonIds,
    comparisonCount: comparisonIds.length,
    maxItems: MAX_COMPARE_ITEMS,
    canAddMore: comparisonIds.length < MAX_COMPARE_ITEMS,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison,
    toggleComparison,
  };
}
