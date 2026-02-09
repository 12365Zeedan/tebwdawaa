
-- Per-page customization settings
CREATE TABLE public.page_customizations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key text NOT NULL UNIQUE,
  page_label text NOT NULL,
  page_label_ar text NOT NULL,
  
  -- Colors
  background_color text DEFAULT NULL,
  text_color text DEFAULT NULL,
  link_color text DEFAULT NULL,
  link_hover_color text DEFAULT NULL,
  border_color text DEFAULT NULL,
  
  -- Typography
  font_size text DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
  font_weight text DEFAULT 'normal' CHECK (font_weight IN ('normal', 'medium', 'semibold', 'bold')),
  
  -- Layout
  height text DEFAULT 'default' CHECK (height IN ('compact', 'default', 'tall')),
  layout_style text DEFAULT 'standard' CHECK (layout_style IN ('standard', 'centered', 'minimal')),
  full_width boolean DEFAULT false,
  
  -- Styles
  sticky_header boolean DEFAULT false,
  border_bottom boolean DEFAULT false,
  backdrop_blur boolean DEFAULT false,
  shadow_depth text DEFAULT 'none' CHECK (shadow_depth IN ('none', 'sm', 'md', 'lg', 'xl')),
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_customizations ENABLE ROW LEVEL SECURITY;

-- Public read (storefront needs to read these)
CREATE POLICY "Page customizations are publicly readable"
ON public.page_customizations FOR SELECT USING (true);

-- Admin write
CREATE POLICY "Admins can manage page customizations"
ON public.page_customizations FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Updated at trigger
CREATE TRIGGER update_page_customizations_updated_at
BEFORE UPDATE ON public.page_customizations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default pages
INSERT INTO public.page_customizations (page_key, page_label, page_label_ar) VALUES
  ('homepage', 'Homepage', 'الصفحة الرئيسية'),
  ('products', 'Products', 'المنتجات'),
  ('product_detail', 'Product Detail', 'تفاصيل المنتج'),
  ('categories', 'Categories', 'الفئات'),
  ('category_detail', 'Category Detail', 'تفاصيل الفئة'),
  ('blog', 'Blog', 'المدونة'),
  ('blog_post', 'Blog Post', 'مقالة المدونة'),
  ('about', 'About', 'من نحن'),
  ('cart', 'Cart', 'سلة التسوق'),
  ('checkout', 'Checkout', 'الدفع'),
  ('wishlist', 'Wishlist', 'المفضلة'),
  ('compare', 'Compare', 'المقارنة'),
  ('auth', 'Login / Register', 'تسجيل الدخول'),
  ('profile', 'Profile', 'الملف الشخصي'),
  ('order_history', 'Order History', 'سجل الطلبات');
