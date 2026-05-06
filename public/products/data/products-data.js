/* NLC Firm — Product Catalog Data
   Single source of truth for all 32 SKUs, 13 sectors, and bundles.
   Loaded as window.NLC_CATALOG on all catalog/product pages. */

window.NLC_CATALOG = {

  sectors: [
    { id: "healthcare",             name: "Healthcare & Medical Practices", icon: "🏥", slug: "healthcare",             tagline: "Billing leakage, staffing costs, and compliance exposure eat margin before you see it.",                    buyer: "Practice owners and administrators at independent and group practices" },
    { id: "legal",                  name: "Legal & Law Firms",              icon: "⚖️", slug: "legal",                  tagline: "Realization rates, write-offs, and overhead bloat are the silent killers of firm profitability.",            buyer: "Managing partners, legal ops directors, and general counsel" },
    { id: "real-estate",            name: "Real Estate",                   icon: "🏘️", slug: "real-estate",            tagline: "Deals, teams, and properties need systems — or every transaction starts from scratch.",                     buyer: "Investors, brokers, and property management operators" },
    { id: "professional-services",  name: "Professional Services",         icon: "💼", slug: "professional-services",  tagline: "Scope creep, underpricing, and inconsistent delivery keep firm revenue below its ceiling.",                  buyer: "CPA firm owners, agency principals, and independent consultants" },
    { id: "retail",                 name: "Retail & E-Commerce",           icon: "🛍️", slug: "retail",                 tagline: "Margin erosion hides in shrink, markdowns, and vendor terms that were never renegotiated.",                buyer: "Store owners, buyers, and e-commerce founders" },
    { id: "restaurants",            name: "Restaurants & Hospitality",     icon: "🍽️", slug: "restaurants",            tagline: "Prime cost above 65% and turnover above 70% are not industry norms — they're problems with solutions.",     buyer: "Restaurant owners, GMs, and hospitality operators" },
    { id: "construction",           name: "Construction & Trades",         icon: "🔨", slug: "construction",           tagline: "Job cost overruns and owner dependency are the two reasons trades businesses stay stuck.",                  buyer: "General contractors, project managers, and trades owner-operators" },
    { id: "nonprofit",              name: "Non-Profit & Social Enterprise", icon: "🤝", slug: "nonprofit",              tagline: "Unfundable financials and governance gaps kill grant applications before they're reviewed.",                buyer: "Executive directors, development directors, and finance staff" },
    { id: "financial-services",     name: "Financial Services",            icon: "💰", slug: "financial-services",     tagline: "Inconsistent client touchpoints and unclear pipelines drive churn that never shows up in reports.",          buyer: "RIA owners, insurance agency principals, and mortgage brokers" },
    { id: "education",              name: "Education & Training",          icon: "📚", slug: "education",              tagline: "Course economics, enrollment models, and operations get built on assumptions — until they don't work.",     buyer: "Training business owners, school directors, and course creators" },
    { id: "technology",             name: "Technology & SaaS",             icon: "💻", slug: "technology",             tagline: "CAC, LTV, and churn math that's never been modeled is a funding conversation waiting to go wrong.",         buyer: "SaaS founders, product managers, and startup finance leads" },
    { id: "manufacturing",          name: "Manufacturing & Distribution",  icon: "🏭", slug: "manufacturing",          tagline: "Downtime, inventory bloat, and supplier dependency hide costs that don't show up until margin review.",      buyer: "Plant managers, supply chain directors, and COOs" },
    { id: "government-contracting", name: "Government Contracting",        icon: "🏛️", slug: "government-contracting", tagline: "Most organizations lose bids for reasons that have nothing to do with their proposal.",                   buyer: "GovCon CEOs, BD directors, and contracts managers" }
  ],

  bundles: [
    {
      id: "healthcare-starter",
      name: "Healthcare Operations Starter",
      included: ["NLC-HC-002", "NLC-HC-001"],
      includedNames: ["HIPAA Compliance Gap Assessment", "Medical Practice 90-Day Revenue Recovery Plan"],
      price: 247,
      individualTotal: 294,
      savings: 47,
      sector: "healthcare"
    },
    {
      id: "legal-ops-kit",
      name: "Legal Firm Operations Kit",
      included: ["NLC-LG-001", "NLC-PS-001", "NLC-LG-002"],
      includedNames: ["Law Firm Profitability Diagnostic", "CPA Firm Client Onboarding System", "Legal Department Vendor Audit Toolkit"],
      price: 347,
      individualTotal: 451,
      savings: 104,
      sector: "legal"
    },
    {
      id: "construction-bundle",
      name: "Construction Business Bundle",
      included: ["NLC-CN-001", "NLC-CN-002"],
      includedNames: ["Construction Project Profitability Tracker", "Trades Business Owner's Growth Blueprint"],
      price: 227,
      individualTotal: 274,
      savings: 47,
      sector: "construction"
    },
    {
      id: "govcon-launch-pack",
      name: "Gov Contracting Launch Pack",
      included: ["NLC-GC-001", "NLC-GC-002", "NLC-GC-003"],
      includedNames: ["Government Contract Bid Readiness Assessment", "CPSR / Compliance Audit Prep Toolkit", "Proposal Writing Framework & Win Theme Builder"],
      price: 397,
      individualTotal: 491,
      savings: 94,
      sector: "government-contracting"
    }
  ],

  products: [
    /* ── HEALTHCARE ────────────────────────────────────────── */
    {
      sku: "NLC-HC-001",
      name: "Medical Practice 90-Day Revenue Recovery Plan",
      slug: "medical-practice-revenue-recovery-plan",
      sector: "healthcare",
      buyerRoles: ["Practice Owner", "COO", "Practice Administrator"],
      problem: "You're billing what you think you should, but the collections number never matches. You've adjusted codes, talked to your biller, and it's still not closing. The problem usually isn't the biller — it's the structure underneath: payer mix drift, scheduling leakage, and denial patterns that compound quietly for months before someone notices.",
      tagline: "A structured 14-section audit and 90-day action plan for practice owners who know money is leaking but can't pinpoint exactly where.",
      deliverables: [
        "14-section workbook with pre-built formulas",
        "90-day implementation calendar with weekly milestones",
        "Payer mix benchmark reference table by specialty",
        "Revenue cycle audit checklist (62 items)",
        "Scheduling gap analysis template"
      ],
      format: ["Workbook", "Tracker", "Checklist"],
      price: 197,
      tier: "premium",
      upsellScope: "Revenue cycle retainer",
      upsellPrice: "$2,500–$5,000/month",
      upsellTrigger: "Your worksheet shows $240K+ in recoverable revenue — ready to execute the plan with a dedicated team?",
      priority: 1,
      seoKeyword: "medical practice revenue recovery workbook",
      metaTitle: "Medical Practice 90-Day Revenue Recovery Plan | NLC Firm",
      metaDescription: "Audit billing, scheduling, and payer mix gaps with a structured 14-section workbook for practice owners. Identify recoverable revenue in your first session.",
      sections: [
        { title: "Revenue Cycle Audit",      desc: "62-item audit covering claim submission accuracy, denial rate by payer, and AR aging buckets" },
        { title: "Payer Mix Analysis",        desc: "Breakdown of collections by payer with specialty benchmarks and reimbursement gap table" },
        { title: "Scheduling Gap Review",     desc: "Template for identifying unfilled slots, no-show patterns, and appointment type profitability" },
        { title: "Denial Pattern Log",        desc: "Tracker for denial codes, root cause categories, and rework cost per denial type" },
        { title: "Staff Accountability Map",  desc: "RACI matrix for billing roles with performance benchmarks and correction protocols" },
        { title: "90-Day Action Calendar",    desc: "Week-by-week implementation timeline with assigned owners and measurable milestones" }
      ],
      notFor: "Hospitals, health systems, or practices with dedicated revenue cycle management software in full deployment",
      faq: [
        { q: "What specialty is this designed for?", a: "The framework covers all outpatient specialties. Benchmarks are provided for primary care, behavioral health, physical therapy, dental, and specialty practices. You apply the relevant benchmarks to your specialty." },
        { q: "Do I need billing software to use this?", a: "No. The workbook works alongside any billing system. It's designed to audit process and structure, not to replace your billing platform." },
        { q: "How long does it take to complete?", a: "Most practice owners complete the initial audit in 2–3 sessions of 45–60 minutes each. The 90-day plan then runs on its own calendar." }
      ]
    },
    {
      sku: "NLC-HC-002",
      name: "HIPAA Compliance Gap Assessment",
      slug: "hipaa-compliance-gap-assessment",
      sector: "healthcare",
      buyerRoles: ["Compliance Officer", "Office Manager", "Practice Owner"],
      problem: "Most practices assume they're compliant because they have a Notice of Privacy Practices on the wall and their staff signed something at onboarding. An OCR audit doesn't check for paperwork — it checks for evidence of an active, maintained compliance program. The gaps between what you have and what you need to show are almost always larger than expected.",
      tagline: "A 62-item gap assessment that shows exactly where your compliance program stands before an auditor does it for you.",
      deliverables: [
        "62-item HIPAA gap assessment across all safeguard categories",
        "Risk scoring matrix with severity ratings",
        "Remediation priority guide with effort/impact grid",
        "Policy gap checklist (Administrative, Physical, Technical)",
        "BAA tracking log template"
      ],
      format: ["Assessment", "Checklist", "Tracker"],
      price: 97,
      tier: "core",
      upsellScope: "HIPAA compliance advisory project",
      upsellPrice: "$4,500–$8,500 flat fee",
      upsellTrigger: "Your assessment shows 4+ critical gaps. We can remediate and document in 60 days.",
      priority: 2,
      seoKeyword: "hipaa compliance gap assessment checklist",
      metaTitle: "HIPAA Compliance Gap Assessment | NLC Firm",
      metaDescription: "62-item HIPAA gap assessment covering all safeguard categories. Know your compliance score before an OCR audit does it for you.",
      sections: [
        { title: "Administrative Safeguards", desc: "18 items covering risk analysis, workforce training, access controls, and contingency planning" },
        { title: "Physical Safeguards",       desc: "12 items covering facility access, workstation use, and device/media controls" },
        { title: "Technical Safeguards",      desc: "14 items covering access controls, audit controls, integrity, and transmission security" },
        { title: "Organizational Standards", desc: "10 items covering BAAs, group health plan requirements, and documentation standards" },
        { title: "Risk Scoring Matrix",       desc: "Severity-weighted scoring model that produces a compliance readiness score (0–100)" },
        { title: "Remediation Priority Grid", desc: "Effort vs. impact matrix for sequencing your top 10 remediation actions" }
      ],
      notFor: "Organizations that have completed a formal HIPAA risk analysis within the last 12 months and maintain an active compliance officer program",
      faq: [
        { q: "Does this replace a formal Risk Analysis?", a: "No. This assessment identifies gaps and prioritizes remediation. A formal HIPAA Risk Analysis (required under §164.308) requires a more structured process. This is an excellent starting point to understand your exposure." },
        { q: "Is this current with the 2024 HIPAA updates?", a: "Yes. The assessment reflects the current HIPAA Security Rule requirements and incorporates guidance from the HHS Office for Civil Rights." },
        { q: "Can I use this for a HIPAA training exercise?", a: "Yes. Many compliance officers use this assessment as part of a tabletop exercise or staff training session." }
      ]
    },
    {
      sku: "NLC-HC-003",
      name: "Healthcare Staffing Cost Model",
      slug: "healthcare-staffing-cost-model",
      sector: "healthcare",
      buyerRoles: ["Practice Administrator", "CFO", "Operations Director"],
      problem: "Most practices don't have a clear model for the true cost of FTE versus agency staff, or for quantifying the financial impact of overtime creep before it shows up in the monthly P&L. By the time the numbers are visible, the decisions that caused them are six weeks in the past.",
      tagline: "Model FTE vs. contractor tradeoffs, overtime drivers, and headcount cost before your P&L shows the damage.",
      deliverables: [
        "Multi-role staffing cost model (up to 20 positions)",
        "FTE vs. agency cost comparison calculator",
        "Overtime cost tracker with threshold alerts",
        "Benefits burden rate guide (healthcare industry standard)",
        "Staffing scenario comparison (current vs. optimized)"
      ],
      format: ["Spreadsheet", "Guide"],
      price: 147,
      tier: "premium",
      upsellScope: "Workforce planning project",
      upsellPrice: "$3,500–$7,000 flat fee",
      upsellTrigger: "Your model shows agency spend exceeding FTE breakeven — a 90-day workforce plan typically recovers 15–25% of that cost.",
      priority: 3,
      seoKeyword: "healthcare staffing cost model spreadsheet",
      metaTitle: "Healthcare Staffing Cost Model | NLC Firm",
      metaDescription: "Model FTE vs. agency staff costs, overtime drivers, and headcount scenarios. Built for medical practice administrators and operations directors.",
      sections: [
        { title: "FTE Cost Build",         desc: "Base salary, benefits burden (25% default), PTO cost, training, and total annual cost per role" },
        { title: "Agency Cost Comparison", desc: "Bill rate vs. W2 equivalent cost with breakeven calculation by role and hours per week" },
        { title: "Overtime Tracker",       desc: "Weekly overtime by role with annualized cost projection and threshold alert (1.5x trigger)" },
        { title: "Headcount Scenarios",    desc: "Side-by-side comparison of current state vs. 2–3 optimized staffing configurations" },
        { title: "Benefits Burden Guide",  desc: "Healthcare industry standard rates for FICA, health insurance, retirement, and workers' comp" }
      ],
      notFor: "Practices with 50+ employees that already have an HR department managing formal workforce planning",
      faq: [
        { q: "Does this work for multi-location practices?", a: "Yes. The model supports separate location tabs that roll up to a consolidated headcount dashboard." },
        { q: "What benefits rate does the model assume?", a: "The default is 25% of base salary. You can override this globally or by individual role to match your actual benefits spend." }
      ]
    },

    /* ── LEGAL ─────────────────────────────────────────────── */
    {
      sku: "NLC-LG-001",
      name: "Law Firm Profitability Diagnostic",
      slug: "law-firm-profitability-diagnostic",
      sector: "legal",
      buyerRoles: ["Managing Partner", "Operations Director", "CFO"],
      problem: "Revenue at most law firms looks strong until you apply realization rates. A firm billing $3M with a 78% realization rate is losing $660,000 in earned revenue to write-offs, write-downs, and uncollected fees. Most managing partners know this is happening. Almost none have a structured diagnostic to find exactly where.",
      tagline: "Surface the realization rate, write-off, and overhead problems silently killing your firm's margins — before you set next year's budget.",
      deliverables: [
        "Practice group P&L template (up to 8 practice areas)",
        "Realization rate waterfall by attorney and practice group",
        "Write-off category analysis with root cause taxonomy",
        "Overhead allocation model by headcount and revenue",
        "Firm profitability dashboard with key ratios"
      ],
      format: ["Workbook", "Dashboard"],
      price: 197,
      tier: "premium",
      upsellScope: "Firm operations retainer",
      upsellPrice: "$3,500–$5,500/month",
      upsellTrigger: "Your realization rate is 7+ points below the industry average of 85%. That gap has a dollar value — and a fixable cause.",
      priority: 1,
      seoKeyword: "law firm profitability diagnostic workbook",
      metaTitle: "Law Firm Profitability Diagnostic | NLC Firm",
      metaDescription: "Analyze realization rates, write-offs, and overhead allocation across practice groups. A structured diagnostic for managing partners.",
      sections: [
        { title: "Realization Waterfall",   desc: "Billed → Collected waterfall by attorney, practice group, and client type with industry benchmarks" },
        { title: "Write-Off Analysis",      desc: "Category breakdown (discretionary, client dispute, billing error) with cost-per-category trending" },
        { title: "Practice Group P&L",      desc: "Revenue, direct costs, allocated overhead, and contribution margin by practice area" },
        { title: "Overhead Allocation",     desc: "Methodologies for allocating admin, facilities, and support staff cost across revenue-producing practice groups" },
        { title: "Rate Analysis",           desc: "Effective rate vs. standard rate by timekeeper with rate realization trend" },
        { title: "Profitability Dashboard", desc: "Key firm ratios: revenue per lawyer, profit per equity partner, overhead ratio, collection ratio" }
      ],
      notFor: "Solo practitioners or firms with fewer than 3 attorneys — the practice group model requires at least 2 distinct practice areas to produce meaningful analysis",
      faq: [
        { q: "What billing software data do I need?", a: "You need AR aging reports by timekeeper and a billing/collection summary by matter or client. Most billing systems (Clio, MyCase, TimeSolv, Juris) can export these." },
        { q: "Does this cover contingency fee practices?", a: "Yes. There's a separate contingency matter tracker that accounts for the deferred revenue recognition model." }
      ]
    },
    {
      sku: "NLC-LG-002",
      name: "Legal Department Vendor Audit Toolkit",
      slug: "legal-department-vendor-audit-toolkit",
      sector: "legal",
      buyerRoles: ["General Counsel", "Legal Operations Director", "CFO"],
      problem: "Outside counsel spend is one of the most opaque line items in any organization's budget. Relationships govern spend more than performance, and most legal departments have never systematically scored their panel firms against actual matter outcomes.",
      tagline: "Score and right-size your outside counsel relationships before the next budget cycle.",
      deliverables: [
        "Outside counsel performance scoring matrix (8 dimensions)",
        "Matter-level spend tracker with comparison by firm",
        "Panel review framework with recommendation guide",
        "Preferred provider criteria template",
        "Vendor rationalization decision tree"
      ],
      format: ["Tracker", "Scoring Matrix", "Guide"],
      price: 127,
      tier: "core",
      upsellScope: "Legal operations advisory",
      upsellPrice: "$2,500–$4,500/month",
      upsellTrigger: "Your scoring shows 2–3 panel firms consistently underperforming on cost predictability. A panel restructure typically recovers 12–18% of outside counsel spend.",
      priority: 3,
      seoKeyword: "outside counsel vendor audit legal department",
      metaTitle: "Legal Department Vendor Audit Toolkit | NLC Firm",
      metaDescription: "Score outside counsel performance, track matter spend, and right-size your panel before the next budget cycle.",
      sections: [
        { title: "Firm Scoring Matrix",      desc: "8-dimension scoring: cost predictability, matter expertise, communication quality, billing accuracy, outcome rate, response time, staffing efficiency, relationship health" },
        { title: "Matter Spend Tracker",     desc: "Per-matter cost, budgeted vs. actual, blended rate, and hours by timekeeper level" },
        { title: "Panel Review Framework",   desc: "Structured review process for annual outside counsel evaluations with documentation templates" },
        { title: "Rationalization Decision", desc: "Decision tree for panel expansion, reduction, or restructuring based on scoring outcomes" }
      ],
      notFor: "Solo in-house counsel without an outside counsel panel, or organizations spending less than $150,000 annually on outside legal fees",
      faq: [
        { q: "How many firms can the tracker handle?", a: "The scoring matrix supports up to 15 outside counsel firms." }
      ]
    },

    /* ── REAL ESTATE ───────────────────────────────────────── */
    {
      sku: "NLC-RE-001",
      name: "Real Estate Investor Deal Analyzer",
      slug: "real-estate-investor-deal-analyzer",
      sector: "real-estate",
      buyerRoles: ["Real Estate Investor", "Broker", "Asset Manager"],
      problem: "Most real estate deals look good on the back of a napkin. The ones that don't perform almost always have an error in one of three places: the rent growth assumption, the exit cap rate, or the debt service calculation. This model forces you to confront all three before you're under contract.",
      tagline: "Underwrite any residential or commercial acquisition in under 30 minutes with a model that surfaces hidden risk before you're under contract.",
      deliverables: [
        "DCF model with 10-year cash flow projection",
        "NOI calculation with expense category breakdown",
        "Debt service calculator (fixed, floating, IO options)",
        "Deal comparison scorecard (up to 5 deals)",
        "Return metrics: IRR, CoC, equity multiple, cap rate"
      ],
      format: ["Spreadsheet", "Guide"],
      price: 97,
      tier: "core",
      upsellScope: "Transaction advisory",
      upsellPrice: "$2,500–$5,000 flat fee",
      upsellTrigger: "This deal has hidden downside risk in the debt service coverage under a rate stress scenario. Let's model the capital stack together.",
      priority: 1,
      seoKeyword: "real estate investor deal analyzer spreadsheet",
      metaTitle: "Real Estate Investor Deal Analyzer | NLC Firm",
      metaDescription: "Underwrite residential and commercial acquisitions in 30 minutes. DCF model, NOI calculator, debt service, and return metrics in one workbook.",
      sections: [
        { title: "Acquisition Inputs",   desc: "Purchase price, closing costs, financing terms, and capital reserve assumptions" },
        { title: "NOI Calculator",       desc: "Gross potential rent, vacancy/credit loss, other income, and 12 operating expense categories" },
        { title: "DCF Model",            desc: "10-year projected cash flows with rent growth, expense inflation, and reversion sale calculation" },
        { title: "Debt Service Module",  desc: "Fixed and floating rate options, interest-only period, balloon payment, and DSCR sensitivity" },
        { title: "Return Dashboard",     desc: "IRR, cash-on-cash return, equity multiple, and cap rate vs. market benchmark" },
        { title: "Deal Comparison",      desc: "Side-by-side comparison of up to 5 acquisition opportunities on all key metrics" }
      ],
      notFor: "Commercial real estate professionals modeling portfolio-level acquisitions with institutional equity structures — this tool is optimized for single-asset and small portfolio analysis",
      faq: [
        { q: "Does this work for multifamily?", a: "Yes. The model supports 1–100+ unit multifamily, single-family rentals, commercial strip centers, and mixed-use. You select the property type in the assumptions tab." },
        { q: "Can I model a value-add scenario?", a: "Yes. There's a renovation budget input that depletes cash in years 1–2 and a post-renovation rent schedule that reflects the stabilized income." }
      ]
    },
    {
      sku: "NLC-RE-002",
      name: "Property Management SOPs Starter Kit",
      slug: "property-management-sops-starter-kit",
      sector: "real-estate",
      buyerRoles: ["Property Management Director", "PM Firm Owner", "Real Estate Investor"],
      problem: "Every time a property manager leaves or a tenant interaction goes sideways, the problem almost always traces back to a process that only existed in someone's head. Documented SOPs are not bureaucracy — they're the difference between a portfolio that runs and one that depends on you.",
      tagline: "12 ready-to-use SOPs for the tenant, maintenance, and lease management processes that break down most when your team changes.",
      deliverables: [
        "12 fully written SOPs covering the full tenant lifecycle",
        "SOP implementation guide with 30-day rollout plan",
        "Staff acknowledgment forms (editable)",
        "SOP index and version control template",
        "Quick-reference checklists for each SOP"
      ],
      format: ["SOP Bundle", "Checklists", "Guide"],
      price: 147,
      tier: "premium",
      upsellScope: "Operations advisory retainer",
      upsellPrice: "$2,000–$3,500/month",
      upsellTrigger: "Your SOPs are documented — now let's build the quality control layer that keeps staff following them.",
      priority: 3,
      seoKeyword: "property management SOP templates bundle",
      metaTitle: "Property Management SOPs Starter Kit | NLC Firm",
      metaDescription: "12 ready-to-use SOPs for tenant onboarding, maintenance, lease renewals, and move-out. Covers the full property management lifecycle.",
      sections: [
        { title: "Tenant Application & Screening", desc: "Application intake, background check process, income verification, and approval decision documentation" },
        { title: "Move-In Process",               desc: "Lease execution, key handover, unit inspection, utility setup, and welcome communication sequence" },
        { title: "Maintenance Request Handling",  desc: "Intake, triage, vendor dispatch, completion verification, and tenant follow-up" },
        { title: "Rent Collection & Late Fees",   desc: "Payment posting, grace period enforcement, late fee calculation, and delinquency escalation" },
        { title: "Lease Renewal Process",         desc: "Renewal outreach timeline, rate adjustment protocol, lease re-execution, and opt-out documentation" },
        { title: "Move-Out & Security Deposit",   desc: "Notice receipt, pre-move-out inspection, final walk, damage assessment, and deposit disposition" }
      ],
      notFor: "Large institutional property management firms with dedicated compliance or operations teams — this kit is designed for 1–50 unit operators",
      faq: [
        { q: "Are these editable?", a: "Yes. All SOPs are delivered as editable Word documents and PDFs." },
        { q: "Do these comply with fair housing law?", a: "The SOPs are drafted with fair housing principles in mind, but they are not legal advice. You should have your attorney review for state-specific compliance before deployment." }
      ]
    },
    {
      sku: "NLC-RE-003",
      name: "Real Estate Team Expansion Playbook",
      slug: "real-estate-team-expansion-playbook",
      sector: "real-estate",
      buyerRoles: ["Brokerage Owner", "Team Leader", "Producing Agent"],
      problem: "Bringing on agents without a team P&L, a split model, and a production threshold is not growth — it's adding payroll. Most team leaders discover this 12 months in when their personal income has dropped and team members are underperforming against the support cost they generate.",
      tagline: "Build the P&L, splits model, and hiring criteria before you sign your first team member.",
      deliverables: [
        "Team P&L model (up to 15 agents)",
        "Commission split calculator with breakeven production levels",
        "Agent hiring criteria scorecard",
        "Team profitability by agent tier",
        "90-day agent onboarding milestone plan"
      ],
      format: ["Workbook", "Spreadsheet"],
      price: 127,
      tier: "core",
      upsellScope: "Growth advisory retainer",
      upsellPrice: "$2,000–$3,500/month",
      upsellTrigger: "Your model shows the team breaks even at 18 transactions/month — let's build the lead generation system that gets you there.",
      priority: 4,
      seoKeyword: "real estate team expansion plan model",
      metaTitle: "Real Estate Team Expansion Playbook | NLC Firm",
      metaDescription: "Model team P&L, commission splits, and agent breakeven before you hire. Built for brokerage owners ready to scale past the solo producer ceiling.",
      sections: [
        { title: "Team P&L Model",           desc: "Revenue by agent tier, split structure, team expenses, and net team contribution margin" },
        { title: "Split Calculator",         desc: "Breakeven production level per split tier with comparison of cap vs. no-cap structures" },
        { title: "Agent Hiring Scorecard",   desc: "12-criteria evaluation for agent candidates: production history, lead sources, coachability, and culture fit" },
        { title: "Onboarding Milestone Plan", desc: "90-day plan for new agent integration: systems, training, first deal support, and 30-60-90 reviews" }
      ],
      notFor: "Single-agent producers not yet consistently producing 24+ transactions per year — build the personal business first, then the team",
      faq: [
        { q: "Does this cover team models at large franchises?", a: "Yes. The split model works for independent brokerages and franchise models. You input your cap structure and the model handles the math." }
      ]
    },

    /* ── PROFESSIONAL SERVICES ─────────────────────────────── */
    {
      sku: "NLC-PS-001",
      name: "CPA Firm Client Onboarding System",
      slug: "cpa-firm-client-onboarding-system",
      sector: "professional-services",
      buyerRoles: ["Firm Owner", "Managing Partner", "Client Services Director"],
      problem: "Inconsistent onboarding is where scope creep starts. When a client's first 30 days involve chasing documents, re-explaining what's included, and undocumented verbal requests, you've created the conditions for every billing dispute you'll have in year one.",
      tagline: "Standardize the intake, scope documentation, and first-30-days process so every client relationship starts with zero ambiguity.",
      deliverables: [
        "8 fully written SOPs for the client onboarding lifecycle",
        "Engagement letter scope template (editable)",
        "Document request checklist by service type",
        "Client intake form with data capture fields",
        "30-day onboarding milestone tracker"
      ],
      format: ["SOP Bundle", "Templates", "Tracker"],
      price: 127,
      tier: "core",
      upsellScope: "Client operations retainer",
      upsellPrice: "$1,800–$3,000/month",
      upsellTrigger: "Onboarding is documented. The next problem is usually scope creep at month 3 — let's build the change order system.",
      priority: 3,
      seoKeyword: "CPA firm client onboarding SOP system",
      metaTitle: "CPA Firm Client Onboarding System | NLC Firm",
      metaDescription: "8 SOPs, scope templates, and a 30-day milestone tracker for CPA firms that want consistent client onboarding without the firefighting.",
      sections: [
        { title: "New Client Intake",      desc: "Referral intake form, initial consultation process, and prospect-to-client conversion workflow" },
        { title: "Engagement Letter",      desc: "Scope-of-services template, fee agreement, and mutual expectations documentation" },
        { title: "Document Collection",    desc: "Service-type-specific document request checklists (tax, bookkeeping, advisory, payroll)" },
        { title: "System Access & Setup",  desc: "Software access provisioning checklist, data migration steps, and security protocol" },
        { title: "Welcome Communication",  desc: "Email sequence templates for days 1, 7, and 30 of client onboarding" },
        { title: "30-Day Milestone Tracker", desc: "Status tracker for each onboarding phase with completion dates and responsible party" }
      ],
      notFor: "Solo practitioners with fewer than 10 active clients — the SOP system is designed for teams with at least 2–3 staff involved in client delivery",
      faq: [
        { q: "Are the templates specific to CPA firms or general?", a: "They are written for accounting firm contexts specifically — tax, bookkeeping, payroll, and advisory services are all covered with service-type variations." }
      ]
    },
    {
      sku: "NLC-PS-002",
      name: "Marketing Agency Pricing & Scope Toolkit",
      slug: "marketing-agency-pricing-scope-toolkit",
      sector: "professional-services",
      buyerRoles: ["Agency Owner", "Account Director", "Operations Lead"],
      problem: "Agency owners underprice retainers because they estimate hours optimistically, forget overhead allocation, and don't account for the 30% of time that gets absorbed in client management, revisions, and unbillable strategy work. They discover this when they're six months into a retainer that's lost money since month two.",
      tagline: "Stop underpricing retainers and build scope-of-work documents that hold up when a client says 'that's included.'",
      deliverables: [
        "Retainer pricing calculator with overhead allocation",
        "Scope-of-work builder (modular service blocks)",
        "Out-of-scope change order template",
        "Service menu framework with positioning guide",
        "Rate card builder with utilization rate math"
      ],
      format: ["Workbook", "Templates", "Calculator"],
      price: 147,
      tier: "premium",
      upsellScope: "Agency pricing strategy project",
      upsellPrice: "$3,500 flat fee",
      upsellTrigger: "Your calculator shows you're leaving $80K/year in underbilled scope. A one-day pricing rebuild typically recovers that in 90 days.",
      priority: 1,
      seoKeyword: "marketing agency pricing scope toolkit workbook",
      metaTitle: "Marketing Agency Pricing & Scope Toolkit | NLC Firm",
      metaDescription: "Price retainers profitably and build SOWs that prevent scope creep. Includes rate calculator, SOW builder, and change order templates.",
      sections: [
        { title: "Pricing Calculator",    desc: "Hourly cost build: direct labor, overhead allocation, and target margin by service type" },
        { title: "Scope-of-Work Builder", desc: "Modular service blocks you assemble into client-specific SOWs with clearly defined deliverables and exclusions" },
        { title: "Change Order Template", desc: "Formal out-of-scope request process with approval documentation and billing activation" },
        { title: "Service Menu",          desc: "Service tier framework (core, growth, retainer) with positioning language and ideal client fit" },
        { title: "Rate Card Builder",     desc: "Blended rate vs. role-based rate comparison with utilization rate assumptions (aim for 65–75%)" }
      ],
      notFor: "Freelancers or solo consultants with fewer than 3 active clients — the overhead allocation model assumes a team of at least 2–3 people",
      faq: [
        { q: "Does this work for digital, creative, and PR agencies?", a: "Yes. The service blocks are pre-built for SEO/SEM, content, social, PR, paid media, web design, and email — you include and exclude based on your service mix." },
        { q: "What utilization rate should I target?", a: "The industry benchmark for profitable agencies is 65–70% billable utilization. The toolkit models your pricing at multiple utilization scenarios so you know the floor." }
      ]
    },
    {
      sku: "NLC-PS-003",
      name: "HR Consulting Practice Starter Pack",
      slug: "hr-consulting-practice-starter-pack",
      sector: "professional-services",
      buyerRoles: ["Independent HR Consultant", "HR Fractional", "People Operations Advisor"],
      problem: "Most independent HR consultants have deep expertise and weak business infrastructure. They undercharge because they don't have a structured service menu. They lose clients because they don't have a documented engagement lifecycle. And they stall at $150K in revenue because they can't systematize what they do.",
      tagline: "Structure your service menu, pricing, and client lifecycle so your HR practice runs like a business, not a freelance arrangement.",
      deliverables: [
        "Service menu framework with 3-tier pricing model",
        "Client agreement and SOW template",
        "HR consulting intake questionnaire",
        "Engagement scope guide by HR function (12 areas)",
        "Practice revenue model planner"
      ],
      format: ["Guide", "Templates", "Workbook"],
      price: 97,
      tier: "core",
      upsellScope: "HR practice development advisory",
      upsellPrice: "$1,500–$2,500/month",
      upsellTrigger: "Your revenue model shows a $280K ceiling at current capacity. Positioning and packaging changes typically break that ceiling inside 90 days.",
      priority: 4,
      seoKeyword: "HR consulting practice starter kit templates",
      metaTitle: "HR Consulting Practice Starter Pack | NLC Firm",
      metaDescription: "Service menu, pricing model, and engagement templates for independent HR consultants ready to run a structured practice.",
      sections: [
        { title: "Service Menu Framework", desc: "Core, growth, and advisory tiers across 12 HR function areas with positioning language" },
        { title: "Pricing Model",          desc: "Hourly, project, and retainer pricing for each service tier with margin benchmarks" },
        { title: "Client Agreement",       desc: "Editable consulting agreement covering scope, IP, confidentiality, and termination" },
        { title: "Intake Questionnaire",   desc: "Structured intake covering HR maturity, immediate needs, budget, and decision timeline" },
        { title: "Revenue Planner",        desc: "Monthly revenue model by client mix with 3-scenario projection (conservative/base/growth)" }
      ],
      notFor: "HR consultants with more than 5 years of independent practice experience — this kit is designed for practitioners in their first 1–3 years of independent work",
      faq: [
        { q: "Does this cover SHRM certification content?", a: "No. This is a business development and practice management toolkit, not certification prep content." }
      ]
    },

    /* ── RETAIL / E-COMM ───────────────────────────────────── */
    {
      sku: "NLC-RT-001",
      name: "Retail Margin Recovery Workbook",
      slug: "retail-margin-recovery-workbook",
      sector: "retail",
      buyerRoles: ["Store Owner", "Buyer", "Merchandise Director"],
      problem: "Gross margin erosion in retail rarely comes from one thing. It comes from shrink that's slightly higher than reported, markdown timing that's a week late, and vendor cost increases that got absorbed without a price adjustment. Each of those individually is manageable. Together, they can compress margin by 8–12 points without a single person noticing in real time.",
      tagline: "Find the shrink, markdown, and vendor cost problems eroding your gross margin before your year-end financials make them obvious.",
      deliverables: [
        "SKU-level margin model (up to 500 SKUs)",
        "Shrink and inventory adjustment tracker",
        "Markdown analysis: timing, depth, and recovery rate",
        "Vendor cost increase impact calculator",
        "Margin recovery action plan template"
      ],
      format: ["Workbook", "Tracker"],
      price: 97,
      tier: "core",
      upsellScope: "Merchandise planning advisory",
      upsellPrice: "$2,000–$3,500/month",
      upsellTrigger: "Your model shows 3.2 points of margin being lost to late markdowns. A buying calendar and clearance process can recover most of that.",
      priority: 3,
      seoKeyword: "retail margin recovery workbook spreadsheet",
      metaTitle: "Retail Margin Recovery Workbook | NLC Firm",
      metaDescription: "SKU-level margin model, shrink tracker, and markdown analysis for retail owners watching gross margin decline without a clear cause.",
      sections: [
        { title: "SKU Margin Model",     desc: "Cost, retail, initial margin, and current margin by SKU with category rollup" },
        { title: "Shrink Tracker",       desc: "Inventory adjustment categories: known theft, unknown loss, receiving errors, and administrative adjustments" },
        { title: "Markdown Analysis",    desc: "Markdown timing vs. sell-through rate, depth analysis, and margin recovery rate per markdown event" },
        { title: "Vendor Cost Tracker",  desc: "Cost increase log with price adjustment status and margin impact per vendor/SKU" },
        { title: "Recovery Action Plan", desc: "Prioritized actions by margin impact with target margin, action owner, and 30-day deadline" }
      ],
      notFor: "E-commerce businesses without physical inventory — this workbook is optimized for brick-and-mortar and omnichannel retailers with physical product",
      faq: [
        { q: "Does this connect to my POS system?", a: "No. You export sales and inventory data from your POS and paste into the workbook. It works with any POS that can export to Excel or CSV." }
      ]
    },
    {
      sku: "NLC-RT-002",
      name: "E-Commerce Launch Readiness Checklist",
      slug: "ecommerce-launch-readiness-checklist",
      sector: "retail",
      buyerRoles: ["E-Commerce Founder", "Store Manager", "Digital Commerce Lead"],
      problem: "Most e-commerce launch failures aren't about the product or the market. They're about the 15 things that were supposed to be done in the last two weeks before launch that got deferred, and the 10 things nobody thought to check until a customer found them.",
      tagline: "The 84-item pre-launch checklist that catches setup gaps, compliance gaps, and operational gaps before they become opening-week disasters.",
      deliverables: [
        "84-item launch readiness checklist across 7 categories",
        "Launch week staffing and support plan template",
        "Customer communications sequence (pre and post-launch)",
        "Pre-launch budget reconciliation template",
        "30-day post-launch review framework"
      ],
      format: ["Checklist", "Guide"],
      price: 67,
      tier: "entry",
      upsellScope: "E-commerce operations advisory",
      upsellPrice: "$1,500–$2,500/month",
      upsellTrigger: "Your checklist shows 9 items incomplete in the customer experience category. We can close those in 2 weeks before your launch date.",
      priority: 4,
      seoKeyword: "ecommerce launch readiness checklist template",
      metaTitle: "E-Commerce Launch Readiness Checklist | NLC Firm",
      metaDescription: "84-item pre-launch checklist across tech, compliance, operations, marketing, and customer experience. Catch gaps before they become opening-week fires.",
      sections: [
        { title: "Technology & Platform",    desc: "22 items: checkout flow, payment processing, SSL, mobile responsiveness, speed, and integrations" },
        { title: "Product & Inventory",      desc: "14 items: product listings, photography, pricing, inventory counts, and fulfillment setup" },
        { title: "Legal & Compliance",       desc: "12 items: terms, privacy policy, return policy, tax nexus, and age verification if applicable" },
        { title: "Marketing & SEO",          desc: "14 items: GA4, Meta Pixel, email capture, sitemap submission, and pre-launch content" },
        { title: "Customer Experience",      desc: "12 items: order confirmation flow, shipping communication, support inbox, and FAQ page" },
        { title: "Operations & Fulfillment", desc: "10 items: carrier setup, packing materials, SLA definition, and return/exchange process" }
      ],
      notFor: "Established e-commerce businesses relaunching on a new platform — this checklist is optimized for net-new store launches, not migrations",
      faq: [
        { q: "Is this platform-specific?", a: "No. The checklist is platform-agnostic and covers Shopify, WooCommerce, BigCommerce, and custom builds. Platform-specific notes are called out where relevant." }
      ]
    },

    /* ── RESTAURANTS / HOSPITALITY ─────────────────────────── */
    {
      sku: "NLC-RH-001",
      name: "Restaurant Prime Cost Controller",
      slug: "restaurant-prime-cost-controller",
      sector: "restaurants",
      buyerRoles: ["Restaurant Owner", "General Manager", "F&B Director"],
      problem: "Most restaurant owners find out their prime cost is too high when they read their monthly P&L. By then, the week that pushed them over threshold is six to eight weeks in the past. The decisions that caused it — over-scheduling on a slow Tuesday, a produce order that didn't get checked in, a prep team that ran two hours of unbudgeted overtime — are already forgotten.",
      tagline: "Track food and labor against your prime cost target every single week, not every quarter when it's too late to fix.",
      deliverables: [
        "Weekly prime cost tracker (food + labor)",
        "Prime cost dashboard with trailing 12-week trend",
        "Labor scheduling variance analysis",
        "Food cost category breakdown by daypart",
        "Industry benchmark reference by restaurant type"
      ],
      format: ["Tracker", "Dashboard"],
      price: 127,
      tier: "core",
      upsellScope: "Restaurant operations advisory retainer",
      upsellPrice: "$1,500–$2,500/month",
      upsellTrigger: "Your tracker shows labor variance every Thursday night shift. That pattern has a $4,200/month cost. Let's fix the scheduling logic.",
      priority: 1,
      seoKeyword: "restaurant prime cost tracker spreadsheet weekly",
      metaTitle: "Restaurant Prime Cost Controller | NLC Firm",
      metaDescription: "Track food and labor costs weekly against your prime cost target. Trailing 12-week trend, labor variance analysis, and industry benchmarks included.",
      sections: [
        { title: "Weekly Prime Cost Input",  desc: "Food cost by category + labor cost by position entered weekly — dashboard updates automatically" },
        { title: "Trailing 12-Week Trend",   desc: "Prime cost % chart with 55–60% target line and week-over-week variance flagging" },
        { title: "Labor Variance Analysis",  desc: "Scheduled hours vs. actual hours by shift with overtime cost and variance by day of week" },
        { title: "Food Cost Breakdown",      desc: "Cost by category (produce, protein, dairy, dry goods, beverages) with waste factor tracking" },
        { title: "Benchmark Reference",      desc: "Prime cost targets by concept type: fine dining (55–60%), casual (58–62%), fast casual (60–65%)" }
      ],
      notFor: "Food trucks, caterers, or ghost kitchens with fewer than $300K in annual revenue — the prime cost model requires consistent weekly sales data to produce meaningful trends",
      faq: [
        { q: "Does this integrate with my POS?", a: "No. You enter weekly summary numbers from your POS and payroll system. Most POS systems can produce the weekly cost summary in under 5 minutes." },
        { q: "What's a good prime cost target?", a: "Industry benchmark is 55–62% of revenue depending on your concept. Full-service restaurants should target 58–60%. Fast casual should aim for 60–63%." }
      ]
    },
    {
      sku: "NLC-RH-002",
      name: "Hospitality Hiring & Retention Playbook",
      slug: "hospitality-hiring-retention-playbook",
      sector: "restaurants",
      buyerRoles: ["HR Director", "Restaurant Owner", "Operations Manager"],
      problem: "High turnover in hospitality isn't inevitable — it's a symptom of a broken hiring and first-90-days process. Most restaurants hire fast, onboard poorly, and then are surprised when the employee who seemed promising is gone by week six.",
      tagline: "Fix the interview, onboarding, and first-90-day experience that's driving your turnover before you post another job listing.",
      deliverables: [
        "Position-specific interview question banks (FOH/BOH/Management)",
        "30-60-90 day onboarding plan template",
        "Staff retention risk assessment",
        "Recognition and feedback cadence guide",
        "Exit interview framework with trend tracking"
      ],
      format: ["Guide", "Templates"],
      price: 97,
      tier: "core",
      upsellScope: "HR advisory retainer",
      upsellPrice: "$1,500–$2,500/month",
      upsellTrigger: "Your retention risk assessment shows BOH turnover concentrated at the 45-day mark. That's fixable in the onboarding design, not the hiring process.",
      priority: 4,
      seoKeyword: "restaurant hospitality hiring retention playbook",
      metaTitle: "Hospitality Hiring & Retention Playbook | NLC Firm",
      metaDescription: "Interview guides, 30-60-90 onboarding plans, and retention frameworks for hospitality operators ready to break the turnover cycle.",
      sections: [
        { title: "Interview Question Banks", desc: "FOH, BOH, and management-specific behavioral interview questions with evaluation rubric" },
        { title: "Onboarding Plan",          desc: "30-60-90 day milestone plan with training checkpoints, feedback sessions, and performance gates" },
        { title: "Retention Risk Assessment", desc: "15-factor risk assessment identifying which roles and demographics are most vulnerable to turnover" },
        { title: "Recognition Cadence",      desc: "Weekly and monthly recognition touchpoints with low-cost, high-impact recognition mechanisms" },
        { title: "Exit Interview Framework", desc: "Structured exit interview guide with trend tracking template to identify systemic retention issues" }
      ],
      notFor: "Multi-concept operators with dedicated HR departments — this playbook is designed for owner-operated restaurants and small groups up to 5 locations",
      faq: [
        { q: "Does this cover tipped employee law?", a: "The playbook references tip credit and tip pooling considerations but is not legal advice. Tipped employee law varies significantly by state." }
      ]
    },

    /* ── CONSTRUCTION / TRADES ─────────────────────────────── */
    {
      sku: "NLC-CN-001",
      name: "Construction Project Profitability Tracker",
      slug: "construction-project-profitability-tracker",
      sector: "construction",
      buyerRoles: ["General Contractor", "Project Manager", "Construction CFO"],
      problem: "Job cost overruns in construction are almost always visible in the data weeks before they hit the P&L — but only if someone is tracking labor hours, materials, and subcontractor costs against the estimate in real time. Most GCs track this monthly, which means they're reading last month's fire.",
      tagline: "Track job costs against your estimate in real time so overruns appear on the dashboard, not on the final invoice.",
      deliverables: [
        "Per-job cost tracker (labor, materials, subs, equipment)",
        "Estimate vs. actual variance dashboard",
        "Change order log with approval tracking",
        "Cost-at-completion forecast by job",
        "Monthly portfolio profitability summary"
      ],
      format: ["Spreadsheet", "Tracker", "Dashboard"],
      price: 127,
      tier: "core",
      upsellScope: "Project controls retainer",
      upsellPrice: "$2,500–$4,500/month",
      upsellTrigger: "Your tracker shows consistent overruns on electrical subcontractors across 4 jobs. That's a bid scope issue, not an execution issue.",
      priority: 1,
      seoKeyword: "construction project profitability job cost tracker",
      metaTitle: "Construction Project Profitability Tracker | NLC Firm",
      metaDescription: "Track labor, materials, and sub costs against your estimate weekly. Change order log, cost-at-completion forecast, and portfolio summary included.",
      sections: [
        { title: "Job Setup",                desc: "Contract value, estimated costs by category, and project start/end dates" },
        { title: "Weekly Cost Entry",        desc: "Labor hours, material invoices, sub billings, and equipment costs entered weekly by category" },
        { title: "Variance Dashboard",       desc: "Estimate vs. actual by cost category with % over/under and red/yellow/green status indicators" },
        { title: "Change Order Log",         desc: "Change order number, scope, cost impact, approval status, and billing adjustment tracking" },
        { title: "Cost-at-Completion",       desc: "Projected final cost based on current spend rate and remaining scope — updated automatically" },
        { title: "Portfolio Summary",        desc: "All active jobs on one dashboard: contract value, cost to date, projected margin, and status" }
      ],
      notFor: "Enterprise construction firms with dedicated project accounting software (Procore, Sage 300, Viewpoint) — this tracker is designed for GCs running 3–25 concurrent projects",
      faq: [
        { q: "How many jobs can I track simultaneously?", a: "The tracker is pre-built for 20 concurrent jobs. Additional tabs can be added using the same template structure." },
        { q: "Does it handle retention?", a: "Yes. There's a retention receivable field in the contract value section that tracks held amounts separately from collected revenue." }
      ]
    },
    {
      sku: "NLC-CN-002",
      name: "Trades Business Owner's Growth Blueprint",
      slug: "trades-business-owners-growth-blueprint",
      sector: "construction",
      buyerRoles: ["Trades Owner-Operator", "HVAC/Plumbing/Electrical Business Owner"],
      problem: "Most trades businesses stall at $1.5–2M because the owner is still the best technician, the primary salesperson, and the quality control department. The business hasn't grown — it's just created more work for one person. Getting above $3M requires systems, not more hours.",
      tagline: "A 90-day blueprint for trades owners who want to break through the $2M ceiling without working more hours.",
      deliverables: [
        "Business maturity scorecard (6 operational dimensions)",
        "Owner dependency analysis with liberation roadmap",
        "Revenue growth model planner (12-month)",
        "Hiring decision framework for first 3 key hires",
        "90-day implementation roadmap with weekly milestones"
      ],
      format: ["Workbook", "Scorecard", "Roadmap"],
      price: 147,
      tier: "premium",
      upsellScope: "Growth advisory retainer",
      upsellPrice: "$2,500–$4,000/month",
      upsellTrigger: "Your scorecard shows owner-dependency in 5 of 6 areas. That's the profile of a business that doubles revenue in 18 months once the systems are in place.",
      priority: 1,
      seoKeyword: "trades business owner growth blueprint plan",
      metaTitle: "Trades Business Owner's Growth Blueprint | NLC Firm",
      metaDescription: "A 90-day workbook for HVAC, plumbing, electrical, and roofing owners stuck under $2M who are ready to build a business that runs without them.",
      sections: [
        { title: "Business Maturity Scorecard", desc: "Score your business across 6 dimensions: sales, operations, financial management, team, systems, and owner independence" },
        { title: "Owner Dependency Analysis",   desc: "Map every core function to its current owner — identify where you're the bottleneck and what it costs" },
        { title: "Revenue Growth Planner",      desc: "12-month revenue model: service mix, average ticket, close rate, lead volume, and capacity utilization" },
        { title: "First 3 Hires Framework",     desc: "Decision framework for identifying the right first 3 hires based on your bottleneck analysis" },
        { title: "90-Day Roadmap",              desc: "Week-by-week implementation plan: first 30 days on systems, days 31–60 on team, days 61–90 on growth" }
      ],
      notFor: "Trades businesses under $500K in annual revenue — the blueprint assumes you have at least 2–3 field technicians and a consistent base of recurring customers",
      faq: [
        { q: "Does this apply to service trades only (HVAC, plumbing) or construction trades too?", a: "Both. The framework applies to any trades business: HVAC, plumbing, electrical, roofing, landscaping, and specialty construction. The revenue model inputs adjust to your service type." },
        { q: "How long does it take to complete the scorecard?", a: "The maturity scorecard takes 45–60 minutes. Most owners find the owner dependency map to be the most revealing exercise." }
      ]
    },

    /* ── NON-PROFIT ────────────────────────────────────────── */
    {
      sku: "NLC-NP-001",
      name: "Non-Profit Program Budget Builder",
      slug: "nonprofit-program-budget-builder",
      sector: "nonprofit",
      buyerRoles: ["Executive Director", "Finance Director", "Program Director"],
      problem: "Program budgets that can't withstand funder scrutiny almost always have the same problems: indirect costs that aren't allocated, personnel time that isn't documented to the program level, and expense categories that don't map to the chart of accounts the funder uses.",
      tagline: "Build program-level budgets that survive funder scrutiny and cost allocation audits from the first draft.",
      deliverables: [
        "Program-level P&L model (up to 6 programs)",
        "Indirect cost rate calculation and allocation model",
        "Personnel time allocation by program (FTE %)",
        "Budget narrative template by expense category",
        "Budget vs. actual variance tracker (monthly)"
      ],
      format: ["Spreadsheet", "Guide"],
      price: 97,
      tier: "core",
      upsellScope: "Non-profit finance advisory",
      upsellPrice: "$1,800–$3,000/month",
      upsellTrigger: "Your indirect cost rate calculation doesn't match your Form 990 allocation methodology. That's a funder audit flag. We can fix it in 30 days.",
      priority: 3,
      seoKeyword: "nonprofit program budget builder template",
      metaTitle: "Non-Profit Program Budget Builder | NLC Firm",
      metaDescription: "Program-level P&L, indirect cost allocation, and budget narrative templates for non-profits that need grant-ready financial documentation.",
      sections: [
        { title: "Program P&L Model",         desc: "Revenue (grants, fees, in-kind) and expenses by program with contribution margin and indirect allocation" },
        { title: "Indirect Cost Allocation",  desc: "NICRA-compatible indirect cost rate model with allocation base options (salaries, direct costs, square footage)" },
        { title: "Personnel Time Allocation", desc: "Staff time allocation by program as FTE percentage with documentation guidance for funders" },
        { title: "Budget Narrative Template", desc: "Narrative section templates by expense category with funder-facing justification language" },
        { title: "Variance Tracker",          desc: "Monthly budget vs. actual comparison by program with funder-reportable variance explanations" }
      ],
      notFor: "Start-up non-profits in their first fiscal year without a completed Form 990 — the indirect cost model requires at least one year of actual cost data",
      faq: [
        { q: "Is this OMB A-133 / 2 CFR 200 compliant?", a: "The indirect cost model follows 2 CFR 200 principles. This is not a substitute for a formal cost allocation plan required by federal awards." }
      ]
    },
    {
      sku: "NLC-NP-002",
      name: "Grant Readiness Self-Assessment",
      slug: "grant-readiness-self-assessment",
      sector: "nonprofit",
      buyerRoles: ["Development Director", "Executive Director", "Grant Writer"],
      problem: "Most organizations that lose grants didn't lose them because their program wasn't good. They lost them because the funder couldn't verify financial stability, governance health, or program effectiveness from the application materials. Fundability is an organizational condition — and it can be assessed and improved before you apply.",
      tagline: "Know your fundability score before you spend 40 hours writing a proposal you're unlikely to win.",
      deliverables: [
        "54-item grant readiness assessment across 6 dimensions",
        "Fundability score with dimension-level breakdown",
        "Gap prioritization guide (high/medium/low impact)",
        "Governance documentation checklist",
        "30-day readiness improvement action plan"
      ],
      format: ["Assessment", "Guide"],
      price: 67,
      tier: "entry",
      upsellScope: "Fundraising advisory",
      upsellPrice: "$1,500–$2,500/month",
      upsellTrigger: "Your fundability score is 58/100. Most private foundations want to see 75+ before a first-time grant. We can get you there in 60–90 days.",
      priority: 1,
      seoKeyword: "grant readiness self-assessment nonprofit",
      metaTitle: "Grant Readiness Self-Assessment | NLC Firm",
      metaDescription: "54-item assessment scoring your non-profit's fundability across financial health, governance, program evidence, and organizational capacity.",
      sections: [
        { title: "Financial Health",        desc: "10 items: operating reserves, revenue diversification, expense ratios, and audit status" },
        { title: "Governance",             desc: "9 items: board composition, meeting documentation, conflict of interest policy, and fiduciary oversight" },
        { title: "Program Effectiveness",  desc: "9 items: outcome tracking, program evaluation, theory of change documentation, and client data systems" },
        { title: "Organizational Capacity", desc: "10 items: staff capacity, volunteer infrastructure, technology systems, and leadership stability" },
        { title: "Compliance & Reporting", desc: "8 items: 990 timeliness, state registration, prior grant reporting history, and audit findings" },
        { title: "Narrative Readiness",    desc: "8 items: mission clarity, impact story quality, geographic focus definition, and population specificity" }
      ],
      notFor: "Organizations with annual revenue over $3M and a dedicated development staff — the assessment is calibrated for smaller organizations seeking their first $25K–$250K in institutional funding",
      faq: [
        { q: "Does this apply to government grants or just private foundations?", a: "The assessment is calibrated primarily for private foundation and corporate giving. Federal grant applications have additional requirements (SAM.gov, UEI, etc.) that are noted but not covered in depth." }
      ]
    },

    /* ── FINANCIAL SERVICES ────────────────────────────────── */
    {
      sku: "NLC-FS-001",
      name: "RIA Client Communication System",
      slug: "ria-client-communication-system",
      sector: "financial-services",
      buyerRoles: ["RIA Owner", "Wealth Advisor", "Client Service Manager"],
      problem: "Most RIA client churn doesn't happen because of investment performance. It happens because clients feel uninformed between market events. An advisor who communicates proactively, consistently, and with context retains clients through volatility. Most advisors don't have a system — they have intentions.",
      tagline: "A systematic touchpoint cadence that keeps clients informed and reduces churn risk without adding hours to your week.",
      deliverables: [
        "6 fully written client lifecycle SOPs",
        "Annual touchpoint calendar (20+ scheduled contacts)",
        "Email template library (market events, reviews, check-ins)",
        "Client segmentation model (A/B/C tiers)",
        "Onboarding communication sequence (days 1–90)"
      ],
      format: ["SOP Bundle", "Templates", "Guide"],
      price: 147,
      tier: "premium",
      upsellScope: "Client experience retainer",
      upsellPrice: "$2,500–$4,000/month",
      upsellTrigger: "Your segmentation model shows 40% of AUM concentrated in clients with fewer than 4 annual touchpoints. That's churn risk hiding in plain sight.",
      priority: 2,
      seoKeyword: "RIA client communication system SOP templates",
      metaTitle: "RIA Client Communication System | NLC Firm",
      metaDescription: "6 SOPs, annual touchpoint calendar, and email templates for RIAs who want a systematic client communication cadence that reduces churn.",
      sections: [
        { title: "Client Segmentation",   desc: "A/B/C tier model based on AUM, relationship depth, and referral potential with service level assignments" },
        { title: "Annual Contact Calendar", desc: "20+ annual touchpoints mapped by quarter: reviews, market commentary, birthday/milestone outreach" },
        { title: "Onboarding Sequence",   desc: "Days 1–90 client onboarding communication: welcome, first review, investment policy confirmation, 90-day check-in" },
        { title: "Market Event Protocol", desc: "SOP for proactive client communication during market volatility — what to send, when, and how" },
        { title: "Review Meeting SOP",    desc: "Pre-meeting prep, agenda template, meeting documentation, and follow-up action tracking" },
        { title: "Referral Activation",   desc: "Timing and language for referral conversations with high-satisfaction clients after milestone events" }
      ],
      notFor: "Broker-dealers subject to FINRA communication compliance requirements — this system is designed for registered investment advisors under SEC or state RIA oversight",
      faq: [
        { q: "Does this help with compliance documentation?", a: "The SOPs include documentation best practices for client-facing communications, but this is not a compliance program. Review all client communications with your compliance advisor." }
      ]
    },
    {
      sku: "NLC-FS-002",
      name: "Insurance Agency New Producer Playbook",
      slug: "insurance-agency-new-producer-playbook",
      sector: "financial-services",
      buyerRoles: ["Agency Owner", "Sales Manager", "Principal"],
      problem: "New producer ramp time in insurance agencies averages 9–18 months to profitability. Most agencies shorten this with good intentions and inconsistent execution — different managers train differently, the CRM is used 12 different ways, and activity tracking happens when the manager remembers to ask.",
      tagline: "Cut new producer ramp time and install a consistent sales development process that doesn't depend on which manager they happen to work with.",
      deliverables: [
        "New producer 90-day ramp plan with daily/weekly activities",
        "Weekly activity tracker with target KPIs by ramp phase",
        "Producer performance scorecard (12 dimensions)",
        "Sales process map with stage definitions",
        "Manager coaching framework (weekly 1:1 guide)"
      ],
      format: ["Guide", "Tracker"],
      price: 97,
      tier: "core",
      upsellScope: "Sales operations advisory",
      upsellPrice: "$2,000–$3,500/month",
      upsellTrigger: "Your scorecard shows 60% of new producers hitting targets in month 4–5. With a consistent ramp process, that window moves to month 2–3.",
      priority: 4,
      seoKeyword: "insurance agency new producer playbook training",
      metaTitle: "Insurance Agency New Producer Playbook | NLC Firm",
      metaDescription: "90-day ramp plan, activity tracker, and coaching framework for insurance agencies tired of 12-month ramp times and inconsistent producer development.",
      sections: [
        { title: "90-Day Ramp Plan",     desc: "Daily and weekly activities by ramp phase: prospecting, pipeline building, and production" },
        { title: "Activity Tracker",     desc: "Weekly dials, appointments, quotes, and bound policies tracked against phase-specific benchmarks" },
        { title: "Producer Scorecard",   desc: "12-dimension assessment: prospecting activity, product knowledge, needs analysis, close rate, retention" },
        { title: "Sales Process Map",    desc: "Stage definitions, entry/exit criteria, required documentation, and conversion benchmarks" },
        { title: "Manager Coaching Guide", desc: "Weekly 1:1 agenda template, performance conversation framework, and coaching documentation" }
      ],
      notFor: "Captive agency models with mandatory carrier training programs — this playbook is designed for independent and MGA-aligned agencies with discretion over their training approach",
      faq: [
        { q: "Does this apply to P&C, life, or both?", a: "The framework is written for property and casualty producers but applies to life and health with minor modifications to the activity metrics." }
      ]
    },
    {
      sku: "NLC-FS-003",
      name: "Mortgage Broker Pipeline & Conversion Tracker",
      slug: "mortgage-broker-pipeline-conversion-tracker",
      sector: "financial-services",
      buyerRoles: ["Mortgage Broker", "Branch Manager", "Loan Officer Team Lead"],
      problem: "Most mortgage broker pipelines are managed by feel rather than by data. Loan officers know which deals are active — they don't know their conversion rate by stage, their average cycle time, or which referral source produces the best pull-through. Without that data, every month starts from zero.",
      tagline: "See your full pipeline, conversion rates by stage, and referral source performance — so you stop guessing where your best business comes from.",
      deliverables: [
        "Pipeline tracker with 8 loan stages",
        "Conversion rate dashboard by stage and loan type",
        "Referral source performance analysis",
        "Average cycle time tracker",
        "Monthly revenue forecast from pipeline"
      ],
      format: ["Spreadsheet", "Dashboard"],
      price: 97,
      tier: "core",
      upsellScope: "Revenue advisory",
      upsellPrice: "$1,800–$3,000/month",
      upsellTrigger: "Your tracker shows a 34% fallout rate at the conditional approval stage — higher than industry average. That's a specific, fixable process gap.",
      priority: 4,
      seoKeyword: "mortgage broker pipeline conversion tracker spreadsheet",
      metaTitle: "Mortgage Broker Pipeline & Conversion Tracker | NLC Firm",
      metaDescription: "8-stage pipeline tracker with conversion rate dashboard, referral source analysis, and monthly revenue forecast for mortgage brokers.",
      sections: [
        { title: "Pipeline Tracker",        desc: "8-stage loan tracker: application → processing → UW submission → conditional → clear to close → funded" },
        { title: "Conversion Dashboard",    desc: "Stage-to-stage conversion rates by loan type, LO, and referral source with industry benchmarks" },
        { title: "Referral Source Analysis", desc: "Lead volume, conversion rate, average loan amount, and revenue contribution by referral source" },
        { title: "Cycle Time Tracker",      desc: "Average days in each pipeline stage by loan type with bottleneck identification" },
        { title: "Revenue Forecast",        desc: "Expected closings and revenue in 30/60/90 days based on current pipeline and historical conversion rates" }
      ],
      notFor: "Retail bank mortgage departments — this tracker is designed for independent mortgage brokers and smaller non-bank lenders with 1–15 loan officers",
      faq: [
        { q: "Does this work for purchase and refinance loans?", a: "Yes. The pipeline has separate tracking for purchase, refinance, and HELOC with stage-specific conversion benchmarks for each." }
      ]
    },

    /* ── EDUCATION ─────────────────────────────────────────── */
    {
      sku: "NLC-ED-001",
      name: "Training Business Revenue Model Planner",
      slug: "training-business-revenue-model-planner",
      sector: "education",
      buyerRoles: ["Training Business Owner", "Course Creator", "L&D Director"],
      problem: "Most training businesses set course prices by looking at competitors, not by modeling the economics. They discover their breakeven enrollment number three days before launch and realize it's higher than any cohort they've ever filled. The model comes after the commitment, not before it.",
      tagline: "Model cohort economics, breakeven enrollment, and pricing before you build the course — not after you've already sold it.",
      deliverables: [
        "Cohort P&L model (per-cohort and annual)",
        "Breakeven enrollment calculator by price point",
        "Pricing scenario comparison (3 price points)",
        "Course build cost tracker",
        "Annual revenue model by course/cohort mix"
      ],
      format: ["Spreadsheet", "Guide"],
      price: 127,
      tier: "core",
      upsellScope: "Business model advisory",
      upsellPrice: "$2,000–$3,500/month",
      upsellTrigger: "Your model shows a $297 price point requires 23 students to break even. Your historical fill rate suggests 12. There's a pricing or distribution problem to solve.",
      priority: 3,
      seoKeyword: "training business revenue model course economics",
      metaTitle: "Training Business Revenue Model Planner | NLC Firm",
      metaDescription: "Model cohort P&L, breakeven enrollment, and annual revenue for training businesses before committing to a course or pricing strategy.",
      sections: [
        { title: "Cohort P&L Model",         desc: "Revenue, instructor cost, platform fees, marketing spend, and net margin per cohort run" },
        { title: "Breakeven Calculator",     desc: "Enrollment needed to break even at 3 price points with fill rate sensitivity analysis" },
        { title: "Course Build Cost",        desc: "Time, tools, design, and platform setup costs for a single course build with amortization model" },
        { title: "Annual Revenue Model",     desc: "Multi-course, multi-cohort annual model with revenue, cost, and margin by course type" },
        { title: "Pricing Scenario Compare", desc: "Side-by-side comparison of low/mid/premium pricing with enrollment required and margin at each level" }
      ],
      notFor: "Corporate L&D departments where course economics are irrelevant to budget allocation — this model is designed for revenue-generating training businesses",
      faq: [
        { q: "Does this work for self-paced and cohort-based models?", a: "Yes. There are separate model tabs for live cohort, self-paced asynchronous, and hybrid delivery." }
      ]
    },
    {
      sku: "NLC-ED-002",
      name: "School & Tutoring Center Ops Playbook",
      slug: "school-tutoring-center-ops-playbook",
      sector: "education",
      buyerRoles: ["School Owner", "Tutoring Center Director", "Head of School"],
      problem: "Small schools and tutoring centers run on founder tribal knowledge. Enrollment conversations happen differently with every front desk person. Scheduling changes cascade into communication failures. Parent complaints reveal that three different staff members gave three different answers to the same policy question.",
      tagline: "Standardize enrollment, scheduling, and parent communication across every staff member so your operation doesn't depend on who's working today.",
      deliverables: [
        "8 SOPs for enrollment, scheduling, and parent communication",
        "Student onboarding packet template",
        "Staff scheduling protocol guide",
        "Parent communication response library (25 scenarios)",
        "Operations dashboard: enrollment KPIs and capacity utilization"
      ],
      format: ["SOP Bundle", "Templates", "Dashboard"],
      price: 147,
      tier: "premium",
      upsellScope: "Operations retainer",
      upsellPrice: "$2,000–$3,500/month",
      upsellTrigger: "Your SOPs are documented. The next problem is typically scheduling efficiency — centers running below 75% capacity utilization recover $3–8K/month with minor scheduling changes.",
      priority: 4,
      seoKeyword: "tutoring center school operations playbook SOP",
      metaTitle: "School & Tutoring Center Ops Playbook | NLC Firm",
      metaDescription: "8 SOPs, parent communication templates, and an enrollment dashboard for small schools and tutoring centers that need operational consistency.",
      sections: [
        { title: "Enrollment Process SOP",        desc: "Inquiry intake, assessment scheduling, placement decision, and enrollment confirmation workflow" },
        { title: "Student Onboarding",            desc: "Welcome packet, first-day checklist, parent expectation-setting, and 30-day check-in process" },
        { title: "Scheduling Protocol",           desc: "Session scheduling, rescheduling policy, cancellation handling, and capacity management" },
        { title: "Parent Communication Library",  desc: "25 template responses for common scenarios: payment issues, progress concerns, scheduling conflicts, policy questions" },
        { title: "Operations Dashboard",          desc: "Enrollment count, capacity utilization %, attendance rate, and revenue per student by period" }
      ],
      notFor: "Public or charter schools subject to state education department oversight — this playbook is for privately operated educational businesses",
      faq: [
        { q: "Does this cover state licensing requirements?", a: "No. Licensing requirements for educational businesses vary by state. This playbook covers operational procedures, not licensing compliance." }
      ]
    },

    /* ── TECHNOLOGY ────────────────────────────────────────── */
    {
      sku: "NLC-TK-001",
      name: "SaaS Metrics Dashboard for Founders",
      slug: "saas-metrics-dashboard-for-founders",
      sector: "technology",
      buyerRoles: ["SaaS Founder", "VP Finance", "Head of Revenue Operations"],
      problem: "Most early-stage SaaS founders can tell you their MRR. Far fewer can tell you their CAC payback period, their logo churn rate vs. revenue churn rate, their LTV:CAC ratio, or their expansion MRR as a percentage of total growth. That gap in financial visibility is exactly what Series A investors are looking for — and what separates fundable from unfundable.",
      tagline: "See MRR, ARR, churn, CAC, LTV, and payback period in one dashboard — finally built for founders who don't have a finance team yet.",
      deliverables: [
        "Monthly MRR/ARR tracker with growth rate",
        "Churn dashboard: logo churn and revenue churn",
        "CAC calculator by acquisition channel",
        "LTV model with cohort-based retention",
        "CAC payback and LTV:CAC ratio calculator",
        "Expansion MRR and net revenue retention tracker"
      ],
      format: ["Spreadsheet", "Dashboard"],
      price: 127,
      tier: "core",
      upsellScope: "SaaS finance operations retainer",
      upsellPrice: "$2,500–$4,500/month",
      upsellTrigger: "Your CAC payback is 22 months. Benchmark for Series A is under 18. The lever is almost always in the sales cycle length or onboarding-to-activation time.",
      priority: 1,
      seoKeyword: "SaaS metrics dashboard founder spreadsheet",
      metaTitle: "SaaS Metrics Dashboard for Founders | NLC Firm",
      metaDescription: "MRR, churn, CAC, LTV, and payback period in one dashboard. Built for SaaS founders who need investor-grade financial visibility without a CFO.",
      sections: [
        { title: "MRR / ARR Tracker",      desc: "New MRR, expansion MRR, churned MRR, and net new MRR with month-over-month growth rate" },
        { title: "Churn Dashboard",        desc: "Logo churn rate, revenue churn rate, and net revenue retention (NRR) by cohort and month" },
        { title: "CAC Calculator",         desc: "Customer acquisition cost by channel with blended CAC and channel efficiency comparison" },
        { title: "LTV Model",              desc: "Cohort-based LTV with average contract value, gross margin, and retention curve assumptions" },
        { title: "Payback & LTV:CAC",      desc: "CAC payback period in months and LTV:CAC ratio with benchmark context (target: 3:1+ at Series A)" },
        { title: "Expansion Tracking",     desc: "Upsell, cross-sell, and seat expansion MRR as % of total growth with NRR calculation" }
      ],
      notFor: "Enterprise SaaS companies with dedicated finance teams and established BI tooling — this dashboard is optimized for pre-Series B founders managing metrics manually",
      faq: [
        { q: "Does this connect to Stripe or my billing system?", a: "No. You enter monthly billing data manually from your CRM or billing platform. Most founders complete the initial setup in 2–3 hours." },
        { q: "What's a good LTV:CAC ratio?", a: "For Series A eligibility, investors typically want to see 3:1 or better. Below 2:1 signals a unit economics problem. The dashboard tracks your current ratio and shows what needs to change to reach target." }
      ]
    },
    {
      sku: "NLC-TK-002",
      name: "Product Launch Readiness Scorecard",
      slug: "product-launch-readiness-scorecard",
      sector: "technology",
      buyerRoles: ["Product Manager", "Startup Founder", "Head of Product"],
      problem: "Premature product launches are expensive. The cost isn't just the launch itself — it's the support burden from a confused user experience, the reputation damage from a buggy first impression, and the sales team that's trying to close deals on a product that isn't ready for the use case they're selling.",
      tagline: "A 73-item pre-launch checklist that catches the GTM, technical, and operational gaps that turn product launches into expensive lessons.",
      deliverables: [
        "73-item launch readiness scorecard across 6 categories",
        "Readiness score with category-level breakdown",
        "Launch go/no-go decision framework",
        "GTM launch calendar template",
        "Post-launch 30-day review framework"
      ],
      format: ["Scorecard", "Guide"],
      price: 67,
      tier: "entry",
      upsellScope: "GTM advisory engagement",
      upsellPrice: "$3,500–$6,000 flat fee",
      upsellTrigger: "Your scorecard shows 11 open items in the GTM category. A 2-week sprint can close those before your target launch date.",
      priority: 3,
      seoKeyword: "product launch readiness scorecard checklist",
      metaTitle: "Product Launch Readiness Scorecard | NLC Firm",
      metaDescription: "73-item pre-launch readiness scorecard across product, GTM, operations, and customer success. Make a data-driven go/no-go decision.",
      sections: [
        { title: "Product Readiness",    desc: "14 items: bug severity, feature completeness, performance benchmarks, and accessibility" },
        { title: "GTM Readiness",        desc: "15 items: messaging clarity, ICP definition, sales deck, pricing finalized, and battlecard" },
        { title: "Technical Infrastructure", desc: "12 items: monitoring, alerting, support tooling, and data privacy compliance" },
        { title: "Customer Success",     desc: "12 items: onboarding flow, help documentation, support SLA, and feedback mechanism" },
        { title: "Marketing & Launch",   desc: "12 items: press/analyst list, launch content, email campaign, and paid acquisition" },
        { title: "Legal & Compliance",   desc: "8 items: ToS, privacy policy, security certifications, and data processing agreements" }
      ],
      notFor: "Internal enterprise product teams launching features to existing users — this scorecard is optimized for market-facing product launches to new customer segments",
      faq: [
        { q: "Is this for B2B, B2C, or both?", a: "The scorecard applies to both. B2C-specific items (app store review, consumer compliance) and B2B-specific items (enterprise security review, pilot program) are flagged separately." }
      ]
    },

    /* ── MANUFACTURING ─────────────────────────────────────── */
    {
      sku: "NLC-MF-001",
      name: "Manufacturing Downtime Cost Calculator",
      slug: "manufacturing-downtime-cost-calculator",
      sector: "manufacturing",
      buyerRoles: ["Plant Manager", "VP Operations", "COO"],
      problem: "Every plant manager knows downtime is expensive. Almost none of them know the exact hourly cost of an unplanned line stop — including the loaded labor rate, the fixed cost absorption loss, the rework and scrap, and the customer impact. Without that number, maintenance budget conversations happen on gut feel instead of ROI.",
      tagline: "Calculate the true cost of unplanned downtime before your next maintenance budget review — and win the argument for preventive investment.",
      deliverables: [
        "Downtime cost calculator (loaded labor + fixed cost + scrap)",
        "OEE (Overall Equipment Effectiveness) tracker",
        "Downtime event log with root cause categories",
        "Annual downtime cost summary report",
        "Maintenance ROI calculator (PM investment vs. downtime cost)"
      ],
      format: ["Spreadsheet", "Calculator"],
      price: 97,
      tier: "core",
      upsellScope: "Operations advisory",
      upsellPrice: "$2,000–$4,000/month",
      upsellTrigger: "Your calculator shows $380K/year in downtime costs on Line 3. A $45K preventive maintenance investment has a 7-month payback at that rate.",
      priority: 3,
      seoKeyword: "manufacturing downtime cost calculator OEE template",
      metaTitle: "Manufacturing Downtime Cost Calculator | NLC Firm",
      metaDescription: "Calculate the true cost of unplanned downtime with loaded labor, fixed cost absorption, and scrap. Make the preventive maintenance investment case with data.",
      sections: [
        { title: "Downtime Cost Calculator", desc: "Hourly cost model: direct labor (loaded), indirect labor, fixed cost absorption, and scrap/rework rate" },
        { title: "OEE Tracker",             desc: "Availability, performance, and quality rate by line with OEE % and world-class benchmark (85%)" },
        { title: "Downtime Event Log",       desc: "Event-level tracking: equipment, date, duration, root cause category, and corrective action" },
        { title: "Annual Summary Report",    desc: "Total downtime hours and cost by line, by root cause, and by month with trend chart" },
        { title: "PM ROI Calculator",        desc: "Preventive maintenance investment vs. projected downtime cost reduction with payback period" }
      ],
      notFor: "Continuous process industries (refining, chemical) where OEE models require specialized process calculations beyond this template's scope",
      faq: [
        { q: "Does this require any manufacturing-specific software?", a: "No. You enter downtime events manually from your production logs. It works alongside any MES, CMMS, or basic spreadsheet-based tracking." }
      ]
    },
    {
      sku: "NLC-MF-002",
      name: "Inventory Optimization Workbook",
      slug: "inventory-optimization-workbook",
      sector: "manufacturing",
      buyerRoles: ["Supply Chain Manager", "Operations Director", "Inventory Planner"],
      problem: "Inventory problems in manufacturing almost always present as one of two extremes: too much of the wrong thing, or not enough of the right thing. The carrying cost of overstock and the lost revenue from stockouts are both real — but most organizations only react to stockouts. The overstock quietly sits on the balance sheet, tying up cash nobody talks about.",
      tagline: "Find the overstock, stockouts, and carrying cost that's hiding in your balance sheet — and build the reorder logic that prevents both.",
      deliverables: [
        "ABC inventory classification model (by value and velocity)",
        "Reorder point and safety stock calculator",
        "Carrying cost calculator by SKU category",
        "Stockout cost estimator",
        "Inventory health dashboard with aging buckets"
      ],
      format: ["Workbook", "Calculator"],
      price: 127,
      tier: "core",
      upsellScope: "Supply chain advisory",
      upsellPrice: "$2,500–$4,500/month",
      upsellTrigger: "Your ABC analysis shows 18% of SKUs consuming 62% of your carrying cost budget. A targeted reduction in those SKUs frees $200K+ in working capital.",
      priority: 4,
      seoKeyword: "inventory optimization workbook ABC analysis template",
      metaTitle: "Inventory Optimization Workbook | NLC Firm",
      metaDescription: "ABC classification, reorder point calculator, carrying cost analysis, and inventory health dashboard for manufacturing and distribution operations.",
      sections: [
        { title: "ABC Classification",    desc: "SKU classification by annual usage value (A=top 70-80%, B=next 15-25%, C=bottom 5-10%)" },
        { title: "Reorder Point Calculator", desc: "Safety stock and reorder point formula by SKU using lead time, demand variability, and service level target" },
        { title: "Carrying Cost Model",   desc: "Cost of capital, warehousing, handling, insurance, and obsolescence risk by inventory category" },
        { title: "Stockout Cost Estimator", desc: "Lost revenue, expedite cost, and customer impact estimate per stockout event by SKU class" },
        { title: "Inventory Health Dashboard", desc: "Turnover ratio, days on hand, aging buckets (0–30, 31–90, 91–180, 180+), and excess inventory flag" }
      ],
      notFor: "Retailers or distributors with point-of-sale-driven replenishment systems — this workbook is optimized for manufacturing environments with production-demand planning",
      faq: [
        { q: "Does this handle multi-location inventory?", a: "The base workbook handles a single location. A multi-location tab is included for up to 4 distribution points." }
      ]
    },

    /* ── GOVERNMENT CONTRACTING ────────────────────────────── */
    {
      sku: "NLC-GC-001",
      name: "Government Contract Bid Readiness Assessment",
      slug: "government-contract-bid-readiness-assessment",
      sector: "government-contracting",
      buyerRoles: ["CEO", "BD Director", "Capture Manager"],
      problem: "Most organizations lose government bids for reasons that have nothing to do with their technical proposal. They lose because their past performance documentation doesn't match the requirement. They lose because they don't have the right set-aside certification for the NAICS code. They lose because their financial statements raised a question the evaluator didn't have time to resolve. These are not technical losses — they're readiness losses.",
      tagline: "Score your readiness across 8 federal contracting dimensions before you invest 200 hours in a proposal you're not positioned to win.",
      deliverables: [
        "68-item bid readiness assessment across 8 dimensions",
        "Readiness score with dimension-level breakdown",
        "Set-aside strategy matrix (8(a), SDVOSB, WOSB, HUBZone)",
        "Past performance documentation guide",
        "30-day readiness improvement action plan"
      ],
      format: ["Assessment", "Guide"],
      price: 197,
      tier: "premium",
      upsellScope: "BD retainer / capture support",
      upsellPrice: "$4,500–$8,000/month",
      upsellTrigger: "Your readiness score is 58/100. Most winning bidders score 75+. The gaps are specific and closable in 60–90 days with a structured program.",
      priority: 1,
      seoKeyword: "government contract bid readiness assessment federal",
      metaTitle: "Government Contract Bid Readiness Assessment | NLC Firm",
      metaDescription: "68-item assessment scoring your federal contracting readiness across registrations, financials, past performance, set-aside status, and BD infrastructure.",
      sections: [
        { title: "Registrations & Certifications", desc: "SAM.gov status, DUNS/UEI, cage code, set-aside certifications, and GSA schedule status" },
        { title: "Financial Readiness",            desc: "Audited financials, working capital, bonding capacity, and DCAA pre-award survey history" },
        { title: "Past Performance",               desc: "CPARS ratings, reference quality, relevant contract documentation, and recency of performance" },
        { title: "Technical Capabilities",        desc: "Capability statement quality, NAICS code alignment, and team qualification documentation" },
        { title: "BD & Capture Infrastructure",   desc: "Pipeline management, capture process, teaming partner relationships, and BD system maturity" },
        { title: "Proposal Capability",           desc: "In-house writing capacity, compliant volume structure, color review process, and graphic production" },
        { title: "Set-Aside Strategy",            desc: "Eligibility matrix for 8(a), SDVOSB, WOSB, HUBZone, and SDB certifications with application readiness" },
        { title: "Compliance & Ethics",           desc: "FAR/DFARS compliance, code of conduct documentation, and training records" }
      ],
      notFor: "Large businesses (over $750M revenue) competing on full and open contracts — this assessment is calibrated for small and mid-size contractors in the $2M–$150M revenue range",
      faq: [
        { q: "Is this current with SAM.gov and the UEI transition?", a: "Yes. The assessment reflects the current SAM.gov registration requirements including the UEI replacement for DUNS." },
        { q: "Does this apply to SBIR/STTR programs?", a: "SBIR/STTR have separate eligibility and readiness requirements. The assessment covers standard competitive acquisitions, not R&D set-aside programs." }
      ]
    },
    {
      sku: "NLC-GC-002",
      name: "CPSR / Compliance Audit Prep Toolkit",
      slug: "cpsr-compliance-audit-prep-toolkit",
      sector: "government-contracting",
      buyerRoles: ["Contracts Manager", "CFO", "Compliance Director"],
      problem: "A Contractor Purchasing System Review (CPSR) or DCAA audit doesn't announce itself with enough time to build a compliant purchasing system from scratch. The documentation gaps, missing approvals, and undocumented procedures that exist in your current system are exactly what auditors are trained to find — and they find them.",
      tagline: "Prepare your purchasing system for a DCAA or CPSR review before they schedule it — not after they've already flagged deficiencies.",
      deliverables: [
        "CPSR readiness checklist (FAR Part 44 compliance)",
        "Purchasing system gap tracker with severity ratings",
        "Procurement policy documentation template",
        "Approved vendor/subcontractor documentation guide",
        "Consent-to-subcontract process flowchart"
      ],
      format: ["Checklist", "Workbook", "Templates"],
      price: 147,
      tier: "premium",
      upsellScope: "Compliance advisory project",
      upsellPrice: "$5,000–$12,000 flat fee",
      upsellTrigger: "Your checklist shows 7 FAR Part 44 deficiency areas. A formal remediation plan takes 60–90 days. Let's start before the auditors schedule the review.",
      priority: 2,
      seoKeyword: "CPSR DCAA compliance audit prep toolkit government contracting",
      metaTitle: "CPSR / Compliance Audit Prep Toolkit | NLC Firm",
      metaDescription: "FAR Part 44 readiness checklist, gap tracker, and documentation templates for government contractors preparing for a CPSR or DCAA purchasing system review.",
      sections: [
        { title: "FAR Part 44 Checklist",   desc: "All CPSR review criteria organized by major purchasing system element with pass/fail and evidence required" },
        { title: "Gap Tracker",             desc: "Deficiency log with FAR citation, severity (critical/significant/minor), remediation action, and owner" },
        { title: "Procurement Policy",      desc: "Editable purchasing policy template covering competition requirements, approval thresholds, and documentation standards" },
        { title: "Subcontract Documentation", desc: "Consent-to-subcontract flow, documentation requirements by subcontract type, and flow-down clause checklist" },
        { title: "Audit Response Guide",    desc: "How to structure your CPSR submission package, what auditors will request, and how to present remediated findings" }
      ],
      notFor: "Commercial-only businesses with no government contracts — CPSR and DCAA requirements apply only to companies with federal cost-reimbursement or time-and-materials contracts",
      faq: [
        { q: "What contract types trigger a CPSR?", a: "CPSR is typically triggered by a single cost-reimbursement, T&M, or LH contract above $50M, or when an ACO determines review is necessary regardless of threshold." }
      ]
    },
    {
      sku: "NLC-GC-003",
      name: "Proposal Writing Framework & Win Theme Builder",
      slug: "proposal-writing-framework-win-theme-builder",
      sector: "government-contracting",
      buyerRoles: ["BD Director", "Capture Manager", "Proposal Manager"],
      problem: "Most government proposals answer the requirements. Winning proposals answer the requirements AND tell a story about why this specific offeror is the lowest-risk, highest-confidence choice. The difference between compliant and winning is a win theme strategy that's built in capture, not written in the last 48 hours of proposal production.",
      tagline: "Build your win themes in capture — not in the final 48 hours — and structure every proposal section around evaluator scoring criteria.",
      deliverables: [
        "Win theme development framework (PWIN-driven)",
        "Section-by-section proposal outline template",
        "Technical approach writing guide (L/M compliance)",
        "Discriminator identification worksheet",
        "Color review process guide (Pink/Red/Gold)"
      ],
      format: ["Guide", "Templates", "Framework"],
      price: 147,
      tier: "premium",
      upsellScope: "Proposal advisory / capture support",
      upsellPrice: "$4,000–$8,000 per proposal",
      upsellTrigger: "Your win themes don't differentiate from the incumbent. That's the most common reason quality proposals score in the competitive range but don't win.",
      priority: 3,
      seoKeyword: "government proposal writing framework win theme builder",
      metaTitle: "Proposal Writing Framework & Win Theme Builder | NLC Firm",
      metaDescription: "Win theme development, compliant proposal outlines, and color review process for government contractors who want to move from compliant to winning.",
      sections: [
        { title: "Win Theme Framework",    desc: "PWIN analysis, discriminator identification, and win theme development tied to evaluator criteria" },
        { title: "Proposal Outline",       desc: "L/M-compliant section structure with required content, page guidance, and evaluation factor alignment" },
        { title: "Technical Approach",     desc: "Writing framework for technical volumes: approach, staffing, management, and past performance" },
        { title: "Color Review Process",   desc: "Pink team (outline), red team (draft), gold team (final) review protocols with scoring rubrics" },
        { title: "Discriminator Worksheet", desc: "Structured analysis of competitor weaknesses and your organizational strengths mapped to each evaluation factor" }
      ],
      notFor: "Organizations bidding on their first government contract who haven't completed at least one competitive proposal — this framework assumes basic familiarity with the federal acquisition process",
      faq: [
        { q: "Does this cover IDIQ task orders or just full proposals?", a: "The framework applies to both full proposals and task order responses. The color review process has a streamlined version for task orders with tighter timelines." }
      ]
    },

    /* ── CROSS-SECTOR ──────────────────────────────────────── */
    {
      sku: "NLC-XX-001",
      name: "Franchise Feasibility Workbook",
      slug: "franchise-feasibility-workbook",
      sector: "cross-sector",
      buyerRoles: ["Aspiring Franchisee", "Business Buyer", "Franchise Advisor"],
      problem: "Franchise disclosure documents are designed by lawyers for legal compliance, not by investors for business decision-making. The FDD tells you the facts; it doesn't tell you whether the unit economics work for your target market, whether the royalty structure makes sense against your projected revenue, or whether you can service the required debt load.",
      tagline: "Model franchise unit economics, total investment, and break-even timeline before you sign a franchise agreement.",
      deliverables: [
        "Franchise unit P&L model (3-year)",
        "Total investment calculator (FDD Item 7 structure)",
        "Royalty and fee impact on unit economics",
        "Break-even analysis by sales volume",
        "Franchise comparison scorecard (up to 3 concepts)"
      ],
      format: ["Workbook", "Calculator"],
      price: 97,
      tier: "core",
      upsellScope: "Franchise advisory engagement",
      upsellPrice: "$2,500–$5,000 flat fee",
      upsellTrigger: "Your model shows break-even requires 94% of average validation sales. That's a narrow margin. Let's validate those assumptions with franchisee interviews before you sign.",
      priority: 4,
      seoKeyword: "franchise feasibility workbook unit economics model",
      metaTitle: "Franchise Feasibility Workbook | NLC Firm",
      metaDescription: "Model franchise unit P&L, total investment, royalty impact, and break-even before you sign a franchise agreement. FDD Item 7 compatible.",
      sections: [
        { title: "Unit P&L Model",          desc: "3-year revenue projection, cost of sales, labor, royalties, and local marketing fund with net income" },
        { title: "Investment Calculator",   desc: "FDD Item 7 total investment build: franchise fee, equipment, build-out, working capital, and opening inventory" },
        { title: "Royalty Impact Analysis", desc: "Royalty rate + marketing fund % applied to revenue scenarios with contribution margin comparison" },
        { title: "Break-Even Analysis",     desc: "Sales volume required to cover all fixed costs at multiple revenue scenarios" },
        { title: "Concept Comparison",      desc: "Side-by-side scoring of up to 3 franchise concepts: investment, royalty, support quality, validation scores" }
      ],
      notFor: "Existing franchisees evaluating additional unit acquisitions — this workbook is optimized for first-unit decision analysis, not multi-unit portfolio modeling",
      faq: [
        { q: "Does this replace FDD review by a franchise attorney?", a: "No. This workbook is a financial modeling tool, not legal advice. Always have a qualified franchise attorney review the FDD before signing." }
      ]
    },
    {
      sku: "NLC-XX-002",
      name: "Business Acquisition Due Diligence Pack",
      slug: "business-acquisition-due-diligence-pack",
      sector: "cross-sector",
      buyerRoles: ["Business Buyer", "Private Equity Associate", "M&A Advisor"],
      problem: "Most business acquisitions that go wrong weren't surprises in the data — they were things that were knowable in due diligence and not looked for. Customer concentration, undocumented key-person dependencies, deferred maintenance backlog, and owner-adjusted EBITDA that doesn't survive normalization are all findable before the LOI is signed, if you know what to look for.",
      tagline: "A 110-item due diligence framework covering financials, operations, legal, people, and culture — built to find the things sellers don't volunteer.",
      deliverables: [
        "110-item due diligence checklist across 9 categories",
        "Financial normalization worksheet (EBITDA add-back analysis)",
        "Customer concentration risk assessment",
        "Key person dependency map",
        "Red flag summary template for LOI negotiation"
      ],
      format: ["Checklist", "Workbook", "Templates"],
      price: 197,
      tier: "premium",
      upsellScope: "Transaction advisory engagement",
      upsellPrice: "$5,000–$15,000 flat fee",
      upsellTrigger: "Your diligence found 3 customer concentration flags and an undisclosed key-person risk. Let's build those into the LOI terms before you're past exclusivity.",
      priority: 3,
      seoKeyword: "business acquisition due diligence checklist template",
      metaTitle: "Business Acquisition Due Diligence Pack | NLC Firm",
      metaDescription: "110-item M&A due diligence framework with EBITDA normalization, customer concentration analysis, and key person dependency mapping.",
      sections: [
        { title: "Financial Statements",    desc: "3-year P&L, balance sheet, and cash flow review with normalization worksheet for add-backs" },
        { title: "Revenue Quality",         desc: "Customer concentration, recurring vs. one-time revenue, contract terms, and renewal rates" },
        { title: "Operations",             desc: "Key processes, system documentation, facilities condition, and deferred maintenance assessment" },
        { title: "Legal & Compliance",     desc: "Pending litigation, IP ownership, regulatory standing, permits, and material contract review" },
        { title: "People & Culture",       desc: "Key person identification, employment agreements, comp structure, and turnover history" },
        { title: "Technology & Systems",   desc: "Technology infrastructure, data security, SaaS contracts, and system transition risk" },
        { title: "Customers & Market",     desc: "Customer satisfaction, competitive positioning, market size, and growth assumptions validation" },
        { title: "Seller Representations", desc: "Accuracy of seller's stated adjustments, undisclosed liabilities, and related-party transactions" },
        { title: "Integration Planning",   desc: "First-90-day integration checklist, communication plan, and cultural risk factors" }
      ],
      notFor: "Acquisitions of publicly traded companies — this framework is designed for private company acquisitions in the $500K–$15M enterprise value range",
      faq: [
        { q: "Does this replace legal and financial advisors?", a: "No. This framework structures and organizes your due diligence inquiry. It does not replace a qualified M&A attorney, CPA, or financial advisor in the transaction." },
        { q: "Is this specific to any industry?", a: "The framework is cross-sector and applies to service businesses, retail, B2B companies, and light manufacturing. Industry-specific add-ons are noted for healthcare and financial services acquisitions." }
      ]
    }
  ]  /* end products array */

};  /* end NLC_CATALOG */
