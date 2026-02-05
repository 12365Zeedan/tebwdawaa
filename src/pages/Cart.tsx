import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { cn } from '@/lib/utils';

const Cart = () => {
  const { language, t, direction } = useLanguage();
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const { data: settings, isLoading: settingsLoading } = useStoreSettings();
  const Arrow = direction === 'rtl' ? ArrowLeft : ArrowRight;

  const shippingCost = settings?.shippingCost ?? 0;
  const freeShippingThreshold = settings?.freeShippingThreshold ?? 0;
  const currency = settings?.currency ?? 'SAR';
  const isFreeShipping = totalPrice >= freeShippingThreshold;
  const finalShipping = isFreeShipping ? 0 : shippingCost;
  const total = totalPrice + finalShipping;

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="container py-16 md:py-24">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {t('cart.empty')}
            </h1>
            <Link to="/products">
              <Button className="gap-2">
                {t('cart.continue')}
                <Arrow className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
          {t('cart.title')}
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const name = language === 'ar' ? item.nameAr : item.name;
              return (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-card rounded-xl border border-border/50 shadow-soft"
                >
                  <img
                    src={item.image}
                    alt={name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{name}</h3>
                  <p className="text-lg font-bold text-primary">
                        {item.price} {currency}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">
                      {item.price * item.quantity} {currency}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card rounded-xl border border-border/50 p-6 shadow-soft space-y-6">
              <h2 className="text-xl font-bold text-foreground">
                {language === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between text-muted-foreground">
                  <span>{language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                  <span>{totalPrice} {currency}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{language === 'ar' ? 'التوصيل' : 'Shipping'}</span>
                  {isFreeShipping ? (
                    <span className="text-green-600">{language === 'ar' ? 'مجاني' : 'Free'}</span>
                  ) : (
                    <span>{finalShipping} {currency}</span>
                  )}
                </div>
                {!isFreeShipping && freeShippingThreshold > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {language === 'ar'
                      ? `أضف ${freeShippingThreshold - totalPrice} ${currency} للحصول على شحن مجاني`
                      : `Add ${freeShippingThreshold - totalPrice} ${currency} for free shipping`}
                  </p>
                )}
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between text-lg font-bold text-foreground">
                    <span>{t('cart.total')}</span>
                    <span>{total} {currency}</span>
                  </div>
                </div>
              </div>

               <Link to="/checkout">
                 <Button className="w-full gap-2 shadow-glow">
                   {t('cart.checkout')}
                   <Arrow className="h-4 w-4" />
                 </Button>
               </Link>

              <Link to="/products">
                <Button variant="ghost" className="w-full gap-2">
                  {t('cart.continue')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Cart;
