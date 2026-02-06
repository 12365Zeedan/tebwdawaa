import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BlogPage {
  id: string;
  title: string;
  title_ar: string;
  slug: string;
  content: string | null;
  content_ar: string | null;
  is_published: boolean;
  sort_order: number;
  meta_title: string | null;
  meta_title_ar: string | null;
  meta_description: string | null;
  meta_description_ar: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPageFormData {
  title: string;
  title_ar: string;
  slug: string;
  content: string;
  content_ar: string;
  is_published: boolean;
  sort_order: number;
  meta_title: string;
  meta_title_ar: string;
  meta_description: string;
  meta_description_ar: string;
}

export function useBlogPages() {
  return useQuery({
    queryKey: ['blog-pages'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('blog_pages')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as BlogPage[];
    },
  });
}

export function useCreateBlogPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: BlogPageFormData) => {
      const { data, error } = await (supabase as any)
        .from('blog_pages')
        .insert(formData)
        .select()
        .single();
      if (error) throw error;
      return data as BlogPage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-pages'] });
      toast({ title: 'Page created successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateBlogPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data: formData }: { id: string; data: BlogPageFormData }) => {
      const { data, error } = await (supabase as any)
        .from('blog_pages')
        .update(formData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as BlogPage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-pages'] });
      toast({ title: 'Page updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteBlogPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('blog_pages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-pages'] });
      toast({ title: 'Page deleted' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}
