import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // User must be authenticated — their JWT comes in the Authorization header
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Use the anon client to resolve the calling user from their JWT
  const supabaseUser = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: { user }, error: userErr } = await supabaseUser.auth.getUser();
  if (userErr || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate the email still ends in .edu
  if (!user.email?.toLowerCase().endsWith('.edu')) {
    return new Response(
      JSON.stringify({ error: 'Re-verification requires a .edu email address.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Use the service role client to update the user record
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  const { error: updateErr } = await supabaseAdmin
    .from('users')
    .update({
      student_verified_at: now,
      student_tier_expires_at: expiresAt,
      student_discount_active: true,
      student_reverification_sent_at: null,
    })
    .eq('id', user.id);

  if (updateErr) {
    console.error('Error updating student verification:', updateErr);
    return new Response(JSON.stringify({ error: 'Failed to update verification.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({ ok: true, student_tier_expires_at: expiresAt }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
});
