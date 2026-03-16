import React from 'react';
import { Sparkles } from 'lucide-react';
import { ProductCarouselSection } from './ProductCarouselSection';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useProducts } from '@/hooks/useProducts';

export function FeaturedProducts() {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const { data: products, isLoading } = useProducts({ featured: true, limit: 8 });
  const heading = theme.content.sectionHeadings.featured;

  return (
    <ProductCarouselSection
      title={language === 'ar' ? heading?.titleAr : heading?.titleEn}
      products={products}
      isLoading={isLoading}
      viewAllLink="/products"
      viewAllLabel={t('products.viewAll')}
    />
  );
}
