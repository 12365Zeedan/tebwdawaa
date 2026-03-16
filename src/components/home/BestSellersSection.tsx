import React from 'react';
import { TrendingUp } from 'lucide-react';
import { ProductCarouselSection } from './ProductCarouselSection';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useProducts } from '@/hooks/useProducts';

export function BestSellersSection() {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const { data: products, isLoading } = useProducts({ bestSellers: true, limit: 8 });
  const heading = theme.content.sectionHeadings.bestSellers;

  return (
    <ProductCarouselSection
      title={language === 'ar' ? heading?.titleAr : heading?.titleEn}
      icon={<div className="p-1.5 rounded-lg bg-accent/10"><TrendingUp className="h-5 w-5 text-accent" /></div>}
      products={products}
      isLoading={isLoading}
      viewAllLink="/products?filter=bestseller"
      viewAllLabel={t('products.viewAll')}
    />
  );
}
