/* =====================================================================
   PROJECT 9 · Client Demand, Resource Utilization & Capacity Optimization
   No data is connected yet. Every KPI value is null and carries a status:
     vr = Validation required · na = Not available · nm = Not measured
   A missing value is never shown as zero.
   ===================================================================== */
window.IMS = window.IMS || {};

IMS.capacity = {
  question: "How much more can IMS deliver with the resources it already has?",
  updated: "Not refreshed · no source connected",
  principles: [
    ["Unassigned", "≠ available"],
    ["No report", "≠ zero demand"],
    ["High occupancy", "≠ best use"],
    ["Not a", "headcount dashboard"]
  ],
  filters: ["Period", "Client", "Language", "Service line", "Interpreter status", "Assignment"],

  /* Director's two-minute dashboard. kpi: [label, status, source, definition, period] */
  panels: [
    { id: "A", name: "Client coverage", kpis: [
      ["Active clients", "vr", "Account DB vs finance list", "Clients with an active contract", "Current month"],
      ["Clients missing in DB", "vr", "Client check report (one-off)", "Active clients not in the account database", "Last check"],
      ["DB accuracy score", "nm", "Module A reconciliation", "Matching records / records checked across 6 sources", "Monthly"] ] },
    { id: "B", name: "Resource utilization", kpis: [
      ["Qualified interpreters", "vr", "Zoho / onboarding", "Interpreters passed for a language and active", "Current"],
      ["Qualified, not assigned", "vr", "Zoho vs account DB", "Qualified for a language with demand, not assigned to that client", "Current"],
      ["Logged vs scheduled hours", "na", "Schedules + Time Doctor", "Logged hours / scheduled hours", "Weekly"] ] },
    { id: "C", name: "Demand vs capacity", kpis: [
      ["Clients with visible demand", "vr", "Client reports, Kalam, Incorta", "Clients where offered calls are available", "Monthly"],
      ["Demand visibility gaps", "vr", "Module B", "Active clients with no demand source", "Monthly"],
      ["Languages under capacity", "nm", "Module E", "Demand above qualified, scheduled capacity", "Weekly"] ] },
    { id: "D", name: "Data reliability", kpis: [
      ["Sources connected", "nm", "Data discovery", "Sources with an approved, repeatable feed (of 6)", "Current"],
      ["KPIs with agreed definition", "vr", "KPI register", "KPIs signed off by an owner", "Current"],
      ["Last full refresh", "na", "Refresh log", "Date of last complete refresh", "—"] ] },
    { id: "E", name: "Opportunities", kpis: [
      ["Identified", "tracker", "Opportunity tracker", "Items logged in Module F", "Cumulative"],
      ["Validated", "tracker", "Opportunity tracker", "Items with data confirmed", "Cumulative"],
      ["Added delivery", "nm", "Module F (measured stage)", "Extra hours delivered from existing capacity", "Monthly"] ] }
  ],
  attention: [
    ["TDG Italian: qualified Italian interpreters not assigned to TDG", "OP-01"],
    ["TDG offered calls not visible", "OP-02"],
    ["Clients missing in the account database", "OP-03"],
    ["Demand source unknown for some clients", "R-17"],
    ["No owner named for Project 9 or its data sources", "R-09"]
  ],

  /* Worked example. Each step: [what, status] (status: vr · na · desc) */
  tdg: [
    ["Italian demand on TDG", "desc"],
    ["TDG offered calls", "na"],
    ["Italian interpreters qualified", "vr"],
    ["Assigned to TDG", "desc"],
    ["Eligibility, contract, schedule", "vr"],
    ["Decision", "human"]
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
    { id: "OP-01", title: "Assign qualified Italian interpreters to TDG", client: "TDG", language: "Italian", line: "TBC", cls: "Unused qualified capacity", evidence: "Italian demand on TDG; Italian interpreters not assigned to TDG (as described)", source: "Operations (described)", confidence: "Low", impact: "Not measured", owner: "To be assigned", stage: "Identified", action: "Confirm TDG Italian demand and interpreter eligibility", due: "TBC", result: "Not measured" },
    { id: "OP-02", title: "Make TDG demand visible", client: "TDG", language: "All", line: "TBC", cls: "Demand visibility gap", evidence: "Offered calls on TDG not known", source: "Operations (described)", confidence: "Low", impact: "Not measured", owner: "To be assigned", stage: "Identified", action: "Find which system or report holds TDG offered calls", due: "TBC", result: "Not measured" },
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
