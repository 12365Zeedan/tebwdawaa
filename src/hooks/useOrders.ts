 import { useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { useToast } from '@/hooks/use-toast';
 import { CartItem } from '@/contexts/CartContext';
 import type { Json } from '@/integrations/supabase/types';

interface StockCheck {
  productId: string;
  productName: string;
  requestedQuantity: number;
  availableStock: number;
}
 
 interface ShippingAddress {
   street: string;
   city: string;
   country: string;
   postalCode: string;
 }
 
 interface CreateOrderData {
   customerName: string;
   customerEmail: string;
   customerPhone?: string;
   shippingAddress: ShippingAddress;
   items: CartItem[];
   subtotal: number;
   shippingCost: number;
   total: number;
   notes?: string;
   userId?: string;
 }
 
 export function useCreateOrder() {
   const queryClient = useQueryClient();
   const { toast } = useToast();
 
   return useMutation({
     mutationFn: async (data: CreateOrderData) => {
      // Check stock availability before creating order
      const productIds = data.items.map(item => item.id);
      const { data: products, error: stockError } = await supabase
        .from('products')
        .select('id, name, stock_quantity, in_stock')
        .in('id', productIds);

      if (stockError) throw stockError;

      // Validate stock for each item
      const insufficientStock: StockCheck[] = [];
      for (const item of data.items) {
        const product = products?.find(p => p.id === item.id);
        if (!product || !product.in_stock || (product.stock_quantity !== null && product.stock_quantity < item.quantity)) {
          insufficientStock.push({
            productId: item.id,
            productName: item.name,
            requestedQuantity: item.quantity,
            availableStock: product?.stock_quantity ?? 0,
          });
        }
      }

      if (insufficientStock.length > 0) {
        const outOfStockItems = insufficientStock.map(i => i.productName).join(', ');
        throw new Error(`Insufficient stock for: ${outOfStockItems}`);
      }

       // Create the order
       // Generate order number in format ORD-YYYYMMDD-XXXX
       const now = new Date();
       const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
       const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
       const orderNumber = `ORD-${dateStr}-${randomNum}`;
 
       const { data: order, error: orderError } = await supabase
         .from('orders')
        .insert([{
           customer_name: data.customerName,
           customer_email: data.customerEmail,
           customer_phone: data.customerPhone || null,
          shipping_address: JSON.parse(JSON.stringify(data.shippingAddress)) as Json,
           subtotal: data.subtotal,
           shipping_cost: data.shippingCost,
           total: data.total,
           notes: data.notes || null,
           user_id: data.userId || null,
           status: 'pending',
           order_number: orderNumber,
        }])
         .select()
         .single();
 
       if (orderError) throw orderError;
 
       // Create order items
       const orderItems = data.items.map((item) => ({
         order_id: order.id,
         product_id: item.id,
         product_name: item.name,
         product_name_ar: item.nameAr,
         quantity: item.quantity,
         unit_price: item.price,
         total_price: item.price * item.quantity,
       }));
 
       const { error: itemsError } = await supabase
         .from('order_items')
         .insert(orderItems);
 
       if (itemsError) throw itemsError;
 
       return order;
     },
     onSuccess: (order) => {
       queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
       toast({
         title: 'Order placed successfully!',
         description: `Order number: ${order.order_number}`,
       });
     },
     onError: (error: Error) => {
       toast({
         title: 'Failed to place order',
         description: error.message,
         variant: 'destructive',
       });
     },
   });
 }