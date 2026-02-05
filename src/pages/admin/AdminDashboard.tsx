import React, { useState } from 'react';
import { DollarSign, ShoppingCart, Users, Package, AlertTriangle, Settings, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatCard } from '@/components/admin/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLowStockProducts, useLowStockThreshold, useUpdateSetting } from '@/hooks/useSettings';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const AdminDashboard = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { threshold, isLoading: isThresholdLoading } = useLowStockThreshold();
  const { data: lowStockProducts, isLoading: isProductsLoading } = useLowStockProducts();
  const updateSetting = useUpdateSetting();
  const [newThreshold, setNewThreshold] = useState('');

  const handleUpdateThreshold = async () => {
    const value = parseInt(newThreshold);
    if (isNaN(value) || value < 0) {
      toast({
        title: language === 'ar' ? 'قيمة غير صالحة' : 'Invalid value',
        description: language === 'ar' ? 'يرجى إدخال رقم صحيح' : 'Please enter a valid number',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await updateSetting.mutateAsync({ key: 'low_stock_threshold', value });
      toast({
        title: language === 'ar' ? 'تم التحديث' : 'Updated',
        description: language === 'ar' 
          ? `تم تحديث حد التنبيه إلى ${value}` 
          : `Low stock threshold updated to ${value}`,
      });
      setNewThreshold('');
    } catch (error: any) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const stats = [
    {
      title: t('admin.totalSales'),
      value: `${language === 'ar' ? '٤٥,٢٣٠' : '45,230'} ${t('common.currency')}`,
      change: 12.5,
      icon: <DollarSign className="h-6 w-6 text-primary" />,
      iconBg: 'bg-primary/10',
    },
    {
      title: t('admin.totalOrders'),
      value: language === 'ar' ? '٣٢٤' : '324',
      change: 8.2,
      icon: <ShoppingCart className="h-6 w-6 text-accent" />,
      iconBg: 'bg-accent/10',
    },
    {
      title: t('admin.totalCustomers'),
      value: language === 'ar' ? '١,٢٣٤' : '1,234',
      change: 5.7,
      icon: <Users className="h-6 w-6 text-info" />,
      iconBg: 'bg-info/10',
    },
    {
      title: t('admin.totalProducts'),
      value: language === 'ar' ? '٥٨٩' : '589',
      change: -2.3,
      icon: <Package className="h-6 w-6 text-success" />,
      iconBg: 'bg-success/10',
    },
  ];

  const recentOrders = [
    { id: 'ORD-001', customer: 'Ahmed Ali', total: 245, status: 'pending' },
    { id: 'ORD-002', customer: 'Sara Mohamed', total: 189, status: 'processing' },
    { id: 'ORD-003', customer: 'Khaled Hassan', total: 567, status: 'shipped' },
    { id: 'ORD-004', customer: 'Fatima Omar', total: 125, status: 'delivered' },
    { id: 'ORD-005', customer: 'Youssef Ibrahim', total: 340, status: 'pending' },
  ];

  const statusColors: Record<string, string> = {
    pending: 'bg-warning/10 text-warning',
    processing: 'bg-info/10 text-info',
    shipped: 'bg-primary/10 text-primary',
    delivered: 'bg-success/10 text-success',
    cancelled: 'bg-destructive/10 text-destructive',
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('admin.dashboard')}</h1>
          <p className="text-muted-foreground mt-1">
            {language === 'ar' ? 'مرحباً بك في لوحة التحكم' : 'Welcome to your dashboard'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <StatCard {...stat} />
            </div>
          ))}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-card rounded-xl border border-border/50 shadow-soft overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {language === 'ar' ? 'تنبيهات المخزون المنخفض' : 'Low Stock Alerts'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' 
                    ? `المنتجات التي تقل عن ${threshold} وحدة`
                    : `Products below ${threshold} units`}
                </p>
              </div>
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                  {language === 'ar' ? 'الإعدادات' : 'Settings'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4" align="end">
                <div className="space-y-4">
                  <div className="text-sm font-medium">
                    {language === 'ar' ? 'حد التنبيه' : 'Alert Threshold'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {language === 'ar' 
                      ? 'تنبيه عندما يقل المخزون عن هذا العدد'
                      : 'Alert when stock falls below this number'}
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      value={newThreshold}
                      onChange={(e) => setNewThreshold(e.target.value)}
                      placeholder={threshold.toString()}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={handleUpdateThreshold}
                      disabled={updateSetting.isPending || !newThreshold}
                    >
                      {updateSetting.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        language === 'ar' ? 'حفظ' : 'Save'
                      )}
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="p-4">
            {isProductsLoading || isThresholdLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : lowStockProducts?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>{language === 'ar' ? 'لا توجد منتجات منخفضة المخزون' : 'No low stock products'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockProducts?.slice(0, 5).map((product) => {
                  const name = language === 'ar' ? product.name_ar : product.name;
                  const isOutOfStock = product.stock_quantity === 0;
                  
                  return (
                    <Link
                      key={product.id}
                      to="/admin/products"
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image_url || '/placeholder.svg'}
                          alt={name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-foreground line-clamp-1">{name}</p>
                          {product.category && (
                            <p className="text-xs text-muted-foreground">
                              {language === 'ar' ? product.category.name_ar : product.category.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge 
                        variant={isOutOfStock ? 'destructive' : 'secondary'}
                        className={cn(
                          "font-bold",
                          !isOutOfStock && "bg-warning/10 text-warning border-warning/20"
                        )}
                      >
                        {product.stock_quantity} {language === 'ar' ? 'وحدة' : 'units'}
                      </Badge>
                    </Link>
                  );
                })}
                
                {lowStockProducts && lowStockProducts.length > 5 && (
                  <Link 
                    to="/admin/products" 
                    className="block text-center py-2 text-sm text-primary hover:underline"
                  >
                    {language === 'ar' 
                      ? `عرض ${lowStockProducts.length - 5} منتج آخر`
                      : `View ${lowStockProducts.length - 5} more products`}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-card rounded-xl border border-border/50 shadow-soft overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">
              {language === 'ar' ? 'أحدث الطلبات' : 'Recent Orders'}
            </h2>
          </div>
          <div className="overflow-x-auto">
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
                    {language === 'ar' ? 'المبلغ' : 'Total'}
                  </th>
                  <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">
                    {language === 'ar' ? 'الحالة' : 'Status'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{order.id}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{order.customer}</td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {order.total} {t('common.currency')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
