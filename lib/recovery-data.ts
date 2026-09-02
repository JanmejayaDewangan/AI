export type Case = {
  id: string;
  customer: string;
  ref: string;
  type: string;
  amount: number;
  status: string;
  diagnosis: string;
  playbook: string;
  attempts: number;
  lastAction: string;
  risk: 'Critical' | 'High' | 'Medium' | 'Low';
  time: string;
  recovered?: number;
  probability: number;
  confidence: number;
  nextAction: string;
  nextActionReason: string;
  evidence: string[];
  deadline: string;
  owner: string;
  channel: string;
  policy: string;
};

export type Customer = {
  name: string;
  ref: string;
  email: string;
  ltv: number;
  outstanding: number;
  plan: string;
  health: 'Healthy' | 'At Risk' | 'Critical';
  successfulPayments: number;
  failedPayments: number;
  openInvoices: number;
  subscriptions: number;
  recoveryCases: number;
  riskScore: number;
  recoveryProbability: number;
};

export type AIRecommendation = {
  id: number;
  action: string;
  detail: string;
  expectedRecovery: number;
  confidence: number;
  riskLevel: string;
  requiresApproval: boolean;
  reason: string;
  cases: number;
};

export const money = (value: number) => `₹${new Intl.NumberFormat('en-IN').format(value)}`;
export const moneyL = (value: number) => `₹${(value / 100000).toFixed(2)}L`;

