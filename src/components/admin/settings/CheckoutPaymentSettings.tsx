import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Save, Loader2, Banknote, Smartphone, Wallet } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PaymentMethodItem {
  key: string;
  id: string;
  name: string;
  nameAr: string;
  icon: React.ReactNode;
}

const PAYMENT_METHOD_ITEMS: PaymentMethodItem[] = [
  {
    key: 'payment_cod_enabled',
    id: 'cod',
    name: 'Cash on Delivery',
    nameAr: 'الدفع عند الاستلام',
    icon: <Banknote className="h-4 w-4" />,
  },
  {
    key: 'payment_mada_enabled',
    id: 'mada',
    name: 'Mada',
    nameAr: 'مدى',
    icon: <CreditCard className="h-4 w-4" />,
  },
  {
    key: 'payment_visa_enabled',
    id: 'visa',
    name: 'Visa',
    nameAr: 'فيزا',
    icon: <CreditCard className="h-4 w-4" />,
  },
  {
    key: 'payment_mastercard_enabled',
    id: 'mastercard',
    name: 'Mastercard',
    nameAr: 'ماستركارد',
    icon: <CreditCard className="h-4 w-4" />,
  },
  {
    key: 'payment_apple_pay_enabled',
    id: 'apple_pay',
    name: 'Apple Pay',
    nameAr: 'أبل باي',
    icon: <Smartphone className="h-4 w-4" />,
  },
  {
    key: 'payment_stc_pay_enabled',
    id: 'stc_pay',
    name: 'STC Pay',
    nameAr: 'اس تي سي باي',
    icon: <Wallet className="h-4 w-4" />,
  },
];

interface CheckoutPaymentSettingsProps {
  formData: {
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
  onFormChange: (updates: Partial<CheckoutPaymentSettingsProps['formData']>) => void;
  onToggle: (key: string, value: boolean) => void;
  onSave: (section: string, updates: Record<string, unknown>) => void;
  savingSection: string | null;
}

export function CheckoutPaymentSettings({
  formData,
  onFormChange,
  onToggle,
  onSave,
  savingSection,
}: CheckoutPaymentSettingsProps) {
  const { language } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {language === 'ar' ? 'إعدادات الدفع والسداد' : 'Checkout & Payment Settings'}
        </CardTitle>
        <CardDescription>
          {language === 'ar'
            ? 'تكوين طرق الدفع وخيارات السداد'
            : 'Configure payment methods and checkout options'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Methods */}
        <div>
          <Label className="text-base font-semibold">
            {language === 'ar' ? 'طرق الدفع المتاحة' : 'Available Payment Methods'}
          </Label>
          <p className="text-xs text-muted-foreground mb-4">
            {language === 'ar'
              ? 'اختر طرق الدفع التي تريد تفعيلها في صفحة الدفع'
              : 'Choose which payment methods to enable on the checkout page'}
          </p>
          <div className="space-y-3">
            {PAYMENT_METHOD_ITEMS.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {method.icon}
                  </div>
                  <span className="font-medium">
                    {language === 'ar' ? method.nameAr : method.name}
                  </span>
                </div>
                <Switch
                  checked={formData[method.key as keyof typeof formData] as boolean}
                  onCheckedChange={(checked) => onToggle(method.key, checked)}
                />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Checkout Options */}
        <div>
          <Label className="text-base font-semibold">
            {language === 'ar' ? 'خيارات السداد' : 'Checkout Options'}
          </Label>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="min-order-amount">
                {language === 'ar' ? 'الحد الأدنى لقيمة الطلب' : 'Minimum Order Amount'}
              </Label>
              <Input
                id="min-order-amount"
                type="number"
                min="0"
                value={formData.min_order_amount}
                onChange={(e) =>
                  onFormChange({ min_order_amount: parseFloat(e.target.value) || 0 })
                }
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                {language === 'ar'
                  ? 'اتركه 0 لعدم تحديد حد أدنى'
                  : 'Set to 0 for no minimum requirement'}
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>
                  {language === 'ar' ? 'رقم الهاتف مطلوب' : 'Require Phone Number'}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar'
                    ? 'إجبار العملاء على إدخال رقم الهاتف عند الدفع'
                    : 'Require customers to enter phone number at checkout'}
                </p>
              </div>
              <Switch
                checked={formData.require_phone_checkout}
                onCheckedChange={(checked) => onToggle('require_phone_checkout', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>
                  {language === 'ar' ? 'ملاحظات الطلب' : 'Order Notes'}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar'
                    ? 'السماح للعملاء بإضافة ملاحظات مع طلباتهم'
                    : 'Allow customers to add notes with their orders'}
                </p>
              </div>
              <Switch
                checked={formData.checkout_notes_enabled}
                onCheckedChange={(checked) => onToggle('checkout_notes_enabled', checked)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={() =>
              onSave('checkout', {
                min_order_amount: formData.min_order_amount,
              })
            }
            disabled={savingSection === 'checkout'}
          >
            {savingSection === 'checkout' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {language === 'ar' ? 'حفظ' : 'Save'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
