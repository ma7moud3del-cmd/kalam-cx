/* =====================================================================
   PROJECT 9 · Client Demand, Resource Utilization & Capacity Optimization
   Real figures come from the IMS Intelligence Dashboard (prototype; data built
   18 Nov 2026 from Kalam and Incorta exports). Period: 1 Oct – 8 Nov 2026.
   KPI status: m = Measured (value shown) · vr = Validation required ·
   na = Not available · nm = Not measured. A missing value is never shown as zero.
   "Abandoned" counts calls as the queue records them, including very short ones.
   ===================================================================== */
window.IMS = window.IMS || {};

IMS.capacity = {
  question: "How much more can IMS deliver with the resources it already has?",
  updated: "IMS dashboard data · 1 Oct – 8 Nov 2026 · built 18 Nov",
  source: "IMS Intelligence Dashboard (Kalam + Incorta exports)",
  asof: "18 Nov 2026",
  principles: [
    ["Unassigned", "≠ available"],
    ["No report", "≠ zero demand"],
    ["Busy", "≠ best use"],
    ["Not a", "headcount dashboard"]
  ],
  filters: ["Period", "Client", "Language", "Service line", "Interpreter status", "Assignment"],

  /* Real demand from the IMS dashboard: client queue → [offered, answered, abandoned] */
  real: {
    period: "1 Oct – 8 Nov 2026",
    total: [110301, 82317, 27984],
    hours: { idle: 29348, talk: 13138 }
  },

  /* Director's two-minute dashboard. kpi: [label, status, source, definition, period, value] */
  panels: [
    { id: "A", name: "Client coverage", kpis: [
      ["Clients with calls", "m", "IMS dashboard · Incorta queues", "Client queues with at least one offered call", "1 Oct – 8 Nov", "18"],
      ["Clients missing in DB", "vr", "Client check report (one-off)", "Active clients not in the account database", "Last check"],
      ["DB accuracy score", "nm", "Module A reconciliation", "Matching records / records checked across 6 sources", "Monthly"] ] },
    { id: "B", name: "Resource utilization", kpis: [
      ["Interpreters in Kalam", "m", "IMS dashboard · Kalam roster", "Interpreters with a Kalam profile in the period (all pools)", "1 Oct – 8 Nov", "349"],
      ["Ready but idle", "m", "IMS dashboard · Kalam activity", "Hours interpreters were available and not on a call", "1 Oct – 8 Nov", "29,348 h"],
      ["Talk time", "m", "IMS dashboard · Kalam activity", "Hours on calls", "1 Oct – 8 Nov", "13,138 h"] ] },
    { id: "C", name: "Demand vs capacity", kpis: [
      ["Calls offered", "m", "IMS dashboard · Incorta queues", "Calls offered to IMS queues", "1 Oct – 8 Nov", "110,301"],
      ["Calls abandoned", "m", "IMS dashboard · Incorta queues", "Offered calls not answered, as the queue records them", "1 Oct – 8 Nov", "27,984"],
      ["Languages under capacity", "m", "IMS dashboard · Incorta queues", "Languages with ≥100 calls and over 30% abandoned", "1 Oct – 8 Nov", "14"] ] },
    { id: "D", name: "Data reliability", kpis: [
      ["Sources in use", "m", "IMS dashboard source list", "Kalam and Incorta exports feeding the prototype (of 8 needed)", "18 Nov", "2 of 8"],
      ["KPIs with agreed definition", "vr", "KPI register", "KPIs signed off by an owner", "Current"],
      ["Last data build", "m", "IMS dashboard", "Date the dashboard data was last built", "—", "18 Nov"] ] },
    { id: "E", name: "Opportunities", kpis: [
      ["Identified", "tracker", "Opportunity tracker", "Items logged in Module F", "Cumulative"],
      ["Validated", "tracker", "Opportunity tracker", "Items with data confirmed", "Cumulative"],
      ["Added delivery", "nm", "Module F (measured stage)", "Extra hours delivered from existing capacity", "Monthly"] ] }
  ],
  attention: [
    ["27,984 of 110,301 calls abandoned, all clients (25%)", "OP-02"],
    ["14 languages with over 30% of calls abandoned", "OP-01"],
    ["29,348 h ready-idle while 27,984 calls abandoned: language mismatch?", "OP-04"],
    ["Clients missing in the account database", "OP-03"],
    ["No owner named for Project 9 or its data sources", "R-09"]
  ],

  modules: [
    ["A", "Client coverage & DB accuracy", ["6 sources reconciled", "Discrepancy log (10 fields)", "Accuracy score"]],
    ["B", "Client demand visibility", ["Offered · answered · missed · abandoned", "Language · service line · hour", "WoW · MoM · YoY · peaks"]],
    ["C", "Resource-to-client alignment", ["Interpreter × client matrix", "Language eligibility", "Checks before any move"]],
    ["D", "Capacity utilization", ["8 separate categories", "No blended %", "No new targets without approval"]],
    ["E", "Demand vs capacity gap", ["Gap per client × language", "6 opportunity classes", "Data confidence"]],
    ["F", "Opportunity & action tracker", ["15 fields", "Identified → measured", "Owner and due date"]]
  ],
  sources6: ["Account database", "Kalam", "Zoho", "Incorta", "Client reports", "Finance client list"],
  utilCats: ["Scheduled", "Logged in", "On task", "Idle while logged in", "Training / non-production", "Absent or on leave", "Assigned, not scheduled", "Qualified, not assigned"],
  oppClasses: ["Unused qualified capacity", "Unmet demand", "Assignment correction", "Demand visibility gap", "Over-capacity (review after checks)", "Data correction"],

  /* 10 views: [name, answers, key fields, sources] */
  views: [
    ["Client coverage matrix", "Is every client in every system?", ["Client", "6 sources", "Match"], ["accountdb", "kalam", "zoho", "incorta"]],
    ["Client × language demand", "Where is demand?", ["Client", "Language", "Offered", "Answered"], ["clientrep", "kalam", "incorta"]],
    ["Interpreter × client assignment", "Who serves whom?", ["Interpreter", "Languages", "Clients"], ["accountdb", "zoho"]],
    ["DB accuracy & reconciliation", "What disagrees, and who fixes it?", ["Discrepancy", "Owner", "Status"], ["accountdb", "zoho", "kalam"]],
    ["Unassigned qualified interpreters", "Who could serve more clients?", ["Interpreter", "Language", "Eligible clients"], ["zoho", "accountdb"]],
    ["Demand vs capacity heat map", "Where is the gap?", ["Language", "Hour", "Gap"], ["clientrep", "schedules"]],
    ["Client demand trends", "Is demand growing?", ["WoW", "MoM", "YoY", "Peaks"], ["clientrep", "incorta"]],
    ["Language capacity", "Enough people per language?", ["Language", "Qualified", "Scheduled"], ["zoho", "schedules"]],
    ["Utilization by client", "How is time spent per client?", ["8 categories", "Client"], ["timedoctor", "schedules", "kalam"]],
    ["Opportunity & action tracker", "What are we doing about it?", ["Stage", "Owner", "Due"], ["sheets"]]
  ],

  /* Data discovery: [metric, source, owner, refresh, method, readiness]
     readiness: now = data exists in some form · access = needs new access · unknown = source not known */
  discovery: [
    ["Client list", "Account database", "Onboarding (TBC)", "TBC", "Export", "access"],
    ["Client gaps", "Client check report", "TBC", "One-off", "Existing report", "now"],
    ["Sessions and minutes", "Kalam", "Kalam / IT (TBC)", "TBC", "Export endpoints", "now"],
    ["Offered / answered / missed", "Client reports, Incorta", "ACMs (TBC)", "Per client", "TBC", "unknown"],
    ["Interpreter languages", "Zoho", "Recruitment (TBC)", "TBC", "Export", "access"],
    ["Assignments", "Account database", "Onboarding (TBC)", "TBC", "Export", "access"],
    ["Schedules", "WFM schedules", "WFM (TBC)", "TBC", "TBC", "unknown"],
    ["Logged hours", "Time Doctor", "TBC", "Daily", "API not verified", "access"],
    ["Paid tasks", "Transparent", "Finance (TBC)", "Monthly", "Export", "access"]
  ],

  stages: [
    ["Data discovery & baseline", "Sources, owners, first counts"],
    ["Analytical model", "Matrices A–E from exports"],
    ["Director dashboard", "Panels A–F, filters"],
    ["Automation", "Scheduled refresh, alerts"],
    ["Continuous optimization", "Tracker reviews, measured gains"]
  ],

  /* Opportunity tracker (Module F). 15 fields; TBC where not known. */
  oppStages: ["Identified", "Validated", "Approved", "Implemented", "Measured"],
  opportunities: [
    { id: "OP-01", title: "Check language assignments where calls are lost", client: "All", language: "14 languages over 30% abandoned", line: "TBC", cls: "Unused qualified capacity", evidence: "14 languages with at least 100 calls and over 30% abandoned (1 Oct – 8 Nov)", source: "IMS dashboard (Incorta, Kalam)", confidence: "Medium", impact: "Not measured", owner: "To be assigned", stage: "Identified", action: "List qualified interpreters per language and check eligibility, contract and schedule before any change", due: "TBC" },
    { id: "OP-02", title: "Cut abandoned calls", client: "All", language: "All", line: "TBC", cls: "Unmet demand", evidence: "110,301 offered, 82,317 answered, 27,984 abandoned (1 Oct – 8 Nov)", source: "IMS dashboard (Incorta queues)", confidence: "High", impact: "Not measured", owner: "To be assigned", stage: "Validated", action: "Check staffing by language and hour against abandoned calls", due: "TBC" },
    { id: "OP-04", title: "Use idle hours where calls are lost", client: "All", language: "Spanish, Mandarin, Korean first", line: "TBC", cls: "Unused qualified capacity", evidence: "29,348 h ready-idle and 27,984 calls abandoned in the same period", source: "IMS dashboard (Kalam, Incorta)", confidence: "Medium", impact: "Not measured", owner: "To be assigned", stage: "Identified", action: "Match idle hours by language and hour to abandoned calls", due: "TBC", result: "Not measured" },
    { id: "OP-03", title: "Add missing clients to the account database", client: "Several (TBC)", language: "TBC", line: "TBC", cls: "Data correction", evidence: "Client check report found clients missing in the database", source: "Client check report", confidence: "Medium", impact: "Not measured", owner: "To be assigned", stage: "Identified", action: "Re-run the check and list the clients", due: "TBC", result: "Not measured" }
  ],

  /* Unified database: one record set built from every source, checked before use */
  unified: {
    tables: ["Clients", "Interpreters & languages", "Assignments", "Demand by hour", "Schedules & hours", "Opportunities"],
    checks: ["Same client in every source", "No blank shown as zero", "Freshness per source", "Owner per field"]
  },
  /* Automated reports: [name, frequency, audience, channel] · all at design stage, live from Stage 4 */
  reports: [
    ["Demand & coverage flash", "Daily", "Operations, WFM", "Email / Teams"],
    ["Unassigned qualified interpreters", "Weekly", "WFM, Onboarding", "Email"],
    ["DB accuracy exceptions", "Weekly", "Onboarding, data owners", "Email"],
    ["Utilization by client", "Weekly", "ACMs", "Email / Teams"],
    ["Director pack", "Monthly", "Director, management", "Email + dashboard"]
  ],
  /* Custom views: role presets a person starts from, then changes. panels A–F, views 1–10 */
  roles: [
    { id: "director", name: "Director", panels: ["A", "B", "C", "D", "E", "F"], views: [6, 7, 10], filter: "All clients" },
    { id: "acm", name: "ACM", panels: ["A", "C", "F"], views: [1, 2, 7, 9], filter: "My clients" },
    { id: "wfm", name: "Workforce", panels: ["B", "C", "D"], views: [5, 6, 8], filter: "All languages" },
    { id: "onb", name: "Onboarding", panels: ["A", "B"], views: [3, 4, 5], filter: "Active interpreters" },
    { id: "sup", name: "Supervisor", panels: ["B", "F"], views: [3, 9], filter: "My team" }
  ]
};
