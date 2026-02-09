
-- Create storage bucket for company assets
INSERT INTO storage.buckets (id, name, public) VALUES ('company-assets', 'company-assets', true);

-- Policy to allow authenticated users to upload to their company folder
CREATE POLICY "Users can upload company assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'company-assets' AND
  (storage.foldername(name))[1] = (SELECT id::text FROM public.companies WHERE user_id = auth.uid() LIMIT 1)
);

-- Policy to allow public read access
CREATE POLICY "Public can view company assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-assets');

-- Policy to allow users to update their own assets
CREATE POLICY "Users can update own company assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'company-assets' AND
  (storage.foldername(name))[1] = (SELECT id::text FROM public.companies WHERE user_id = auth.uid() LIMIT 1)
);

-- Policy to allow users to delete their own assets
CREATE POLICY "Users can delete own company assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'company-assets' AND
  (storage.foldername(name))[1] = (SELECT id::text FROM public.companies WHERE user_id = auth.uid() LIMIT 1)
);
