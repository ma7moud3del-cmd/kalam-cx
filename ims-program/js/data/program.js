/* =====================================================================
   PROGRAM, STRATEGY, CURRENT STATE, OPERATING MODEL, ARCHITECTURE
   ===================================================================== */
window.IMS = window.IMS || {};

IMS.program = {
  name: "IMS Enterprise Operations Transformation 2027",
  org: "Future Group · Kalam CX · IMS",
  period: "December 2026 – December 2027",
  months: 13,
  updated: "26 Nov 2026",
  reportDate: "2026-11-26", /* the "as of" date of all statuses on the site */
  start: "2026-12-01",      /* month 0 of every timeline */
  status: "Awaiting management approval (gate G0). Two initiatives in live use, operated personally; three pilots ready for approval.",
  statement: "Building a smarter, connected, measurable and sustainable operating environment for IMS.",
  message: "Transforming IMS from fragmented, manually coordinated processes into one integrated, company-owned operating environment.",
  summary: "Eight projects and seven shared capabilities that connect Supervisors, ACMs, Workforce, Quality, Finance, Onboarding, IT and management on one platform, so IMS can grow without adding headcount.",
  growth: {
    target: "20% growth with current resources",
    source: "Company target, as stated by the program lead (26 Nov 2026)",
    logic: "Growth without new headcount only works if the same team spends less time on manual work. Every project is measured by the capacity it releases and where that capacity goes: more volume, faster onboarding, better coverage and fewer errors.",
    needed: "TBM: hours of capacity needed for 20% more volume (set in Discovery from the baseline)"
  },
  vision: "Redefine the future of business communication and become the world's most trusted partner in business process outsourcing, through seamless operations and cutting-edge technology.",
  mission: "Delivering innovative, scalable and people-driven solutions that foster growth, efficiency and global connectivity.",
  imsVision: "IMS Operations moves from a team that reacts to requests to a business partner that runs its work as a measured investment.",
  values: [
    ["Empowerment", "Supervisors coach instead of chase; every role builds automation skills."],
    ["Respect & Inclusion", "Interpreters paid right and on time, with status they can see."],
    ["Customer Centric", "Sessions covered on time with proof; client requests never lost."],
    ["Innovation", "Automation does the repetitive work; people decide."],
    ["Accountability", "Every task has an owner, a deadline and a measured result."]
  ],
  fromTo: [
    ["Requests in many channels, tracked in people's heads", "Every request a case with owner, due date and history"],
    ["Reports rebuilt by hand from exports", "Reports built once from validated data"],
    ["Problems found when someone complains", "Exceptions flagged before they reach the interpreter or client"],
    ["Each department works in its own files", "One operating platform with role-based workspaces"],
    ["Tools on personal accounts and PCs", "Company-owned tools, data and accounts"],
    ["Value claimed, not measured", "Every benefit measured against a baseline"]
  ]
};

/* The five company goals (value pillars) — original wording kept */
IMS.objectives = [
  ["Revenue", "Deliver and bill more of the demand we already have", "Sessions delivered on time with proof · days to first production task"],
  ["Cost", "Fewer overpayments, less overtime, hires avoided", "Staff hours released · overpayments avoided (reported separately)"],
  ["Performance", "Faster work, fewer manual hours, on-time reports", "Reports on time and correct first time · Supervisor time on people"],
  ["People morale", "Interpreters paid right and on time; supervisors coach, not chase", "Payments correct and on time first time · payment complaints per cycle"],
  ["Quality", "Fewer repeat complaints, accurate data and billing", "Repeat complaint rate · first-time-right rate per process"]
];

/* Status taxonomy. rank = maturity (higher = further along) */
IMS.STATUS = {
  "live-company":  { label: "Live · company-owned", rank: 8, tone: "verified" },
  "live-personal": { label: "Live · personally operated", rank: 7, tone: "warn" },
  "poc":           { label: "Proof of concept complete", rank: 6, tone: "warn" },
  "pilot":         { label: "Pilot running", rank: 5, tone: "future" },
  "dev":           { label: "In development", rank: 4, tone: "future" },
  "prototype":     { label: "Prototype", rank: 3, tone: "future" },
  "approval":      { label: "Awaiting approval", rank: 2, tone: "decision" },
  "planned":       { label: "Planned", rank: 1, tone: "neutral" },
  "blocked":       { label: "Blocked", rank: 0, tone: "risk" }
};

