
-- Create custom_widgets table for dynamic sections on any page
CREATE TABLE public.custom_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page TEXT NOT NULL DEFAULT 'home',
  widget_type TEXT NOT NULL CHECK (widget_type IN ('carousel', 'banner', 'testimonials', 'richtext')),
  title TEXT,
  title_ar TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_widgets ENABLE ROW LEVEL SECURITY;

-- Public read access for storefront rendering
CREATE POLICY "Anyone can view visible widgets"
  ON public.custom_widgets FOR SELECT
  USING (is_visible = true);

-- Admin full access
CREATE POLICY "Admins can manage widgets"
  ON public.custom_widgets FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Index for fast page lookups
CREATE INDEX idx_custom_widgets_page ON public.custom_widgets (page, sort_order);

-- Timestamp trigger
CREATE TRIGGER update_custom_widgets_updated_at
  BEFORE UPDATE ON public.custom_widgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
