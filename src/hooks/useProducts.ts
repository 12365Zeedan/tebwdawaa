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
  barcode?: string | null;
  category?: {
    id: string;
    name: string;
    name_ar: string;
  } | null;
}

export interface ProductFilterOptions {
  categoryId?: string;
  featured?: boolean;
  limit?: number;
  searchQuery?: string;
  barcode?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  requiresPrescription?: boolean;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'name';
}

export function useProducts(options?: ProductFilterOptions) {
  return useQuery({
    queryKey: ['products', options],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, name_ar)
        `)
        .eq('is_active', true);

      // Category filter
      if (options?.categoryId) {
        query = query.eq('category_id', options.categoryId);
      }

      // Featured filter
      if (options?.featured) {
        query = query.eq('is_featured', true);
      }

      // Search by name or barcode
      if (options?.searchQuery) {
        query = query.or(`name.ilike.%${options.searchQuery}%,name_ar.ilike.%${options.searchQuery}%,barcode.ilike.%${options.searchQuery}%`);
      }

      // Search by barcode directly
      if (options?.barcode) {
        query = query.eq('barcode', options.barcode);
      }

      // Price range filters
      if (options?.minPrice !== undefined) {
        query = query.gte('price', options.minPrice);
      }
      if (options?.maxPrice !== undefined) {
        query = query.lte('price', options.maxPrice);
      }

      // Stock filter
      if (options?.inStockOnly) {
        query = query.eq('in_stock', true);
      }

      // Prescription filter
      if (options?.requiresPrescription) {
        query = query.eq('requires_prescription', true);
      }

      // Sorting
      switch (options?.sortBy) {
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'name':
          query = query.order('name', { ascending: true });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      // Limit
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Product[];
    }
  });
}

// Hook to search product by barcode
export function useProductByBarcode(barcode: string | null) {
  return useQuery({
    queryKey: ['product-barcode', barcode],
    queryFn: async () => {
      if (!barcode) return null;
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, name_ar)
        `)
        .eq('barcode', barcode)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data as Product | null;
    },
    enabled: !!barcode
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