import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Cost per 1M tokens — update when switching models
const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  'gpt-4o-mini':   { input: 0.15,  output: 0.60  },
  'gpt-4o':        { input: 2.50,  output: 10.00 },
  'gpt-4-turbo':   { input: 10.00, output: 30.00 },
  'gpt-4':         { input: 30.00, output: 60.00 },
  'gpt-3.5-turbo': { input: 0.50,  output: 1.50  },
  'claude-haiku':  { input: 0.25,  output: 1.25  },
  'claude-sonnet': { input: 3.00,  output: 15.00 },
  'claude-opus':   { input: 15.00, output: 75.00 },
};

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { user_id, input_tokens, output_tokens, model } = await req.json();
  if (!user_id || input_tokens == null || output_tokens == null || !model) {
    return new Response(JSON.stringify({ error: 'missing_fields' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const costs = MODEL_COSTS[model] ?? MODEL_COSTS['gpt-4o-mini'];
  const callCost = (input_tokens / 1_000_000 * costs.input) + (output_tokens / 1_000_000 * costs.output);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { error } = await supabase.rpc('increment_api_cost', {
    user_id_input: user_id,
    cost_to_add: callCost,
  });

  if (error) {
    console.error('increment_api_cost error:', error);
    return new Response(JSON.stringify({ error: 'db_error' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({ tracked: true, cost: callCost, model }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
});
