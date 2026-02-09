import React from 'react';
import { PageWidgets } from '@/components/widgets/PageWidgets';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { getDisplayPrice } from '@/lib/vat';

export default function Wishlist() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const { wishlistItems, isLoading, removeFromWishlist, isToggling } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (item: typeof wishlistItems[0]) => {
    if (!item.product.in_stock) {
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
      id: item.product.id,
      name: item.product.name,
      nameAr: item.product.name_ar,
      price: getDisplayPrice(item.product.price, item.product.vat_enabled).totalPrice,
      basePrice: item.product.price,
      vatEnabled: item.product.vat_enabled,
      image: item.product.image_url || '/placeholder.svg',
    });

    toast({
      title: language === 'ar' ? 'تمت الإضافة للسلة' : 'Added to Cart',
      description: language === 'ar' 
        ? `تمت إضافة ${item.product.name_ar} إلى سلة التسوق`
        : `${item.product.name} added to your cart`,
    });
  };

  const handleRemove = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
      toast({
        title: language === 'ar' ? 'تمت الإزالة' : 'Removed',
        description: language === 'ar' 
          ? 'تمت إزالة المنتج من قائمة الأمنيات'
          : 'Product removed from wishlist',
      });
    } catch (error) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' 
          ? 'حدث خطأ أثناء الإزالة'
          : 'Failed to remove from wishlist',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">
            {language === 'ar' ? 'قائمة الأمنيات' : 'Wishlist'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {language === 'ar' 
              ? 'يرجى تسجيل الدخول لعرض قائمة الأمنيات الخاصة بك'
              : 'Please log in to view your wishlist'}
          </p>
          <Button asChild>
            <Link to="/auth">
              {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
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

        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">
            {language === 'ar' ? 'قائمة الأمنيات' : 'My Wishlist'}
          </h1>
          {wishlistItems.length > 0 && (
            <span className="text-muted-foreground">
              ({wishlistItems.length} {language === 'ar' ? 'منتج' : 'items'})
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {language === 'ar' ? 'قائمة الأمنيات فارغة' : 'Your wishlist is empty'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {language === 'ar' 
                ? 'ابدأ بإضافة المنتجات التي تعجبك'
                : 'Start adding products you like'}
            </p>
            <Button asChild>
              <Link to="/products">
                {language === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {wishlistItems.map((item) => (
              <div 
                key={item.id}
                className="flex gap-4 p-4 bg-card rounded-xl border border-border/50 shadow-soft"
              >
                <Link to={`/products/${item.product.slug}`} className="flex-shrink-0">
                  <img
                    src={item.product.image_url || '/placeholder.svg'}
                    alt={language === 'ar' ? item.product.name_ar : item.product.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link 
                    to={`/products/${item.product.slug}`}
                    className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2"
                  >
                    {language === 'ar' ? item.product.name_ar : item.product.name}
                  </Link>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-bold text-foreground">
                      {item.product.price} {t('common.currency')}
                    </span>
                    {item.product.original_price && (
                      <span className="text-sm text-muted-foreground line-through">
                        {item.product.original_price}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.product.in_stock}
                      className="gap-1"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {language === 'ar' ? 'أضف للسلة' : 'Add'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemove(item.product_id)}
                      disabled={isToggling}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {!item.product.in_stock && (
                    <span className="text-xs text-destructive mt-2 block">
                      {t('products.outOfStock')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <PageWidgets page="wishlist" />
    </MainLayout>
  );
}
