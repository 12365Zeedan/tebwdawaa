 import { useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 
 interface ProductInput {
   name: string;
   name_ar: string;
   slug: string;
   description?: string | null;
   description_ar?: string | null;
   price: number;
   original_price?: number | null;
   category_id?: string | null;
   image_url?: string | null;
   in_stock: boolean;
   stock_quantity: number;
   requires_prescription: boolean;
   is_featured: boolean;
   is_active: boolean;
 }
 
 export function useCreateProduct() {
   const queryClient = useQueryClient();
 
   return useMutation({
     mutationFn: async (product: ProductInput) => {
       const { data, error } = await supabase
         .from('products')
         .insert({
           name: product.name,
           name_ar: product.name_ar,
           slug: product.slug,
           description: product.description || null,
           description_ar: product.description_ar || null,
           price: product.price,
           original_price: product.original_price || null,
           category_id: product.category_id || null,
           image_url: product.image_url || null,
           in_stock: product.in_stock,
           stock_quantity: product.stock_quantity,
           requires_prescription: product.requires_prescription,
           is_featured: product.is_featured,
           is_active: product.is_active,
         })
         .select()
         .single();
 
       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['products'] });
       queryClient.invalidateQueries({ queryKey: ['admin-products'] });
     },
   });
 }

export function useUpdateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, stock_quantity }: { id: string; stock_quantity: number }) => {
      const in_stock = stock_quantity > 0;
      
      const { data, error } = await supabase
        .from('products')
        .update({
          stock_quantity,
          in_stock,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });
}
 
 export function useUpdateProduct() {
   const queryClient = useQueryClient();
 
   return useMutation({
     mutationFn: async ({ id, ...product }: ProductInput & { id: string }) => {
       const { data, error } = await supabase
         .from('products')
         .update({
           name: product.name,
           name_ar: product.name_ar,
           slug: product.slug,
           description: product.description || null,
           description_ar: product.description_ar || null,
           price: product.price,
           original_price: product.original_price || null,
           category_id: product.category_id || null,
           image_url: product.image_url || null,
           in_stock: product.in_stock,
           stock_quantity: product.stock_quantity,
           requires_prescription: product.requires_prescription,
           is_featured: product.is_featured,
           is_active: product.is_active,
         })
         .eq('id', id)
         .select()
         .single();
 
       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['products'] });
       queryClient.invalidateQueries({ queryKey: ['admin-products'] });
     },
   });
 }
 
 export function useDeleteProduct() {
   const queryClient = useQueryClient();
 
   return useMutation({
     mutationFn: async (id: string) => {
       const { error } = await supabase
         .from('products')
         .delete()
         .eq('id', id);
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['products'] });
       queryClient.invalidateQueries({ queryKey: ['admin-products'] });
     },
   });
 }