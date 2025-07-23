# Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

## Required Variables

### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### OpenAI Configuration (New)
```
OPENAI_API_KEY=your_openai_api_key_here
```

## How to Get These Values

### Supabase
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the Project URL and anon/public key
4. For the service role key, use the service_role key (keep this secret!)

### OpenAI
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key to your .env.local file

## Security Notes
- Never commit `.env.local` to version control
- The service role key has admin privileges - keep it secure
- The OpenAI API key should be kept private