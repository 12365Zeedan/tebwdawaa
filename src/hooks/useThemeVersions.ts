import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ThemeVersion {
  id: string;
  version: string;
  title: string;
  title_ar: string;
  changelog: string | null;
  changelog_ar: string | null;
  wordpress_file_url: string | null;
  shopify_file_url: string | null;
  salla_file_url: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ThemeVersionInput {
  version: string;
  title: string;
  title_ar: string;
  changelog?: string | null;
  changelog_ar?: string | null;
  wordpress_file_url?: string | null;
  shopify_file_url?: string | null;
  salla_file_url?: string | null;
  is_published?: boolean;
}

export function useThemeVersions() {
  return useQuery({
    queryKey: ['theme-versions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('theme_versions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ThemeVersion[];
    },
  });
}

/** Increment semver patch: 1.0.0 → 1.0.1 */
export function incrementVersion(version: string): string {
  const parts = version.split('.').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return '1.0.0';
  parts[2] += 1;
  return parts.join('.');
}

export function useCreateThemeVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ThemeVersionInput) => {
      const { data, error } = await supabase
        .from('theme_versions')
        .insert({
          ...input,
          published_at: input.is_published ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme-versions'] });
    },
  });
}

export function useUpdateThemeVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: ThemeVersionInput & { id: string }) => {
      const updateData: Record<string, unknown> = { ...input };
      if (input.is_published) {
        // Check if it was already published
        const { data: existing } = await supabase
          .from('theme_versions')
          .select('published_at')
          .eq('id', id)
          .single();
        if (!existing?.published_at) {
          updateData.published_at = new Date().toISOString();
        }
      }

      const { data, error } = await supabase
        .from('theme_versions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme-versions'] });
    },
  });
}

export function useDeleteThemeVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('theme_versions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme-versions'] });
    },
  });
}

export async function uploadThemeFile(file: File, platform: string, version: string): Promise<string> {
  const ext = file.name.split('.').pop();
  const filePath = `${platform}/${version}/theme-${platform}-v${version}.${ext}`;
  
  const { error } = await supabase.storage
    .from('theme-files')
    .upload(filePath, file, { upsert: true });

  if (error) throw error;

  // Return the path (not a public URL since the bucket is private)
  return filePath;
}
