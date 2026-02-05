 import { useQuery } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 
 export interface Product {
   id: string;
   name: string;
   name_ar: string;
   slug: string;
   description: string | null;
   description_ar: string | null;
   price: number;
   original_price: number | null;
   category_id: string | null;
   image_url: string | null;
   images: string[];
   in_stock: boolean;
   stock_quantity: number;
   requires_prescription: boolean;
   rating: number;
   review_count: number;
   is_featured: boolean;
   is_active: boolean;
   created_at: string;
   category?: {
     id: string;
     name: string;
     name_ar: string;
   } | null;
 }
 
 export function useProducts(options?: { 
   categoryId?: string; 
   featured?: boolean;
   limit?: number;
   searchQuery?: string;
 }) {
   return useQuery({
     queryKey: ['products', options],
     queryFn: async () => {
       let query = supabase
         .from('products')
         .select(`
           *,
           category:categories(id, name, name_ar)
         `)
         .eq('is_active', true)
         .order('created_at', { ascending: false });
 
       if (options?.categoryId) {
         query = query.eq('category_id', options.categoryId);
       }
 
       if (options?.featured) {
         query = query.eq('is_featured', true);
       }
 
       if (options?.searchQuery) {
         query = query.or(`name.ilike.%${options.searchQuery}%,name_ar.ilike.%${options.searchQuery}%`);
       }
 
       if (options?.limit) {
         query = query.limit(options.limit);
       }
 
       const { data, error } = await query;
 
       if (error) throw error;
       return data as Product[];
     }
   });
 }
 
 export function useProduct(slug: string) {
   return useQuery({
     queryKey: ['product', slug],
     queryFn: async () => {
       // Try to find by slug first, then by id
       const { data, error } = await supabase
         .from('products')
         .select(`
           *,
           category:categories(id, name, name_ar)
         `)
         .or(`slug.eq.${slug},id.eq.${slug}`)
         .maybeSingle();
 
       if (error) throw error;
       return data as Product | null;
     },
     enabled: !!slug
   });
 }