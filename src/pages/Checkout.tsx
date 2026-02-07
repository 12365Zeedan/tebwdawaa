import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShoppingBag, CreditCard, MapPin, User, Loader2, Wallet } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateOrder } from '@/hooks/useOrders';
import { useProfile } from '@/hooks/useProfile';
import { useProcessPayment } from '@/hooks/usePayment';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { usePaymentSettings } from '@/hooks/usePaymentSettings';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { PaymentMethodSelector } from '@/components/checkout/PaymentMethodSelector';
import { DiscountCodeInput } from '@/components/checkout/DiscountCodeInput';
import { PaymentMethod, PAYMENT_METHODS } from '@/types/payment';
import { calculateVAT, calculateTotalWithVAT } from '@/lib/vat';
import { supabase } from '@/integrations/supabase/client';
import { DiscountCode } from '@/hooks/useDiscounts';
 const checkoutSchema = z.object({
   customerName: z.string().min(2, 'Name must be at least 2 characters'),
   customerEmail: z.string().email('Invalid email address'),
   customerPhone: z.string().optional(),
   street: z.string().min(5, 'Street address is required'),
   city: z.string().min(2, 'City is required'),
   country: z.string().min(2, 'Country is required'),
   postalCode: z.string().min(3, 'Postal code is required'),
   notes: z.string().optional(),
 });
 
 type CheckoutFormData = z.infer<typeof checkoutSchema>;
 
