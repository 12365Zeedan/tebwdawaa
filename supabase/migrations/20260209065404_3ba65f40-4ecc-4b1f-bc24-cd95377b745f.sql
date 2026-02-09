
-- Theme versions table
CREATE TABLE public.theme_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version VARCHAR(20) NOT NULL,
  title TEXT NOT NULL,
  title_ar TEXT NOT NULL DEFAULT '',
  changelog TEXT,
  changelog_ar TEXT,
  wordpress_file_url TEXT,
  shopify_file_url TEXT,
  salla_file_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Theme licenses table
CREATE TABLE public.theme_licenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  license_key VARCHAR(64) NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('wordpress', 'shopify', 'salla')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Theme update downloads tracking
CREATE TABLE public.theme_update_downloads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version_id UUID NOT NULL REFERENCES public.theme_versions(id) ON DELETE CASCADE,
  license_id UUID NOT NULL REFERENCES public.theme_licenses(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  ip_address TEXT,
  downloaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.theme_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_update_downloads ENABLE ROW LEVEL SECURITY;

-- Theme versions: admins can do everything, public can read published
CREATE POLICY "Anyone can view published theme versions"
  ON public.theme_versions FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage theme versions"
  ON public.theme_versions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Theme licenses: admins only
CREATE POLICY "Admins can manage licenses"
  ON public.theme_licenses FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Downloads: admins can view, insert allowed for download tracking
CREATE POLICY "Admins can view downloads"
  ON public.theme_update_downloads FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Allow download tracking inserts"
  ON public.theme_update_downloads FOR INSERT
  WITH CHECK (true);

-- Updated_at triggers
CREATE TRIGGER update_theme_versions_updated_at
  BEFORE UPDATE ON public.theme_versions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_theme_licenses_updated_at
  BEFORE UPDATE ON public.theme_licenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for theme files
INSERT INTO storage.buckets (id, name, public) VALUES ('theme-files', 'theme-files', false);

-- Storage policies: admins can upload, licensed users download via edge function
CREATE POLICY "Admins can manage theme files"
  ON storage.objects FOR ALL
  USING (bucket_id = 'theme-files' AND public.has_role(auth.uid(), 'admin'));
