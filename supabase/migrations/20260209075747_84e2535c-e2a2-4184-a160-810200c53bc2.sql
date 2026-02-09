
-- Create storage bucket for payment receipts/proofs
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-receipts', 'payment-receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their payment receipts
CREATE POLICY "Users can upload payment receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payment-receipts');

-- Allow authenticated users to view their own receipts
CREATE POLICY "Users can view payment receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'payment-receipts');

-- Allow admins to view all payment receipts
CREATE POLICY "Admins can view all payment receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-receipts' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Add payment_proof_url to payment_transactions
ALTER TABLE public.payment_transactions 
ADD COLUMN IF NOT EXISTS payment_proof_url text;
