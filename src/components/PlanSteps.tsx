import { Check } from 'lucide-react';

export function PlanSteps({ steps, dark, accent }: { steps: { name: string; purpose: string; result: string; confidence: number }[]; dark: boolean; accent: 'scout' | 'pilot' }) {
  const accentText = accent === 'scout' ? (dark ? 'text-scout-400' : 'text-scout-600') : (dark ? 'text-pilot-400' : 'text-pilot-600');
  const heading = dark ? 'text-white' : 'text-slateink';
  const muted = dark ? 'text-slate-300' : 'text-slate-500';
  const resultText = dark ? 'text-slate-200' : 'text-slate-600';
  const border = dark ? 'border-slate-700/60 bg-slate-800/30' : 'border-slate-200 bg-slate-50/80';

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => (
        <div key={step.name} className={`rounded-xl border p-4 ${border}`}>
          <div className="mb-3 flex items-center justify-between">
            <span className={`text-[11px] font-bold ${accentText}`}>0{index + 1}</span>
            <Check className={`h-3.5 w-3.5 ${accentText}`} />
          </div>
          <h3 className={`mb-1 text-sm font-bold ${heading}`}>{step.name}</h3>
          <p className={`mb-3 text-xs leading-5 ${muted}`}>{step.purpose}</p>
          <p className={`border-t pt-3 text-xs leading-5 ${dark ? 'border-slate-700' : 'border-slate-200'} ${resultText}`}>{step.result}</p>
        </div>
      ))}
    </div>
  );
}

export function ConfidencePill({ value, dark }: { value: number; dark: boolean }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${dark ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-600'}`}>
      {Math.round(value * 100)}% confidence
    </span>
  );
}
