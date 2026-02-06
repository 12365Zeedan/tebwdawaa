import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BlogAnalyticsSummary {
  totalViews: number;
  totalPosts: number;
  avgViewsPerPost: number;
  viewsToday: number;
}

export interface TopPost {
  id: string;
  title: string;
  title_ar: string;
  slug: string;
  view_count: number;
  published_at: string | null;
  image_url: string | null;
}

export interface DailyViews {
  date: string;
  views: number;
}

export interface ReferrerBreakdown {
  referrer: string;
  count: number;
}

/**
 * Summary stats for blog analytics dashboard.
 */
export function useBlogAnalyticsSummary() {
  return useQuery({
    queryKey: ['blog-analytics-summary'],
    queryFn: async (): Promise<BlogAnalyticsSummary> => {
      // Get all posts with view counts
      const { data: posts, error: postsError } = await supabase
        .from('blog_posts')
        .select('id, view_count');
      if (postsError) throw postsError;

      const allPosts = posts || [];
      const totalViews = allPosts.reduce((sum, p) => sum + (p.view_count ?? 0), 0);
      const totalPosts = allPosts.length;

      // Get today's views
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { count, error: countError } = await supabase
        .from('blog_post_views')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', todayStart.toISOString());
      if (countError) throw countError;

      return {
        totalViews,
        totalPosts,
        avgViewsPerPost: totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0,
        viewsToday: count || 0,
      };
    },
  });
}

/**
 * Top posts by view count.
 */
export function useTopPosts(limit = 10) {
  return useQuery({
    queryKey: ['blog-analytics-top-posts', limit],
    queryFn: async (): Promise<TopPost[]> => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, title_ar, slug, view_count, published_at, image_url')
        .order('view_count', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []) as unknown as TopPost[];
    },
  });
}

/**
 * Views over time (last 30 days).
 */
export function useDailyViews(days = 30) {
  return useQuery({
    queryKey: ['blog-analytics-daily-views', days],
    queryFn: async (): Promise<DailyViews[]> => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('blog_post_views')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });
      if (error) throw error;

      // Fill all days in the range
      const dayMap = new Map<string, number>();
      for (let i = 0; i < days; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        dayMap.set(d.toISOString().split('T')[0], 0);
      }

      (data || []).forEach(v => {
        const day = new Date(v.created_at).toISOString().split('T')[0];
        dayMap.set(day, (dayMap.get(day) || 0) + 1);
      });

      return Array.from(dayMap.entries())
        .map(([date, views]) => ({ date, views }))
        .sort((a, b) => a.date.localeCompare(b.date));
    },
  });
}

/**
 * Referrer breakdown from view records.
 */
export function useReferrerBreakdown() {
  return useQuery({
    queryKey: ['blog-analytics-referrers'],
    queryFn: async (): Promise<ReferrerBreakdown[]> => {
      const { data, error } = await supabase
        .from('blog_post_views')
        .select('referrer');
      if (error) throw error;

      const refMap = new Map<string, number>();
      (data || []).forEach(v => {
        let ref = v.referrer || '';
        if (!ref || ref.trim() === '') {
          ref = 'Direct';
        } else {
          try {
            const url = new URL(ref);
            ref = url.hostname;
          } catch {
            // keep as-is
          }
        }
        refMap.set(ref, (refMap.get(ref) || 0) + 1);
      });

      return Array.from(refMap.entries())
        .map(([referrer, count]) => ({ referrer, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    },
  });
}
