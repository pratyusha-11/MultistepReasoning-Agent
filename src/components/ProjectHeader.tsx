import { ArrowLeft } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function ProjectHeader({ project, label, dark, onToggle }: { project: 'Scout' | 'Pilot'; label: string; dark: boolean; onToggle: () => void }) {
  const accent = project === 'Scout' ? (dark ? 'text-scout-400' : 'text-scout-600') : (dark ? 'text-pilot-400' : 'text-pilot-600');
  return (
    <header className={`border-b ${dark ? 'border-slate-700/60' : 'border-slate-200/80'}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <div className="flex items-center gap-4">
          <a href="/" className={`flex items-center gap-1.5 text-xs font-semibold ${dark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slateink'}`}>
            <ArrowLeft className="h-3.5 w-3.5" /> Projects
          </a>
          <span className={dark ? 'text-slate-600' : 'text-slate-300'}>/</span>
          <div>
            <div className={`text-sm font-bold tracking-tight ${dark ? 'text-white' : 'text-slateink'}`}>{project}</div>
            <div className={`text-[10px] uppercase tracking-[0.14em] ${accent}`}>{label}</div>
          </div>
        </div>
        <ThemeToggle dark={dark} onToggle={onToggle} />
      </div>
    </header>
  );
}
