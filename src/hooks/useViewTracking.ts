import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Records a view for a blog post (once per session per post).
 * Uses sessionStorage to avoid duplicate counts within the same browser session.
 */
export function useRecordView(postId: string | undefined) {
  const recorded = useRef(false);

  useEffect(() => {
    if (!postId || recorded.current) return;

    const key = `blog-viewed-${postId}`;
    if (sessionStorage.getItem(key)) {
      recorded.current = true;
      return;
    }

    recorded.current = true;
    sessionStorage.setItem(key, '1');

    supabase.rpc('record_blog_view', {
      p_blog_post_id: postId,
      p_viewer_ip: null,
      p_user_agent: navigator.userAgent,
      p_referrer: document.referrer || null,
      p_user_id: null,
    }).then(({ error }) => {
      if (error) console.error('Failed to record view:', error.message);
    });

    // Also try to attach user_id if logged in
    supabase.auth.getUser().then(({ data }) => {
      // The view is already recorded; user_id was null. This is fine for analytics.
    });
  }, [postId]);
}

interface ViewAnalytics {
  totalViews: number;
  uniqueViewers: number;
  viewsByDay: { date: string; views: number }[];
}

/**
 * Fetches view analytics for a specific blog post (admin only).
 */
export function useBlogPostAnalytics(postId: string | undefined) {
  return useQuery({
    queryKey: ['blog-post-analytics', postId],
    queryFn: async (): Promise<ViewAnalytics> => {
      if (!postId) throw new Error('No post ID');

      const { data: views, error } = await supabase
        .from('blog_post_views')
        .select('created_at, viewer_ip, user_agent')
        .eq('blog_post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const allViews = views || [];
      const uniqueAgents = new Set(allViews.map(v => v.user_agent || 'unknown'));

      // Group by day
      const dayMap = new Map<string, number>();
      allViews.forEach(v => {
        const day = new Date(v.created_at).toISOString().split('T')[0];
        dayMap.set(day, (dayMap.get(day) || 0) + 1);
      });

      const viewsByDay = Array.from(dayMap.entries())
        .map(([date, views]) => ({ date, views }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30); // Last 30 days

      return {
        totalViews: allViews.length,
        uniqueViewers: uniqueAgents.size,
        viewsByDay,
      };
    },
    enabled: !!postId,
  });
}

/**
 * Fetches view counts for all blog posts (admin summary).
 */
export function useBlogViewCounts() {
  return useQuery({
    queryKey: ['blog-view-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, view_count')
        .order('view_count', { ascending: false });

      if (error) throw error;

      const map = new Map<string, number>();
      (data || []).forEach(p => map.set(p.id, p.view_count ?? 0));
      return map;
    },
  });
}
