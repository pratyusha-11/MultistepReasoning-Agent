import { ArrowRight, Compass, GitBranch } from 'lucide-react';

export function HomePage() {
  return (
    <main className="shell">
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
        <a href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slateink text-sm text-white">A</span>
          Pathwise
        </a>
        <span className="eyebrow text-slate-400">Multi-step reasoning</span>
      </nav>

      <section className="mx-auto max-w-5xl px-5 pb-10 pt-16 lg:pt-24">
        <h1 className="max-w-xl text-4xl font-bold leading-[1.1] tracking-tight text-slateink sm:text-5xl">
          Two agents. Two jobs.
        </h1>
        <p className="mt-4 max-w-lg text-base leading-7 text-slate-500">
          Pick a project to begin. Each one is fully independent.
        </p>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <ProjectCard
            href="/scout"
            icon={<Compass className="h-5 w-5" />}
            name="Scout"
            label="Research planning"
            description="Turn a broad objective into a structured research plan — sub-questions, evidence, methods, dependencies, and synthesis."
            color="scout"
          />
          <ProjectCard
            href="/pilot"
            icon={<GitBranch className="h-5 w-5" />}
            name="Pilot"
            label="Dynamic project planning"
            description="Turn a project goal into a schedule with owners, milestones, and risks — then replan when a constraint changes."
            color="pilot"
          />
        </div>
      </section>
    </main>
  );
}

function ProjectCard({
  href,
  icon,
  name,
  label,
  description,
  color,
}: {
  href: string;
  icon: React.ReactNode;
  name: string;
  label: string;
  description: string;
  color: 'scout' | 'pilot';
}) {
  const accentText = color === 'scout' ? 'text-scout-600' : 'text-pilot-600';
  const accentBg = color === 'scout' ? 'bg-scout-600' : 'bg-pilot-600';
  const hoverBorder = color === 'scout' ? 'hover:border-scout-400' : 'hover:border-pilot-400';
  const dot = color === 'scout' ? 'bg-scout-500' : 'bg-pilot-500';

  return (
    <a
      href={href}
      className={`surface group block p-6 transition duration-200 hover:-translate-y-0.5 hover:shadow-lift ${hoverBorder}`}
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${accentBg}`}>
          {icon}
        </div>
        <div>
          <p className={`eyebrow ${accentText}`}>{label}</p>
          <h2 className="text-2xl font-bold tracking-tight text-slateink">{name}</h2>
        </div>
      </div>
      <p className="mt-5 text-sm leading-6 text-slate-500">{description}</p>
      <div className={`mt-5 flex items-center gap-2 text-sm font-semibold ${accentText}`}>
        Open {name}
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </div>
    </a>
  );
}
