import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useCategories } from '@/hooks/useCategories';
import { Skeleton } from '@/components/ui/skeleton';
import { optimizeImageUrl } from '@/lib/imageUtils';
import { cn } from '@/lib/utils';

export function CategoriesSection() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const { data: categories, isLoading } = useCategories();
  const heading = theme.content.sectionHeadings.categories;
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 200;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className="py-8 md:py-12">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            {language === 'ar' ? heading?.titleAr : heading?.titleEn}
          </h2>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => scroll('left')} className="h-8 w-8 rounded-full">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => scroll('right')} className="h-8 w-8 rounded-full">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
                  <Skeleton className="w-20 h-20 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))
            : categories?.map((cat) => {
                const name = language === 'ar' ? cat.name_ar : cat.name;
                return (
                  <Link
                    key={cat.id}
                    to={`/categories/${cat.id}`}
                    className="flex flex-col items-center gap-2 flex-shrink-0 group"
                  >
                    <div className={cn(
                      'w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-border',
                      'transition-all duration-300 group-hover:border-primary group-hover:shadow-glow'
                    )}>
                      <img
                        src={optimizeImageUrl(cat.image_url || '/placeholder.svg', 96)}
                        alt={name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-xs md:text-sm font-medium text-foreground text-center max-w-[80px] truncate group-hover:text-primary transition-colors">
                      {name}
                    </span>
                  </Link>
                );
              })}
        </div>
      </div>
    </section>
  );
}
