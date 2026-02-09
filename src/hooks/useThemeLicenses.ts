import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ThemeLicense {
  id: string;
  license_key: string;
  customer_name: string;
  customer_email: string;
  platform: 'wordpress' | 'shopify' | 'salla';
  is_active: boolean;
  expires_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ThemeLicenseInput {
  license_key?: string;
  customer_name: string;
  customer_email: string;
  platform: 'wordpress' | 'shopify' | 'salla';
  is_active?: boolean;
  expires_at?: string | null;
  notes?: string | null;
}

export interface ThemeDownload {
  id: string;
  version_id: string;
  license_id: string;
  platform: string;
  ip_address: string | null;
  downloaded_at: string;
}

function generateLicenseKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segments = 4;
  const segLen = 5;
  const parts: string[] = [];
  for (let s = 0; s < segments; s++) {
    let seg = '';
    for (let i = 0; i < segLen; i++) {
      seg += chars[Math.floor(Math.random() * chars.length)];
    }
    parts.push(seg);
  }
  return parts.join('-');
}

export function useThemeLicenses() {
  return useQuery({
    queryKey: ['theme-licenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('theme_licenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ThemeLicense[];
    },
  });
}

export function useCreateThemeLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ThemeLicenseInput) => {
      const { data, error } = await supabase
        .from('theme_licenses')
        .insert({
          ...input,
          license_key: input.license_key || generateLicenseKey(),
          is_active: input.is_active ?? true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme-licenses'] });
    },
  });
}

export function useUpdateThemeLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: ThemeLicenseInput & { id: string }) => {
      const { data, error } = await supabase
        .from('theme_licenses')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme-licenses'] });
    },
  });
}

export function useDeleteThemeLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('theme_licenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme-licenses'] });
    },
  });
}

export function useThemeDownloads() {
  return useQuery({
    queryKey: ['theme-downloads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('theme_update_downloads')
        .select('*')
        .order('downloaded_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      return data as ThemeDownload[];
    },
  });
}
