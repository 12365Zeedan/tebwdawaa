
-- Create table for backup records
CREATE TABLE public.site_backups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  backup_type TEXT NOT NULL DEFAULT 'manual', -- 'manual', 'scheduled'
  backup_scope TEXT NOT NULL DEFAULT 'full', -- 'full', 'database', 'storage', 'settings'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
  file_size_bytes BIGINT,
  tables_included TEXT[] DEFAULT '{}',
  notes TEXT,
  error_message TEXT,
  triggered_by TEXT, -- user id or 'system'
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create table for backup schedules
CREATE TABLE public.backup_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  is_active BOOLEAN NOT NULL DEFAULT false,
  frequency TEXT NOT NULL DEFAULT 'daily', -- 'daily', 'weekly', 'monthly'
  backup_scope TEXT NOT NULL DEFAULT 'full',
  retention_days INTEGER NOT NULL DEFAULT 30,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  notify_on_complete BOOLEAN NOT NULL DEFAULT true,
  notify_on_failure BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_schedules ENABLE ROW LEVEL SECURITY;

-- Admin-only policies for backups
CREATE POLICY "Admins can view backups"
  ON public.site_backups FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create backups"
  ON public.site_backups FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update backups"
  ON public.site_backups FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete backups"
  ON public.site_backups FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin-only policies for backup schedules
CREATE POLICY "Admins can view backup schedules"
  ON public.backup_schedules FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create backup schedules"
  ON public.backup_schedules FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update backup schedules"
  ON public.backup_schedules FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete backup schedules"
  ON public.backup_schedules FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Updated at trigger for schedules
CREATE TRIGGER update_backup_schedules_updated_at
  BEFORE UPDATE ON public.backup_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
