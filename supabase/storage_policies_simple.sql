-- Simple storage policies for profile-images bucket
-- Apply these in your Supabase Dashboard > Storage > Policies

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow users to upload files that start with their user ID
CREATE POLICY "Users can upload profile images" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-images' AND
    name LIKE auth.uid()::text || '%'
  );

-- Allow users to view files that start with their user ID
CREATE POLICY "Users can view profile images" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'profile-images' AND
    name LIKE auth.uid()::text || '%'
  );

-- Allow users to update files that start with their user ID
CREATE POLICY "Users can update profile images" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'profile-images' AND
    name LIKE auth.uid()::text || '%'
  )
  WITH CHECK (
    bucket_id = 'profile-images' AND
    name LIKE auth.uid()::text || '%'
  );

-- Allow users to delete files that start with their user ID
CREATE POLICY "Users can delete profile images" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'profile-images' AND
    name LIKE auth.uid()::text || '%'
  );