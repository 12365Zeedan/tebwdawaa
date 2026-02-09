import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export interface PageCustomization {
  id: string;
  page_key: string;
  page_label: string;
  page_label_ar: string;
  background_color: string | null;
  text_color: string | null;
  link_color: string | null;
  link_hover_color: string | null;
  border_color: string | null;
  font_size: 'small' | 'medium' | 'large';
  font_weight: 'normal' | 'medium' | 'semibold' | 'bold';
  height: 'compact' | 'default' | 'tall';
  layout_style: 'standard' | 'centered' | 'minimal';
  full_width: boolean;
  sticky_header: boolean;
  border_bottom: boolean;
  backdrop_blur: boolean;
  shadow_depth: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  // Content fields
  page_title: string | null;
  page_title_ar: string | null;
  page_subtitle: string | null;
  page_subtitle_ar: string | null;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  hidden_sections: string[];
  banner_text: string | null;
  banner_text_ar: string | null;
  banner_visible: boolean;
  banner_color: string | null;
  widget_ids: string[];
  created_at: string;
  updated_at: string;
}

// Map page_key to frontend route for live preview
export const PAGE_ROUTE_MAP: Record<string, string> = {
  homepage: '/',
  products: '/products',
  product_detail: '/products', // closest preview
  categories: '/categories',
  category_detail: '/categories',
  blog: '/blog',
  blog_post: '/blog',
  about: '/about',
  cart: '/cart',
  checkout: '/checkout',
  wishlist: '/wishlist',
  compare: '/compare',
  auth: '/auth',
  profile: '/profile',
  order_history: '/order-history',
};

export function usePageCustomizations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { language } = useLanguage();

  const query = useQuery({
    queryKey: ['page-customizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_customizations')
        .select('*')
        .order('page_label');
      if (error) throw error;
      return data as PageCustomization[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PageCustomization> }) => {
      const { error } = await supabase
        .from('page_customizations')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-customizations'] });
      toast({
        title: language === 'ar' ? 'تم الحفظ' : 'Saved',
        description: language === 'ar' ? 'تم حفظ إعدادات الصفحة بنجاح' : 'Page customization saved successfully',
      });
    },
    onError: () => {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل حفظ الإعدادات' : 'Failed to save customization',
        variant: 'destructive',
      });
    },
  });

  const resetMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('page_customizations')
        .update({
          background_color: null,
          text_color: null,
          link_color: null,
          link_hover_color: null,
          border_color: null,
          font_size: 'medium',
          font_weight: 'normal',
          height: 'default',
          layout_style: 'standard',
          full_width: false,
          sticky_header: false,
          border_bottom: false,
          backdrop_blur: false,
          shadow_depth: 'none',
          page_title: null,
          page_title_ar: null,
          page_subtitle: null,
          page_subtitle_ar: null,
          meta_title: null,
          meta_description: null,
          og_image_url: null,
          hidden_sections: [],
          banner_text: null,
          banner_text_ar: null,
          banner_visible: false,
          banner_color: null,
          widget_ids: [],
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-customizations'] });
      toast({
        title: language === 'ar' ? 'تم إعادة الضبط' : 'Reset',
        description: language === 'ar' ? 'تم إعادة ضبط إعدادات الصفحة' : 'Page customization reset to defaults',
      });
    },
  });

  return {
    pages: query.data ?? [],
    isLoading: query.isLoading,
    updatePage: updateMutation.mutate,
    resetPage: resetMutation.mutate,
    isSaving: updateMutation.isPending,
  };
}
