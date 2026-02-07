import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TrackingEvent {
  id: string;
  order_id: string;
  status: string;
  notes: string | null;
  tracking_number: string | null;
  location: string | null;
  created_by: string | null;
  created_at: string;
}

export function useOrderTracking(orderId: string | null) {
  return useQuery({
    queryKey: ['order-tracking', orderId],
    queryFn: async () => {
      if (!orderId) return [];

      const { data, error } = await supabase
        .from('order_tracking_events')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as TrackingEvent[];
    },
    enabled: !!orderId,
  });
}

interface AddTrackingEventData {
  orderId: string;
  status: string;
  notes?: string;
  trackingNumber?: string;
  location?: string;
}

export function useAddTrackingEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: AddTrackingEventData) => {
      const { data: result, error } = await supabase
        .from('order_tracking_events')
        .insert([{
          order_id: data.orderId,
          status: data.status,
          notes: data.notes || null,
          tracking_number: data.trackingNumber || null,
          location: data.location || null,
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['order-tracking', data.order_id] });
      toast({
        title: 'Tracking updated',
        description: 'Tracking event added successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to add tracking event',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