IMS.AUTOTYPE = {
  det: ["Deterministic automation", "Same input, same output. No judgement."],
  rule: ["Rule-based workflow", "If this, then that: reminders, alerts, routing."],
  pred: ["Predictive analytics", "Forecasts and anomaly flags from history."],
  ai: ["AI-assisted", "Reads text or documents and suggests; a person checks."],
  human: ["Human decision", "Stays with a person. The system only informs."]
};

/* Metrics register: every headline number on the site comes from here */
IMS.metrics = [
  { id: "M-01", name: "Applicants submitted and confirmed first time", value: "28 / 28", unit: "applicants", period: "2 batches, 23 Nov 2026", source: "MasterWord batch reports and submission ledger", status: "measured", project: "P04" },
  { id: "M-02", name: "Automated time per applicant", value: "4.5", unit: "minutes", period: "Batch 2 (12 applicants in 54 min), 23 Nov 2026", source: "File timestamps of batch 2", status: "measured", project: "P04" },
  { id: "M-03", name: "Manual time per applicant", value: "~100", unit: "minutes", period: "Before Nov 2026", source: "Team estimate (24–32 person-hours per batch of 16)", status: "estimate", project: "P04" },
  { id: "M-04", name: "Staff capacity released", value: "~50", unit: "hours", period: "2 batches, Nov 2026", source: "Estimated manual time minus measured run and review", status: "estimate", project: "P04" },
  { id: "M-05", name: "Batch turnaround", value: "Same day", unit: "", period: "23 Nov 2026 (was 3–4 working days, team estimate)", source: "Batch reports", status: "measured", project: "P04" },
  { id: "M-06", name: "Document problems caught before submission", value: "5", unit: "issues", period: "2 batches, Nov 2026", source: "Batch reports: 4 missing documents (3 applicants), 1 wrong document", status: "measured", project: "P04" },
  { id: "M-07", name: "CVs redacted before upload", value: "28 / 28", unit: "CVs", period: "2 batches, Nov 2026", source: "Batch reports", status: "measured", project: "P04" },
  { id: "M-08", name: "Kalam Learning content live", value: "2 trainings · 30 videos (~5.3 h) · 54 test questions · 20-task exam", unit: "", period: "Nov 2026", source: "Kalam Learning site", status: "measured", project: "C4" },
  { id: "M-09", name: "Interpreters paid per month", value: "~390", unit: "interpreters", period: "October 2026", source: "October paid-hours file (123 hourly, 4 hybrid, 18 package, 247 per-minute/freelance)", status: "measured", project: "P05" },
  { id: "M-10", name: "Recurring tasks reviewed with Lean", value: "26", unit: "tasks", period: "Nov 2026", source: "Program Lean review (DOWNTIME wastes)", status: "measured", project: "ALL" },
  { id: "M-11", name: "Verified hours released (baseline validated)", value: "0", unit: "hours", period: "To date", source: "No baseline validated yet; Discovery not started", status: "measured", project: "ALL" },
  { id: "M-12", name: "Confirmed cash savings", value: "$0", unit: "", period: "To date", source: "No savings confirmed by Finance", status: "measured", project: "ALL" }
];

/* Evidence register */
IMS.evidence = [
  { id: "E-01", project: "P04", title: "Batch 1 report · Argentina, 16 applicants", img: "assets/report1.jpg", source: "MasterWord automation report (names shortened, emails hidden)", verify: "Verified against the submission ledger", date: "23 Nov 2026", flags: [["r", "4 missing documents, 3 applicants"], ["y", "8 name differences checked"], ["g", "16 / 16 submitted"]] },
  { id: "E-02", project: "P04", title: "Batch 2 report · Egypt and Pakistan, 12 applicants", img: "assets/report2.jpg", source: "MasterWord automation report (names shortened, emails hidden)", verify: "Verified against the submission ledger", date: "23 Nov 2026", flags: [["r", "Wrong document: file held 9 other people's certificates"], ["y", "Data conflicts flagged"], ["g", "12 / 12 submitted"]] },
  { id: "E-03", project: "P05", title: "Current payment cycle map", source: "Interview with the program lead", verify: "Described, not yet validated with Invoicing", date: "26 Nov 2026" },
  { id: "E-04", project: "C4", title: "Kalam Learning site", source: "Live site", verify: "Content counted on the site", date: "Nov 2026" },
  { id: "E-05", project: "ALL", title: "Lean review of 26 recurring tasks", source: "Program working papers", verify: "Classification by the program team; to confirm in Discovery", date: "Nov 2026" }
];

