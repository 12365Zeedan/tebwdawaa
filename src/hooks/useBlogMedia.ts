import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  size: number;
  created_at: string;
  metadata: Record<string, any>;
}

export function useBlogMedia() {
  return useQuery({
    queryKey: ['blog-media'],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from('blog-images')
        .list('', { limit: 200, sortBy: { column: 'created_at', order: 'desc' } });
      if (error) throw error;

      const { data: { publicUrl: baseUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl('');

      return (data || [])
        .filter(f => !f.id?.startsWith('.'))
        .map(file => ({
          id: file.id || file.name,
          name: file.name,
          url: `${baseUrl}${file.name}`,
          size: file.metadata?.size || 0,
          created_at: file.created_at || '',
          metadata: file.metadata || {},
        })) as MediaFile[];
    },
  });
}

export function useUploadBlogMedia() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

      const { error } = await supabase.storage
        .from('blog-images')
        .upload(fileName, file);
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(fileName);

      return { name: fileName, url: publicUrl };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-media'] });
      toast({ title: 'File uploaded successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteBlogMedia() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (fileName: string) => {
      const { error } = await supabase.storage
        .from('blog-images')
        .remove([fileName]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-media'] });
      toast({ title: 'File deleted' });
    },
    onError: (error: any) => {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    },
  });
}
