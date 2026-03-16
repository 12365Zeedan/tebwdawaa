import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const scrollRef = useRef<HTMLDivElement>(null);

  const recentProducts = recentIds
    .map(id => allProducts?.find(p => p.id === id))
    .filter(Boolean)
    .slice(0, 8);

  if (recentIds.length === 0 || (!isLoading && recentProducts.length === 0)) {
    return null;
  }

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  return (
    <section className="py-8 md:py-12 bg-muted/30">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-xl md:text-2xl font-bold">
              {language === 'ar' ? heading?.titleAr : heading?.titleEn}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/products">
              <Button variant="ghost" size="sm" className="gap-1 text-sm">
                {language === 'ar' ? 'عرض الكل' : 'View All'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <div className="hidden md:flex gap-1">
              <Button variant="outline" size="icon" onClick={() => scroll('left')} className="h-8 w-8 rounded-full">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => scroll('right')} className="h-8 w-8 rounded-full">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isLoading
            ? [...Array(4)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[220px] md:w-[250px]">
                  <Skeleton className="aspect-square rounded-2xl" />
                </div>
              ))
            : recentProducts.map((product) => (
                <div key={product!.id} className="flex-shrink-0 w-[220px] md:w-[250px]">
                  <ProductCard product={product!} />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
