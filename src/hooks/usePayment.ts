import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { paymentGateway } from '@/services/paymentGateway';
import { 
  PaymentMethod, 
  PaymentStatus, 
  PaymentRequest, 
  PAYMENT_METHODS 
} from '@/types/payment';
import type { Json } from '@/integrations/supabase/types';

interface ProcessPaymentData {
  orderId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
}

/**
 * Hook to process payments through the mock gateway
 */
export function useProcessPayment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ProcessPaymentData) => {
      // Create payment request
      const request: PaymentRequest = {
        orderId: data.orderId,
        amount: data.amount,
        currency: 'SAR',
        paymentMethod: data.paymentMethod,
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
      };

      // Process through gateway
      const response = await paymentGateway.processPayment(request);

      // Log transaction to database
      const { error: txnError } = await supabase
        .from('payment_transactions')
        .insert({
          order_id: data.orderId,
          payment_method: data.paymentMethod,
          amount: data.amount,
          currency: 'SAR',
          status: response.status,
          gateway_reference: response.gatewayReference,
          gateway_response: (response.gatewayResponse as Json) || null,
          error_message: response.errorMessage,
        });

      if (txnError) {
        console.error('Failed to log transaction:', txnError);
      }

      // Update order payment status
      const paymentStatus: PaymentStatus = response.success 
        ? (data.paymentMethod === 'cod' ? 'pending' : 'completed')
        : 'failed';

      const { error: orderError } = await supabase
        .from('orders')
        .update({
          payment_method: data.paymentMethod,
          payment_status: paymentStatus,
          payment_reference: response.gatewayReference,
        })
        .eq('id', data.orderId);

      if (orderError) {
        console.error('Failed to update order payment status:', orderError);
      }

      if (!response.success) {
        throw new Error(response.errorMessage || 'Payment failed');
      }

      return response;
    },
    onSuccess: (response, data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['payment-transactions', data.orderId] });

      const methodName = PAYMENT_METHODS.find(m => m.id === data.paymentMethod)?.name;
      
      toast({
        title: data.paymentMethod === 'cod' 
          ? 'Order placed successfully!' 
          : 'Payment successful!',
        description: data.paymentMethod === 'cod'
          ? 'Pay with cash when your order arrives.'
          : `Payment processed via ${methodName}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Payment failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to get payment transactions for an order
 */
export function useOrderTransactions(orderId: string | null) {
  return useQuery({
    queryKey: ['payment-transactions', orderId],
    queryFn: async () => {
      if (!orderId) return [];

      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });
}

/**
 * Hook to get available payment methods
 */
export function usePaymentMethods() {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: () => {
      return PAYMENT_METHODS.filter(m => m.enabled);
    },
    staleTime: Infinity, // Payment methods don't change often
  });
}

/**
 * Hook to update payment status (admin use)
 */
export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      orderId, 
      status 
    }: { 
      orderId: string; 
      status: PaymentStatus;
    }) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ payment_status: status })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;

      // Log status change
      await supabase
        .from('payment_transactions')
        .insert({
          order_id: orderId,
          payment_method: data.payment_method || 'cod',
          amount: data.total,
          currency: 'SAR',
          status,
          gateway_response: { 
            type: 'status_update', 
            timestamp: new Date().toISOString() 
          } as Json,
        });

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['payment-transactions', data.id] });

      toast({
        title: 'Payment status updated',
        description: `Order ${data.order_number} payment status changed to ${data.payment_status}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update payment status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
