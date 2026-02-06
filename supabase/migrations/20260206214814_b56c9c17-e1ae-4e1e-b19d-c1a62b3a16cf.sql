
-- Add vat_enabled column to products table (defaults to false so existing products are unaffected)
ALTER TABLE public.products
ADD COLUMN vat_enabled boolean NOT NULL DEFAULT false;
