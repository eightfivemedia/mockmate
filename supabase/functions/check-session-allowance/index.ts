import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { user_id } = await req.json();
  if (!user_id) {
    return new Response(JSON.stringify({ allowed: false, reason: 'missing_user_id' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: user, error } = await supabase
    .from('users')
    .select('sessions_used_this_month, session_hard_cap, monthly_session_limit, api_cost_this_month, api_cost_limit, flagged_for_review, plan, email, limit_warning_sent')
    .eq('id', user_id)
    .single();

  if (error || !user) {
    return new Response(JSON.stringify({ allowed: false, reason: 'user_not_found' }), {
      status: 404, headers: { 'Content-Type': 'application/json' },
    });
  }

  // Hard block: account flagged for manual review
  if (user.flagged_for_review) {
    return new Response(JSON.stringify({ allowed: false, reason: 'account_flagged' }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  }

  // Hard block: API cost limit exceeded
  if (user.api_cost_this_month >= user.api_cost_limit) {
    return new Response(JSON.stringify({ allowed: false, reason: 'api_cost_limit_reached' }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  }

  const isPro = user.plan === 'pro' || user.monthly_session_limit >= 500;

  // Block free and student users cleanly at their monthly limit
  if (!isPro && user.sessions_used_this_month >= user.monthly_session_limit) {
    // Fire warning email once on first blocked request
    if (!user.limit_warning_sent && user.email) {
      fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-session-limit-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id,
          email: user.email,
          plan: user.plan,
          session_limit: user.monthly_session_limit,
        }),
      }).catch(console.error);
    }
    return new Response(JSON.stringify({ allowed: false, reason: 'monthly_limit_reached' }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  }

  // Flag for review only if someone somehow exceeds the hard cap (abuse detection)
  if (user.sessions_used_this_month >= user.session_hard_cap) {
    await supabase.from('users').update({ flagged_for_review: true }).eq('id', user_id);
    return new Response(JSON.stringify({ allowed: false, reason: 'hard_cap_reached' }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  }

  // Soft warning: within 2 sessions of limit (non-pro only)
  const approachingSoftCap = !isPro && user.sessions_used_this_month >= (user.monthly_session_limit - 2);

  // Increment session count
  await supabase
    .from('users')
    .update({ sessions_used_this_month: user.sessions_used_this_month + 1 })
    .eq('id', user_id);

  return new Response(
    JSON.stringify({
      allowed: true,
      warning: approachingSoftCap ? 'approaching_limit' : null,
      sessions_remaining: user.session_hard_cap - user.sessions_used_this_month - 1,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
});
