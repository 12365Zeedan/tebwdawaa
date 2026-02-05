-- Create stock history table
CREATE TABLE public.stock_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    previous_quantity integer NOT NULL,
    new_quantity integer NOT NULL,
    change_amount integer NOT NULL,
    change_type text NOT NULL CHECK (change_type IN ('order', 'manual_adjustment', 'restock', 'initial')),
    changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    notes text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stock_history ENABLE ROW LEVEL SECURITY;

-- Admins can view and manage stock history
CREATE POLICY "Admins can manage stock history"
ON public.stock_history
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster lookups
CREATE INDEX idx_stock_history_product_id ON public.stock_history(product_id);
CREATE INDEX idx_stock_history_created_at ON public.stock_history(created_at DESC);

-- Update the decrease_stock_on_order function to also log to stock_history
CREATE OR REPLACE FUNCTION public.decrease_stock_on_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_stock integer;
    new_stock integer;
BEGIN
    -- Get current stock
    SELECT stock_quantity INTO current_stock
    FROM public.products
    WHERE id = NEW.product_id;

    -- Calculate new stock
    new_stock := GREATEST(0, current_stock - NEW.quantity);

    -- Update product stock
    UPDATE public.products
    SET 
        stock_quantity = new_stock,
        in_stock = CASE WHEN new_stock <= 0 THEN false ELSE true END
    WHERE id = NEW.product_id;

    -- Log to stock history
    INSERT INTO public.stock_history (
        product_id,
        previous_quantity,
        new_quantity,
        change_amount,
        change_type,
        notes
    ) VALUES (
        NEW.product_id,
        current_stock,
        new_stock,
        -NEW.quantity,
        'order',
        'Order item: ' || NEW.id::text
    );

    RETURN NEW;
END;
$$;