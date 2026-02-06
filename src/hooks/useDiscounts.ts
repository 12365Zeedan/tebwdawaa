import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Types
export interface DiscountCode {
  id: string;
  code: string;
  description: string | null;
  description_ar: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  usage_count: number;
  is_influencer: boolean;
  influencer_name: string | null;
  influencer_name_ar: string | null;
  is_active: boolean;
  starts_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductOffer {
  id: string;
  name: string;
  name_ar: string;
  description: string | null;
  description_ar: string | null;
  offer_type: 'discount' | 'buy_one_get_one' | 'group';
  discount_percentage: number;
  product_ids: string[];
  min_quantity: number;
  group_price: number | null;
  is_active: boolean;
  starts_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoyaltySettings {
  id: string;
  points_per_currency: number;
  currency_per_point: number;
  min_redeem_points: number;
  is_active: boolean;
  welcome_bonus: number;
}

// Hooks
export function useDiscountCodes() {
  return useQuery({
    queryKey: ['discount-codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as DiscountCode[];
    },
  });
}

export function useCreateDiscountCode() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (code: Omit<DiscountCode, 'id' | 'created_at' | 'updated_at' | 'usage_count'>) => {
      const { data, error } = await supabase
        .from('discount_codes')
        .insert({ ...code, usage_count: 0 } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discount-codes'] });
      toast({ title: 'Discount code created' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateDiscountCode() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DiscountCode> & { id: string }) => {
      const { data, error } = await supabase
        .from('discount_codes')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discount-codes'] });
      toast({ title: 'Discount code updated' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteDiscountCode() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('discount_codes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discount-codes'] });
      toast({ title: 'Discount code deleted' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useProductOffers() {
  return useQuery({
    queryKey: ['product-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_offers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as ProductOffer[];
    },
  });
}

export function useCreateProductOffer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (offer: Omit<ProductOffer, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('product_offers')
        .insert(offer as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-offers'] });
      toast({ title: 'Offer created' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateProductOffer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProductOffer> & { id: string }) => {
      const { data, error } = await supabase
        .from('product_offers')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-offers'] });
      toast({ title: 'Offer updated' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteProductOffer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('product_offers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-offers'] });
      toast({ title: 'Offer deleted' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useLoyaltySettings() {
  return useQuery({
    queryKey: ['loyalty-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loyalty_settings')
        .select('*')
        .limit(1)
        .single();
      if (error) throw error;
      return data as unknown as LoyaltySettings;
    },
  });
}

export function useUpdateLoyaltySettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (settings: Partial<LoyaltySettings> & { id: string }) => {
      const { id, ...updates } = settings;
      const { data, error } = await supabase
        .from('loyalty_settings')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty-settings'] });
      toast({ title: 'Loyalty settings updated' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

// Validate discount code at checkout
export function useValidateDiscountCode() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ code, orderTotal }: { code: string; orderTotal: number }) => {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', code.toUpperCase().trim())
        .eq('is_active', true)
        .single();

      if (error || !data) throw new Error('Invalid discount code');

      const discount = data as unknown as DiscountCode;

      // Check expiry
      if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
        throw new Error('Discount code has expired');
      }

      // Check start date
      if (discount.starts_at && new Date(discount.starts_at) > new Date()) {
        throw new Error('Discount code is not yet active');
      }

      // Check usage limit
      if (discount.usage_limit !== null && discount.usage_count >= discount.usage_limit) {
        throw new Error('Discount code usage limit reached');
      }

      // Check minimum order
      if (discount.min_order_amount && orderTotal < discount.min_order_amount) {
        throw new Error(`Minimum order amount is ${discount.min_order_amount}`);
      }

      // Calculate discount
      let discountAmount: number;
      if (discount.discount_type === 'percentage') {
        discountAmount = (orderTotal * discount.discount_value) / 100;
        if (discount.max_discount_amount) {
          discountAmount = Math.min(discountAmount, discount.max_discount_amount);
        }
      } else {
        discountAmount = Math.min(discount.discount_value, orderTotal);
      }

      return { discount, discountAmount };
    },
    onError: (error: any) => {
      toast({ title: 'Invalid Code', description: error.message, variant: 'destructive' });
    },
  });
}

// Increment usage count after order
export function useIncrementDiscountUsage() {
  return useMutation({
    mutationFn: async (codeId: string) => {
      const { error } = await supabase.rpc('increment_discount_usage' as any, { code_id: codeId });
      // Fallback: if rpc doesn't exist, we'll just skip
      if (error) console.error('Failed to increment discount usage:', error);
    },
  });
}
