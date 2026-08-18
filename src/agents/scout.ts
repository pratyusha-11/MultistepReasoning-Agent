export interface ScoutInput {
  objective: string;
  audience: string;
  geography: string;
  deadline: string;
  sourcePreference: string;
}

export interface ScoutStep {
  name: string;
  purpose: string;
  result: string;
  confidence: number;
}

export interface ScoutPlan {
  title: string;
  framing: string;
  questions: { question: string; why: string; method: string; infoNeeded: string }[];
  informationRequirements: string[];
  dependencies: { from: string; to: string; reason: string }[];
  synthesis: { section: string; contents: string }[];
  guardrails: string[];
  actions: { action: string; tool: string; reason: string }[];
  approval: { checkpoint: string; question: string; approver: string }[];
  steps: ScoutStep[];
  confidence: number;
}

type Scenario = 'solar' | 'school' | 'work' | 'generic';

function detectScenario(text: string): Scenario {
  const t = text.toLowerCase();
  if (t.includes('solar') || t.includes('electricity') || t.includes('energy') || t.includes('apartment')) return 'solar';
  if (t.includes('school') || t.includes('student') || t.includes('lunch') || t.includes('vendor') || t.includes('children')) return 'school';
  if (t.includes('remote') || t.includes('hybrid') || t.includes('team') || t.includes('work model') || t.includes('office')) return 'work';
  return 'generic';
}

const LEAD_VERBS = /^(decide whether|assess whether|assess if|evaluate whether|evaluate if|determine whether|determine if|figure out whether|figure out if|choose|select|decide|assess|evaluate|determine|find out|explore|understand|investigate|research)\s+(to\s+|if\s+|whether\s+)?/i;

/** Pulls a short, human subject phrase out of a free-text objective so generic
 * output still reads as if it was written about THIS input, not a template. */
function extractSubject(objective: string): string {
  let s = objective.trim().replace(/[.?!]+$/, '');
  s = s.replace(LEAD_VERBS, '');
  if (s.length > 90) {
    const cut = s.slice(0, 90);
    s = cut.slice(0, cut.lastIndexOf(' ')) + '…';
  }
  return s || 'this objective';
}

export const scoutSamples: { id: string; label: string; data: ScoutInput }[] = [
  {
    id: 'remote-work',
    label: 'Should our 40-person team go hybrid?',
    data: {
      objective: 'Decide whether our 40-person product company should move from fully remote to a hybrid work model.',
      audience: 'Founders and team leads',
      geography: 'India, distributed across Bengaluru, Mumbai, and Delhi',
      deadline: '2 weeks',
      sourcePreference: 'Employee survey, manager interviews, and credible workplace research',
    },
  },
  {
    id: 'school-lunch',
    label: 'Choose a healthier school lunch vendor',
    data: {
      objective: 'Select a healthier and affordable lunch vendor for a neighborhood school serving 300 students aged 6 to 12.',
      audience: 'School principal and parent committee',
      geography: 'Bengaluru, India',
      deadline: '10 days',
      sourcePreference: 'Vendor menus, food safety records, parent feedback, and local pricing',
    },
  },
  {
    id: 'solar',
    label: 'Evaluate rooftop solar for an apartment',
    data: {
      objective: 'Assess whether installing rooftop solar can meaningfully reduce electricity costs for a 60-home apartment building.',
      audience: 'Residents association and building committee',
      geography: 'Pune, India',
      deadline: '3 weeks',
      sourcePreference: 'Electricity bills, roof survey, installer quotes, and government incentives',
    },
  },
];

