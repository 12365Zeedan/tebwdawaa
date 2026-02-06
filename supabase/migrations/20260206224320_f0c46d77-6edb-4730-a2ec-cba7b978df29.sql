INSERT INTO public.app_settings (key, value, description)
VALUES ('vat_number', '""', 'VAT registration number for ZATCA compliance')
ON CONFLICT (key) DO NOTHING;