-- Add barcode column to products table for international barcode scanning
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS barcode TEXT UNIQUE;