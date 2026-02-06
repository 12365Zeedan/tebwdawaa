import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Scale, X, Star, Check, AlertCircle, ShoppingCart } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProductComparison } from '@/hooks/useProductComparison';
import { useProducts } from '@/hooks/useProducts';
import { getDisplayPrice } from '@/lib/vat';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function Compare() {
  const { language, t } = useLanguage();
  const { comparisonIds, removeFromComparison, clearComparison } = useProductComparison();
  const { data: allProducts, isLoading } = useProducts();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const products = allProducts?.filter(p => comparisonIds.includes(p.id)) || [];

  const handleAddToCart = (product: typeof products[0]) => {
    if (!product.in_stock) {
      toast({
        title: language === 'ar' ? 'غير متوفر' : 'Out of Stock',
        variant: 'destructive',
      });
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      nameAr: product.name_ar,
      price: getDisplayPrice(product.price, product.vat_enabled).totalPrice,
      basePrice: product.price,
      vatEnabled: product.vat_enabled,
      image: product.image_url || '/placeholder.svg',
    });

    toast({
      title: language === 'ar' ? 'تمت الإضافة للسلة' : 'Added to Cart',
    });
  };

  const comparisonAttributes = [
    { 
      key: 'price', 
      label: language === 'ar' ? 'السعر' : 'Price',
      render: (p: typeof products[0]) => (
        <div className="flex flex-col items-center">
          <span className="font-bold text-lg">{p.price} {t('common.currency')}</span>
          {p.original_price && (
            <span className="text-sm text-muted-foreground line-through">
              {p.original_price} {t('common.currency')}
            </span>
          )}
        </div>
      )
    },
    { 
      key: 'rating', 
      label: language === 'ar' ? 'التقييم' : 'Rating',
      render: (p: typeof products[0]) => (
        <div className="flex items-center gap-1 justify-center">
          <Star className="h-4 w-4 fill-warning text-warning" />
          <span className="font-medium">{p.rating}</span>
          <span className="text-muted-foreground text-sm">({p.review_count})</span>
        </div>
      )
    },
    { 
      key: 'availability', 
      label: language === 'ar' ? 'التوفر' : 'Availability',
      render: (p: typeof products[0]) => (
        <div className="flex items-center gap-1 justify-center">
          {p.in_stock ? (
            <>
              <Check className="h-4 w-4 text-primary" />
              <span className="text-primary font-medium">
                {language === 'ar' ? 'متوفر' : 'In Stock'}
              </span>
            </>
          ) : (
            <span className="text-destructive font-medium">
              {t('products.outOfStock')}
            </span>
          )}
        </div>
      )
    },
    { 
      key: 'prescription', 
      label: language === 'ar' ? 'وصفة طبية' : 'Prescription',
      render: (p: typeof products[0]) => (
        <div className="flex items-center gap-1 justify-center">
          {p.requires_prescription ? (
            <>
              <AlertCircle className="h-4 w-4 text-warning" />
              <span className="text-warning font-medium">
                {language === 'ar' ? 'مطلوب' : 'Required'}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">
              {language === 'ar' ? 'غير مطلوب' : 'Not Required'}
            </span>
          )}
        </div>
      )
    },
    { 
      key: 'category', 
      label: language === 'ar' ? 'الفئة' : 'Category',
      render: (p: typeof products[0]) => (
        <span className="text-sm">
          {p.category ? (language === 'ar' ? p.category.name_ar : p.category.name) : '-'}
        </span>
      )
    },
  ];

  if (comparisonIds.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Scale className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">
            {language === 'ar' ? 'لا توجد منتجات للمقارنة' : 'No Products to Compare'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {language === 'ar' 
              ? 'أضف منتجات للمقارنة من صفحة المنتجات'
              : 'Add products to compare from the products page'}
          </p>
          <Button asChild>
            <Link to="/products">
              {language === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
            </Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <Link 
          to="/products" 
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 me-2" />
          {language === 'ar' ? 'العودة للمنتجات' : 'Back to Products'}
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Scale className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">
              {language === 'ar' ? 'مقارنة المنتجات' : 'Compare Products'}
            </h1>
          </div>
          <Button variant="outline" onClick={clearComparison}>
            {language === 'ar' ? 'مسح الكل' : 'Clear All'}
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {comparisonIds.map(id => (
              <Skeleton key={id} className="h-96 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr>
                  <th className="p-4 text-left w-32"></th>
                  {products.map(product => (
                    <th key={product.id} className="p-4 text-center align-top">
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromComparison(product.id)}
                          className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-muted"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Link to={`/products/${product.slug}`}>
                          <img
                            src={product.image_url || '/placeholder.svg'}
                            alt={language === 'ar' ? product.name_ar : product.name}
                            className="w-32 h-32 object-cover rounded-xl mx-auto mb-3"
                          />
                          <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">
                            {language === 'ar' ? product.name_ar : product.name}
                          </h3>
                        </Link>
                        {product.original_price && (
                          <Badge variant="destructive" className="mt-2 text-xs">
                            {Math.round((1 - product.price / product.original_price) * 100)}% OFF
                          </Badge>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonAttributes.map((attr, idx) => (
                  <tr key={attr.key} className={cn(idx % 2 === 0 && 'bg-muted/30')}>
                    <td className="p-4 font-medium text-muted-foreground">
                      {attr.label}
                    </td>
                    {products.map(product => (
                      <td key={product.id} className="p-4 text-center">
                        {attr.render(product)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="p-4"></td>
                  {products.map(product => (
                    <td key={product.id} className="p-4 text-center">
                      <Button
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.in_stock}
                        className="gap-2"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {t('products.addToCart')}
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