export const casesSeed: Case[] = [
  {
    id: 'REC_10021', customer: 'Rahul Sharma', ref: 'CUS_1024', type: 'Payment failed', amount: 12499, recovered: 12499,
    status: 'Recovered', diagnosis: 'Expired payment method', playbook: 'Expired card recovery', attempts: 1,
    lastAction: 'Payment successful', risk: 'Medium', time: '2 min ago', probability: 96, confidence: 96,
    nextAction: 'Mark as recovered', nextActionReason: 'Payment has been verified as successful. No further action needed.',
    evidence: ['14 previous successful payments', 'No previous disputes', 'Payment amount within policy limits'],
    deadline: 'Completed', owner: 'AI Agent', channel: 'WhatsApp', policy: 'PAYMENT_RECOVERY_01',
  },
  {
    id: 'REC_10020', customer: 'Sarah Wilson', ref: 'CUS_0998', type: 'Invoice overdue', amount: 84200,
    status: 'Escalated', diagnosis: 'High-value invoice · 31 days overdue', playbook: 'Collections escalation', attempts: 2,
    lastAction: 'Assigned to finance', risk: 'Critical', time: '18 min ago', probability: 92, confidence: 94,
    nextAction: 'Escalate to account manager and send payment link', nextActionReason: 'Invoice is 31 days overdue with high value. Customer has strong payment history suggesting ability to pay. Escalation + direct payment link maximizes recovery probability.',
    evidence: ['14 previous successful payments', '2 previous failed payments', 'High lifetime value (₹4.8L)', 'No previous disputes', 'Enterprise customer'],
    deadline: 'Due in 2h', owner: 'AI Agent', channel: 'Email + WhatsApp', policy: 'COLLECTIONS_ESCALATION_02',
  },
  {
    id: 'REC_10019', customer: 'Priya Mehta', ref: 'CUS_1042', type: 'Checkout abandoned', amount: 6890,
    status: 'Awaiting Payment', diagnosis: 'High intent · returning customer', playbook: 'Checkout reminder', attempts: 1,
    lastAction: 'WhatsApp sent', risk: 'Low', time: '34 min ago', probability: 76, confidence: 88,
    nextAction: 'Send WhatsApp reminder with payment link', nextActionReason: 'Customer is a returning user with high intent. WhatsApp reminders have a 48% success rate for checkout recovery. Low risk amount makes this safe to automate.',
    evidence: ['Returning customer', 'Previously responded to WhatsApp', 'Low amount (₹6,890)', 'No previous disputes'],
    deadline: 'Due in 4h', owner: 'AI Agent', channel: 'WhatsApp', policy: 'CHECKOUT_RECOVERY_01',
  },
  {
    id: 'REC_10018', customer: 'Arjun Patel', ref: 'CUS_1011', type: 'Subscription failed', amount: 24999,
    status: 'Recovery in Progress', diagnosis: 'Insufficient funds · payday proximity', playbook: 'Delayed retry', attempts: 1,
    lastAction: 'Retry scheduled', risk: 'High', time: '1 hr ago', probability: 88, confidence: 91,
    nextAction: 'Retry payment in 6 hours', nextActionReason: 'Customer has 14 previous successful payments. Current failure is likely temporary due to insufficient funds. Payday proximity (3 days) suggests funds will be available. Retry has 87% historical success rate.',
    evidence: ['14 previous successful payments', 'Current failure is likely temporary', 'No previous disputes', 'Payment amount within policy', 'Payday in 3 days'],
    deadline: 'Due in 1h', owner: 'AI Agent', channel: 'Payment Retry', policy: 'PAYMENT_RECOVERY_01',
  },
  {
    id: 'REC_10017', customer: 'Michael Chen', ref: 'CUS_0976', type: 'Mandate failed', amount: 15200,
    status: 'Detected', diagnosis: 'Bank authorization required', playbook: 'Mandate recovery', attempts: 0,
    lastAction: 'Awaiting diagnosis', risk: 'Medium', time: '2 hrs ago', probability: 64, confidence: 79,
    nextAction: 'Request mandate update via customer portal', nextActionReason: 'Mandate failure requires bank re-authorization. Customer needs to update mandate through portal. Medium probability due to friction in re-authorization process.',
    evidence: ['Mandate expired 2 days ago', 'Customer has active subscriptions', 'Previous mandate was successful for 8 months'],
    deadline: 'Due in 6h', owner: 'AI Agent', channel: 'Email', policy: 'MANDATE_RECOVERY_01',
  },
  {
    id: 'REC_10016', customer: 'Nisha Kapoor', ref: 'CUS_1004', type: 'Promise missed', amount: 45800,
    status: 'Recovery in Progress', diagnosis: 'Promise-to-pay missed by 1 day', playbook: 'Follow-up & escalation', attempts: 1,
    lastAction: 'Email follow-up sent', risk: 'High', time: '3 hrs ago', probability: 71, confidence: 85,
    nextAction: 'Send follow-up WhatsApp + offer payment plan', nextActionReason: 'Customer missed a promise-to-pay by 1 day. Combining WhatsApp follow-up with a payment plan offer addresses both intent and ability to pay. 58% success rate for this playbook.',
    evidence: ['Customer promised to pay on 17 Aug', 'Missed promise by 1 day', 'Previous payments were on time for 6 months', 'High lifetime value (₹5.84L)'],
    deadline: 'Due in 3h', owner: 'AI Agent', channel: 'WhatsApp + Email', policy: 'PROMISE_FOLLOWUP_01',
  },
];