/* ---------------- CURRENT STATE ---------------- */
IMS.current = {
  environment: [
    ["Clients", "Multiple client accounts, each with its own services, SLAs, KPIs and rules"],
    ["Channels", "Clients reach IMS through Zoom, Microsoft Teams, Slack and email"],
    ["Systems", "Kalam platform, Incorta, Zoho, Transparent, Time Doctor, plus spreadsheets"],
    ["Reporting", "Many sources; reports rebuilt by hand from exports and client files"],
    ["Teams", "Supervisors, ACMs, Workforce, Quality, Invoicing, Onboarding, Recruitment, Training, IT"],
    ["Tracking", "Spreadsheets, chats and personal notes; few shared registers"]
  ],
  pains: [
    ["Operations", ["Repetitive administrative activities", "Manual follow-ups", "Fragmented task tracking", "Limited daily workload visibility", "Inconsistent operational handovers"], "P01"],
    ["Workforce", ["Manual report requests", "Coverage and staffing challenges", "Limited connected capacity intelligence", "Manual schedule and workforce coordination"], "P06"],
    ["Quality", ["Scattered complaint information", "Email-based follow-ups", "Limited recurring-issue analysis", "Coaching and training not linked to findings"], "P07"],
    ["Finance & Invoicing", ["Payment discrepancies", "Missing or unaccepted tasks", "Late task acceptance", "Outstanding payment concerns", "Manual reconciliation", "Issues discovered late"], "P05"],
    ["Onboarding", ["Fragmented candidate handovers", "Account assignment not visible", "Delayed production activation", "First login and first task not visible"], "P04"],
    ["Client Management", ["Communication across different platforms", "Disconnected client requests", "Manual follow-ups", "No unified account history"], "P03"]
  ],
  impact: [
    ["Lost administrative capacity", "TBM"], ["Delayed decisions", "TBM"], ["Repeated work", "TBM"], ["Higher error exposure", "TBM"],
    ["Unresolved operational issues", "TBM"], ["Delayed payments", "Up to 3–4 months in some cases (program lead)"], ["Poor visibility", "No single view today"],
    ["Client experience risk", "TBM"], ["Employee experience risk", "TBM"], ["Dependency on individuals", "All automations run on one person's accounts"]
  ],
  /* Baseline per process: [process, workflow, monthly volume, processing time, people, error rate, turnaround, cost, evidence, validated?] */
  baseline: [
    ["Client portal submission (MasterWord)", "Find files, redact CV, type form, upload 7 documents, fix gaps", "TBM (28 applicants in Nov 2026)", "~100 min per applicant (estimate)", "1 person 3–4 days or 4 people 1 shift per batch", "Not measured before", "3–4 working days per batch (estimate)", "TBM", "Team estimate + batch reports", "partial"],
    ["Interpreter payment", "WFM report → ACM validation → Transparent tasks → acceptance → transfer", "~390 interpreters", "TBM", "WFM, ACMs, Invoicing, Supervisors", "TBM", "Day 15 paid; problems to day 20 or next month", "TBM", "Process interview 26 Nov 2026", "partial"],
    ["Onboarding to first task", "14 hand-over steps across 5 teams", "TBM", "TBM", "Recruitment, Training, Onboarding, Supervisors, WFM", "TBM (never-start rate)", "TBM", "TBM", "None yet", "open"],
    ["IMS reporting", "Exports → spreadsheets → reports → email", "TBM", "TBM", "TBM", "TBM (reissued reports)", "TBM", "TBM", "None yet", "open"],
    ["Supervisor day", "Requests, follow-ups, admin, coaching", "TBM", "TBM", "All Supervisors", "—", "—", "TBM", "None yet", "open"],
    ["Client requests", "Received in client channels, tracked personally", "TBM", "TBM", "ACMs, Supervisors", "TBM (missed requests)", "TBM", "TBM", "None yet", "open"],
    ["Quality findings", "Email → Supervisor → coaching", "TBM", "TBM", "Quality, Supervisors", "TBM (repeat rate)", "TBM", "TBM", "None yet", "open"],
    ["Coverage and staffing", "Schedules, logins and demand in separate files", "TBM", "TBM", "WFM", "TBM", "TBM", "TBM", "None yet", "open"]
  ],
  waste: [["Extra-processing", 14], ["Waiting", 13], ["Defects (errors)", 13], ["Motion (searching)", 8], ["Unused talent", 6], ["Moving files", 4], ["Overproduction", 1], ["Work piling up", 1]]
};

