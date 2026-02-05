import React from 'react';
import { format } from 'date-fns';
import { Receipt, AlertCircle, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOrderTransactions } from '@/hooks/usePayment';
import { Skeleton } from '@/components/ui/skeleton';
import { PaymentMethodBadge, PaymentStatusBadge } from './PaymentStatusBadge';
import { cn } from '@/lib/utils';

interface TransactionHistoryProps {
  orderId: string;
  compact?: boolean;
}

export function TransactionHistory({ orderId, compact = false }: TransactionHistoryProps) {
  const { language, t } = useLanguage();
  const { data: transactions, isLoading } = useOrderTransactions(orderId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
        {language === 'ar' ? 'لا توجد معاملات' : 'No transactions'}
      </div>
    );
  }

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {transactions.slice(0, 3).map((txn) => (
          <div
            key={txn.id}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              {getStatusIcon(txn.status)}
              <span className="text-muted-foreground">
                {format(new Date(txn.created_at), 'PP')}
              </span>
            </div>
            <span className={cn(
              'font-medium',
              txn.status === 'completed' ? 'text-green-600' : 
              txn.status === 'failed' ? 'text-red-600' : 'text-foreground'
            )}>
              {txn.amount} {txn.currency}
            </span>
          </div>
        ))}
        {transactions.length > 3 && (
          <p className="text-xs text-muted-foreground text-center">
            +{transactions.length - 3} {language === 'ar' ? 'معاملات أخرى' : 'more transactions'}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((txn) => (
        <div
          key={txn.id}
          className="bg-muted/30 rounded-lg p-3 border border-border/50"
        >
          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              {getStatusIcon(txn.status)}
              <PaymentStatusBadge status={txn.status} />
              <PaymentMethodBadge method={txn.payment_method} />
            </div>
            <span className={cn(
              'font-semibold',
              txn.status === 'completed' ? 'text-green-600' : 
              txn.status === 'failed' ? 'text-red-600' : 'text-foreground'
            )}>
              {txn.amount} {txn.currency}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>{format(new Date(txn.created_at), 'PPP p')}</span>
            {txn.gateway_reference && (
              <span>
                {language === 'ar' ? 'المرجع:' : 'Ref:'} {txn.gateway_reference}
              </span>
            )}
          </div>
          
          {txn.error_message && (
            <div className="mt-2 text-xs text-red-500 flex items-start gap-1">
              <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
              {txn.error_message}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
