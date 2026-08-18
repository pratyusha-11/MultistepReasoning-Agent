import { supabase } from '@/lib/supabase';

export async function saveAgentRun(agent: 'scout' | 'pilot', title: string, input: Record<string, unknown>, output: Record<string, unknown>) {
  const { data: run, error } = await supabase
    .from('agent_runs')
    .insert({ agent, title, input, summary: String(output.summary ?? ''), confidence: Number(output.confidence ?? 0), status: 'completed' })
    .select('id')
    .maybeSingle();

  if (error || !run) return;
  const steps = Array.isArray(output.steps) ? output.steps : [];
  if (steps.length === 0) return;
  await supabase.from('agent_steps').insert(steps.map((step, index) => {
    const item = step as { name?: string; purpose?: string; result?: string; confidence?: number };
    return {
      run_id: run.id,
      step_index: index,
      name: item.name ?? `Step ${index + 1}`,
      description: item.purpose ?? '',
      output: { result: item.result ?? '' },
      confidence: item.confidence ?? 0,
      duration_ms: null,
    };
  }));
}
