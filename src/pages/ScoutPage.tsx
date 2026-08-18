import { useState } from 'react';
import { ArrowRight, BookOpen, ClipboardList, Download, ListChecks, RotateCcw, Sparkles, Wrench, ShieldCheck } from 'lucide-react';
import { ProjectHeader } from '@/components/ProjectHeader';
import { PlanSteps, ConfidencePill } from '@/components/PlanSteps';
import { saveAgentRun } from '@/lib/saveAgentRun';
import { exportScoutPlan } from '@/lib/exportPlan';
import { buildScoutPlan, scoutSamples, type ScoutInput, type ScoutPlan } from '@/agents/scout';

const emptyInput: ScoutInput = { objective: '', audience: '', geography: '', deadline: '', sourcePreference: '' };

export function ScoutPage() {
  const [dark, setDark] = useState(false);
  const [input, setInput] = useState<ScoutInput>(emptyInput);
  const [plan, setPlan] = useState<ScoutPlan | null>(null);
  const [loaded, setLoaded] = useState<string | null>(null);

  function loadSample(id: string) {
    const sample = scoutSamples.find((item) => item.id === id);
    if (!sample) return;
    setInput(sample.data);
    setLoaded(id);
    setPlan(null);
  }

  async function run() {
    if (!input.objective.trim()) return;
    const result = buildScoutPlan(input);
    setPlan(result);
    await saveAgentRun('scout', result.title, input as unknown as Record<string, unknown>, result as unknown as Record<string, unknown>);
  }

  const update = (key: keyof ScoutInput, value: string) => setInput((current) => ({ ...current, [key]: value }));
  const muted = dark ? 'text-slate-300' : 'text-slate-500';
  const mutedLight = dark ? 'text-slate-400' : 'text-slate-400';
  const heading = dark ? 'text-white' : 'text-slateink';
  const cardBorder = dark ? 'border-slate-700/60 bg-slate-800/40' : 'border-slate-200 bg-white shadow-soft';
  const innerCard = dark ? 'border-slate-700/50 bg-slate-800/30' : 'border-slate-200 bg-slate-50/60';

  return (
    <main className={dark ? 'dark-shell' : 'shell'}>
      <ProjectHeader project="Scout" label="Research planning agent" dark={dark} onToggle={() => setDark((value) => !value)} />
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
        <div className="mb-8">
          <div className="eyebrow text-scout-500">Plan before you search</div>
          <h1 className={`mt-2 text-2xl font-bold tracking-tight ${heading}`}>Turn a broad objective into a research brief.</h1>
          <p className={`mt-2 max-w-2xl text-sm leading-6 ${muted}`}>Scout identifies the questions to answer, evidence to collect, actions to take, dependencies, and the structure of the final recommendation.</p>
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[340px_1fr]">
          {/* Input panel */}
          <aside className={`rounded-2xl border p-5 xl:sticky xl:top-5 ${cardBorder}`}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className={`font-bold ${heading}`}>Research brief</h2>
              <ClipboardList className="h-5 w-5 text-scout-500" />
            </div>

            <label className="field-label">Load sample</label>
            <select
              value={loaded ?? ''}
              onChange={(e) => loadSample(e.target.value)}
              className={`mb-5 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-scout-500 ${dark ? 'border-slate-700 bg-slate-800/50 text-slate-200' : 'border-slate-200 bg-slate-50 text-slateink'}`}
            >
              <option value="">Choose a scenario...</option>
              {scoutSamples.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>

            <div className="space-y-4">
              <Field label="Research objective" value={input.objective} onChange={(v) => update('objective', v)} placeholder="What decision do you need to make?" multiline dark={dark} />
              <Field label="Decision makers" value={input.audience} onChange={(v) => update('audience', v)} placeholder="Who will use the answer?" dark={dark} />
              <Field label="Context / geography" value={input.geography} onChange={(v) => update('geography', v)} placeholder="Where does this apply?" dark={dark} />
              <Field label="Time available" value={input.deadline} onChange={(v) => update('deadline', v)} placeholder="e.g. 2 weeks" dark={dark} />
              <Field label="Preferred evidence" value={input.sourcePreference} onChange={(v) => update('sourcePreference', v)} placeholder="What sources are useful?" dark={dark} />
            </div>

            <button onClick={run} disabled={!input.objective.trim()} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-scout-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-scout-700 disabled:cursor-not-allowed disabled:opacity-40">
              Build research plan <ArrowRight className="h-4 w-4" />
            </button>
            <button onClick={() => { setInput(emptyInput); setPlan(null); setLoaded(null); }} className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold ${dark ? 'text-slate-400 hover:bg-slate-800/50' : 'text-slate-500 hover:bg-slate-50'}`}>
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
                <div className={`rounded-2xl border p-6 ${dark ? 'border-scout-500/30 bg-scout-500/10' : 'border-scout-200 bg-scout-50'}`}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="eyebrow text-scout-500">Research plan ready</div>
                      <h2 className={`mt-2 max-w-3xl text-xl font-bold leading-tight ${heading}`}>{plan.title}</h2>
                      <p className={`mt-3 max-w-3xl text-sm leading-6 ${muted}`}>{plan.framing}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <ConfidencePill value={plan.confidence} dark={dark} />
                      <button
                        onClick={() => exportScoutPlan(plan)}
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${dark ? 'border-scout-500/40 text-scout-300 hover:bg-scout-500/10' : 'border-scout-300 text-scout-700 hover:bg-scout-100'}`}
                      >
                        <Download className="h-3.5 w-3.5" /> Export plan
                      </button>
                    </div>
                  </div>
                </div>

                {/* Reasoning steps */}
                <PlanSteps steps={plan.steps} dark={dark} accent="scout" />

                {/* Decision questions */}
                <Panel title="Decision questions" icon={<ListChecks className="h-4 w-4" />} dark={dark} cardBorder={cardBorder} heading={heading}>
                  <div className="space-y-3">
                    {plan.questions.map((item, index) => (
                      <div key={index} className={`rounded-xl border p-4 ${innerCard}`}>
                        <div className="flex gap-3">
                          <span className="font-mono text-xs font-bold text-scout-500">Q{index + 1}</span>
                          <div className="min-w-0">
                            <h3 className={`text-sm font-bold ${heading}`}>{item.question}</h3>
                            <p className={`mt-1.5 text-xs leading-5 ${muted}`}><span className="font-semibold">Why:</span> {item.why}</p>
                            <p className={`mt-1 text-xs leading-5 ${muted}`}><span className="font-semibold">Method:</span> {item.method}</p>
                            <p className={`mt-1 text-xs leading-5 ${mutedLight}`}><span className="font-semibold">Info needed:</span> {item.infoNeeded}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>

                {/* Actions selected */}
                <Panel title="Actions selected" icon={<Wrench className="h-4 w-4" />} dark={dark} cardBorder={cardBorder} heading={heading}>
                  <div className="grid gap-3 md:grid-cols-2">
                    {plan.actions.map((item, index) => (
                      <div key={index} className={`rounded-xl border p-4 ${innerCard}`}>
                        <div className="flex items-start gap-2">
                          <span className="font-mono text-xs font-bold text-scout-500">A{index + 1}</span>
                          <div>
                            <p className={`text-sm font-bold ${heading}`}>{item.action}</p>
                            <p className={`mt-1 text-xs font-semibold text-scout-500`}>{item.tool}</p>
                            <p className={`mt-1 text-xs leading-5 ${muted}`}>{item.reason}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>

                {/* Info requirements + Dependencies */}
                <div className="grid gap-5 lg:grid-cols-2">
                  <Panel title="Information to collect" icon={<ClipboardList className="h-4 w-4" />} dark={dark} cardBorder={cardBorder} heading={heading}>
                    <ul className="space-y-2.5">
                      {plan.informationRequirements.map((item, i) => (
                        <li key={i} className={`flex gap-2.5 text-sm leading-6 ${muted}`}>
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-scout-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Panel>

                  <Panel title="Dependency order" icon={<span className="text-scout-500 font-mono text-sm">→</span>} dark={dark} cardBorder={cardBorder} heading={heading}>
                    <div className="space-y-3">
                      {plan.dependencies.map((item, i) => (
                        <div key={i} className={`rounded-xl border p-3 ${innerCard}`}>
                          <p className={`text-sm font-bold ${heading}`}>{item.from} <span className="px-1 text-scout-500">→</span> {item.to}</p>
                          <p className={`mt-1 text-xs leading-5 ${muted}`}>{item.reason}</p>
                        </div>
                      ))}
                    </div>
                  </Panel>
                </div>

                {/* Synthesis structure */}
                <Panel title="Final synthesis structure" icon={<Sparkles className="h-4 w-4" />} dark={dark} cardBorder={cardBorder} heading={heading}>
                  <div className="grid gap-3 md:grid-cols-2">
                    {plan.synthesis.map((item, i) => (
                      <div key={i} className={`rounded-xl border p-4 ${innerCard}`}>
                        <p className={`text-sm font-bold ${heading}`}>{item.section}</p>
                        <p className={`mt-1.5 text-xs leading-5 ${muted}`}>{item.contents}</p>
                      </div>
                    ))}
                  </div>
                </Panel>

                {/* Approval gates */}
                <Panel title="Human approval checkpoints" icon={<ShieldCheck className="h-4 w-4" />} dark={dark} cardBorder={cardBorder} heading={heading}>
                  <div className="grid gap-3 md:grid-cols-2">
                    {plan.approval.map((item, i) => (
                      <div key={i} className={`rounded-xl border-l-2 border-scout-500 p-4 ${innerCard}`}>
                        <p className="text-xs font-bold uppercase tracking-wide text-scout-500">{item.checkpoint}</p>
                        <p className={`mt-2 text-sm font-semibold ${heading}`}>{item.question}</p>
                        <p className={`mt-1 text-xs ${mutedLight}`}>Approver: {item.approver}</p>
                      </div>
                    ))}
                  </div>
                </Panel>

                {/* Guardrails */}
                <Panel title="Research guardrails" icon={<ShieldCheck className="h-4 w-4" />} dark={dark} cardBorder={cardBorder} heading={heading}>
                  <div className="grid gap-3 md:grid-cols-2">
                    {plan.guardrails.map((item, i) => (
                      <p key={i} className={`rounded-xl px-4 py-3 text-xs leading-5 ${dark ? 'bg-slate-800/40 text-slate-300' : 'bg-slate-50 text-slate-600'}`}>
                        {item}
                      </p>
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
  const classes = `w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-scout-500 ${dark ? 'border-slate-700 bg-slate-800/50 text-slate-200 placeholder:text-slate-600' : 'border-slate-200 bg-slate-50 text-slateink placeholder:text-slate-400'}`;
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

function EmptyState({ dark }: { dark: boolean }) {
  return (
    <div className={`flex min-h-[500px] flex-col items-center justify-center rounded-2xl border border-dashed px-6 text-center ${dark ? 'border-slate-700' : 'border-slate-300'}`}>
      <BookOpen className="h-10 w-10 text-scout-500" />
      <h2 className={`mt-5 text-xl font-bold ${dark ? 'text-white' : 'text-slateink'}`}>Your research plan will appear here.</h2>
      <p className={`mt-2 max-w-md text-sm leading-6 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Load a sample to see a specific, decision-ready plan. Every section is derived from the scenario you provide.</p>
    </div>
  );
}
