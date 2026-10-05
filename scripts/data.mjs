// Profile content for the generated SVGs in assets/.
// Source of truth: the verified profile behind https://www.rezaul-karim.com
// (rezaul-karim.com/src/data/profile.ts) and the public RK-Rohan repositories.
// Rule: no invented metrics, projects, URLs or claims. The Web3 look is presentation only.

export const profile = {
  name: "Rezaul Karim",
  handle: "RK-Rohan",
  headline: "Lead Software Engineer / Engineering Team Lead",
  location: "Dhaka, Bangladesh",
  website: "https://www.rezaul-karim.com",
  experience: "10+",
  summary:
    "10+ years across e-commerce, ERP, fintech, VAT / compliance systems and telecom, leading teams through architecture, DevOps and automation.",
  roles: [
    "Lead Software Engineer",
    "Engineering Team Lead",
    "Solution Architect",
    "FinTech / Payments Engineer",
    "DevOps & Automation Engineer",
  ],
};

// Newest first, same as the website.
export const career = [
  { company: "Aline Mart Ltd. / Aline Group", title: "Lead Software Engineer", start: "2025-09", end: null },
  { company: "Nexorabyte IT Solution", title: "Senior Software Engineer / Team Lead", start: "2025-04", end: "2025-08" },
  { company: "3DEVs IT Ltd.", title: "Senior Full-Stack Software Engineer / Project Manager", start: "2024-02", end: "2025-03" },
  { company: "RingTech Bangladesh Ltd.", title: "System Engineer", start: "2023-10", end: "2024-01" },
  { company: "BMIT Solutions Ltd.", title: "Senior Software Engineer", start: "2022-04", end: "2023-09" },
  { company: "Grace Web Tech Ltd.", title: "Software Engineer", start: "2018-01", end: "2020-06" },
  { company: "RAWN Technologies Ltd.", title: "Software Developer", start: "2012-03", end: "2016-05" },
];

export const skillGroups = [
  {
    category: "Languages & Frameworks",
    short: "LANG",
    skills: ["Python", "Flask", "FastAPI", "PHP", "Laravel", "CodeIgniter", "Yii2", "WordPress", "JavaScript", "TypeScript", "React", "Next.js", "Angular", "jQuery", "Java (basics)"],
  },
  {
    category: "Backend & APIs",
    short: "API",
    skills: ["REST APIs", "GraphQL", "JWT", "OAuth", "Webhooks", "Payment gateways", "Third-party integrations", "Device integration"],
  },
  {
    category: "Databases",
    short: "DATA",
    skills: ["MySQL", "PostgreSQL", "MongoDB", "Redis", "Query optimisation", "Caching"],
  },
  {
    category: "DevOps & Infrastructure",
    short: "OPS",
    skills: ["AWS EC2", "AWS RDS", "AWS S3", "GCP", "Docker", "GitHub Actions", "GitLab CI", "CI/CD", "Nginx", "Apache", "Tomcat", "Ubuntu", "WHM / cPanel"],
  },
  {
    category: "Automation",
    short: "AUTO",
    skills: ["Python automation", "Bash / Shell", "Cron", "Task scheduling", "Laravel queues", "Scheduled jobs", "ETL", "Bulk import / export", "Automated reports", "Web scraping", "Deploy automation", "Backup automation", "Workflow automation"],
  },
  {
    category: "Quality & Security",
    short: "QA",
    skills: ["PHPUnit", "PyTest", "Postman", "Selenium", "API security", "Code review", "Integration testing", "Unit testing", "Performance profiling"],
  },
  {
    category: "Business Systems",
    short: "BIZ",
    skills: ["E-commerce", "ERP", "POS", "NBR / VAT systems", "FinTech", "Payment systems", "Multi-tenant software", "Management systems"],
  },
  {
    category: "Payments / FinTech",
    short: "PAY",
    skills: ["bKash", "Nagad", "Rocket", "Upay"],
  },
  {
    category: "Leadership & Delivery",
    short: "LEAD",
    skills: ["Engineering leadership", "Mentoring", "Sprint planning", "Project management", "Stakeholder management", "Software architecture"],
  },
];

// Featured cards. Public repositories only; descriptions checked against each repo.
export const projects = [
  {
    slug: "multi-chain-wallet",
    repo: "RK-Rohan/multi-chain-wallet",
    name: "Multi-Chain Wallet Viewer",
    language: "TypeScript",
    description:
      "Derives Bitcoin Testnet, Ethereum Sepolia and TRON Nile addresses from a single BIP-39 mnemonic over BIP-44 paths. Node.js API, Angular UI; keys never leave the backend.",
    stack: ["Node.js", "Angular", "TypeScript", "BIP-39 / 44"],
  },
  {
    slug: "invoiceswift",
    repo: "RK-Rohan/InvoiceSwift",
    name: "InvoiceSwift",
    language: "TypeScript",
    description:
      "Invoicing app with sign-up and login, client management, invoice create / edit / view, reusable templates and a dashboard, plus a Genkit AI flow for customising invoice templates.",
    stack: ["Next.js 15", "NextAuth", "MongoDB", "Genkit"],
  },
  {
    slug: "vat-flask",
    repo: "RK-Rohan/VAT_FLASK",
    name: "BMIT VAT · Flask Edition",
    language: "Python",
    description:
      "Flask edition of the BMIT VAT management system for Bangladesh NBR VAT compliance, from the legacy PHP to Python Flask migration at BMIT Solutions Ltd.",
    stack: ["Python", "Flask", "SQLAlchemy", "MySQL"],
  },
  {
    slug: "practical-action",
    repo: "RK-Rohan/practical_action",
    name: "Online Monitoring System",
    language: "PHP",
    description:
      "Laravel monitoring system from the MIS and plant management work for Practical Action at 3DEVs IT Ltd.",
    stack: ["PHP", "Laravel", "Blade"],
  },
  {
    slug: "clutch-scraper-pipeline",
    repo: "RK-Rohan/clutch-scraper-pipeline",
    name: "Clutch Scraper Pipeline",
    language: "Python",
    description:
      "Scrapes a Clutch directory, enriches the top 20 companies with founder and client data, scores each 0-100 and drafts outreach emails. Parallel enrichment, ~30-40 s end to end.",
    stack: ["Python", "BeautifulSoup", "cloudscraper", "Threads"],
  },
  {
    slug: "openbravo-php",
    repo: "RK-Rohan/OpenbravoPHP",
    name: "OpenbravoPHP",
    language: "PHP",
    description:
      "PHP client for the Openbravo ERP JSON web service: create, query, update and delete records and import orders, used to connect Openbravo with WordPress and Magento.",
    stack: ["PHP", "Openbravo ERP", "JSON / REST", "Magento"],
  },
];
