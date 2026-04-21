import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // Verify auth
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const email = user.email!;
  const name = user.user_metadata?.name || user.user_metadata?.full_name || 'there';
  const firstName = String(name).split(' ')[0];
  const appUrl = Deno.env.get('APP_URL') ?? 'https://mockmate.app';

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'MockMate <info@eightfivemedia.com>',
        to: email,
        subject: 'Welcome to MockMate — let\'s ace your next interview',
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #1A1A2E; background: #ffffff;">
  <div style="margin-bottom: 32px;">
    <div style="display: inline-flex; align-items: center; gap: 10px; background: linear-gradient(135deg, #5B6CF9, #8B5CF6); border-radius: 12px; padding: 10px 16px;">
      <span style="color: white; font-size: 18px; font-weight: 700;">MockMate</span>
    </div>
  </div>

  <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 12px;">Hey ${firstName}, welcome aboard! 🎉</h1>

  <p style="font-size: 16px; line-height: 1.6; color: #4A4A6A; margin: 0 0 24px;">
    You're all set to start practicing interviews with MockMate. Whether you're targeting a FAANG role, a startup, or anything in between — we'll help you get ready.
  </p>

  <div style="background: #F5F5F7; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <p style="font-size: 14px; font-weight: 600; color: #1A1A2E; margin: 0 0 16px;">Here's how to get started:</p>
    <ol style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #4A4A6A;">
      <li>Head to your <a href="${appUrl}/dashboard" style="color: #5B6CF9; text-decoration: none;">dashboard</a></li>
      <li>Click <strong>Start Interview</strong> and pick your role</li>
      <li>Upload your resume for a tailored session</li>
      <li>Get real-time feedback on every answer</li>
    </ol>
  </div>

  <a href="${appUrl}/dashboard/interview"
     style="display: inline-block; background: linear-gradient(135deg, #5B6CF9, #8B5CF6); color: white; text-decoration: none; font-weight: 600; font-size: 15px; padding: 12px 28px; border-radius: 10px; margin-bottom: 32px;">
    Start your first interview →
  </a>

  <p style="font-size: 13px; color: #8B8BAE; margin: 0;">
    Questions? Reply to this email or reach us at <a href="mailto:support@mockmate.io" style="color: #5B6CF9; text-decoration: none;">support@mockmate.io</a>
  </p>
</body>
</html>`,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', err);
      return new Response(JSON.stringify({ error: 'Failed to send email' }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
});
