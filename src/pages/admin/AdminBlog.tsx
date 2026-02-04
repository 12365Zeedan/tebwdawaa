import React from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { mockBlogPosts } from '@/data/mockData';
import { cn } from '@/lib/utils';

const AdminBlog = () => {
  const { language, t, direction } = useLanguage();

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('admin.blog')}</h1>
            <p className="text-muted-foreground mt-1">
              {language === 'ar' ? 'إدارة مقالات المدونة' : 'Manage blog posts'}
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {language === 'ar' ? 'إضافة مقال' : 'Add Post'}
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
            placeholder={language === 'ar' ? 'البحث عن مقال...' : 'Search posts...'}
            className={cn('bg-muted/50', direction === 'rtl' ? 'pr-10' : 'pl-10')}
          />
        </div>

        {/* Blog Posts Table */}
        <div className="bg-card rounded-xl border border-border/50 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">
                    {language === 'ar' ? 'المقال' : 'Post'}
                  </th>
                  <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">
                    {language === 'ar' ? 'الكاتب' : 'Author'}
                  </th>
                  <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">
                    {language === 'ar' ? 'الفئة' : 'Category'}
                  </th>
                  <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">
                    {language === 'ar' ? 'التاريخ' : 'Date'}
                  </th>
                  <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">
                    {language === 'ar' ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockBlogPosts.map((post) => {
                  const title = language === 'ar' ? post.titleAr : post.title;
                  const author = language === 'ar' ? post.authorAr : post.author;
                  const category = language === 'ar' ? post.categoryAr : post.category;
                  
                  return (
                    <tr key={post.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={post.image}
                            alt={title}
                            className="w-16 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium text-foreground line-clamp-1">{title}</p>
                            <p className="text-xs text-muted-foreground">
                              {post.readTime} {language === 'ar' ? 'دقائق' : 'min read'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">{author}</td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary">{category}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">{post.date}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBlog;
