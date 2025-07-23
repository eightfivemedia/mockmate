-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to upload their own profile images
CREATE POLICY "Users can upload their own profile images" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy to allow users to view their own profile images
CREATE POLICY "Users can view their own profile images" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'profile-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy to allow users to update their own profile images
CREATE POLICY "Users can update their own profile images" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'profile-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'profile-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy to allow users to delete their own profile images
CREATE POLICY "Users can delete their own profile images" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'profile-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Alternative policy for simpler naming (if you want to use user ID in filename)
-- This allows users to upload files that start with their user ID
CREATE POLICY "Users can upload files with their user ID" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-images' AND
    name LIKE auth.uid()::text || '%'
  );

-- Policy to allow users to view files with their user ID
CREATE POLICY "Users can view files with their user ID" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'profile-images' AND
    name LIKE auth.uid()::text || '%'
  );

-- Policy to allow users to update files with their user ID
CREATE POLICY "Users can update files with their user ID" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'profile-images' AND
    name LIKE auth.uid()::text || '%'
  )
  WITH CHECK (
    bucket_id = 'profile-images' AND
    name LIKE auth.uid()::text || '%'
  );

-- Policy to allow users to delete files with their user ID
CREATE POLICY "Users can delete files with their user ID" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'profile-images' AND
    name LIKE auth.uid()::text || '%'
  );