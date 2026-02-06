import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBlogPages, useCreateBlogPage, useUpdateBlogPage, useDeleteBlogPage } from '@/hooks/useAdminBlogPages';
import type { BlogPage, BlogPageFormData } from '@/hooks/useAdminBlogPages';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const emptyForm: BlogPageFormData = {
  title: '', title_ar: '', slug: '', content: '', content_ar: '',
  is_published: false, sort_order: 0,
  meta_title: '', meta_title_ar: '', meta_description: '', meta_description_ar: '',
};

export function BlogPagesTab() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<BlogPage | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<BlogPageFormData>({ ...emptyForm });

  const { data: pages, isLoading } = useBlogPages();
  const createPage = useCreateBlogPage();
  const updatePage = useUpdateBlogPage();
  const deletePage = useDeleteBlogPage();

  const handleOpenNew = () => {
    setEditingPage(null);
    setForm({ ...emptyForm });
    setDialogOpen(true);
  };

  const handleEdit = (page: BlogPage) => {
    setEditingPage(page);
    setForm({
      title: page.title, title_ar: page.title_ar, slug: page.slug,
      content: page.content || '', content_ar: page.content_ar || '',
      is_published: page.is_published, sort_order: page.sort_order,
      meta_title: page.meta_title || '', meta_title_ar: page.meta_title_ar || '',
      meta_description: page.meta_description || '', meta_description_ar: page.meta_description_ar || '',
    });
    setDialogOpen(true);
  };

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPage) {
      updatePage.mutate({ id: editingPage.id, data: form }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createPage.mutate(form, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleDelete = () => {
    if (deleteId) deletePage.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {isAr ? 'إدارة الصفحات الثابتة مثل "من نحن" أو "سياسة الخصوصية"' : 'Manage static pages like "About Us" or "Privacy Policy"'}
        </p>
        <Button className="gap-2" onClick={handleOpenNew}>
          <Plus className="h-4 w-4" />
          {isAr ? 'إضافة صفحة' : 'Add Page'}
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border/50 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">{isAr ? 'الصفحة' : 'Page'}</th>
                <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">{isAr ? 'الرابط' : 'Slug'}</th>
                <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">{isAr ? 'الترتيب' : 'Order'}</th>
                <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">{isAr ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-6 py-4"><Skeleton className="h-5 w-40" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-10" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-20" /></td>
                  </tr>
                ))
              ) : pages && pages.length > 0 ? (
                pages.map((page) => (
                  <tr key={page.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">{isAr ? page.title_ar : page.title}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground font-mono">/{page.slug}</td>
                    <td className="px-6 py-4">
                      {page.is_published ? (
                        <Badge className="gap-1 bg-success text-success-foreground"><Eye className="h-3 w-3" /> {isAr ? 'منشور' : 'Published'}</Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1"><EyeOff className="h-3 w-3" /> {isAr ? 'مسودة' : 'Draft'}</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{page.sort_order}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(page)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(page.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    {isAr ? 'لا توجد صفحات بعد' : 'No pages yet'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Page Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>
              {editingPage ? (isAr ? 'تعديل الصفحة' : 'Edit Page') : (isAr ? 'صفحة جديدة' : 'New Page')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <ScrollArea className="max-h-[70vh] px-6 pb-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title (EN)</Label>
                    <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value, slug: generateSlug(e.target.value) }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label>العنوان (AR)</Label>
                    <Input value={form.title_ar} onChange={e => setForm(p => ({ ...p, title_ar: e.target.value }))} dir="rtl" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Slug</Label>
                    <Input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label>{isAr ? 'الترتيب' : 'Sort Order'}</Label>
                    <Input type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Content (EN)</Label>
                  <RichTextEditor content={form.content} onChange={val => setForm(p => ({ ...p, content: val }))} dir="ltr" />
                </div>

                <div className="space-y-2">
                  <Label>المحتوى (AR)</Label>
                  <RichTextEditor content={form.content_ar} onChange={val => setForm(p => ({ ...p, content_ar: val }))} dir="rtl" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Meta Title (EN)</Label>
                    <Input value={form.meta_title} onChange={e => setForm(p => ({ ...p, meta_title: e.target.value }))} maxLength={60} />
                  </div>
                  <div className="space-y-2">
                    <Label>عنوان الميتا (AR)</Label>
                    <Input value={form.meta_title_ar} onChange={e => setForm(p => ({ ...p, meta_title_ar: e.target.value }))} dir="rtl" maxLength={60} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Meta Description (EN)</Label>
                    <Textarea value={form.meta_description} onChange={e => setForm(p => ({ ...p, meta_description: e.target.value }))} maxLength={160} rows={2} />
                  </div>
                  <div className="space-y-2">
                    <Label>وصف الميتا (AR)</Label>
                    <Textarea value={form.meta_description_ar} onChange={e => setForm(p => ({ ...p, meta_description_ar: e.target.value }))} dir="rtl" maxLength={160} rows={2} />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Switch checked={form.is_published} onCheckedChange={val => setForm(p => ({ ...p, is_published: val }))} />
                  <Label>{isAr ? 'منشور' : 'Published'}</Label>
                </div>
              </div>
            </ScrollArea>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{isAr ? 'إلغاء' : 'Cancel'}</Button>
              <Button type="submit" disabled={createPage.isPending || updatePage.isPending}>
                {editingPage ? (isAr ? 'حفظ' : 'Save') : (isAr ? 'إنشاء' : 'Create')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isAr ? 'حذف الصفحة' : 'Delete Page'}</AlertDialogTitle>
            <AlertDialogDescription>
              {isAr ? 'هل أنت متأكد من حذف هذه الصفحة؟' : 'Are you sure you want to delete this page? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isAr ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">{isAr ? 'حذف' : 'Delete'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
