import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSetting, useUpdateSetting } from '@/hooks/useSettings';
import { useToast } from '@/hooks/use-toast';
import { Settings, Package, Bell, Store, Save, Loader2 } from 'lucide-react';

export default function AdminSettings() {
  const { language } = useLanguage();
  const { toast } = useToast();
  
  // Fetch settings
  const { data: lowStockSetting, isLoading: loadingLowStock } = useSetting('low_stock_threshold');
  const updateSetting = useUpdateSetting();

  // Local state for form values
  const [lowStockThreshold, setLowStockThreshold] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form values when data loads
  React.useEffect(() => {
    if (lowStockSetting?.value !== undefined) {
      const value = typeof lowStockSetting.value === 'string' 
        ? lowStockSetting.value 
        : JSON.stringify(lowStockSetting.value);
      setLowStockThreshold(value.replace(/"/g, ''));
    }
  }, [lowStockSetting]);

  const handleSaveInventory = async () => {
    setIsSaving(true);
    try {
      await updateSetting.mutateAsync({
        key: 'low_stock_threshold',
        value: parseInt(lowStockThreshold) || 10
      });
      toast({
        title: language === 'ar' ? 'تم الحفظ' : 'Settings Saved',
        description: language === 'ar' ? 'تم حفظ إعدادات المخزون بنجاح' : 'Inventory settings saved successfully',
      });
    } catch (error) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في حفظ الإعدادات' : 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

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
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    placeholder="10"
                    disabled={loadingLowStock}
                  />
                  <p className="text-xs text-muted-foreground">
                    {language === 'ar' 
                      ? 'سيتم تنبيهك عندما ينخفض المخزون عن هذا الحد' 
                      : 'You will be alerted when stock falls below this number'}
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveInventory} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {language === 'ar' ? 'حفظ' : 'Save'}
                </Button>
              </div>
            </CardContent>
          </Card>

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
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{language === 'ar' ? 'وضع الصيانة' : 'Maintenance Mode'}</Label>
                  <p className="text-xs text-muted-foreground">
                    {language === 'ar' 
                      ? 'إغلاق المتجر مؤقتاً للصيانة' 
                      : 'Temporarily close the store for maintenance'}
                  </p>
                </div>
                <Switch disabled />
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
                <Switch defaultChecked disabled />
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
                <Switch defaultChecked disabled />
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
                <Switch defaultChecked disabled />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
