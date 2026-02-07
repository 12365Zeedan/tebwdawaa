import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export type ShippingZone = {
  id: string;
  name: string;
  name_ar: string;
  regions: string[];
  shipping_rate: number;
  free_shipping_threshold: number | null;
  estimated_days_min: number;
  estimated_days_max: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ShippingZoneInput = Omit<ShippingZone, 'id' | 'created_at' | 'updated_at'>;

export function useShippingZones() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const queryClient = useQueryClient();

  const zonesQuery = useQuery({
    queryKey: ['shipping-zones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shipping_zones')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as ShippingZone[];
    },
  });

  const createZone = useMutation({
    mutationFn: async (zone: ShippingZoneInput) => {
      const { data, error } = await supabase
        .from('shipping_zones')
        .insert(zone)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-zones'] });
      toast({
        title: language === 'ar' ? 'تمت الإضافة' : 'Zone Created',
        description: language === 'ar' ? 'تم إنشاء منطقة الشحن بنجاح' : 'Shipping zone created successfully',
      });
    },
    onError: () => {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في إنشاء منطقة الشحن' : 'Failed to create shipping zone',
        variant: 'destructive',
      });
    },
  });

  const updateZone = useMutation({
    mutationFn: async ({ id, ...zone }: Partial<ShippingZone> & { id: string }) => {
      const { data, error } = await supabase
        .from('shipping_zones')
        .update(zone)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-zones'] });
      toast({
        title: language === 'ar' ? 'تم التحديث' : 'Zone Updated',
        description: language === 'ar' ? 'تم تحديث منطقة الشحن بنجاح' : 'Shipping zone updated successfully',
      });
    },
    onError: () => {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في تحديث منطقة الشحن' : 'Failed to update shipping zone',
        variant: 'destructive',
      });
    },
  });

  const deleteZone = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('shipping_zones')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-zones'] });
      toast({
        title: language === 'ar' ? 'تم الحذف' : 'Zone Deleted',
        description: language === 'ar' ? 'تم حذف منطقة الشحن بنجاح' : 'Shipping zone deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في حذف منطقة الشحن' : 'Failed to delete shipping zone',
        variant: 'destructive',
      });
    },
  });

  const toggleZone = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('shipping_zones')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-zones'] });
    },
    onError: () => {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في تحديث الحالة' : 'Failed to update status',
        variant: 'destructive',
      });
    },
  });

  return {
    zones: zonesQuery.data ?? [],
    isLoading: zonesQuery.isLoading,
    createZone,
    updateZone,
    deleteZone,
    toggleZone,
  };
}
