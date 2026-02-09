import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Building2, Save, Loader2, Copy, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const BANK_KEYS = [
  'payment_bank_transfer_enabled',
  'bank_account_holder',
  'bank_account_holder_ar',
  'bank_name',
  'bank_name_ar',
  'bank_iban',
  'bank_account_number',
  'bank_swift_code',
];

interface BankFormData {
  payment_bank_transfer_enabled: boolean;
  bank_account_holder: string;
  bank_account_holder_ar: string;
  bank_name: string;
  bank_name_ar: string;
  bank_iban: string;
  bank_account_number: string;
  bank_swift_code: string;
}

const defaultBankData: BankFormData = {
  payment_bank_transfer_enabled: false,
  bank_account_holder: '',
  bank_account_holder_ar: '',
  bank_name: '',
  bank_name_ar: '',
  bank_iban: '',
  bank_account_number: '',
  bank_swift_code: '',
};

function parseValue(value: unknown): string {
  if (typeof value === 'string') {
    // Remove surrounding quotes
    const trimmed = value.replace(/^"|"$/g, '');
    return trimmed;
  }
  return String(value ?? '');
}

export function BankAccountSettings() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<BankFormData>(defaultBankData);
  const [saving, setSaving] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['bank-account-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value')
        .in('key', BANK_KEYS);
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      const parsed: Partial<BankFormData> = {};
      settings.forEach((setting) => {
        const key = setting.key as keyof BankFormData;
        if (key === 'payment_bank_transfer_enabled') {
          parsed[key] = setting.value === true || setting.value === 'true' || setting.value === '"true"';
        } else if (key in defaultBankData) {
          (parsed as any)[key] = parseValue(setting.value);
        }
      });
      setFormData({ ...defaultBankData, ...parsed });
    }
  }, [settings]);

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<BankFormData>) => {
      const promises = Object.entries(updates).map(async ([key, value]) => {
        const jsonValue = typeof value === 'boolean' ? JSON.stringify(value) : JSON.stringify(value);
        // Try update first, if no rows affected then insert
        const { data, error } = await supabase
          .from('app_settings')
          .update({ value: jsonValue })
          .eq('key', key)
          .select();
        if (error) throw error;
        if (!data || data.length === 0) {
          const { error: insertError } = await supabase
            .from('app_settings')
            .insert({ key, value: jsonValue });
          if (insertError) throw insertError;
        }
      });
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-account-settings'] });
      queryClient.invalidateQueries({ queryKey: ['payment-settings'] });
      toast({
        title: language === 'ar' ? 'تم الحفظ' : 'Settings Saved',
        description: language === 'ar' ? 'تم حفظ بيانات الحساب البنكي بنجاح' : 'Bank account details saved successfully',
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
    await updateSettings.mutateAsync(formData);
    setSaving(false);
  };

  const handleToggle = async (checked: boolean) => {
    setFormData(prev => ({ ...prev, payment_bank_transfer_enabled: checked }));
    await updateSettings.mutateAsync({ payment_bank_transfer_enabled: checked });
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          {language === 'ar' ? 'الحساب البنكي والتحويل' : 'Bank Account & Transfer'}
        </CardTitle>
        <CardDescription>
          {language === 'ar'
            ? 'أدخل بيانات حسابك البنكي ليتمكن العملاء من التحويل إليه والتحقق من الدفع'
            : 'Enter your bank account details so customers can transfer payments and verify them'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable Bank Transfer */}
        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <span className="font-medium">
                {language === 'ar' ? 'تفعيل التحويل البنكي' : 'Enable Bank Transfer'}
              </span>
              <p className="text-xs text-muted-foreground">
                {language === 'ar'
                  ? 'عند التفعيل، سيظهر التحويل البنكي كخيار دفع للعملاء'
                  : 'When enabled, bank transfer will appear as a payment option for customers'}
              </p>
            </div>
          </div>
          <Switch
            checked={formData.payment_bank_transfer_enabled}
            onCheckedChange={handleToggle}
          />
        </div>

        <Separator />

        {/* Bank Details Form */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">
            {language === 'ar' ? 'بيانات الحساب البنكي' : 'Bank Account Details'}
          </Label>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bank_account_holder">
                {language === 'ar' ? 'اسم صاحب الحساب (إنجليزي)' : 'Account Holder Name (English)'}
              </Label>
              <Input
                id="bank_account_holder"
                value={formData.bank_account_holder}
                onChange={(e) => setFormData(prev => ({ ...prev, bank_account_holder: e.target.value }))}
                placeholder={language === 'ar' ? 'الاسم بالإنجليزية' : 'Account holder name'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_account_holder_ar">
                {language === 'ar' ? 'اسم صاحب الحساب (عربي)' : 'Account Holder Name (Arabic)'}
              </Label>
              <Input
                id="bank_account_holder_ar"
                value={formData.bank_account_holder_ar}
                onChange={(e) => setFormData(prev => ({ ...prev, bank_account_holder_ar: e.target.value }))}
                placeholder={language === 'ar' ? 'الاسم بالعربية' : 'Account holder name in Arabic'}
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bank_name">
                {language === 'ar' ? 'اسم البنك (إنجليزي)' : 'Bank Name (English)'}
              </Label>
              <Input
                id="bank_name"
                value={formData.bank_name}
                onChange={(e) => setFormData(prev => ({ ...prev, bank_name: e.target.value }))}
                placeholder={language === 'ar' ? 'مثال: البنك الأهلي' : 'e.g. Al Rajhi Bank'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_name_ar">
                {language === 'ar' ? 'اسم البنك (عربي)' : 'Bank Name (Arabic)'}
              </Label>
              <Input
                id="bank_name_ar"
                value={formData.bank_name_ar}
                onChange={(e) => setFormData(prev => ({ ...prev, bank_name_ar: e.target.value }))}
                placeholder={language === 'ar' ? 'اسم البنك بالعربية' : 'Bank name in Arabic'}
                dir="rtl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bank_iban">
              {language === 'ar' ? 'رقم الآيبان (IBAN)' : 'IBAN Number'}
            </Label>
            <div className="relative">
              <Input
                id="bank_iban"
                value={formData.bank_iban}
                onChange={(e) => setFormData(prev => ({ ...prev, bank_iban: e.target.value.toUpperCase() }))}
                placeholder="SA00 0000 0000 0000 0000 0000"
                className="pr-10 font-mono"
              />
              {formData.bank_iban && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => copyToClipboard(formData.bank_iban, 'iban')}
                >
                  {copiedField === 'iban' ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                </Button>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bank_account_number">
                {language === 'ar' ? 'رقم الحساب' : 'Account Number'}
              </Label>
              <Input
                id="bank_account_number"
                value={formData.bank_account_number}
                onChange={(e) => setFormData(prev => ({ ...prev, bank_account_number: e.target.value }))}
                placeholder={language === 'ar' ? 'رقم الحساب البنكي' : 'Bank account number'}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_swift_code">
                {language === 'ar' ? 'رمز السويفت (SWIFT/BIC)' : 'SWIFT/BIC Code'}
              </Label>
              <Input
                id="bank_swift_code"
                value={formData.bank_swift_code}
                onChange={(e) => setFormData(prev => ({ ...prev, bank_swift_code: e.target.value.toUpperCase() }))}
                placeholder="XXXXSAXX"
                className="font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {language === 'ar' ? 'حفظ بيانات البنك' : 'Save Bank Details'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
