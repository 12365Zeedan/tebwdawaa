
-- Create the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create shipping zones table for region-based shipping rates
CREATE TABLE public.shipping_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  regions TEXT[] NOT NULL DEFAULT '{}',
  shipping_rate NUMERIC NOT NULL DEFAULT 0,
  free_shipping_threshold NUMERIC DEFAULT NULL,
  estimated_days_min INTEGER DEFAULT 1,
  estimated_days_max INTEGER DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;

-- Anyone can read active shipping zones (needed for checkout)
CREATE POLICY "Anyone can read active shipping zones"
  ON public.shipping_zones
  FOR SELECT
  USING (is_active = true);

-- Admins can manage all shipping zones
CREATE POLICY "Admins can manage shipping zones"
  ON public.shipping_zones
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_shipping_zones_updated_at
  BEFORE UPDATE ON public.shipping_zones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
