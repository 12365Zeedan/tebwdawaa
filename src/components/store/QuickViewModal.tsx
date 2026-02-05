import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, AlertCircle, Minus, Plus, Check, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { WishlistButton } from './WishlistButton';
import { CompareButton } from './CompareButton';
import { Product } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';

interface QuickViewModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickViewModal({ product, open, onOpenChange }: QuickViewModalProps) {
  const { language, t } = useLanguage();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) return null;

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

  const handleAddToCart = () => {
    if (!product.in_stock) {
      toast({
        title: language === 'ar' ? 'غير متوفر' : 'Out of Stock',
        variant: 'destructive',
      });
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        nameAr: product.name_ar,
        price: product.price,
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
    onOpenChange(false);
  };

  const incrementQuantity = () => {
    if (quantity < product.stock_quantity) {
      setQuantity(q => q + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <DialogTitle className="sr-only">{name}</DialogTitle>
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="relative bg-muted">
            <div className="aspect-square">
              <img
                src={images[selectedImage]}
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>
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
            
            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-4 right-4 flex gap-2 justify-center">
                {images.slice(0, 4).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={cn(
                      "w-12 h-12 rounded-lg overflow-hidden border-2 transition-colors bg-background",
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

          {/* Content Section */}
          <div className="p-6 flex flex-col">
            {/* Category */}
            {categoryName && (
              <span className="text-xs font-medium text-primary uppercase tracking-wide mb-2">
                {categoryName}
              </span>
            )}

            {/* Name */}
            <h2 className="text-xl font-bold text-foreground mb-3">
              {name}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < Math.floor(product.rating)
                        ? "fill-warning text-warning"
                        : "fill-muted text-muted"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-sm text-muted-foreground">
                ({product.review_count} {language === 'ar' ? 'تقييم' : 'reviews'})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl font-bold text-foreground">
                {product.price} {t('common.currency')}
              </span>
              {product.original_price && (
                <span className="text-lg text-muted-foreground line-through">
                  {product.original_price} {t('common.currency')}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 mb-4">
              {product.in_stock ? (
                <>
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm text-primary font-medium">
                    {language === 'ar' ? 'متوفر' : 'In Stock'}
                    {product.stock_quantity > 0 && (
                      <span className="text-muted-foreground font-normal ms-1">
                        ({product.stock_quantity} {language === 'ar' ? 'قطعة' : 'units'})
                      </span>
                    )}
                  </span>
                </>
              ) : (
                <span className="text-sm text-destructive font-medium">
                  {t('products.outOfStock')}
                </span>
              )}
            </div>

            {/* Description */}
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                {description}
              </p>
            )}

            {/* Quantity & Add to Cart */}
            <div className="space-y-3 mt-auto">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  {language === 'ar' ? 'الكمية:' : 'Qty:'}
                </span>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="h-8 w-8"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={incrementQuantity}
                    disabled={!product.in_stock || quantity >= product.stock_quantity}
                    className="h-8 w-8"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={!product.in_stock}
                className="w-full gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                {t('products.addToCart')}
                {quantity > 1 && ` (${quantity})`}
              </Button>

              <div className="flex gap-2">
                <WishlistButton productId={product.id} variant="default" className="flex-1" />
                <CompareButton productId={product.id} variant="default" />
              </div>

              <Link 
                to={`/products/${product.slug}`}
                onClick={() => onOpenChange(false)}
                className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                {language === 'ar' ? 'عرض التفاصيل الكاملة' : 'View Full Details'}
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
