
-- Discount Codes table (covers: discount code, influencer code)
CREATE TABLE public.discount_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  description_ar TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL DEFAULT 0,
  min_order_amount NUMERIC DEFAULT 0,
  max_discount_amount NUMERIC DEFAULT NULL,
  usage_limit INTEGER DEFAULT NULL,
  usage_count INTEGER NOT NULL DEFAULT 0,
  is_influencer BOOLEAN NOT NULL DEFAULT false,
  influencer_name TEXT,
  influencer_name_ar TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Product Offers table (covers: product discount, 1+1, group offers)
CREATE TABLE public.product_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  description_ar TEXT,
  offer_type TEXT NOT NULL CHECK (offer_type IN ('discount', 'buy_one_get_one', 'group')),
  discount_percentage NUMERIC DEFAULT 0,
  product_ids UUID[] NOT NULL DEFAULT '{}',
  min_quantity INTEGER DEFAULT 1,
  group_price NUMERIC DEFAULT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Loyalty Program Settings
CREATE TABLE public.loyalty_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  points_per_currency NUMERIC NOT NULL DEFAULT 1,
  currency_per_point NUMERIC NOT NULL DEFAULT 0.1,
  min_redeem_points INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT false,
  welcome_bonus INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Customer Loyalty Points
CREATE TABLE public.customer_loyalty_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_redeemed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Loyalty Points History
CREATE TABLE public.loyalty_points_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  points INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earned', 'redeemed', 'bonus', 'expired')),
  description TEXT,
  order_id UUID REFERENCES public.orders(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_points_history ENABLE ROW LEVEL SECURITY;

-- Discount codes: admins manage, anyone can read active codes (for validation at checkout)
CREATE POLICY "Anyone can read active discount codes" ON public.discount_codes
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage discount codes" ON public.discount_codes
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Product offers: anyone can read active, admins manage
CREATE POLICY "Anyone can read active product offers" ON public.product_offers
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage product offers" ON public.product_offers
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Loyalty settings: anyone can read, admins manage
CREATE POLICY "Anyone can read loyalty settings" ON public.loyalty_settings
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage loyalty settings" ON public.loyalty_settings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Customer loyalty points: users read own, admins manage all
CREATE POLICY "Users can read own loyalty points" ON public.customer_loyalty_points
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all loyalty points" ON public.customer_loyalty_points
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Loyalty history: users read own, admins read all
CREATE POLICY "Users can read own loyalty history" ON public.loyalty_points_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all loyalty history" ON public.loyalty_points_history
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_discount_codes_updated_at
  BEFORE UPDATE ON public.discount_codes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_product_offers_updated_at
  BEFORE UPDATE ON public.product_offers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_loyalty_settings_updated_at
  BEFORE UPDATE ON public.loyalty_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_customer_loyalty_points_updated_at
  BEFORE UPDATE ON public.customer_loyalty_points
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert default loyalty settings
INSERT INTO public.loyalty_settings (points_per_currency, currency_per_point, min_redeem_points, is_active, welcome_bonus)
VALUES (1, 0.1, 100, false, 0);
