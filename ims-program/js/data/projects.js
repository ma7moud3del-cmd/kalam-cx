/* =====================================================================
   IMS Enterprise Operations Transformation 2027 — PROJECT REGISTER
   One record per project. Every count, status and summary on the site
   is calculated from this file, so edit here and nowhere else.

   Initiative status codes (see STATUS in program.js):
   live-company · live-personal · poc · prototype · pilot · dev ·
   approval · planned · blocked
   Automation type codes: det (deterministic) · rule (rule-based
   workflow) · pred (predictive analytics) · ai (AI-assisted) ·
   human (stays a human decision)
   "TBM" = To Be Measured. Nothing marked TBM may be shown as a fact.
   ===================================================================== */
window.IMS = window.IMS || {};

IMS.projects = [
/* ------------------------------------------------------------------ */
{
  id: "P01", pain: "Supervisor day consumed by follow-ups and admin; ACMs cannot see plans.", name: "Supervisor & ACM Productivity Management", short: "Supervisor & ACM productivity",
  objective: "Give every Supervisor a planned, visible day and every ACM a clear view of what their Supervisors planned and completed.",
  outcome: "More Supervisor time on coaching and people, less on chasing and admin.",
  depts: ["Operations", "Account Management"], lead: "Operations",
  owner: "To be named (Operations)", ownerStatus: "to-name",
  pillars: ["Performance", "People morale", "Quality"],
  stage: "Awaiting approval as Pilot A",
  problem: "Supervisors spend much of the day on follow-ups, admin and requests that arrive through many channels. Their day is not planned in one place, so coaching and development slip, and ACMs cannot see what was planned or done without asking.",
  current: ["Requests arrive by chat, email and calls", "Supervisor keeps personal notes or spreadsheets", "Coaching fitted in when time allows", "ACM asks for updates by message", "Productivity read from Time Doctor exports by hand"],
  future: ["Supervisor builds the Daily Game Plan by interval", "Tasks, coaching and client follow-ups in one workspace", "Planned vs actual recorded automatically", "ACM sees team plans and gaps live", "Time Doctor signals turned into alerts and trends"],
  flow: "supervisor",
  requirements: [
    "Personal workspace per Supervisor with tasks, meetings, coaching and follow-ups",
    "Daily Game Plan split into intervals (for example 30 or 60 minutes) with planned activity types",
    "Activity types based on actual IMS work: team huddles, coaching, development sessions, quality follow-ups, client follow-ups, onboarding sessions, payment concerns, admin",
    "Planned vs actual capture at the end of each interval or day",
    "ACM workspace showing assigned Supervisors' plans, completion and overdue items",
    "Time Doctor signals: idle time, missing hours, productivity trend per person (after API validation)",
    "Weekly productivity summary per Supervisor and per ACM team",
    "Recommendations are suggestions only; the Supervisor decides"
  ],
  automation: [
    ["Pre-fill the day with recurring meetings, open tasks and due follow-ups", "rule"],
    ["Carry unfinished items to the next day with a flag", "det"],
    ["Idle-time and missing-hours alerts from Time Doctor thresholds", "rule"],
    ["Planned vs actual variance per day and week", "det"],
    ["Personal productivity suggestions from patterns (for example coaching keeps slipping on Mondays)", "ai"],
    ["Whether a person is coached, warned or praised", "human"]
  ],
  systems: ["timedoctor", "zoho", "sheets", "teams", "slack", "email"],
  controls: ["Supervisor owns and edits their own plan", "ACM reviews; does not edit the Supervisor's plan", "Productivity alerts go to the Supervisor first, not straight to management", "No disciplinary action from an automated signal without human review"],
  deliverables: ["Daily Game Plan template and activity catalogue", "Supervisor workspace (pilot)", "ACM workspace (pilot)", "Productivity alert rules", "Weekly productivity report", "Pilot A results report"],
  deps: ["C1", "C2", "P02"], depText: "Needs the shared task engine and notifications, and Time Doctor access for productivity signals.",
  risks: ["R-08", "R-09", "R-03"],
  kpis: [
    ["Supervisor time on coaching and development", "Hours per Supervisor per week", "TBM"],
    ["Plan completion", "Planned activities completed / planned", "TBM"],
    ["Follow-ups closed on time", "Client and team follow-ups closed by due date", "TBM"],
    ["Admin time per Supervisor", "Hours per week on reports, chasing, manual tracking", "TBM"]
  ],
  baseline: "Time-diary for 2 weeks with 5 Supervisors plus Time Doctor history for the same weeks.",
  value: { operational: ["More planned coaching time", "ACMs see team activity without asking", "Earlier warning on missing hours"], financial: ["TBM: Supervisor hours redirected (capacity, not cash)"] },
  roi: { volume: "TBM (Supervisors × working days)", cur: "TBM", next: "TBM", review: "~10 min a day to plan (target)", impl: "TBM", recur: "TBM", hours: "TBM", capacity: "TBM", savings: "None claimed", roi: "TBM", payback: "TBM" },
  initiatives: [
    ["P01.1", "Supervisor Personal Workspace", "planned"],
    ["P01.2", "Daily Game Plan", "approval", "Pilot A"],
    ["P01.3", "Interval-Based Activity Planning", "approval", "Pilot A"],
    ["P01.4", "Planned vs. Actual Activity Tracking", "approval", "Pilot A"],
    ["P01.5", "Coaching and Development Scheduling", "planned"],
    ["P01.6", "Client Follow-up Management", "planned"],
    ["P01.7", "Daily Task Management", "planned"],
    ["P01.8", "Supervisor Workload Visibility", "planned"],
    ["P01.9", "ACM Management Workspace", "planned"],
    ["P01.10", "Time Doctor Productivity Intelligence", "planned", "Time Doctor API not yet verified"],
    ["P01.11", "Idle Time Alerts", "planned"],
    ["P01.12", "Missing Hours Alerts", "planned"],
    ["P01.13", "Productivity Trends", "planned"],
    ["P01.14", "Personal Productivity Recommendations", "planned"],
    ["P01.15", "Management Productivity Reporting", "planned"]
  ],
  note: "The Daily Game Plan borrows the planning concept used in Teleperformance CCMS (a structured, interval-based Supervisor day). It is designed around IMS responsibilities; it does not assume IMS uses call-listening processes."
},
/* ------------------------------------------------------------------ */
{
  id: "P02", pain: "Reports rebuilt by hand from many exports; numbers do not always agree.", name: "Centralized Reporting & Business Intelligence", short: "Reporting & BI",
  objective: "One reporting hub that builds, checks and sends IMS reports automatically from approved sources.",
  outcome: "Reports on time, built once, with numbers that agree.",
  depts: ["Operations", "Management", "IT"], lead: "Operations",
  owner: "Mahmoud Adel (prototype builder) · business owner to be named", ownerStatus: "to-name",
  pillars: ["Performance", "Revenue", "Cost"],
  stage: "Prototype on a personal PC; waiting on IT for hosting since Oct 2026",
  problem: "Reports are rebuilt by hand from many exports and client files. The same number can differ between reports, and nobody is alerted when source data is missing.",
  current: ["Download exports from each system", "Copy into spreadsheets", "Fix formats and missing rows by hand", "Build each client and IMS report", "Email the files"],
  future: ["Scheduled pull from approved sources", "Validation flags missing or odd data", "Reports generated from one data model", "Role-based views (YTD, YOY, MOM, WOW)", "Scheduled distribution with history kept"],
  flow: "reporting",
  requirements: [
    "Reporting hub with one data model for IMS metrics",
    "Connection to Incorta and other approved sources (method to be validated with IT)",
    "Automated IMS performance report (existing prototype moved to company hosting)",
    "Client report consolidation where clients send their own files",
    "Missing-data and outlier checks before any report is sent",
    "Historical storage to allow YTD, YOY, MOM and WOW comparisons",
    "Role-based access: Supervisor, ACM, WFM, Quality, Finance, Management",
    "Scheduled distribution with a send log"
  ],
  automation: [
    ["Scheduled data pull and refresh", "det"],
    ["Missing-data and row-count checks", "rule"],
    ["Report generation and distribution", "det"],
    ["Trend and variance highlights", "det"],
    ["Anomaly flags on unusual movements", "pred"],
    ["Interpretation and actions from the report", "human"]
  ],
  systems: ["incorta", "kalam", "sheets", "email", "datadb"],
  controls: ["Report owner signs off a new report definition before it is automated", "Validation failures stop distribution and alert the owner", "Access by role; client data only to that client's team"],
  deliverables: ["Report catalogue with owners and definitions", "Data model and validation rules", "IMS performance report on company hosting", "Reporting hub (role-based)", "Distribution schedule and log"],
  deps: ["F-DATA", "IT"], depText: "Depends on company hosting, a database, sign-in and service accounts for each source. Everything in P08 depends on this project.",
  risks: ["R-04", "R-05", "R-06"],
  kpis: [
    ["Report build time", "Hours per week spent building reports", "TBM"],
    ["On-time reports", "Reports sent by the agreed time / total", "TBM"],
    ["Reports needing correction", "Reports reissued after sending", "TBM"],
    ["Source data gaps caught before sending", "Validation flags per month", "TBM"]
  ],
  baseline: "Report catalogue with time per report from the people who build them (2-week log).",
  value: { operational: ["Reports on time without manual work", "Numbers agree across reports", "History available for trend questions"], financial: ["TBM: reporting hours released (capacity, not cash)"] },
  roi: { volume: "TBM (reports per month)", cur: "TBM", next: "Automatic refresh", review: "TBM", impl: "TBM (IT hosting estimate)", recur: "TBM", hours: "TBM", capacity: "TBM", savings: "None claimed", roi: "TBM", payback: "TBM" },
  initiatives: [
    ["P02.1", "Reporting Hub", "planned"],
    ["P02.2", "Client Report Consolidation", "planned"],
    ["P02.3", "IMS Performance Report Automation", "prototype", "Python pipeline on a personal PC; production plan waiting on IT"],
    ["P02.4", "Incorta Integration", "planned", "Integration method not yet verified"],
    ["P02.5", "Automated Report Generation", "planned"],
    ["P02.6", "Scheduled Report Distribution", "planned"],
    ["P02.7", "Missing Data Detection", "planned"],
    ["P02.8", "Reporting Validation", "planned"],
    ["P02.9", "Historical Reporting", "planned"],
    ["P02.10", "YTD, YOY, MOM, WOW Analysis", "planned"],
    ["P02.11", "Role-Based Reporting", "planned"],
    ["P02.12", "Management Reporting", "planned"]
  ]
},
/* ------------------------------------------------------------------ */
{
  id: "P03", pain: "Client requests spread across Zoom, Teams, Slack and email; items missed.", name: "Client Communication & Account Operations", short: "Client operations",
  objective: "One operational layer for every client request, decision and follow-up, whatever channel the client uses.",
  outcome: "No client request lost; every account has an owner and a history.",
  depts: ["Account Management", "Operations"], lead: "Account Management",
  owner: "To be named (Account Management)", ownerStatus: "to-name",
  pillars: ["Revenue", "Quality", "Performance"],
  stage: "Planned",
  problem: "Clients reach IMS through Zoom, Microsoft Teams, Slack and email. Requests, decisions and follow-ups sit in those channels and in people's memory, so items are missed and account history is lost when people change.",
  current: ["Client writes in their own channel", "Whoever sees it acts or forwards it", "Decisions stay in chats or meeting notes", "Follow-ups tracked personally", "History lost when owners change"],
  future: ["Client keeps their approved channel", "Request logged as a case with owner and due date", "Meeting decisions and actions recorded", "Escalation rules by account", "Full account history in one place"],
  flow: "client",
  requirements: [
    "Client workspace per account: contacts, owner, services, SLAs, rules",
    "Request register with owner, due date, status and channel of origin",
    "Meeting decisions and action items linked to the account",
    "Escalation paths and timers per client",
    "Communication history across channels",
    "Channel assessments for Zoom, Teams, Slack and email before any integration",
    "Clients are never asked to change channel"
  ],
  automation: [
    ["Log a request from a forwarded message or email", "det"],
    ["Due-date reminders and escalation timers", "rule"],
    ["Weekly open-items summary per account", "det"],
    ["Suggest a category and owner for new requests", "ai"],
    ["What to promise or decide with the client", "human"]
  ],
  systems: ["zoom", "teams", "slack", "email", "sheets"],
  controls: ["Account owner confirms every closed request", "Client consent recorded before connecting to any client channel", "Client data visible only to that account's team and management"],
  deliverables: ["Client information repository", "Request and action register", "Escalation matrix per client", "Channel integration assessments (4)", "Client workspace (pilot)"],
  deps: ["C1", "C2", "P02"], depText: "Uses the shared task engine and notifications. Channel integrations need IT and client approval.",
  risks: ["R-07", "R-10", "R-04"],
  kpis: [
    ["Requests closed within SLA", "Closed on time / total", "TBM"],
    ["Requests without an owner", "Open requests with no owner", "TBM"],
    ["Repeat client escalations", "Escalations on the same topic in 90 days", "TBM"]
  ],
  baseline: "4-week log of client requests per channel (count, owner, time to close).",
  value: { operational: ["Requests not lost", "Faster answers to clients", "Account history kept when people change"], financial: ["TBM: client retention and growth (not claimed until measured)"] },
  roi: { volume: "TBM (requests per month)", cur: "TBM", next: "TBM", review: "TBM", impl: "TBM", recur: "TBM", hours: "TBM", capacity: "TBM", savings: "None claimed", roi: "TBM", payback: "TBM" },
  initiatives: [
    ["P03.1", "Client Workspace", "planned"],
    ["P03.2", "Client Information Repository", "planned"],
    ["P03.3", "Account Ownership", "planned"],
    ["P03.4", "Client Request Management", "planned"],
    ["P03.5", "Action Item Tracking", "planned"],
    ["P03.6", "Meeting Decisions", "planned"],
    ["P03.7", "Follow-up Management", "planned"],
    ["P03.8", "Escalation Management", "planned"],
    ["P03.9", "Communication History", "planned"],
    ["P03.10", "Zoom Integration Assessment", "planned"],
    ["P03.11", "Microsoft Teams Integration Assessment", "planned"],
    ["P03.12", "Slack Integration Assessment", "planned"],
    ["P03.13", "Email Integration Assessment", "planned"]
  ]
},
/* ------------------------------------------------------------------ */
{
  id: "P04", pain: "Hand-overs by message and spreadsheet; drop-outs found late.", name: "Onboarding & Interpreter Lifecycle Management", short: "Onboarding & lifecycle",
  objective: "Track every interpreter from requisition to first production task, with no silent drop-outs.",
  outcome: "Shorter time to first task and fewer interpreters who never start.",
  depts: ["Onboarding", "Recruitment", "Training", "Operations", "Workforce Management"], lead: "Onboarding",
  owner: "To be named (Onboarding)", ownerStatus: "to-name",
  pillars: ["Revenue", "Cost", "Performance"],
  stage: "One initiative live (personally operated); Pilot C awaiting approval",
  problem: "Hand-overs between recruitment, training, onboarding and Supervisors happen by message and spreadsheet. Nobody sees in one place whether a new interpreter logged in or took a first task, so some never start and it is found late.",
  current: ["Requisition opened from coverage gaps", "Candidate passes training and assessment", "Account and Supervisor set by message", "Set-up entered in several systems", "\"Has the interpreter started?\" asked by message", "Drop-outs found late"],
  future: ["Each step recorded once in the pipeline", "Supervisor notified automatically", "Checklist and system tests tracked", "First login and first task detected", "Inactivity alert after N days", "Activation SLA reported"],
  flow: "onboarding",
  lifecycle: ["Requisition opened", "Candidate recruited", "Training completed", "Assessment completed", "Account allocated", "Supervisor notified", "Onboarding session scheduled", "System testing completed", "Zoho assignment updated", "Account database updated", "Platform access confirmed", "First login detected", "First task or session completed", "Production activation confirmed"],
  requirements: [
    "Candidate pipeline covering the 14 lifecycle steps",
    "Assignment tracking, including interpreters shared by more than one Supervisor",
    "Onboarding checklist per account",
    "Automatic notifications at each hand-over",
    "First login and first task detection from platform data",
    "Delayed-activation and inactive-candidate alerts",
    "Activation SLA per account and complete hand-over history",
    "Client portal submissions (for example MasterWord) run by the automation agent"
  ],
  automation: [
    ["Client portal applicant submission with document checks (MasterWord)", "ai"],
    ["CV redaction before upload", "det"],
    ["Hand-over notifications between teams", "rule"],
    ["First login / first task detection", "det"],
    ["Inactivity and SLA alerts", "rule"],
    ["Hiring and account allocation decisions", "human"]
  ],
  systems: ["zoho", "kalam", "accountdb", "sheets", "email", "portals"],
  controls: ["Recruitment and Onboarding approve each candidate move", "Agent submissions reviewed by a person from the batch report", "Personal data redacted before any upload; access by role"],
  deliverables: ["Lifecycle definition with owners per step", "Candidate pipeline (pilot)", "Activation alerts and SLA report", "MasterWord automation handed over to a company account", "Pilot C results report"],
  deps: ["C1", "C2", "P06"], depText: "Needs Zoho and platform login data; coverage gaps come from Workforce Management (P06).",
  risks: ["R-01", "R-02", "R-04", "R-11"],
  kpis: [
    ["Days from training completed to first task", "Median days", "TBM"],
    ["Interpreters who never start", "% of onboarded with no task after 30 days", "TBM"],
    ["Hand-overs on time", "Steps completed within target days", "TBM"],
    ["Client portal submission time", "Minutes per applicant", "4.5 min measured (MasterWord batch 2)"]
  ],
  baseline: "6 months of onboarding records from Zoho, sheets and platform logins.",
  value: { operational: ["Same-day client portal submissions", "Drop-outs caught early", "One view of every candidate"], financial: ["TBM: revenue from earlier production starts (not claimed until measured)", "~50 staff hours released on 2 MasterWord batches (capacity, estimate-based)"] },
  roi: { volume: "28 applicants in 2 batches (Nov 2026); monthly volume TBM", cur: "~100 min per applicant (team estimate)", next: "4.5 min per applicant (measured)", review: "Batch report review, minutes per batch", impl: "Built in-house; time not costed", recur: "AI usage per batch: TBM (personal account today)", hours: "~50 h on 2 batches (estimate-based)", capacity: "~50 h (capacity, not cash)", savings: "None claimed", roi: "TBM", payback: "TBM" },
  initiatives: [
    ["P04.1", "Candidate Pipeline", "planned"],
    ["P04.2", "Assignment Tracking", "planned"],
    ["P04.3", "Client Portal Applicant Submission (MasterWord)", "live-personal", "Runs on a personal PC and AI account"],
    ["P04.4", "Multiple Supervisor Support", "planned"],
    ["P04.5", "Onboarding Checklists", "planned"],
    ["P04.6", "Automated Notifications", "planned"],
    ["P04.7", "Delayed Activation Alerts", "approval", "Pilot C"],
    ["P04.8", "First Login Tracking", "approval", "Pilot C"],
    ["P04.9", "First Task Tracking", "approval", "Pilot C"],
    ["P04.10", "Inactive Candidate Alerts", "approval", "Pilot C"],
    ["P04.11", "Activation SLA", "planned"],
    ["P04.12", "Complete Handover History", "planned"]
  ]
},
/* ------------------------------------------------------------------ */
{
  id: "P05", pain: "Payment errors found only when interpreters complain; concerns not tracked.", name: "Payment, Invoicing & Financial Control Center", short: "Payment control center",
  objective: "Catch missing tasks, wrong amounts and unpaid balances before the interpreter has to complain.",
  outcome: "Interpreters paid right and on time; every concern tracked to closure.",
  depts: ["Finance & Invoicing", "Workforce Management", "Account Management", "Operations"], lead: "Finance & Invoicing",
  owner: "Invoicing team (to confirm)", ownerStatus: "to-confirm",
  pillars: ["People morale", "Cost", "Revenue"],
  stage: "Current process mapped (26 Nov 2026); Pilot B awaiting approval",
  problem: "About 390 interpreters are paid each month (Oct 2026 paid-hours file). Missing Transparent tasks, wrong amounts, late acceptance and eCash cases are usually found only when the interpreter complains. Fixes go back and forth by message and nothing is tracked, so an interpreter can stay unpaid for 3–4 months unnoticed.",
  current: ["Day 4–5: WFM builds the payment report; ACMs validate", "Day 7: Invoicing uploads one Transparent task per client per interpreter", "Interpreter must accept each task by the deadline", "Day 12: transfer; day 15: money arrives", "Problems move to day 20 or next month, by message"],
  future: ["Expected task list sent with the report", "Day 7 upload check against the Transparent export", "Acceptance reminders; Supervisors see who has not accepted", "eCash planned before transfer", "Every concern is a case with owner and deadline", "Aging alert for anyone unpaid one cycle"],
  flow: "payment",
  lifecycle: ["Calculated", "Validated", "Approved", "Submitted", "Processed", "Paid"],
  requirements: [
    "Payment control center per cycle with status per interpreter × client",
    "Transparent integration assessment (export first, API only if verified)",
    "Task acceptance and late-acceptance tracking",
    "Missing-task and duplicate-task detection against the expected list",
    "Payment calculation validation plus an independent second-level check",
    "Separate amounts for calculated, validated, approved, submitted, processed and actually paid",
    "Outstanding balance and aging reports",
    "Payment concern cases with owner, deadline and history",
    "Interpreter-facing payment status (read-only)",
    "Finance escalations and discrepancy alerts",
    "Payment data visible only to authorised roles"
  ],
  automation: [
    ["Build the expected task list from the paid-hours report", "det"],
    ["Compare expected vs uploaded tasks (missing, duplicate, wrong amount)", "det"],
    ["Acceptance reminders before the deadline", "rule"],
    ["Aging and discrepancy alerts", "rule"],
    ["Flag unusual payment patterns", "pred"],
    ["Payment approval and exception decisions", "human"]
  ],
  systems: ["transparent", "sheets", "kalam", "email"],
  controls: ["ACMs approve exceptions", "Invoicing / Finance approve payment", "Second-level validation by someone who did not prepare the report", "Read-only pilot first: no payment changes made by the system", "Role-based access to payment data; audit log of every change"],
  deliverables: ["Payment lifecycle and status definitions", "Expected task list template", "Day 7 reconciliation check (pilot, read-only)", "Concern case log and aging report", "Pilot B results report with acceptance decision"],
  deps: ["F-DATA", "P02", "C2"], depText: "Needs the Transparent task export, the paid-hours report each cycle and agreed validation rules from Finance.",
  risks: ["R-12", "R-13", "R-04", "R-14"],
  kpis: [
    ["Paid correctly first time", "% of interpreter payments with no correction", "TBM"],
    ["Day an error is found", "Days after month close", "Today: often only on complaint (up to 3–4 months)"],
    ["Late acceptances", "Tasks accepted after deadline per cycle", "TBM"],
    ["Unpaid balances older than 1 cycle", "Count and amount", "TBM"],
    ["Payment complaints per cycle", "Count", "TBM"]
  ],
  baseline: "Last 3 payment cycles: paid-hours files, Transparent exports and complaint messages.",
  value: { operational: ["Errors found on day 7 instead of on complaint", "Concerns tracked to closure", "Interpreters see their payment status"], financial: ["TBM: overpayments avoided (cost avoided, reported separately)", "TBM: retention of interpreters lost to payment problems"] },
  roi: { volume: "~390 interpreters per month (Oct 2026)", cur: "TBM (hours on corrections per cycle)", next: "TBM", review: "Exceptions only", impl: "TBM", recur: "TBM", hours: "TBM", capacity: "TBM", savings: "None claimed", roi: "TBM", payback: "TBM" },
  initiatives: [
    ["P05.1", "Payment Control Center", "planned"],
    ["P05.2", "Transparent Integration Assessment", "planned", "Export requested; API not verified"],
    ["P05.3", "Task Acceptance Tracking", "approval", "Pilot B"],
    ["P05.4", "Late Acceptance Detection", "approval", "Pilot B"],
    ["P05.5", "Missing Task Detection", "approval", "Pilot B"],
    ["P05.6", "Duplicate Task Detection", "approval", "Pilot B"],
    ["P05.7", "Payment Calculation Validation", "planned"],
    ["P05.8", "Independent Second-Level Validation", "planned"],
    ["P05.9", "Payment Reconciliation", "approval", "Pilot B"],
    ["P05.10", "Payment Status Tracking", "planned"],
    ["P05.11", "Outstanding Balance Tracking", "approval", "Pilot B"],
    ["P05.12", "Historical Payment Issues", "planned"],
    ["P05.13", "Payment Concern Case Management", "planned"],
    ["P05.14", "Payment Aging Reports", "planned"],
    ["P05.15", "Interpreter Payment Visibility", "planned"],
    ["P05.16", "Finance Escalations", "planned"],
    ["P05.17", "Payment Discrepancy Alerts", "planned"]
  ]
},
/* ------------------------------------------------------------------ */
{
  id: "P06", pain: "Coverage checked after the fact; client rules differ; VTO decided by hand.", name: "Workforce Management & Operational Intelligence", short: "Workforce intelligence",
  objective: "Match coverage to demand in real time, with client-specific rules and early alerts.",
  outcome: "Fewer coverage gaps, less over- and under-staffing, sessions covered with proof.",
  depts: ["Workforce Management", "Operations", "Account Management"], lead: "Workforce Management",
  owner: "To be named (Workforce Management)", ownerStatus: "to-name",
  pillars: ["Revenue", "Cost", "Performance"],
  stage: "One prototype (Session Desk); rest planned",
  problem: "Coverage, attendance and adherence are checked from separate reports, often after the fact. Each client has its own KPIs and rules, so one generic view does not work, and VTO and staffing decisions are made by hand.",
  current: ["Demand and schedules in separate files", "Attendance and logins checked by hand", "Coverage gaps seen after they happen", "VTO decided case by case", "Client KPIs tracked in different sheets"],
  future: ["Live view of demand vs capacity per client", "Gap, over- and under-staffing alerts", "Adherence and login tracking automatic", "VTO suggestions with a human decision", "Client-specific KPI rules"],
  flow: "workforce",
  requirements: [
    "Real-time operations monitor per client and language",
    "Capacity vs demand with gap, over-staffing and under-staffing detection",
    "Occupancy, attendance, adherence, login and logout tracking",
    "Shift analysis and VTO planning",
    "Client-specific KPI targets and rules (no single universal definition)",
    "Pre-scheduled session management: load, accept, assign and prove sessions (Session Desk)",
    "Automated operational alerts to the right role"
  ],
  automation: [
    ["Refresh demand, capacity and logins", "det"],
    ["Coverage gap and staffing alerts", "rule"],
    ["Demand forecast by client and interval", "pred"],
    ["VTO suggestions", "pred"],
    ["Staffing and VTO decisions", "human"]
  ],
  systems: ["kalam", "timedoctor", "incorta", "sheets", "datadb"],
  controls: ["WFM approves VTO and schedule changes", "Client permission before any automated session acceptance", "Client KPI rules signed off by the account owner"],
  deliverables: ["Client KPI rulebook", "Operations monitor (pilot)", "Staffing alert rules", "Session Desk on company hosting (if approved)", "Capacity and demand report"],
  deps: ["P02", "F-DATA", "C2"], depText: "Depends on reliable login, schedule and demand data through the reporting platform (P02).",
  risks: ["R-04", "R-07", "R-05"],
  kpis: [
    ["Coverage gap hours", "Hours below required coverage per week", "TBM"],
    ["Schedule adherence", "% per team", "TBM"],
    ["Sessions covered on time with proof", "% of pre-scheduled sessions", "TBM"],
    ["Over-staffed hours", "Hours above need per week", "TBM"]
  ],
  baseline: "4 weeks of demand, schedule, login and session data per client.",
  value: { operational: ["Gaps seen before they happen", "Faster VTO decisions", "Proof of covered sessions"], financial: ["TBM: overtime and idle cost avoided", "TBM: revenue from sessions covered"] },
  roi: { volume: "TBM (sessions and intervals per month)", cur: "TBM", next: "TBM", review: "TBM", impl: "TBM", recur: "TBM", hours: "TBM", capacity: "TBM", savings: "None claimed", roi: "TBM", payback: "TBM" },
  initiatives: [
    ["P06.1", "Real-Time Operations Monitoring", "planned"],
    ["P06.2", "Workforce Performance Reporting", "planned"],
    ["P06.3", "Capacity and Demand Analysis", "planned"],
    ["P06.4", "Coverage Gap Detection", "planned"],
    ["P06.5", "Overstaffing Detection", "planned"],
    ["P06.6", "Understaffing Detection", "planned"],
    ["P06.7", "Occupancy Monitoring", "planned"],
    ["P06.8", "Attendance Monitoring", "planned"],
    ["P06.9", "Schedule Adherence", "planned"],
    ["P06.10", "Login and Logout Tracking", "planned"],
    ["P06.11", "Shift Analysis", "planned"],
    ["P06.12", "VTO Planning", "planned"],
    ["P06.13", "Capacity Optimization", "planned"],
    ["P06.14", "Client-Specific KPI Management", "planned"],
    ["P06.15", "Automated Operational Alerts", "planned"],
    ["P06.16", "Pre-Scheduled Session Management (Session Desk)", "prototype", "Free hosting tier; client permission needed for auto-accept"]
  ]
},
/* ------------------------------------------------------------------ */
{
  id: "P07", pain: "Complaints scattered; repeat issues not spotted; coaching not linked to findings.", name: "Quality, Complaints & Continuous Improvement Intelligence", short: "Quality intelligence",
  objective: "Turn every quality finding and complaint into a tracked improvement, from root cause to measured result.",
  outcome: "Fewer repeat complaints; coaching and training proven to work.",
  depts: ["Quality", "Operations", "Training", "Account Management"], lead: "Quality",
  owner: "To be named (Quality)", ownerStatus: "to-name",
  pillars: ["Quality", "Revenue", "People morale"],
  stage: "Planned",
  problem: "Complaints and quality findings arrive by email and chat and sit in different places. Follow-ups are by email, recurring issues are hard to spot, and coaching and training are not linked to the finding, so nobody can show whether they worked.",
  current: ["Complaint arrives by email or chat", "Forwarded to a Supervisor", "Coaching done, not recorded in one place", "Same issue returns weeks later", "No trend view by interpreter, language or client"],
  future: ["Finding logged and classified", "Severity and root cause recorded", "Supervisor notified with a due date", "Coaching or refresher training scheduled", "Follow-up evaluation", "Improvement measured; repeats flagged"],
  flow: "quality",
  cycle: ["Quality finding", "Classification", "Root cause", "Supervisor notification", "Coaching or training", "Follow-up evaluation", "Improvement measurement"],
  requirements: [
    "Central repository for complaints, client feedback and quality findings",
    "Standard classification and severity scale",
    "Root cause analysis fields and corrective action tracking",
    "Trend views by interpreter, language and client",
    "Recurring complaint detection and quality alerts",
    "Link to coaching sessions (P01) and refresher training (C4)",
    "Training effectiveness and repeat-issue monitoring (for example no repeat in 90 days)"
  ],
  automation: [
    ["Log findings from forwarded emails into the repository", "det"],
    ["Notify the Supervisor with a due date; escalate if overdue", "rule"],
    ["Detect repeats of the same issue for the same interpreter or client", "rule"],
    ["Suggest a classification from the complaint text", "ai"],
    ["Root cause conclusion, coaching content and any action on a person", "human"]
  ],
  systems: ["email", "sheets", "zoho", "datadb"],
  controls: ["Quality confirms classification and severity", "Supervisor records coaching; Quality closes the case", "Any AI use on calls, audio or personal data needs separate technical, legal, privacy and management approval", "Call recordings are not assumed to be available"],
  deliverables: ["Classification and severity standard", "Quality repository (pilot)", "Corrective action log", "Trend and repeat-issue report", "Training effectiveness method"],
  deps: ["C1", "C2", "C4", "P01"], depText: "Needs a standard complaint repository first; uses the task engine, notifications, Kalam Learning and Supervisor coaching from P01.",
  risks: ["R-10", "R-15", "R-09"],
  kpis: [
    ["Repeat complaint rate", "Same issue, same interpreter within 90 days", "TBM"],
    ["Time to close a finding", "Days from log to closure", "TBM"],
    ["Findings with root cause recorded", "% of closed findings", "TBM"],
    ["Training effectiveness", "Findings after training vs before", "TBM"]
  ],
  baseline: "3 months of complaints and findings collected from email and files, then classified.",
  value: { operational: ["Repeat issues spotted early", "Coaching linked to evidence", "Client confidence in quality"], financial: ["TBM: client credits or penalties avoided (if any apply)"] },
  roi: { volume: "TBM (findings per month)", cur: "TBM", next: "TBM", review: "TBM", impl: "TBM", recur: "TBM", hours: "TBM", capacity: "TBM", savings: "None claimed", roi: "TBM", payback: "TBM" },
  initiatives: [
    ["P07.1", "Centralized Quality Repository", "planned"],
    ["P07.2", "Complaint Management", "planned"],
    ["P07.3", "Client Feedback Tracking", "planned"],
    ["P07.4", "Quality Finding Classification", "planned"],
    ["P07.5", "Severity Classification", "planned"],
    ["P07.6", "Root Cause Analysis", "planned"],
    ["P07.7", "Interpreter-Level Trend Analysis", "planned"],
    ["P07.8", "Language-Level Trend Analysis", "planned"],
    ["P07.9", "Client-Level Trend Analysis", "planned"],
    ["P07.10", "Recurring Complaint Detection", "planned"],
    ["P07.11", "Quality Alerts", "planned"],
    ["P07.12", "Coaching Integration", "planned"],
    ["P07.13", "Development Session Scheduling", "planned"],
    ["P07.14", "Targeted Refresher Training", "planned"],
    ["P07.15", "Training Effectiveness Tracking", "planned"],
    ["P07.16", "Repeat Issue Monitoring", "planned"],
    ["P07.17", "Corrective Action Tracking", "planned"]
  ]
},
/* ------------------------------------------------------------------ */
{
  id: "P08", pain: "No single management view; cross-functional risks seen late.", name: "Management Intelligence & Executive Performance", short: "Management intelligence",
  objective: "One management view that connects clients, languages, workforce, quality, payment, onboarding and the program itself.",
  outcome: "Decisions made from one trusted picture, with alerts on what needs attention.",
  depts: ["Management", "Operations", "IT"], lead: "Management",
  owner: "To be named (Executive sponsor's office)", ownerStatus: "to-name",
  pillars: ["Performance", "Quality", "Revenue"],
  stage: "Planned (depends on P02)",
  problem: "Management has no single view across IMS. Each department reports separately, in different formats and at different times, so cross-functional risks are seen late.",
  current: ["Separate reports from each team", "Numbers reconciled in meetings", "Risks raised by message", "Program benefits not tracked"],
  future: ["Executive dashboard from the shared data model", "Drill-down by client, language, team", "Executive alerts on thresholds", "Automation benefits tracked by category", "AI-assisted questions on approved data"],
  flow: "reporting",
  requirements: [
    "Executive dashboard fed only by validated data from P02",
    "Client, language, workforce, quality, payment-risk and onboarding views",
    "Supervisor and ACM productivity summary (from P01)",
    "Automation benefits by category, never combined into one figure",
    "Executive alerts with thresholds agreed by management",
    "AI-assisted data questions limited to approved data, with sources shown",
    "Decision log linked to the evidence"
  ],
  automation: [
    ["Dashboard refresh from the data platform", "det"],
    ["Threshold alerts to management", "rule"],
    ["Trend forecasts on key measures", "pred"],
    ["Answer questions about the data in plain language (with sources)", "ai"],
    ["Strategic decisions", "human"]
  ],
  systems: ["datadb", "incorta", "teams", "email"],
  controls: ["Management agrees each KPI definition", "Every figure shows its source and date", "AI answers show the underlying data; no decisions made by AI"],
  deliverables: ["Executive KPI set and definitions", "Executive dashboard", "Alert thresholds", "Benefits tracker", "Monthly management pack"],
  deps: ["P02", "P01", "P05", "P06", "P07", "F-DATA"], depText: "Cannot be built before the data platform and reporting (P02). Pulls from every other project.",
  risks: ["R-05", "R-06", "R-16"],
  kpis: [
    ["Time to prepare the management pack", "Hours per month", "TBM"],
    ["Decisions taken with dashboard evidence", "% of steering decisions", "TBM"],
    ["Alerts acted on within target", "% of executive alerts", "TBM"]
  ],
  baseline: "Inventory of current management reports, their sources and preparation time.",
  value: { operational: ["One trusted picture", "Risks seen early", "Program value visible"], financial: ["TBM: preparation time released (capacity, not cash)"] },
  roi: { volume: "TBM (reports and packs per month)", cur: "TBM", next: "TBM", review: "TBM", impl: "TBM", recur: "TBM", hours: "TBM", capacity: "TBM", savings: "None claimed", roi: "TBM", payback: "TBM" },
  initiatives: [
    ["P08.1", "Executive Dashboard", "planned"],
    ["P08.2", "Client Performance Intelligence", "planned"],
    ["P08.3", "Language Performance Intelligence", "planned"],
    ["P08.4", "Workforce Performance", "planned"],
    ["P08.5", "Quality Intelligence", "planned"],
    ["P08.6", "Payment Risk Monitoring", "planned"],
    ["P08.7", "Onboarding Performance", "planned"],
    ["P08.8", "Supervisor and ACM Productivity", "planned"],
    ["P08.9", "Automation Benefits", "planned"],
    ["P08.10", "Executive Alerts", "planned"],
    ["P08.11", "AI-Assisted Data Queries", "planned"],
    ["P08.12", "Management Decision Support", "planned"]
  ]
}
];

