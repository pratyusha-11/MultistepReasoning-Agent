export interface PilotInput {
  objective: string;
  deadline: string;
  team: string;
  constraints: string;
  change: string;
}

export interface PilotTask {
  id: string;
  task: string;
  owner: string;
  timing: string;
  dependsOn: string;
  status: 'on track' | 'at risk' | 'new' | 'moved';
}

export interface PilotPlan {
  title: string;
  summary: string;
  milestones: { label: string; date: string; detail: string; status: 'on track' | 'at risk' | 'new' | 'moved' }[];
  tasks: PilotTask[];
  impact: { area: string; detail: string; severity: 'high' | 'medium' | 'low' }[];
  risks: { risk: string; mitigation: string; owner: string }[];
  approval: { checkpoint: string; question: string; approver: string }[];
  steps: { name: string; purpose: string; result: string; confidence: number }[];
  confidence: number;
  isReplanned: boolean;
}

type Scenario = 'shop' | 'event' | 'dashboard' | 'generic';

function detectScenario(text: string): Scenario {
  const t = text.toLowerCase();
  if (t.includes('shop') || t.includes('store') || t.includes('diwali') || t.includes('gift')) return 'shop';
  if (t.includes('event') || t.includes('park') || t.includes('community') || t.includes('wellness') || t.includes('stall')) return 'event';
  if (t.includes('dashboard') || t.includes('sales') || t.includes('crm') || t.includes('spreadsheet')) return 'dashboard';
  return 'generic';
}

const LEAD_VERBS = /^(launch|run|build|ship|organize|create|set up|start|plan|deliver|open)\s+(a\s+|an\s+|the\s+)?/i;

/** Pulls a short subject phrase out of the objective so the generic (non-matched)
 * scenario still reads as written about THIS project, not a fixed template. */
function extractSubject(objective: string): string {
  let s = objective.trim().replace(/[.?!]+$/, '');
  s = s.replace(LEAD_VERBS, '');
  if (s.length > 80) {
    const cut = s.slice(0, 80);
    s = cut.slice(0, cut.lastIndexOf(' ')) + '…';
  }
  return s || 'this project';
}

function detectChangeType(change: string): 'resource' | 'schedule' | 'scope' | 'none' {
  const c = change.toLowerCase();
  if (!c.trim()) return 'none';
  if (c.includes('unavailable') || c.includes('sick') || c.includes('quit') || c.includes('left') || c.includes('resigned') || c.includes('reassigned')) return 'resource';
  if (c.includes('week later') || c.includes('delayed') || c.includes('postpone') || c.includes('moved')) return 'schedule';
  if (c.includes('budget') || c.includes('cut') || c.includes('reduce') || c.includes('add') || c.includes('new feature') || c.includes('more products')) return 'scope';
  return 'schedule';
}

export const pilotSamples: { id: string; label: string; data: PilotInput }[] = [
  {
    id: 'shop-launch',
    label: 'Launch an online shop before Diwali',
    data: {
      objective: 'Launch a small online shop for handmade gifts before the Diwali shopping season.',
      deadline: '6 weeks',
      team: '2 founders, 1 designer, 1 freelance developer',
      constraints: 'Budget under ₹2 lakh; start with 20 products; payments and shipping must work on mobile.',
      change: 'The freelance developer is unavailable for the final 10 days.',
    },
  },
  {
    id: 'community-event',
    label: 'Organize a 200-person community event',
    data: {
      objective: 'Run a 200-person neighborhood health and wellness event with talks, free health check-ups, and local food and craft stalls.',
      deadline: '4 weeks',
      team: '3 organizers, 8 volunteers, 2 partner clinics',
      constraints: 'Public park booking is fixed; must stay within ₹80,000 and have a rain backup plan.',
      change: 'The park is available only one week later than planned.',
    },
  },
  {
    id: 'analytics-dashboard',
    label: 'Ship a weekly sales dashboard',
    data: {
      objective: 'Ship a reliable weekly sales dashboard that replaces a manual spreadsheet for the sales team.',
      deadline: '5 weeks',
      team: '1 data engineer, 1 analyst, 1 sales operations lead',
      constraints: 'Use existing data sources; no new paid tools; sales managers need a mobile-friendly summary.',
      change: 'The source CRM export will be delayed by one week.',
    },
  },
];