export const customersSeed: Customer[] = [
  { name: 'Rahul Sharma', ref: 'CUS_1024', email: 'rahul.s@email.com', ltv: 248000, outstanding: 0, plan: 'Growth plan', health: 'Healthy', successfulPayments: 14, failedPayments: 1, openInvoices: 0, subscriptions: 1, recoveryCases: 1, riskScore: 12, recoveryProbability: 96 },
  { name: 'Sarah Wilson', ref: 'CUS_0998', email: 'sarah.w@company.com', ltv: 842000, outstanding: 84200, plan: 'Enterprise', health: 'Critical', successfulPayments: 14, failedPayments: 2, openInvoices: 1, subscriptions: 1, recoveryCases: 1, riskScore: 89, recoveryProbability: 92 },
  { name: 'Priya Mehta', ref: 'CUS_1042', email: 'priya.m@startup.in', ltv: 68900, outstanding: 6890, plan: 'Starter', health: 'At Risk', successfulPayments: 5, failedPayments: 1, openInvoices: 0, subscriptions: 1, recoveryCases: 1, riskScore: 34, recoveryProbability: 76 },
  { name: 'Arjun Patel', ref: 'CUS_1011', email: 'arjun.p@tech.co', ltv: 412000, outstanding: 24999, plan: 'Growth plan', health: 'At Risk', successfulPayments: 14, failedPayments: 1, openInvoices: 0, subscriptions: 1, recoveryCases: 1, riskScore: 56, recoveryProbability: 88 },
  { name: 'Michael Chen', ref: 'CUS_0976', email: 'm.chen@corp.com', ltv: 15200, outstanding: 15200, plan: 'Starter', health: 'At Risk', successfulPayments: 8, failedPayments: 1, openInvoices: 1, subscriptions: 1, recoveryCases: 1, riskScore: 48, recoveryProbability: 64 },
  { name: 'Nisha Kapoor', ref: 'CUS_1004', email: 'nisha.k@biz.in', ltv: 584000, outstanding: 45800, plan: 'Enterprise', health: 'Critical', successfulPayments: 18, failedPayments: 2, openInvoices: 1, subscriptions: 1, recoveryCases: 1, riskScore: 78, recoveryProbability: 71 },
];

export const aiRecommendations: AIRecommendation[] = [
  { id: 1, action: 'Retry payment for 7 customers', detail: 'Failed payments with temporary decline reasons', expectedRecovery: 58400, confidence: 87, riskLevel: 'Low', requiresApproval: false, reason: '7 customers have temporary payment failures (insufficient funds, bank decline). All have strong payment histories. Automated retry has 68% success rate.', cases: 7 },
  { id: 2, action: 'Send WhatsApp reminders to 12 customers', detail: 'Checkout abandonment and promise-to-pay missed', expectedRecovery: 41200, confidence: 82, riskLevel: 'Low', requiresApproval: false, reason: '12 customers abandoned checkout or missed promise-to-pay. WhatsApp reminders have 48% success rate. All customers previously opted in to WhatsApp communication.', cases: 12 },
  { id: 3, action: 'Escalate 3 high-value accounts', detail: 'Enterprise customers with overdue invoices > ₹50K', expectedRecovery: 72000, confidence: 94, riskLevel: 'High', requiresApproval: true, reason: '3 enterprise customers have invoices overdue by 30+ days totaling ₹72,000. High value requires human escalation per policy HIGH_VALUE_REVIEW_01.', cases: 3 },
  { id: 4, action: 'Offer payment plans to 4 customers', detail: 'Customers with missed promises and high outstanding amounts', expectedRecovery: 29600, confidence: 75, riskLevel: 'Medium', requiresApproval: true, reason: '4 customers have missed promise-to-pay and outstanding amounts > ₹20K. Offering structured payment plans can recover revenue while reducing customer churn risk.', cases: 4 },
];

export const riskBreakdown = [
  { level: 'Critical', amount: 142000, cases: 18, color: '#ef4444' },
  { level: 'High', amount: 186000, cases: 37, color: '#f59e0b' },
  { level: 'Medium', amount: 111000, cases: 46, color: '#4f8cff' },
  { level: 'Low', amount: 46000, cases: 36, color: '#22c55e' },
];

export const riskReasons = [
  { reason: 'Expired card', percentage: 31, amount: 150000, color: '#22c55e' },
  { reason: 'Invoice overdue', percentage: 27, amount: 131000, color: '#4f8cff' },
  { reason: 'Insufficient funds', percentage: 18, amount: 87000, color: '#f59e0b' },
  { reason: 'Mandate failure', percentage: 14, amount: 68000, color: '#a0b8d0' },
  { reason: 'Other', percentage: 10, amount: 49000, color: '#64748b' },
];

export const recoveryOpportunities = [
  { type: 'Expired cards', count: 32, amount: 72000, icon: 'credit-card' },
  { type: 'Overdue invoices', count: 18, amount: 61000, icon: 'file-clock' },
  { type: 'Failed mandates', count: 11, amount: 43000, icon: 'refresh' },
  { type: 'Abandoned checkouts', count: 7, amount: 35000, icon: 'cart' },
];