const Checkout = () => {
  const { language, t, direction } = useLanguage();
  const { items, totalPrice, totalBasePrice, totalVAT, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const createOrder = useCreateOrder();
  const processPayment = useProcessPayment();
  const { data: profile } = useProfile();
  const { data: settings } = useStoreSettings();
  const { data: paymentSettings } = usePaymentSettings();
  const { data: companyInfo } = useCompanyInfo();
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: DiscountCode; amount: number } | null>(null);
 
  const Arrow = direction === 'rtl' ? ArrowLeft : ArrowRight;
  const BackArrow = direction === 'rtl' ? ArrowRight : ArrowLeft;

  const currency = settings?.currency ?? 'SAR';
  const configuredShipping = settings?.shippingCost ?? 0;
  const freeShippingThreshold = settings?.freeShippingThreshold ?? 0;
  const isFreeShipping = totalPrice >= freeShippingThreshold;
  const shippingCost = isFreeShipping ? 0 : configuredShipping;
  const discountAmount = appliedDiscount?.amount ?? 0;
  const total = Math.max(0, totalPrice - discountAmount) + shippingCost;
  const maintenanceMode = settings?.maintenanceMode ?? false;
  const minOrderAmount = paymentSettings?.minOrderAmount ?? 0;
  const requirePhone = paymentSettings?.requirePhoneCheckout ?? false;
  const checkoutNotesEnabled = paymentSettings?.checkoutNotesEnabled ?? true;
 
   const form = useForm<CheckoutFormData>({
     resolver: zodResolver(checkoutSchema),
     defaultValues: {
       customerName: '',
       customerEmail: user?.email || '',
       customerPhone: '',
       street: '',
       city: '',
       country: 'Saudi Arabia',
       postalCode: '',
       notes: '',
     },
   });
 
   // Pre-fill form with profile data
   useEffect(() => {
     if (profile) {
       const address = profile.default_shipping_address as {
         street?: string;
         city?: string;
         country?: string;
         postalCode?: string;
       } | null;
 
       form.reset({
         customerName: profile.full_name || form.getValues('customerName'),
         customerEmail: user?.email || '',
         customerPhone: profile.phone || '',
         street: address?.street || '',
         city: address?.city || '',
         country: address?.country || 'Saudi Arabia',
         postalCode: address?.postalCode || '',
         notes: '',
       });
     }
   }, [profile, user, form]);
 
  const isProcessing = createOrder.isPending || processPayment.isPending;

  const onSubmit = async (data: CheckoutFormData) => {
    // Validate phone if required
    if (requirePhone && !data.customerPhone?.trim()) {
      form.setError('customerPhone', { 
        message: language === 'ar' ? 'رقم الهاتف مطلوب' : 'Phone number is required' 
      });
      return;
    }

    // Validate minimum order amount
    if (minOrderAmount > 0 && totalPrice < minOrderAmount) {
      return; // Button should already be disabled, this is a safety check
    }

    try {
      // Step 1: Create the order
      const order = await createOrder.mutateAsync({
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        shippingAddress: {
          street: data.street,
          city: data.city,
          country: data.country,
          postalCode: data.postalCode,
        },
        items,
        subtotal: totalPrice,
        shippingCost,
        total,
        notes: data.notes,
        userId: user?.id,
      });

      // Step 2: Process payment
      await processPayment.mutateAsync({
        orderId: order.id,
        amount: total,
        paymentMethod,
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
      });

      // Step 3: Auto-send invoice email & WhatsApp (fire-and-forget, don't block checkout)
      const orderItems = items.map((item) => ({
        id: item.id,
        product_name: item.name,
        product_name_ar: item.nameAr || null,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }));

      // Send invoice email in background
      if (companyInfo) {
        supabase.functions
          .invoke('send-invoice-email', {
            body: {
              customerEmail: data.customerEmail,
              customerName: data.customerName,
              customerPhone: data.customerPhone || null,
              orderNumber: order.order_number,
              createdAt: new Date().toISOString(),
              items: orderItems,
              subtotal: totalPrice,
              shippingCost,
              total,
              shippingAddress: {
                street: data.street,
                city: data.city,
                country: data.country,
                postalCode: data.postalCode,
              },
              companyInfo,
            },
          })
          .then(({ error }) => {
            if (error) console.error('Auto invoice email failed:', error);
          });
      }

      // Open WhatsApp with invoice summary (if phone provided)
      if (data.customerPhone) {
        const vatAmount = calculateVAT(totalPrice);
        const phone = data.customerPhone.replace(/[^0-9]/g, '');
        const storeName = companyInfo?.company_name || companyInfo?.store_name || '';
        const vatNo = companyInfo?.vat_number || '';
        const message = [
          `📄 VAT Invoice - ${order.order_number}`,
          '',
          `Customer: ${data.customerName}`,
          `Date: ${new Date().toLocaleDateString('en-GB')}`,
          '',
          'Items:',
          ...orderItems.map(
            (item) =>
              `• ${item.product_name} x${item.quantity} = ${item.total_price.toFixed(2)} SAR`
          ),
          '',
          `Subtotal (Excl. VAT): ${totalPrice.toFixed(2)} SAR`,
          `VAT (15%): ${vatAmount.toFixed(2)} SAR`,
          `Shipping: ${shippingCost > 0 ? `${shippingCost.toFixed(2)} SAR` : 'Free'}`,
          `Grand Total: ${(calculateTotalWithVAT(totalPrice) + shippingCost).toFixed(2)} SAR`,
          '',
          storeName,
          vatNo ? `VAT No.: ${vatNo}` : '',
        ]
          .filter(Boolean)
          .join('\n');

        const encodedMessage = encodeURIComponent(message);
        window.open(
          `https://api.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`,
          '_blank'
        );
      }

      // Step 4: Increment discount code usage if applied
      if (appliedDiscount) {
        supabase
          .from('discount_codes')
          .update({ usage_count: appliedDiscount.code.usage_count + 1 } as any)
          .eq('id', appliedDiscount.code.id)
          .then(({ error }) => {
            if (error) console.error('Failed to increment discount usage:', error);
          });
      }

      setOrderNumber(order.order_number);
      setOrderComplete(true);
      setAppliedDiscount(null);
      clearCart();
    } catch (error) {
      // Error handled in mutation
    }
  };
 
   // Maintenance mode block
   if (maintenanceMode) {
     return (
       <MainLayout>
         <div className="container py-16 md:py-24">
           <div className="max-w-md mx-auto text-center space-y-6">
             <div className="w-24 h-24 mx-auto rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
               <ShoppingBag className="h-12 w-12 text-amber-600 dark:text-amber-400" />
             </div>
             <h1 className="text-2xl font-bold text-foreground">
               {language === 'ar' ? 'الدفع غير متاح حالياً' : 'Checkout Unavailable'}
             </h1>
             <p className="text-muted-foreground">
               {language === 'ar'
                 ? 'نحن في وضع الصيانة حالياً. يرجى المحاولة مرة أخرى لاحقاً.'
                 : 'We are currently in maintenance mode. Please try again later.'}
             </p>
             <Link to="/cart">
               <Button variant="outline" className="gap-2">
                 <BackArrow className="h-4 w-4" />
                 {language === 'ar' ? 'العودة للسلة' : 'Back to Cart'}
               </Button>
             </Link>
           </div>
         </div>
       </MainLayout>
     );
   }

   // Empty cart redirect
   if (items.length === 0 && !orderComplete) {
     return (
       <MainLayout>
         <div className="container py-16 md:py-24">
           <div className="max-w-md mx-auto text-center space-y-6">
             <div className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center">
               <ShoppingBag className="h-12 w-12 text-muted-foreground" />
             </div>
             <h1 className="text-2xl font-bold text-foreground">
               {language === 'ar' ? 'سلتك فارغة' : 'Your cart is empty'}
             </h1>
             <p className="text-muted-foreground">
               {language === 'ar'
                 ? 'أضف بعض المنتجات إلى سلتك قبل الدفع'
                 : 'Add some products to your cart before checkout'}
             </p>
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
 
  // Order complete success screen
  if (orderComplete) {
    const selectedMethod = PAYMENT_METHODS.find(m => m.id === paymentMethod);
    
    return (
      <MainLayout>
        <div className="container py-16 md:py-24">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              {paymentMethod === 'cod' ? (
                <Wallet className="h-12 w-12 text-primary" />
              ) : (
                <CreditCard className="h-12 w-12 text-primary" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {language === 'ar' ? 'تم تأكيد طلبك!' : 'Order Confirmed!'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'ar'
                ? `رقم الطلب: ${orderNumber}`
                : `Order number: ${orderNumber}`}
            </p>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
              </p>
              <p className="font-medium text-foreground">
                {language === 'ar' ? selectedMethod?.nameAr : selectedMethod?.name}
              </p>
              {paymentMethod === 'cod' && (
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  {language === 'ar' 
                    ? 'سيتم تحصيل المبلغ عند الاستلام' 
                    : 'Payment will be collected upon delivery'}
                </p>
              )}
            </div>
            <p className="text-muted-foreground">
              {language === 'ar'
                ? 'شكراً لك! سنرسل لك تأكيد الطلب عبر البريد الإلكتروني.'
                : 'Thank you! We will send you an order confirmation email.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/orders">
                <Button variant="outline" className="gap-2 w-full">
                  {language === 'ar' ? 'متابعة الطلب' : 'Track Order'}
                </Button>
              </Link>
              <Link to="/">
                <Button className="gap-2 w-full">
                  {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
 
   return (
     <MainLayout>
       <div className="container py-8 md:py-12">
         {/* Back to Cart */}
         <Link
           to="/cart"
           className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
         >
           <BackArrow className="h-4 w-4" />
           {language === 'ar' ? 'العودة للسلة' : 'Back to Cart'}
         </Link>
 
         <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
           {language === 'ar' ? 'إتمام الشراء' : 'Checkout'}
         </h1>
 
         <div className="grid lg:grid-cols-3 gap-8">
           {/* Checkout Form */}
           <div className="lg:col-span-2">
             <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                 {/* Contact Information */}
                 <div className="bg-card rounded-xl border border-border/50 p-6 shadow-soft space-y-4">
                   <div className="flex items-center gap-2 mb-4">
                     <User className="h-5 w-5 text-primary" />
                     <h2 className="text-xl font-semibold text-foreground">
                       {language === 'ar' ? 'معلومات الاتصال' : 'Contact Information'}
                     </h2>
                   </div>
 
                   <div className="grid sm:grid-cols-2 gap-4">
                     <FormField
                       control={form.control}
                       name="customerName"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>{language === 'ar' ? 'الاسم الكامل' : 'Full Name'}</FormLabel>
                           <FormControl>
                             <Input placeholder={language === 'ar' ? 'أحمد محمد' : 'John Doe'} {...field} />
                           </FormControl>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                     <FormField
                       control={form.control}
                       name="customerEmail"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</FormLabel>
                           <FormControl>
                             <Input type="email" placeholder="email@example.com" {...field} />
                           </FormControl>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                   </div>
 
                    <FormField
                      control={form.control}
                      name="customerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {language === 'ar' 
                              ? `رقم الهاتف ${requirePhone ? '' : '(اختياري)'}` 
                              : `Phone ${requirePhone ? '(required)' : '(optional)'}`}
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="+966 5XX XXX XXXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                 </div>
 
                 {/* Shipping Address */}
                 <div className="bg-card rounded-xl border border-border/50 p-6 shadow-soft space-y-4">
                   <div className="flex items-center gap-2 mb-4">
                     <MapPin className="h-5 w-5 text-primary" />
                     <h2 className="text-xl font-semibold text-foreground">
                       {language === 'ar' ? 'عنوان الشحن' : 'Shipping Address'}
                     </h2>
                   </div>
 
                   <FormField
                     control={form.control}
                     name="street"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>{language === 'ar' ? 'العنوان' : 'Street Address'}</FormLabel>
                         <FormControl>
                           <Input
                             placeholder={language === 'ar' ? 'شارع الملك فهد، مبنى 123' : '123 Main Street, Building A'}
                             {...field}
                           />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
 
                   <div className="grid sm:grid-cols-2 gap-4">
                     <FormField
                       control={form.control}
                       name="city"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>{language === 'ar' ? 'المدينة' : 'City'}</FormLabel>
                           <FormControl>
                             <Input placeholder={language === 'ar' ? 'الرياض' : 'Riyadh'} {...field} />
                           </FormControl>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                     <FormField
                       control={form.control}
                       name="postalCode"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>{language === 'ar' ? 'الرمز البريدي' : 'Postal Code'}</FormLabel>
                           <FormControl>
                             <Input placeholder="12345" {...field} />
                           </FormControl>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                   </div>
 
                   <FormField
                     control={form.control}
                     name="country"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>{language === 'ar' ? 'الدولة' : 'Country'}</FormLabel>
                         <FormControl>
                           <Input {...field} />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                 </div>
 
                {/* Order Notes */}
                  {checkoutNotesEnabled && (
                   <div className="bg-card rounded-xl border border-border/50 p-6 shadow-soft space-y-4">
                     <h2 className="text-xl font-semibold text-foreground">
                       {language === 'ar' ? 'ملاحظات الطلب (اختياري)' : 'Order Notes (optional)'}
                     </h2>
                     <FormField
                       control={form.control}
                       name="notes"
                       render={({ field }) => (
                         <FormItem>
                           <FormControl>
                             <Textarea
                               placeholder={
                                 language === 'ar'
                                   ? 'أي ملاحظات خاصة بالتوصيل...'
                                   : 'Any special delivery instructions...'
                               }
                               className="min-h-[100px]"
                               {...field}
                             />
                           </FormControl>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                   </div>
                  )}

                  {/* Payment Method Selection */}
                  <div className="bg-card rounded-xl border border-border/50 p-6 shadow-soft">
                    <PaymentMethodSelector
                      value={paymentMethod}
                      onChange={setPaymentMethod}
                      disabled={isProcessing}
                    />
                  </div>

                  {/* Submit Button - Mobile */}
                  <div className="lg:hidden">
                    <Button
                      type="submit"
                      className="w-full gap-2 shadow-glow"
                      size="lg"
                      disabled={isProcessing || (minOrderAmount > 0 && totalPrice < minOrderAmount)}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {language === 'ar' ? 'جاري المعالجة...' : 'Processing...'}
                        </>
                      ) : (
                        <>
                          {paymentMethod === 'cod' ? (
                            <Wallet className="h-4 w-4" />
                          ) : (
                            <CreditCard className="h-4 w-4" />
                          )}
                          {language === 'ar' ? 'تأكيد الطلب' : 'Place Order'}
                        </>
                      )}
                    </Button>
                  </div>
               </form>
             </Form>
           </div>
 
           {/* Order Summary */}
           <div className="lg:col-span-1">
             <div className="sticky top-24 bg-card rounded-xl border border-border/50 p-6 shadow-soft space-y-6">
               <h2 className="text-xl font-bold text-foreground">
                 {language === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
               </h2>
 
               {/* Items */}
               <div className="space-y-4 max-h-[300px] overflow-y-auto">
                 {items.map((item) => {
                   const name = language === 'ar' ? item.nameAr : item.name;
                   return (
                     <div key={item.id} className="flex gap-3">
                       <img
                         src={item.image}
                         alt={name}
                         className="w-16 h-16 object-cover rounded-lg"
                       />
                       <div className="flex-1">
                         <p className="font-medium text-foreground text-sm line-clamp-1">
                           {name}
                         </p>
                         <p className="text-xs text-muted-foreground">
                           {language === 'ar' ? 'الكمية' : 'Qty'}: {item.quantity}
                         </p>
                        <p className="text-sm font-semibold text-primary">
                            {item.price * item.quantity} {currency}
                          </p>
                       </div>
                     </div>
                   );
                 })}
               </div>
 
                <Separator />

                {/* Discount Code */}
                <DiscountCodeInput
                  orderTotal={totalPrice}
                  currency={currency}
                  appliedDiscount={appliedDiscount}
                  onApply={(discount) => setAppliedDiscount(discount)}
                  onRemove={() => setAppliedDiscount(null)}
                />

                <Separator />

                 {/* Totals */}
                 <div className="space-y-3">
                   <div className="flex justify-between text-muted-foreground">
                     <span>{language === 'ar' ? 'السعر بدون ضريبة' : 'Price Excl. VAT'}</span>
                     <span>
                       {totalBasePrice.toFixed(2)} {currency}
                     </span>
                   </div>
                   {totalVAT > 0 && (
                     <div className="flex justify-between text-muted-foreground">
                       <span>{language === 'ar' ? 'ضريبة القيمة المضافة (15%)' : 'VAT (15%)'}</span>
                       <span>
                         {totalVAT.toFixed(2)} {currency}
                       </span>
                     </div>
                   )}
                   {discountAmount > 0 && (
                     <div className="flex justify-between text-green-600 dark:text-green-400">
                       <span>{language === 'ar' ? 'الخصم' : 'Discount'}</span>
                       <span>-{discountAmount.toFixed(2)} {currency}</span>
                     </div>
                   )}
                   <div className="flex justify-between text-muted-foreground">
                     <span>{language === 'ar' ? 'التوصيل' : 'Shipping'}</span>
                     {isFreeShipping ? (
                       <span className="text-green-600">
                         {language === 'ar' ? 'مجاني' : 'Free'}
                       </span>
                     ) : (
                       <span>{shippingCost} {currency}</span>
                     )}
                   </div>
                   <Separator />
                   <div className="flex justify-between text-lg font-bold text-foreground">
                     <span>{t('cart.total')}</span>
                     <span>
                       {total.toFixed(2)} {currency}
                     </span>
                   </div>
                  </div>

                {/* Minimum Order Warning */}
                {minOrderAmount > 0 && totalPrice < minOrderAmount && (
                  <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                    <p className="text-sm text-destructive">
                      {language === 'ar'
                        ? `الحد الأدنى لقيمة الطلب هو ${minOrderAmount} ${currency}`
                        : `Minimum order amount is ${minOrderAmount} ${currency}`}
                    </p>
                  </div>
                )}
 
                 {/* Submit Button - Desktop */}
                 <div className="hidden lg:block">
                   <Button
                     type="submit"
                     className="w-full gap-2 shadow-glow"
                     size="lg"
                     disabled={isProcessing || (minOrderAmount > 0 && totalPrice < minOrderAmount)}
                     onClick={form.handleSubmit(onSubmit)}
                   >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {language === 'ar' ? 'جاري المعالجة...' : 'Processing...'}
                      </>
                    ) : (
                      <>
                        {paymentMethod === 'cod' ? (
                          <Wallet className="h-4 w-4" />
                        ) : (
                          <CreditCard className="h-4 w-4" />
                        )}
                        {language === 'ar' ? 'تأكيد الطلب' : 'Place Order'}
                      </>
                    )}
                  </Button>
                </div>
 
               {/* Security Note */}
               <p className="text-xs text-muted-foreground text-center">
                 {language === 'ar'
                   ? 'معلوماتك آمنة ومحمية'
                   : 'Your information is secure and protected'}
               </p>
             </div>
           </div>
         </div>
       </div>
     </MainLayout>
   );
 };
 
 export default Checkout;