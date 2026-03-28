-- Allow authenticated users to upload their own avatars to platform-assets
CREATE POLICY "Users upload own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'platform-assets'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update (upsert) their own files in platform-assets
CREATE POLICY "Users update own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'platform-assets'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own files in platform-assets
CREATE POLICY "Users delete own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'platform-assets'
  AND (storage.foldername(name))[1] = auth.uid()::text
);