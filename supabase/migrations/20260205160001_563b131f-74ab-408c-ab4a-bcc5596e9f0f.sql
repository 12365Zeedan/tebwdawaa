-- Insert default settings for store configuration
INSERT INTO public.app_settings (key, value, description)
VALUES 
  ('store_name', '"My Store"', 'The name of the store'),
  ('store_name_ar', '"متجري"', 'The Arabic name of the store'),
  ('currency', '"SAR"', 'The default currency code'),
  ('shipping_cost', '15', 'Default shipping cost'),
  ('free_shipping_threshold', '200', 'Order amount for free shipping'),
  ('maintenance_mode', 'false', 'Enable maintenance mode'),
  ('guest_checkout_enabled', 'true', 'Allow guest checkout'),
  ('new_order_notifications', 'true', 'Send email for new orders'),
  ('low_stock_notifications', 'true', 'Send alerts for low stock')
ON CONFLICT (key) DO NOTHING;