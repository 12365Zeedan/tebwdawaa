import React, { useState, useMemo } from 'react';
import { Package } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProductSales, type TimePeriod, type SortDirection } from '@/hooks/useSalesAnalytics';
import { TimePeriodTabs } from './TimePeriodTabs';
import { SortButton } from './SortButton';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type SortField = 'name' | 'quantity' | 'revenue';

export function ProductSalesCard() {
  const { language, t } = useLanguage();
  const [period, setPeriod] = useState<TimePeriod>('monthly');
  const { data, isLoading } = useProductSales(period);

  const [sortField, setSortField] = useState<SortField>('revenue');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const sorted = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name':
          cmp = (language === 'ar' ? a.productNameAr : a.productName).localeCompare(
            language === 'ar' ? b.productNameAr : b.productName
          );
          break;
        case 'quantity':
          cmp = a.totalQuantity - b.totalQuantity;
          break;
        case 'revenue':
          cmp = a.totalRevenue - b.totalRevenue;
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortField, sortDir, language]);

  const formatCurrency = (val: number) =>
    `${val.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${t('common.currency')}`;

  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-soft overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <Package className="h-5 w-5 text-success" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {language === 'ar' ? 'المبيعات حسب المنتج' : 'Sales Per Product'}
            </h2>
          </div>
          <TimePeriodTabs value={period} onChange={setPeriod} />
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs text-muted-foreground">
            {language === 'ar' ? 'ترتيب حسب:' : 'Sort by:'}
          </span>
          <SortButton
            label={language === 'ar' ? 'الاسم' : 'Name'}
            active={sortField === 'name'}
            direction={sortDir}
            onClick={() => handleSort('name')}
          />
          <SortButton
            label={language === 'ar' ? 'الكمية' : 'Quantity'}
            active={sortField === 'quantity'}
            direction={sortDir}
            onClick={() => handleSort('quantity')}
          />
          <SortButton
            label={language === 'ar' ? 'الإيرادات' : 'Revenue'}
            active={sortField === 'revenue'}
            direction={sortDir}
            onClick={() => handleSort('revenue')}
          />
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{language === 'ar' ? 'لا توجد بيانات مبيعات' : 'No sales data'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'ar' ? 'المنتج' : 'Product'}</TableHead>
                  <TableHead className="text-center">{language === 'ar' ? 'الكمية المباعة' : 'Qty Sold'}</TableHead>
                  <TableHead className="text-end">{language === 'ar' ? 'الإيرادات' : 'Revenue'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((row) => (
                  <TableRow key={row.productId || row.productName}>
                    <TableCell className="font-medium">
                      {language === 'ar' ? row.productNameAr : row.productName}
                    </TableCell>
                    <TableCell className="text-center">{row.totalQuantity}</TableCell>
                    <TableCell className="text-end">{formatCurrency(row.totalRevenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
