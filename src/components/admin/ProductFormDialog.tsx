 import React, { useState, useEffect } from 'react';
 import { useForm } from 'react-hook-form';
 import { zodResolver } from '@hookform/resolvers/zod';
 import { z } from 'zod';
 import { Loader2 } from 'lucide-react';
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
 } from '@/components/ui/dialog';
 import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
 } from '@/components/ui/form';
 import { Input } from '@/components/ui/input';
 import { Textarea } from '@/components/ui/textarea';
 import { Button } from '@/components/ui/button';
 import { Switch } from '@/components/ui/switch';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { useCategories } from '@/hooks/useCategories';
 import { Product } from '@/hooks/useProducts';
 import { ImageUpload } from './ImageUpload';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 
 const productSchema = z.object({
   name: z.string().min(1, 'Name is required'),
   name_ar: z.string().min(1, 'Arabic name is required'),
   slug: z.string().min(1, 'Slug is required'),
   description: z.string().optional(),
   description_ar: z.string().optional(),
   price: z.coerce.number().min(0, 'Price must be positive'),
   original_price: z.coerce.number().min(0).optional().nullable(),
   category_id: z.string().optional().nullable(),
   image_url: z.string().optional().or(z.literal('')),
   in_stock: z.boolean(),
   stock_quantity: z.coerce.number().min(0),
   requires_prescription: z.boolean(),
   is_featured: z.boolean(),
   is_active: z.boolean(),
 });
 
 type ProductFormData = z.infer<typeof productSchema>;
 
 interface ProductFormDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   product?: Product | null;
   onSubmit: (data: ProductFormData) => Promise<void>;
   isLoading?: boolean;
 }
 
 export function ProductFormDialog({
   open,
   onOpenChange,
   product,
   onSubmit,
   isLoading,
 }: ProductFormDialogProps) {
   const { language } = useLanguage();
   const { data: categories } = useCategories();
   const isEditing = !!product;
 
   const form = useForm<ProductFormData>({
     resolver: zodResolver(productSchema),
     defaultValues: {
       name: '',
       name_ar: '',
       slug: '',
       description: '',
       description_ar: '',
       price: 0,
       original_price: null,
       category_id: null,
       image_url: '',
       in_stock: true,
       stock_quantity: 0,
       requires_prescription: false,
       is_featured: false,
       is_active: true,
     },
   });
 
   useEffect(() => {
     if (product) {
       form.reset({
         name: product.name,
         name_ar: product.name_ar,
         slug: product.slug,
         description: product.description || '',
         description_ar: product.description_ar || '',
         price: product.price,
         original_price: product.original_price,
         category_id: product.category_id,
         image_url: product.image_url || '',
         in_stock: product.in_stock,
         stock_quantity: product.stock_quantity,
         requires_prescription: product.requires_prescription,
         is_featured: product.is_featured,
         is_active: product.is_active,
       });
     } else {
       form.reset({
         name: '',
         name_ar: '',
         slug: '',
         description: '',
         description_ar: '',
         price: 0,
         original_price: null,
         category_id: null,
         image_url: '',
         in_stock: true,
         stock_quantity: 0,
         requires_prescription: false,
         is_featured: false,
         is_active: true,
       });
     }
   }, [product, form]);
 
   const generateSlug = (name: string) => {
     return name
       .toLowerCase()
       .replace(/[^a-z0-9]+/g, '-')
       .replace(/(^-|-$)/g, '');
   };
 
   const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const name = e.target.value;
     form.setValue('name', name);
     if (!isEditing && !form.getValues('slug')) {
       form.setValue('slug', generateSlug(name));
     }
   };
 
   const handleSubmit = async (data: ProductFormData) => {
     await onSubmit(data);
   };
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
         <DialogHeader>
           <DialogTitle>
             {isEditing
               ? language === 'ar' ? 'تعديل المنتج' : 'Edit Product'
               : language === 'ar' ? 'إضافة منتج جديد' : 'Add New Product'}
           </DialogTitle>
         </DialogHeader>
 
         <Form {...form}>
           <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Name (English) */}
               <FormField
                 control={form.control}
                 name="name"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>{language === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'}</FormLabel>
                     <FormControl>
                       <Input {...field} onChange={handleNameChange} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
 
               {/* Name (Arabic) */}
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
 
             {/* Slug */}
             <FormField
               control={form.control}
               name="slug"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>{language === 'ar' ? 'الرابط' : 'Slug'}</FormLabel>
                   <FormControl>
                     <Input {...field} placeholder="product-name" />
                   </FormControl>
                   <FormMessage />
                 </FormItem>
               )}
             />
 
             {/* Descriptions */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField
                 control={form.control}
                 name="description"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>{language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}</FormLabel>
                     <FormControl>
                       <Textarea {...field} rows={3} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
 
               <FormField
                 control={form.control}
                 name="description_ar"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>{language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}</FormLabel>
                     <FormControl>
                       <Textarea {...field} rows={3} dir="rtl" />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
             </div>
 
             {/* Price & Original Price */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField
                 control={form.control}
                 name="price"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>{language === 'ar' ? 'السعر' : 'Price'}</FormLabel>
                     <FormControl>
                       <Input type="number" step="0.01" {...field} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
 
               <FormField
                 control={form.control}
                 name="original_price"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>{language === 'ar' ? 'السعر الأصلي' : 'Original Price'}</FormLabel>
                     <FormControl>
                       <Input
                         type="number"
                         step="0.01"
                         {...field}
                         value={field.value ?? ''}
                         onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                       />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
             </div>
 
             {/* Category & Stock Quantity */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField
                 control={form.control}
                 name="category_id"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>{language === 'ar' ? 'الفئة' : 'Category'}</FormLabel>
                     <Select
                       onValueChange={field.onChange}
                       value={field.value || undefined}
                     >
                       <FormControl>
                         <SelectTrigger>
                           <SelectValue placeholder={language === 'ar' ? 'اختر الفئة' : 'Select category'} />
                         </SelectTrigger>
                       </FormControl>
                       <SelectContent>
                         {categories?.map((cat) => (
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
 
               <FormField
                 control={form.control}
                 name="stock_quantity"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>{language === 'ar' ? 'الكمية' : 'Stock Quantity'}</FormLabel>
                     <FormControl>
                       <Input type="number" {...field} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
             </div>
 
             {/* Image URL */}
             <FormField
               control={form.control}
               name="image_url"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>{language === 'ar' ? 'صورة المنتج' : 'Product Image'}</FormLabel>
                   <FormControl>
                     <Tabs defaultValue="upload" className="w-full">
                       <TabsList className="grid w-full grid-cols-2 mb-2">
                         <TabsTrigger value="upload">
                           {language === 'ar' ? 'رفع صورة' : 'Upload'}
                         </TabsTrigger>
                         <TabsTrigger value="url">
                           {language === 'ar' ? 'رابط URL' : 'URL'}
                         </TabsTrigger>
                       </TabsList>
                       <TabsContent value="upload">
                         <ImageUpload
                           value={field.value || null}
                           onChange={(url) => field.onChange(url || '')}
                         />
                       </TabsContent>
                       <TabsContent value="url">
                         <Input
                           value={field.value || ''}
                           onChange={field.onChange}
                           placeholder="https://example.com/image.jpg"
                         />
                       </TabsContent>
                     </Tabs>
                   </FormControl>
                   <FormMessage />
                 </FormItem>
               )}
             />
 
             {/* Switches */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <FormField
                 control={form.control}
                 name="in_stock"
                 render={({ field }) => (
                   <FormItem className="flex items-center justify-between rounded-lg border p-3">
                     <FormLabel className="text-sm">{language === 'ar' ? 'متوفر' : 'In Stock'}</FormLabel>
                     <FormControl>
                       <Switch checked={field.value} onCheckedChange={field.onChange} />
                     </FormControl>
                   </FormItem>
                 )}
               />
 
               <FormField
                 control={form.control}
                 name="requires_prescription"
                 render={({ field }) => (
                   <FormItem className="flex items-center justify-between rounded-lg border p-3">
                     <FormLabel className="text-sm">{language === 'ar' ? 'وصفة طبية' : 'Prescription'}</FormLabel>
                     <FormControl>
                       <Switch checked={field.value} onCheckedChange={field.onChange} />
                     </FormControl>
                   </FormItem>
                 )}
               />
 
               <FormField
                 control={form.control}
                 name="is_featured"
                 render={({ field }) => (
                   <FormItem className="flex items-center justify-between rounded-lg border p-3">
                     <FormLabel className="text-sm">{language === 'ar' ? 'مميز' : 'Featured'}</FormLabel>
                     <FormControl>
                       <Switch checked={field.value} onCheckedChange={field.onChange} />
                     </FormControl>
                   </FormItem>
                 )}
               />
 
               <FormField
                 control={form.control}
                 name="is_active"
                 render={({ field }) => (
                   <FormItem className="flex items-center justify-between rounded-lg border p-3">
                     <FormLabel className="text-sm">{language === 'ar' ? 'نشط' : 'Active'}</FormLabel>
                     <FormControl>
                       <Switch checked={field.value} onCheckedChange={field.onChange} />
                     </FormControl>
                   </FormItem>
                 )}
               />
             </div>
 
             {/* Submit Button */}
             <div className="flex justify-end gap-3">
               <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                 {language === 'ar' ? 'إلغاء' : 'Cancel'}
               </Button>
               <Button type="submit" disabled={isLoading}>
                 {isLoading && <Loader2 className="h-4 w-4 animate-spin me-2" />}
                 {isEditing
                   ? language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'
                   : language === 'ar' ? 'إضافة المنتج' : 'Add Product'}
               </Button>
             </div>
           </form>
         </Form>
       </DialogContent>
     </Dialog>
   );
 }