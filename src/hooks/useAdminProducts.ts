 import { useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
 
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
  is_new_arrival: boolean;
  is_best_seller: boolean;
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
            is_new_arrival: product.is_new_arrival,
            is_best_seller: product.is_best_seller,
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
    mutationFn: async ({ 
      id, 
      stock_quantity, 
      change_type = 'manual_adjustment',
      notes 
    }: { 
      id: string; 
      stock_quantity: number;
      change_type?: 'manual_adjustment' | 'restock';
      notes?: string;
    }) => {
      // Get current stock first
      const { data: currentProduct, error: fetchError } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const previousQuantity = currentProduct.stock_quantity ?? 0;
      const changeAmount = stock_quantity - previousQuantity;
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

      // Log to stock history
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error: historyError } = await supabase
        .from('stock_history')
        .insert({
          product_id: id,
          previous_quantity: previousQuantity,
          new_quantity: stock_quantity,
          change_amount: changeAmount,
          change_type,
          changed_by: user?.id || null,
          notes: notes || null,
        });

      if (historyError) {
        console.error('Failed to log stock history:', historyError);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['stock-history'] });
    },
  });
}

export interface StockHistoryEntry {
  id: string;
  product_id: string;
  previous_quantity: number;
  new_quantity: number;
  change_amount: number;
  change_type: 'order' | 'manual_adjustment' | 'restock' | 'initial';
  changed_by: string | null;
  notes: string | null;
  created_at: string;
}

export function useStockHistory(productId: string | null) {
  return useQuery({
    queryKey: ['stock-history', productId],
    queryFn: async () => {
      if (!productId) return [];
      
      const { data, error } = await supabase
        .from('stock_history')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as StockHistoryEntry[];
    },
    enabled: !!productId,
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
            is_new_arrival: product.is_new_arrival,
            is_best_seller: product.is_best_seller,
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