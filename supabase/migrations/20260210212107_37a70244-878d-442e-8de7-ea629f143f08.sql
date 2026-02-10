
-- Remove the overly permissive INSERT policy on theme_update_downloads
-- Downloads should only be tracked through the check-theme-update edge function using service role
DROP POLICY IF EXISTS "Allow download tracking inserts" ON public.theme_update_downloads;

-- Only allow inserts via service role (no public INSERT policy needed)
-- The check-theme-update edge function uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS

-- Update record_blog_view to hash IP addresses for privacy
CREATE OR REPLACE FUNCTION public.record_blog_view(p_blog_post_id uuid, p_viewer_ip text DEFAULT NULL::text, p_user_agent text DEFAULT NULL::text, p_referrer text DEFAULT NULL::text, p_user_id uuid DEFAULT NULL::uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  post_exists boolean;
  duplicate_view boolean;
  hashed_ip text;
BEGIN
  -- Validate post exists and is published
  SELECT EXISTS(
    SELECT 1 FROM public.blog_posts
    WHERE id = p_blog_post_id
    AND is_published = true
  ) INTO post_exists;

  IF NOT post_exists THEN
    RAISE EXCEPTION 'Post not found or not published';
  END IF;

  -- Hash IP for privacy (using SHA-256 with post_id as salt)
  IF p_viewer_ip IS NOT NULL THEN
    hashed_ip := encode(digest(p_viewer_ip || p_blog_post_id::text || to_char(now(), 'YYYY-MM-DD'), 'sha256'), 'hex');
  ELSE
    hashed_ip := NULL;
  END IF;

  -- Basic rate limiting: skip if same hashed IP viewed same post within 1 hour
  IF hashed_ip IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM public.blog_post_views
      WHERE blog_post_id = p_blog_post_id
      AND viewer_ip = hashed_ip
      AND created_at > now() - interval '1 hour'
    ) INTO duplicate_view;

    IF duplicate_view THEN
      RETURN; -- Skip duplicate view
    END IF;
  END IF;

  -- Insert view record with hashed IP (no raw IP stored)
  INSERT INTO public.blog_post_views (blog_post_id, viewer_ip, user_agent, referrer, user_id)
  VALUES (p_blog_post_id, hashed_ip, NULL, p_referrer, p_user_id);

  -- Increment counter
  UPDATE public.blog_posts
  SET view_count = view_count + 1
  WHERE id = p_blog_post_id;
END;
$function$;
