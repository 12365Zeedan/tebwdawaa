import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { PAYMENT_METHODS, PaymentMethod } from '@/types/payment';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Banknote, 
  CreditCard, 
  Smartphone, 
  Wallet,
  LucideIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePaymentSettings } from '@/hooks/usePaymentSettings';

interface PaymentMethodSelectorProps {
  value: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
  disabled?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  Banknote,
  CreditCard,
  Smartphone,
  Wallet,
};

export function PaymentMethodSelector({
  value,
  onChange,
  disabled = false,
}: PaymentMethodSelectorProps) {
  const { language } = useLanguage();
  const { data: paymentSettings } = usePaymentSettings();

  // Merge admin settings with static config
  const methods = PAYMENT_METHODS.map((method) => ({
    ...method,
    enabled: paymentSettings?.paymentMethodsEnabled[method.id] ?? method.enabled,
  }));

  // If current value is disabled, auto-select first enabled method
  React.useEffect(() => {
    const currentEnabled = methods.find(m => m.id === value)?.enabled;
    if (!currentEnabled) {
      const firstEnabled = methods.find(m => m.enabled);
      if (firstEnabled) {
        onChange(firstEnabled.id);
      }
    }
  }, [paymentSettings]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
      </h3>
      
      <RadioGroup
        value={value}
        onValueChange={(val) => onChange(val as PaymentMethod)}
        disabled={disabled}
        className="grid gap-3"
      >
        {methods.filter(m => m.enabled).map((method) => {
          const Icon = iconMap[method.icon] || CreditCard;
          const isSelected = value === method.id;

          return (
            <div key={method.id}>
              <Label
                htmlFor={method.id}
                className={cn(
                  'flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all',
                  isSelected && 'border-primary bg-primary/5 ring-1 ring-primary',
                  !isSelected && 'hover:border-primary/50 hover:bg-muted/50'
                )}
              >
                <RadioGroupItem
                  value={method.id}
                  id={method.id}
                  disabled={disabled}
                  className="shrink-0"
                />
                
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <span className="font-medium truncate block">
                      {language === 'ar' ? method.nameAr : method.name}
                    </span>
                    <p className="text-sm text-muted-foreground truncate">
                      {language === 'ar' ? method.descriptionAr : method.description}
                    </p>
                  </div>
                </div>
              </Label>
            </div>
          );
        })}
      </RadioGroup>

      {value === 'cod' && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            {language === 'ar' 
              ? '💵 سيتم تحصيل المبلغ نقداً عند استلام الطلب' 
              : '💵 Payment will be collected in cash upon delivery'}
          </p>
        </div>
      )}
    </div>
  );
}
