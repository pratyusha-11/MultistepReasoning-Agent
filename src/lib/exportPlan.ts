import type { ScoutPlan } from '@/agents/scout';
import type { PilotPlan } from '@/agents/pilot';

function download(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60) || 'plan';
}

export function exportScoutPlan(plan: ScoutPlan) {
  const lines: string[] = [];
  lines.push(`SCOUT — RESEARCH PLAN`, `=`.repeat(60), '');
  lines.push(plan.title, '');
  lines.push(plan.framing, '');
  lines.push(`Confidence: ${Math.round(plan.confidence * 100)}%`, '');

  lines.push('REASONING TRACE', '-'.repeat(30));
  plan.steps.forEach((s) => lines.push(`• ${s.name}: ${s.result}`));
  lines.push('');

  lines.push('DECISION QUESTIONS', '-'.repeat(30));
  plan.questions.forEach((q, i) => {
    lines.push(`Q${i + 1}. ${q.question}`);
    lines.push(`   Why: ${q.why}`);
    lines.push(`   Method: ${q.method}`);
    lines.push(`   Info needed: ${q.infoNeeded}`, '');
  });

  lines.push('ACTIONS SELECTED', '-'.repeat(30));
  plan.actions.forEach((a, i) => lines.push(`A${i + 1}. ${a.action} — ${a.tool} (${a.reason})`));
  lines.push('');

  lines.push('INFORMATION TO COLLECT', '-'.repeat(30));
  plan.informationRequirements.forEach((r) => lines.push(`• ${r}`));
  lines.push('');

  lines.push('DEPENDENCY ORDER', '-'.repeat(30));
  plan.dependencies.forEach((d) => lines.push(`${d.from} → ${d.to}: ${d.reason}`));
  lines.push('');

  lines.push('FINAL SYNTHESIS STRUCTURE', '-'.repeat(30));
  plan.synthesis.forEach((s) => lines.push(`${s.section}: ${s.contents}`));
  lines.push('');

  lines.push('APPROVAL CHECKPOINTS', '-'.repeat(30));
  plan.approval.forEach((a) => lines.push(`[${a.checkpoint}] ${a.question} (Approver: ${a.approver})`));
  lines.push('');

  lines.push('GUARDRAILS', '-'.repeat(30));
  plan.guardrails.forEach((g) => lines.push(`• ${g}`));

  download(`scout-${slug(plan.title)}.txt`, lines.join('\n'));
}

export function exportPilotPlan(plan: PilotPlan) {
  const lines: string[] = [];
  lines.push(`PILOT — ${plan.isReplanned ? 'REPLANNED PROJECT PLAN' : 'PROJECT PLAN'}`, '='.repeat(60), '');
  lines.push(plan.title, '');
  lines.push(plan.summary, '');
  lines.push(`Confidence: ${Math.round(plan.confidence * 100)}%`, '');

  lines.push('REASONING TRACE', '-'.repeat(30));
  plan.steps.forEach((s) => lines.push(`• ${s.name}: ${s.result}`));
  lines.push('');

  lines.push('MILESTONES', '-'.repeat(30));
  plan.milestones.forEach((m) => lines.push(`[${m.status.toUpperCase()}] ${m.label} — ${m.date}: ${m.detail}`));
  lines.push('');

  lines.push('TASKS', '-'.repeat(30));
  plan.tasks.forEach((t) => lines.push(`[${t.status.toUpperCase()}] ${t.task} — Owner: ${t.owner}, Timing: ${t.timing}, Depends on: ${t.dependsOn}`));
  lines.push('');

  lines.push('IMPACT ASSESSMENT', '-'.repeat(30));
  plan.impact.forEach((i) => lines.push(`[${i.severity.toUpperCase()}] ${i.area}: ${i.detail}`));
  lines.push('');

  lines.push('RISK REGISTER', '-'.repeat(30));
  plan.risks.forEach((r) => lines.push(`Risk: ${r.risk}\n   Mitigation: ${r.mitigation} (Owner: ${r.owner})`));
  lines.push('');

  lines.push('APPROVAL CHECKPOINTS', '-'.repeat(30));
  plan.approval.forEach((a) => lines.push(`[${a.checkpoint}] ${a.question} (Approver: ${a.approver})`));

  download(`pilot-${slug(plan.title)}.txt`, lines.join('\n'));
}
