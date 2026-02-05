import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, Users, Eye, Phone, ShoppingBag, Calendar, Download } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface CustomerWithStats {
  id: string;
  user_id: string;
  full_name: string | null;
  full_name_ar: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  email?: string;
  order_count: number;
  total_spent: number;
  last_order_date: string | null;
}

interface CustomerOrder {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  payment_status: string;
}

export default function AdminCustomers() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithStats | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch customers with their stats
  const { data: customers, isLoading } = useQuery({
    queryKey: ['admin-customers', searchQuery],
    queryFn: async () => {
      // First get all profiles
      let profilesQuery = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        profilesQuery = profilesQuery.or(
          `full_name.ilike.%${searchQuery}%,full_name_ar.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`
        );
      }

      const { data: profiles, error: profilesError } = await profilesQuery;
      if (profilesError) throw profilesError;

      // Get order stats for each customer
      const customersWithStats: CustomerWithStats[] = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: orders } = await supabase
            .from('orders')
            .select('total, created_at')
            .eq('user_id', profile.user_id)
            .order('created_at', { ascending: false });

          const orderCount = orders?.length || 0;
          const totalSpent = orders?.reduce((sum, o) => sum + Number(o.total), 0) || 0;
          const lastOrderDate = orders?.[0]?.created_at || null;

          return {
            ...profile,
            order_count: orderCount,
            total_spent: totalSpent,
            last_order_date: lastOrderDate,
          };
        })
      );

      return customersWithStats;
    },
  });

  // Fetch customer orders when viewing details
  const { data: customerOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['customer-orders', selectedCustomer?.user_id],
    queryFn: async () => {
      if (!selectedCustomer?.user_id) return [];

      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, status, total, created_at, payment_status')
        .eq('user_id', selectedCustomer.user_id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as CustomerOrder[];
    },
    enabled: !!selectedCustomer?.user_id,
  });

  const handleViewDetails = (customer: CustomerWithStats) => {
    setSelectedCustomer(customer);
    setDetailsOpen(true);
  };

  const exportToCSV = () => {
    if (!customers || customers.length === 0) {
      toast({
        title: language === 'ar' ? 'لا توجد بيانات' : 'No Data',
        description: language === 'ar' ? 'لا يوجد عملاء للتصدير' : 'No customers to export',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);

    try {
      // CSV headers
      const headers = [
        'Customer Name',
        'Customer Name (Arabic)',
        'Phone',
        'Total Orders',
        'Total Spent (SAR)',
        'Average Order (SAR)',
        'Last Order Date',
        'Registration Date',
      ];

      // CSV rows
      const rows = customers.map((customer) => [
        customer.full_name || '',
        customer.full_name_ar || '',
        customer.phone || '',
        customer.order_count.toString(),
        customer.total_spent.toFixed(2),
        customer.order_count > 0 
          ? (customer.total_spent / customer.order_count).toFixed(2) 
          : '0.00',
        customer.last_order_date 
          ? format(new Date(customer.last_order_date), 'yyyy-MM-dd')
          : '',
        format(new Date(customer.created_at), 'yyyy-MM-dd'),
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map((row) => 
          row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n');

      // Create and download file
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `customers_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: language === 'ar' ? 'تم التصدير بنجاح' : 'Export Successful',
        description: language === 'ar' 
          ? `تم تصدير ${customers.length} عميل`
          : `Exported ${customers.length} customers`,
      });
    } catch (error) {
      toast({
        title: language === 'ar' ? 'خطأ في التصدير' : 'Export Error',
        description: language === 'ar' ? 'فشل تصدير البيانات' : 'Failed to export data',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; labelAr: string }> = {
      pending: { variant: 'secondary', label: 'Pending', labelAr: 'قيد الانتظار' },
      processing: { variant: 'default', label: 'Processing', labelAr: 'قيد المعالجة' },
      shipped: { variant: 'outline', label: 'Shipped', labelAr: 'تم الشحن' },
      delivered: { variant: 'default', label: 'Delivered', labelAr: 'تم التسليم' },
      cancelled: { variant: 'destructive', label: 'Cancelled', labelAr: 'ملغي' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge variant={config.variant}>
        {language === 'ar' ? config.labelAr : config.label}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6" />
              {language === 'ar' ? 'العملاء' : 'Customers'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'ar' 
                ? 'عرض وإدارة معلومات العملاء'
                : 'View and manage customer information'}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={exportToCSV}
            disabled={isExporting || isLoading || !customers?.length}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting 
              ? (language === 'ar' ? 'جاري التصدير...' : 'Exporting...')
              : (language === 'ar' ? 'تصدير CSV' : 'Export CSV')}
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={language === 'ar' ? 'البحث بالاسم أو الهاتف...' : 'Search by name or phone...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-9"
          />
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'إجمالي العملاء' : 'Total Customers'}
                </p>
                <p className="text-2xl font-bold">{customers?.length || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <ShoppingBag className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'العملاء النشطين' : 'Active Customers'}
                </p>
                <p className="text-2xl font-bold">
                  {customers?.filter(c => c.order_count > 0).length || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <ShoppingBag className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'إجمالي المبيعات' : 'Total Sales'}
                </p>
                <p className="text-2xl font-bold">
                  {customers?.reduce((sum, c) => sum + c.total_spent, 0).toFixed(2) || '0.00'} {language === 'ar' ? 'ر.س' : 'SAR'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === 'ar' ? 'العميل' : 'Customer'}</TableHead>
                <TableHead>{language === 'ar' ? 'الهاتف' : 'Phone'}</TableHead>
                <TableHead className="text-center">{language === 'ar' ? 'الطلبات' : 'Orders'}</TableHead>
                <TableHead className="text-center">{language === 'ar' ? 'إجمالي الإنفاق' : 'Total Spent'}</TableHead>
                <TableHead>{language === 'ar' ? 'آخر طلب' : 'Last Order'}</TableHead>
                <TableHead>{language === 'ar' ? 'تاريخ التسجيل' : 'Joined'}</TableHead>
                <TableHead className="text-center">{language === 'ar' ? 'الإجراءات' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 mx-auto" /></TableCell>
                  </TableRow>
                ))
              ) : customers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {language === 'ar' ? 'لا يوجد عملاء' : 'No customers found'}
                  </TableCell>
                </TableRow>
              ) : (
                customers?.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {customer.avatar_url ? (
                            <img 
                              src={customer.avatar_url} 
                              alt="" 
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <Users className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {language === 'ar' 
                              ? (customer.full_name_ar || customer.full_name || 'غير محدد')
                              : (customer.full_name || 'Not specified')}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">
                        {customer.phone || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={customer.order_count > 0 ? 'default' : 'secondary'}>
                        {customer.order_count}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {customer.total_spent.toFixed(2)} {language === 'ar' ? 'ر.س' : 'SAR'}
                    </TableCell>
                    <TableCell>
                      {customer.last_order_date 
                        ? format(new Date(customer.last_order_date), 'MMM d, yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(customer.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetails(customer)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Customer Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {language === 'ar' ? 'تفاصيل العميل' : 'Customer Details'}
              </DialogTitle>
            </DialogHeader>

            {selectedCustomer && (
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {selectedCustomer.avatar_url ? (
                      <img 
                        src={selectedCustomer.avatar_url} 
                        alt="" 
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <Users className="h-8 w-8 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-semibold">
                      {language === 'ar' 
                        ? (selectedCustomer.full_name_ar || selectedCustomer.full_name || 'غير محدد')
                        : (selectedCustomer.full_name || 'Not specified')}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {selectedCustomer.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {selectedCustomer.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {language === 'ar' ? 'انضم في' : 'Joined'} {format(new Date(selectedCustomer.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-card rounded-lg border">
                    <p className="text-2xl font-bold text-primary">{selectedCustomer.order_count}</p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'طلبات' : 'Orders'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-card rounded-lg border">
                    <p className="text-2xl font-bold text-emerald-600">
                      {selectedCustomer.total_spent.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'إجمالي الإنفاق (ر.س)' : 'Total Spent (SAR)'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-card rounded-lg border">
                    <p className="text-2xl font-bold text-amber-600">
                      {selectedCustomer.order_count > 0 
                        ? (selectedCustomer.total_spent / selectedCustomer.order_count).toFixed(2)
                        : '0.00'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'متوسط الطلب (ر.س)' : 'Avg Order (SAR)'}
                    </p>
                  </div>
                </div>

                {/* Recent Orders */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    {language === 'ar' ? 'الطلبات الأخيرة' : 'Recent Orders'}
                  </h4>
                  
                  {ordersLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : customerOrders?.length === 0 ? (
                    <p className="text-center py-6 text-muted-foreground">
                      {language === 'ar' ? 'لا توجد طلبات' : 'No orders yet'}
                    </p>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{language === 'ar' ? 'رقم الطلب' : 'Order #'}</TableHead>
                            <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                            <TableHead>{language === 'ar' ? 'المبلغ' : 'Amount'}</TableHead>
                            <TableHead>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customerOrders?.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-mono text-sm">
                                {order.order_number}
                              </TableCell>
                              <TableCell>{getStatusBadge(order.status)}</TableCell>
                              <TableCell>
                                {order.total.toFixed(2)} {language === 'ar' ? 'ر.س' : 'SAR'}
                              </TableCell>
                              <TableCell>
                                {format(new Date(order.created_at), 'MMM d, yyyy')}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}