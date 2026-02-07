import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Loader2 } from 'lucide-react';
import { CheckoutPaymentSettings } from '@/components/admin/settings/CheckoutPaymentSettings';

type PaymentFormData = {
  payment_cod_enabled: boolean;
  payment_mada_enabled: boolean;
  payment_visa_enabled: boolean;
  payment_mastercard_enabled: boolean;
  payment_apple_pay_enabled: boolean;
  payment_stc_pay_enabled: boolean;
  min_order_amount: number;
  require_phone_checkout: boolean;
  checkout_notes_enabled: boolean;
};

const PAYMENT_KEYS = [
  'payment_cod_enabled',
  'payment_mada_enabled',
  'payment_visa_enabled',
  'payment_mastercard_enabled',
  'payment_apple_pay_enabled',
  'payment_stc_pay_enabled',
  'min_order_amount',
  'require_phone_checkout',
  'checkout_notes_enabled',
];

const defaultPaymentData: PaymentFormData = {
  payment_cod_enabled: true,
  payment_mada_enabled: false,
  payment_visa_enabled: false,
  payment_mastercard_enabled: false,
  payment_apple_pay_enabled: false,
  payment_stc_pay_enabled: false,
  min_order_amount: 0,
  require_phone_checkout: false,
  checkout_notes_enabled: true,
};

export default function AdminCheckoutPayment() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<PaymentFormData>(defaultPaymentData);
  const [savingSection, setSavingSection] = useState<string | null>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['payment-page-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value')
        .in('key', PAYMENT_KEYS);
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      const parsed: Partial<PaymentFormData> = {};
      settings.forEach((setting) => {
        const value = setting.value;
        const key = setting.key as keyof PaymentFormData;
        if (key in defaultPaymentData) {
          const defaultVal = defaultPaymentData[key];
          if (typeof defaultVal === 'boolean') {
            parsed[key] = (value === true || value === 'true' || value === '"true"') as never;
          } else if (typeof defaultVal === 'number') {
            parsed[key] = (typeof value === 'number' ? value : parseFloat(String(value).replace(/"/g, '')) || defaultVal) as never;
          }
        }
      });
      setFormData({ ...defaultPaymentData, ...parsed });
    }
  }, [settings]);

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<PaymentFormData>) => {
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
      queryClient.invalidateQueries({ queryKey: ['payment-page-settings'] });
      queryClient.invalidateQueries({ queryKey: ['payment-settings'] });
      toast({
        title: language === 'ar' ? 'تم الحفظ' : 'Settings Saved',
        description: language === 'ar' ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully',
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

  const handleSave = async (section: string, updates: Partial<PaymentFormData>) => {
    setSavingSection(section);
    await updateSettings.mutateAsync(updates);
    setSavingSection(null);
  };

  const handleToggle = async (key: string, value: boolean) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    await updateSettings.mutateAsync({ [key]: value } as Partial<PaymentFormData>);
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
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            {language === 'ar' ? 'الدفع والسداد' : 'Checkout & Payment'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'ar'
              ? 'إدارة طرق الدفع وخيارات السداد'
              : 'Manage payment methods and checkout options'}
          </p>
        </div>

        <CheckoutPaymentSettings
          formData={formData}
          onFormChange={(updates) => setFormData(prev => ({ ...prev, ...updates }))}
          onToggle={handleToggle}
          onSave={(section, updates) => handleSave(section, updates as Partial<PaymentFormData>)}
          savingSection={savingSection}
        />
      </div>
    </AdminLayout>
  );
}
