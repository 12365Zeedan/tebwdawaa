 import { useQuery } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 
 export interface Category {
   id: string;
   name: string;
   name_ar: string;
   slug: string;
   icon: string | null;
   image_url: string | null;
   is_active: boolean;
   sort_order: number;
   created_at: string;
   product_count?: number;
 }
 
 export function useCategories() {
   return useQuery({
     queryKey: ['categories'],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('categories')
         .select('*')
         .eq('is_active', true)
         .order('sort_order', { ascending: true });
 
       if (error) throw error;
       return data as Category[];
     }
   });
 }
 
 export function useCategory(slug: string) {
   return useQuery({
     queryKey: ['category', slug],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('categories')
         .select('*')
         .eq('slug', slug)
         .maybeSingle();
 
       if (error) throw error;
       return data as Category | null;
     },
     enabled: !!slug
   });
 }