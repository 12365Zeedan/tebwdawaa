
-- Create branding storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('branding', 'branding', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to branding bucket
CREATE POLICY "Branding images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'branding');

-- Allow admins to manage branding images
CREATE POLICY "Admins can manage branding images"
ON storage.objects FOR ALL
USING (bucket_id = 'branding' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'branding' AND public.has_role(auth.uid(), 'admin'));

-- Insert default setting rows for logos and branding colors
INSERT INTO public.app_settings (key, value, description)
VALUES
  ('logo_white_bg', '""', 'Company logo with white background'),
  ('logo_transparent', '""', 'Company logo without background (transparent)'),
  ('branding_colors', '"[]"', 'Brand color palette (array of hex colors)')
ON CONFLICT DO NOTHING;
