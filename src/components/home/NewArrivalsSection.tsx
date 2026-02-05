import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/store/ProductCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProducts } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';

export function NewArrivalsSection() {
  const { t, direction, language } = useLanguage();
  const Arrow = direction === 'rtl' ? ArrowLeft : ArrowRight;
  const { data: products, isLoading } = useProducts({ newArrivals: true, limit: 4 });

  if (!isLoading && (!products || products.length === 0)) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-transparent">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              {language === 'ar' ? 'وصل حديثاً' : 'New Arrivals'}
            </h2>
          </div>
          <Link to="/products?filter=new">
            <Button variant="ghost" className="gap-2 text-primary hover:text-primary">
              {t('products.viewAll')}
              <Arrow className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : (
            products?.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ProductCard product={{
                  id: product.id,
                  name: product.name,
                  nameAr: product.name_ar,
                  description: product.description || '',
                  descriptionAr: product.description_ar || '',
                  price: Number(product.price),
                  originalPrice: product.original_price ? Number(product.original_price) : undefined,
                  image: product.image_url || '/placeholder.svg',
                  category: product.category?.name || '',
                  categoryAr: product.category?.name_ar || '',
                  inStock: product.in_stock,
                  requiresPrescription: product.requires_prescription,
                  rating: Number(product.rating),
                  reviewCount: product.review_count
                }} />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
