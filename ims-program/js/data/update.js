/* =====================================================================
   WEEKLY MANAGEMENT UPDATE — content for the opening page.
   Part 1: work done and in progress. Part 2: areas to improve.
   Nothing here is an approved project. Figures carry a status:
   measured · estimate · described (as described by the team) · tbc (to be confirmed).
   ===================================================================== */
window.IMS = window.IMS || {};

IMS.update = {
  draft: "Working draft for discussion. This is not an approved program, budget or final list of projects.",
  purpose: ["Show what has been delivered and what is in progress", "Show where today's processes lose time and quality", "Agree which areas to look at next"],

  /* ---------- Part 1: done and in progress ---------- */
  work: [
    {
      id: "masterword", name: "MasterWord applicant submission", area: "onboarding", initiative: "P04.3",
      stage: "live", stageLabel: "Live · run personally",
      what: "An agent submits new interpreters to the MasterWord client portal: matches files, redacts CVs, fills the form and uploads every document.",
      results: [["28 / 28", "applicants submitted in 2 batches (16 and 12)", "measured"], ["4.5 min", "per applicant, was ~100 min by hand", "measured"], ["Same day", "per batch, was 3–4 working days", "estimate"], ["~50 h", "staff time released on 2 batches", "estimate"]],
      next: "Move to a company account and machine; train a backup operator."
    },
    {
      id: "learning", name: "Kalam Learning (e-learning)", area: "onboarding", initiative: "C4.1",
      stage: "live", stageLabel: "Live · run personally",
      what: "Self-paced training site that replaces live Zoom-only training, with videos, lessons and self-marking tests.",
      results: [["2", "trainings live", "measured"], ["30", "videos, about 5.3 hours", "measured"], ["54", "test questions plus a 20-task final exam", "measured"]],
      next: "Company-email sign-in and progress per person."
    },
    {
      id: "presched", name: "Pre-scheduled sessions (Session Desk)", area: "presched", initiative: "P06.16",
      stage: "build", stageLabel: "In progress",
      what: "One desk to receive pre-scheduled session requests, assign an interpreter, confirm coverage and keep proof.",
      results: [["Prototype", "working app on free hosting", "described"], ["TBC", "sessions handled per week today", "tbc"]],
      next: "Client permission for auto-accept; company hosting from IT; pilot with one client."
    },
    {
      id: "intel", name: "IMS Intelligence (performance reports)", area: "reports", initiative: "P02.3",
      stage: "build", stageLabel: "In progress",
      what: "Automated IMS performance reporting built from Kalam data, with a dashboard instead of manual exports.",
      results: [["Prototype", "pipeline and dashboard running on a personal PC", "described"], ["TBC", "hours per week spent on reports today", "tbc"]],
      next: "IT decision on hosting, database and company sign-in (waiting since Oct 2026)."
    }
  ],

  /* ---------- Part 2: areas to improve ----------
     today: current process steps · issues · time [figure, what, status]
     statement: problem statement · fix: how we could fix it (direction, not a decision) */
  areas: [
    {
      id: "onboarding", name: "Onboarding: from hiring to first task", icon: "01", size: "Large",
      scope: "From the hiring need to the day we confirm the interpreter started working",
      today: ["Hiring need raised", "Recruitment and interviews", "Documents collected", "Client portal submissions", "Training", "Accounts created", "Handover to Supervisor", "First login", "First task"],
      issues: ["Hand-overs between teams happen by message and spreadsheet", "Nobody sees who was trained but never took a task, so drop-outs are found late", "Missing or wrong documents found late (5 problems in 2 MasterWord batches)", "Each client portal is filled by hand (now automated for MasterWord only)"],
      time: [["~100 min", "per applicant to submit to a client portal by hand", "estimate"], ["3–4 days", "per batch of client submissions", "estimate"], ["TBC", "days from training completed to first task", "tbc"], ["TBC", "share of trained interpreters who never start", "tbc"]],
      statement: "We cannot see where each new interpreter is between hiring and their first task, so delays and drop-outs are discovered too late and recruiting effort is lost.",
      fix: ["One record per candidate, from hiring need to first task, with an owner for every step", "Alerts when someone has no first login or no first task after a set number of days", "Extend the portal automation to other clients", "Training progress from Kalam Learning feeds the same record"],
      evidence: "MasterWord automation shows the submission step can drop from ~100 to 4.5 minutes per applicant."
    },
    {
      id: "reports", name: "Operations reports", icon: "02", size: "Large",
      scope: "Every recurring report: daily, weekly, monthly and client-specific",
      today: ["Export from Kalam and other systems", "Download client files", "Combine in spreadsheets by hand", "Check and fix numbers", "Format per client or manager", "Send by email"],
      issues: ["The same reports are rebuilt by hand every period", "The same number can differ between two reports", "Nobody is alerted when source data is missing or late", "Many client-specific formats", "Reports depend on the person who knows how to build them"],
      time: [["TBC", "hours per week spent building reports", "tbc"], ["TBC", "number of recurring reports and their owners", "tbc"], ["TBC", "reports corrected after sending", "tbc"]],
      statement: "Reporting takes a large share of operations time and still produces numbers that do not always agree, so time goes into building reports instead of acting on them.",
      fix: ["A list of every report with owner, frequency and recipients", "Automatic data pulls and checks before a report is sent", "One agreed definition for each shared number", "IMS Intelligence is the first step (in progress)"],
      evidence: "IMS Intelligence prototype already builds the performance report from Kalam data."
    },
    {
      id: "payment", name: "Interpreter payment cycle", icon: "03", size: "Large",
      scope: "From month close until every interpreter is paid correctly",
      today: ["Day 4–5: WFM builds the payment report", "ACMs validate", "Day 7: Invoicing uploads one Transparent task per client per interpreter", "Interpreter accepts each task before a deadline", "Day 12: transfer", "Day 15: money arrives", "Problems move to day 20 or next cycle"],
      issues: ["Missing tasks and wrong amounts are found only when the interpreter complains", "Interpreters miss the acceptance deadline; late acceptance is known only from Invoicing's report", "Small amounts need eCash, found only when money does not arrive", "Fixes go back and forth by message", "No tracking: an interpreter can stay unpaid 3–4 months and leave unnoticed"],
      time: [["~390", "interpreters paid in October 2026", "measured"], ["15 days", "from month close to money arriving", "described"], ["Up to 3–4 months", "before some errors are found (longest case described)", "estimate"], ["TBC", "payment errors and complaints per cycle", "tbc"]],
      statement: "Payment errors are found by the interpreter, not by us, so people are paid late or wrongly and some leave before anyone notices.",
      fix: ["Send the expected task list with the payment report", "Day 7 check of uploaded tasks against the expected list", "Acceptance reminders and a list for Supervisors", "Plan eCash cases in advance", "One case per payment concern, with owner and deadline", "Alert for anyone unpaid for one cycle", "Start read-only: the check never changes a payment"],
      evidence: "Current cycle mapped with the program lead on 26 Nov 2026."
    },
    {
      id: "operations", name: "Daily operations and Supervisor work", icon: "04", size: "Very large",
      scope: "How the operation is run every day: routines, roles, follow-up and escalation",
      today: ["Requests arrive by chat, email and calls", "Each Supervisor tracks work in personal notes or sheets", "Coaching fitted in when time allows", "ACMs ask for updates by message", "Productivity checked by hand from Time Doctor"],
      issues: ["No single documented way to run the operation, so each Supervisor works differently", "Roles of Supervisor, ACM and WFM overlap and are not written down", "No fixed daily, weekly and monthly routine (huddles, intraday checks, end-of-shift report)", "No escalation matrix: who acts, by when", "Management cannot see what happened today without asking"],
      time: [["TBC", "hours per Supervisor per week on follow-ups and admin", "tbc"], ["TBC", "hours per week on coaching and development", "tbc"]],
      statement: "IMS runs without one documented operating process, so the quality of the operation depends on each Supervisor, and problems are seen late.",
      fix: ["An IMS Operations Process manual, in the style of a contact-centre operations manual (example to be shared)", "Role cards for Supervisor, ACM, WFM, Quality and Training with clear responsibilities", "Fixed routines: start-of-shift huddle, intraday checks, end-of-shift report, weekly review, monthly business review", "Escalation matrix with response times", "KPI pack per level: interpreter, Supervisor, ACM, account", "Tools come after the process is agreed"],
      evidence: "Process first, tools second. The earlier Game Plan idea is not proposed as a separate project."
    },
    {
      id: "utilization", name: "Resource utilization vs client demand", icon: "05", size: "Very large",
      scope: "Matching the interpreters we have (languages, client assignments) to the demand of every client served at the same time",
      today: ["Interpreters are assigned to clients and languages in the account database", "Each client's demand is seen in separate reports, or not at all", "Assignments are checked by hand with one-off reports", "Gaps are found when a client complains or a report is run"],
      issues: ["Client assignments in the database are not always complete or correct; a client check already shows clients missing from assignments", "Interpreters with a language that is in demand are not assigned to the client that needs it (example: Italian volume on TDG while Italian interpreters are not assigned to TDG)", "For some clients, such as TDG, we do not see offered calls, so demand cannot be compared with capacity", "No single view of demand vs available interpreters by client and language"],
      time: [["TBC", "offered calls per client and language (starting with TDG)", "tbc"], ["TBC", "interpreters with an in-demand language not assigned to that client", "tbc"], ["TBC", "share of database assignments that are missing or wrong", "tbc"]],
      statement: "We do not compare client demand by language with the interpreters we already have, so some demand goes unanswered while qualified interpreters stay unassigned. This is the most direct route to 20% growth with current resources.",
      fix: ["Database accuracy check: every interpreter, client and language assignment compared with the approved list (builds on the existing client check)", "Demand vs capacity view per client and language: offered volume, qualified interpreters, assigned interpreters, gap", "Get offered-call data from each client, starting with TDG", "Alert when a language has demand and qualified interpreters are not assigned", "Review utilization weekly with WFM and ACMs"],
      evidence: "The client check report already finds clients missing from assignments. TDG shows the pattern: Italian demand exists while Italian interpreters are not assigned to TDG."
    },
    {
      id: "presched", name: "Pre-scheduled sessions", icon: "06", size: "Large",
      scope: "From a client booking a session to the session being covered and confirmed",
      today: ["Client books in its own platform or by email", "Team checks each platform by hand", "Session accepted and assigned", "Interpreter reminded", "Coverage checked after the fact"],
      issues: ["Client platforms must be watched by hand", "Sessions can be accepted late or missed", "No single list of upcoming sessions and who covers them", "No proof of coverage when a client asks"],
      time: [["TBC", "pre-scheduled sessions per week", "tbc"], ["TBC", "sessions missed or accepted late per month", "tbc"], ["TBC", "hours per day watching client platforms", "tbc"]],
      statement: "Pre-scheduled sessions depend on people watching several client platforms, so sessions can be missed and we cannot prove coverage.",
      fix: ["One queue of every pre-scheduled session, with interpreter and status", "Automatic pick-up from client platforms where the client allows it", "Reminders and confirmation before the session", "Coverage proof for each client", "Session Desk is the first step (in progress)"],
      evidence: "Session Desk prototype is built; client permission is needed before auto-accept."
    },
    {
      id: "callcentre", name: "Contact-centre practices we could adopt", icon: "07", size: "Ideas",
      scope: "Proven practices from contact-centre operations, adapted to interpreting",
      practices: [
        ["Workforce cycle", "Forecast demand, schedule, manage intraday, report", "Coverage gaps seen before they happen"],
        ["Real-time management", "A live view of logins, idle time and queue, with set actions", "Faster reaction during the shift"],
        ["Quality and calibration", "Sample sessions, score with one form, calibrate scorers monthly", "Fair, consistent quality results"],
        ["Coaching cycle", "Every quality finding leads to a coaching session and a follow-up check", "Repeat issues fall"],
        ["Nesting for new interpreters", "First weeks with extra support and closer monitoring", "Fewer early drop-outs"],
        ["Knowledge base and SOPs", "One approved answer for each procedure, with an owner", "Less dependence on individuals"],
        ["Voice of the client", "Complaints classified by root cause and reviewed monthly", "Fixes target the real causes"],
        ["Scorecards", "Simple monthly scorecard per interpreter and Supervisor", "Clear expectations and recognition"]
      ],
      statement: "Many IMS problems are already solved in contact-centre operations; we can adapt the practices instead of inventing new ones."
    },
    {
      id: "orgmap", name: "Account map and responsibilities", icon: "08", size: "Foundation",
      scope: "Who does what for each account, and where each responsibility sits",
      statement: "Responsibilities are not written down in one place, so hand-overs fall between teams. A clear map is the base for every other improvement.",
      fix: ["Confirm the structure above with management", "Add names, reporting lines and which ACM covers which client", "Attach a role card to each box"]
    }
  ],

  /* Draft organisation map: functions only, no names. To be confirmed. */
  org: {
    top: ["IMS Management", "Direction, priorities, client relationships"],
    groups: [
      { name: "Operations", lines: [["Account Managers (ACMs)", "Own client accounts, validate reports and payment lines"], ["Supervisors", "Run the team day to day, coach, follow up"], ["Interpreters", "Deliver sessions"]] },
      { name: "Workforce Management", lines: [["Scheduling and real time", "Coverage, schedules, intraday monitoring, client and language assignments"], ["Payment report", "Builds the monthly paid-hours report"]] },
      { name: "Quality and Training", lines: [["Quality", "Evaluations, complaints, findings"], ["Training", "New-hire and refresher training, Kalam Learning"]] },
      { name: "Recruitment and Onboarding", lines: [["Recruitment", "Sourcing and interviews"], ["Onboarding", "Documents, client portals, accounts, handover"]] },
      { name: "Finance and Invoicing", lines: [["Invoicing", "Transparent tasks, transfers, payment concerns"]] },
      { name: "Reporting and Systems", lines: [["Reporting", "Operations and client reports"], ["IT", "Systems, access, hosting"]] }
    ],
    questions: ["Who owns each client account?", "Which team owns the onboarding process end to end?", "Who signs off the payment report: ACM or WFM?", "Where do Quality and Training report?"]
  }
};