/* Shared platform capabilities used by several projects */
IMS.capabilities = [
  { id: "C1", name: "Enterprise Task Management", what: "One task engine: every request, follow-up and action has an owner, due date and status.", usedBy: ["P01", "P03", "P04", "P07"], initiatives: [["C1.1", "Shared task engine", "planned"]] },
  { id: "C2", name: "Centralized Notification Engine", what: "One place that sends reminders, alerts and escalations by the channel each role uses.", usedBy: ["P01", "P03", "P04", "P05", "P06", "P07"], initiatives: [["C2.1", "Notification and escalation rules", "planned"]] },
  { id: "C3", name: "Employee & Interpreter Self-Service", what: "Interpreters and staff see their own status (payment, onboarding, training) and raise requests.", usedBy: ["P04", "P05"], initiatives: [["C3.1", "Self-service portal", "planned"]] },
  { id: "C4", name: "Knowledge Management & Learning", what: "Training content, tests and know-how in one place. Kalam Learning is the first part.", usedBy: ["P04", "P07"], initiatives: [["C4.1", "Kalam Learning (self-paced training site)", "live-personal", "Public site on a personal account; no sign-in yet"], ["C4.2", "Company sign-in and progress per person", "planned"]] },
  { id: "C5", name: "SOP Repository", what: "Approved procedures with owners and versions, linked from every workspace.", usedBy: ["P01", "P05", "P07"], initiatives: [["C5.1", "SOP library", "planned"]] },
  { id: "C6", name: "Development & Performance Management", what: "IMS competency framework (draft, in the KALAM Way format) linked to evidence from the workspaces.", usedBy: ["P01", "P07"], initiatives: [["C6.1", "IMS competency framework (draft to validate with HR)", "planned"]] },
  { id: "C7", name: "Audit & Compliance Management", what: "Audit logs, access reviews and retention rules across all modules.", usedBy: ["P05", "P07", "P08"], initiatives: [["C7.1", "Audit log and access reviews", "planned"]] }
];

