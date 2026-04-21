# Authentication Setup Checklist

## ✅ Environment Variables
- [ ] Create `.env.local` file in project root
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL=your_supabase_url`
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key`
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY=your_service_role_key`
- [ ] Add `OPENAI_API_KEY=your_openai_api_key`

## ✅ Supabase Project Setup
- [ ] Create Supabase project at [supabase.com](https://supabase.com)
- [ ] Run the SQL migration from `supabase/migrations/001_create_users_table.sql`
- [ ] Enable Row Level Security (RLS) on users table
- [ ] Verify the trigger `on_auth_user_created` is created

## ✅ Authentication Providers
- [ ] Enable Email provider in Supabase Auth settings
- [ ] Configure Google OAuth (if using):
  - [ ] Create Google Cloud Console project
  - [ ] Enable Google+ API
  - [ ] Create OAuth 2.0 credentials
  - [ ] Add authorized origins and redirect URIs
  - [ ] Configure in Supabase Auth settings

## ✅ Email Configuration
- [ ] Configure email templates in Supabase Auth settings
- [ ] Set up custom email provider (optional)
- [ ] Test email verification flow

## ✅ Testing the Authentication Flow

### Email Signup Flow
1. [ ] Visit `/auth/signup`
2. [ ] Fill in first name, last name, email, and password
3. [ ] Click "Create Account"
4. [ ] Verify redirect to `/auth/verify-email`
5. [ ] Check email for verification link
6. [ ] Click verification link
7. [ ] Verify redirect to login page with success message
8. [ ] Sign in with email and password
9. [ ] Verify redirect to `/dashboard`

### Google OAuth Flow
1. [ ] Visit `/auth/login` or `/auth/signup`
2. [ ] Click "Sign in/up with Google"
3. [ ] Complete Google OAuth flow
4. [ ] Verify redirect to `/auth/callback`
5. [ ] Verify redirect to `/dashboard`
6. [ ] Check that user profile is created automatically

### Login Flow
1. [ ] Visit `/auth/login`
2. [ ] Enter email and password
3. [ ] Click "Sign In"
4. [ ] Verify redirect to `/dashboard`

### Error Handling
1. [ ] Test with invalid email/password
2. [ ] Test with unverified email
3. [ ] Test with non-existent account
4. [ ] Verify appropriate error messages are shown

## ✅ Database Verification
- [ ] Check that users table exists
- [ ] Verify user profiles are created automatically
- [ ] Check that RLS policies are working
- [ ] Verify user data is accessible in dashboard

## ✅ Security Checks
- [ ] Verify `.env.local` is in `.gitignore`
- [ ] Check that service role key is not exposed
- [ ] Verify RLS policies are restrictive
- [ ] Test that users can only access their own data

## Common Issues and Solutions

### Issue: "Authentication failed" error
**Solution:** Check environment variables and Supabase configuration

### Issue: User profile not created
**Solution:** Verify the database trigger is working correctly

### Issue: Google OAuth not working
**Solution:** Check Google Cloud Console configuration and redirect URIs

### Issue: Email verification not working
**Solution:** Check email provider configuration in Supabase

### Issue: Users can't access dashboard
**Solution:** Verify RLS policies and user profile creation

## Next Steps
After completing this checklist:
1. Test the full user journey
2. Set up production environment variables
3. Configure custom domain (if needed)
4. Set up monitoring and logging
5. Test with real users 