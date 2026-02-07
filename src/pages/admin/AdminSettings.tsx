import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Settings, Package, Bell, Store, Save, Loader2, Building2 } from 'lucide-react';
import { CheckoutPaymentSettings } from '@/components/admin/settings/CheckoutPaymentSettings';

type CompanyAddress = {
  building_no: string;
  secondary_no: string;
  postal_code: string;
  street: string;
  district: string;
  city: string;
  region: string;
  country: string;
};

type SettingsData = {
  store_name: string;
  store_name_ar: string;
  currency: string;
  low_stock_threshold: number;
  maintenance_mode: boolean;
  guest_checkout_enabled: boolean;
  new_order_notifications: boolean;
  low_stock_notifications: boolean;
  company_name: string;
  company_address: CompanyAddress;
  cr_number: string;
  company_email: string;
  company_phone: string;
  site_url: string;
  vat_number: string;
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

const defaultAddress: CompanyAddress = {
  building_no: '',
  secondary_no: '',
  postal_code: '',
  street: '',
  district: '',
  city: '',
  region: '',
  country: 'Saudi Arabia',
};

const defaultSettings: SettingsData = {
  store_name: 'My Store',
  store_name_ar: 'متجري',
  currency: 'SAR',
  low_stock_threshold: 10,
  maintenance_mode: false,
  guest_checkout_enabled: true,
  new_order_notifications: true,
  low_stock_notifications: true,
  company_name: '',
  company_address: { ...defaultAddress },
  cr_number: '',
  company_email: '',
  company_phone: '',
  site_url: '',
  vat_number: '',
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

export default function AdminSettings() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<SettingsData>(defaultSettings);
  const [savingSection, setSavingSection] = useState<string | null>(null);

  // Fetch all settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['all-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value');
      if (error) throw error;
      return data;
    },
  });

  // Parse settings into form data
  useEffect(() => {
    if (settings) {
      const parsed: Record<string, string | number | boolean | CompanyAddress> = {};
      settings.forEach((setting) => {
        const value = setting.value;
        const key = setting.key as keyof SettingsData;
        if (key in defaultSettings) {
          if (key === 'company_address') {
            // Parse structured address
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
              parsed[key] = { ...defaultAddress, ...(value as CompanyAddress) };
            } else if (typeof value === 'string') {
              try {
                const addressObj = JSON.parse(value.replace(/^"|"$/g, ''));
                if (typeof addressObj === 'object' && addressObj !== null) {
                  parsed[key] = { ...defaultAddress, ...addressObj };
                } else {
                  // Legacy single string address — put into street
                  parsed[key] = { ...defaultAddress, street: String(addressObj) };
                }
              } catch {
                parsed[key] = { ...defaultAddress, street: value.replace(/"/g, '') };
              }
            }
          } else {
            const defaultVal = defaultSettings[key];
            if (typeof defaultVal === 'boolean') {
              parsed[key] = value === true || value === 'true' || value === '"true"';
            } else if (typeof defaultVal === 'number') {
              parsed[key] = typeof value === 'number' ? value : parseFloat(String(value).replace(/"/g, '')) || defaultVal;
            } else {
              parsed[key] = typeof value === 'string' ? value.replace(/"/g, '') : String(value).replace(/"/g, '');
            }
          }
        }
      });
      setFormData({ ...defaultSettings, ...parsed } as SettingsData);
    }
  }, [settings]);

  // Update setting mutation
  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<SettingsData>) => {
      const promises = Object.entries(updates).map(async ([key, value]) => {
        let jsonValue: string;
        if (typeof value === 'object' && value !== null) {
          jsonValue = JSON.stringify(value);
        } else if (typeof value === 'string') {
          jsonValue = `"${value}"`;
        } else {
          jsonValue = JSON.stringify(value);
        }
        const { error } = await supabase
          .from('app_settings')
          .update({ value: jsonValue })
          .eq('key', key);
        if (error) throw error;
      });
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-settings'] });
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

  const handleSave = async (section: string, updates: Partial<SettingsData>) => {
    setSavingSection(section);
    await updateSettings.mutateAsync(updates);
    setSavingSection(null);
  };

  const handleToggle = async (key: keyof SettingsData, value: boolean) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    await updateSettings.mutateAsync({ [key]: value });
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
            <Settings className="h-6 w-6" />
            {language === 'ar' ? 'الإعدادات' : 'Settings'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'ar' ? 'إدارة إعدادات المتجر والتطبيق' : 'Manage store and application settings'}
          </p>
        </div>

        <div className="grid gap-6">
          {/* Store Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                {language === 'ar' ? 'إعدادات المتجر' : 'Store Settings'}
              </CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'تكوين إعدادات المتجر العامة' 
                  : 'Configure general store settings'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="store-name">
                    {language === 'ar' ? 'اسم المتجر (إنجليزي)' : 'Store Name (English)'}
                  </Label>
                  <Input
                    id="store-name"
                    value={formData.store_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, store_name: e.target.value }))}
                    placeholder="My Store"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-name-ar">
                    {language === 'ar' ? 'اسم المتجر (عربي)' : 'Store Name (Arabic)'}
                  </Label>
                  <Input
                    id="store-name-ar"
                    value={formData.store_name_ar}
                    onChange={(e) => setFormData(prev => ({ ...prev, store_name_ar: e.target.value }))}
                    placeholder="متجري"
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">
                    {language === 'ar' ? 'العملة' : 'Currency'}
                  </Label>
                  <Select 
                    value={formData.currency} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAR">SAR - {language === 'ar' ? 'ريال سعودي' : 'Saudi Riyal'}</SelectItem>
                      <SelectItem value="USD">USD - {language === 'ar' ? 'دولار أمريكي' : 'US Dollar'}</SelectItem>
                      <SelectItem value="EUR">EUR - {language === 'ar' ? 'يورو' : 'Euro'}</SelectItem>
                      <SelectItem value="AED">AED - {language === 'ar' ? 'درهم إماراتي' : 'UAE Dirham'}</SelectItem>
                      <SelectItem value="KWD">KWD - {language === 'ar' ? 'دينار كويتي' : 'Kuwaiti Dinar'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{language === 'ar' ? 'وضع الصيانة' : 'Maintenance Mode'}</Label>
                  <p className="text-xs text-muted-foreground">
                    {language === 'ar' 
                      ? 'إغلاق المتجر مؤقتاً للصيانة' 
                      : 'Temporarily close the store for maintenance'}
                  </p>
                </div>
                <Switch 
                  checked={formData.maintenance_mode}
                  onCheckedChange={(checked) => handleToggle('maintenance_mode', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{language === 'ar' ? 'السماح بالطلبات للضيوف' : 'Allow Guest Checkout'}</Label>
                  <p className="text-xs text-muted-foreground">
                    {language === 'ar' 
                      ? 'السماح للعملاء بالشراء بدون تسجيل' 
                      : 'Allow customers to purchase without registering'}
                  </p>
                </div>
                <Switch 
                  checked={formData.guest_checkout_enabled}
                  onCheckedChange={(checked) => handleToggle('guest_checkout_enabled', checked)}
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSave('store', { 
                    store_name: formData.store_name, 
                    store_name_ar: formData.store_name_ar,
                    currency: formData.currency 
                  })}
                  disabled={savingSection === 'store'}
                >
                  {savingSection === 'store' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {language === 'ar' ? 'حفظ' : 'Save'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {language === 'ar' ? 'معلومات الشركة' : 'Company Information'}
              </CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'بيانات الشركة الرسمية للفواتير والتواصل' 
                  : 'Official company details for invoices and communication'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company-name">
                    {language === 'ar' ? 'اسم الشركة' : 'Company Name'}
                  </Label>
                  <Input
                    id="company-name"
                    value={formData.company_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                    placeholder={language === 'ar' ? 'اسم الشركة الرسمي' : 'Official company name'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cr-number">
                    {language === 'ar' ? 'رقم السجل التجاري' : 'C.R. No.'}
                  </Label>
                  <Input
                    id="cr-number"
                    value={formData.cr_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, cr_number: e.target.value }))}
                    placeholder={language === 'ar' ? 'رقم السجل التجاري' : 'Commercial Registration Number'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vat-number">
                    {language === 'ar' ? 'الرقم الضريبي' : 'VAT No.'}
                  </Label>
                  <Input
                    id="vat-number"
                    value={formData.vat_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, vat_number: e.target.value }))}
                    placeholder={language === 'ar' ? 'رقم التسجيل الضريبي' : 'VAT Registration Number'}
                  />
                </div>
                <div className="sm:col-span-2 space-y-3">
                  <Label className="text-base font-semibold">
                    {language === 'ar' ? 'العنوان التفصيلي' : 'Detailed Address'}
                  </Label>
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                    <div className="space-y-1">
                      <Label htmlFor="building-no" className="text-xs">
                        {language === 'ar' ? 'رقم المبنى' : 'Building No.'}
                      </Label>
                      <Input
                        id="building-no"
                        value={formData.company_address.building_no}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          company_address: { ...prev.company_address, building_no: e.target.value }
                        }))}
                        placeholder="1234"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="secondary-no" className="text-xs">
                        {language === 'ar' ? 'الرقم الإضافي' : 'Secondary No.'}
                      </Label>
                      <Input
                        id="secondary-no"
                        value={formData.company_address.secondary_no}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          company_address: { ...prev.company_address, secondary_no: e.target.value }
                        }))}
                        placeholder="5678"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="postal-code" className="text-xs">
                        {language === 'ar' ? 'الرمز البريدي' : 'Postal Code'}
                      </Label>
                      <Input
                        id="postal-code"
                        value={formData.company_address.postal_code}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          company_address: { ...prev.company_address, postal_code: e.target.value }
                        }))}
                        placeholder="12345"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="street" className="text-xs">
                        {language === 'ar' ? 'الشارع' : 'Street'}
                      </Label>
                      <Input
                        id="street"
                        value={formData.company_address.street}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          company_address: { ...prev.company_address, street: e.target.value }
                        }))}
                        placeholder={language === 'ar' ? 'اسم الشارع' : 'Street name'}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="district" className="text-xs">
                        {language === 'ar' ? 'الحي' : 'District'}
                      </Label>
                      <Input
                        id="district"
                        value={formData.company_address.district}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          company_address: { ...prev.company_address, district: e.target.value }
                        }))}
                        placeholder={language === 'ar' ? 'اسم الحي' : 'District name'}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="city" className="text-xs">
                        {language === 'ar' ? 'المدينة' : 'City'}
                      </Label>
                      <Input
                        id="city"
                        value={formData.company_address.city}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          company_address: { ...prev.company_address, city: e.target.value }
                        }))}
                        placeholder={language === 'ar' ? 'المدينة' : 'City'}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="region" className="text-xs">
                        {language === 'ar' ? 'المنطقة' : 'Region'}
                      </Label>
                      <Input
                        id="region"
                        value={formData.company_address.region}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          company_address: { ...prev.company_address, region: e.target.value }
                        }))}
                        placeholder={language === 'ar' ? 'المنطقة' : 'Region'}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="country" className="text-xs">
                        {language === 'ar' ? 'الدولة' : 'Country'}
                      </Label>
                      <Input
                        id="country"
                        value={formData.company_address.country}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          company_address: { ...prev.company_address, country: e.target.value }
                        }))}
                        placeholder={language === 'ar' ? 'الدولة' : 'Country'}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-email">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                  </Label>
                  <Input
                    id="company-email"
                    type="email"
                    value={formData.company_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_email: e.target.value }))}
                    placeholder="info@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-phone">
                    {language === 'ar' ? 'رقم الهاتف' : 'Phone No.'}
                  </Label>
                  <Input
                    id="company-phone"
                    type="tel"
                    value={formData.company_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_phone: e.target.value }))}
                    placeholder="+966 50 000 0000"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="site-url">
                    {language === 'ar' ? 'رابط الموقع' : 'Site URL'}
                  </Label>
                  <Input
                    id="site-url"
                    type="url"
                    value={formData.site_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, site_url: e.target.value }))}
                    placeholder="https://www.example.com"
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSave('company', { 
                    company_name: formData.company_name, 
                    company_address: formData.company_address,
                    cr_number: formData.cr_number,
                    company_email: formData.company_email,
                    company_phone: formData.company_phone,
                    site_url: formData.site_url,
                    vat_number: formData.vat_number,
                  })}
                  disabled={savingSection === 'company'}
                >
                  {savingSection === 'company' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {language === 'ar' ? 'حفظ' : 'Save'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Checkout & Payment Settings */}
          <CheckoutPaymentSettings
            formData={{
              payment_cod_enabled: formData.payment_cod_enabled,
              payment_mada_enabled: formData.payment_mada_enabled,
              payment_visa_enabled: formData.payment_visa_enabled,
              payment_mastercard_enabled: formData.payment_mastercard_enabled,
              payment_apple_pay_enabled: formData.payment_apple_pay_enabled,
              payment_stc_pay_enabled: formData.payment_stc_pay_enabled,
              min_order_amount: formData.min_order_amount,
              require_phone_checkout: formData.require_phone_checkout,
              checkout_notes_enabled: formData.checkout_notes_enabled,
            }}
            onFormChange={(updates) => setFormData(prev => ({ ...prev, ...updates }))}
            onToggle={(key, value) => handleToggle(key as keyof SettingsData, value)}
            onSave={(section, updates) => handleSave(section, updates as Partial<SettingsData>)}
            savingSection={savingSection}
          />

          {/* Inventory Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {language === 'ar' ? 'إعدادات المخزون' : 'Inventory Settings'}
              </CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'تكوين تنبيهات المخزون وحدود المنتجات' 
                  : 'Configure stock alerts and product thresholds'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="low-stock">
                    {language === 'ar' ? 'حد المخزون المنخفض' : 'Low Stock Threshold'}
                  </Label>
                  <Input
                    id="low-stock"
                    type="number"
                    min="1"
                    value={formData.low_stock_threshold}
                    onChange={(e) => setFormData(prev => ({ ...prev, low_stock_threshold: parseInt(e.target.value) || 10 }))}
                    placeholder="10"
                  />
                  <p className="text-xs text-muted-foreground">
                    {language === 'ar' 
                      ? 'سيتم تنبيهك عندما ينخفض المخزون عن هذا الحد' 
                      : 'You will be alerted when stock falls below this number'}
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSave('inventory', { low_stock_threshold: formData.low_stock_threshold })}
                  disabled={savingSection === 'inventory'}
                >
                  {savingSection === 'inventory' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {language === 'ar' ? 'حفظ' : 'Save'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {language === 'ar' ? 'إعدادات الإشعارات' : 'Notification Settings'}
              </CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'تكوين تنبيهات البريد الإلكتروني والإشعارات' 
                  : 'Configure email alerts and notifications'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{language === 'ar' ? 'إشعارات الطلبات الجديدة' : 'New Order Notifications'}</Label>
                  <p className="text-xs text-muted-foreground">
                    {language === 'ar' 
                      ? 'إرسال بريد إلكتروني عند استلام طلب جديد' 
                      : 'Send email when a new order is received'}
                  </p>
                </div>
                <Switch 
                  checked={formData.new_order_notifications}
                  onCheckedChange={(checked) => handleToggle('new_order_notifications', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{language === 'ar' ? 'تنبيهات المخزون المنخفض' : 'Low Stock Alerts'}</Label>
                  <p className="text-xs text-muted-foreground">
                    {language === 'ar' 
                      ? 'إرسال تنبيه عندما ينخفض مخزون المنتج' 
                      : 'Send alert when product stock is low'}
                  </p>
                </div>
                <Switch 
                  checked={formData.low_stock_notifications}
                  onCheckedChange={(checked) => handleToggle('low_stock_notifications', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
