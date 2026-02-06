import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBlogTags, useCreateBlogTag, usePostTags } from '@/hooks/useAdminBlog';
import type { AdminBlogPost, BlogPostFormData } from '@/hooks/useAdminBlog';
import { X, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlogPostFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post?: AdminBlogPost | null;
  onSubmit: (data: BlogPostFormData) => void;
  isLoading?: boolean;
}

export function BlogPostFormDialog({ open, onOpenChange, post, onSubmit, isLoading }: BlogPostFormDialogProps) {
  const { language, direction } = useLanguage();
  const isAr = language === 'ar';

  const { data: allTags = [] } = useBlogTags();
  const { data: existingTagIds = [] } = usePostTags(post?.id || '');
  const createTag = useCreateBlogTag();

  const [form, setForm] = useState<BlogPostFormData>({
    title: '', title_ar: '', slug: '', excerpt: '', excerpt_ar: '',
    content: '', content_ar: '', image_url: null,
    author_name: '', author_name_ar: '',
    category: '', category_ar: '', read_time: 5,
    is_published: false,
    meta_title: '', meta_title_ar: '', meta_description: '', meta_description_ar: '',
    tag_ids: [],
  });

  const [newTagName, setNewTagName] = useState('');
  const [newTagNameAr, setNewTagNameAr] = useState('');

  useEffect(() => {
    if (post) {
      setForm({
        title: post.title, title_ar: post.title_ar, slug: post.slug,
        excerpt: post.excerpt || '', excerpt_ar: post.excerpt_ar || '',
        content: post.content || '', content_ar: post.content_ar || '',
        image_url: post.image_url,
        author_name: post.author_name || '', author_name_ar: post.author_name_ar || '',
        category: post.category || '', category_ar: post.category_ar || '',
        read_time: post.read_time || 5, is_published: post.is_published || false,
        meta_title: post.meta_title || '', meta_title_ar: post.meta_title_ar || '',
        meta_description: post.meta_description || '', meta_description_ar: post.meta_description_ar || '',
        tag_ids: existingTagIds,
      });
    } else {
      setForm({
        title: '', title_ar: '', slug: '', excerpt: '', excerpt_ar: '',
        content: '', content_ar: '', image_url: null,
        author_name: '', author_name_ar: '',
        category: '', category_ar: '', read_time: 5,
        is_published: false,
        meta_title: '', meta_title_ar: '', meta_description: '', meta_description_ar: '',
        tag_ids: [],
      });
    }
  }, [post, existingTagIds]);

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setForm(prev => ({ ...prev, title, slug: generateSlug(title) }));
  };

  const toggleTag = (tagId: string) => {
    setForm(prev => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId)
        ? prev.tag_ids.filter(id => id !== tagId)
        : [...prev.tag_ids, tagId],
    }));
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    const result = await createTag.mutateAsync({ name: newTagName, name_ar: newTagNameAr || newTagName });
    setForm(prev => ({ ...prev, tag_ids: [...prev.tag_ids, result.id] }));
    setNewTagName('');
    setNewTagNameAr('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            {post ? (isAr ? 'تعديل المقال' : 'Edit Post') : (isAr ? 'مقال جديد' : 'New Post')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <ScrollArea className="max-h-[70vh] px-6">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="content">{isAr ? 'المحتوى' : 'Content'}</TabsTrigger>
                <TabsTrigger value="media">{isAr ? 'الوسائط' : 'Media'}</TabsTrigger>
                <TabsTrigger value="seo">{isAr ? 'تحسين محركات البحث' : 'SEO'}</TabsTrigger>
                <TabsTrigger value="tags">{isAr ? 'الوسوم' : 'Tags'}</TabsTrigger>
              </TabsList>

              {/* Content Tab */}
              <TabsContent value="content" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title (EN)</Label>
                    <Input value={form.title} onChange={e => handleTitleChange(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>العنوان (AR)</Label>
                    <Input value={form.title_ar} onChange={e => setForm(p => ({ ...p, title_ar: e.target.value }))} dir="rtl" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Excerpt (EN)</Label>
                    <Textarea value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))} rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label>المقتطف (AR)</Label>
                    <Textarea value={form.excerpt_ar} onChange={e => setForm(p => ({ ...p, excerpt_ar: e.target.value }))} rows={3} dir="rtl" />
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
                    <Label>{isAr ? 'الكاتب (EN)' : 'Author (EN)'}</Label>
                    <Input value={form.author_name} onChange={e => setForm(p => ({ ...p, author_name: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>{isAr ? 'الكاتب (AR)' : 'Author (AR)'}</Label>
                    <Input value={form.author_name_ar} onChange={e => setForm(p => ({ ...p, author_name_ar: e.target.value }))} dir="rtl" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isAr ? 'الفئة (EN)' : 'Category (EN)'}</Label>
                    <Input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>{isAr ? 'الفئة (AR)' : 'Category (AR)'}</Label>
                    <Input value={form.category_ar} onChange={e => setForm(p => ({ ...p, category_ar: e.target.value }))} dir="rtl" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isAr ? 'وقت القراءة (دقائق)' : 'Read Time (min)'}</Label>
                    <Input type="number" value={form.read_time} onChange={e => setForm(p => ({ ...p, read_time: parseInt(e.target.value) || 5 }))} min={1} />
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <Switch checked={form.is_published} onCheckedChange={val => setForm(p => ({ ...p, is_published: val }))} />
                    <Label>{isAr ? 'منشور' : 'Published'}</Label>
                  </div>
                </div>
              </TabsContent>

              {/* Media Tab */}
              <TabsContent value="media" className="space-y-4">
                <div className="space-y-2">
                  <Label>{isAr ? 'صورة المقال الرئيسية' : 'Featured Image'}</Label>
                  <ImageUpload
                    value={form.image_url}
                    onChange={url => setForm(p => ({ ...p, image_url: url }))}
                    bucket="blog-images"
                    folder="covers"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {isAr ? 'يمكنك أيضًا إضافة صور داخل المحتوى باستخدام زر الصورة في محرر النصوص.' : 'You can also add images within the content using the image button in the rich text editor.'}
                </p>
              </TabsContent>

              {/* SEO Tab */}
              <TabsContent value="seo" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Meta Title (EN)</Label>
                    <Input value={form.meta_title} onChange={e => setForm(p => ({ ...p, meta_title: e.target.value }))} placeholder={form.title} maxLength={60} />
                    <p className="text-xs text-muted-foreground">{form.meta_title.length}/60</p>
                  </div>
                  <div className="space-y-2">
                    <Label>عنوان الميتا (AR)</Label>
                    <Input value={form.meta_title_ar} onChange={e => setForm(p => ({ ...p, meta_title_ar: e.target.value }))} dir="rtl" placeholder={form.title_ar} maxLength={60} />
                    <p className="text-xs text-muted-foreground">{form.meta_title_ar.length}/60</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Meta Description (EN)</Label>
                    <Textarea value={form.meta_description} onChange={e => setForm(p => ({ ...p, meta_description: e.target.value }))} placeholder={form.excerpt} maxLength={160} rows={3} />
                    <p className="text-xs text-muted-foreground">{form.meta_description.length}/160</p>
                  </div>
                  <div className="space-y-2">
                    <Label>وصف الميتا (AR)</Label>
                    <Textarea value={form.meta_description_ar} onChange={e => setForm(p => ({ ...p, meta_description_ar: e.target.value }))} dir="rtl" placeholder={form.excerpt_ar} maxLength={160} rows={3} />
                    <p className="text-xs text-muted-foreground">{form.meta_description_ar.length}/160</p>
                  </div>
                </div>

                {/* SEO Preview */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{isAr ? 'معاينة نتائج البحث' : 'Search Preview'}</p>
                  <div>
                    <p className="text-primary text-lg font-medium truncate">{form.meta_title || form.title || 'Page Title'}</p>
                    <p className="text-sm text-success truncate">yoursite.com/blog/{form.slug || 'post-slug'}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{form.meta_description || form.excerpt || 'Description...'}</p>
                  </div>
                </div>
              </TabsContent>

              {/* Tags Tab */}
              <TabsContent value="tags" className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <Badge
                      key={tag.id}
                      variant={form.tag_ids.includes(tag.id) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag.id)}
                    >
                      {isAr ? tag.name_ar : tag.name}
                      {form.tag_ids.includes(tag.id) && <X className="h-3 w-3 ms-1" />}
                    </Badge>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-3">
                  <p className="text-sm font-medium">{isAr ? 'إضافة وسم جديد' : 'Add New Tag'}</p>
                  <div className="flex gap-2">
                    <Input placeholder="Tag name (EN)" value={newTagName} onChange={e => setNewTagName(e.target.value)} className="flex-1" />
                    <Input placeholder="اسم الوسم (AR)" value={newTagNameAr} onChange={e => setNewTagNameAr(e.target.value)} dir="rtl" className="flex-1" />
                    <Button type="button" size="sm" onClick={handleAddTag} disabled={!newTagName.trim() || createTag.isPending}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </ScrollArea>

          <div className="flex justify-end gap-3 px-6 py-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
              {post ? (isAr ? 'تحديث' : 'Update') : (isAr ? 'إنشاء' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
