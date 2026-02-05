 import React, { useState } from 'react';
 import { Search, Filter } from 'lucide-react';
 import { MainLayout } from '@/components/layout/MainLayout';
 import { ProductCard } from '@/components/store/ProductCard';
 import { Input } from '@/components/ui/input';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { Skeleton } from '@/components/ui/skeleton';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { useProducts } from '@/hooks/useProducts';
 import { useCategories } from '@/hooks/useCategories';
 import { cn } from '@/lib/utils';
 
 const Products = () => {
   const { language, t, direction } = useLanguage();
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
 
   const { data: categories } = useCategories();
   const { data: products, isLoading: productsLoading } = useProducts({
     categoryId: selectedCategory || undefined,
     searchQuery: searchQuery || undefined
   });
 
   return (
     <MainLayout>
       <div className="container py-8 md:py-12">
         {/* Header */}
         <div className="mb-8">
           <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
             {t('nav.products')}
           </h1>
           
           {/* Search & Filters */}
           <div className="flex flex-col md:flex-row gap-4">
             <div className="relative flex-1 max-w-md">
               <Search className={cn(
                 'absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground',
                 direction === 'rtl' ? 'right-3' : 'left-3'
               )} />
               <Input
                 type="search"
                 placeholder={t('products.search')}
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className={cn(
                   'bg-muted/50',
                   direction === 'rtl' ? 'pr-10' : 'pl-10'
                 )}
               />
             </div>
             <Button variant="outline" className="gap-2">
               <Filter className="h-4 w-4" />
               {t('common.filter')}
             </Button>
           </div>
         </div>
 
         {/* Categories */}
         <div className="flex flex-wrap gap-2 mb-8">
           <Badge
             variant={!selectedCategory ? 'default' : 'outline'}
             className="cursor-pointer px-4 py-2"
             onClick={() => setSelectedCategory(null)}
           >
             {language === 'ar' ? 'الكل' : 'All'}
           </Badge>
           {categories?.map(category => {
             const name = language === 'ar' ? category.name_ar : category.name;
             return (
               <Badge
                 key={category.id}
                 variant={selectedCategory === category.id ? 'default' : 'outline'}
                 className="cursor-pointer px-4 py-2"
                 onClick={() => setSelectedCategory(category.id)}
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
           </div>
         )}
       </div>
     </MainLayout>
   );
 };
 
 export default Products;
