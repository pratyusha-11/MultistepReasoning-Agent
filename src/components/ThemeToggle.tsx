import { Moon, Sun } from 'lucide-react';

export function ThemeToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        dark
          ? 'border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
      }`}
      aria-label="Toggle theme"
    >
      {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      {dark ? 'Light' : 'Dark'}
    </button>
  );
}
