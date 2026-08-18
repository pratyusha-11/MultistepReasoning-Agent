import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type AgentName = 'claimflow' | 'leadpilot';

export interface AgentRun {
  id: string;
  agent: AgentName;
  title: string;
  input: Record<string, unknown>;
  summary: string | null;
  confidence: number | null;
  status: string;
  created_at: string;
}

export interface AgentStep {
  id: string;
  run_id: string;
  step_index: number;
  name: string;
  description: string;
  output: Record<string, unknown>;
  confidence: number;
  duration_ms: number | null;
  created_at: string;
}

export interface RunWithSteps {
  run: AgentRun;
  steps: AgentStep[];
}
