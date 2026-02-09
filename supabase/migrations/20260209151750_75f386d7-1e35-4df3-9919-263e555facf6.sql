
-- Add content settings columns to page_customizations
ALTER TABLE public.page_customizations
ADD COLUMN IF NOT EXISTS page_title text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS page_title_ar text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS page_subtitle text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS page_subtitle_ar text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS meta_title text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS meta_description text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS og_image_url text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS hidden_sections text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS banner_text text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS banner_text_ar text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS banner_visible boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS banner_color text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS widget_ids text[] DEFAULT '{}';
