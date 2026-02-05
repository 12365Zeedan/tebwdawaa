 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { useToast } from '@/hooks/use-toast';
 
 export function useAdminOrders() {
   return useQuery({
     queryKey: ['admin-orders'],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('orders')
         .select('*')
         .order('created_at', { ascending: false });
 
       if (error) throw error;
       return data;
     },
   });
 }
 
 export function useAdminOrderDetails(orderId: string | null) {
   return useQuery({
     queryKey: ['admin-order-details', orderId],
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
 
 export function useUpdateOrderStatus() {
   const queryClient = useQueryClient();
   const { toast } = useToast();
 
   return useMutation({
     mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
       const { data, error } = await supabase
         .from('orders')
         .update({ status })
         .eq('id', orderId)
         .select()
         .single();
 
       if (error) throw error;
       return data;
     },
     onSuccess: (data) => {
       queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
       queryClient.invalidateQueries({ queryKey: ['admin-order-details', data.id] });
       toast({
         title: 'Status updated',
         description: `Order ${data.order_number} status changed to ${data.status}`,
       });
     },
     onError: (error: Error) => {
       toast({
         title: 'Failed to update status',
         description: error.message,
         variant: 'destructive',
       });
     },
   });
 }