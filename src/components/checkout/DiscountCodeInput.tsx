import React, { useState } from 'react';
import { Tag, Loader2, X, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useValidateDiscountCode, DiscountCode } from '@/hooks/useDiscounts';

interface DiscountCodeInputProps {
  orderTotal: number;
  currency: string;
  onApply: (discount: { code: DiscountCode; amount: number }) => void;
  onRemove: () => void;
  appliedDiscount: { code: DiscountCode; amount: number } | null;
}

export function DiscountCodeInput({
  orderTotal,
  currency,
  onApply,
  onRemove,
  appliedDiscount,
}: DiscountCodeInputProps) {
  const { language } = useLanguage();
  const [code, setCode] = useState('');
  const validateCode = useValidateDiscountCode();

  const handleApply = () => {
    if (!code.trim()) return;
    validateCode.mutate(
      { code: code.trim(), orderTotal },
      {
        onSuccess: (result) => {
          onApply({ code: result.discount, amount: result.discountAmount });
          setCode('');
        },
      }
    );
  };

  if (appliedDiscount) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          <div>
            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              <code className="bg-green-100 dark:bg-green-900/50 px-1.5 py-0.5 rounded text-xs">
                {appliedDiscount.code.code}
              </code>
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              -{appliedDiscount.amount.toFixed(2)} {currency}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-green-600 dark:text-green-400 hover:text-destructive"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        <Tag className="h-4 w-4" />
        {language === 'ar' ? 'كود الخصم' : 'Discount Code'}
      </label>
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder={language === 'ar' ? 'أدخل الكود' : 'Enter code'}
          className="flex-1 uppercase"
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApply())}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleApply}
          disabled={!code.trim() || validateCode.isPending}
        >
          {validateCode.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            language === 'ar' ? 'تطبيق' : 'Apply'
          )}
        </Button>
      </div>
    </div>
  );
}
