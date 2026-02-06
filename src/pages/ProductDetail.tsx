import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Star, AlertCircle, Minus, Plus, Check, Package, Sparkles, Flame, TrendingUp } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useProduct } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';
import { ProductReviews } from '@/components/store/ProductReviews';
import { YouMayAlsoLike } from '@/components/store/YouMayAlsoLike';
import { WishlistButton } from '@/components/store/WishlistButton';
import { CompareButton } from '@/components/store/CompareButton';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { cn } from '@/lib/utils';
import { getDisplayPrice } from '@/lib/vat';
 
 export default function ProductDetail() {
   const { slug } = useParams<{ slug: string }>();
   const { language, t } = useLanguage();
   const { addToCart } = useCart();
   const { toast } = useToast();
  const { data: product, isLoading, error } = useProduct(slug || '');
  const { addToRecentlyViewed } = useRecentlyViewed();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Track recently viewed
  React.useEffect(() => {
    if (product?.id) {
      addToRecentlyViewed(product.id);
    }
  }, [product?.id, addToRecentlyViewed]);
 
  const handleAddToCart = () => {
    if (!product) return;
    
    const pricing = getDisplayPrice(product.price, product.vat_enabled);
    
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        nameAr: product.name_ar,
        price: pricing.totalPrice,
        basePrice: product.price,
        vatEnabled: product.vat_enabled,
        image: product.image_url || '/placeholder.svg',
      });
    }
     
     toast({
       title: language === 'ar' ? 'تمت الإضافة للسلة' : 'Added to Cart',
       description: language === 'ar' 
         ? `تمت إضافة ${quantity} ${product.name_ar} إلى سلة التسوق`
         : `${quantity} ${product.name} added to your cart`,
     });
     setQuantity(1);
   };
 
   const incrementQuantity = () => {
     if (product && quantity < product.stock_quantity) {
       setQuantity(q => q + 1);
     }
   };
 
   const decrementQuantity = () => {
     if (quantity > 1) {
       setQuantity(q => q - 1);
     }
   };
 
   if (isLoading) {
     return (
       <MainLayout>
         <div className="container mx-auto px-4 py-8">
           <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
             <Skeleton className="aspect-square rounded-2xl" />
             <div className="space-y-4">
               <Skeleton className="h-8 w-32" />
               <Skeleton className="h-10 w-3/4" />
               <Skeleton className="h-6 w-24" />
               <Skeleton className="h-24 w-full" />
               <Skeleton className="h-12 w-40" />
               <Skeleton className="h-14 w-full" />
             </div>
           </div>
         </div>
       </MainLayout>
     );
   }
 
   if (error || !product) {
     return (
       <MainLayout>
         <div className="container mx-auto px-4 py-16 text-center">
           <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
           <h1 className="text-2xl font-bold mb-2">
             {language === 'ar' ? 'المنتج غير موجود' : 'Product Not Found'}
           </h1>
           <p className="text-muted-foreground mb-6">
             {language === 'ar' 
               ? 'عذراً، لم نتمكن من العثور على هذا المنتج'
               : "Sorry, we couldn't find this product"}
           </p>
           <Button asChild>
             <Link to="/products">
               <ArrowLeft className="h-4 w-4 me-2" />
               {language === 'ar' ? 'العودة للمنتجات' : 'Back to Products'}
             </Link>
           </Button>
         </div>
       </MainLayout>
     );
   }
 
   const name = language === 'ar' ? product.name_ar : product.name;
   const description = language === 'ar' ? product.description_ar : product.description;
   const categoryName = product.category 
     ? (language === 'ar' ? product.category.name_ar : product.category.name)
     : '';
   
   const images = product.images?.length 
     ? product.images 
     : [product.image_url || '/placeholder.svg'];
 
   const discountPercent = product.original_price 
     ? Math.round((1 - product.price / product.original_price) * 100)
     : 0;
 
   return (
     <MainLayout>
       <div className="container mx-auto px-4 py-8">
         {/* Back Button */}
         <Link 
           to="/products" 
           className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
         >
           <ArrowLeft className="h-4 w-4 me-2" />
           {language === 'ar' ? 'العودة للمنتجات' : 'Back to Products'}
         </Link>
 
         <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
           {/* Image Gallery */}
           <div className="space-y-4">
             <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
               <img
                 src={images[selectedImage]}
                 alt={name}
                 className="w-full h-full object-cover"
               />
               {discountPercent > 0 && (
                 <Badge variant="destructive" className="absolute top-4 start-4 text-sm font-semibold">
                   {discountPercent}% OFF
                 </Badge>
               )}
               {product.requires_prescription && (
                 <Badge variant="secondary" className="absolute top-4 end-4 gap-1">
                   <AlertCircle className="h-3 w-3" />
                   {t('products.prescription')}
                 </Badge>
               )}
               {!product.in_stock && (
                 <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
                   <span className="text-background font-semibold text-xl">
                     {t('products.outOfStock')}
                   </span>
                 </div>
               )}
             </div>
             
             {/* Thumbnail Gallery */}
             {images.length > 1 && (
               <div className="flex gap-2 overflow-x-auto pb-2">
                 {images.map((img, idx) => (
                   <button
                     key={idx}
                     onClick={() => setSelectedImage(idx)}
                     className={cn(
                       "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors",
                       selectedImage === idx 
                         ? "border-primary" 
                         : "border-transparent hover:border-muted-foreground/50"
                     )}
                   >
                     <img src={img} alt="" className="w-full h-full object-cover" />
                   </button>
                 ))}
               </div>
             )}
           </div>
 
            {/* Product Info */}
            <div className="space-y-6">
              {/* Product Flags */}
              <div className="flex flex-wrap gap-2">
                {product.is_new_arrival && (
                  <Badge className="text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white gap-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    {language === 'ar' ? 'جديد' : 'New Arrival'}
                  </Badge>
                )}
                {product.is_best_seller && (
                  <Badge className="text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white gap-1">
                    <Flame className="h-3.5 w-3.5" />
                    {language === 'ar' ? 'الأكثر مبيعاً' : 'Best Seller'}
                  </Badge>
                )}
                {product.is_featured && (
                  <Badge className="text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white gap-1">
                    <TrendingUp className="h-3.5 w-3.5" />
                    {language === 'ar' ? 'مميز' : 'Featured'}
                  </Badge>
                )}
              </div>

              {/* Category */}
              {categoryName && (
                <span className="text-sm font-medium text-primary uppercase tracking-wide">
                  {categoryName}
                </span>
              )}
 
             {/* Name */}
             <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
               {name}
             </h1>
 
             {/* Rating */}
             <div className="flex items-center gap-3">
               <div className="flex items-center gap-1">
                 {[...Array(5)].map((_, i) => (
                   <Star
                     key={i}
                     className={cn(
                       "h-5 w-5",
                       i < Math.floor(product.rating)
                         ? "fill-warning text-warning"
                         : "fill-muted text-muted"
                     )}
                   />
                 ))}
               </div>
               <span className="font-medium">{product.rating}</span>
               <span className="text-muted-foreground">
                 ({product.review_count} {language === 'ar' ? 'تقييم' : 'reviews'})
               </span>
             </div>
 
            {/* Price */}
            <div className="space-y-2">
              {product.vat_enabled ? (
                <>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-foreground">
                      {getDisplayPrice(product.price, true).totalPrice} {t('common.currency')}
                    </span>
                    {product.original_price && (
                      <span className="text-xl text-muted-foreground line-through">
                        {getDisplayPrice(product.original_price, true).totalPrice} {t('common.currency')}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-0.5">
                    <p>{language === 'ar' ? 'السعر بدون ضريبة:' : 'Price excl. VAT:'} {product.price} {t('common.currency')}</p>
                    <p>{language === 'ar' ? 'ضريبة القيمة المضافة (15%):' : 'VAT (15%):'} {getDisplayPrice(product.price, true).vatAmount} {t('common.currency')}</p>
                  </div>
                </>
              ) : (
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-foreground">
                    {product.price} {t('common.currency')}
                  </span>
                  {product.original_price && (
                    <span className="text-xl text-muted-foreground line-through">
                      {product.original_price} {t('common.currency')}
                    </span>
                  )}
                </div>
              )}
            </div>
 
             {/* Stock Status */}
             <div className="flex items-center gap-2">
               {product.in_stock ? (
                 <>
                   <Check className="h-5 w-5 text-primary" />
                   <span className="text-primary font-medium">
                     {language === 'ar' ? 'متوفر في المخزون' : 'In Stock'}
                     {product.stock_quantity > 0 && (
                       <span className="text-muted-foreground font-normal ms-1">
                         ({product.stock_quantity} {language === 'ar' ? 'قطعة' : 'units'})
                       </span>
                     )}
                   </span>
                 </>
               ) : (
                 <span className="text-destructive font-medium">
                   {t('products.outOfStock')}
                 </span>
               )}
             </div>
 
             {/* Description */}
             {description && (
               <div className="prose prose-sm max-w-none">
                 <h3 className="text-lg font-semibold mb-2">
                   {language === 'ar' ? 'الوصف' : 'Description'}
                 </h3>
                 <p className="text-muted-foreground leading-relaxed">
                   {description}
                 </p>
               </div>
             )}
 
             {/* Quantity & Add to Cart */}
             <div className="space-y-4 pt-4 border-t">
               <div className="flex items-center gap-4">
                 <span className="font-medium">
                   {language === 'ar' ? 'الكمية:' : 'Quantity:'}
                 </span>
                 <div className="flex items-center border rounded-lg">
                   <Button
                     variant="ghost"
                     size="icon"
                     onClick={decrementQuantity}
                     disabled={quantity <= 1}
                     className="h-10 w-10"
                   >
                     <Minus className="h-4 w-4" />
                   </Button>
                   <span className="w-12 text-center font-medium">{quantity}</span>
                   <Button
                     variant="ghost"
                     size="icon"
                     onClick={incrementQuantity}
                     disabled={!product.in_stock || quantity >= product.stock_quantity}
                     className="h-10 w-10"
                   >
                     <Plus className="h-4 w-4" />
                   </Button>
                 </div>
               </div>
 
               <Button
                 size="lg"
                 onClick={handleAddToCart}
                 disabled={!product.in_stock}
                 className="w-full gap-2 h-14 text-lg"
               >
                 <ShoppingCart className="h-5 w-5" />
                 {t('products.addToCart')}
                 {quantity > 1 && ` (${quantity})`}
               </Button>
 
                {product.requires_prescription && (
                  <p className="text-sm text-muted-foreground flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    {language === 'ar'
                      ? 'هذا المنتج يتطلب وصفة طبية. سيتم التحقق من الوصفة عند الاستلام.'
                      : 'This product requires a prescription. Verification will be done upon delivery.'}
                  </p>
                )}

                <div className="flex gap-2">
                  <WishlistButton productId={product.id} variant="default" className="flex-1" />
                  <CompareButton productId={product.id} variant="default" />
                </div>
              </div>
            </div>
            </div>

          {/* Reviews Section */}
          <Separator className="my-12" />
          <ProductReviews productId={product.id} />

          {/* You May Also Like Section */}
          <Separator className="my-12" />
          <YouMayAlsoLike 
            currentProductId={product.id} 
            categoryId={product.category_id} 
          />
        </div>
      </MainLayout>
    );
  }