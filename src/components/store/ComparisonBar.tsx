import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProductComparison } from '@/hooks/useProductComparison';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export function ComparisonBar() {
  const { comparisonCount, clearComparison } = useProductComparison();
  const { language } = useLanguage();

  if (comparisonCount === 0) return null;

  return (
    <div className={cn(
      "fixed bottom-4 left-1/2 -translate-x-1/2 z-50",
      "bg-card border border-border rounded-full shadow-lg",
      "flex items-center gap-3 px-4 py-2"
    )}>
      <div className="flex items-center gap-2">
        <Scale className="h-5 w-5 text-primary" />
        <span className="font-medium text-sm">
          {comparisonCount} {language === 'ar' ? 'منتجات للمقارنة' : 'items to compare'}
        </span>
      </div>
      
      <Link to="/compare">
        <Button size="sm" className="rounded-full">
          {language === 'ar' ? 'قارن الآن' : 'Compare Now'}
        </Button>
      </Link>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={clearComparison}
        className="h-8 w-8 rounded-full"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
