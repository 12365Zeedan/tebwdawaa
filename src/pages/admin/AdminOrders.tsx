import React from 'react';
import { Search, Eye } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const AdminOrders = () => {
  const { language, t, direction } = useLanguage();

  const orders = [
    { id: 'ORD-001', customer: 'Ahmed Ali', email: 'ahmed@email.com', total: 245, status: 'pending', date: '2024-01-15' },
    { id: 'ORD-002', customer: 'Sara Mohamed', email: 'sara@email.com', total: 189, status: 'processing', date: '2024-01-15' },
    { id: 'ORD-003', customer: 'Khaled Hassan', email: 'khaled@email.com', total: 567, status: 'shipped', date: '2024-01-14' },
    { id: 'ORD-004', customer: 'Fatima Omar', email: 'fatima@email.com', total: 125, status: 'delivered', date: '2024-01-14' },
    { id: 'ORD-005', customer: 'Youssef Ibrahim', email: 'youssef@email.com', total: 340, status: 'pending', date: '2024-01-13' },
    { id: 'ORD-006', customer: 'Nour Ahmed', email: 'nour@email.com', total: 890, status: 'cancelled', date: '2024-01-13' },
  ];

  const statusColors: Record<string, string> = {
    pending: 'bg-warning/10 text-warning',
    processing: 'bg-info/10 text-info',
    shipped: 'bg-primary/10 text-primary',
    delivered: 'bg-success/10 text-success',
    cancelled: 'bg-destructive/10 text-destructive',
  };

  const statusLabels: Record<string, { en: string; ar: string }> = {
    pending: { en: 'Pending', ar: 'قيد الانتظار' },
    processing: { en: 'Processing', ar: 'قيد المعالجة' },
    shipped: { en: 'Shipped', ar: 'تم الشحن' },
    delivered: { en: 'Delivered', ar: 'تم التوصيل' },
    cancelled: { en: 'Cancelled', ar: 'ملغي' },
  };

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

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className={cn(
            'absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground',
            direction === 'rtl' ? 'right-3' : 'left-3'
          )} />
          <Input
            type="search"
            placeholder={language === 'ar' ? 'البحث عن طلب...' : 'Search orders...'}
            className={cn('bg-muted/50', direction === 'rtl' ? 'pr-10' : 'pl-10')}
          />
        </div>

        {/* Orders Table */}
        <div className="bg-card rounded-xl border border-border/50 shadow-soft overflow-hidden">
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
                    {language === 'ar' ? 'التاريخ' : 'Date'}
                  </th>
                  <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">
                    {language === 'ar' ? 'المبلغ' : 'Total'}
                  </th>
                  <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">
                    {language === 'ar' ? 'الحالة' : 'Status'}
                  </th>
                  <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">
                    {language === 'ar' ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{order.id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground">{order.customer}</p>
                        <p className="text-xs text-muted-foreground">{order.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{order.date}</td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {order.total} {t('common.currency')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                        {statusLabels[order.status][language]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Eye className="h-4 w-4" />
                        {language === 'ar' ? 'عرض' : 'View'}
                      </Button>
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

export default AdminOrders;
