import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, AlertCircle, Eye, Sparkles, TrendingUp, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Product as LegacyProduct } from '@/types';
import { Product as DBProduct } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { WishlistButton } from './WishlistButton';
import { CompareButton } from './CompareButton';
import { QuickViewModal } from './QuickViewModal';

interface ProductCardProps {
  product: LegacyProduct | DBProduct;
}

function isDBProduct(product: LegacyProduct | DBProduct): product is DBProduct {
  return 'name_ar' in product;
}
 
export function ProductCard({ product }: ProductCardProps) {
  const { language, t } = useLanguage();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
 
   // Normalize product data for both legacy and DB formats
   const name = isDBProduct(product) 
     ? (language === 'ar' ? product.name_ar : product.name)
     : (language === 'ar' ? product.nameAr : product.name);
   
   const category = isDBProduct(product)
     ? (product.category ? (language === 'ar' ? product.category.name_ar : product.category.name) : '')
     : (language === 'ar' ? product.categoryAr : product.category);
   
   const image = isDBProduct(product) ? (product.image_url || '/placeholder.svg') : product.image;
   const inStock = isDBProduct(product) ? product.in_stock : product.inStock;
   const originalPrice = isDBProduct(product) ? product.original_price : product.originalPrice;
   const requiresPrescription = isDBProduct(product) ? product.requires_prescription : product.requiresPrescription;
   const reviewCount = isDBProduct(product) ? product.review_count : product.reviewCount;
  const slug = isDBProduct(product) ? product.slug : product.id;
  const nameAr = isDBProduct(product) ? product.name_ar : product.nameAr;
  const stockQuantity = isDBProduct(product) ? product.stock_quantity : null;
  const isNewArrival = isDBProduct(product) ? product.is_new_arrival : false;
  const isBestSeller = isDBProduct(product) ? product.is_best_seller : false;
  const isFeatured = isDBProduct(product) ? product.is_featured : false;

  const handleAddToCart = () => {
   // Check if out of stock
   if (!inStock || (stockQuantity !== null && stockQuantity <= 0)) {
     toast({
       title: language === 'ar' ? 'غير متوفر' : 'Out of Stock',
       description: language === 'ar' 
         ? 'هذا المنتج غير متوفر حالياً'
         : 'This product is currently out of stock',
       variant: 'destructive',
     });
     return;
   }

    addToCart({
      id: product.id,
      name: product.name,
       nameAr: nameAr,
      price: product.price,
       image: image,
    });
     
     toast({
       title: language === 'ar' ? 'تمت الإضافة للسلة' : 'Added to Cart',
       description: language === 'ar' 
         ? `تمت إضافة ${nameAr} إلى سلة التسوق`
         : `${product.name} added to your cart`,
     });
  };

  // For quick view, we need the full DBProduct format
  const dbProduct = isDBProduct(product) ? product : null;

  return (
    <>
    <div className="product-card group bg-card rounded-2xl overflow-hidden border border-border/50 shadow-soft">
      {/* Image */}
       <Link to={`/products/${slug}`} className="block relative aspect-square overflow-hidden">
        <img
           src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <div className="flex flex-col gap-1">
            {originalPrice && (
              <Badge variant="destructive" className="text-xs font-semibold">
                {Math.round((1 - product.price / originalPrice) * 100)}% OFF
              </Badge>
            )}
            {requiresPrescription && (
              <Badge variant="secondary" className="text-xs gap-1">
                <AlertCircle className="h-3 w-3" />
                {t('products.prescription')}
              </Badge>
            )}
          </div>
          <div className="flex gap-1">
            <WishlistButton productId={product.id} />
            <CompareButton productId={product.id} />
            {dbProduct && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setQuickViewOpen(true);
                }}
                className="h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm"
              >
                <Eye className="h-5 w-5 text-muted-foreground" />
              </Button>
            )}
          </div>
        </div>

         {!inStock && (
          <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
            <span className="text-background font-semibold text-lg">
              {t('products.outOfStock')}
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <span className="text-xs font-medium text-primary uppercase tracking-wide">
          {category}
        </span>

        {/* Name */}
         <Link to={`/products/${slug}`}>
          <h3 className="font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span className="text-sm font-medium">{product.rating}</span>
          </div>
          <span className="text-xs text-muted-foreground">
             ({reviewCount})
          </span>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-foreground">
              {product.price} {t('common.currency')}
            </span>
             {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                 {originalPrice}
              </span>
            )}
          </div>
          
          <Button
            size="sm"
            onClick={handleAddToCart}
             disabled={!inStock}
            className={cn(
              'gap-2 transition-all',
               inStock && 'hover:shadow-glow'
            )}
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="sr-only md:not-sr-only">{t('products.addToCart')}</span>
          </Button>
        </div>
      </div>
    </div>
    
    {dbProduct && (
      <QuickViewModal 
        product={dbProduct} 
        open={quickViewOpen} 
        onOpenChange={setQuickViewOpen} 
      />
    )}
    </>
  );
}
