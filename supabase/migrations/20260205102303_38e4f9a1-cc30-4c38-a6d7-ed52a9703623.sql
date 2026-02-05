-- Create function to decrease stock when order items are inserted
CREATE OR REPLACE FUNCTION public.decrease_stock_on_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Decrease stock quantity for the ordered product
    UPDATE public.products
    SET 
        stock_quantity = GREATEST(0, stock_quantity - NEW.quantity),
        in_stock = CASE 
            WHEN stock_quantity - NEW.quantity <= 0 THEN false 
            ELSE true 
        END
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$;

-- Create trigger to run after order item insertion
CREATE TRIGGER decrease_stock_after_order_item
    AFTER INSERT ON public.order_items
    FOR EACH ROW
    EXECUTE FUNCTION public.decrease_stock_on_order();