/* ---------------- OPERATING MODEL ---------------- */
IMS.roles = [
  { id: "sup", name: "Supervisor", sees: ["Personal Game Plan", "Team performance", "Quality cases", "Client requests", "Interpreter activity", "Coaching", "Onboarding", "Payment concerns", "Outstanding actions"], fed: ["P01", "P03", "P04", "P05", "P07"] },
  { id: "acm", name: "ACM", sees: ["Assigned client performance", "Supervisor activities", "Account risks", "Coverage", "Quality", "Payment issues", "Client follow-ups"], fed: ["P01", "P03", "P05", "P06", "P07"] },
  { id: "wfm", name: "Workforce", sees: ["Demand", "Capacity", "Coverage", "Schedules", "Staffing risks", "Performance"], fed: ["P06", "P02"] },
  { id: "qa", name: "Quality", sees: ["Complaints", "Trends", "Root causes", "Corrective actions", "Training effectiveness"], fed: ["P07"] },
  { id: "fin", name: "Finance & Invoicing", sees: ["Payment reconciliation", "Validation", "Approvals", "Discrepancies", "Outstanding balances"], fed: ["P05"] },
  { id: "onb", name: "Onboarding", sees: ["Requisitions", "Candidate pipeline", "Assignment", "Onboarding sessions", "Production activation"], fed: ["P04"] },
  { id: "mgmt", name: "Management", sees: ["Cross-functional performance", "Financial value", "Risks", "Project progress", "Strategic decisions"], fed: ["P08", "P02"] }
];

/* Example journeys across departments, shown on the operating model */
IMS.journeys = [
  { name: "A client request", steps: [["Client", "Sends a request in their own channel"], ["ACM", "Logs it; owner and due date set"], ["Supervisor", "Acts; updates the case"], ["Platform", "Reminds before due; escalates if late"], ["ACM", "Confirms closure with the client"]] },
  { name: "A new interpreter", steps: [["WFM", "Coverage gap opens a requisition"], ["Recruitment / Training", "Candidate passes training and assessment"], ["Onboarding", "Account and Supervisor allocated"], ["Platform", "Detects first login and first task"], ["Supervisor", "Alerted if no task after N days"]] },
  { name: "A payment cycle", steps: [["WFM", "Payment report and expected task list"], ["ACM", "Approves exceptions only"], ["Invoicing", "Uploads tasks; day 7 check runs"], ["Platform", "Flags missing, wrong, unaccepted"], ["Finance", "Approves payment; cases tracked"]] },
  { name: "A quality finding", steps: [["Quality", "Logs and classifies the finding"], ["Platform", "Notifies the Supervisor with a due date"], ["Supervisor", "Coaches or books refresher training"], ["Quality", "Follow-up evaluation"], ["Management", "Sees repeat-issue trend"]] }
];

/* Process library: diagrams used in chapter 04 and project pages */
IMS.flows = {
  supervisor: { name: "Supervisor daily planning", steps: ["Open the Game Plan", "Recurring items pre-filled", "Plan intervals: coaching, follow-ups, admin", "Work the plan; alerts arrive", "Record planned vs actual", "ACM reviews the team view"] },
  reporting: { name: "Reporting", steps: ["Scheduled data pull", "Validation checks", "Report generated", "Owner sign-off (new reports)", "Scheduled distribution", "History stored for trends"] },
  client: { name: "Client request management", steps: ["Request in client's channel", "Logged as a case", "Owner and due date", "Action and update", "Reminder / escalation", "Closed and confirmed"] },
  onboarding: { name: "Onboarding", steps: ["Requisition", "Recruit, train, assess", "Allocate account + Supervisor", "Onboarding session + system test", "Zoho, account DB, platform access", "First login", "First task", "Production confirmed"] },
  payment: { name: "Payment reconciliation", steps: ["Paid-hours report", "Expected task list", "ACM approves exceptions", "Tasks uploaded", "Day 7 check vs export", "Acceptance reminders", "Finance approves", "Paid; cases tracked"] },
  quality: { name: "Quality improvement", steps: ["Quality finding", "Classification", "Root cause", "Supervisor notified", "Coaching or training", "Follow-up evaluation", "Improvement measured"] },
  workforce: { name: "Workforce planning", steps: ["Demand by client and interval", "Capacity and schedules", "Gap / over / under detection", "Alert to WFM", "VTO or staffing decision", "Adherence tracked"] }
};

