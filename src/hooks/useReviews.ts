import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  order_id: string | null;
  rating: number;
  title: string | null;
  content: string | null;
  is_verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function useProductReviews(productId: string | null) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      if (!productId) return [];
      
      // Get reviews
      const { data: reviews, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Get profiles for reviewers
      if (reviews && reviews.length > 0) {
        const userIds = [...new Set(reviews.map(r => r.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', userIds);
        
        // Map profiles to reviews
        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        return reviews.map(review => ({
          ...review,
          profile: profileMap.get(review.user_id) || null,
        })) as Review[];
      }
      
      return reviews as Review[];
    },
    enabled: !!productId,
  });
}

export function useUserReview(productId: string | null, userId: string | null) {
  return useQuery({
    queryKey: ['user-review', productId, userId],
    queryFn: async () => {
      if (!productId || !userId) return null;
      
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data as Review | null;
    },
    enabled: !!productId && !!userId,
  });
}

export function useCanReview(productId: string | null, userId: string | null) {
  return useQuery({
    queryKey: ['can-review', productId, userId],
    queryFn: async () => {
      if (!productId || !userId) return false;
      
      // Check if user has purchased and received this product
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_items!inner(product_id)
        `)
        .eq('user_id', userId)
        .in('status', ['delivered', 'shipped'])
        .eq('order_items.product_id', productId)
        .limit(1);

      if (error) {
        console.error('Error checking purchase:', error);
        return false;
      }
      
      return (data?.length ?? 0) > 0;
    },
    enabled: !!productId && !!userId,
  });
}

interface CreateReviewData {
  productId: string;
  rating: number;
  title?: string;
  content?: string;
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReviewData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if user has already reviewed
      const { data: existing } = await supabase
        .from('product_reviews')
        .select('id')
        .eq('product_id', data.productId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        throw new Error('You have already reviewed this product');
      }

      const { data: review, error } = await supabase
        .from('product_reviews')
        .insert({
          product_id: data.productId,
          user_id: user.id,
          rating: data.rating,
          title: data.title || null,
          content: data.content || null,
          is_verified_purchase: true,
        })
        .select()
        .single();

      if (error) throw error;
      return review;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['user-review', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; rating: number; title?: string; content?: string; productId: string }) => {
      const { data: review, error } = await supabase
        .from('product_reviews')
        .update({
          rating: data.rating,
          title: data.title || null,
          content: data.content || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return review;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['user-review', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, productId }: { id: string; productId: string }) => {
      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { productId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', data.productId] });
      queryClient.invalidateQueries({ queryKey: ['user-review', data.productId] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
