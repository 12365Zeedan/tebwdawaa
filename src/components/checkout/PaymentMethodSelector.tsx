import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { PAYMENT_METHODS, PaymentMethod } from '@/types/payment';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Banknote, 
  CreditCard, 
  Smartphone, 
  Wallet,
  Building2,
  LucideIcon,
  Copy,
  Check,
  Upload,
  FileImage,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePaymentSettings } from '@/hooks/usePaymentSettings';
import { useBankAccountSettings } from '@/hooks/useBankAccountSettings';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentMethodSelectorProps {
  value: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
  disabled?: boolean;
  onPaymentProofUploaded?: (url: string) => void;
}

const iconMap: Record<string, LucideIcon> = {
  Banknote,
  CreditCard,
  Smartphone,
  Wallet,
  Building2,
};

export function PaymentMethodSelector({
  value,
  onChange,
  disabled = false,
  onPaymentProofUploaded,
}: PaymentMethodSelectorProps) {
  const { language } = useLanguage();
  const { data: paymentSettings } = usePaymentSettings();
  const { data: bankData } = useBankAccountSettings();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [proofUploaded, setProofUploaded] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'حجم الملف كبير جداً (الحد الأقصى 5 ميجابايت)' : 'File too large (max 5MB)',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = `receipts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-receipts')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('payment-receipts')
        .getPublicUrl(filePath);

      setProofUploaded(true);
      onPaymentProofUploaded?.(publicUrl);
      toast({
        title: language === 'ar' ? 'تم الرفع' : 'Uploaded',
        description: language === 'ar' ? 'تم رفع إيصال الدفع بنجاح' : 'Payment receipt uploaded successfully',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في رفع الإيصال' : 'Failed to upload receipt',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const bankDetails = bankData?.details;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
      </h3>
      
      <RadioGroup
        value={value}
        onValueChange={(val) => {
          onChange(val as PaymentMethod);
          setProofUploaded(false);
        }}
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

      {/* Bank Transfer Details */}
      {value === 'bank_transfer' && bankDetails && (
        <div className="space-y-4">
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
            <p className="text-sm font-semibold text-foreground">
              {language === 'ar' ? '🏦 بيانات الحساب البنكي للتحويل' : '🏦 Bank Account Details for Transfer'}
            </p>

            {(bankDetails.bankName || bankDetails.bankNameAr) && (
              <BankDetailRow
                label={language === 'ar' ? 'البنك' : 'Bank'}
                value={language === 'ar' ? bankDetails.bankNameAr || bankDetails.bankName : bankDetails.bankName}
                fieldKey="bank"
                copiedField={copiedField}
                onCopy={copyToClipboard}
              />
            )}

            {(bankDetails.accountHolder || bankDetails.accountHolderAr) && (
              <BankDetailRow
                label={language === 'ar' ? 'صاحب الحساب' : 'Account Holder'}
                value={language === 'ar' ? bankDetails.accountHolderAr || bankDetails.accountHolder : bankDetails.accountHolder}
                fieldKey="holder"
                copiedField={copiedField}
                onCopy={copyToClipboard}
              />
            )}

            {bankDetails.iban && (
              <BankDetailRow
                label={language === 'ar' ? 'الآيبان' : 'IBAN'}
                value={bankDetails.iban}
                fieldKey="iban"
                copiedField={copiedField}
                onCopy={copyToClipboard}
                mono
              />
            )}

            {bankDetails.accountNumber && (
              <BankDetailRow
                label={language === 'ar' ? 'رقم الحساب' : 'Account No.'}
                value={bankDetails.accountNumber}
                fieldKey="account"
                copiedField={copiedField}
                onCopy={copyToClipboard}
                mono
              />
            )}

            {bankDetails.swiftCode && (
              <BankDetailRow
                label={language === 'ar' ? 'السويفت' : 'SWIFT'}
                value={bankDetails.swiftCode}
                fieldKey="swift"
                copiedField={copiedField}
                onCopy={copyToClipboard}
                mono
              />
            )}
          </div>

          {/* Payment Proof Upload */}
          <div className="p-4 border border-border rounded-lg space-y-3">
            <p className="text-sm font-medium text-foreground">
              {language === 'ar' ? '📎 ارفق إيصال التحويل' : '📎 Attach Transfer Receipt'}
            </p>
            <p className="text-xs text-muted-foreground">
              {language === 'ar'
                ? 'يرجى رفع صورة أو ملف PDF لإيصال التحويل البنكي للتحقق من الدفع'
                : 'Please upload an image or PDF of your bank transfer receipt for payment verification'}
            </p>

            {proofUploaded ? (
              <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {language === 'ar' ? 'تم رفع الإيصال بنجاح' : 'Receipt uploaded successfully'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  disabled={uploading || disabled}
                  onClick={() => document.getElementById('payment-proof-input')?.click()}
                >
                  {uploading ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {language === 'ar' ? 'رفع الإيصال' : 'Upload Receipt'}
                </Button>
                <span className="text-xs text-muted-foreground">
                  {language === 'ar' ? 'JPG, PNG, PDF - حد أقصى 5 ميجابايت' : 'JPG, PNG, PDF - Max 5MB'}
                </span>
              </div>
            )}

            <input
              id="payment-proof-input"
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleUploadProof}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function BankDetailRow({
  label,
  value,
  fieldKey,
  copiedField,
  onCopy,
  mono = false,
}: {
  label: string;
  value: string;
  fieldKey: string;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <span className="text-xs text-muted-foreground block">{label}</span>
        <span className={cn('text-sm font-medium text-foreground', mono && 'font-mono')}>{value}</span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={() => onCopy(value, fieldKey)}
      >
        {copiedField === fieldKey ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
      </Button>
    </div>
  );
}
