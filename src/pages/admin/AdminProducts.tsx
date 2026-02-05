 import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Loader2, Minus, Package, History } from 'lucide-react';
 import { useQuery } from '@tanstack/react-query';
 import { AdminLayout } from '@/components/admin/AdminLayout';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Badge } from '@/components/ui/badge';
 import { Skeleton } from '@/components/ui/skeleton';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { useAuth } from '@/contexts/AuthContext';
 import { useToast } from '@/hooks/use-toast';
 import { supabase } from '@/integrations/supabase/client';
 import { Product } from '@/hooks/useProducts';
import { useCreateProduct, useUpdateProduct, useDeleteProduct, useUpdateStock, useStockHistory } from '@/hooks/useAdminProducts';
 import { ProductFormDialog } from '@/components/admin/ProductFormDialog';
 import { cn } from '@/lib/utils';
 
 const AdminProducts = () => {
   const { language, t, direction } = useLanguage();
   const { isAdmin } = useAuth();
   const { toast } = useToast();
 
   const [searchQuery, setSearchQuery] = useState('');
   const [isFormOpen, setIsFormOpen] = useState(false);
   const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
   const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [historyProductId, setHistoryProductId] = useState<string | null>(null);

  const { data: stockHistory, isLoading: isHistoryLoading } = useStockHistory(historyProductId);
 
   // Fetch all products (including inactive) for admin
   const { data: products, isLoading } = useQuery({
     queryKey: ['admin-products', searchQuery],
     queryFn: async () => {
       let query = supabase
         .from('products')
         .select(`
           *,
           category:categories(id, name, name_ar)
         `)
         .order('created_at', { ascending: false });
 
       if (searchQuery) {
         query = query.or(`name.ilike.%${searchQuery}%,name_ar.ilike.%${searchQuery}%`);
       }
 
       const { data, error } = await query;
       if (error) throw error;
       return data as Product[];
     },
     enabled: isAdmin,
   });
 
   const createProduct = useCreateProduct();
   const updateProduct = useUpdateProduct();
   const deleteProduct = useDeleteProduct();
  const updateStock = useUpdateStock();
 
   const handleOpenCreate = () => {
     setSelectedProduct(null);
     setIsFormOpen(true);
   };
 
   const handleOpenEdit = (product: Product) => {
     setSelectedProduct(product);
     setIsFormOpen(true);
   };
 
   const handleOpenDelete = (product: Product) => {
     setProductToDelete(product);
     setDeleteDialogOpen(true);
   };
 
   const handleFormSubmit = async (data: any) => {
     try {
       if (selectedProduct) {
         await updateProduct.mutateAsync({ id: selectedProduct.id, ...data });
         toast({
           title: language === 'ar' ? 'تم التحديث' : 'Updated',
           description: language === 'ar' ? 'تم تحديث المنتج بنجاح' : 'Product updated successfully',
         });
       } else {
         await createProduct.mutateAsync(data);
         toast({
           title: language === 'ar' ? 'تم الإضافة' : 'Created',
           description: language === 'ar' ? 'تم إضافة المنتج بنجاح' : 'Product created successfully',
         });
       }
       setIsFormOpen(false);
       setSelectedProduct(null);
     } catch (error: any) {
       toast({
         title: language === 'ar' ? 'خطأ' : 'Error',
         description: error.message,
         variant: 'destructive',
       });
     }
   };
 
  const handleStockAdjust = async (productId: string, currentStock: number, adjustment: number) => {
    const newStock = Math.max(0, currentStock + adjustment);
    try {
      await updateStock.mutateAsync({ id: productId, stock_quantity: newStock });
      toast({
        title: language === 'ar' ? 'تم التحديث' : 'Stock Updated',
        description: language === 'ar' 
          ? `تم تحديث الكمية إلى ${newStock}` 
          : `Stock updated to ${newStock}`,
      });
    } catch (error: any) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSetStock = async (productId: string, newStock: number) => {
    try {
      await updateStock.mutateAsync({ id: productId, stock_quantity: Math.max(0, newStock) });
      toast({
        title: language === 'ar' ? 'تم التحديث' : 'Stock Updated',
        description: language === 'ar' 
          ? `تم تحديث الكمية إلى ${newStock}` 
          : `Stock updated to ${newStock}`,
      });
    } catch (error: any) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getChangeTypeLabel = (type: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      order: { en: 'Order', ar: 'طلب' },
      manual_adjustment: { en: 'Manual Adjustment', ar: 'تعديل يدوي' },
      restock: { en: 'Restock', ar: 'إعادة تخزين' },
      initial: { en: 'Initial', ar: 'أولي' },
    };
    return labels[type]?.[language] || type;
  };

  const getChangeTypeBadgeVariant = (type: string): "default" | "destructive" | "secondary" | "outline" => {
    switch (type) {
      case 'order': return 'destructive';
      case 'restock': return 'default';
      case 'manual_adjustment': return 'secondary';
      default: return 'outline';
    }
  };

   const handleConfirmDelete = async () => {
     if (!productToDelete) return;
 
     try {
       await deleteProduct.mutateAsync(productToDelete.id);
       toast({
         title: language === 'ar' ? 'تم الحذف' : 'Deleted',
         description: language === 'ar' ? 'تم حذف المنتج بنجاح' : 'Product deleted successfully',
       });
       setDeleteDialogOpen(false);
       setProductToDelete(null);
     } catch (error: any) {
       toast({
         title: language === 'ar' ? 'خطأ' : 'Error',
         description: error.message,
         variant: 'destructive',
       });
     }
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
             <h1 className="text-3xl font-bold text-foreground">{t('admin.products')}</h1>
             <p className="text-muted-foreground mt-1">
               {language === 'ar' ? 'إدارة منتجات المتجر' : 'Manage store products'}
             </p>
           </div>
           <Button className="gap-2" onClick={handleOpenCreate}>
             <Plus className="h-4 w-4" />
             {language === 'ar' ? 'إضافة منتج' : 'Add Product'}
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
             placeholder={t('products.search')}
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className={cn('bg-muted/50', direction === 'rtl' ? 'pr-10' : 'pl-10')}
           />
         </div>
 
         {/* Products Table */}
         <div className="bg-card rounded-xl border border-border/50 shadow-soft overflow-hidden">
           <div className="overflow-x-auto">
             <table className="w-full">
               <thead>
                 <tr className="border-b border-border bg-muted/30">
                   <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">
                     {language === 'ar' ? 'المنتج' : 'Product'}
                   </th>
                   <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">
                     {language === 'ar' ? 'الفئة' : 'Category'}
                   </th>
                   <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">
                     {language === 'ar' ? 'السعر' : 'Price'}
                   </th>
                   <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">
                     {language === 'ar' ? 'الكمية' : 'Stock'}
                   </th>
                   <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">
                     {language === 'ar' ? 'الحالة' : 'Status'}
                   </th>
                   <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">
                     {language === 'ar' ? 'الإجراءات' : 'Actions'}
                   </th>
                 </tr>
               </thead>
               <tbody>
                 {isLoading ? (
                   [...Array(5)].map((_, i) => (
                     <tr key={i} className="border-b border-border">
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                           <Skeleton className="w-12 h-12 rounded-lg" />
                           <div>
                             <Skeleton className="h-4 w-32 mb-1" />
                             <Skeleton className="h-3 w-20" />
                           </div>
                         </div>
                       </td>
                       <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                       <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                       <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                       <td className="px-6 py-4"><Skeleton className="h-6 w-20" /></td>
                       <td className="px-6 py-4"><Skeleton className="h-8 w-20" /></td>
                     </tr>
                   ))
                 ) : products?.length === 0 ? (
                   <tr>
                     <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                       {language === 'ar' ? 'لا توجد منتجات' : 'No products found'}
                     </td>
                   </tr>
                 ) : products?.map((product) => {
                   const name = language === 'ar' ? product.name_ar : product.name;
                   const category = product.category 
                     ? (language === 'ar' ? product.category.name_ar : product.category.name)
                     : '-';
 
                   return (
                     <tr key={product.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                           <img
                             src={product.image_url || '/placeholder.svg'}
                             alt={name}
                             className="w-12 h-12 rounded-lg object-cover"
                           />
                           <div>
                             <p className="font-medium text-foreground line-clamp-1">{name}</p>
                             <p className="text-xs text-muted-foreground">ID: {product.id.slice(0, 8)}...</p>
                           </div>
                         </div>
                       </td>
                       <td className="px-6 py-4 text-sm text-foreground">{category}</td>
                       <td className="px-6 py-4 text-sm font-medium text-foreground">
                         {product.price} {t('common.currency')}
                         {product.original_price && (
                           <span className="text-xs text-muted-foreground line-through ms-2">
                             {product.original_price}
                           </span>
                         )}
                       </td>
                       <td className="px-6 py-4 text-sm text-foreground">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className={cn(
                                "gap-2 min-w-[80px]",
                                product.stock_quantity === 0 && "border-destructive text-destructive"
                              )}
                            >
                              <Package className="h-3 w-3" />
                              {product.stock_quantity}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64 p-4" align="start">
                            <div className="space-y-4">
                              <div className="text-sm font-medium">
                                {language === 'ar' ? 'تعديل الكمية' : 'Adjust Stock'}
                              </div>
                              
                              {/* Quick adjust buttons */}
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleStockAdjust(product.id, product.stock_quantity, -10)}
                                  disabled={updateStock.isPending}
                                >
                                  -10
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleStockAdjust(product.id, product.stock_quantity, -1)}
                                  disabled={updateStock.isPending}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-12 text-center font-bold text-lg">
                                  {product.stock_quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleStockAdjust(product.id, product.stock_quantity, 1)}
                                  disabled={updateStock.isPending}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleStockAdjust(product.id, product.stock_quantity, 10)}
                                  disabled={updateStock.isPending}
                                >
                                  +10
                                </Button>
                              </div>

                            {/* History button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full gap-2"
                              onClick={() => setHistoryProductId(product.id)}
                            >
                              <History className="h-4 w-4" />
                              {language === 'ar' ? 'سجل التغييرات' : 'View History'}
                            </Button>

                              {/* Direct input */}
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder={language === 'ar' ? 'كمية جديدة' : 'Set quantity'}
                                  className="flex-1"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const value = parseInt((e.target as HTMLInputElement).value);
                                      if (!isNaN(value)) {
                                        handleSetStock(product.id, value);
                                        (e.target as HTMLInputElement).value = '';
                                      }
                                    }
                                  }}
                                />
                                <Button
                                  size="sm"
                                  disabled={updateStock.isPending}
                                  onClick={(e) => {
                                    const input = (e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement);
                                    const value = parseInt(input?.value);
                                    if (!isNaN(value)) {
                                      handleSetStock(product.id, value);
                                      input.value = '';
                                    }
                                  }}
                                >
                                  {updateStock.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    language === 'ar' ? 'تحديث' : 'Set'
                                  )}
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                       </td>
                       <td className="px-6 py-4">
                         <div className="flex flex-col gap-1">
                           <Badge variant={product.in_stock ? 'default' : 'destructive'} className="w-fit">
                             {product.in_stock 
                               ? (language === 'ar' ? 'متوفر' : 'In Stock')
                               : (language === 'ar' ? 'نفذ' : 'Out of Stock')}
                           </Badge>
                           {!product.is_active && (
                             <Badge variant="secondary" className="w-fit">
                               {language === 'ar' ? 'غير نشط' : 'Inactive'}
                             </Badge>
                           )}
                         </div>
                       </td>
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className="h-8 w-8"
                             onClick={() => handleOpenEdit(product)}
                           >
                             <Edit className="h-4 w-4" />
                           </Button>
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className="h-8 w-8 text-destructive"
                             onClick={() => handleOpenDelete(product)}
                           >
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
 
       {/* Product Form Dialog */}
       <ProductFormDialog
         open={isFormOpen}
         onOpenChange={setIsFormOpen}
         product={selectedProduct}
         onSubmit={handleFormSubmit}
         isLoading={createProduct.isPending || updateProduct.isPending}
       />
 
       {/* Delete Confirmation Dialog */}
       <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
         <AlertDialogContent>
           <AlertDialogHeader>
             <AlertDialogTitle>
               {language === 'ar' ? 'تأكيد الحذف' : 'Confirm Deletion'}
             </AlertDialogTitle>
             <AlertDialogDescription>
               {language === 'ar'
                 ? `هل أنت متأكد من حذف "${productToDelete?.name_ar}"؟ لا يمكن التراجع عن هذا الإجراء.`
                 : `Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel>
               {language === 'ar' ? 'إلغاء' : 'Cancel'}
             </AlertDialogCancel>
             <AlertDialogAction
               onClick={handleConfirmDelete}
               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
               disabled={deleteProduct.isPending}
             >
               {deleteProduct.isPending && <Loader2 className="h-4 w-4 animate-spin me-2" />}
               {language === 'ar' ? 'حذف' : 'Delete'}
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>

      {/* Stock History Dialog */}
      <Dialog open={!!historyProductId} onOpenChange={(open) => !open && setHistoryProductId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {language === 'ar' ? 'سجل تغييرات المخزون' : 'Stock History'}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            {isHistoryLoading ? (
              <div className="space-y-3 p-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : stockHistory?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {language === 'ar' ? 'لا يوجد سجل تغييرات' : 'No stock history found'}
              </div>
            ) : (
              <div className="space-y-3 p-1">
                {stockHistory?.map((entry) => (
                  <div 
                    key={entry.id} 
                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={getChangeTypeBadgeVariant(entry.change_type)}>
                          {getChangeTypeLabel(entry.change_type)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(entry.created_at).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                        </span>
                      </div>
                      {entry.notes && (
                        <p className="text-sm text-muted-foreground">{entry.notes}</p>
                      )}
                    </div>
                    <div className="text-end">
                      <div className={cn(
                        "text-lg font-bold",
                        entry.change_amount > 0 ? "text-primary" : "text-destructive"
                      )}>
                        {entry.change_amount > 0 ? '+' : ''}{entry.change_amount}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {entry.previous_quantity} → {entry.new_quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
     </AdminLayout>
   );
 };
 
 export default AdminProducts;