/* ---------------- TECHNOLOGY ---------------- */
/* Integration register. Nothing here is verified until the status says so. */
IMS.systems = [
  { id: "kalam", name: "Kalam platform", purpose: "Interpreting sessions, interpreters, logins and activity", data: "Sessions, minutes, logins, interpreter profiles", owner: "Kalam / IT (to confirm)", method: "Data exports used by the dashboard prototype", api: "Export endpoints documented; company access not set up", auth: "Personal login today; service account needed", status: "partial", risk: "Prototype depends on one person's login" },
  { id: "incorta", name: "Incorta", purpose: "Reporting and analytics source", data: "Operational and performance data", owner: "IT / BI (to confirm)", method: "To be assessed", api: "Not verified", auth: "Not verified", status: "open", risk: "Unknown export or API options" },
  { id: "zoho", name: "Zoho", purpose: "Recruitment, onboarding and assignment records", data: "Candidates, stages, assignments", owner: "Recruitment / Onboarding (to confirm)", method: "To be assessed", api: "Not verified", auth: "Not verified", status: "open", risk: "Records also kept in sheets" },
  { id: "transparent", name: "Transparent", purpose: "Interpreter payment tasks and acceptance", data: "Tasks, amounts, acceptance status", owner: "Invoicing / Finance", method: "Task export requested (issue I-07)", api: "Not verified", auth: "Not verified", status: "open", risk: "Payment pilot needs at least the export" },
  { id: "timedoctor", name: "Time Doctor", purpose: "Time tracking and productivity", data: "Hours, idle time, activity", owner: "To confirm", method: "To be assessed", api: "Not verified", auth: "Not verified", status: "open", risk: "Employee data: privacy review needed" },
  { id: "zoom", name: "Zoom", purpose: "Client communication and meetings", data: "Meetings, chats (where clients use Zoom)", owner: "IT / client", method: "Assessment (P03.10)", api: "Not verified", auth: "Not verified", status: "open", risk: "Client consent required" },
  { id: "teams", name: "Microsoft Teams", purpose: "Client and internal communication", data: "Channels, meetings, messages", owner: "IT / client", method: "Assessment (P03.11)", api: "Not verified", auth: "Not verified", status: "open", risk: "Client consent required" },
  { id: "slack", name: "Slack", purpose: "Client communication", data: "Channels and messages", owner: "Client", method: "Assessment (P03.12)", api: "Not verified", auth: "Not verified", status: "open", risk: "Client consent required" },
  { id: "email", name: "Email", purpose: "Requests, reports, complaints", data: "Messages and attachments", owner: "IT", method: "Assessment (P03.13)", api: "Not verified", auth: "Not verified", status: "open", risk: "Mailbox access and retention rules" },
  { id: "sheets", name: "Spreadsheets & files", purpose: "Current manual tracking and reports", data: "Paid-hours files, trackers, schedules", owner: "Each team", method: "File drop to a shared drive", api: "n/a", auth: "Company drive", status: "partial", risk: "Formats change by hand" },
  { id: "accountdb", name: "Account database", purpose: "Interpreter-account assignments", data: "Account allocations", owner: "Onboarding (to confirm)", method: "To be assessed", api: "Not verified", auth: "Not verified", status: "open", risk: "Location and format to confirm" },
  { id: "datadb", name: "Central data platform", purpose: "Proposed shared data model", data: "All validated program data", owner: "IT", method: "To be built", api: "n/a", auth: "Company sign-in", status: "open", risk: "Needs IT hosting decision" },
  { id: "portals", name: "Client portals (e.g. MasterWord)", purpose: "Applicant submission to clients", data: "Applicant forms and documents", owner: "Client", method: "Browser automation on the public portal", api: "No API used", auth: "Portal access", status: "verified", risk: "Portal changes can break the automation" }
];

