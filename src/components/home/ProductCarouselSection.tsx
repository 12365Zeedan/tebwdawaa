import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/store/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import type { Product as DBProduct } from '@/hooks/useProducts';

interface ProductCarouselSectionProps {
  title: string;
  icon?: React.ReactNode;
  products?: DBProduct[];
  isLoading: boolean;
  viewAllLink: string;
  viewAllLabel: string;
  bgClass?: string;
}

export function ProductCarouselSection({
  title,
  icon,
  products,
  isLoading,
  viewAllLink,
  viewAllLabel,
  bgClass
}: ProductCarouselSectionProps) {
  const { direction } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const Arrow = direction === 'rtl' ? ArrowLeft : ArrowRight;

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  if (!isLoading && (!products || products.length === 0)) return null;

  return (
    <section className={cn("py-8 md:py-12 bg-white", bgClass)}>
      <div className="container bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-xl md:text-2xl font-bold text-foreground">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Link to={viewAllLink}>
              <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary text-sm">
                {viewAllLabel}
                <Arrow className="h-4 w-4" />
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

        {/* Carousel */}
        <div
          ref={scrollRef}
          className="gap-4 overflow-x-auto pb-4 flex items-start justify-center"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          
          {isLoading ?
          Array.from({ length: 6 }).map((_, i) =>
          <div key={i} className="flex-shrink-0 w-[220px] md:w-[250px] space-y-3">
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
          ) :
          products?.map((product) =>
          <div key={product.id} className="flex-shrink-0 w-[220px] md:w-[250px]">
                  <ProductCard
              product={product} />
            
                </div>
          )}
        </div>
      </div>
    </section>);

}