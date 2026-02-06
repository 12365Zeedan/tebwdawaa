import React, { useState } from 'react';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBlogCategories, useCreateBlogCategory, useUpdateBlogCategory, useDeleteBlogCategory } from '@/hooks/useAdminBlogCategories';
import type { BlogCategory, BlogCategoryFormData } from '@/hooks/useAdminBlogCategories';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const emptyForm: BlogCategoryFormData = {
  name: '', name_ar: '', slug: '', description: '', description_ar: '',
  is_active: true, sort_order: 0,
};

export function BlogCategoriesTab() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<BlogCategory | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<BlogCategoryFormData>({ ...emptyForm });

  const { data: categories, isLoading } = useBlogCategories();
  const createCat = useCreateBlogCategory();
  const updateCat = useUpdateBlogCategory();
  const deleteCat = useDeleteBlogCategory();

  const handleOpenNew = () => {
    setEditingCat(null);
    setForm({ ...emptyForm });
    setDialogOpen(true);
  };

  const handleEdit = (cat: BlogCategory) => {
    setEditingCat(cat);
    setForm({
      name: cat.name, name_ar: cat.name_ar, slug: cat.slug,
      description: cat.description || '', description_ar: cat.description_ar || '',
      is_active: cat.is_active, sort_order: cat.sort_order,
    });
    setDialogOpen(true);
  };

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCat) {
      updateCat.mutate({ id: editingCat.id, data: form }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createCat.mutate(form, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleDelete = () => {
    if (deleteId) deleteCat.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {isAr ? 'إدارة فئات المدونة' : 'Manage blog categories for organizing posts'}
        </p>
        <Button className="gap-2" onClick={handleOpenNew}>
          <Plus className="h-4 w-4" />
          {isAr ? 'إضافة فئة' : 'Add Category'}
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border/50 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">{isAr ? 'الفئة' : 'Category'}</th>
                <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">{isAr ? 'الرابط' : 'Slug'}</th>
                <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">{isAr ? 'الوصف' : 'Description'}</th>
                <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">{isAr ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-6 py-4"><Skeleton className="h-5 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-28" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-40" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-20" /></td>
                  </tr>
                ))
              ) : categories && categories.length > 0 ? (
                categories.map((cat) => (
                  <tr key={cat.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">{isAr ? cat.name_ar : cat.name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{cat.slug}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground line-clamp-1 max-w-xs">
                      {(isAr ? cat.description_ar : cat.description) || '—'}
                    </td>
                    <td className="px-6 py-4">
                      {cat.is_active ? (
                        <Badge className="gap-1 bg-success text-success-foreground"><ToggleRight className="h-3 w-3" /> {isAr ? 'نشط' : 'Active'}</Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1"><ToggleLeft className="h-3 w-3" /> {isAr ? 'غير نشط' : 'Inactive'}</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(cat)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(cat.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    {isAr ? 'لا توجد فئات بعد' : 'No categories yet'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCat ? (isAr ? 'تعديل الفئة' : 'Edit Category') : (isAr ? 'فئة جديدة' : 'New Category')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name (EN)</Label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value, slug: generateSlug(e.target.value) }))} required />
              </div>
              <div className="space-y-2">
                <Label>الاسم (AR)</Label>
                <Input value={form.name_ar} onChange={e => setForm(p => ({ ...p, name_ar: e.target.value }))} dir="rtl" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Description (EN)</Label>
                <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>الوصف (AR)</Label>
                <Textarea value={form.description_ar} onChange={e => setForm(p => ({ ...p, description_ar: e.target.value }))} dir="rtl" rows={2} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isAr ? 'الترتيب' : 'Sort Order'}</Label>
                <Input type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch checked={form.is_active} onCheckedChange={val => setForm(p => ({ ...p, is_active: val }))} />
                <Label>{isAr ? 'نشط' : 'Active'}</Label>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{isAr ? 'إلغاء' : 'Cancel'}</Button>
              <Button type="submit" disabled={createCat.isPending || updateCat.isPending}>
                {editingCat ? (isAr ? 'حفظ' : 'Save') : (isAr ? 'إنشاء' : 'Create')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isAr ? 'حذف الفئة' : 'Delete Category'}</AlertDialogTitle>
            <AlertDialogDescription>
              {isAr ? 'هل أنت متأكد من حذف هذه الفئة؟' : 'Are you sure you want to delete this category?'}
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
