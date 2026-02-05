import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProductCard } from '@/components/store/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { ProductFiltersSheet, ProductSortSelect, type ProductFilters } from '@/components/store/ProductFilters';
import { BarcodeScanner } from '@/components/store/BarcodeScanner';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const Products = () => {
  const { language, t, direction } = useLanguage();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ProductFilters>({});
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);

  const { data: categories } = useCategories();
  const { data: products, isLoading: productsLoading } = useProducts({
    categoryId: filters.categoryId || undefined,
    searchQuery: searchQuery || undefined,
    barcode: scannedBarcode || undefined,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    inStockOnly: filters.inStockOnly,
    requiresPrescription: filters.requiresPrescription,
    sortBy: filters.sortBy,
  });

  // Calculate max price for filter slider
  const maxPriceLimit = useMemo(() => {
    if (!products || products.length === 0) return 1000;
    return Math.ceil(Math.max(...products.map(p => Number(p.price))) / 100) * 100 || 1000;
  }, [products]);

  const handleBarcodeScanned = (barcode: string) => {
    setScannedBarcode(barcode);
    setSearchQuery(barcode);
    toast({
      title: language === 'ar' ? 'تم المسح' : 'Scanned',
      description: language === 'ar' ? `الباركود: ${barcode}` : `Barcode: ${barcode}`,
    });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setScannedBarcode(null);
  };

  const handleCategoryClick = (categoryId: string | null) => {
    setFilters(prev => ({ ...prev, categoryId: categoryId || undefined }));
  };

  const handleSortChange = (sortBy: string) => {
    setFilters(prev => ({ ...prev, sortBy: sortBy as ProductFilters['sortBy'] }));
  };

  const activeFilterCount = [
    filters.minPrice !== undefined,
    filters.maxPrice !== undefined,
    filters.inStockOnly,
    filters.requiresPrescription,
  ].filter(Boolean).length;

  return (
    <MainLayout>
      <div className="container py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('nav.products')}
          </h1>
          
          {/* Search & Filters */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Input with Barcode Scanner */}
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className={cn(
                  'absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground',
                  direction === 'rtl' ? 'right-3' : 'left-3'
                )} />
                <Input
                  type="search"
                  placeholder={language === 'ar' ? 'ابحث بالاسم أو الباركود...' : 'Search by name or barcode...'}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setScannedBarcode(null);
                  }}
                  className={cn(
                    'bg-muted/50',
                    direction === 'rtl' ? 'pr-10 pl-10' : 'pl-10 pr-10'
                  )}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'absolute top-1/2 -translate-y-1/2 h-6 w-6',
                      direction === 'rtl' ? 'left-2' : 'right-2'
                    )}
                    onClick={handleClearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Barcode Scanner */}
              <BarcodeScanner onScan={handleBarcodeScanned} />

              {/* Sort Select */}
              <ProductSortSelect
                value={filters.sortBy}
                onChange={handleSortChange}
              />

              {/* Filters Sheet */}
              <ProductFiltersSheet
                filters={filters}
                onFiltersChange={setFilters}
                categories={categories}
                maxPriceLimit={maxPriceLimit}
              />
            </div>

            {/* Active filters display */}
            {(scannedBarcode || activeFilterCount > 0) && (
              <div className="flex flex-wrap items-center gap-2">
                {scannedBarcode && (
                  <Badge variant="secondary" className="gap-1">
                    {language === 'ar' ? 'باركود:' : 'Barcode:'} {scannedBarcode}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => {
                        setScannedBarcode(null);
                        setSearchQuery('');
                      }}
                    />
                  </Badge>
                )}
                {filters.inStockOnly && (
                  <Badge variant="secondary" className="gap-1">
                    {language === 'ar' ? 'متوفر فقط' : 'In Stock'}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setFilters(prev => ({ ...prev, inStockOnly: undefined }))}
                    />
                  </Badge>
                )}
                {filters.requiresPrescription && (
                  <Badge variant="secondary" className="gap-1">
                    {language === 'ar' ? 'يحتاج وصفة' : 'Prescription'}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setFilters(prev => ({ ...prev, requiresPrescription: undefined }))}
                    />
                  </Badge>
                )}
                {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
                  <Badge variant="secondary" className="gap-1">
                    {language === 'ar' ? 'السعر:' : 'Price:'} {filters.minPrice || 0} - {filters.maxPrice || maxPriceLimit}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setFilters(prev => ({ ...prev, minPrice: undefined, maxPrice: undefined }))}
                    />
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Badge
            variant={!filters.categoryId ? 'default' : 'outline'}
            className="cursor-pointer px-4 py-2"
            onClick={() => handleCategoryClick(null)}
          >
            {language === 'ar' ? 'الكل' : 'All'}
          </Badge>
          {categories?.map(category => {
            const name = language === 'ar' ? category.name_ar : category.name;
            return (
              <Badge
                key={category.id}
                variant={filters.categoryId === category.id ? 'default' : 'outline'}
                className="cursor-pointer px-4 py-2"
                onClick={() => handleCategoryClick(category.id)}
              >
                {name}
              </Badge>
            );
          })}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productsLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
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
            ))
          )}
        </div>

        {!productsLoading && products?.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              {language === 'ar' ? 'لا توجد منتجات' : 'No products found'}
            </p>
            {(searchQuery || scannedBarcode || activeFilterCount > 0) && (
              <Button
                variant="link"
                onClick={() => {
                  setSearchQuery('');
                  setScannedBarcode(null);
                  setFilters({});
                }}
                className="mt-2"
              >
                {language === 'ar' ? 'مسح جميع الفلاتر' : 'Clear all filters'}
              </Button>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Products;
