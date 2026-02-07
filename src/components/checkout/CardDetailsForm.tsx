import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CardDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

interface CardDetailsFormProps {
  value: CardDetails;
  onChange: (details: CardDetails) => void;
  disabled?: boolean;
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return digits;
}

export function CardDetailsForm({ value, onChange, disabled = false }: CardDetailsFormProps) {
  const { language } = useLanguage();
  const [errors, setErrors] = useState<Partial<Record<keyof CardDetails, string>>>({});

  const handleChange = (field: keyof CardDetails, rawValue: string) => {
    let formatted = rawValue;

    if (field === 'cardNumber') {
      formatted = formatCardNumber(rawValue);
    } else if (field === 'expiryDate') {
      formatted = formatExpiry(rawValue);
    } else if (field === 'cvv') {
      formatted = rawValue.replace(/\D/g, '').slice(0, 4);
    }

    onChange({ ...value, [field]: formatted });

    // Clear error on edit
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Lock className="h-4 w-4" />
        {language === 'ar' ? 'بيانات البطاقة محمية ومشفرة' : 'Card details are secure and encrypted'}
      </div>

      {/* Cardholder Name */}
      <div className="space-y-2">
        <Label htmlFor="cardholderName">
          {language === 'ar' ? 'اسم حامل البطاقة' : 'Cardholder Name'}
        </Label>
        <Input
          id="cardholderName"
          placeholder={language === 'ar' ? 'الاسم كما يظهر على البطاقة' : 'Name on card'}
          value={value.cardholderName}
          onChange={(e) => handleChange('cardholderName', e.target.value)}
          disabled={disabled}
          className="uppercase"
        />
      </div>

      {/* Card Number */}
      <div className="space-y-2">
        <Label htmlFor="cardNumber">
          {language === 'ar' ? 'رقم البطاقة' : 'Card Number'}
        </Label>
        <div className="relative">
          <Input
            id="cardNumber"
            placeholder="1234 5678 9012 3456"
            value={value.cardNumber}
            onChange={(e) => handleChange('cardNumber', e.target.value)}
            disabled={disabled}
            inputMode="numeric"
            maxLength={19}
            className={cn('pr-10', errors.cardNumber && 'border-destructive')}
          />
          <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        {errors.cardNumber && (
          <p className="text-xs text-destructive">{errors.cardNumber}</p>
        )}
      </div>

      {/* Expiry & CVV */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expiryDate">
            {language === 'ar' ? 'تاريخ الانتهاء' : 'Expiry Date'}
          </Label>
          <Input
            id="expiryDate"
            placeholder="MM/YY"
            value={value.expiryDate}
            onChange={(e) => handleChange('expiryDate', e.target.value)}
            disabled={disabled}
            inputMode="numeric"
            maxLength={5}
            className={cn(errors.expiryDate && 'border-destructive')}
          />
          {errors.expiryDate && (
            <p className="text-xs text-destructive">{errors.expiryDate}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cvv">
            {language === 'ar' ? 'رمز الأمان' : 'CVV'}
          </Label>
          <Input
            id="cvv"
            placeholder="123"
            value={value.cvv}
            onChange={(e) => handleChange('cvv', e.target.value)}
            disabled={disabled}
            inputMode="numeric"
            maxLength={4}
            type="password"
            className={cn(errors.cvv && 'border-destructive')}
          />
          {errors.cvv && (
            <p className="text-xs text-destructive">{errors.cvv}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Validates card details and returns error messages (if any)
 */
export function validateCardDetails(
  details: CardDetails,
  language: string
): Partial<Record<keyof CardDetails, string>> | null {
  const errors: Partial<Record<keyof CardDetails, string>> = {};
  const digits = details.cardNumber.replace(/\s/g, '');

  if (!details.cardholderName.trim()) {
    errors.cardholderName = language === 'ar' ? 'اسم حامل البطاقة مطلوب' : 'Cardholder name is required';
  }

  if (digits.length < 13 || digits.length > 19) {
    errors.cardNumber = language === 'ar' ? 'رقم البطاقة غير صحيح' : 'Invalid card number';
  }

  const expiryParts = details.expiryDate.split('/');
  if (expiryParts.length !== 2 || expiryParts[0].length !== 2 || expiryParts[1].length !== 2) {
    errors.expiryDate = language === 'ar' ? 'تاريخ الانتهاء غير صحيح' : 'Invalid expiry date';
  } else {
    const month = parseInt(expiryParts[0], 10);
    if (month < 1 || month > 12) {
      errors.expiryDate = language === 'ar' ? 'الشهر غير صحيح' : 'Invalid month';
    }
  }

  const cvvDigits = details.cvv.replace(/\D/g, '');
  if (cvvDigits.length < 3 || cvvDigits.length > 4) {
    errors.cvv = language === 'ar' ? 'رمز الأمان غير صحيح' : 'Invalid CVV';
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
