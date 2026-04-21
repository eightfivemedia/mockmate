import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const APP_URL = Deno.env.get('APP_URL') ?? 'https://mockmate.app';
const upgradeUrl = `${APP_URL}/dashboard/settings`;

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { user_id, email, plan, session_limit } = await req.json();

  if (!user_id || !email) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const isPaid = plan === 'pro' || plan === 'student';

  const subject = isPaid
    ? `You've used all your MockMate sessions this month`
    : `You've used all 5 free MockMate sessions`;

  const html = isPaid ? `
<head><meta charset="UTF-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#F5F5F7;margin:0;padding:40px 20px;">
  <div style="max-width:480px;margin:0 auto;background:white;border-radius:16px;border:1px solid #EEECF8;padding:40px;box-shadow:0 2px 12px rgba(99,82,199,0.06);">
    <div style="width:48px;height:48px;background:linear-gradient(135deg,#5B6CF9,#8B5CF6);border-radius:12px;margin:0 auto 24px;text-align:center;line-height:48px;font-size:22px;">🎯</div>
    <h1 style="font-size:20px;font-weight:700;color:#1A1A2E;text-align:center;margin:0 0 12px;">You've used all your sessions</h1>
    <p style="font-size:14px;color:#1A1A2E99;text-align:center;margin:0 0 28px;line-height:1.6;">
      You've used all ${session_limit} sessions this month.<br>Your sessions reset at the start of your next billing cycle.
    </p>
    <p style="font-size:13px;color:#1A1A2E60;text-align:center;margin:0;">
      Questions? <a href="mailto:support@mockmate.io" style="color:#8B5CF6;text-decoration:none;">Contact support</a>
    </p>
  </div>
</body>` : `
<head><meta charset="UTF-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#F5F5F7;margin:0;padding:40px 20px;">
  <div style="max-width:480px;margin:0 auto;background:white;border-radius:16px;border:1px solid #EEECF8;padding:40px;box-shadow:0 2px 12px rgba(99,82,199,0.06);">
    <div style="width:48px;height:48px;background:linear-gradient(135deg,#5B6CF9,#8B5CF6);border-radius:12px;margin:0 auto 24px;text-align:center;line-height:48px;font-size:22px;">🎯</div>
    <h1 style="font-size:20px;font-weight:700;color:#1A1A2E;text-align:center;margin:0 0 12px;">You've used all 5 free sessions</h1>
    <p style="font-size:14px;color:#1A1A2E99;text-align:center;margin:0 0 32px;line-height:1.6;">
      Upgrade to keep practicing — your next interview could be the one that matters.
    </p>
    <div style="border:1.5px solid #5B6CF9;border-radius:12px;padding:20px;margin-bottom:12px;">
      <p style="font-size:13px;font-weight:700;color:#1A1A2E;margin:0 0 4px;">Job Seeker — $19/mo</p>
      <p style="font-size:12px;color:#1A1A2E60;margin:0 0 16px;">500 sessions/month · All question types · Priority AI feedback</p>
      <a href="${upgradeUrl}" style="display:block;background:linear-gradient(135deg,#5B6CF9,#8B5CF6);color:white;text-align:center;padding:10px;border-radius:10px;font-size:13px;font-weight:600;text-decoration:none;">Upgrade to Job Seeker</a>
    </div>
    <div style="border:1.5px solid #EEECF8;border-radius:12px;padding:20px;margin-bottom:28px;">
      <p style="font-size:13px;font-weight:700;color:#1A1A2E;margin:0 0 4px;">Student — $11/mo <span style="font-size:11px;color:#8B5CF6;font-weight:500;">(.edu required)</span></p>
      <p style="font-size:12px;color:#1A1A2E60;margin:0 0 16px;">20 sessions/month · All question types · AI feedback</p>
      <a href="${upgradeUrl}" style="display:block;border:1.5px solid #EEECF8;color:#8B5CF6;text-align:center;padding:10px;border-radius:10px;font-size:13px;font-weight:600;text-decoration:none;">Upgrade to Student</a>
    </div>
    <p style="font-size:13px;color:#1A1A2E60;text-align:center;margin:0;">
      Questions? <a href="mailto:support@mockmate.io" style="color:#8B5CF6;text-decoration:none;">Contact support</a>
    </p>
  </div>
</body>`;

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'MockMate <info@eightfivemedia.com>',
      to: email,
      subject,
      html,
    }),
  });

  if (!resendRes.ok) {
    console.error('Resend error:', await resendRes.text());
    return new Response(JSON.stringify({ error: 'Failed to send email' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  // Mark as sent so we don't spam on subsequent blocked requests
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
  await supabase.from('users').update({ limit_warning_sent: true }).eq('id', user_id);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
});