export const chartData = [
  { day: '12 Aug', risk: 280, recovered: 92 },
  { day: '13 Aug', risk: 315, recovered: 128 },
  { day: '14 Aug', risk: 250, recovered: 106 },
  { day: '15 Aug', risk: 392, recovered: 154 },
  { day: '16 Aug', risk: 350, recovered: 198 },
  { day: '17 Aug', risk: 420, recovered: 236 },
  { day: '18 Aug', risk: 485, recovered: 164 },
];

export const funnel = [
  { label: 'Revenue at risk', value: '₹4.85L', width: '100%', color: '#4f8cff' },
  { label: 'Cases detected', value: '842', width: '82%', color: '#679cff' },
  { label: 'Cases contacted', value: '616', width: '66%', color: '#78aaff' },
  { label: 'Recovery attempts', value: '408', width: '51%', color: '#8bb7ff' },
  { label: 'Successful payments', value: '286', width: '36%', color: '#22c55e' },
  { label: 'Revenue recovered', value: '₹1.64L', width: '29%', color: '#37d36c' },
];

export const autonomyLevels = [
  { level: 1, name: 'Recommend Only', description: 'AI recommends actions. Human approves everything.', allowedActions: 'Recommendations only', color: '#f59e0b' },
  { level: 2, name: 'Safe Automation', description: 'AI can automatically execute low-risk approved actions.', allowedActions: 'Low-risk actions (WhatsApp, email, retry)', color: '#4f8cff' },
  { level: 3, name: 'Autonomous Recovery', description: 'AI can execute approved recovery playbooks automatically.', allowedActions: 'All approved playbooks (high-risk still needs approval)', color: '#22c55e' },
];

export const channelPerformance = [
  { channel: 'WhatsApp', cases: 124, recoveryRate: 48, color: '#22c55e' },
  { channel: 'Email', cases: 212, recoveryRate: 31, color: '#4f8cff' },
  { channel: 'Payment Retry', cases: 168, recoveryRate: 42, color: '#f59e0b' },
  { channel: 'Human Escalation', cases: 64, recoveryRate: 67, color: '#a855f7' },
];

export const lossAnalysis = [
  { reason: 'Expired cards', amount: 120000 },
  { reason: 'Overdue invoices', amount: 98000 },
  { reason: 'Mandate failures', amount: 72000 },
  { reason: 'Insufficient funds', amount: 64000 },
];

export const filterOptions = {
  risk: ['All', 'Critical', 'High', 'Medium', 'Low'],
  type: ['All', 'Invoice', 'Subscription', 'Checkout', 'Mandate', 'Payment'],
  amount: ['All', '₹0–10K', '₹10K–50K', '₹50K+'],
  status: ['All', 'Detected', 'In Progress', 'Awaiting Payment', 'Escalated', 'Recovered'],
  channel: ['All', 'Email', 'WhatsApp', 'SMS', 'Payment Retry'],
  confidence: ['All', '90%+', '75–90%', 'Below 75%'],
};

// AI strategy comparison for each case — shows what AI considered and why it picked the winner
export type StrategyOption = {
  action: string;
  recoveryProbability: number;
  customerFriction: 'Low' | 'Medium' | 'High';
  riskLevel: 'Low' | 'Medium' | 'High';
  selected: boolean;
};

