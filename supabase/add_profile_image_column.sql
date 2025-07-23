-- Add profile_image_url column to users table
-- Run this in your Supabase Dashboard > SQL Editor

ALTER TABLE users
ADD COLUMN profile_image_url TEXT;

-- Add a comment to describe the column
COMMENT ON COLUMN users.profile_image_url IS 'URL to the user profile image stored in Supabase storage';

-- Optional: Add an index for better query performance
CREATE INDEX idx_users_profile_image_url ON users(profile_image_url);

-- Optional: Add a check constraint to ensure URL format (basic validation)
ALTER TABLE users
ADD CONSTRAINT check_profile_image_url_format
CHECK (profile_image_url IS NULL OR profile_image_url LIKE 'https://%');