
-- Create installed_plugins table to track which plugins are installed and active
CREATE TABLE public.installed_plugins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plugin_key TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT false,
  settings JSONB DEFAULT '{}',
  installed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.installed_plugins ENABLE ROW LEVEL SECURITY;

-- Only admins can manage plugins
CREATE POLICY "Admins can view plugins"
  ON public.installed_plugins FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert plugins"
  ON public.installed_plugins FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update plugins"
  ON public.installed_plugins FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete plugins"
  ON public.installed_plugins FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_installed_plugins_updated_at
  BEFORE UPDATE ON public.installed_plugins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
