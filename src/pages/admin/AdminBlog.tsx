import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BlogPostFormDialog } from '@/components/admin/BlogPostFormDialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdminBlogPosts, useCreateBlogPost, useUpdateBlogPost, useDeleteBlogPost } from '@/hooks/useAdminBlog';
import type { AdminBlogPost, BlogPostFormData } from '@/hooks/useAdminBlog';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const AdminBlog = () => {
  const { language, direction } = useLanguage();
  const isAr = language === 'ar';

  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<AdminBlogPost | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: posts, isLoading } = useAdminBlogPosts(search || undefined);
  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();
  const deletePost = useDeleteBlogPost();

  const handleOpenNew = () => { setEditingPost(null); setDialogOpen(true); };
  const handleEdit = (post: AdminBlogPost) => { setEditingPost(post); setDialogOpen(true); };

  const handleSubmit = (data: BlogPostFormData) => {
    if (editingPost) {
      updatePost.mutate({ id: editingPost.id, data }, {
        onSuccess: () => {
          // Clear draft from localStorage on successful save
          try { localStorage.removeItem(`blog-draft-${editingPost.id}`); } catch {}
          setDialogOpen(false);
        }
      });
    } else {
      createPost.mutate(data, {
        onSuccess: () => {
          // Clear new post draft on successful save
          try { localStorage.removeItem('blog-draft-new'); } catch {}
          setDialogOpen(false);
        }
      });
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deletePost.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{isAr ? 'المقالات' : 'Blog Posts'}</h1>
            <p className="text-muted-foreground mt-1">
              {isAr ? 'إدارة مقالات المدونة' : 'Manage blog posts'}
            </p>
          </div>
          <Button className="gap-2" onClick={handleOpenNew}>
            <Plus className="h-4 w-4" />
            {isAr ? 'إضافة مقال' : 'Add Post'}
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className={cn(
            'absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground',
            direction === 'rtl' ? 'right-3' : 'left-3'
          )} />
          <Input
            type="search"
            placeholder={isAr ? 'البحث عن مقال...' : 'Search posts...'}
            className={cn('bg-muted/50', direction === 'rtl' ? 'pr-10' : 'pl-10')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border/50 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">
                    {isAr ? 'المقال' : 'Post'}
                  </th>
                  <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">
                    {isAr ? 'الكاتب' : 'Author'}
                  </th>
                  <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">
                    {isAr ? 'الفئة' : 'Category'}
                  </th>
                  <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">
                    {isAr ? 'الحالة' : 'Status'}
                  </th>
                  <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">
                    {isAr ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="px-6 py-4"><Skeleton className="h-12 w-64" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-8 w-20" /></td>
                    </tr>
                  ))
                ) : posts && posts.length > 0 ? (
                  posts.map((post) => {
                    const title = isAr ? post.title_ar : post.title;
                    const author = isAr ? post.author_name_ar : post.author_name;
                    const category = isAr ? post.category_ar : post.category;

                    return (
                      <tr key={post.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {post.image_url && (
                              <img src={post.image_url} alt={title} className="w-16 h-12 rounded-lg object-cover" />
                            )}
                            <div>
                              <p className="font-medium text-foreground line-clamp-1">{title}</p>
                              <p className="text-xs text-muted-foreground">
                                {post.read_time} {isAr ? 'دقائق' : 'min read'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">{author || '—'}</td>
                        <td className="px-6 py-4">
                          {category ? <Badge variant="secondary">{category}</Badge> : '—'}
                        </td>
                        <td className="px-6 py-4">
                          {post.is_published ? (
                            <Badge className="gap-1 bg-success text-success-foreground">
                              <Eye className="h-3 w-3" /> {isAr ? 'منشور' : 'Published'}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1">
                              <EyeOff className="h-3 w-3" /> {isAr ? 'مسودة' : 'Draft'}
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(post)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(post.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      {isAr ? 'لا توجد مقالات بعد' : 'No blog posts yet'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Form Dialog */}
      <BlogPostFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        post={editingPost}
        onSubmit={handleSubmit}
        isLoading={createPost.isPending || updatePost.isPending}
      />

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isAr ? 'حذف المقال' : 'Delete Post'}</AlertDialogTitle>
            <AlertDialogDescription>
              {isAr ? 'هل أنت متأكد من حذف هذا المقال؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this post? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isAr ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {isAr ? 'حذف' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminBlog;
