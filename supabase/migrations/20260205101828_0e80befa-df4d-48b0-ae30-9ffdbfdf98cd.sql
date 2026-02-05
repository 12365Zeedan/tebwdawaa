-- Add default shipping address column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS default_shipping_address jsonb DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.default_shipping_address IS 'Default shipping address stored as JSON with street, city, country, postalCode fields';