export function buildScoutPlan(input: ScoutInput): ScoutPlan {
  const objective = input.objective.trim();
  const scenario = detectScenario(objective);
  const subject = extractSubject(objective);
  const audience = input.audience.trim() || 'the decision-makers';
  const geography = input.geography.trim() || 'the stated context';
  const deadline = input.deadline.trim() || 'the available time';
  const sources = input.sourcePreference.trim() || 'the available sources';

  const questions: ScoutPlan['questions'] = scenario === 'solar'
    ? [
        { question: 'What is the building\'s actual monthly electricity consumption and tariff structure?', why: 'A savings claim is meaningless without the real baseline. Seasonal variation matters — a single month\'s bill can mislead by 30%.', method: 'Collect 12 months of electricity bills, note the tariff slab, demand charges, and time-of-use components.', infoNeeded: 'Monthly bills (12 months), tariff schedule, connection capacity' },
        { question: 'Can the roof physically and legally support the required panel area?', why: 'A strong financial case collapses if usable roof area, structural load capacity, shading from parapets or adjacent buildings, or local permits block installation.', method: 'Commission a site survey covering roof area, shade analysis across daylight hours, structural load assessment, and local permit requirements.', infoNeeded: 'Roof area, shade map, structural report, permit status' },
        { question: 'Which installer and financing combination gives the best risk-adjusted payback?', why: 'Installers differ in panel quality, warranty terms, generation guarantees, maintenance contracts, and financing options. The cheapest quote rarely has the lowest lifetime cost.', method: 'Request three itemized quotes. Score each on generation estimate (kWh/year), warranty years, maintenance terms, payment schedule, and net-metering support.', infoNeeded: 'Three quotes with full terms, financing options, net-metering rules' },
        { question: 'What government subsidies or net-metering policies apply in this location?', why: 'Subsidies can cut upfront cost by 20–40% and net-metering determines whether excess generation has financial value. Missing these can flip the go/no-go decision.', method: 'Check state solar policy, central government subsidy eligibility, and the local discom\'s net-metering application process.', infoNeeded: 'State policy, subsidy eligibility, discom net-metering rules' },
      ]
    : scenario === 'school'
      ? [
          { question: 'Which menu options are genuinely healthier within the per-child budget?', why: '"Healthy" must be defined with measurable criteria — calories, protein, vegetables, whole grains, and low sugar — not vendor marketing claims.', method: 'Request nutrition breakdowns for each menu cycle. Score against age-appropriate dietary guidelines for 6–12 year olds.', infoNeeded: 'Nutrition data per meal, menu cycles, age-group dietary guidelines' },
          { question: 'Can each vendor deliver safely and consistently at 300-meal scale?', why: 'A nutritious menu fails if the vendor cannot maintain food safety, deliver on time, or handle the volume without quality dropping.', method: 'Verify FSSAI license, inspect kitchen or cloud kitchen, check references from other schools, and run one trial delivery day.', infoNeeded: 'FSSAI license, kitchen inspection, references, trial-day results' },
          { question: 'What do children and parents actually accept?', why: 'Low acceptance creates food waste, parent complaints, and removes the health benefit the programme was created for.', method: 'Run a 3-day tasting with 30 students. Send a short parent survey covering dietary restrictions, allergies, and preferences.', infoNeeded: 'Tasting feedback, parent survey, allergy and restriction data' },
          { question: 'What happens if the vendor fails mid-contract?', why: 'Switching vendors mid-term is disruptive. The contract needs exit terms, notice periods, and a backup option.', method: 'Negotiate a 30-day exit clause, require a 2-week notice for menu changes, and identify one backup vendor.', infoNeeded: 'Contract terms, exit clauses, backup vendor list' },
      ]
      : scenario === 'work'
        ? [
            { question: 'Which specific work activities benefit from in-person time, and how often?', why: 'A hybrid policy should follow observed collaboration patterns — onboarding, design reviews, conflict resolution — not a blanket "2 days in office" rule.', method: 'Review project workflows from the last quarter. Interview 4–6 managers and 8–10 individual contributors about which meetings lose value when remote.', infoNeeded: 'Workflow data, manager interviews, IC interviews' },
            { question: 'What would change for productivity, hiring reach, retention, and real estate cost?', why: 'Hybrid has compounding effects beyond attendance. It can widen the hiring pool, reduce office cost, but also weaken mentorship and slow decisions.', method: 'Compare the last 12 months of output metrics, attrition data, and hiring funnel. Benchmark against 2–3 credible workplace studies.', infoNeeded: 'Productivity metrics, attrition data, hiring funnel, published research' },
            { question: 'Which hybrid model can be piloted without disrupting delivery?', why: 'A 4-week pilot with one or two teams is safer than a company-wide policy change that is hard to reverse.', method: 'Design two candidate policies (e.g., 2-day vs. 3-day office). Pilot one with 2 teams for 4 weeks. Measure output, satisfaction, and coordination friction.', infoNeeded: 'Pilot design, measurement framework, team selection' },
            { question: 'What do employees actually want, and how does it differ by role and city?', why: 'A policy imposed without input breeds resentment. Preferences vary sharply by role (engineering vs. sales) and city (commute quality matters).', method: 'Run an anonymous pulse survey with cuts by role, city, and tenure. Ask about preferred days, commute time, and home-work setup quality.', infoNeeded: 'Survey responses, role/city/tenure cuts' },
        ]
        : [
            { question: `What would count as a genuinely good outcome for "${subject}"?`, why: `${audience} need 3–5 measurable success criteria before any research begins, or the plan drifts into general reading instead of answering the actual question.`, method: `Workshop with ${audience.toLowerCase()} to agree on decision criteria and weightings for ${subject}.`, infoNeeded: `Success criteria, weightings, and the real deadline behind ${deadline}` },
            { question: `What options for "${subject}" are realistically available within ${deadline} and the stated constraints?`, why: 'Comparing ideal-world options that cannot be implemented in the available time wastes the research budget.', method: `Desk research on ${subject}, followed by targeted interviews with people in ${geography.toLowerCase()} who have made a similar call.`, infoNeeded: 'Option shortlist, feasibility notes, constraint mapping specific to this case' },
            { question: `What evidence would actually change the recommendation on "${subject}"?`, why: 'Pre-registering the evidence threshold prevents motivated reasoning once data starts coming in.', method: `Build a decision matrix for ${subject}. For each option, define what evidence would confirm or reject it, using ${sources.toLowerCase()}.`, infoNeeded: 'Decision matrix, evidence thresholds tied to the stated sources' },
            { question: `What assumptions is the case for "${subject}" resting on, and how sensitive is the outcome to each?`, why: 'Every plan rests on assumptions. Identifying the load-bearing ones focuses the limited research time on what actually matters.', method: 'List assumptions specific to this objective, rate each by impact and uncertainty, and test the top two first.', infoNeeded: 'Assumption register, sensitivity notes for the top-ranked assumptions' },
        ];

  const informationRequirements: string[] = scenario === 'solar'
    ? ['12 months of electricity bills with tariff breakdown', 'Roof area, shade analysis, and structural load assessment', 'Three itemized installer quotes with warranty and maintenance terms', 'State solar subsidy eligibility and discom net-metering policy', 'Resident voting or approval threshold for capital expenditure']
    : scenario === 'school'
      ? ['Nutrition data per meal cycle for each vendor', 'FSSAI license and kitchen inspection evidence', 'Parent survey on preferences, allergies, and dietary restrictions', 'Trial-day delivery results and student acceptance feedback', 'Contract exit terms and backup vendor identification']
      : scenario === 'work'
        ? ['12 months of productivity, attrition, and hiring funnel data', 'Anonymous employee pulse survey with role, city, and tenure cuts', 'Manager and IC interview notes on collaboration value', 'Office, commute, and remote-setup cost comparison', '2–3 credible workplace research studies for benchmarking']
        : [`A shared definition of success for "${subject}" with measurable criteria`, `A shortlist of options for ${subject}, feasible within ${deadline}`, `Primary evidence from ${audience.toLowerCase()} and other affected stakeholders in ${geography.toLowerCase()}`, `A decision matrix with pre-registered evidence thresholds, built from ${sources.toLowerCase()}`, 'An assumption register with sensitivity ratings for the top load-bearing assumptions'];

  const dependencies: ScoutPlan['dependencies'] = [
    { from: 'Agree decision criteria', to: 'Collect baseline evidence', reason: 'You cannot compare evidence consistently until the criteria are agreed. Without this, every data point invites a new debate.' },
    { from: 'Collect baseline evidence', to: 'Compare options on a scorecard', reason: 'The comparison needs a complete baseline and comparable inputs. Starting the comparison early produces a biased recommendation.' },
    { from: 'Compare options on a scorecard', to: 'Present recommendation for approval', reason: 'The recommendation must follow the scored evidence, not precede it. Presenting early locks in a conclusion before the data is in.' },
  ];

  const synthesis: ScoutPlan['synthesis'] = scenario === 'solar'
    ? [
        { section: '1. Recommendation', contents: 'Go or no-go, recommended system size, expected annual savings, payback range, and the single biggest uncertainty that could change the answer.' },
        { section: '2. Current baseline', contents: 'Monthly electricity use, tariff structure, connection capacity, and the assumptions behind the savings model.' },
        { section: '3. Options and economics', contents: 'Installer comparison scorecard, generation estimate, maintenance cost, financing options, subsidy applied, net-metering value, and a sensitivity range on key assumptions.' },
        { section: '4. Implementation', contents: 'Resident approval process, installer selection timeline, grid connection steps, and monitoring plan for the first year.' },
      ]
    : scenario === 'school'
      ? [
          { section: '1. Recommendation', contents: 'Preferred vendor, price per child per meal, health score, trial results, and conditions for contract approval.' },
          { section: '2. Safety and service', contents: 'FSSAI status, kitchen inspection findings, delivery reliability, capacity at 300 meals, and backup plan.' },
          { section: '3. Acceptance and cost', contents: 'Tasting results, parent survey summary, allergy and dietary coverage, waste risk, and total monthly cost.' },
          { section: '4. Contract and pilot', contents: 'Trial schedule, success measures, feedback loop, contract exit terms, and backup vendor.' },
        ]
      : scenario === 'work'
        ? [
            { section: '1. Recommendation', contents: 'Recommended hybrid model, confidence level, pilot design, and the evidence that supports the call.' },
            { section: '2. What we learned', contents: 'Collaboration patterns, survey results by role and city, productivity and attrition signals, and benchmarking against external research.' },
            { section: '3. Options compared', contents: 'Scorecard comparing 2–3 hybrid models on productivity, hiring, retention, cost, and employee preference.' },
            { section: '4. Pilot and rollout', contents: 'Pilot team selection, 4-week measurement plan, decision checkpoint, and company-wide rollout conditions.' },
          ]
        : [
            { section: '1. Recommendation', contents: `Clear answer on "${subject}", confidence level, and the evidence that supports it.` },
            { section: '2. What we learned', contents: `Baseline for ${subject}, perspectives from ${audience.toLowerCase()}, comparable evidence, and known limitations.` },
            { section: '3. Options compared', contents: `Consistent scorecard comparing the realistic options for ${subject} on trade-offs, cost, feasibility, and impact.` },
            { section: '4. Action plan', contents: `Next steps to act on ${subject} within ${deadline}, with owners, measures, and decision checkpoints.` },
        ];

  const guardrails: string[] = [
    `Use ${sources.toLowerCase()} as the evidence boundary. Do not expand scope without noting it.`,
    'Separate observed facts, stakeholder opinions, and assumptions in every note.',
    'Do not recommend an option until every finalist is scored against the same criteria.',
    'Record evidence date, source quality, and unresolved uncertainty in the final brief.',
  ];

  const actions: ScoutPlan['actions'] = scenario === 'solar'
    ? [
        { action: 'Pull 12 months of electricity bills', tool: 'Utility portal / bill records', reason: 'Establishes the real baseline instead of an assumed average.' },
        { action: 'Commission roof feasibility survey', tool: 'Local solar installer or structural engineer', reason: 'Determines whether the project is physically possible before financial modeling.' },
        { action: 'Request three itemized quotes', tool: 'Standardized RFP template', reason: 'Enables apples-to-apples comparison across installers.' },
        { action: 'Check subsidy and net-metering eligibility', tool: 'State solar portal + discom office', reason: 'Can change the payback by 20–40%.' },
      ]
    : scenario === 'school'
      ? [
          { action: 'Request nutrition data and menu cycles', tool: 'Vendor questionnaire', reason: 'Enables objective health scoring instead of vendor claims.' },
          { action: 'Verify FSSAI license and inspect kitchen', tool: 'FSSAI portal + site visit', reason: 'Confirms the vendor can operate safely at scale.' },
          { action: 'Run a 3-day tasting with students', tool: 'School cafeteria + feedback forms', reason: 'Tests real acceptance before committing to a contract.' },
          { action: 'Send parent preference and allergy survey', tool: 'Google Forms / school app', reason: 'Captures dietary constraints and buy-in before launch.' },
      ]
      : scenario === 'work'
        ? [
            { action: 'Run anonymous employee pulse survey', tool: 'Google Forms / Typeform', reason: 'Captures preferences by role and city without pressure.' },
            { action: 'Interview 4–6 managers on collaboration value', tool: '30-min structured interviews', reason: 'Identifies which activities actually need in-person time.' },
            { action: 'Pull 12 months of productivity and attrition data', tool: 'HRIS + project tracker', reason: 'Establishes whether the current model is working or broken.' },
            { action: 'Benchmark against 2–3 workplace studies', tool: 'Published research reports', reason: 'Prevents the team from reinventing conclusions already tested at scale.' },
        ]
        : [
            { action: `Workshop decision criteria for "${subject}" with ${audience.toLowerCase()}`, tool: 'Structured criteria template', reason: 'Aligns everyone on what matters before research begins.' },
            { action: `Shortlist realistic options for ${subject}`, tool: `Desk research + expert calls, using ${sources.toLowerCase()}`, reason: `Prevents comparing options that cannot be implemented within ${deadline}.` },
            { action: `Build a decision matrix for ${subject}`, tool: 'Spreadsheet scorecard', reason: 'Makes the comparison consistent and auditable.' },
            { action: 'List and rate key assumptions', tool: 'Assumption register template', reason: 'Focuses the limited research time on the variables that could flip the decision.' },
        ];

  const approval: ScoutPlan['approval'] = scenario === 'solar'
    ? [
        { checkpoint: 'After baseline and feasibility', question: 'Is the savings potential large enough to justify the effort of getting quotes?', approver: 'Building committee' },
        { checkpoint: 'After quote comparison', question: 'Which installer and financing option should we proceed with?', approver: 'Residents association (vote)' },
      ]
    : scenario === 'school'
      ? [
          { checkpoint: 'After safety and trial results', question: 'Does this vendor meet health, safety, and acceptance standards?', approver: 'Principal' },
          { checkpoint: 'Before contract sign', question: 'Are the price, exit terms, and backup plan acceptable?', approver: 'Parent committee' },
      ]
      : scenario === 'work'
        ? [
            { checkpoint: 'After survey and interviews', question: 'Is there enough signal to design a pilot?', approver: 'Founders' },
            { checkpoint: 'After pilot results', question: 'Should we roll out the pilot policy company-wide?', approver: 'Founders and team leads' },
        ]
        : [
            { checkpoint: 'After criteria are agreed', question: 'Are the decision criteria and weightings correct?', approver: audience },
            { checkpoint: 'After options are scored', question: 'Does the evidence support the recommended option?', approver: audience },
        ];

  const steps: ScoutStep[] = [
    { name: 'Frame', purpose: 'Turn the broad objective into a decision with a defined audience, place, and deadline.', result: `This plan will help ${audience.toLowerCase()} make a decision about ${objective.toLowerCase()} within ${deadline}, focused on ${geography.toLowerCase()}.`, confidence: 0.95 },
    { name: 'Decompose', purpose: 'Break the decision into sub-questions that can each be answered with evidence.', result: `${questions.length} sub-questions identified, each with a method and the specific information needed to answer it.`, confidence: 0.93 },
    { name: 'Select actions', purpose: 'Choose the right tool or method for each question rather than defaulting to a web search.', result: `${actions.length} actions selected, each with a specific tool chosen for the type of evidence it produces.`, confidence: 0.91 },
    { name: 'Specify evidence', purpose: 'List the exact information required so the research does not drift into general reading.', result: `${informationRequirements.length} evidence groups defined. Each maps to a specific sub-question.`, confidence: 0.92 },
    { name: 'Order work', purpose: 'Make dependencies explicit so conclusions do not outrun facts.', result: 'Criteria → baseline evidence → option comparison → approval. No step starts until its predecessor is complete.', confidence: 0.94 },
    { name: 'Design synthesis', purpose: 'Define the final brief structure before research begins.', result: `A ${synthesis.length}-section brief that opens with a recommendation and closes with an action plan, ready for ${audience.toLowerCase()}.`, confidence: 0.93 },
    { name: 'Set approval gates', purpose: 'Define where human approval is required before the agent proceeds.', result: `${approval.length} approval checkpoints identified. The agent pauses and waits for a human decision at each gate.`, confidence: 0.96 },
  ];

  return {
    title: `Research plan: ${objective}`,
    framing: `A decision-ready research sprint for ${audience.toLowerCase()} in ${geography.toLowerCase()}, scoped to ${deadline}. The plan focuses on the evidence needed to make the decision — not a generic report about the topic.`,
    questions,
    informationRequirements,
    dependencies,
    synthesis,
    guardrails,
    actions,
    approval,
    steps,
    confidence: 0.93,
  };
}
