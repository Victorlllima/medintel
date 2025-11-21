-- Supabase Storage Setup for Documents Bucket

-- This script should be run in Supabase SQL Editor or via Supabase CLI

-- Create the documents bucket (if not exists)
-- Note: Storage buckets are typically created via Supabase Dashboard or Storage API
-- This is a reference for the configuration needed

-- Storage bucket configuration:
-- Bucket name: documents
-- Public: false (private bucket)
-- File size limit: 10MB
-- Allowed MIME types: application/pdf

-- Storage policies for the documents bucket

-- Policy: Allow authenticated users to upload documents
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to view their own documents
CREATE POLICY "Allow users to view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to delete their own documents
CREATE POLICY "Allow users to delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow service role full access
CREATE POLICY "Service role has full access"
ON storage.objects
TO service_role
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');
