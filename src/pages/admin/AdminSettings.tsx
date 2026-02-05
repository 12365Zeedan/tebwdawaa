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
import { Settings, Package, Bell, Store, Save, Loader2, Truck } from 'lucide-react';

type SettingsData = {
  store_name: string;
  store_name_ar: string;
  currency: string;
  low_stock_threshold: number;
  shipping_cost: number;
  free_shipping_threshold: number;
  maintenance_mode: boolean;
  guest_checkout_enabled: boolean;
  new_order_notifications: boolean;
  low_stock_notifications: boolean;
};

const defaultSettings: SettingsData = {
  store_name: 'My Store',
  store_name_ar: 'متجري',
  currency: 'SAR',
  low_stock_threshold: 10,
  shipping_cost: 15,
  free_shipping_threshold: 200,
  maintenance_mode: false,
  guest_checkout_enabled: true,
  new_order_notifications: true,
  low_stock_notifications: true,
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
      const parsed: Record<string, string | number | boolean> = {};
      settings.forEach((setting) => {
        const value = setting.value;
        const key = setting.key as keyof SettingsData;
        if (key in defaultSettings) {
          const defaultVal = defaultSettings[key];
          if (typeof defaultVal === 'boolean') {
            parsed[key] = value === true || value === 'true' || value === '"true"';
          } else if (typeof defaultVal === 'number') {
            parsed[key] = typeof value === 'number' ? value : parseFloat(String(value).replace(/"/g, '')) || defaultVal;
          } else {
            parsed[key] = typeof value === 'string' ? value.replace(/"/g, '') : String(value).replace(/"/g, '');
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

          {/* Shipping Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                {language === 'ar' ? 'إعدادات الشحن' : 'Shipping Settings'}
              </CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'تكوين تكاليف الشحن والحدود' 
                  : 'Configure shipping costs and thresholds'}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, shipping_cost: parseFloat(e.target.value) || 0 }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, free_shipping_threshold: parseFloat(e.target.value) || 0 }))}
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
                <Button 
                  onClick={() => handleSave('shipping', { 
                    shipping_cost: formData.shipping_cost, 
                    free_shipping_threshold: formData.free_shipping_threshold 
                  })}
                  disabled={savingSection === 'shipping'}
                >
                  {savingSection === 'shipping' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {language === 'ar' ? 'حفظ' : 'Save'}
                </Button>
              </div>
            </CardContent>
          </Card>

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
