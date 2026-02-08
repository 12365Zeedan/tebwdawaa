
-- Create table for site health scan results
CREATE TABLE public.site_health_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_type TEXT NOT NULL DEFAULT 'manual', -- 'manual' or 'scheduled'
  overall_score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'running', -- 'running', 'completed', 'failed'
  results JSONB NOT NULL DEFAULT '[]'::jsonb,
  issues_found INTEGER NOT NULL DEFAULT 0,
  issues_fixed INTEGER NOT NULL DEFAULT 0,
  scan_duration_ms INTEGER,
  triggered_by TEXT, -- user id or 'system'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Create table for scheduled health scans
CREATE TABLE public.site_health_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  is_active BOOLEAN NOT NULL DEFAULT true,
  frequency TEXT NOT NULL DEFAULT 'daily', -- 'hourly', 'daily', 'weekly'
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  check_categories TEXT[] NOT NULL DEFAULT ARRAY['performance', 'security', 'seo', 'accessibility'],
  notify_on_issues BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_health_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_health_schedules ENABLE ROW LEVEL SECURITY;

-- Admin-only policies for scans
CREATE POLICY "Admins can view health scans"
  ON public.site_health_scans FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create health scans"
  ON public.site_health_scans FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update health scans"
  ON public.site_health_scans FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete health scans"
  ON public.site_health_scans FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin-only policies for schedules
CREATE POLICY "Admins can view health schedules"
  ON public.site_health_schedules FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage health schedules"
  ON public.site_health_schedules FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Updated at trigger
CREATE TRIGGER update_site_health_schedules_updated_at
  BEFORE UPDATE ON public.site_health_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
