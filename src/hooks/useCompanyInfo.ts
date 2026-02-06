import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CompanyInfo {
  company_name: string;
  company_address: string;
  cr_number: string;
  vat_number: string;
  company_email: string;
  company_phone: string;
  site_url: string;
  store_name: string;
}

const COMPANY_SETTINGS_KEYS = [
  'company_name',
  'company_address',
  'cr_number',
  'vat_number',
  'company_email',
  'company_phone',
  'site_url',
  'store_name',
];

export function useCompanyInfo() {
  return useQuery({
    queryKey: ['company-settings-invoice'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value')
        .in('key', COMPANY_SETTINGS_KEYS);

      if (error) throw error;

      const settings: Record<string, string> = {};
      data?.forEach((s) => {
        try {
          settings[s.key] = typeof s.value === 'string' ? JSON.parse(s.value) : String(s.value);
        } catch {
          settings[s.key] = String(s.value);
        }
      });

      return {
        company_name: settings.company_name || '',
        company_address: settings.company_address || '',
        cr_number: settings.cr_number || '',
        vat_number: settings.vat_number || '',
        company_email: settings.company_email || '',
        company_phone: settings.company_phone || '',
        site_url: settings.site_url || '',
        store_name: settings.store_name || 'My Store',
      } as CompanyInfo;
    },
    staleTime: 1000 * 60 * 10,
  });
}
