import React, { useState } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTotalSales, type TimePeriod } from '@/hooks/useSalesAnalytics';
import { TimePeriodTabs } from './TimePeriodTabs';
import { Skeleton } from '@/components/ui/skeleton';

export function TotalSalesCard() {
  const { language, t } = useLanguage();
  const [period, setPeriod] = useState<TimePeriod>('monthly');
  const { data, isLoading } = useTotalSales(period);

  const formatCurrency = (val: number) =>
    `${val.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${t('common.currency')}`;

  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-soft overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {language === 'ar' ? 'إجمالي المبيعات' : 'Total Sales Overview'}
            </h2>
          </div>
          <TimePeriodTabs value={period} onChange={setPeriod} />
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                <DollarSign className="h-4 w-4" />
                {language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}
              </div>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(data?.totalRevenue ?? 0)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                <ShoppingCart className="h-4 w-4" />
                {language === 'ar' ? 'عدد الطلبات' : 'Total Orders'}
              </div>
              <p className="text-2xl font-bold text-foreground">
                {data?.totalOrders ?? 0}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                <TrendingUp className="h-4 w-4" />
                {language === 'ar' ? 'متوسط قيمة الطلب' : 'Avg Order Value'}
              </div>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(data?.avgOrderValue ?? 0)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
