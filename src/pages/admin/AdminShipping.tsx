import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Truck, Save, Loader2 } from 'lucide-react';
import { ShippingZonesCard } from '@/components/admin/shipping/ShippingZonesCard';

type ShippingSettings = {
  shipping_cost: number;
  free_shipping_threshold: number;
  currency: string;
};

const defaultShippingSettings: ShippingSettings = {
  shipping_cost: 15,
  free_shipping_threshold: 200,
  currency: 'SAR',
};

export default function AdminShipping() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<ShippingSettings>(defaultShippingSettings);
  const [saving, setSaving] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['shipping-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value')
        .in('key', ['shipping_cost', 'free_shipping_threshold', 'currency']);
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      const parsed: Partial<ShippingSettings> = {};
      settings.forEach((setting) => {
        const value = setting.value;
        switch (setting.key) {
          case 'shipping_cost':
            parsed.shipping_cost = typeof value === 'number' ? value : parseFloat(String(value).replace(/"/g, '')) || defaultShippingSettings.shipping_cost;
            break;
          case 'free_shipping_threshold':
            parsed.free_shipping_threshold = typeof value === 'number' ? value : parseFloat(String(value).replace(/"/g, '')) || defaultShippingSettings.free_shipping_threshold;
            break;
          case 'currency':
            parsed.currency = typeof value === 'string' ? value.replace(/"/g, '') : String(value).replace(/"/g, '');
            break;
        }
      });
      setFormData({ ...defaultShippingSettings, ...parsed });
    }
  }, [settings]);

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<ShippingSettings>) => {
      const promises = Object.entries(updates).map(async ([key, value]) => {
        const jsonValue = typeof value === 'string' ? `"${value}"` : JSON.stringify(value);
        const { error } = await supabase
          .from('app_settings')
          .update({ value: jsonValue })
          .eq('key', key);
        if (error) throw error;
      });
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-settings'] });
      queryClient.invalidateQueries({ queryKey: ['store-settings'] });
      toast({
        title: language === 'ar' ? 'تم الحفظ' : 'Settings Saved',
        description: language === 'ar' ? 'تم حفظ إعدادات الشحن بنجاح' : 'Shipping settings saved successfully',
      });
    },
    onError: () => {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في حفظ الإعدادات' : 'Failed to save settings',
        variant: 'destructive',
      });
    },
  });

  const handleSave = async () => {
    setSaving(true);
    await updateSettings.mutateAsync({
      shipping_cost: formData.shipping_cost,
      free_shipping_threshold: formData.free_shipping_threshold,
    });
    setSaving(false);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Truck className="h-6 w-6" />
            {language === 'ar' ? 'إعدادات الشحن' : 'Shipping'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'ar' ? 'إدارة تكاليف الشحن والحدود' : 'Manage shipping costs and thresholds'}
          </p>
        </div>

        <div className="grid gap-6">
          {/* Shipping Cost */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                {language === 'ar' ? 'تكاليف الشحن' : 'Shipping Costs'}
              </CardTitle>
              <CardDescription>
                {language === 'ar'
                  ? 'تكوين تكاليف الشحن الافتراضية وحدود الشحن المجاني'
                  : 'Configure default shipping costs and free shipping thresholds'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="shipping-cost">
                    {language === 'ar' ? 'تكلفة الشحن الافتراضية' : 'Default Shipping Cost'}
                  </Label>
                  <Input
                    id="shipping-cost"
                    type="number"
                    min="0"
                    value={formData.shipping_cost}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        shipping_cost: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="15"
                  />
                  <p className="text-xs text-muted-foreground">
                    {language === 'ar' ? `بالعملة: ${formData.currency}` : `In ${formData.currency}`}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="free-shipping">
                    {language === 'ar' ? 'حد الشحن المجاني' : 'Free Shipping Threshold'}
                  </Label>
                  <Input
                    id="free-shipping"
                    type="number"
                    min="0"
                    value={formData.free_shipping_threshold}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        free_shipping_threshold: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="200"
                  />
                  <p className="text-xs text-muted-foreground">
                    {language === 'ar'
                      ? 'الطلبات فوق هذا المبلغ تحصل على شحن مجاني'
                      : 'Orders above this amount get free shipping'}
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {language === 'ar' ? 'حفظ' : 'Save'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Zones */}
          <ShippingZonesCard />
        </div>
      </div>
    </AdminLayout>
  );
}
