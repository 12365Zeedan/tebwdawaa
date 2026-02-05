-- Create product reviews table
CREATE TABLE public.product_reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title text,
    content text,
    is_verified_purchase boolean DEFAULT false,
    is_approved boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(product_id, user_id)
);

-- Enable RLS
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved reviews
CREATE POLICY "Anyone can view approved reviews"
ON public.product_reviews
FOR SELECT
USING (is_approved = true);

-- Users can create reviews for products they've purchased
CREATE POLICY "Users can create reviews for purchased products"
ON public.product_reviews
FOR INSERT
WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
        SELECT 1 FROM public.orders o
        JOIN public.order_items oi ON oi.order_id = o.id
        WHERE o.user_id = auth.uid()
        AND oi.product_id = product_reviews.product_id
        AND o.status IN ('delivered', 'shipped')
    )
);

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews"
ON public.product_reviews
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews"
ON public.product_reviews
FOR DELETE
USING (auth.uid() = user_id);

-- Admins can manage all reviews
CREATE POLICY "Admins can manage reviews"
ON public.product_reviews
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes
CREATE INDEX idx_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX idx_reviews_user_id ON public.product_reviews(user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.product_reviews
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create function to update product rating when reviews change
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    avg_rating numeric;
    review_count integer;
    target_product_id uuid;
BEGIN
    -- Get the product_id based on operation
    IF TG_OP = 'DELETE' THEN
        target_product_id := OLD.product_id;
    ELSE
        target_product_id := NEW.product_id;
    END IF;

    -- Calculate new average and count
    SELECT 
        COALESCE(AVG(rating), 0),
        COUNT(*)
    INTO avg_rating, review_count
    FROM public.product_reviews
    WHERE product_id = target_product_id
    AND is_approved = true;

    -- Update product
    UPDATE public.products
    SET 
        rating = ROUND(avg_rating, 1),
        review_count = review_count
    WHERE id = target_product_id;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;

-- Create triggers to update product rating
CREATE TRIGGER update_rating_on_review_insert
AFTER INSERT ON public.product_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_product_rating();

CREATE TRIGGER update_rating_on_review_update
AFTER UPDATE ON public.product_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_product_rating();

CREATE TRIGGER update_rating_on_review_delete
AFTER DELETE ON public.product_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_product_rating();