export const strategyComparisons: Record<string, StrategyOption[]> = {
  REC_10021: [
    { action: 'Retry immediately', recoveryProbability: 52, customerFriction: 'Low', riskLevel: 'Low', selected: false },
    { action: 'Retry after 6h', recoveryProbability: 78, customerFriction: 'Low', riskLevel: 'Low', selected: false },
    { action: 'WhatsApp payment link', recoveryProbability: 96, customerFriction: 'Medium', riskLevel: 'Low', selected: true },
    { action: 'Human escalation', recoveryProbability: 41, customerFriction: 'High', riskLevel: 'Medium', selected: false },
  ],
  REC_10020: [
    { action: 'Send reminder email', recoveryProbability: 34, customerFriction: 'Low', riskLevel: 'Low', selected: false },
    { action: 'WhatsApp reminder', recoveryProbability: 52, customerFriction: 'Low', riskLevel: 'Low', selected: false },
    { action: 'Escalate + payment link', recoveryProbability: 92, customerFriction: 'Medium', riskLevel: 'High', selected: true },
    { action: 'Offer payment plan', recoveryProbability: 61, customerFriction: 'Medium', riskLevel: 'Medium', selected: false },
  ],
  REC_10019: [
    { action: 'Email reminder', recoveryProbability: 44, customerFriction: 'Low', riskLevel: 'Low', selected: false },
    { action: 'WhatsApp reminder + link', recoveryProbability: 76, customerFriction: 'Low', riskLevel: 'Low', selected: true },
    { action: 'Wait 24h then remind', recoveryProbability: 58, customerFriction: 'Low', riskLevel: 'Low', selected: false },
    { action: 'Human escalation', recoveryProbability: 31, customerFriction: 'High', riskLevel: 'Medium', selected: false },
  ],
  REC_10018: [
    { action: 'Retry now', recoveryProbability: 61, customerFriction: 'Low', riskLevel: 'Low', selected: false },
    { action: 'Retry in 6 hours', recoveryProbability: 88, customerFriction: 'Low', riskLevel: 'Low', selected: true },
    { action: 'WhatsApp reminder', recoveryProbability: 72, customerFriction: 'Low', riskLevel: 'Low', selected: false },
    { action: 'Human escalation', recoveryProbability: 54, customerFriction: 'High', riskLevel: 'Medium', selected: false },
  ],
  REC_10017: [
    { action: 'Auto-retry mandate', recoveryProbability: 38, customerFriction: 'Low', riskLevel: 'Medium', selected: false },
    { action: 'Request mandate update', recoveryProbability: 64, customerFriction: 'Medium', riskLevel: 'Low', selected: true },
    { action: 'Email instructions', recoveryProbability: 42, customerFriction: 'Low', riskLevel: 'Low', selected: false },
    { action: 'Human escalation', recoveryProbability: 51, customerFriction: 'High', riskLevel: 'Medium', selected: false },
  ],
  REC_10016: [
    { action: 'Send email follow-up', recoveryProbability: 48, customerFriction: 'Low', riskLevel: 'Low', selected: false },
    { action: 'WhatsApp + payment plan', recoveryProbability: 71, customerFriction: 'Medium', riskLevel: 'Medium', selected: true },
    { action: 'Call customer', recoveryProbability: 63, customerFriction: 'High', riskLevel: 'Medium', selected: false },
    { action: 'Escalate to collections', recoveryProbability: 44, customerFriction: 'High', riskLevel: 'High', selected: false },
  ],
};

// Recovery Score breakdown — makes the scoring transparent
export type ScoreFactor = { factor: string; points: number; max: number };

