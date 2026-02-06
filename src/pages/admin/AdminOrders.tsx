import React, { useState } from 'react';
import { Search, Eye, Clock, Package, Truck, CheckCircle, XCircle, Loader2, CreditCard, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminOrders, useAdminOrderDetails, useUpdateOrderStatus } from '@/hooks/useAdminOrders';
import { useUpdatePaymentStatus } from '@/hooks/usePayment';
import { PaymentStatusBadge, PaymentMethodBadge, paymentStatusConfig } from '@/components/orders/PaymentStatusBadge';
import { TransactionHistory } from '@/components/orders/TransactionHistory';
import { cn } from '@/lib/utils';
import VATInvoice from '@/components/admin/VATInvoice';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';

const statusConfig: Record<string, { icon: React.ElementType; color: string; labelEn: string; labelAr: string }> = {
  pending: { icon: Clock, color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', labelEn: 'Pending', labelAr: 'قيد الانتظار' },
  processing: { icon: Package, color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', labelEn: 'Processing', labelAr: 'قيد المعالجة' },
  shipped: { icon: Truck, color: 'bg-purple-500/10 text-purple-600 border-purple-500/20', labelEn: 'Shipped', labelAr: 'تم الشحن' },
  delivered: { icon: CheckCircle, color: 'bg-green-500/10 text-green-600 border-green-500/20', labelEn: 'Delivered', labelAr: 'تم التوصيل' },
  cancelled: { icon: XCircle, color: 'bg-red-500/10 text-red-600 border-red-500/20', labelEn: 'Cancelled', labelAr: 'ملغي' },
};

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const paymentStatusOptions = ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'];

const AdminOrders = () => {
  const { language, t, direction } = useLanguage();
  const { isAdmin } = useAuth();
  const { data: orders, isLoading } = useAdminOrders();
  const updateStatus = useUpdateOrderStatus();
  const updatePaymentStatus = useUpdatePaymentStatus();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { data: orderDetails, isLoading: detailsLoading } = useAdminOrderDetails(selectedOrderId);
  const { data: companySettings } = useCompanyInfo();

  const getStatusConfig = (status: string) => {
    return statusConfig[status] || statusConfig.pending;
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateStatus.mutate({ orderId, status: newStatus });
  };

  const handlePaymentStatusChange = (orderId: string, newStatus: string) => {
    updatePaymentStatus.mutate({ orderId, status: newStatus as any });
  };

  const filteredOrders = orders?.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">
            {language === 'ar' ? 'غير مصرح بالوصول' : 'Access denied'}
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('admin.orders')}</h1>
          <p className="text-muted-foreground mt-1">
            {language === 'ar' ? 'إدارة طلبات المتجر' : 'Manage store orders'}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search
              className={cn(
                'absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground',
                direction === 'rtl' ? 'right-3' : 'left-3'
              )}
            />
            <Input
              type="search"
              placeholder={language === 'ar' ? 'البحث عن طلب...' : 'Search orders...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn('bg-muted/50', direction === 'rtl' ? 'pr-10' : 'pl-10')}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={language === 'ar' ? 'جميع الحالات' : 'All statuses'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'ar' ? 'جميع الحالات' : 'All statuses'}</SelectItem>
              {statusOptions.map((status) => {
                const config = getStatusConfig(status);
                return (
                  <SelectItem key={status} value={status}>
                    {language === 'ar' ? config.labelAr : config.labelEn}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Orders Table */}
        <div className="bg-card rounded-xl border border-border/50 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredOrders && filteredOrders.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">
                      {language === 'ar' ? 'رقم الطلب' : 'Order ID'}
                    </th>
                    <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">
                      {language === 'ar' ? 'العميل' : 'Customer'}
                    </th>
                    <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">
                      {language === 'ar' ? 'التاريخ' : 'Date'}
                    </th>
                    <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">
                      {language === 'ar' ? 'المبلغ' : 'Total'}
                    </th>
                    <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">
                      {language === 'ar' ? 'الحالة' : 'Status'}
                    </th>
                    <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">
                      {language === 'ar' ? 'الدفع' : 'Payment'}
                    </th>
                    <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">
                      {language === 'ar' ? 'الإجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const config = getStatusConfig(order.status || 'pending');
                    const StatusIcon = config.icon;
                    return (
                      <tr
                        key={order.id}
                        className="border-b border-border last:border-0 hover:bg-muted/20"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-foreground">
                          {order.order_number}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-foreground">{order.customer_name}</p>
                            <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {format(new Date(order.created_at), 'PP')}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-foreground">
                          {order.total} {t('common.currency')}
                        </td>
                        <td className="px-6 py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-auto p-0">
                                <Badge variant="outline" className={cn('cursor-pointer', config.color)}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {language === 'ar' ? config.labelAr : config.labelEn}
                                </Badge>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              {statusOptions.map((status) => {
                                const statusCfg = getStatusConfig(status);
                                const Icon = statusCfg.icon;
                                return (
                                  <DropdownMenuItem
                                    key={status}
                                    onClick={() => handleStatusChange(order.id, status)}
                                    disabled={order.status === status}
                                  >
                                    <Icon className="h-4 w-4 mr-2" />
                                    {language === 'ar' ? statusCfg.labelAr : statusCfg.labelEn}
                                  </DropdownMenuItem>
                                );
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <PaymentStatusBadge status={order.payment_status} />
                            <PaymentMethodBadge method={order.payment_method} />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                            onClick={() => setSelectedOrderId(order.id)}
                          >
                            <Eye className="h-4 w-4" />
                            {language === 'ar' ? 'عرض' : 'View'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {language === 'ar' ? 'لا توجد طلبات' : 'No orders found'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Order Details Dialog */}
        <Dialog open={!!selectedOrderId} onOpenChange={() => setSelectedOrderId(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-foreground text-lg">
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
                  </div>
                  <Select
                    value={orderDetails.status || 'pending'}
                    onValueChange={(value) => handleStatusChange(orderDetails.id, value)}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => {
                        const config = getStatusConfig(status);
                        return (
                          <SelectItem key={status} value={status}>
                            {language === 'ar' ? config.labelAr : config.labelEn}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <p className="text-sm text-muted-foreground">
                  {format(new Date(orderDetails.created_at), 'PPP p')}
                </p>

                <Separator />

                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="w-full grid grid-cols-4">
                    <TabsTrigger value="details" className="gap-1">
                      <Package className="h-4 w-4" />
                      {language === 'ar' ? 'التفاصيل' : 'Details'}
                    </TabsTrigger>
                    <TabsTrigger value="items" className="gap-1">
                      <Package className="h-4 w-4" />
                      {language === 'ar' ? 'المنتجات' : 'Items'}
                    </TabsTrigger>
                    <TabsTrigger value="payment" className="gap-1">
                      <CreditCard className="h-4 w-4" />
                      {language === 'ar' ? 'الدفع' : 'Payment'}
                    </TabsTrigger>
                    <TabsTrigger value="invoice" className="gap-1">
                      <FileText className="h-4 w-4" />
                      {language === 'ar' ? 'الفاتورة' : 'Invoice'}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="mt-4 space-y-4">
                    {/* Customer Info */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">
                        {language === 'ar' ? 'معلومات العميل' : 'Customer Information'}
                      </h3>
                      <div className="text-sm space-y-1 text-muted-foreground">
                        <p><span className="font-medium text-foreground">{orderDetails.customer_name}</span></p>
                        <p>{orderDetails.customer_email}</p>
                        {orderDetails.customer_phone && <p>{orderDetails.customer_phone}</p>}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    {orderDetails.shipping_address && (
                      <>
                        <Separator />
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
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="items" className="mt-4">
                    {/* Items */}
                    <div className="space-y-3">
                      {orderDetails.items?.map(
                        (item: {
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
                        )
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="payment" className="mt-4 space-y-4">
                    {/* Payment Status Management */}
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
                      <div className="flex items-center gap-2">
                        <PaymentStatusBadge status={orderDetails.payment_status} />
                        <Select
                          value={orderDetails.payment_status || 'pending'}
                          onValueChange={(value) => handlePaymentStatusChange(orderDetails.id, value)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentStatusOptions.map((status) => {
                              const config = paymentStatusConfig[status];
                              return (
                                <SelectItem key={status} value={status}>
                                  {language === 'ar' ? config.labelAr : config.labelEn}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
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
                  </TabsContent>

                  <TabsContent value="invoice" className="mt-4">
                    {companySettings && orderDetails.items ? (
                      <VATInvoice
                        order={{
                          ...orderDetails,
                          shipping_address: orderDetails.shipping_address as {
                            street?: string;
                            city?: string;
                            country?: string;
                            postalCode?: string;
                          } | null,
                          items: orderDetails.items,
                        }}
                        companyInfo={companySettings}
                      />
                    ) : (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                    <span>
                      {orderDetails.subtotal} {t('common.currency')}
                    </span>
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
                    <span>
                      {orderDetails.total} {t('common.currency')}
                    </span>
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
    </AdminLayout>
  );
};

export default AdminOrders;