IMS.layers = [
  ["Security & governance", "Role-based access, audit logs, data ownership, retention, continuity", "side"],
  ["Role-based workspaces", "Supervisor · ACM · Workforce · Quality · Finance · Onboarding · Management"],
  ["Reporting & intelligence", "Reporting hub, executive dashboard, alerts, AI-assisted questions"],
  ["Automation & workflow engine", "Tasks, rules, notifications, agents, approvals"],
  ["Central data platform", "One data model, validated and historical"],
  ["Integration layer", "Exports, APIs, file drops, service accounts"],
  ["Existing operational systems", "Kalam · Incorta · Zoho · Transparent · Time Doctor · Zoom · Teams · Slack · Email · Sheets"]
];

/* Technology options: initial assessment, to validate with IT. 1 = weak, 3 = strong */
IMS.tech = {
  criteria: ["Cost", "Scalability", "Security", "Maintainability", "Integration", "Low vendor dependency", "Company ownership"],
  options: [
    ["Microsoft Power Platform (Power Apps + Power Automate)", [2, 2, 3, 3, 2, 1, 3], "Strong if Future Group already uses Microsoft 365 and Entra sign-in (to confirm with IT). Low-code, so more people can maintain it. Limits on complex logic and licence cost per user."],
    ["Power BI", [2, 3, 3, 3, 2, 1, 3], "Good fit for reporting and the executive dashboard. Needs a clean data model underneath."],
    ["Azure (data, functions, hosting)", [2, 3, 3, 2, 3, 1, 3], "Company-owned hosting and database for the data platform and custom services."],
    ["Python services", [3, 2, 2, 2, 3, 3, 2], "Already used by the dashboard prototype and the MasterWord tools. Needs company hosting and more than one maintainer."],
    ["Custom web application", [2, 3, 2, 1, 3, 3, 2], "Most flexible for workspaces (for example Session Desk). Highest build and maintenance effort."],
    ["Enterprise workflow platform (BPM suite)", [1, 3, 3, 2, 2, 1, 2], "Powerful but expensive; likely more than IMS needs at this stage."],
    ["Hybrid (recommended for assessment)", [2, 3, 3, 2, 3, 2, 3], "Microsoft tools where they fit (sign-in, Power BI, simple flows) plus Python services for integrations and agents, all on company hosting."]
  ],
  note: "Scores are an initial view by the program team, not a decision. IT validates options in the Architecture stage (gate: Architecture Approved)."
};

IMS.security = [
  ["Role-based access", "Each role sees only its clients, teams and data"],
  ["Data ownership", "A named data owner for every source"],
  ["Authentication", "Company sign-in for every user and service account; no personal logins"],
  ["Audit logs", "Every change to payment, quality and onboarding records logged"],
  ["Financial data protection", "Payment data limited to Finance, Invoicing and approvers"],
  ["Employee data protection", "Time Doctor and performance data reviewed with HR and legal before use"],
  ["Client confidentiality", "Client data stays within that account's team; consent before channel integration"],
  ["Retention", "Retention periods agreed per data type"],
  ["Business continuity", "Every automation has a runbook and a trained backup operator"],
  ["Disaster recovery", "Backups and restore tested on company infrastructure"]
];

IMS.aiGov = {
  principles: [
    "A basic automated workflow is never called AI.",
    "AI suggests; people decide on anything that affects pay, employment, clients or quality outcomes.",
    "AI only uses approved data, and shows the source behind every answer.",
    "Any AI on calls, audio or personal data needs separate technical, legal, privacy and management approval.",
    "Every AI use has an owner, a log and a way to switch it off."
  ],
  where: [
    ["Client portal submission agent (MasterWord)", "ai", "Reads documents, matches files, fills forms; a person reviews the report"],
    ["Complaint classification suggestions", "ai", "Suggests a category; Quality confirms"],
    ["AI-assisted data questions", "ai", "Answers from approved data with sources"],
    ["Demand forecasting", "pred", "Forecast per client and interval"],
    ["Payment anomaly flags", "pred", "Flags unusual amounts for review"],
    ["Reminders, alerts, escalations", "rule", "Rules, not AI"],
    ["Upload checks and reconciliation", "det", "Exact comparison, not AI"],
    ["Payment approval, hiring, coaching outcomes", "human", "Always a person"]
  ]
};
