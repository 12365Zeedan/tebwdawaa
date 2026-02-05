import React from 'react';
import { CategoryCard } from '@/components/store/CategoryCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCategories } from '@/hooks/useCategories';
import { Skeleton } from '@/components/ui/skeleton';

export function CategoriesSection() {
  const { t } = useLanguage();
  const { data: categories, isLoading } = useCategories();

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('categories.title')}
          </h2>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] w-full rounded-2xl" />
            ))
          ) : (
            categories?.map((category, index) => (
              <div
                key={category.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CategoryCard category={{
                  id: category.id,
                  name: category.name,
                  nameAr: category.name_ar,
                  icon: category.icon || 'pill',
                  productCount: 0,
                  image: category.image_url || '/placeholder.svg'
                }} />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
