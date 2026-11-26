/* =====================================================================
   WEEKLY MANAGEMENT UPDATE — opening page. Short labels only.
   Figure status: measured · estimate · described · tbc (to confirm).
   Nothing here is an approved project.
   ===================================================================== */
window.IMS = window.IMS || {};

IMS.update = {
  draft: "Draft for discussion · not an approved program",

  /* Part 1: done and in progress — [figure, label, status] */
  work: [
    { name: "MasterWord submission", stage: "live", stageLabel: "Live · run personally", big: ["4.5 min", "per applicant (was ~100)", "measured"], small: [["28/28", "submitted", "measured"], ["~50 h", "freed", "estimate"]], next: "Move to company account" },
    { name: "Kalam Learning", stage: "live", stageLabel: "Live · run personally", big: ["30", "training videos live", "measured"], small: [["2", "trainings", "measured"], ["54", "test questions", "measured"]], next: "Company sign-in" },
    { name: "Pre-scheduled sessions", stage: "build", stageLabel: "In progress", big: ["Prototype", "Session Desk built", "described"], small: [["TBC", "sessions / week", "tbc"]], next: "Client consent, IT hosting" },
    { name: "IMS Intelligence", stage: "build", stageLabel: "In progress", big: ["Prototype", "reports from Kalam data", "described"], small: [["TBC", "report hours / week", "tbc"]], next: "IT hosting decision" }
  ],

  /* Part 2: areas to improve. today = steps · pain = issues · fix = direction (not a decision) */
  areas: [
    { id: "onboarding", name: "Onboarding", sub: "Hire → first task", today: ["Hire", "Documents", "Portals", "Training", "Accounts", "First task"], pain: ["Hand-overs by chat and sheets", "Drop-outs found late", "Portals filled by hand"], time: ["~100 min", "per portal submission", "estimate"], fix: ["One record per candidate", "No-first-task alerts", "More portal automation"] },
    { id: "reports", name: "Reports", sub: "Daily to monthly", today: ["Export", "Combine by hand", "Fix numbers", "Format", "Email"], pain: ["Rebuilt every period", "Numbers disagree", "Missing data unnoticed"], time: ["TBC", "hours per week", "tbc"], fix: ["Report list with owners", "Automatic checks", "IMS Intelligence"] },
    { id: "payment", name: "Payment cycle", sub: "Month close → paid", today: ["WFM report", "ACM check", "Transparent tasks", "Accept", "Transfer"], pain: ["Errors found by interpreters", "Missed acceptance deadlines", "Unpaid for months, unnoticed"], time: ["Up to 3–4 months", "to find some errors", "estimate"], fix: ["Day 7 upload check", "Acceptance reminders", "Unpaid alerts"] },
    { id: "operations", name: "Operations process", sub: "Daily Supervisor work", today: ["Chats and calls", "Personal notes", "Ad-hoc coaching", "ACM asks"], pain: ["No written way of working", "Roles overlap", "No daily routine or escalation"], time: ["TBC", "admin hours per Supervisor", "tbc"], fix: ["Operations manual", "Role cards", "Daily and weekly routines"] },
    { id: "utilization", name: "Demand vs resources", sub: "Project 9", today: ["Client demand", "Assignments in DB", "One-off checks"], pain: ["Clients missing in DB", "TDG Italian demand, Italian interpreters unassigned", "Demand not visible for some clients"], time: ["TBC", "unassigned qualified interpreters", "tbc"], fix: ["DB accuracy check", "Demand vs capacity view", "Director dashboard"], link: "#/capacity" },
    { id: "presched", name: "Pre-scheduled sessions", sub: "Booking → covered", today: ["Client platforms", "Watch by hand", "Accept", "Assign", "Remind"], pain: ["Platforms watched by hand", "Late or missed sessions", "No coverage proof"], time: ["TBC", "missed per month", "tbc"], fix: ["One session queue", "Auto pick-up (with consent)", "Session Desk"] },
    { id: "callcentre", name: "Contact-centre practices", sub: "Ideas to adopt", today: ["Forecast", "Schedule", "Real time", "Quality", "Coach"], pain: ["Practices not in place", "Each team works differently"], time: ["—", "ideas for discussion", "described"], fix: ["Real-time management", "QA calibration", "Nesting for new hires"] },
    { id: "orgmap", name: "Account map", sub: "Who does what", today: ["Management", "Operations", "WFM", "Quality", "Onboarding", "Finance"], pain: ["Responsibilities not written", "Hand-overs fall between teams"], time: ["—", "names to confirm", "described"], fix: ["Confirm structure", "Client owner per ACM", "Role card per box"] }
  ],

  asks: [["Pick 2–3 priority areas", "Biggest effect on time and quality"], ["Confirm missing figures", "Short check with each team"], ["Name a contact per area", "Confirms process, tests fixes"], ["Company accounts for live tools", "Removes the one-person risk"]]
};
