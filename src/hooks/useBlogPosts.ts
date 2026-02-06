 import { useQuery } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 
export interface BlogPost {
  id: string;
  title: string;
  title_ar: string;
  slug: string;
  excerpt: string | null;
  excerpt_ar: string | null;
  content: string | null;
  content_ar: string | null;
  image_url: string | null;
  author_id: string | null;
  author_name: string | null;
  author_name_ar: string | null;
  category: string | null;
  category_ar: string | null;
  read_time: number;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  meta_title: string | null;
  meta_title_ar: string | null;
  meta_description: string | null;
  meta_description_ar: string | null;
}
 
 export function useBlogPosts(options?: { limit?: number }) {
   return useQuery({
     queryKey: ['blog-posts', options],
     queryFn: async () => {
       let query = supabase
         .from('blog_posts')
         .select('*')
         .eq('is_published', true)
         .order('published_at', { ascending: false });
 
       if (options?.limit) {
         query = query.limit(options.limit);
       }
 
       const { data, error } = await query;
 
      if (error) throw error;
      return data as unknown as BlogPost[];
     }
   });
 }
 
 export function useBlogPost(slug: string) {
   return useQuery({
     queryKey: ['blog-post', slug],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('blog_posts')
         .select('*')
         .eq('slug', slug)
         .maybeSingle();
 
      if (error) throw error;
      return data as unknown as BlogPost | null;
     },
     enabled: !!slug
   });
 }