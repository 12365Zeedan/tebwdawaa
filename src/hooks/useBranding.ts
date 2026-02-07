import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BrandingSettings {
  logoWhiteBg: string;
  logoTransparent: string;
  brandingColors: string[];
}

const DEFAULT_BRANDING: BrandingSettings = {
  logoWhiteBg: '',
  logoTransparent: '',
  brandingColors: [],
};

export function useBranding() {
  return useQuery({
    queryKey: ['branding-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value')
        .in('key', ['logo_white_bg', 'logo_transparent', 'branding_colors']);

      if (error) throw error;

      const settings = { ...DEFAULT_BRANDING };

      data?.forEach((item) => {
        try {
          const value = typeof item.value === 'string'
            ? JSON.parse(item.value)
            : item.value;

          switch (item.key) {
            case 'logo_white_bg':
              settings.logoWhiteBg = typeof value === 'string' ? value : '';
              break;
            case 'logo_transparent':
              settings.logoTransparent = typeof value === 'string' ? value : '';
              break;
            case 'branding_colors':
              if (Array.isArray(value)) {
                settings.brandingColors = value;
              } else if (typeof value === 'string') {
                try {
                  const parsed = JSON.parse(value);
                  settings.brandingColors = Array.isArray(parsed) ? parsed : [];
                } catch {
                  settings.brandingColors = [];
                }
              }
              break;
          }
        } catch {
          // Skip parse errors
        }
      });

      return settings;
    },
    staleTime: 1000 * 60 * 10,
  });
}
