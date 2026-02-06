import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { FileText, File, FolderTree, Tag, Image, Shield } from 'lucide-react';
import { BlogPostsTab } from '@/components/admin/blog/BlogPostsTab';
import { BlogPagesTab } from '@/components/admin/blog/BlogPagesTab';
import { BlogCategoriesTab } from '@/components/admin/blog/BlogCategoriesTab';
import { BlogTagsTab } from '@/components/admin/blog/BlogTagsTab';
import { BlogMediaTab } from '@/components/admin/blog/BlogMediaTab';
import { CopyProtectionTab } from '@/components/admin/blog/CopyProtectionTab';

const AdminBlog = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isAr ? 'إدارة المدونة' : 'Blog Management'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAr ? 'إدارة المقالات والصفحات والفئات والوسوم والوسائط' : 'Manage posts, pages, categories, tags, media and settings'}
          </p>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="posts" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <FileText className="h-4 w-4" />
              {isAr ? 'المقالات' : 'Posts'}
            </TabsTrigger>
            <TabsTrigger value="pages" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <File className="h-4 w-4" />
              {isAr ? 'الصفحات' : 'Pages'}
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <FolderTree className="h-4 w-4" />
              {isAr ? 'الفئات' : 'Categories'}
            </TabsTrigger>
            <TabsTrigger value="tags" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Tag className="h-4 w-4" />
              {isAr ? 'الوسوم' : 'Tags'}
            </TabsTrigger>
            <TabsTrigger value="media" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Image className="h-4 w-4" />
              {isAr ? 'الوسائط' : 'Media'}
            </TabsTrigger>
            <TabsTrigger value="protection" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Shield className="h-4 w-4" />
              {isAr ? 'حماية المحتوى' : 'Copy Protection'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <BlogPostsTab />
          </TabsContent>

          <TabsContent value="pages" className="mt-6">
            <BlogPagesTab />
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <BlogCategoriesTab />
          </TabsContent>

          <TabsContent value="tags" className="mt-6">
            <BlogTagsTab />
          </TabsContent>

          <TabsContent value="media" className="mt-6">
            <BlogMediaTab />
          </TabsContent>

          <TabsContent value="protection" className="mt-6">
            <CopyProtectionTab />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminBlog;
