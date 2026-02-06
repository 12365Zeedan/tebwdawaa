import React, { useState } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBlogTags, useCreateBlogTag, useDeleteBlogTag } from '@/hooks/useAdminBlog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function BlogTagsTab() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [newTagName, setNewTagName] = useState('');
  const [newTagNameAr, setNewTagNameAr] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: tags, isLoading } = useBlogTags();
  const createTag = useCreateBlogTag();
  const deleteTag = useDeleteBlogTag();

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    await createTag.mutateAsync({ name: newTagName, name_ar: newTagNameAr || newTagName });
    setNewTagName('');
    setNewTagNameAr('');
  };

  const handleDelete = () => {
    if (deleteId) deleteTag.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">
        {isAr ? 'إدارة وسوم المدونة لتنظيم المقالات' : 'Manage blog tags for organizing and filtering posts'}
      </p>

      {/* Add Tag Form */}
      <div className="bg-card rounded-xl border border-border/50 shadow-soft p-6">
        <h3 className="text-sm font-medium text-foreground mb-4">{isAr ? 'إضافة وسم جديد' : 'Add New Tag'}</h3>
        <div className="flex items-end gap-3">
          <div className="flex-1 space-y-2">
            <Label>Name (EN)</Label>
            <Input
              placeholder={isAr ? 'اسم الوسم بالإنجليزية' : 'Tag name in English'}
              value={newTagName}
              onChange={e => setNewTagName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label>الاسم (AR)</Label>
            <Input
              placeholder={isAr ? 'اسم الوسم بالعربية' : 'Tag name in Arabic'}
              value={newTagNameAr}
              onChange={e => setNewTagNameAr(e.target.value)}
              dir="rtl"
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            />
          </div>
          <Button onClick={handleAddTag} disabled={!newTagName.trim() || createTag.isPending} className="gap-2">
            <Plus className="h-4 w-4" />
            {isAr ? 'إضافة' : 'Add'}
          </Button>
        </div>
      </div>

      {/* Tags List */}
      <div className="bg-card rounded-xl border border-border/50 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-sm font-medium text-foreground">
            {isAr ? 'جميع الوسوم' : 'All Tags'} {tags && <span className="text-muted-foreground">({tags.length})</span>}
          </h3>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-24 rounded-full" />
              ))}
            </div>
          ) : tags && tags.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {tags.map(tag => (
                <div
                  key={tag.id}
                  className="group flex items-center gap-2 rounded-full border border-border bg-muted/30 px-4 py-2 transition-colors hover:border-destructive/30"
                >
                  <span className="text-sm font-medium text-foreground">{isAr ? tag.name_ar : tag.name}</span>
                  {!isAr && tag.name_ar !== tag.name && (
                    <span className="text-xs text-muted-foreground">({tag.name_ar})</span>
                  )}
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80"
                    onClick={() => setDeleteId(tag.id)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {isAr ? 'لا توجد وسوم بعد' : 'No tags yet. Add your first tag above.'}
            </p>
          )}
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isAr ? 'حذف الوسم' : 'Delete Tag'}</AlertDialogTitle>
            <AlertDialogDescription>
              {isAr ? 'هل أنت متأكد من حذف هذا الوسم؟ سيتم إزالته من جميع المقالات المرتبطة.' : 'Are you sure? This tag will be removed from all associated posts.'}
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
