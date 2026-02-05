 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/contexts/AuthContext';
 import { useToast } from '@/hooks/use-toast';
 
 interface ShippingAddress {
   street: string;
   city: string;
   country: string;
   postalCode: string;
 }
 
 interface ProfileData {
   full_name: string | null;
   full_name_ar: string | null;
   phone: string | null;
   default_shipping_address: ShippingAddress | null;
 }
 
 export function useProfile() {
   const { user } = useAuth();
 
   return useQuery({
     queryKey: ['profile', user?.id],
     queryFn: async () => {
       if (!user) return null;
 
       const { data, error } = await supabase
         .from('profiles')
         .select('*')
         .eq('user_id', user.id)
         .maybeSingle();
 
       if (error) throw error;
       return data;
     },
     enabled: !!user,
   });
 }
 
 export function useUpdateProfile() {
   const { user } = useAuth();
   const queryClient = useQueryClient();
   const { toast } = useToast();
 
   return useMutation({
     mutationFn: async (data: ProfileData) => {
       if (!user) throw new Error('Not authenticated');
 
       const { data: profile, error } = await supabase
         .from('profiles')
         .update({
           full_name: data.full_name,
           full_name_ar: data.full_name_ar,
           phone: data.phone,
           default_shipping_address: data.default_shipping_address as unknown as Record<string, unknown>,
         })
         .eq('user_id', user.id)
         .select()
         .single();
 
       if (error) throw error;
       return profile;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['profile'] });
       toast({
         title: 'Profile updated',
         description: 'Your profile has been saved successfully.',
       });
     },
     onError: (error: Error) => {
       toast({
         title: 'Failed to update profile',
         description: error.message,
         variant: 'destructive',
       });
     },
   });
 }