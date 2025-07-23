# Supabase Authentication Setup

This guide will help you set up Supabase authentication with email, Google, and LinkedIn OAuth.

## 1. Supabase Project Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings

## 2. Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 3. Database Setup

Run the SQL migration in your Supabase SQL editor:

```sql
-- Copy the contents of supabase/migrations/001_create_users_table.sql
```

## 4. OAuth Provider Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized origins:
   - `https://your-project-id.supabase.co`
   - `http://localhost:3000` (for development)
7. Add authorized redirect URIs:
   - `https://your-project-id.supabase.co/auth/v1/callback`
8. Copy the Client ID and Client Secret

### LinkedIn OAuth

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create a new app
3. Add OAuth 2.0 redirect URLs:
   - `https://your-project-id.supabase.co/auth/v1/callback`
4. Copy the Client ID and Client Secret

## 5. Configure Supabase Auth

1. Go to your Supabase dashboard → Authentication → Providers
2. Enable Email provider
3. Configure Google provider:
   - Enable Google
   - Add your Google Client ID and Client Secret
4. Configure LinkedIn provider:
   - Enable LinkedIn
   - Add your LinkedIn Client ID and Client Secret

## 6. Usage

The authentication system is now ready to use! The `useAuth` hook provides:

```typescript
const {
  user,           // Current user object
  session,        // Current session
  profile,        // User profile (plan, credits, etc.)
  loading,        // Loading state
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signInWithLinkedIn,
  signOut
} = useAuth();
```

## 7. Features

- ✅ Email/password authentication
- ✅ Google OAuth
- ✅ LinkedIn OAuth
- ✅ Automatic user profile creation
- ✅ Session management
- ✅ User profile with plan and credits
- ✅ Row Level Security (RLS)
- ✅ TypeScript support

## 8. Testing

1. Start your development server: `npm run dev`
2. Visit `/auth/login` or `/auth/signup`
3. Test all authentication methods
4. Check that user profiles are created automatically