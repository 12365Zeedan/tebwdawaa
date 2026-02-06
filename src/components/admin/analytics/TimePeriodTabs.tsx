import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import type { TimePeriod } from '@/hooks/useSalesAnalytics';

interface TimePeriodTabsProps {
  value: TimePeriod;
  onChange: (v: TimePeriod) => void;
}

const periods: { value: TimePeriod; labelEn: string; labelAr: string }[] = [
  { value: 'daily', labelEn: 'Daily', labelAr: 'يومي' },
  { value: 'weekly', labelEn: 'Weekly', labelAr: 'أسبوعي' },
  { value: 'monthly', labelEn: 'Monthly', labelAr: 'شهري' },
  { value: 'quarterly', labelEn: 'Quarterly', labelAr: 'ربع سنوي' },
  { value: 'yearly', labelEn: 'Yearly', labelAr: 'سنوي' },
];

export function TimePeriodTabs({ value, onChange }: TimePeriodTabsProps) {
  const { language } = useLanguage();

  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as TimePeriod)}>
      <TabsList className="bg-muted/50">
        {periods.map((p) => (
          <TabsTrigger key={p.value} value={p.value} className="text-xs sm:text-sm">
            {language === 'ar' ? p.labelAr : p.labelEn}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
