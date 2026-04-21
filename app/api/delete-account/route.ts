import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase as clientSupabase } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(request: NextRequest) {
  const limited = await rateLimit(request, { limit: 5, window: 60, prefix: 'delete-account' });
  if (limited) return limited;
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await clientSupabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete all interview sessions
    const { error: sessionsError } = await supabase
      .from('interview_sessions')
      .delete()
      .eq('user_id', user.id);

    if (sessionsError) {
      console.error('Error deleting sessions:', sessionsError);
      return NextResponse.json({ error: 'Failed to delete user data' }, { status: 500 });
    }

    // Delete the users row
    const { error: profileError } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id);

    if (profileError) {
      console.error('Error deleting profile:', profileError);
      return NextResponse.json({ error: 'Failed to delete user profile' }, { status: 500 });
    }

    // Delete the auth user via admin API
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteAuthError) {
      console.error('Error deleting auth user:', deleteAuthError);
      return NextResponse.json({ error: 'Failed to delete auth account' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