export const recoveryScores: Record<string, { score: number; factors: ScoreFactor[] }> = {
  REC_10021: { score: 96, factors: [
    { factor: 'Payment history', points: 25, max: 25 },
    { factor: 'Failure type', points: 22, max: 25 },
    { factor: 'Customer activity', points: 18, max: 20 },
    { factor: 'Amount', points: 12, max: 15 },
    { factor: 'Previous recovery', points: 10, max: 10 },
    { factor: 'Customer risk', points: 9, max: 5 },
  ] },
  REC_10020: { score: 92, factors: [
    { factor: 'Payment history', points: 23, max: 25 },
    { factor: 'Failure type', points: 18, max: 25 },
    { factor: 'Customer activity', points: 16, max: 20 },
    { factor: 'Amount', points: 14, max: 15 },
    { factor: 'Previous recovery', points: 8, max: 10 },
    { factor: 'Customer risk', points: 13, max: 5 },
  ] },
  REC_10019: { score: 76, factors: [
    { factor: 'Payment history', points: 15, max: 25 },
    { factor: 'Failure type', points: 20, max: 25 },
    { factor: 'Customer activity', points: 14, max: 20 },
    { factor: 'Amount', points: 13, max: 15 },
    { factor: 'Previous recovery', points: 7, max: 10 },
    { factor: 'Customer risk', points: 7, max: 5 },
  ] },
  REC_10018: { score: 88, factors: [
    { factor: 'Payment history', points: 24, max: 25 },
    { factor: 'Failure type', points: 20, max: 25 },
    { factor: 'Customer activity', points: 15, max: 20 },
    { factor: 'Amount', points: 12, max: 15 },
    { factor: 'Previous recovery', points: 9, max: 10 },
    { factor: 'Customer risk', points: 8, max: 5 },
  ] },
  REC_10017: { score: 64, factors: [
    { factor: 'Payment history', points: 18, max: 25 },
    { factor: 'Failure type', points: 15, max: 25 },
    { factor: 'Customer activity', points: 10, max: 20 },
    { factor: 'Amount', points: 11, max: 15 },
    { factor: 'Previous recovery', points: 5, max: 10 },
    { factor: 'Customer risk', points: 5, max: 5 },
  ] },
  REC_10016: { score: 71, factors: [
    { factor: 'Payment history', points: 20, max: 25 },
    { factor: 'Failure type', points: 17, max: 25 },
    { factor: 'Customer activity', points: 12, max: 20 },
    { factor: 'Amount', points: 13, max: 15 },
    { factor: 'Previous recovery', points: 6, max: 10 },
    { factor: 'Customer risk', points: 3, max: 5 },
  ] },
};

// Run Recovery simulation steps — shown in the animated modal
export type SimStep = {
  phase: string;
  lines: { text: string; status: 'pending' | 'done' | 'warning' }[];
};

export const simulationSteps: SimStep[] = [
  {
    phase: 'Scanning',
    lines: [{ text: 'Scanning 842 cases...', status: 'pending' }, { text: '842 cases analyzed', status: 'pending' }],
  },
  {
    phase: 'Classifying',
    lines: [
      { text: '218 payment failures', status: 'pending' },
      { text: '174 overdue invoices', status: 'pending' },
      { text: '91 mandate failures', status: 'pending' },
      { text: '63 abandoned checkouts', status: 'pending' },
    ],
  },
  {
    phase: 'Calculating recovery probability',
    lines: [
      { text: '184 high probability', status: 'pending' },
      { text: '241 medium probability', status: 'pending' },
      { text: '121 low probability', status: 'pending' },
    ],
  },
  {
    phase: 'Generating recovery plan',
    lines: [
      { text: '143 retries', status: 'pending' },
      { text: '97 payment links', status: 'pending' },
      { text: '61 reminders', status: 'pending' },
      { text: '23 escalations', status: 'pending' },
    ],
  },
  {
    phase: 'Policy validation',
    lines: [
      { text: '304 actions approved', status: 'pending' },
      { text: '23 require human approval', status: 'warning' },
    ],
  },
];

// Clickable funnel breakdowns — shows details per funnel stage
export const funnelBreakdowns: Record<number, { label: string; value: string; count?: number }[]> = {
  0: [
    { label: 'Expired card', value: '261', count: 261 },
    { label: 'Invoice overdue', value: '227', count: 227 },
    { label: 'Insufficient funds', value: '151', count: 151 },
    { label: 'Mandate failure', value: '118', count: 118 },
    { label: 'Other', value: '85', count: 85 },
  ],
  1: [
    { label: 'WhatsApp sent', value: '284' },
    { label: 'Email sent', value: '198' },
    { label: 'SMS sent', value: '89' },
    { label: 'Payment retry attempted', value: '45' },
  ],
  2: [
    { label: 'Payment retry', value: '168', count: 168 },
    { label: 'WhatsApp payment link', value: '124', count: 124 },
    { label: 'Email reminder', value: '82', count: 82 },
    { label: 'Mandate update request', value: '34', count: 34 },
  ],
  3: [
    { label: 'WhatsApp', value: '112', count: 112 },
    { label: 'Payment retry', value: '86', count: 86 },
    { label: 'Email', value: '62', count: 62 },
    { label: 'Mandate update', value: '26', count: 26 },
  ],
};

