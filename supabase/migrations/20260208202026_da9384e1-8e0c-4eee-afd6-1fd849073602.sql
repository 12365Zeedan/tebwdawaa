
-- Create table for storing historical trend analysis reports
CREATE TABLE public.trend_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_type TEXT NOT NULL,
  query TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  result JSONB NOT NULL,
  summary TEXT,
  triggered_by TEXT NOT NULL DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trend_reports ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write trend reports
CREATE POLICY "Admins can view trend reports"
  ON public.trend_reports FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert trend reports"
  ON public.trend_reports FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete trend reports"
  ON public.trend_reports FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Index for fast lookups
CREATE INDEX idx_trend_reports_type_date ON public.trend_reports (analysis_type, created_at DESC);
