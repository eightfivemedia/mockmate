import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Supabase config check:', {
  url: supabaseUrl ? 'Set' : 'Missing',
  key: supabaseAnonKey ? 'Set' : 'Missing',
  fullUrl: supabaseUrl
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set. Please create a .env.local file with your Supabase credentials.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Test the connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Supabase connection test failed:', error);
  } else {
    console.log('Supabase connection test successful');
  }
});

// Database types
export interface User {
  id: string
  email: string
  name?: string
  plan: 'free' | 'monthly' | 'credit-based'
  credits: number
  created_at: string
}

export interface UserProfile {
  id: string
  email: string
  name?: string
  plan: 'free' | 'monthly' | 'credit-based'
  credits: number
  profile_image_url?: string
  created_at: string
} 