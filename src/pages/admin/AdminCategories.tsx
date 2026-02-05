import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, FolderTree, ChevronRight, ChevronDown } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface Category {
  id: string;
  name: string;
  name_ar: string;
  slug: string;
  icon: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  parent_category_id: string | null;
  created_at: string;
}

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  name_ar: z.string().min(1, 'Arabic name is required'),
  slug: z.string().min(1, 'Slug is required'),
  icon: z.string().optional(),
  image_url: z.string().optional(),
  is_active: z.boolean(),
  sort_order: z.number(),
  parent_category_id: z.string().nullable(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

const AdminCategories = () => {
  const { language, direction } = useLanguage();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      name_ar: '',
      slug: '',
      icon: 'pill',
      image_url: '',
      is_active: true,
      sort_order: 0,
      parent_category_id: null,
    },
  });

  // Fetch all categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,name_ar.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Category[];
    },
    enabled: isAdmin,
  });

  // Get parent categories (categories without parent)
  const parentCategories = categories?.filter(c => !c.parent_category_id) || [];

  // Get subcategories for a parent
  const getSubcategories = (parentId: string) => 
    categories?.filter(c => c.parent_category_id === parentId) || [];

  // Create category mutation
  const createCategory = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const insertData: any = {
        name: data.name,
        name_ar: data.name_ar,
        slug: data.slug,
        icon: data.icon,
        image_url: data.image_url || null,
        is_active: data.is_active,
        sort_order: data.sort_order,
        parent_category_id: data.parent_category_id || null,
      };
      const { error } = await supabase.from('categories').insert(insertData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  // Update category mutation
  const updateCategory = useMutation({
    mutationFn: async ({ id, ...data }: CategoryFormData & { id: string }) => {
      const { error } = await supabase
        .from('categories')
        .update({
          ...data,
          parent_category_id: data.parent_category_id || null,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  // Delete category mutation
  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const handleOpenCreate = (parentId?: string) => {
    setSelectedCategory(null);
    form.reset({
      name: '',
      name_ar: '',
      slug: '',
      icon: 'pill',
      image_url: '',
      is_active: true,
      sort_order: 0,
      parent_category_id: parentId || null,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setSelectedCategory(category);
    form.reset({
      name: category.name,
      name_ar: category.name_ar,
      slug: category.slug,
      icon: category.icon || 'pill',
      image_url: category.image_url || '',
      is_active: category.is_active,
      sort_order: category.sort_order,
      parent_category_id: category.parent_category_id,
    });
    setIsFormOpen(true);
  };

  const handleOpenDelete = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (selectedCategory) {
        await updateCategory.mutateAsync({ id: selectedCategory.id, ...data });
        toast({
          title: language === 'ar' ? 'تم التحديث' : 'Updated',
          description: language === 'ar' ? 'تم تحديث الفئة بنجاح' : 'Category updated successfully',
        });
      } else {
        await createCategory.mutateAsync(data);
        toast({
          title: language === 'ar' ? 'تم الإضافة' : 'Created',
          description: language === 'ar' ? 'تم إضافة الفئة بنجاح' : 'Category created successfully',
        });
      }
      setIsFormOpen(false);
      setSelectedCategory(null);
    } catch (error: any) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategory.mutateAsync(categoryToDelete.id);
      toast({
        title: language === 'ar' ? 'تم الحذف' : 'Deleted',
        description: language === 'ar' ? 'تم حذف الفئة بنجاح' : 'Category deleted successfully',
      });
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (error: any) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const toggleExpanded = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">
            {language === 'ar' ? 'غير مصرح لك بالوصول' : 'You are not authorized to access this page'}
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {language === 'ar' ? 'الفئات' : 'Categories'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === 'ar' ? 'إدارة فئات المنتجات والأقسام الفرعية' : 'Manage product categories and subcategories'}
            </p>
          </div>
          <Button className="gap-2" onClick={() => handleOpenCreate()}>
            <Plus className="h-4 w-4" />
            {language === 'ar' ? 'إضافة فئة' : 'Add Category'}
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
            placeholder={language === 'ar' ? 'البحث عن فئة...' : 'Search categories...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn('bg-muted/50', direction === 'rtl' ? 'pr-10' : 'pl-10')}
          />
        </div>

        {/* Categories List */}
        <div className="bg-card rounded-xl border border-border/50 shadow-soft overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : parentCategories.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <FolderTree className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{language === 'ar' ? 'لا توجد فئات' : 'No categories found'}</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {parentCategories.map((category) => {
                const subcategories = getSubcategories(category.id);
                const isExpanded = expandedCategories.has(category.id);
                const hasSubcategories = subcategories.length > 0;

                return (
                  <div key={category.id}>
                    {/* Parent Category Row */}
                    <div className="flex items-center gap-4 p-4 hover:bg-muted/30">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => hasSubcategories && toggleExpanded(category.id)}
                        disabled={!hasSubcategories}
                      >
                        {hasSubcategories ? (
                          isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                        ) : (
                          <div className="w-4" />
                        )}
                      </Button>

                      {category.image_url ? (
                        <img
                          src={category.image_url}
                          alt={language === 'ar' ? category.name_ar : category.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                          <FolderTree className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">
                          {language === 'ar' ? category.name_ar : category.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {subcategories.length} {language === 'ar' ? 'قسم فرعي' : 'subcategories'}
                        </p>
                      </div>

                      <Badge variant={category.is_active ? 'default' : 'secondary'}>
                        {category.is_active 
                          ? (language === 'ar' ? 'نشط' : 'Active')
                          : (language === 'ar' ? 'غير نشط' : 'Inactive')}
                      </Badge>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenCreate(category.id)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleOpenDelete(category)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Subcategories */}
                    {isExpanded && subcategories.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center gap-4 p-4 ps-16 bg-muted/20 hover:bg-muted/40"
                      >
                        <div className="w-8" />

                        {sub.image_url ? (
                          <img
                            src={sub.image_url}
                            alt={language === 'ar' ? sub.name_ar : sub.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <FolderTree className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">
                            {language === 'ar' ? sub.name_ar : sub.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{sub.slug}</p>
                        </div>

                        <Badge variant={sub.is_active ? 'outline' : 'secondary'} className="text-xs">
                          {sub.is_active 
                            ? (language === 'ar' ? 'نشط' : 'Active')
                            : (language === 'ar' ? 'غير نشط' : 'Inactive')}
                        </Badge>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(sub)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleOpenDelete(sub)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Category Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedCategory
                ? (language === 'ar' ? 'تعديل الفئة' : 'Edit Category')
                : (language === 'ar' ? 'إضافة فئة جديدة' : 'Add New Category')}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'}</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                            if (!selectedCategory) {
                              form.setValue('slug', generateSlug(e.target.value));
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name_ar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}</FormLabel>
                      <FormControl>
                        <Input {...field} dir="rtl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'ar' ? 'الرابط' : 'Slug'}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parent_category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'ar' ? 'الفئة الرئيسية' : 'Parent Category'}</FormLabel>
                    <Select
                      value={field.value || 'none'}
                      onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={language === 'ar' ? 'اختر الفئة الرئيسية' : 'Select parent category'} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">
                          {language === 'ar' ? 'بدون (فئة رئيسية)' : 'None (Top-level)'}
                        </SelectItem>
                        {parentCategories
                          .filter(c => c.id !== selectedCategory?.id)
                          .map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {language === 'ar' ? cat.name_ar : cat.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'ar' ? 'الأيقونة' : 'Icon'}</FormLabel>
                      <Select value={field.value || 'pill'} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pill">Pill</SelectItem>
                          <SelectItem value="flask">Flask</SelectItem>
                          <SelectItem value="droplet">Droplet</SelectItem>
                          <SelectItem value="baby">Baby</SelectItem>
                          <SelectItem value="heart-pulse">Heart Pulse</SelectItem>
                          <SelectItem value="sparkles">Sparkles</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sort_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'ar' ? 'الترتيب' : 'Sort Order'}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'ar' ? 'رابط الصورة' : 'Image URL'}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>{language === 'ar' ? 'نشط' : 'Active'}</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' 
                          ? 'إظهار هذه الفئة في الموقع' 
                          : 'Show this category on the website'}
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button type="submit" disabled={createCategory.isPending || updateCategory.isPending}>
                  {(createCategory.isPending || updateCategory.isPending) && (
                    <span className="animate-spin mr-2">⏳</span>
                  )}
                  {selectedCategory
                    ? (language === 'ar' ? 'تحديث' : 'Update')
                    : (language === 'ar' ? 'إضافة' : 'Create')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'ar'
                ? `سيتم حذف "${categoryToDelete?.name_ar}" نهائياً. لا يمكن التراجع عن هذا الإجراء.`
                : `This will permanently delete "${categoryToDelete?.name}". This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === 'ar' ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {language === 'ar' ? 'حذف' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminCategories;
