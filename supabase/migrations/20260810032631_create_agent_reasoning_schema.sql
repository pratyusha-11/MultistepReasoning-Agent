/*
# Create agent reasoning schema (single-tenant, no auth)

1. Purpose
   Stores the multi-step reasoning traces produced by the two demo agents
   (ClaimFlow and LeadPilot). Each "run" is one full agent invocation; each
   "step" is one reasoning sub-task the agent performed (extract, classify,
   assess, verify, decide, summarize, etc.).

2. New Tables
   - `agent_runs`
     - `id` (uuid, primary key)
     - `agent` (text, not null) — "claimflow" | "leadpilot"
     - `title` (text, not null) — human label for the run
     - `input` (jsonb, not null) — the raw input the agent was given
     - `summary` (text) — final agent summary
     - `confidence` (numeric) — overall confidence 0–1
     - `status` (text, default 'completed')
     - `created_at` (timestamptz, default now())
   - `agent_steps`
     - `id` (uuid, primary key)
     - `run_id` (uuid, FK → agent_runs, cascade delete)
     - `step_index` (int, not null)
     - `name` (text, not null) — e.g. "Extract", "Classify"
     - `description` (text, not null) — what the agent did
     - `output` (jsonb, not null) — structured result of the step
     - `confidence` (numeric, not null) — 0–1 confidence for this step
     - `duration_ms` (int) — simulated processing time
     - `created_at` (timestamptz, default now())

3. Security
   - RLS enabled on both tables.
   - Single-tenant demo: anon + authenticated can read and write all rows
     (USING (true) / WITH CHECK (true)). The data is intentionally shared
     across demo visitors.
*/

CREATE TABLE IF NOT EXISTS agent_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent text NOT NULL,
  title text NOT NULL,
  input jsonb NOT NULL,
  summary text,
  confidence numeric(4,3),
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,
  step_index int NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  output jsonb NOT NULL,
  confidence numeric(4,3) NOT NULL,
  duration_ms int,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_steps_run_id ON agent_steps(run_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_agent ON agent_runs(agent);
CREATE INDEX IF NOT EXISTS idx_agent_runs_created_at ON agent_runs(created_at DESC);

ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_steps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_runs" ON agent_runs;
CREATE POLICY "anon_select_runs" ON agent_runs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_runs" ON agent_runs;
CREATE POLICY "anon_insert_runs" ON agent_runs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_runs" ON agent_runs;
CREATE POLICY "anon_update_runs" ON agent_runs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_runs" ON agent_runs;
CREATE POLICY "anon_delete_runs" ON agent_runs FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_steps" ON agent_steps;
CREATE POLICY "anon_select_steps" ON agent_steps FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_steps" ON agent_steps;
CREATE POLICY "anon_insert_steps" ON agent_steps FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_steps" ON agent_steps;
CREATE POLICY "anon_update_steps" ON agent_steps FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_steps" ON agent_steps;
CREATE POLICY "anon_delete_steps" ON agent_steps FOR DELETE
  TO anon, authenticated USING (true);