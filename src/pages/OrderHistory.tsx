import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Package, ChevronRight, ChevronLeft, Clock, CheckCircle, Truck, XCircle, Loader2, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useUserOrders, useOrderDetails } from '@/hooks/useUserOrders';
import { PaymentStatusBadge, PaymentMethodBadge } from '@/components/orders/PaymentStatusBadge';
import { TransactionHistory } from '@/components/orders/TransactionHistory';
 
 const statusConfig: Record<string, { icon: React.ElementType; color: string; labelEn: string; labelAr: string }> = {
   pending: { icon: Clock, color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', labelEn: 'Pending', labelAr: 'قيد الانتظار' },
   processing: { icon: Package, color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', labelEn: 'Processing', labelAr: 'قيد المعالجة' },
   shipped: { icon: Truck, color: 'bg-purple-500/10 text-purple-600 border-purple-500/20', labelEn: 'Shipped', labelAr: 'تم الشحن' },
   delivered: { icon: CheckCircle, color: 'bg-green-500/10 text-green-600 border-green-500/20', labelEn: 'Delivered', labelAr: 'تم التوصيل' },
   cancelled: { icon: XCircle, color: 'bg-red-500/10 text-red-600 border-red-500/20', labelEn: 'Cancelled', labelAr: 'ملغي' },
 };
 
 const OrderHistory = () => {
   const { language, t, direction } = useLanguage();
   const { user, isLoading: authLoading } = useAuth();
   const { data: orders, isLoading } = useUserOrders();
   const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
   const { data: orderDetails, isLoading: detailsLoading } = useOrderDetails(selectedOrderId);
 
   const Arrow = direction === 'rtl' ? ChevronLeft : ChevronRight;
 
   // Redirect to auth if not logged in
   if (!authLoading && !user) {
     return <Navigate to="/auth" replace />;
   }
 
   const getStatusConfig = (status: string) => {
     return statusConfig[status] || statusConfig.pending;
   };
 
   return (
     <MainLayout>
       <div className="container py-8 md:py-12">
         <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
           {language === 'ar' ? 'طلباتي' : 'My Orders'}
         </h1>
 
         {isLoading ? (
           <div className="space-y-4">
             {[1, 2, 3].map((i) => (
               <Skeleton key={i} className="h-32 w-full rounded-xl" />
             ))}
           </div>
         ) : orders && orders.length > 0 ? (
           <div className="space-y-4">
             {orders.map((order) => {
               const config = getStatusConfig(order.status || 'pending');
               const StatusIcon = config.icon;
               const shippingAddress = order.shipping_address as { city?: string; country?: string } | null;
 
               return (
                 <div
                   key={order.id}
                   className="bg-card rounded-xl border border-border/50 p-6 shadow-soft hover:shadow-md transition-shadow cursor-pointer"
                   onClick={() => setSelectedOrderId(order.id)}
                 >
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                     <div className="space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Package className="h-5 w-5 text-primary" />
                          <span className="font-semibold text-foreground">
                            {order.order_number}
                          </span>
                          <Badge variant="outline" className={config.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {language === 'ar' ? config.labelAr : config.labelEn}
                          </Badge>
                          <PaymentStatusBadge status={order.payment_status} />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{format(new Date(order.created_at), 'PPP')}</span>
                          <span>•</span>
                          <PaymentMethodBadge method={order.payment_method} />
                        </div>
                        {shippingAddress && (
                          <p className="text-sm text-muted-foreground">
                           {shippingAddress.city}, {shippingAddress.country}
                         </p>
                       )}
                     </div>
                     <div className="flex items-center gap-4">
                       <div className="text-right">
                         <p className="text-lg font-bold text-foreground">
                           {order.total} {t('common.currency')}
                         </p>
                       </div>
                       <Arrow className="h-5 w-5 text-muted-foreground" />
                     </div>
                   </div>
                 </div>
               );
             })}
           </div>
         ) : (
           <div className="text-center py-16">
             <div className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center mb-6">
               <Package className="h-12 w-12 text-muted-foreground" />
             </div>
             <h2 className="text-xl font-semibold text-foreground mb-2">
               {language === 'ar' ? 'لا توجد طلبات' : 'No orders yet'}
             </h2>
             <p className="text-muted-foreground mb-6">
               {language === 'ar'
                 ? 'ابدأ التسوق واطلب منتجاتك المفضلة'
                 : 'Start shopping and place your first order'}
             </p>
             <Link to="/products">
               <Button className="gap-2">
                 {t('cart.continue')}
                 <Arrow className="h-4 w-4" />
               </Button>
             </Link>
           </div>
         )}
 
         {/* Order Details Dialog */}
         <Dialog open={!!selectedOrderId} onOpenChange={() => setSelectedOrderId(null)}>
           <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
             <DialogHeader>
               <DialogTitle>
                 {language === 'ar' ? 'تفاصيل الطلب' : 'Order Details'}
               </DialogTitle>
             </DialogHeader>
 
             {detailsLoading ? (
               <div className="flex items-center justify-center py-12">
                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
               </div>
             ) : orderDetails ? (
               <div className="space-y-6">
                  {/* Order Info */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-semibold text-foreground">
                      {orderDetails.order_number}
                    </span>
                    {(() => {
                      const config = getStatusConfig(orderDetails.status || 'pending');
                      const StatusIcon = config.icon;
                      return (
                        <Badge variant="outline" className={config.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {language === 'ar' ? config.labelAr : config.labelEn}
                        </Badge>
                      );
                    })()}
                    <PaymentStatusBadge status={orderDetails.payment_status} />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{format(new Date(orderDetails.created_at), 'PPP p')}</span>
                    <span>•</span>
                    <PaymentMethodBadge method={orderDetails.payment_method} />
                 </div>
 
                  <Separator />

                  <Tabs defaultValue="items" className="w-full">
                    <TabsList className="w-full grid grid-cols-2">
                      <TabsTrigger value="items" className="gap-1">
                        <Package className="h-4 w-4" />
                        {language === 'ar' ? 'المنتجات' : 'Items'}
                      </TabsTrigger>
                      <TabsTrigger value="payment" className="gap-1">
                        <CreditCard className="h-4 w-4" />
                        {language === 'ar' ? 'الدفع' : 'Payment'}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="items" className="mt-4">
                      {/* Items */}
                      <div className="space-y-3">
                        {orderDetails.items?.map((item: {
                          id: string;
                          product_name: string;
                          product_name_ar: string | null;
                          quantity: number;
                          unit_price: number;
                          total_price: number;
                        }) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center py-2 border-b border-border/50 last:border-0"
                          >
                            <div>
                              <p className="font-medium text-foreground">
                                {language === 'ar' && item.product_name_ar
                                  ? item.product_name_ar
                                  : item.product_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {item.unit_price} {t('common.currency')} × {item.quantity}
                              </p>
                            </div>
                            <p className="font-semibold text-foreground">
                              {item.total_price} {t('common.currency')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="payment" className="mt-4">
                      {/* Payment & Transaction History */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
                          </span>
                          <PaymentMethodBadge method={orderDetails.payment_method} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            {language === 'ar' ? 'حالة الدفع' : 'Payment Status'}
                          </span>
                          <PaymentStatusBadge status={orderDetails.payment_status} />
                        </div>
                        {orderDetails.payment_reference && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              {language === 'ar' ? 'مرجع الدفع' : 'Payment Reference'}
                            </span>
                            <span className="font-mono text-sm">{orderDetails.payment_reference}</span>
                          </div>
                        )}
                        <Separator />
                        <div>
                          <h4 className="font-medium text-foreground mb-3">
                            {language === 'ar' ? 'سجل المعاملات' : 'Transaction History'}
                          </h4>
                          <TransactionHistory orderId={orderDetails.id} />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <Separator />

                  {/* Shipping Address */}
                  {orderDetails.shipping_address && (
                   <div>
                     <h3 className="font-semibold text-foreground mb-2">
                       {language === 'ar' ? 'عنوان الشحن' : 'Shipping Address'}
                     </h3>
                     {(() => {
                       const addr = orderDetails.shipping_address as {
                         street?: string;
                         city?: string;
                         country?: string;
                         postalCode?: string;
                       };
                       return (
                         <div className="text-muted-foreground text-sm space-y-1">
                           <p>{addr.street}</p>
                           <p>
                             {addr.city}, {addr.postalCode}
                           </p>
                           <p>{addr.country}</p>
                         </div>
                       );
                     })()}
                   </div>
                 )}
 
                 <Separator />
 
                 {/* Totals */}
                 <div className="space-y-2">
                   <div className="flex justify-between text-muted-foreground">
                     <span>{language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                     <span>{orderDetails.subtotal} {t('common.currency')}</span>
                   </div>
                   <div className="flex justify-between text-muted-foreground">
                     <span>{language === 'ar' ? 'التوصيل' : 'Shipping'}</span>
                     <span>
                       {orderDetails.shipping_cost === 0
                         ? language === 'ar'
                           ? 'مجاني'
                           : 'Free'
                         : `${orderDetails.shipping_cost} ${t('common.currency')}`}
                     </span>
                   </div>
                   <Separator />
                   <div className="flex justify-between text-lg font-bold text-foreground">
                     <span>{t('cart.total')}</span>
                     <span>{orderDetails.total} {t('common.currency')}</span>
                   </div>
                 </div>
 
                 {/* Notes */}
                 {orderDetails.notes && (
                   <>
                     <Separator />
                     <div>
                       <h3 className="font-semibold text-foreground mb-2">
                         {language === 'ar' ? 'ملاحظات' : 'Notes'}
                       </h3>
                       <p className="text-muted-foreground text-sm">{orderDetails.notes}</p>
                     </div>
                   </>
                 )}
               </div>
             ) : null}
           </DialogContent>
         </Dialog>
       </div>
     </MainLayout>
   );
 };
 
 export default OrderHistory;