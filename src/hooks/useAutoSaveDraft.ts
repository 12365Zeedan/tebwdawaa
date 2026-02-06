import { useState, useEffect, useCallback, useRef } from 'react';
import type { BlogPostFormData } from '@/hooks/useAdminBlog';

const DRAFT_STORAGE_KEY = 'blog-draft';
const AUTO_SAVE_INTERVAL = 5000; // 5 seconds

export type DraftStatus = 'idle' | 'saving' | 'saved' | 'restored';

function getDraftKey(postId?: string): string {
  return postId ? `${DRAFT_STORAGE_KEY}-${postId}` : `${DRAFT_STORAGE_KEY}-new`;
}

const emptyForm: BlogPostFormData = {
  title: '', title_ar: '', slug: '', excerpt: '', excerpt_ar: '',
  content: '', content_ar: '', image_url: null,
  author_name: '', author_name_ar: '',
  category: '', category_ar: '', read_time: 5,
  is_published: false,
  meta_title: '', meta_title_ar: '', meta_description: '', meta_description_ar: '',
  tag_ids: [],
};

function isFormEmpty(form: BlogPostFormData): boolean {
  return !form.title && !form.title_ar && !form.content && !form.content_ar && !form.excerpt && !form.excerpt_ar;
}

export function useAutoSaveDraft(postId?: string) {
  const key = getDraftKey(postId);
  const [status, setStatus] = useState<DraftStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const previousFormRef = useRef<string>('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load draft from localStorage
  const loadDraft = useCallback((): BlogPostFormData | null => {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      if (parsed && parsed.data && parsed.timestamp) {
        // Only restore drafts less than 7 days old
        const age = Date.now() - parsed.timestamp;
        if (age < 7 * 24 * 60 * 60 * 1000) {
          return parsed.data as BlogPostFormData;
        }
        // Expired, clean up
        localStorage.removeItem(key);
      }
    } catch {
      localStorage.removeItem(key);
    }
    return null;
  }, [key]);

  // Save draft to localStorage
  const saveDraft = useCallback((form: BlogPostFormData) => {
    if (isFormEmpty(form)) return;

    const serialized = JSON.stringify(form);
    // Skip if nothing changed
    if (serialized === previousFormRef.current) return;

    try {
      localStorage.setItem(key, JSON.stringify({
        data: form,
        timestamp: Date.now(),
      }));
      previousFormRef.current = serialized;
      setLastSaved(new Date());
      setStatus('saved');
    } catch {
      // localStorage full or unavailable
    }
  }, [key]);

  // Clear draft
  const clearDraft = useCallback(() => {
    localStorage.removeItem(key);
    previousFormRef.current = '';
    setStatus('idle');
    setLastSaved(null);
  }, [key]);

  // Check if a draft exists
  const hasDraft = useCallback((): boolean => {
    return loadDraft() !== null;
  }, [loadDraft]);

  // Schedule auto-save with debounce
  const scheduleAutoSave = useCallback((form: BlogPostFormData) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    setStatus('saving');
    timerRef.current = setTimeout(() => {
      saveDraft(form);
    }, AUTO_SAVE_INTERVAL);
  }, [saveDraft]);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return {
    loadDraft,
    saveDraft,
    clearDraft,
    hasDraft,
    scheduleAutoSave,
    status,
    lastSaved,
  };
}