// Agent execution timeline — visual DETECT→DIAGNOSE→PREDICT→PLAN→POLICY→EXECUTE→VERIFY→RESULT flow
export type AgentStage = {
  step: string;
  label: string;
  detail: string;
  icon: string;
  status: 'done' | 'active' | 'pending';
};

export const agentExecutionTimeline: AgentStage[] = [
  { step: 'DETECT', label: 'Payment failure detected', detail: '₹12,499 at risk · CUS_1024', icon: 'alert', status: 'done' },
  { step: 'DIAGNOSE', label: 'Expired card', detail: 'Confidence 96%', icon: 'sparkles', status: 'done' },
  { step: 'PREDICT', label: 'Recovery probability', detail: '96% — based on 14 successful payments', icon: 'trending', status: 'done' },
  { step: 'PLAN', label: 'Payment update request', detail: 'WhatsApp channel selected', icon: 'zap', status: 'done' },
  { step: 'POLICY', label: 'PAYMENT_RECOVERY_01', detail: 'Approved — within retry limits', icon: 'shield', status: 'done' },
  { step: 'EXECUTE', label: 'Send payment update', detail: 'WhatsApp message sent at 17:13:04', icon: 'message', status: 'done' },
  { step: 'VERIFY', label: 'Payment successful', detail: 'Provider confirmed at 17:16:42', icon: 'check', status: 'done' },
  { step: 'RESULT', label: '₹12,499 recovered', detail: 'Case automatically closed', icon: 'dollar', status: 'done' },
];

// Customer history for case drawer
export const customerHistory: Record<string, {
  invoices: number;
  successfulPayments: number;
  avgDelayDays: string;
  previousRecovery: string;
}> = {
  REC_10021: { invoices: 9, successfulPayments: 8, avgDelayDays: '1.2 days', previousRecovery: 'Successful' },
  REC_10020: { invoices: 16, successfulPayments: 14, avgDelayDays: '3.5 days', previousRecovery: 'N/A' },
  REC_10019: { invoices: 5, successfulPayments: 4, avgDelayDays: '0.5 days', previousRecovery: 'Successful' },
  REC_10018: { invoices: 15, successfulPayments: 14, avgDelayDays: '2.1 days', previousRecovery: 'N/A' },
  REC_10017: { invoices: 8, successfulPayments: 7, avgDelayDays: '4.0 days', previousRecovery: 'N/A' },
  REC_10016: { invoices: 19, successfulPayments: 18, avgDelayDays: '1.8 days', previousRecovery: 'Successful' },
};

// Policy decision examples — shows when policy allowed or blocked AI
export type PolicyDecision = {
  policy: string;
  aiAction: string;
  decision: 'approved' | 'blocked';
  reason: string;
  caseId: string;
};

export const policyDecisions: PolicyDecision[] = [
  { policy: 'PAYMENT_RECOVERY_01', aiAction: 'Retry payment ₹12,499', decision: 'approved', reason: 'Amount < ₹50,000 and confidence > 80%', caseId: 'REC_10021' },
  { policy: 'HIGH_VALUE_REVIEW_01', aiAction: 'Auto-escalate ₹84,200 invoice', decision: 'blocked', reason: 'Amount > ₹50,000 — human approval required', caseId: 'REC_10020' },
  { policy: 'CHECKOUT_RECOVERY_01', aiAction: 'Send WhatsApp reminder', decision: 'approved', reason: 'Low risk amount and customer opted in', caseId: 'REC_10019' },
  { policy: 'PAYMENT_RECOVERY_01', aiAction: 'Retry payment ₹24,999', decision: 'approved', reason: 'Within retry limit (1/3) and confidence > 80%', caseId: 'REC_10018' },
];
