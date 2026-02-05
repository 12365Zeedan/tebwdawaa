import React from 'react';
import { CreditCard, Clock, CheckCircle, XCircle, RefreshCw, Ban, Banknote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { PAYMENT_METHODS } from '@/types/payment';
import { cn } from '@/lib/utils';

const paymentStatusConfig: Record<string, { 
  icon: React.ElementType; 
  color: string; 
  labelEn: string; 
  labelAr: string;
}> = {
  pending: { 
    icon: Clock, 
    color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', 
    labelEn: 'Pending', 
    labelAr: 'قيد الانتظار' 
  },
  processing: { 
    icon: RefreshCw, 
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', 
    labelEn: 'Processing', 
    labelAr: 'قيد المعالجة' 
  },
  completed: { 
    icon: CheckCircle, 
    color: 'bg-green-500/10 text-green-600 border-green-500/20', 
    labelEn: 'Paid', 
    labelAr: 'مدفوع' 
  },
  failed: { 
    icon: XCircle, 
    color: 'bg-red-500/10 text-red-600 border-red-500/20', 
    labelEn: 'Failed', 
    labelAr: 'فشل' 
  },
  refunded: { 
    icon: RefreshCw, 
    color: 'bg-orange-500/10 text-orange-600 border-orange-500/20', 
    labelEn: 'Refunded', 
    labelAr: 'مسترد' 
  },
  cancelled: { 
    icon: Ban, 
    color: 'bg-gray-500/10 text-gray-600 border-gray-500/20', 
    labelEn: 'Cancelled', 
    labelAr: 'ملغي' 
  },
};

interface PaymentStatusBadgeProps {
  status: string | null;
  className?: string;
}

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  const { language } = useLanguage();
  const config = paymentStatusConfig[status || 'pending'] || paymentStatusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <Badge variant="outline" className={cn(config.color, className)}>
      <StatusIcon className="h-3 w-3 mr-1" />
      {language === 'ar' ? config.labelAr : config.labelEn}
    </Badge>
  );
}

interface PaymentMethodBadgeProps {
  method: string | null;
  className?: string;
}

export function PaymentMethodBadge({ method, className }: PaymentMethodBadgeProps) {
  const { language } = useLanguage();
  const paymentMethod = PAYMENT_METHODS.find(m => m.id === method);
  
  const Icon = method === 'cod' ? Banknote : CreditCard;
  const label = paymentMethod 
    ? (language === 'ar' ? paymentMethod.nameAr : paymentMethod.name)
    : (language === 'ar' ? 'غير محدد' : 'Unknown');

  return (
    <Badge variant="secondary" className={cn('gap-1', className)}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

export { paymentStatusConfig };
