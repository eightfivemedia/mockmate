import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

async function sendReverificationEmail(email: string, expiresAt: string) {
  const expiryDate = new Date(expiresAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const reverifyUrl = `${Deno.env.get('APP_URL') ?? 'https://mockmate.app'}/auth/reverify-student`;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'MockMate <info@eightfivemedia.com>',
      to: email,
      subject: 'Your MockMate student discount expires soon',
      html: `<p>Your student discount expires on <strong>${expiryDate}</strong>. <a href="${reverifyUrl}">Re-verify here</a>.</p>`,
    }),
  });
}

async function sendDiscountExpiredEmail(email: string) {
  const reverifyUrl = `${Deno.env.get('APP_URL') ?? 'https://mockmate.app'}/auth/reverify-student`;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'MockMate <info@eightfivemedia.com>',
      to: email,
      subject: 'Your MockMate student discount has expired',
      html: `<p>Your student discount has expired. <a href="${reverifyUrl}">Re-verify to restore it</a>.</p>`,
    }),
  });
}

Deno.serve(async (req) => {
  // Only allow POST (from cron via net.http_post) or GET (manual trigger)
  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // ── Step 1: Notify users expiring within 30 days (not yet notified) ─────────
  const { data: expiringSoon, error: expiringErr } = await supabase
    .from('users')
    .select('id, email, student_tier_expires_at')
    .lte('student_tier_expires_at', in30Days.toISOString())
    .gte('student_tier_expires_at', now.toISOString())
    .is('student_reverification_sent_at', null);

  if (expiringErr) {
    console.error('Error fetching expiring users:', expiringErr);
  }

  const notified: string[] = [];
  for (const user of expiringSoon ?? []) {
    await sendReverificationEmail(user.email, user.student_tier_expires_at);
    await supabase
      .from('users')
      .update({ student_reverification_sent_at: now.toISOString() })
      .eq('id', user.id);
    notified.push(user.id);
  }

  // ── Step 2: Downgrade users whose discount has expired ───────────────────────
  const { data: expired, error: expiredErr } = await supabase
    .from('users')
    .select('id, email')
    .lt('student_tier_expires_at', now.toISOString())
    .eq('student_discount_active', true);

  if (expiredErr) {
    console.error('Error fetching expired users:', expiredErr);
  }

  const downgraded: string[] = [];
  for (const user of expired ?? []) {
    await supabase
      .from('users')
      .update({ student_discount_active: false })
      .eq('id', user.id);
    await sendDiscountExpiredEmail(user.email);
    downgraded.push(user.id);
  }

  return new Response(
    JSON.stringify({
      ok: true,
      notified: notified.length,
      downgraded: downgraded.length,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
});
