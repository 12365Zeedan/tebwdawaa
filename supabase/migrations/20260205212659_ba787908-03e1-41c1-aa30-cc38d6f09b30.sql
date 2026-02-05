-- Allow guest checkout: unauthenticated users can create orders with NULL user_id
CREATE POLICY "Allow guest checkout orders"
ON public.orders
FOR INSERT
WITH CHECK (
  user_id IS NULL AND auth.uid() IS NULL
);

-- Allow guest order items: items for orders where user_id IS NULL
CREATE POLICY "Allow guest order items insert"
ON public.order_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id IS NULL
  )
);
