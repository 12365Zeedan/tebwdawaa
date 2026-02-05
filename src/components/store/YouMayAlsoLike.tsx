import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProductCard } from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

interface YouMayAlsoLikeProps {
  currentProductId: string;
  categoryId: string | null;
}

export function YouMayAlsoLike({ currentProductId, categoryId }: YouMayAlsoLikeProps) {
  const { language } = useLanguage();

  const { data: products, isLoading } = useQuery({
    queryKey: ['related-products', currentProductId, categoryId],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, name_ar)
        `)
        .eq('is_active', true)
        .neq('id', currentProductId)
        .limit(4);

      // Prioritize same category products
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query.order('rating', { ascending: false });

      if (error) throw error;

      // If not enough products from same category, fetch more from other categories
      if (data.length < 4 && categoryId) {
        const { data: moreProducts } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(id, name, name_ar)
          `)
          .eq('is_active', true)
          .neq('id', currentProductId)
          .neq('category_id', categoryId)
          .order('rating', { ascending: false })
          .limit(4 - data.length);

        if (moreProducts) {
          return [...data, ...moreProducts];
        }
      }

      return data;
    },
    enabled: !!currentProductId,
  });

  if (isLoading) {
    return (
      <section className="py-8">
        <h2 className="text-2xl font-bold mb-6">
          {language === 'ar' ? 'قد يعجبك أيضاً' : 'You May Also Like'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-6">
        {language === 'ar' ? 'قد يعجبك أيضاً' : 'You May Also Like'}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <ProductCard
              product={{
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
                inStock: product.in_stock ?? true,
                requiresPrescription: product.requires_prescription ?? false,
                rating: Number(product.rating),
                reviewCount: product.review_count ?? 0,
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
