 import { useQuery } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/contexts/AuthContext';
 
 export function useUserOrders() {
   const { user } = useAuth();
 
   return useQuery({
     queryKey: ['user-orders', user?.id],
     queryFn: async () => {
       if (!user) return [];
 
       const { data, error } = await supabase
         .from('orders')
         .select('*')
         .eq('user_id', user.id)
         .order('created_at', { ascending: false });
 
       if (error) throw error;
       return data;
     },
     enabled: !!user,
   });
 }
 
 export function useOrderDetails(orderId: string | null) {
   return useQuery({
     queryKey: ['order-details', orderId],
     queryFn: async () => {
       if (!orderId) return null;
 
       const { data: order, error: orderError } = await supabase
         .from('orders')
         .select('*')
         .eq('id', orderId)
         .single();
 
       if (orderError) throw orderError;
 
       const { data: items, error: itemsError } = await supabase
         .from('order_items')
         .select('*')
         .eq('order_id', orderId);
 
       if (itemsError) throw itemsError;
 
       return { ...order, items };
     },
     enabled: !!orderId,
   });
 }