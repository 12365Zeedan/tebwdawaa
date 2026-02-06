import React, { useState, useMemo } from 'react';
import { Link2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFrequentlyBoughtTogether, type TimePeriod, type SortDirection } from '@/hooks/useSalesAnalytics';
import { TimePeriodTabs } from './TimePeriodTabs';
import { SortButton } from './SortButton';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

type SortField = 'pair' | 'count';

export function FrequentlyBoughtTogetherCard() {
  const { language } = useLanguage();
  const [period, setPeriod] = useState<TimePeriod>('monthly');
  const { data, isLoading } = useFrequentlyBoughtTogether(period);

  const [sortField, setSortField] = useState<SortField>('count');
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
        case 'pair':
          cmp = a.productA.localeCompare(b.productA);
          break;
        case 'count':
          cmp = a.count - b.count;
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortField, sortDir]);

  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-soft overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-info/10">
              <Link2 className="h-5 w-5 text-info" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {language === 'ar' ? 'المنتجات الأكثر شراءً معاً' : 'Frequently Bought Together'}
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
            label={language === 'ar' ? 'المنتجات' : 'Products'}
            active={sortField === 'pair'}
            direction={sortDir}
            onClick={() => handleSort('pair')}
          />
          <SortButton
            label={language === 'ar' ? 'عدد المرات' : 'Frequency'}
            active={sortField === 'count'}
            direction={sortDir}
            onClick={() => handleSort('count')}
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
            <Link2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{language === 'ar' ? 'لا توجد بيانات كافية' : 'Not enough data'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.slice(0, 15).map((pair, idx) => (
              <div
                key={`${pair.productA}-${pair.productB}`}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-xs font-bold text-muted-foreground w-5 shrink-0">{idx + 1}</span>
                  <span className="font-medium text-foreground truncate">{pair.productA}</span>
                  <span className="text-muted-foreground text-xs shrink-0">+</span>
                  <span className="font-medium text-foreground truncate">{pair.productB}</span>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {pair.count}x
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