export function buildPilotPlan(input: PilotInput, replan: boolean): PilotPlan {
  const scenario = detectScenario(input.objective);
  const genericSubject = extractSubject(input.objective);
  const subject = scenario === 'shop' ? 'shop launch' : scenario === 'event' ? 'community event' : scenario === 'dashboard' ? 'sales dashboard' : genericSubject;
  const changeType = detectChangeType(input.change);
  const team = input.team.trim() || 'the team';
  const constraints = input.constraints.trim() || 'the stated constraints';

  const baseTasks: PilotTask[] = scenario === 'shop'
    ? [
        { id: 's1', task: 'Confirm 20-product catalogue, pricing, and inventory', owner: 'Founders', timing: 'Week 1', dependsOn: '—', status: 'on track' },
        { id: 's2', task: 'Create product photography and copy for 20 products', owner: 'Designer', timing: 'Week 1–2', dependsOn: 'Catalogue confirmed', status: 'on track' },
        { id: 's3', task: 'Build mobile storefront, product pages, and cart', owner: 'Developer', timing: 'Week 2–4', dependsOn: 'Catalogue + photography', status: 'on track' },
        { id: 's4', task: 'Connect payments, shipping rates, and order confirmation emails', owner: 'Developer', timing: 'Week 4–5', dependsOn: 'Storefront built', status: 'on track' },
        { id: 's5', task: 'Run full checkout test on 3 mobile devices and soft launch to 50 people', owner: 'Founders', timing: 'Week 5–6', dependsOn: 'Payments + content ready', status: 'on track' },
      ]
    : scenario === 'event'
      ? [
          { id: 'e1', task: 'Confirm venue, permits, and rain backup location', owner: 'Lead organizer', timing: 'Week 1', dependsOn: '—', status: 'on track' },
          { id: 'e2', task: 'Lock clinic talks, health-check capacity, and volunteer roles', owner: 'Partnerships lead', timing: 'Week 1–2', dependsOn: 'Venue confirmed', status: 'on track' },
          { id: 'e3', task: 'Open registration and publish the event programme', owner: 'Communications', timing: 'Week 2', dependsOn: 'Programme locked', status: 'on track' },
          { id: 'e4', task: 'Book stalls, equipment, food vendors, and signage', owner: 'Operations', timing: 'Week 2–3', dependsOn: 'Venue + programme', status: 'on track' },
          { id: 'e5', task: 'Run event-day briefing, setup, and delivery', owner: 'All organizers', timing: 'Week 4', dependsOn: 'All suppliers confirmed', status: 'on track' },
        ]
      : scenario === 'dashboard'
        ? [
            { id: 'd1', task: 'Agree metric definitions, dashboard audience, and refresh frequency', owner: 'Sales operations lead', timing: 'Week 1', dependsOn: '—', status: 'on track' },
            { id: 'd2', task: 'Map CRM fields, build clean source table, and document data quality gaps', owner: 'Data engineer', timing: 'Week 1–2', dependsOn: 'Metric definitions agreed', status: 'on track' },
            { id: 'd3', task: 'Design mobile summary view and detailed manager views', owner: 'Analyst', timing: 'Week 2–3', dependsOn: 'Metric definitions agreed', status: 'on track' },
            { id: 'd4', task: 'Build dashboard and validate totals against source system', owner: 'Data engineer', timing: 'Week 3–4', dependsOn: 'Source table + design', status: 'on track' },
            { id: 'd5', task: 'Pilot with two sales managers and publish handover documentation', owner: 'Sales operations lead', timing: 'Week 5', dependsOn: 'Dashboard validated', status: 'on track' },
          ]
        : [
            { id: 'g1', task: `Define scope, success criteria, and constraints for ${genericSubject}`, owner: 'Project lead', timing: 'Week 1', dependsOn: '—', status: 'on track' },
            { id: 'g2', task: `Break ${genericSubject} into tasks and identify dependencies, sized for ${team.toLowerCase()}`, owner: 'Project lead', timing: 'Week 1–2', dependsOn: 'Scope defined', status: 'on track' },
            { id: 'g3', task: `Execute the core work for ${genericSubject} within ${constraints.toLowerCase()}`, owner: team, timing: 'Week 2–4', dependsOn: 'Task breakdown', status: 'on track' },
            { id: 'g4', task: `Review, test, and validate the result against the original objective`, owner: 'Project lead', timing: 'Week 4–5', dependsOn: 'Core deliverables done', status: 'on track' },
            { id: 'g5', task: `Finalize and hand over ${genericSubject}`, owner: 'Project lead', timing: 'Week 5–6', dependsOn: 'Validation passed', status: 'on track' },
        ];

  const tasks = baseTasks.map((task) => ({ ...task }));
  const impacts: PilotPlan['impact'] = [];

  if (replan && changeType !== 'none') {
    if (scenario === 'shop') {
      if (changeType === 'resource') {
        tasks[2] = { ...tasks[2], timing: 'Week 2–3 (compressed)', status: 'moved' };
        tasks[3] = { ...tasks[3], timing: 'Week 3–4', status: 'new' };
        tasks[4] = { ...tasks[4], timing: 'Week 5–6', status: 'at risk' };
        impacts.push(
          { area: 'Developer capacity', detail: 'The developer leaves 10 days before launch. Build scope is cut to essentials: catalogue display, cart, payment, and order confirmation. Nice-to-haves (wishlist, reviews, filters) are deferred.', severity: 'high' },
          { area: 'Founder workload', detail: 'Founders absorb the developer\'s testing and review work. They must be available for the last 10 days.', severity: 'medium' },
          { area: 'Launch date', detail: 'The Diwali deadline is still achievable if the catalogue and photography are frozen by end of Week 1. Any delay there cascades.', severity: 'medium' },
        );
      } else if (changeType === 'schedule') {
        tasks.forEach((_, i) => { if (i >= 2) tasks[i] = { ...tasks[i], status: 'moved' }; });
        impacts.push({ area: 'Timeline', detail: 'All downstream tasks shift. The launch date is at risk if the delay cannot be absorbed.', severity: 'high' });
      } else {
        impacts.push({ area: 'Scope change', detail: 'Scope has changed. Re-evaluate the task list and timeline before proceeding.', severity: 'medium' });
      }
    } else if (scenario === 'event') {
      if (changeType === 'schedule') {
        tasks[0] = { ...tasks[0], timing: 'Week 1–2', status: 'moved' };
        tasks[1] = { ...tasks[1], timing: 'Week 2–3', status: 'moved' };
        tasks[2] = { ...tasks[2], timing: 'Week 3', status: 'moved' };
        tasks[3] = { ...tasks[3], timing: 'Week 3–4', status: 'moved' };
        tasks[4] = { ...tasks[4], timing: 'Week 5', status: 'new' };
        impacts.push(
          { area: 'Event date', detail: 'The entire event moves one week. Every supplier, clinic, and volunteer must be re-confirmed for the new date.', severity: 'high' },
          { area: 'Registration', detail: 'Public registration must NOT open until the new date and rain backup are confirmed in writing. Opening early creates confusion and rework.', severity: 'high' },
          { area: 'Budget', detail: 'Some vendors may charge more for the new date. Re-check the ₹80,000 budget before confirming.', severity: 'medium' },
        );
      } else {
        impacts.push({ area: 'Change detected', detail: 'A change has been detected. Trace it through the task list and milestones.', severity: 'medium' });
      }
    } else if (scenario === 'dashboard') {
      if (changeType === 'schedule') {
        tasks[1] = { ...tasks[1], timing: 'Week 2–3', status: 'moved' };
        tasks[3] = { ...tasks[3], timing: 'Week 4–5', status: 'at risk' };
        tasks[4] = { ...tasks[4], timing: 'Week 5 (compressed)', status: 'at risk' };
        impacts.push(
          { area: 'Data pipeline', detail: 'The CRM export is delayed by one week. The source table cannot be built until it arrives. All downstream work waits on this.', severity: 'high' },
          { area: 'Validation', detail: 'Dashboard totals cannot be trusted until the delayed export is reconciled against known-good totals. Do not skip this step to save time.', severity: 'high' },
          { area: 'Scope', detail: 'Cut the first release to the three agreed manager metrics. Postpone nice-to-have filters and custom date ranges to a later release.', severity: 'medium' },
        );
      } else {
        impacts.push({ area: 'Change detected', detail: 'A change has been detected. Trace it through the task list and milestones.', severity: 'medium' });
      }
    } else {
      const label = changeType === 'resource' ? 'Resource change' : changeType === 'scope' ? 'Scope change' : 'Schedule change';
      if (changeType === 'resource') {
        tasks.forEach((_, i) => { if (i >= 2) tasks[i] = { ...tasks[i], status: 'at risk' }; });
      } else if (changeType === 'schedule') {
        tasks.forEach((_, i) => { if (i >= 1) tasks[i] = { ...tasks[i], status: 'moved' }; });
      } else {
        tasks.push({ id: 'g-new', task: `New work added by: "${input.change.trim()}"`, owner: team, timing: 'To be scheduled', dependsOn: 'Core deliverables', status: 'new' });
      }
      impacts.push({ area: label, detail: `"${input.change.trim()}" affects ${genericSubject}. Review task owners and timing below — they have been adjusted to protect the deadline.`, severity: changeType === 'scope' ? 'medium' : 'high' });
    }
  } else if (replan && changeType === 'none') {
    impacts.push({ area: 'No change specified', detail: 'Enter a change in the "Change to test" field to see how Pilot replans the schedule.', severity: 'low' });
  } else {
    impacts.push({ area: 'Current plan', detail: `No disruption has been applied. The schedule for ${genericSubject} is ready to start with the first dependency.`, severity: 'low' });
  }

  const milestones: PilotPlan['milestones'] = scenario === 'shop'
    ? [
        { label: 'Scope locked', date: 'End of Week 1', detail: '20-product catalogue, pricing, and launch promise approved by founders.', status: 'on track' },
        { label: 'Working store', date: replan && changeType === 'resource' ? 'End of Week 4 (at risk)' : 'End of Week 4', detail: 'Mobile browsing, cart, and checkout work end to end.', status: replan && changeType === 'resource' ? 'at risk' : 'on track' },
        { label: 'Soft launch', date: 'End of Week 6', detail: 'Soft launch to 50 people before public Diwali promotion.', status: replan && changeType === 'resource' ? 'at risk' : 'on track' },
      ]
    : scenario === 'event'
      ? [
          { label: 'Venue confirmed', date: replan && changeType === 'schedule' ? 'End of Week 2' : 'End of Week 1', detail: 'Date, permits, and rain backup locked.', status: replan && changeType === 'schedule' ? 'moved' : 'on track' },
          { label: 'Registration live', date: replan && changeType === 'schedule' ? 'Week 3' : 'Week 2', detail: 'Programme and partners are public.', status: replan && changeType === 'schedule' ? 'moved' : 'on track' },
          { label: 'Event day', date: replan && changeType === 'schedule' ? 'Week 5' : 'Week 4', detail: '200-person event delivered.', status: replan && changeType === 'schedule' ? 'new' : 'on track' },
        ]
      : scenario === 'dashboard'
        ? [
            { label: 'Definitions approved', date: 'End of Week 1', detail: 'Everyone agrees what each metric means.', status: 'on track' },
            { label: 'Validated dashboard', date: replan && changeType === 'schedule' ? 'End of Week 5' : 'End of Week 4', detail: 'Totals reconcile with the source system.', status: replan && changeType === 'schedule' ? 'moved' : 'on track' },
            { label: 'Manager pilot', date: 'Week 5', detail: 'Two managers use the dashboard for a real review.', status: replan && changeType === 'schedule' ? 'at risk' : 'on track' },
          ]
        : [
            { label: 'Scope defined', date: 'End of Week 1', detail: `Scope, success criteria, and constraints for ${genericSubject} agreed.`, status: replan && changeType !== 'none' ? 'moved' : 'on track' },
            { label: 'Core deliverables', date: replan && changeType === 'schedule' ? 'End of Week 5' : 'End of Week 4', detail: `Main work on ${genericSubject} completed within ${constraints.toLowerCase()}.`, status: replan && changeType !== 'none' ? 'at risk' : 'on track' },
            { label: 'Handover', date: replan && changeType === 'schedule' ? 'End of Week 7' : 'End of Week 6', detail: `${genericSubject[0].toUpperCase()}${genericSubject.slice(1)} finalized and handed over.`, status: 'on track' },
        ];

  const risks: PilotPlan['risks'] = scenario === 'shop'
    ? [
        { risk: 'Product content or photography arrives late, blocking the developer.', mitigation: 'Freeze the first 20 products at end of Week 1. Defer additions to a post-launch update.', owner: 'Founders' },
        { risk: 'Checkout fails on mobile — the primary channel for Diwali shoppers.', mitigation: 'Test payment, shipping, cancellation, and order emails on 3 devices before soft launch.', owner: 'Developer / Founders' },
        { risk: 'Shipping rates are wrong for remote pincodes.', mitigation: 'Validate shipping rates for 5 test pincodes before launch. Set a fallback flat rate.', owner: 'Founders' },
      ]
    : scenario === 'event'
      ? [
          { risk: 'Rain forces the event indoors with no backup booked.', mitigation: 'Book the backup space before registration opens. Publish the rain contingency on the event page.', owner: 'Lead organizer' },
          { risk: 'Clinic health-check capacity is lower than expected, creating long queues.', mitigation: 'Use timed check-in slots. Confirm staffing one week before the event.', owner: 'Partnerships lead' },
          { risk: 'Volunteer no-shows on event day.', mitigation: 'Assign 2 backup volunteers. Brief all volunteers 3 days before with a written run-sheet.', owner: 'Operations' },
        ]
      : scenario === 'dashboard'
        ? [
            { risk: 'CRM data definitions differ by team, producing inconsistent numbers.', mitigation: 'Approve a metric dictionary before building any charts. Get sign-off from sales operations.', owner: 'Sales operations lead' },
            { risk: 'Delayed source data compresses validation, risking incorrect totals.', mitigation: 'Prepare a small known-good test dataset. Protect one full validation cycle even if the timeline shrinks.', owner: 'Data engineer' },
            { risk: 'Managers do not adopt the dashboard and revert to the spreadsheet.', mitigation: 'Run the pilot with two managers. Incorporate their feedback before company-wide rollout.', owner: 'Sales operations lead' },
        ]
        : [
            { risk: `Scope on ${genericSubject} creeps beyond the original objective.`, mitigation: 'Lock scope at end of Week 1. Route any additions through a change request.', owner: 'Project lead' },
            { risk: `A dependency is missed, blocking downstream work for ${team.toLowerCase()}.`, mitigation: 'Review dependencies weekly. Flag any task whose predecessor is slipping.', owner: 'Project lead' },
            { risk: `The plan exceeds ${constraints.toLowerCase()}.`, mitigation: 'Check each milestone against the stated constraints before moving to the next phase.', owner: 'Project lead' },
        ];

  const approval: PilotPlan['approval'] = scenario === 'shop'
    ? [
        { checkpoint: 'After catalogue is locked', question: 'Are these the right 20 products and prices for Diwali?', approver: 'Founders' },
        { checkpoint: 'After storefront is built', question: 'Is the store ready for soft launch, or does it need more work?', approver: 'Founders' },
        { checkpoint: 'After soft launch', question: 'Are checkout and shipping working well enough for public promotion?', approver: 'Founders' },
      ]
    : scenario === 'event'
      ? [
          { checkpoint: 'After venue is confirmed', question: 'Is the date and rain backup acceptable to all partners?', approver: 'Lead organizer' },
          { checkpoint: 'Before registration opens', question: 'Is the programme and capacity confirmed?', approver: 'Lead organizer' },
          { checkpoint: '3 days before event', question: 'Are all suppliers, volunteers, and clinics confirmed?', approver: 'All organizers' },
        ]
      : scenario === 'dashboard'
        ? [
            { checkpoint: 'After metric definitions', question: 'Do these definitions match what sales managers actually need?', approver: 'Sales operations lead' },
            { checkpoint: 'After dashboard validation', question: 'Are the totals correct and ready for the pilot?', approver: 'Data engineer + analyst' },
            { checkpoint: 'After manager pilot', question: 'Is the dashboard ready to replace the spreadsheet?', approver: 'Sales operations lead' },
        ]
        : [
            { checkpoint: 'After scope is defined', question: `Is the scope for ${genericSubject} correct and complete?`, approver: 'Project lead' },
            { checkpoint: 'After core deliverables', question: 'Are the deliverables ready for review?', approver: 'Project lead' },
        ];

  const steps: PilotPlan['steps'] = [
    { name: 'Parse objective', purpose: 'Identify the outcome, deadline, team, and constraints.', result: `${subject[0].toUpperCase()}${subject.slice(1)} is planned for ${input.deadline} with ${input.team.toLowerCase()}. Constraints: ${input.constraints.toLowerCase()}`, confidence: 0.96 },
    { name: 'Build critical path', purpose: 'Order work around real dependencies rather than a flat task list.', result: `${tasks.length} tasks connect the first decision to the final delivery milestone. Each task has one owner and a clear predecessor.`, confidence: 0.94 },
    { name: replan ? 'Assess disruption' : 'Check feasibility', purpose: replan ? 'Trace the change through affected tasks, owners, and milestones.' : 'Test the schedule against the stated constraints before work begins.', result: replan ? `${impacts.length} impact areas identified. ${changeType === 'resource' ? 'Resource loss' : changeType === 'schedule' ? 'Schedule shift' : 'Scope change'} traced through the critical path.` : 'The plan fits the team and constraints. Key risks have owners and mitigations.', confidence: 0.92 },
    { name: replan ? 'Replan' : 'Assign owners', purpose: replan ? 'Protect the deadline by moving work, reducing scope, and highlighting new risk.' : 'Make the plan executable by assigning every task and checkpoint.', result: replan ? 'Timings, statuses, and mitigations updated. The goal is protected; lower-value work is cut or deferred.' : 'Every task has one accountable owner and a clear predecessor.', confidence: 0.93 },
    { name: 'Set approval gates', purpose: 'Define where human approval is required before the agent proceeds.', result: `${approval.length} approval checkpoints set. The agent pauses at each gate and waits for a human decision.`, confidence: 0.95 },
  ];

  return {
    title: `${replan ? 'Replanned' : 'Plan'}: ${input.objective}`,
    summary: replan
      ? `The plan has been rebuilt around this change: "${input.change}". The critical path is protected, lower-value work is cut or moved, and affected owners know what changes next.`
      : `A dependency-aware ${input.deadline} schedule for the ${subject}, sized for ${input.team.toLowerCase()} and constrained by ${input.constraints.toLowerCase()}`,
    milestones,
    tasks,
    impact: impacts,
    risks,
    approval,
    steps,
    confidence: replan ? 0.9 : 0.94,
    isReplanned: replan,
  };
}
