import { useState } from 'react';
import { AlertTriangle, ArrowRight, CalendarDays, CheckCircle2, Download, GitBranch, RotateCcw, ShieldAlert, ShieldCheck, Users } from 'lucide-react';
import { ProjectHeader } from '@/components/ProjectHeader';
import { PlanSteps, ConfidencePill } from '@/components/PlanSteps';
import { saveAgentRun } from '@/lib/saveAgentRun';
import { exportPilotPlan } from '@/lib/exportPlan';
import { buildPilotPlan, pilotSamples, type PilotInput, type PilotPlan } from '@/agents/pilot';

const emptyInput: PilotInput = { objective: '', deadline: '', team: '', constraints: '', change: '' };

export function PilotPage() {
  const [dark, setDark] = useState(true);
  const [input, setInput] = useState<PilotInput>(emptyInput);
  const [plan, setPlan] = useState<PilotPlan | null>(null);
  const [loaded, setLoaded] = useState<string | null>(null);
  const [replanned, setReplanned] = useState(false);

  function loadSample(id: string) {
    const sample = pilotSamples.find((item) => item.id === id);
    if (!sample) return;
    setInput(sample.data);
    setLoaded(id);
    setPlan(null);
    setReplanned(false);
  }

  async function run(replan = false) {
    if (!input.objective.trim()) return;
    const result = buildPilotPlan(input, replan);
    setPlan(result);
    setReplanned(replan);
    await saveAgentRun('pilot', result.title, input as unknown as Record<string, unknown>, result as unknown as Record<string, unknown>);
  }

  const update = (key: keyof PilotInput, value: string) => setInput((current) => ({ ...current, [key]: value }));
  const muted = dark ? 'text-slate-300' : 'text-slate-500';
  const mutedLight = dark ? 'text-slate-400' : 'text-slate-400';
  const heading = dark ? 'text-white' : 'text-slateink';
  const cardBorder = dark ? 'border-slate-700/60 bg-slate-800/40' : 'border-slate-200 bg-white shadow-soft';
  const innerCard = dark ? 'border-slate-700/50 bg-slate-800/30' : 'border-slate-200 bg-slate-50/60';

  return (
    <main className={dark ? 'dark-shell' : 'shell'}>
      <ProjectHeader project="Pilot" label="Dynamic project planning agent" dark={dark} onToggle={() => setDark((value) => !value)} />
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
        <div className="mb-8">
          <div className="eyebrow text-pilot-500">Plan, then adapt</div>
          <h1 className={`mt-2 text-2xl font-bold tracking-tight ${heading}`}>Turn a goal into a schedule that survives change.</h1>
          <p className={`mt-2 max-w-2xl text-sm leading-6 ${muted}`}>Pilot maps owners, dependencies, milestones, and risks. Apply a realistic disruption to see exactly what moves and why.</p>
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[340px_1fr]">
          {/* Input panel */}
          <aside className={`rounded-2xl border p-5 xl:sticky xl:top-5 ${cardBorder}`}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className={`font-bold ${heading}`}>Project brief</h2>
              <CalendarDays className="h-5 w-5 text-pilot-500" />
            </div>

            <label className={`field-label ${dark ? 'text-slate-400' : ''}`}>Load sample</label>
            <select
              value={loaded ?? ''}
              onChange={(e) => loadSample(e.target.value)}
              className={`mb-5 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-pilot-500 ${dark ? 'border-slate-700 bg-slate-800/50 text-slate-200' : 'border-slate-200 bg-slate-50 text-slateink'}`}
            >
              <option value="">Choose a scenario...</option>
              {pilotSamples.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>

            <div className="space-y-4">
              <Field label="Project objective" value={input.objective} onChange={(v) => update('objective', v)} placeholder="What must be delivered?" multiline dark={dark} />
              <Field label="Deadline" value={input.deadline} onChange={(v) => update('deadline', v)} placeholder="e.g. 6 weeks" dark={dark} />
              <Field label="Team" value={input.team} onChange={(v) => update('team', v)} placeholder="Who is available?" dark={dark} />
              <Field label="Constraints" value={input.constraints} onChange={(v) => update('constraints', v)} placeholder="Budget, tools, fixed dates..." multiline dark={dark} />
              <Field label="Change to test" value={input.change} onChange={(v) => update('change', v)} placeholder="What just changed?" multiline dark={dark} />
            </div>

            <button onClick={() => run(false)} disabled={!input.objective.trim()} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-pilot-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-pilot-700 disabled:cursor-not-allowed disabled:opacity-40">
              Build project plan <ArrowRight className="h-4 w-4" />
            </button>
            {plan && (
              <button onClick={() => run(true)} disabled={!input.change.trim()} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-pilot-500/40 bg-pilot-500/10 px-4 py-3 text-sm font-bold text-pilot-600 transition hover:bg-pilot-500/20 disabled:cursor-not-allowed disabled:opacity-40">
                <GitBranch className="h-4 w-4" /> Apply change and replan
              </button>
            )}
            <button onClick={() => { setInput(emptyInput); setPlan(null); setLoaded(null); setReplanned(false); }} className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold ${dark ? 'text-slate-400 hover:bg-slate-800/50' : 'text-slate-500 hover:bg-slate-50'}`}>
              <RotateCcw className="h-3.5 w-3.5" /> Clear
            </button>
          </aside>

          {/* Output */}
          <section className="min-w-0">
            {!plan ? (
              <EmptyState dark={dark} />
            ) : (
              <div className="animate-reveal space-y-5">
                {/* Summary header */}
                <div className={`rounded-2xl border p-6 ${replanned ? (dark ? 'border-amberline-400/40 bg-amberline-400/10' : 'border-amberline-300 bg-amberline-100/60') : (dark ? 'border-pilot-500/30 bg-pilot-500/10' : 'border-pilot-200 bg-pilot-50')}`}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className={`eyebrow ${replanned ? 'text-amberline-400' : 'text-pilot-500'}`}>{replanned ? 'Plan updated after disruption' : 'Project plan ready'}</div>
                      <h2 className={`mt-2 max-w-3xl text-xl font-bold leading-tight ${heading}`}>{plan.title}</h2>
                      <p className={`mt-3 max-w-3xl text-sm leading-6 ${muted}`}>{plan.summary}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <ConfidencePill value={plan.confidence} dark={dark} />
                      <button
                        onClick={() => exportPilotPlan(plan)}
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${dark ? 'border-pilot-500/40 text-pilot-300 hover:bg-pilot-500/10' : 'border-pilot-300 text-pilot-700 hover:bg-pilot-100'}`}
                      >
                        <Download className="h-3.5 w-3.5" /> Export plan
                      </button>
                    </div>
                  </div>
                </div>

                {/* What changed banner */}
                {replanned && (
                  <div className={`flex items-start gap-3 rounded-2xl border p-4 ${dark ? 'border-amberline-400/30 bg-amberline-400/10' : 'border-amberline-300 bg-amberline-100/50'}`}>
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amberline-500" />
                    <div>
                      <p className={`text-sm font-bold ${heading}`}>What changed</p>
                      <p className={`mt-1 text-sm leading-6 ${muted}`}>{input.change}</p>
                    </div>
                  </div>
                )}

                {/* Reasoning steps */}
                <PlanSteps steps={plan.steps} dark={dark} accent="pilot" />

                {/* Milestones */}
                <Panel title="Milestones" icon={<CalendarDays className="h-4 w-4" />} dark={dark} cardBorder={cardBorder} heading={heading}>
                  <div className="grid gap-3 md:grid-cols-3">
                    {plan.milestones.map((item) => (
                      <div key={item.label} className={`rounded-xl border p-4 ${innerCard}`}>
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm font-bold ${heading}`}>{item.label}</p>
                          <Status status={item.status} />
                        </div>
                        <p className="mt-2 text-xs font-bold text-pilot-500">{item.date}</p>
                        <p className={`mt-2 text-xs leading-5 ${muted}`}>{item.detail}</p>
                      </div>
                    ))}
                  </div>
                </Panel>

                {/* Work plan table */}
                <Panel title="Work plan" icon={<Users className="h-4 w-4" />} dark={dark} cardBorder={cardBorder} heading={heading}>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px] text-left text-sm">
                      <thead>
                        <tr className={`border-b text-[10px] uppercase tracking-[0.12em] ${dark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-400'}`}>
                          <th className="pb-3 pr-4">Task</th>
                          <th className="pb-3 pr-4">Owner</th>
                          <th className="pb-3 pr-4">When</th>
                          <th className="pb-3 pr-4">Depends on</th>
                          <th className="pb-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plan.tasks.map((task) => (
                          <tr key={task.id} className={`border-b last:border-0 ${dark ? 'border-slate-700/50' : 'border-slate-100'}`}>
                            <td className={`py-3 pr-4 font-semibold ${heading}`}>{task.task}</td>
                            <td className={`py-3 pr-4 ${muted}`}>{task.owner}</td>
                            <td className={`py-3 pr-4 ${muted}`}>{task.timing}</td>
                            <td className={`py-3 pr-4 ${muted}`}>{task.dependsOn}</td>
                            <td className="py-3"><Status status={task.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Panel>

                {/* Impact + Risks */}
                <div className="grid gap-5 lg:grid-cols-2">
                  <Panel title={replanned ? 'Impact of the change' : 'Plan health'} icon={<GitBranch className="h-4 w-4" />} dark={dark} cardBorder={cardBorder} heading={heading}>
                    <div className="space-y-3">
                      {plan.impact.map((item, i) => (
                        <div key={i} className={`rounded-xl border-l-2 p-3 ${item.severity === 'high' ? 'border-danger-500' : item.severity === 'medium' ? 'border-amberline-400' : 'border-pilot-500'} ${dark ? 'bg-slate-800/30' : 'bg-slate-50'}`}>
                          <div className="flex items-center justify-between gap-3">
                            <p className={`text-sm font-bold ${heading}`}>{item.area}</p>
                            <span className={`text-[10px] font-bold uppercase ${item.severity === 'high' ? 'text-danger-400' : item.severity === 'medium' ? 'text-amberline-500' : 'text-pilot-500'}`}>{item.severity}</span>
                          </div>
                          <p className={`mt-1 text-xs leading-5 ${muted}`}>{item.detail}</p>
                        </div>
                      ))}
                    </div>
                  </Panel>

                  <Panel title="Risks and mitigations" icon={<ShieldAlert className="h-4 w-4" />} dark={dark} cardBorder={cardBorder} heading={heading}>
                    <div className="space-y-3">
                      {plan.risks.map((item, i) => (
                        <div key={i} className={`rounded-xl p-3 ${dark ? 'bg-slate-800/30' : 'bg-slate-50'}`}>
                          <p className={`flex items-start gap-2 text-sm font-bold ${heading}`}><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amberline-500" />{item.risk}</p>
                          <p className={`mt-1 pl-5 text-xs leading-5 ${muted}`}><span className="font-semibold">Mitigation:</span> {item.mitigation}</p>
                          <p className={`mt-1 pl-5 text-[11px] ${mutedLight}`}>Owner: {item.owner}</p>
                        </div>
                      ))}
                    </div>
                  </Panel>
                </div>

                {/* Approval gates */}
                <Panel title="Human approval checkpoints" icon={<ShieldCheck className="h-4 w-4" />} dark={dark} cardBorder={cardBorder} heading={heading}>
                  <div className="grid gap-3 md:grid-cols-2">
                    {plan.approval.map((item, i) => (
                      <div key={i} className={`rounded-xl border-l-2 border-pilot-500 p-4 ${innerCard}`}>
                        <p className="text-xs font-bold uppercase tracking-wide text-pilot-500">{item.checkpoint}</p>
                        <p className={`mt-2 text-sm font-semibold ${heading}`}>{item.question}</p>
                        <p className={`mt-1 text-xs ${mutedLight}`}>Approver: {item.approver}</p>
                      </div>
                    ))}
                  </div>
                </Panel>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, placeholder, multiline, dark }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; multiline?: boolean; dark: boolean }) {
  const classes = `w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-pilot-500 ${dark ? 'border-slate-700 bg-slate-800/50 text-slate-200 placeholder:text-slate-600' : 'border-slate-200 bg-slate-50 text-slateink placeholder:text-slate-400'}`;
  return (
    <label className="block">
      <span className={`field-label ${dark ? 'text-slate-400' : ''}`}>{label}</span>
      {multiline ? <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={classes} /> : <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={classes} />}
    </label>
  );
}

function Panel({ title, icon, children, dark, cardBorder, heading }: { title: string; icon: React.ReactNode; children: React.ReactNode; dark: boolean; cardBorder: string; heading: string }) {
  return (
    <div className={`rounded-2xl border p-5 ${cardBorder}`}>
      <div className={`flex items-center gap-2 text-sm font-bold ${heading}`}>{icon}{title}</div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Status({ status }: { status: string }) {
  const moved = status === 'moved' || status === 'new';
  const risk = status === 'at risk';
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-bold ${risk ? 'bg-danger-500/15 text-danger-400' : moved ? 'bg-amberline-400/15 text-amberline-500' : 'bg-pilot-500/15 text-pilot-500'}`}>
      {status}
    </span>
  );
}

function EmptyState({ dark }: { dark: boolean }) {
  return (
    <div className={`flex min-h-[500px] flex-col items-center justify-center rounded-2xl border border-dashed px-6 text-center ${dark ? 'border-slate-700' : 'border-slate-300'}`}>
      <CheckCircle2 className="h-10 w-10 text-pilot-500" />
      <h2 className={`mt-5 text-xl font-bold ${dark ? 'text-white' : 'text-slateink'}`}>Your project plan will appear here.</h2>
      <p className={`mt-2 max-w-md text-sm leading-6 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Load a project sample, build the baseline plan, then apply the change to watch Pilot replan the affected work.</p>
    </div>
  );
}
