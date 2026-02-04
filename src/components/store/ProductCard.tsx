import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { language, t } = useLanguage();
  const { addToCart } = useCart();

  const name = language === 'ar' ? product.nameAr : product.name;
  const category = language === 'ar' ? product.categoryAr : product.category;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      nameAr: product.nameAr,
      price: product.price,
      image: product.image,
    });
  };

  return (
    <div className="product-card group bg-card rounded-2xl overflow-hidden border border-border/50 shadow-soft">
      {/* Image */}
      <Link to={`/products/${product.id}`} className="block relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          {product.originalPrice && (
            <Badge variant="destructive" className="text-xs font-semibold">
              {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
            </Badge>
          )}
          {product.requiresPrescription && (
            <Badge variant="secondary" className="text-xs gap-1">
              <AlertCircle className="h-3 w-3" />
              {t('products.prescription')}
            </Badge>
          )}
        </div>

        {!product.inStock && (
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
        <Link to={`/products/${product.id}`}>
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
            ({product.reviewCount})
          </span>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-foreground">
              {product.price} {t('common.currency')}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {product.originalPrice}
              </span>
            )}
          </div>
          
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={cn(
              'gap-2 transition-all',
              product.inStock && 'hover:shadow-glow'
            )}
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="sr-only md:not-sr-only">{t('products.addToCart')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
