import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CarouselSlide {
  id: string;
  imageUrl: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  ctaText: string;
  ctaTextAr: string;
  ctaLink: string;
  overlayColor: string;
}

export interface CarouselConfig {
  slides: CarouselSlide[];
  autoplay: boolean;
  interval: number;
  pauseOnHover: boolean;
  transition: 'slide' | 'fade';
  showDots: boolean;
  showArrows: boolean;
  height: string;
}

export interface BannerConfig {
  imageUrl: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  ctaText: string;
  ctaTextAr: string;
  ctaLink: string;
  backgroundColor: string;
  textColor: string;
  style: 'full-width' | 'contained' | 'split';
}

export interface TestimonialItem {
  id: string;
  name: string;
  nameAr: string;
  role: string;
  roleAr: string;
  content: string;
  contentAr: string;
  avatarUrl: string;
  rating: number;
}

export interface TestimonialsConfig {
  items: TestimonialItem[];
  layout: 'grid' | 'carousel';
  columns: number;
}

export interface RichTextConfig {
  content: string;
  contentAr: string;
  maxWidth: string;
  padding: string;
}

export type WidgetConfig = CarouselConfig | BannerConfig | TestimonialsConfig | RichTextConfig;

export interface CustomWidget {
  id: string;
  page: string;
  widget_type: 'carousel' | 'banner' | 'testimonials' | 'richtext';
  title: string | null;
  title_ar: string | null;
  config: WidgetConfig;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export const DEFAULT_CAROUSEL_CONFIG: CarouselConfig = {
  slides: [],
  autoplay: true,
  interval: 5000,
  pauseOnHover: true,
  transition: 'slide',
  showDots: true,
  showArrows: true,
  height: '400px',
};

export const DEFAULT_BANNER_CONFIG: BannerConfig = {
  imageUrl: '',
  title: '',
  titleAr: '',
  description: '',
  descriptionAr: '',
  ctaText: '',
  ctaTextAr: '',
  ctaLink: '',
  backgroundColor: '200 75% 49%',
  textColor: '0 0% 100%',
  style: 'full-width',
};

export const DEFAULT_TESTIMONIALS_CONFIG: TestimonialsConfig = {
  items: [],
  layout: 'grid',
  columns: 3,
};

export const DEFAULT_RICHTEXT_CONFIG: RichTextConfig = {
  content: '',
  contentAr: '',
  maxWidth: '1200px',
  padding: 'py-12',
};

export function getDefaultConfig(type: CustomWidget['widget_type']): WidgetConfig {
  switch (type) {
    case 'carousel': return { ...DEFAULT_CAROUSEL_CONFIG };
    case 'banner': return { ...DEFAULT_BANNER_CONFIG };
    case 'testimonials': return { ...DEFAULT_TESTIMONIALS_CONFIG };
    case 'richtext': return { ...DEFAULT_RICHTEXT_CONFIG };
  }
}

export function useCustomWidgets(page?: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: widgets = [], isLoading } = useQuery({
    queryKey: ['custom-widgets', page],
    queryFn: async () => {
      let query = supabase
        .from('custom_widgets')
        .select('*')
        .order('sort_order', { ascending: true });

      if (page) {
        query = query.eq('page', page);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as CustomWidget[];
    },
  });

  const createWidget = useMutation({
    mutationFn: async (widget: {
      page: string;
      widget_type: CustomWidget['widget_type'];
      title?: string;
      title_ar?: string;
      config: WidgetConfig;
      sort_order?: number;
    }) => {
      const { data, error } = await supabase
        .from('custom_widgets')
        .insert({
          page: widget.page,
          widget_type: widget.widget_type,
          title: widget.title || null,
          title_ar: widget.title_ar || null,
          config: widget.config as any,
          sort_order: widget.sort_order ?? 0,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-widgets'] });
      toast({ title: 'Widget created' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const updateWidget = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CustomWidget> & { id: string }) => {
      const payload: Record<string, any> = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.title_ar !== undefined) payload.title_ar = updates.title_ar;
      if (updates.config !== undefined) payload.config = updates.config;
      if (updates.sort_order !== undefined) payload.sort_order = updates.sort_order;
      if (updates.is_visible !== undefined) payload.is_visible = updates.is_visible;
      if (updates.page !== undefined) payload.page = updates.page;
      if (updates.widget_type !== undefined) payload.widget_type = updates.widget_type;

      const { error } = await supabase
        .from('custom_widgets')
        .update(payload)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-widgets'] });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const deleteWidget = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('custom_widgets')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-widgets'] });
      toast({ title: 'Widget deleted' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  return {
    widgets,
    isLoading,
    createWidget,
    updateWidget,
    deleteWidget,
  };
}
