
-- Insert default payment method settings
INSERT INTO public.app_settings (key, value, description)
VALUES
  ('payment_cod_enabled', 'true', 'Enable Cash on Delivery payment method'),
  ('payment_mada_enabled', 'false', 'Enable Mada payment method'),
  ('payment_visa_enabled', 'false', 'Enable Visa payment method'),
  ('payment_mastercard_enabled', 'false', 'Enable Mastercard payment method'),
  ('payment_apple_pay_enabled', 'false', 'Enable Apple Pay payment method'),
  ('payment_stc_pay_enabled', 'false', 'Enable STC Pay payment method'),
  ('min_order_amount', '0', 'Minimum order amount required for checkout'),
  ('require_phone_checkout', 'false', 'Require phone number at checkout'),
  ('checkout_notes_enabled', 'true', 'Allow customers to add notes to orders')
ON CONFLICT (key) DO NOTHING;
