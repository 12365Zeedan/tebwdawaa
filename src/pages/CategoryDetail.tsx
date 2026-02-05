import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCategoryById, useSubcategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/store/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight, ChevronLeft, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const CategoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { language, direction } = useLanguage();
  const Chevron = direction === 'rtl' ? ChevronLeft : ChevronRight;
  
  const { data: category, isLoading: categoryLoading } = useCategoryById(id || '');
  const { data: subcategories, isLoading: subcategoriesLoading } = useSubcategories(id || null);
  const { data: products, isLoading: productsLoading } = useProducts({ categoryId: id });

  const categoryName = category ? (language === 'ar' ? category.name_ar : category.name) : '';

  return (
    <MainLayout>
      <div className="container py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">
            {language === 'ar' ? 'الرئيسية' : 'Home'}
          </Link>
          <Chevron className="h-4 w-4" />
          <Link to="/categories" className="hover:text-foreground transition-colors">
            {language === 'ar' ? 'الأقسام' : 'Categories'}
          </Link>
          <Chevron className="h-4 w-4" />
          <span className="text-foreground font-medium">{categoryName}</span>
        </nav>

        {/* Category Header */}
        {categoryLoading ? (
          <Skeleton className="h-12 w-64 mb-8" />
        ) : (
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {categoryName}
            </h1>
          </div>
        )}

        {/* Subcategories */}
        {(subcategoriesLoading || (subcategories && subcategories.length > 0)) && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              {language === 'ar' ? 'الأقسام الفرعية' : 'Subcategories'}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {subcategoriesLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))
              ) : (
                subcategories?.map((sub) => (
                  <Link
                    key={sub.id}
                    to={`/categories/${sub.id}`}
                    className="group"
                  >
                    <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full min-h-[96px]">
                        {sub.image_url ? (
                          <img
                            src={sub.image_url}
                            alt={language === 'ar' ? sub.name_ar : sub.name}
                            className="w-12 h-12 object-cover rounded-lg mb-2"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-muted-foreground mb-2" />
                        )}
                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {language === 'ar' ? sub.name_ar : sub.name}
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </section>
        )}

        {/* Products */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            {language === 'ar' ? 'المنتجات' : 'Products'}
          </h2>
          
          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
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
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {language === 'ar' ? 'لا توجد منتجات في هذا القسم' : 'No products in this category'}
              </p>
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
};

export default CategoryDetail;
