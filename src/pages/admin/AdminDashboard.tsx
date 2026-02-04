import React from 'react';
import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatCard } from '@/components/admin/StatCard';
import { useLanguage } from '@/contexts/LanguageContext';

const AdminDashboard = () => {
  const { t, language } = useLanguage();

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
