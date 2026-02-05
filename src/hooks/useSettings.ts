import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useSetting(key: string) {
  return useQuery({
    queryKey: ['settings', key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('key', key)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });
}

export function useLowStockThreshold() {
  const { data, isLoading } = useSetting('low_stock_threshold');
  const threshold = data?.value ? Number(data.value) : 10;
  return { threshold, isLoading };
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string | number }) => {
      const { data, error } = await supabase
        .from('app_settings')
        .update({ value: JSON.stringify(value) })
        .eq('key', key)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['settings', variables.key] });
    },
  });
}

export function useLowStockProducts() {
  const { threshold } = useLowStockThreshold();

  return useQuery({
    queryKey: ['low-stock-products', threshold],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          name_ar,
          slug,
          stock_quantity,
          in_stock,
          image_url,
          category:categories(id, name, name_ar)
        `)
        .eq('is_active', true)
        .lte('stock_quantity', threshold)
        .order('stock_quantity', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}