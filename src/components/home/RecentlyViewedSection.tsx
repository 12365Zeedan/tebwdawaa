import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/store/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useProducts } from '@/hooks/useProducts';

export function RecentlyViewedSection() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const { recentIds } = useRecentlyViewed();
  const { data: allProducts, isLoading } = useProducts();
  const heading = theme.content.sectionHeadings.recentlyViewed;

  // Get recently viewed products in order
  const recentProducts = recentIds
    .map(id => allProducts?.find(p => p.id === id))
    .filter(Boolean)
    .slice(0, 4);

  // Don't show section if no recently viewed products
  if (recentIds.length === 0 || (!isLoading && recentProducts.length === 0)) {
    return null;
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Clock className="h-7 w-7 text-primary" />
            <h2 className="text-2xl md:text-3xl font-bold">
              {language === 'ar' ? heading?.titleAr : heading?.titleEn}
            </h2>
          </div>
          <Link to="/products">
            <Button variant="ghost" className="gap-2">
              {language === 'ar' ? 'عرض الكل' : 'View All'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recentProducts.map((product) => (
              <ProductCard key={product!.id} product={product!} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
