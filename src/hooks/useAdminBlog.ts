import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AdminBlogPost {
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
  read_time: number | null;
  is_published: boolean | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  meta_title: string | null;
  meta_title_ar: string | null;
  meta_description: string | null;
  meta_description_ar: string | null;
}

export interface BlogPostFormData {
  title: string;
  title_ar: string;
  slug: string;
  excerpt: string;
  excerpt_ar: string;
  content: string;
  content_ar: string;
  image_url: string | null;
  author_name: string;
  author_name_ar: string;
  category: string;
  category_ar: string;
  read_time: number;
  is_published: boolean;
  meta_title: string;
  meta_title_ar: string;
  meta_description: string;
  meta_description_ar: string;
  tag_ids: string[];
}

export interface BlogTag {
  id: string;
  name: string;
  name_ar: string;
  slug: string;
  created_at: string;
}

export function useAdminBlogPosts(search?: string) {
  return useQuery({
    queryKey: ['admin-blog-posts', search],
    queryFn: async () => {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`title.ilike.%${search}%,title_ar.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as AdminBlogPost[];
    },
  });
}

export function useCreateBlogPost() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: BlogPostFormData) => {
      const { tag_ids, ...postData } = formData;

      const { data: post, error: postError } = await supabase
        .from('blog_posts')
        .insert({
          ...postData,
          published_at: postData.is_published ? new Date().toISOString() : null,
        } as any)
        .select()
        .single();

      if (postError) throw postError;

      if (tag_ids.length > 0) {
        const tagLinks = tag_ids.map((tag_id) => ({
          blog_post_id: (post as any).id,
          tag_id,
        }));
        const { error: tagError } = await (supabase as any)
          .from('blog_post_tags')
          .insert(tagLinks);
        if (tagError) throw tagError;
      }

      return post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast({ title: 'Blog post created successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateBlogPost() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data: formData }: { id: string; data: BlogPostFormData }) => {
      const { tag_ids, ...postData } = formData;

      const { data: post, error: postError } = await supabase
        .from('blog_posts')
        .update({
          ...postData,
          published_at: postData.is_published ? new Date().toISOString() : null,
        } as any)
        .eq('id', id)
        .select()
        .single();

      if (postError) throw postError;

      // Remove existing tags, re-add
      await (supabase as any).from('blog_post_tags').delete().eq('blog_post_id', id);

      if (tag_ids.length > 0) {
        const tagLinks = tag_ids.map((tag_id) => ({
          blog_post_id: id,
          tag_id,
        }));
        await (supabase as any).from('blog_post_tags').insert(tagLinks);
      }

      return post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast({ title: 'Blog post updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast({ title: 'Blog post deleted' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

// Tags hooks
export function useBlogTags() {
  return useQuery({
    queryKey: ['blog-tags'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('blog_tags')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as BlogTag[];
    },
  });
}

export function useCreateBlogTag() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ name, name_ar }: { name: string; name_ar: string }) => {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const { data, error } = await (supabase as any)
        .from('blog_tags')
        .insert({ name, name_ar, slug })
        .select()
        .single();
      if (error) throw error;
      return data as BlogTag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-tags'] });
      toast({ title: 'Tag created' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteBlogTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('blog_tags').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-tags'] });
    },
  });
}

export function usePostTags(postId: string) {
  return useQuery({
    queryKey: ['blog-post-tags', postId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('blog_post_tags')
        .select('tag_id')
        .eq('blog_post_id', postId);
      if (error) throw error;
      return (data as any[]).map((d: any) => d.tag_id as string);
    },
    enabled: !!postId,
  });
}