/* ------------------------------------------------------------------
   PROJECT DETAIL: scope, data, stakeholders and KPI sources.
   Merged into each project record below, so the project register
   above stays the only place a project is defined.
   kpiSrc lines up with each project's kpis list (same order).
   Exclusions are the program team's proposal; owners confirm at G2.
   ------------------------------------------------------------------ */
IMS.projectDetail = {
  P01: {
    scopeIn: ["Supervisor workspace and Daily Game Plan", "ACM workspace with team plans and completion", "Time Doctor productivity signals, after API and privacy validation", "Weekly productivity reporting"],
    scopeOut: ["Changing Time Doctor settings or the employee monitoring policy", "Disciplinary decisions (always a person's decision)", "Interpreter scheduling and coverage (P06)", "Quality evaluations (P07)"],
    data: ["Supervisor roster and ACM reporting lines (source to confirm: HR or Zoho)", "Recurring meetings and calendars (Teams, email)", "Open tasks and follow-ups (shared task engine, C1)", "Time Doctor activity: hours, idle time (TBC: API access and privacy review)", "Client follow-up list (Account Management)"],
    stakeholders: ["Supervisors (users)", "ACMs (reviewers)", "Operations head", "HR (privacy review of productivity data)", "IT (Time Doctor access)"],
    kpiSrc: ["2-week time diary in Discovery, then Daily Game Plan records", "Daily Game Plan: planned vs completed activities", "Task engine (C1): due date vs closed date", "2-week time diary in Discovery"]
  },
  P02: {
    scopeIn: ["Catalogue of IMS reports with owner, frequency and recipients", "Automated pulls from approved sources", "Validation checks before a report is sent", "Scheduled distribution", "Company hosting of the reporting hub"],
    scopeOut: ["Replacing Incorta or Kalam", "Client billing figures until Finance validates them", "The executive dashboard itself (P08)"],
    data: ["Kalam session and task exports (endpoints partly verified)", "Incorta reports (access TBC)", "Client report templates and recipient lists", "Data dictionary for shared measures (owner per measure)"],
    stakeholders: ["Report owners in Operations", "ACMs and clients (recipients)", "Management", "IT (hosting, database, sign-in)", "Data owners for Kalam and Incorta"],
    kpiSrc: ["Time diary of report builders in Discovery", "Distribution log of the reporting hub", "Reissue log kept by report owners", "Validation log of the reporting hub"]
  },
  P03: {
    scopeIn: ["Client workspace and account record", "Request, action and decision tracking with owner and due date", "Escalation management", "Assessment of Zoom, Teams, Slack and email integration"],
    scopeOut: ["Changing how clients choose to contact IMS", "Contract and pricing changes", "Session delivery and coverage (P06)"],
    data: ["Client list with account owner (Account Management)", "Requests and decisions from client channels (method TBC per channel)", "Escalation history (today in chats and email)", "Meeting notes and action items"],
    stakeholders: ["ACMs and account owners", "Supervisors (who act on requests)", "Clients (consent for any channel automation)", "IT (channel access)", "Operations head"],
    kpiSrc: ["Request log in the client workspace (after go-live); sample of chat history in Discovery", "Client workspace open-request report", "Escalation log"]
  },
  P04: {
    scopeIn: ["Candidate pipeline from requisition to first task", "Onboarding checklists and hand-overs", "Activation alerts: first login, first task, inactive candidates", "Client portal submission (MasterWord), moved to company ownership"],
    scopeOut: ["Recruitment sourcing and interview decisions", "Interpreter pay rates", "Training content itself (C4)"],
    data: ["Candidate and onboarding records (Zoho, sheets)", "Kalam account creation, first login and first task dates", "Account database (login status)", "Client portal requirements and submission ledger"],
    stakeholders: ["Recruitment and Onboarding team", "Training", "Supervisors (receiving new interpreters)", "Workforce Management (coverage needs)", "IT (account database access)"],
    kpiSrc: ["Kalam first-task date vs training completion date", "Kalam task history 30 days after onboarding", "Onboarding checklist timestamps", "Batch report timestamps (measured on batch 2)"]
  },
  P05: {
    scopeIn: ["Expected task list per interpreter and client", "Day 7 upload check against Transparent", "Acceptance tracking and reminders", "Concern cases with owner and deadline", "Unpaid balance aging alerts"],
    scopeOut: ["Making or changing any payment (the pilot is read-only)", "Changing pay rates or contracts", "Client invoicing (possible later scope, MO-01)"],
    data: ["Monthly paid-hours report (WFM)", "Transparent task export (method TBC)", "Interpreter payment method, including eCash cases (Invoicing)", "Payment concerns raised by interpreters (today by message)"],
    stakeholders: ["Invoicing team", "Finance (approval and validation)", "Workforce Management (paid-hours report)", "ACMs and Supervisors (validation, reminders)", "Interpreters"],
    kpiSrc: ["Correction log in the concern cases; replay of the last 3 cycles", "Concern case open date vs month close", "Transparent acceptance dates vs deadline", "Aging report from the payment status tracker", "Concern case log"]
  },
  P06: {
    scopeIn: ["Real-time coverage view against demand", "Coverage gap, over- and under-staffing alerts", "Schedule adherence and attendance", "Client-specific rules", "Pre-scheduled sessions (Session Desk)"],
    scopeOut: ["Changing employment contracts or shift policy", "Automatic acceptance of client sessions without client consent", "Payroll (P05 covers interpreter payment)"],
    data: ["Kalam session and interval data", "Schedules and shifts (source TBC)", "Time Doctor login and activity (TBC)", "Client-specific coverage rules (Workforce Management)", "Pre-scheduled session requests (client platforms)"],
    stakeholders: ["Workforce Management", "Supervisors", "ACMs (client rules)", "Clients (consent for session automation)", "IT"],
    kpiSrc: ["Kalam interval data vs required coverage", "Schedule vs login data", "Session Desk log (pilot) and client confirmations", "Kalam interval data vs required coverage"]
  },
  P07: {
    scopeIn: ["One quality repository for findings and complaints", "Classification and severity standard", "Root cause and corrective action tracking", "Links to coaching (P01) and refresher training (C4)"],
    scopeOut: ["Changing the quality evaluation form", "AI analysis of call audio (needs separate approval, R-15)", "Disciplinary decisions"],
    data: ["Complaints and client feedback (email, sheets)", "Quality evaluation results (source TBC)", "Interpreter, language and client for each finding", "Coaching and training records (P01, C4)"],
    stakeholders: ["Quality team", "Supervisors (coaching)", "Training", "ACMs (client feedback)", "Interpreters"],
    kpiSrc: ["Quality repository: same issue, same interpreter within 90 days", "Quality repository: log date vs closure date", "Quality repository: closed findings with root cause", "Quality repository vs Kalam Learning completion"]
  },
  P08: {
    scopeIn: ["Executive dashboard fed by P02 data", "Executive alerts", "Program and automation benefits view", "Decision support for the steering committee"],
    scopeOut: ["Building new data sources (each project owns its data)", "Financial statements (Finance systems)", "AI answers on data without a validated source"],
    data: ["Validated measures from P02 and the data platform", "Program register, risks and decisions (this site's data)", "Benefits confirmed by Finance", "Alert thresholds set by each project owner"],
    stakeholders: ["Executive sponsor and steering committee", "Department heads", "Finance (benefit confirmation)", "IT and data owners"],
    kpiSrc: ["Time diary of management-pack preparation in Discovery", "Steering decision log", "Alert log"]
  }
};
IMS.projects.forEach(p => Object.assign(p, IMS.projectDetail[p.id] || {}));

/* Foundations: shared prerequisites that are not projects */
IMS.foundations = [
  { id: "F-DATA", name: "Data platform", what: "Company database and validated data model that the reporting, payment and workforce projects read from.", owner: "IT (to confirm)", gate: "G3" },
  { id: "IT", name: "IT hosting and sign-in", what: "Company hosting, single sign-on and service accounts for every production system.", owner: "IT (to confirm)", gate: "G3" }
];
/* Capability owners are not appointed yet */
IMS.capabilities.forEach(c => { if (!c.owner) c.owner = "To be assigned"; });
