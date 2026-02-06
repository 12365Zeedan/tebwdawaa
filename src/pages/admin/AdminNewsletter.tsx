import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Mail,
  Download,
  UserMinus,
  Users,
  CheckCircle,
  XCircle,
  Send,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';

interface Subscriber {
  id: string;
  email: string;
  user_id: string | null;
  is_confirmed: boolean;
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
  created_at: string;
}

export default function AdminNewsletter() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [unsubscribeTarget, setUnsubscribeTarget] = useState<Subscriber | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSendingDigest, setIsSendingDigest] = useState(false);

  // Fetch all subscribers
  const { data: subscribers, isLoading } = useQuery({
    queryKey: ['admin-newsletter-subscribers'],
    queryFn: async (): Promise<Subscriber[]> => {
      const { data, error } = await (supabase as any)
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Unsubscribe mutation
  const unsubscribeMutation = useMutation({
    mutationFn: async (subscriberId: string) => {
      const { error } = await (supabase as any)
        .from('newsletter_subscribers')
        .update({
          is_active: false,
          unsubscribed_at: new Date().toISOString(),
        })
        .eq('id', subscriberId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-newsletter-subscribers'] });
      setUnsubscribeTarget(null);
      toast({
        title: isAr ? 'تم إلغاء الاشتراك' : 'Unsubscribed',
        description: isAr ? 'تم إلغاء اشتراك المستخدم بنجاح' : 'User has been unsubscribed successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Resubscribe mutation
  const resubscribeMutation = useMutation({
    mutationFn: async (subscriberId: string) => {
      const { error } = await (supabase as any)
        .from('newsletter_subscribers')
        .update({
          is_active: true,
          unsubscribed_at: null,
        })
        .eq('id', subscriberId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-newsletter-subscribers'] });
      toast({
        title: isAr ? 'تم إعادة الاشتراك' : 'Resubscribed',
        description: isAr ? 'تم إعادة اشتراك المستخدم بنجاح' : 'User has been resubscribed successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Stats
  const stats = useMemo(() => {
    if (!subscribers) return { total: 0, active: 0, inactive: 0 };
    return {
      total: subscribers.length,
      active: subscribers.filter(s => s.is_active).length,
      inactive: subscribers.filter(s => !s.is_active).length,
    };
  }, [subscribers]);

  // Filter subscribers
  const filtered = useMemo(() => {
    if (!subscribers) return [];
    if (!searchQuery.trim()) return subscribers;
    const q = searchQuery.toLowerCase();
    return subscribers.filter(s => s.email.toLowerCase().includes(q));
  }, [subscribers, searchQuery]);

  // Export CSV
  const exportToCSV = () => {
    if (!subscribers || subscribers.length === 0) {
      toast({
        title: isAr ? 'لا توجد بيانات' : 'No Data',
        description: isAr ? 'لا يوجد مشتركين للتصدير' : 'No subscribers to export',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    try {
      const headers = ['Email', 'Status', 'Subscribed Date', 'Unsubscribed Date'];
      const rows = subscribers.map(s => [
        s.email,
        s.is_active ? 'Active' : 'Inactive',
        format(new Date(s.subscribed_at), 'yyyy-MM-dd HH:mm'),
        s.unsubscribed_at ? format(new Date(s.unsubscribed_at), 'yyyy-MM-dd HH:mm') : '',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')),
      ].join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `newsletter_subscribers_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: isAr ? 'تم التصدير' : 'Exported',
        description: isAr
          ? `تم تصدير ${subscribers.length} مشترك`
          : `Exported ${subscribers.length} subscribers`,
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Send digest manually
  const sendDigest = async () => {
    setIsSendingDigest(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-blog-digest', {
        body: { days: 7 },
      });
      if (error) throw error;

      toast({
        title: isAr ? 'تم إرسال النشرة' : 'Digest Sent',
        description: isAr
          ? `تم الإرسال إلى ${data?.sentCount || 0} مشترك`
          : `Sent to ${data?.sentCount || 0} subscribers (${data?.postsIncluded || 0} posts included)`,
      });
    } catch (error: any) {
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSendingDigest(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Mail className="h-6 w-6" />
              {isAr ? 'النشرة البريدية' : 'Newsletter'}
            </h1>
            <p className="text-muted-foreground">
              {isAr ? 'إدارة المشتركين وإرسال النشرات البريدية' : 'Manage subscribers and send digest emails'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={sendDigest}
              disabled={isSendingDigest || stats.active === 0}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {isSendingDigest
                ? (isAr ? 'جاري الإرسال...' : 'Sending...')
                : (isAr ? 'إرسال نشرة أسبوعية' : 'Send Weekly Digest')}
            </Button>
            <Button
              variant="outline"
              onClick={exportToCSV}
              disabled={isExporting || isLoading || !subscribers?.length}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {isAr ? 'تصدير CSV' : 'Export CSV'}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border/50 shadow-soft p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isAr ? 'إجمالي المشتركين' : 'Total Subscribers'}
                </p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border/50 shadow-soft p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-success/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isAr ? 'نشطين' : 'Active'}
                </p>
                <p className="text-2xl font-bold text-foreground">{stats.active}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border/50 shadow-soft p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-muted rounded-lg">
                <XCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isAr ? 'غير نشطين' : 'Unsubscribed'}
                </p>
                <p className="text-2xl font-bold text-foreground">{stats.inactive}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isAr ? 'البحث بالبريد الإلكتروني...' : 'Search by email...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-9"
          />
        </div>

        {/* Subscribers Table */}
        <div className="bg-card rounded-xl border border-border/50 shadow-soft overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isAr ? 'البريد الإلكتروني' : 'Email'}</TableHead>
                <TableHead>{isAr ? 'الحالة' : 'Status'}</TableHead>
                <TableHead>{isAr ? 'تاريخ الاشتراك' : 'Subscribed'}</TableHead>
                <TableHead className="text-end">{isAr ? 'إجراءات' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24 ms-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filtered.length > 0 ? (
                filtered.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{sub.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {sub.is_active ? (
                        <Badge className="gap-1 bg-success/10 text-success border-success/20">
                          <CheckCircle className="h-3 w-3" />
                          {isAr ? 'نشط' : 'Active'}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          {isAr ? 'غير نشط' : 'Inactive'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(sub.subscribed_at), 'MMM d, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell className="text-end">
                      {sub.is_active ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-destructive hover:bg-destructive/10"
                          onClick={() => setUnsubscribeTarget(sub)}
                        >
                          <UserMinus className="h-4 w-4" />
                          {isAr ? 'إلغاء' : 'Unsubscribe'}
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-success hover:bg-success/10"
                          onClick={() => resubscribeMutation.mutate(sub.id)}
                          disabled={resubscribeMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4" />
                          {isAr ? 'إعادة الاشتراك' : 'Resubscribe'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <Mail className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
                    <p className="text-muted-foreground">
                      {searchQuery
                        ? (isAr ? 'لا توجد نتائج مطابقة' : 'No matching subscribers')
                        : (isAr ? 'لا يوجد مشتركين بعد' : 'No subscribers yet')}
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Unsubscribe Confirmation */}
      <AlertDialog open={!!unsubscribeTarget} onOpenChange={() => setUnsubscribeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isAr ? 'إلغاء الاشتراك' : 'Unsubscribe User'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isAr
                ? `هل أنت متأكد من إلغاء اشتراك ${unsubscribeTarget?.email}؟`
                : `Are you sure you want to unsubscribe ${unsubscribeTarget?.email}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isAr ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => unsubscribeTarget && unsubscribeMutation.mutate(unsubscribeTarget.id)}
              className="bg-destructive text-destructive-foreground"
            >
              {isAr ? 'إلغاء الاشتراك' : 'Unsubscribe'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
