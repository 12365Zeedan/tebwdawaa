
-- Create order tracking events table
CREATE TABLE public.order_tracking_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  tracking_number TEXT,
  location TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.order_tracking_events ENABLE ROW LEVEL SECURITY;

-- Admins can manage all tracking events
CREATE POLICY "Admins can manage tracking events"
ON public.order_tracking_events
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view tracking events for their own orders
CREATE POLICY "Users can view their order tracking"
ON public.order_tracking_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_tracking_events.order_id
    AND orders.user_id = auth.uid()
  )
);

-- Create index for faster lookups
CREATE INDEX idx_order_tracking_events_order_id ON public.order_tracking_events(order_id);
CREATE INDEX idx_order_tracking_events_created_at ON public.order_tracking_events(created_at);
