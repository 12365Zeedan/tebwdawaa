-- Add parent_category_id to categories table for subcategories
ALTER TABLE public.categories 
ADD COLUMN parent_category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL;

-- Create index for efficient subcategory lookups
CREATE INDEX idx_categories_parent ON public.categories(parent_category_id);

-- Add is_new_arrival and is_best_seller flags to products
ALTER TABLE public.products 
ADD COLUMN is_new_arrival boolean DEFAULT false,
ADD COLUMN is_best_seller boolean DEFAULT false;