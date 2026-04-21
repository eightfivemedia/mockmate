/**
 * AI cost tracking and session gating helpers.
 * Called from API routes after/before every AI call.
 */

const SUPABASE_FUNCTIONS_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1`;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Check whether a user is allowed to start a new session.
 * Call this at the top of generate-questions (session creation point)
 * before any work is done.
 */
export async function checkSessionAllowance(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  warning?: string | null;
  sessions_remaining?: number;
}> {
  try {
    const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/check-session-allowance`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });
    if (!res.ok) {
      console.warn('[session-gate] Non-2xx response from check-session-allowance, failing open:', res.status);
      return { allowed: true };
    }
    const data = await res.json();
    // Fail open if schema columns are missing on new Supabase instance
    if (!data.allowed && (data.reason === 'user_not_found' || data.reason === 'missing_user_id')) {
      console.warn('[session-gate] Failing open due to reason:', data.reason);
      return { allowed: true };
    }
    return data;
  } catch (err) {
    // Fail open — don't block users if the function is unreachable
    console.error('[session-gate] Error calling check-session-allowance:', err);
    return { allowed: true };
  }
}

/**
 * Track the cost of an AI API call.
 * Call this after every completion, passing token counts from the response.
 * Fire-and-forget — don't await in the hot path if latency matters.
 */
export async function trackApiCost(params: {
  userId: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
}): Promise<void> {
  try {
    await fetch(`${SUPABASE_FUNCTIONS_URL}/track-api-cost`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: params.userId,
        input_tokens: params.inputTokens,
        output_tokens: params.outputTokens,
        model: params.model,
      }),
    });
  } catch (err) {
    console.error('[api-cost] Error calling track-api-cost:', err);
  }
}
