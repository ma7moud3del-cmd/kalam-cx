/* =====================================================================
   ROADMAP, GOVERNANCE, RISKS, RESULTS, BENEFITS, COSTS, DECISIONS
   ===================================================================== */
window.IMS = window.IMS || {};

/* Month index: 0 = Dec 2026 … 12 = Dec 2027 */
IMS.months = ["Dec 26", "Jan 27", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec 27"];

IMS.phases = [
  ["Discovery", 0, 2.5], ["Process mapping", 0, 2.5], ["Baseline measurement", 1, 2], ["Business requirements", 2, 2],
  ["Architecture", 2, 3], ["Technical feasibility", 3, 2], ["Pilot development", 4, 2], ["Pilot validation", 6, 3],
  ["Controlled rollout", 9, 2], ["Enterprise expansion", 11, 2, "Continues into 2028"], ["Continuous improvement", 9, 4]
];

/* [label, start, length, project, kind, note]  kind: run | pilot | build | plan | gate */
IMS.roadmap = [
  ["Program approval and sponsor", 0, 1, "ALL", "gate", "G0"],
  ["MasterWord automation (live, personally operated)", 0, 4, "P04", "run", "Company handover: D-04", "running"],
  ["Kalam Learning (live, personally operated)", 0, 4, "C4", "run", "Company sign-in planned", "running"],
  ["Payment baseline: last 3 cycles", 1, 2, "P05", "plan", "Discovery"],
  ["Reporting on company hosting", 2, 3, "P02", "build", "Needs IT"],
  ["Pilot A · Daily Game Plan", 4, 3, "P01", "pilot", "8–12 weeks"],
  ["Pilot B · Payment (read-only)", 4, 3.5, "P05", "pilot", "3 live cycles"],
  ["Pilot C · Onboarding activation", 4, 3.5, "P04", "pilot", "8–12 weeks"],
  ["Session Desk pilot", 4, 3, "P06", "pilot", "Needs client OK"],
  ["Demand vs resources: data discovery", 1, 2, "P09", "plan", "Stage 1"],
  ["Director dashboard (first version)", 3, 3, "P09", "build", "Stages 2–3"],
  ["Quality repository design", 5, 3, "P07", "plan", "Requirements"],
  ["Reporting hub build", 5, 5, "P02", "build", ""],
  ["Roll out validated pilots", 9, 4, "ALL", "run", "Per project"],
  ["Workforce monitor", 8, 4, "P06", "build", ""],
  ["Quality pilot", 9, 3, "P07", "pilot", ""],
  ["Client workspace pilot", 9, 3, "P03", "pilot", ""],
  ["Executive dashboard", 9, 4, "P08", "build", "After P02"]
];

IMS.gates = [
  ["G0", "Program approved", "Dec 2026", "Sponsor named; Discovery and tools funded"],
  ["G1", "Discovery complete", "Feb 2027", "Processes mapped; baseline measured for every project in scope"],
  ["G2", "Requirements approved", "Mar 2027", "Process owners sign the requirements and KPIs"],
  ["G3", "Architecture approved", "Apr 2027", "IT approves hosting, data, sign-in and integrations"],
  ["G4", "Prototype complete", "May 2027", "Working prototype tested with users"],
  ["G5", "Pilot approved", "May 2027", "Owner, data access, company accounts, backup operator, acceptance criteria"],
  ["G6", "Pilot validated", "Aug 2027", "Pilot measured against baseline for at least 4 weeks"],
  ["G7", "Rollout approved", "Sep 2027", "Go, change or stop decision logged"],
  ["G8", "Benefits confirmed", "Dec 2027", "Finance confirms the value categories; control plan and SOP in place"]
];
/* Month offset of each gate from IMS.program.start (validated against the date text above) */
IMS.gateAt = { G0: 0, G1: 2, G2: 3, G3: 4, G4: 5, G5: 5, G6: 8, G7: 9, G8: 12 };
/* Gate progress per project for gates G1–G8: 2 = passed, 1 = partly, 0 = not yet */
IMS.gateProgress = {
  P01: [0, 0, 0, 0, 0, 0, 0, 0],
  P02: [0, 0, 0, 1, 0, 0, 0, 0],
  P03: [0, 0, 0, 0, 0, 0, 0, 0],
  P04: [1, 0, 0, 1, 0, 0, 0, 0],
  P05: [1, 0, 0, 0, 0, 0, 0, 0],
  P06: [0, 0, 0, 1, 0, 0, 0, 0],
  P07: [0, 0, 0, 0, 0, 0, 0, 0],
  P08: [0, 0, 0, 0, 0, 0, 0, 0],
  P09: [0, 0, 0, 0, 0, 0, 0, 0]
};
IMS.gateNotes = {
  P02: "Prototype exists for the IMS performance report only.",
  P04: "Process partly mapped; MasterWord prototype complete and in live use.",
  P05: "Current payment cycle mapped (26 Nov 2026); baseline not measured.",
  P06: "Session Desk prototype only."
};

IMS.governance = [
  ["Executive Sponsor", "To be named by management", "Owns the program; removes blockers; approves budget and gates"],
  ["Steering Committee", "Sponsor, Operations head, IT, Finance, Quality, Workforce", "Monthly review; go / change / stop at each gate"],
  ["Program Manager", "Mahmoud Adel (proposed)", "Plan, tracker, dashboard, Lean method, benefits reporting"],
  ["Project Owners", "One per project, to be named", "Deliver the project; own its KPIs"],
  ["Departmental Process Owners", "To be named per process", "Sign requirements; adopt the new process"],
  ["IT & Architecture", "IT (to confirm)", "Hosting, data platform, sign-in, integrations, security"],
  ["Data Owners", "One per source system", "Approve access; own data quality"],
  ["Finance representative", "To be named", "Payment rules, cost and benefit validation"],
  ["Quality representative", "To be named", "Quality standards and P07"],
  ["Workforce representative", "To be named", "WFM data and P06"]
];

IMS.raci = {
  roles: ["Sponsor", "Steering", "Program Mgr", "Project Owner", "Process Owner", "IT", "Data Owner", "Finance"],
  rows: [
    ["Approve program and budget", "A", "C", "R", "I", "I", "C", "I", "C"],
    ["Discovery and baseline", "I", "A", "R", "R", "C", "C", "C", "C"],
    ["Requirements", "I", "I", "C", "A", "R", "C", "C", "I"],
    ["Architecture and integrations", "I", "C", "C", "C", "I", "A", "R", "I"],
    ["Build and automate", "I", "I", "A", "R", "C", "R", "C", "I"],
    ["Pilot run and results", "I", "A", "R", "R", "C", "C", "I", "C"],
    ["Payment rule changes", "I", "C", "C", "R", "C", "I", "C", "A"],
    ["Benefits confirmation", "A", "C", "R", "C", "I", "I", "I", "R"],
    ["Monthly management review", "A", "R", "R", "C", "I", "I", "I", "C"]
  ]
};

IMS.rhythm = [
  ["Weekly", "Project owners", "Update the register: status, stage, next step, blockers"],
  ["Every 2 weeks", "Program manager + owners", "Pilot stand-up and blockers"],
  ["Monthly", "Steering committee", "Progress, results vs baseline, decisions"],
  ["Each gate", "Sponsor + steering", "Go, change or stop, logged in the decision log"],
  ["Quarterly", "Management", "Benefits report per company goal"]
];

/* Risk register. Impact / probability are initial ratings by the program team. */
IMS.risks = [
  { id: "R-01", cat: "Continuity", text: "Automations run on one person's personal accounts and PC", impact: "H", prob: "H", owner: "Sponsor + IT", mit: "Company AI account, repository, machine and trained backup operator", issue: "I-01" },
  { id: "R-02", cat: "Financial", text: "AI subscription and credits paid personally; no company budget", impact: "M", prob: "H", owner: "Sponsor + Finance", mit: "Company plan and API budget with a monthly cap", issue: "I-02" },
  { id: "R-03", cat: "Adoption", text: "Supervisors see the Game Plan as monitoring, not support", impact: "M", prob: "M", owner: "Project owner P01", mit: "Co-design with Supervisors; alerts go to them first", issue: "" },
  { id: "R-04", cat: "Integration", text: "Source system access or APIs not available as assumed", impact: "H", prob: "M", owner: "IT", mit: "Validate each integration before design; export-first fallback", issue: "" },
  { id: "R-05", cat: "Technical", text: "Data inconsistent across sources", impact: "H", prob: "M", owner: "Data owners", mit: "Validation rules and data owner per source", issue: "" },
  { id: "R-06", cat: "Technical", text: "IT hosting decision keeps slipping", impact: "H", prob: "M", owner: "Sponsor + IT", mit: "Hosting decision at gate G3 with a date", issue: "I-03" },
  { id: "R-07", cat: "Operational", text: "Clients do not consent to platform or channel automation", impact: "M", prob: "M", owner: "Account Management", mit: "Written consent per client; manual fallback", issue: "I-04" },
  { id: "R-08", cat: "Privacy", text: "Productivity data (Time Doctor) used without employee-data review", impact: "H", prob: "L", owner: "HR + legal", mit: "Privacy review before P01.10–P01.13", issue: "" },
  { id: "R-09", cat: "Operational", text: "No project or process owners named", impact: "H", prob: "H", owner: "Sponsor", mit: "Owners named at gate G0 / G2", issue: "" },
  { id: "R-10", cat: "Adoption", text: "Teams keep working in old channels and sheets", impact: "M", prob: "M", owner: "Process owners", mit: "Champions, training in Kalam Learning, old trackers retired", issue: "" },
  { id: "R-11", cat: "Operational", text: "Applicant documents missing or wrong", impact: "L", prob: "M", owner: "Onboarding", mit: "Agent flags gaps before submission; request documents", issue: "I-05" },
  { id: "R-12", cat: "Financial", text: "Payment errors found only when interpreters complain", impact: "H", prob: "H", owner: "Finance / Invoicing", mit: "Pilot B day 7 check", issue: "I-07" },
  { id: "R-13", cat: "Operational", text: "Unpaid interpreters not tracked; they leave", impact: "H", prob: "M", owner: "Finance / Invoicing", mit: "Aging alert after one unpaid cycle", issue: "I-08" },
  { id: "R-14", cat: "Privacy", text: "Payment data seen by roles that should not see it", impact: "H", prob: "L", owner: "Finance + IT", mit: "Role-based access and audit log", issue: "" },
  { id: "R-15", cat: "Privacy", text: "AI applied to calls, audio or personal data without approval", impact: "H", prob: "L", owner: "Steering", mit: "Separate technical, legal, privacy and management approval", issue: "" },
  { id: "R-16", cat: "Operational", text: "No measured baseline; benefits cannot be proven", impact: "H", prob: "H", owner: "Program manager", mit: "6-week Discovery measures every process in scope", issue: "I-06" },
  { id: "R-17", cat: "Technical", text: "Demand not visible for some clients and read as zero demand", impact: "H", prob: "H", owner: "Workforce Management + ACMs", mit: "Flag as 'Demand Visibility Gap'; agree source or reporting per client", issue: "I-09" },
  { id: "R-18", cat: "Operational", text: "Interpreters reassigned on dashboard data without eligibility, contract or schedule checks", impact: "H", prob: "M", owner: "Operations", mit: "Checks required before any reassignment; human decision only", issue: "" }
];

/* Mitigation status per risk: not-started · planned · in-progress · done.
   Ratings were set by the program team on 26 Nov 2026; the steering committee reviews them monthly from G0. */
IMS.MSTATUS = { "not-started": ["risk", "Not started"], planned: ["dec", "Planned"], "in-progress": ["est", "In progress"], done: ["ok", "Done"] };
IMS.riskReview = { last: "26 Nov 2026 (program team)", next: "First steering review after G0 (Dec 2026, date TBC)", cadence: "Monthly" };
const RISK_MIT = { "R-01": ["planned", "Handover plan written (chapter 08); waits for D-03 and D-04"], "R-02": ["not-started", "Waits for D-03"], "R-03": ["planned", "Co-design built into Pilot A"], "R-04": ["planned", "Feasibility check D-07 at G3"], "R-05": ["not-started", "Data owners not yet named (D-06)"], "R-06": ["not-started", "Hosting request open with IT since Oct 2026"], "R-07": ["not-started", "Consent not yet requested"], "R-08": ["not-started", "Privacy review needed before P01.10"], "R-09": ["not-started", "Waits for D-01 and D-08"], "R-10": ["planned", "Change plan written (chapter 06)"], "R-11": ["in-progress", "The MasterWord agent flags missing documents before submission"], "R-12": ["planned", "Pilot B designed; awaiting approval (D-10)"], "R-13": ["planned", "Aging alert in Pilot B design"], "R-14": ["planned", "Role-based access in the P05 requirements"], "R-15": ["planned", "Approval rule in AI governance (chapter 05)"], "R-16": ["planned", "Discovery proposed; waits for D-02"], "R-17": ["not-started", "Part of P09 Stage 1 Data Discovery"], "R-18": ["planned", "Control written into P09"] };
IMS.risks.forEach(r => { const m = RISK_MIT[r.id] || []; r.mstatus = m[0]; r.mnote = m[1]; r.review = IMS.riskReview.next; });

IMS.issues = [
  ["I-01", "All", "Program runs on one person's personal accounts and PC", "Stops if the builder is unavailable; company does not own the tools", "Handover plan: company accounts, repository, machine, backup operator"],
  ["I-02", "MasterWord, Dashboard", "AI subscription and credits paid personally", "No company control of usage or data", "Company plan and API budget"],
  ["I-03", "Dashboard", "Production plan waiting on IT since Oct 2026", "Dashboard stays a prototype", "Hosting, database and sign-in decision"],
  ["I-04", "Session Desk", "Client permission needed for platform automation", "Auto-accept cannot go live", "Written client consent per platform"],
  ["I-05", "MasterWord", "4 documents missing for 3 Argentina applicants", "Applications incomplete", "Request documents from applicants"],
  ["I-06", "All", "No measured baseline", "Benefits cannot be proven", "Approve 6-week Discovery"],
  ["I-07", "Payment", "Missing tasks and wrong amounts found only on complaint", "Late or missed pay; interpreters leave", "Transparent export + expected list each cycle"],
  ["I-08", "Payment", "No tracking of interpreters never paid", "Unpaid 3–4 months before anyone knows", "Aging alert for unpaid balances"],
  ["I-09", "Demand vs resources", "Calls lost in some languages while qualified interpreters may not be assigned to those clients", "Qualified capacity possibly unused", "Validate demand by language and interpreter eligibility (P09)"]
];

IMS.change = {
  groups: [
    ["Supervisors", "Daily Game Plan, coaching, alerts", "Co-design in Pilot A; champion per team"],
    ["ACMs", "Team view, client cases", "Weekly review routine built into the workspace"],
    ["Workforce", "Monitor, alerts, VTO", "Rules agreed per client before go-live"],
    ["Quality", "Repository and cases", "Classification standard trained first"],
    ["Finance & Invoicing", "Day 7 check, cases", "Read-only pilot; no change to approvals"],
    ["Onboarding & Recruitment", "Pipeline and alerts", "One record per candidate; sheets retired"],
    ["Interpreters", "Payment and onboarding status", "Simple status pages; FAQ"]
  ],
  steps: [
    ["Explain why", "Each team sees its own pain points and the measured baseline"],
    ["Co-design", "Users shape each pilot before it is built"],
    ["Train", "Short lessons and tests in Kalam Learning, plus SOPs"],
    ["Champions", "One champion per team answers questions and collects feedback"],
    ["Retire the old way", "Old trackers closed once the new process is validated"],
    ["Measure adoption", "Active users, plan completion, cases logged vs messages"]
  ]
};

/* ---------------- RESULTS & EVIDENCE ---------------- */
IMS.results = {
  masterword: {
    title: "Client portal submission (MasterWord)", project: "P04", status: "live-personal",
    summary: "28 new interpreters submitted to the MasterWord portal in 2 batches (Argentina 16; Egypt and Pakistan 12), 6 languages, both on 23 Nov 2026.",
    before: [["Find the files", "Open each file to see whose it is", 15], ["Redact the CV", "Remove phone, email, address", 20], ["Type the form", "Every field typed into the portal", 25], ["Upload 7 documents", "Right category for each", 25], ["Fix it later", "Gaps found after submission", 15]],
    after: [["Drop the batch folder", "Applicant list and documents", "2 min · human"], ["Agent runs every step", "Match files, redact CVs, fill forms, upload, confirm", "~4.5 min / applicant"], ["Report is written", "Missing or wrong documents flagged first", "Automatic"], ["1 person reviews", "The only human decision", "Minutes"]],
    note: "Step minutes split the team's 24–32 h estimate (~100 min × 16 ≈ 27 h). To be confirmed by timing one manual application. Batch 2 ran 12 applicants in 54 min; batch 1 included setup and pauses, so it is not the measure."
  },
  learning: {
    title: "Kalam Learning (self-paced training)", project: "C4", status: "live-personal",
    live: [["2", "trainings live"], ["30", "videos, about 5.3 h"], ["54", "test questions + 20-task exam"], ["$0", "running cost today"]],
    planned: ["Company-email sign-in (about $0–10 a month)", "Progress per person", "Next trainings", "Refresher training linked to quality findings (P07)"],
    before: ["Live Zoom only: new joiners wait", "Recordings on a laptop, never reused", "No test: learning not checked"],
    after: ["Self-paced site, any time, any device", "Videos and lessons by topic", "Self-marking tests and final exam"]
  },
  paymentPilot: {
    title: "Pilot B · Payment reconciliation (read-only)", project: "P05", status: "approval",
    problem: "Missing Transparent tasks, wrong amounts, late acceptance and eCash cases are found only when interpreters complain, sometimes 3–4 months later.",
    design: ["Expected task list per interpreter × client built from the paid-hours report", "Day 7 comparison against the Transparent task export", "Acceptance reminders and a Supervisor list of who has not accepted", "Concern log with owner and deadline", "Aging alert for anyone unpaid one cycle", "Read-only: the pilot never changes a payment"],
    period: "Historical replay of the last 3 cycles, then 3 live cycles (about Apr–Jul 2027).",
    validation: "Replay the last 3 cycles: does the check find the errors that interpreters later complained about? Invoicing confirms each flag.",
    criteria: ["Finds the known historical errors in the replay (target set at gate G5)", "Flags reviewed by Invoicing within 2 working days", "Zero payment changes made by the system", "Invoicing and ACMs agree to continue"],
    value: ["Errors found on day 7 instead of on complaint", "Fewer late acceptances", "No interpreter unpaid for more than one cycle without an alert", "Overpayments avoided: TBM, reported separately as cost avoided"],
    today: [["Day 4–5", "WFM builds the report; ACMs validate"], ["Day 7", "Invoicing uploads one task per client into Transparent"], ["Deadline", "Interpreter must accept every task"], ["Day 12", "Transfer"], ["Day 15", "Money arrives"], ["Day 20+", "Anything wrong moves to day 20 or next month"]],
    proposed: [["Day 1–3", "Report built from paid-hours data; ACMs review exceptions only"], ["Day 5", "Expected task list sent with the report"], ["Day 7", "Upload check: missing or wrong tasks flagged"], ["Deadline", "Reminders; Supervisor sees who hasn't accepted"], ["Day 12–15", "Paid; eCash set up in advance"], ["Every cycle", "Alert for anyone unpaid one cycle"]]
  }
};

/* Benefits model — categories are never added together */
IMS.benefits = [
  ["Time saved", "Minutes per transaction", "4.5 min vs ~100 min per applicant (MasterWord; before is an estimate)", "partial"],
  ["Capacity released", "Hours freed for other work (not cash)", "~50 h on 2 MasterWord batches (estimate-based)", "estimate"],
  ["Cost avoided", "Costs that would have happened (overpayments, overtime, hires)", "TBM", "open"],
  ["Actual cash savings", "Money that leaves the budget, confirmed by Finance", "$0 confirmed", "measured"],
  ["Error reduction", "Errors prevented or caught early", "5 document problems caught before submission (MasterWord)", "measured"],
  ["Processing time reduction", "End-to-end turnaround", "Same day vs 3–4 working days per batch (before is an estimate)", "partial"],
  ["Employee experience", "Less chasing; training on demand", "Kalam Learning live; survey TBM", "partial"],
  ["Client experience", "Requests closed on time; sessions covered", "TBM", "open"],
  ["Risk reduction", "Continuity, control, compliance", "Handover plan written; not yet executed", "open"]
];

/* ---------------- CONTINUITY & COST ---------------- */
IMS.continuity = {
  layers: [
    ["Instructions (playbook)", "On Mahmoud's PC; applications say \"Future Group - Mahmoud Adel\"", "In a company code repository; a team name instead of a person"],
    ["Helper tools: file matching, CV redaction, ledger, report", "Code on Mahmoud's PC", "Same code in the company repository, versioned and documented"],
    ["AI model that runs the agent", "Mahmoud's personal Claude account and credits", "Company Claude account and API key with a monthly cap, owned by IT"],
    ["Browser that fills the portal", "Runs on Mahmoud's PC", "Company computer or virtual machine that stays on"],
    ["Batch folders and the ledger of who was submitted", "On Mahmoud's PC", "Shared company drive, access by role"],
    ["Know-how", "In one person's head", "One-page runbook, short video, and a trained backup operator"]
  ],
  handover: [
    ["Company AI account", "IT opens a company Claude account and an API key with a monthly cap."],
    ["Move the code", "Playbook and tools move to a company repository with a team name."],
    ["Company machine", "The agent runs on a company computer or VM, with folders on the shared drive."],
    ["Runbook", "Drop the folder, start the run, read the report, answer flagged questions. Plus a short video."],
    ["Train a backup", "A second person runs one batch with support, then one alone. Signed off at gate G5."],
    ["Monitor", "Every run logs time, cost and results for the owner and management."]
  ],
  costModel: [
    ["Fixed · monthly", "Company Claude seats", "For the program team to build and improve automations", "[seats × plan price]"],
    ["Variable · per run", "AI usage per batch", "Pay-per-use for unattended runs, with a monthly cap", "[measured on first company batch]"],
    ["Infrastructure", "Company machine, VM and hosting", "Agent, data platform, dashboard and Session Desk", "[IT estimate]"],
    ["People", "Owners and backup operators", "About 15 min review per batch instead of 24–32 h of work", "Existing staff time"]
  ],
  costs: [
    ["Claude (AI) subscription", "Personal plan · [amount per month]", "Mahmoud, personally", "Company plan with seats for the program team", 1],
    ["Claude credits for automated runs", "[amount per month]", "Mahmoud, personally", "Company API budget with a monthly cap", 1],
    ["Dashboard pipeline", "Runs on Mahmoud's own PC", "Mahmoud", "IT server, database, company sign-in", 1],
    ["MasterWord agent machine", "Mahmoud's own PC", "Mahmoud", "Company computer or virtual machine", 1],
    ["Session Desk hosting", "Free tiers (Vercel, Supabase)", "Free", "Company hosting approved by IT", 0],
    ["Kalam Learning hosting", "Free tiers", "Free", "Company-email sign-in, about $0–10 a month", 0],
    ["System access", "Personal logins", "—", "Service accounts (Kalam, Incorta, Zoho, Transparent)", 0],
    ["Platform for 9 projects", "None", "—", "[IT estimate after Architecture gate]", 0],
    ["People", "1 person, alongside the day job", "Mahmoud's own time", "Sponsor, program manager, 1 owner per project, 1 backup per automation", 1]
  ]
};

/* ---------------- DECISIONS ---------------- */
/* [id, decision, why, decision-maker, required by, consequence of delay, status]
   status: open · awaiting (submitted, awaiting approval) · approved · rejected · deferred · completed */
IMS.DSTATUS = { open: ["dec", "Open", true], awaiting: ["est", "Awaiting approval", true], approved: ["ok", "Approved", false], rejected: ["risk", "Rejected", false], deferred: ["cur", "Deferred", true], completed: ["ok", "Completed", false] };
IMS.decisions = [
  ["D-01", "Name an executive sponsor and steering group", "Someone must own the program and remove blockers", "Senior management", "Before G0 · Dec 2026", "No gate decisions can be taken; program stays informal", "open"],
  ["D-02", "Approve 6 weeks of Discovery", "Measure time, volume and errors so every target is a fact", "Sponsor", "G0 · Dec 2026", "No baseline; no benefit can be proven", "open"],
  ["D-03", "Fund the tools and end personal payment", "Company Claude plan and API budget with a monthly cap", "Sponsor + Finance", "G0 · Dec 2026", "Automations stay on a personal account", "open"],
  ["D-04", "Company ownership of all automations", "Code, accounts and data move to the company", "Sponsor + IT", "Jan 2027", "Continuity risk R-01 stays high", "open"],
  ["D-05", "IT support: hosting, sign-in, service accounts", "Nothing can go to production without it", "IT head", "G3 · Apr 2027", "Reporting, Session Desk and pilots stay prototypes", "open"],
  ["D-06", "Access to approved data sources", "Kalam, Incorta, Zoho, Transparent, Time Doctor", "Data owners + IT", "G1 · Feb 2027", "Baseline and pilots cannot start", "open"],
  ["D-07", "Integration feasibility assessment", "Confirm what each system allows before design", "IT", "G3 · Apr 2027", "Designs built on unverified assumptions", "open"],
  ["D-08", "Name project and process owners", "Each project needs an accountable owner", "Sponsor + department heads", "G2 · Mar 2027", "Work depends on one person", "open"],
  ["D-09", "Finance, Quality and Workforce participation", "Rules, data and validation come from these teams", "Department heads", "G1 · Feb 2027", "Payment, quality and workforce projects stall", "open"],
  ["D-10", "Approve 3 pilots", "Daily Game Plan, payment (read-only), onboarding activation", "Steering", "G5 · May 2027", "No measured results in 2027", "open"],
  ["D-11", "Budget for the 8-project platform", "Hosting, licences and build time after architecture", "Sponsor + Finance", "G3 · Apr 2027", "Only pilots, no rollout", "open"],
  ["D-12", "Company infrastructure", "Machine or VM for agents; shared drive", "IT", "Jan 2027", "Agents keep running on a personal PC", "open"],
  ["D-13", "Long-term maintenance ownership", "Who maintains automations after 2027", "Sponsor + IT", "G7 · Sep 2027", "Benefits fade after rollout", "open"]
];

/* Program health. Ratings: G on track · A at risk · R off track · N not assessed.
   Green needs evidence; a plan that is only written down is not green. */
IMS.HEALTH = { G: ["ok", "On track"], A: ["est", "At risk"], R: ["risk", "Off track"], N: ["cur", "Not assessed"] };
IMS.health = [
  { area: "Scope", rating: "A", why: "9 projects and 7 capabilities defined by the program team; not yet approved by management (D-01, G0)", source: "Project register (this site)", owner: "Program manager (proposed)", updated: "26 Nov 2026" },
  { area: "Early results", rating: "G", why: "MasterWord: 28/28 submitted, 4.5 min per applicant measured. Kalam Learning live. Both personally operated", source: "Metrics M-01, M-02, M-08; batch reports", owner: "Program manager (proposed)", updated: "26 Nov 2026" },
  { area: "Method", rating: "N", why: "Stage gates and Lean method defined, but not yet applied to any project", source: "Stage gate definitions (chapter 06)", owner: "Program manager (proposed)", updated: "26 Nov 2026" },
  { area: "Benefits", rating: "N", why: "No baseline measured, so no benefit can be verified yet (0 verified hours, $0 confirmed)", source: "Metrics M-11, M-12", owner: "Finance representative (to be named)", updated: "26 Nov 2026" },
  { area: "Schedule", rating: "A", why: "All dates are proposed and start on approval; Discovery not yet approved (D-02)", source: "Roadmap (chapter 06)", owner: "Program manager (proposed)", updated: "26 Nov 2026" },
  { area: "Risk", rating: "A", why: "18 risks, 5 rated high impact and high probability; 9 open issues", source: "Risk register R-01 to R-18", owner: "Steering committee (to be formed)", updated: "26 Nov 2026" },
  { area: "Budget", rating: "R", why: "AI tools paid personally; no company budget approved (D-03)", source: "Cost table (chapter 08)", owner: "Executive sponsor (to be named)", updated: "26 Nov 2026" },
  { area: "Resources", rating: "R", why: "One person builds and runs everything alongside the day job; no owners named (R-09)", source: "Governance table (chapter 06)", owner: "Executive sponsor (to be named)", updated: "26 Nov 2026" }
];

/* Lean cuts (preserved) */
IMS.cuts = [
  { name: "MasterWord submission", label: "manual steps automated", steps: [["Find and match files", "x"], ["Redact the CV", "x"], ["Type the portal form", "x"], ["Upload 7 documents", "x"], ["Review the report", "va"]], note: "4 of 5 manual steps now done by the agent; 1 human review kept." },
  { name: "Interpreter payment", label: "non-value steps removed", steps: [["Report emailed to ACMs", "x"], ["ACM reviews exceptions only", "bva"], ["Supervisors chase acceptance", "x"], ["Tasks fixed in Transparent", "x"], ["Corrections back to Finance", "x"], ["Concerns in chats and groups", "x"], ["Finance approves payment", "bva"], ["Paid, with status visible", "va"]], note: "Proposed: 5 non-value steps removed or prevented; 2 human approvals kept." },
  { name: "Onboarding", label: "waiting and defect steps removed", steps: [["Requisition from coverage gaps", "bva"], ["Training updates the stage", "bva"], ["Documents + portals (automated)", "bva"], ["Supervisor onboarding session", "va"], ["Set-up entered once, checked", "bva"], ["“Has the interpreter started?” by message", "x"], ["Never starts, found late", "x"]], note: "Proposed: removed by first-task tracking and an inactivity alert." }
];

/* One-screen plan used on the overview: 5 phases and a short win per project */
/* Five program phases. from/to are month offsets from IMS.program.start; dates are calculated */
IMS.plan = [
  { step: "Approve", from: 0, to: 1, gates: ["G0"], what: "Sponsor, budget, 3 pilots" },
  { step: "Discover", from: 1, to: 3, gates: ["G1"], what: "Measure today's baseline" },
  { step: "Design", from: 3, to: 4.5, gates: ["G2", "G3"], what: "Future process and architecture" },
  { step: "Pilot", from: 4.5, to: 9, gates: ["G4", "G5", "G6"], what: "3 pilots, measured results" },
  { step: "Scale", from: 9, to: 13, gates: ["G7", "G8"], what: "Roll out, confirm benefits" }
];
IMS.wins = {
  P01: "More coaching, less chasing",
  P02: "One set of numbers, on time",
  P03: "No client request lost",
  P04: "Faster start, fewer drop-outs",
  P05: "Paid right, every time",
  P06: "Coverage gaps seen before they happen",
  P07: "Fewer repeat complaints",
  P08: "One trusted management view",
  P09: "More delivered with the same people"
};

/* Initiative board: every status code belongs to exactly one column (checked by tools/validate.js) */
IMS.BOARD = [
  { id: "planned", label: "Planned", statuses: ["planned"], tone: "cur" },
  { id: "approval", label: "Awaiting approval", statuses: ["approval"], tone: "dec" },
  { id: "build", label: "In build or pilot", statuses: ["prototype", "dev", "pilot", "poc"], tone: "fut" },
  { id: "live", label: "Live", statuses: ["live-personal", "live-company"], tone: "est" },
  { id: "blocked", label: "Blocked", statuses: ["blocked"], tone: "risk" }
];

/* Production readiness: what every automation needs before it is treated as company production.
   Values: yes · partial · no. Checked against what exists on 26 Nov 2026. */
IMS.READY = [
  ["env", "Company-owned environment", "Runs on a company machine, account and hosting"],
  ["bizOwner", "Accountable business owner", "Named person who owns the process and its results"],
  ["techOwner", "Technical owner", "Named person or team in IT who maintains it"],
  ["sop", "Documented procedure", "Runbook or SOP anyone trained can follow"],
  ["backup", "Backup operator", "A second trained person who has run it alone"],
  ["access", "Access controls", "Company sign-in, role-based access, no personal logins"],
  ["monitor", "Monitoring", "Each run logged with time, cost and result; failures alert the owner"],
  ["recovery", "Recovery", "Code, data and settings backed up; tested restore"]
];
IMS.readiness = [
  { id: "P04.3", name: "MasterWord submission agent", status: "live-personal", env: "no", bizOwner: "no", techOwner: "no", sop: "partial", backup: "no", access: "no", monitor: "partial", recovery: "no", note: "Batch reports log each run; runbook drafted in the handover plan, not yet tested by a second person" },
  { id: "C4.1", name: "Kalam Learning site", status: "live-personal", env: "no", bizOwner: "no", techOwner: "no", sop: "no", backup: "no", access: "no", monitor: "no", recovery: "partial", note: "Public site on free hosting; content kept in a code repository" },
  { id: "P02.3", name: "IMS performance report (prototype)", status: "prototype", env: "no", bizOwner: "no", techOwner: "no", sop: "no", backup: "no", access: "no", monitor: "no", recovery: "no", note: "Runs on a personal PC; production plan waiting on IT" },
  { id: "P06.16", name: "Session Desk (prototype)", status: "prototype", env: "no", bizOwner: "no", techOwner: "no", sop: "no", backup: "no", access: "partial", monitor: "no", recovery: "partial", note: "Free hosting tiers; sign-in exists, not company sign-in" }
];

/* Support and maintenance model after go-live (proposal, decided under D-13) */
IMS.support = [
  ["First line", "Business owner and trained backup operator", "Runs the process, answers users, logs problems"],
  ["Second line", "Program team, then the IT application owner", "Fixes rules, prompts and data mappings; releases changes"],
  ["Third line", "IT infrastructure and the vendor", "Hosting, sign-in, platform and AI service problems"],
  ["Change control", "Steering committee for rule changes; IT for releases", "No change to payment or quality rules without the process owner"],
  ["Review", "Monthly with the steering committee", "Incidents, run cost, results vs baseline, retirement of old trackers"]
];

/* ROI method used on every project page */
IMS.roiMethod = {
  steps: [
    ["Hours saved per month", "Monthly volume × (current time − new time − human review time)"],
    ["Capacity released", "Hours saved that are actually redeployed, confirmed by the process owner. Not cash."],
    ["Cost avoided", "Costs that would have happened (overpayments, overtime, extra hires), reported separately"],
    ["Cash savings", "Money that leaves the budget, confirmed by Finance only"],
    ["Total cost", "Implementation + licences + hosting + maintenance + support + training"],
    ["ROI", "(Finance-validated annual benefit − annual recurring cost) ÷ implementation cost"],
    ["Payback", "Implementation cost ÷ monthly validated net benefit"]
  ],
  costLines: ["Implementation (build time)", "Licences and AI usage", "Hosting and infrastructure", "Maintenance", "Support", "Training"]
};
