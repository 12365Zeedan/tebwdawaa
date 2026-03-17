import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface StoreSettings {
  storeName: string;
  storeNameAr: string;
  currency: string;
  shippingCost: number;
  freeShippingThreshold: number;
  maintenanceMode: boolean;
  guestCheckoutEnabled: boolean;
}

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'VitaWise Pharmacy',
  storeNameAr: 'صيدلية فيتاوايز',
  currency: 'SAR',
  shippingCost: 15,
  freeShippingThreshold: 200,
  maintenanceMode: false,
  guestCheckoutEnabled: true,
};

export function useStoreSettings() {
  return useQuery({
    queryKey: ['store-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value')
        .in('key', [
          'store_name',
          'store_name_ar',
          'currency',
          'shipping_cost',
          'free_shipping_threshold',
          'maintenance_mode',
          'guest_checkout_enabled',
        ]);

      if (error) throw error;

      const settings = { ...DEFAULT_SETTINGS };
      
      data?.forEach((item) => {
        const value = typeof item.value === 'string' 
          ? JSON.parse(item.value) 
          : item.value;
          
        switch (item.key) {
          case 'store_name':
            settings.storeName = value;
            break;
          case 'store_name_ar':
            settings.storeNameAr = value;
            break;
          case 'currency':
            settings.currency = value;
            break;
          case 'shipping_cost':
            settings.shippingCost = Number(value);
            break;
          case 'free_shipping_threshold':
            settings.freeShippingThreshold = Number(value);
            break;
          case 'maintenance_mode':
            settings.maintenanceMode = value === true || value === 'true';
            break;
          case 'guest_checkout_enabled':
            settings.guestCheckoutEnabled = value === true || value === 'true';
            break;
        }
      });

      return settings;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
