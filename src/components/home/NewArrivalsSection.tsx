import React from 'react';
import { Sparkles } from 'lucide-react';
import { ProductCarouselSection } from './ProductCarouselSection';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useProducts } from '@/hooks/useProducts';

export function NewArrivalsSection() {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const { data: products, isLoading } = useProducts({ newArrivals: true, limit: 8 });
  const heading = theme.content.sectionHeadings.newArrivals;

  return (
    <ProductCarouselSection
      title={language === 'ar' ? heading?.titleAr : heading?.titleEn}
      icon={<div className="p-1.5 rounded-lg bg-primary/10"><Sparkles className="h-5 w-5 text-primary" /></div>}
      products={products}
      isLoading={isLoading}
      viewAllLink="/products?filter=new"
      viewAllLabel={t('products.viewAll')}
      bgClass="bg-primary/5"
    />
  );
}
