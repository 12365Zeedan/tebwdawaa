-- Add payment fields to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cod',
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_reference TEXT;

-- Create payment transactions table for logging
CREATE TABLE public.payment_transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    payment_method TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'SAR',
    status TEXT DEFAULT 'pending',
    gateway_reference TEXT,
    gateway_response JSONB,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on payment_transactions
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view their own transactions"
ON public.payment_transactions
FOR SELECT
USING (
    order_id IN (
        SELECT id FROM public.orders WHERE user_id = auth.uid()
    )
);

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions"
ON public.payment_transactions
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow insert for authenticated users (for their orders)
CREATE POLICY "Users can create transactions for their orders"
ON public.payment_transactions
FOR INSERT
WITH CHECK (
    order_id IN (
        SELECT id FROM public.orders WHERE user_id = auth.uid()
    )
);

-- Allow anonymous insert for guest checkout
CREATE POLICY "Allow guest checkout transactions"
ON public.payment_transactions
FOR INSERT
WITH CHECK (
    order_id IN (
        SELECT id FROM public.orders WHERE user_id IS NULL
    )
);

-- Create updated_at trigger
CREATE TRIGGER update_payment_transactions_updated_at
BEFORE UPDATE ON public.payment_transactions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create index for faster lookups
CREATE INDEX idx_payment_transactions_order_id ON public.payment_transactions(order_id);
CREATE INDEX idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);