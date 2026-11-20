// Everything personal that appears in more than one place lives here, so a
// change (a new email, a domain) is made once.
export const profile = {
  name: 'Tan De Xun',
  handle: 'tandx28',
  role: 'Computer Science @ NUS',
  location: 'Singapore',
  email: 'tandexun3@gmail.com',
  github: 'https://github.com/tandx28',
  linkedin: 'https://www.linkedin.com/in/dexun19',
  resume: '/resume.pdf',
  blurb:
    'NUS Computer Science student and software engineer who builds with AI: full-stack apps, agent workflows and automations, shipped with tests and CI. Curious about every new tool, and learns it by building something real.',
};

export const nav = [
  { href: '/#about', label: 'about' },
  { href: '/#ai', label: 'ai' },
  { href: '/#work', label: 'work' },
  { href: '/#lab', label: 'lab' },
  { href: '/#journey', label: 'journey' },
  { href: '/#community', label: 'community' },
  { href: '/#contact', label: 'contact' },
];

/** How I build with AI. Every line is something I actually do. */
export const practices = [
  {
    k: 'brief first',
    title: 'Write the brief before the code',
    body: 'Every project starts with an instruction file (CLAUDE.md or AGENTS.md): the architecture, the rules the code must keep and what "done" means. Agents reread it each session, so I explain a project once.',
  },
  {
    k: 'token budget',
    title: 'Spend tokens where they change the answer',
    body: 'Searches and wide reads go to cheaper sub-agents, replies stay terse, and batch jobs run on local models through Ollama at zero API cost. The strongest model is saved for design calls and hard bugs.',
  },
  {
    k: 'proof',
    title: 'Make the AI prove its work',
    body: 'Nothing is done because a model says so. Type checks, unit tests, a browser check and a read of the diff come first, and failures go back with the exact error, not "it does not work".',
  },
  {
    k: 'orchestration',
    title: 'Give agents jobs, and boundaries',
    body: 'Scheduled agents sync my courses from Canvas nightly and keep my planner current. Each one owns its own data: Codex writes the planner, Claude only reads it, so they never collide.',
  },
];

/** Moments from the tech community, shown at the bottom of the home page. */
export const press = [
  {
    outlet: 'The Straits Times',
    date: '12 Jul 2025',
    title: 'More police NSFs may be recruited to tackle online scams',
    url: 'https://www.straitstimes.com/singapore/courts-crime/more-nsfs-may-be-recruited-to-tackle-scams-police',
    note: 'Interviewed on joining the pioneer batch of national service cybercrime operators and blocking a fake bank site within minutes.',
  },
];

export const journey = [
  {
    when: 'Aug 2026 - now',
    what: 'Bachelor of Computing, Computer Science',
    where: 'National University of Singapore',
    notes: ['Tech Associate, Google Developer Group @ NUS Computing.', 'Platform & Quality Lead for a student team rebuilding a school website.'],
  },
  {
    when: 'Jul 2024 - Jul 2026',
    what: 'Cybercrime Operator (national service)',
    where: 'Singapore Police Force, Cybercrime Command',
    notes: [
      'Pioneer batch of the national service cybercrime operator vocation, at the Threat Intelligence Centre.',
      'Identified and disrupted scam websites, and built internal tools that sped up the team’s work.',
      'Received the SPF Director’s Award. Featured in The Straits Times.',
    ],
  },
  {
    when: 'Mar 2023 - Jan 2024',
    what: 'Software Development Intern',
    where: 'A*STAR',
    notes: [
      'Angular and TypeScript features plus C#/.NET APIs for a continuous last-mile logistics platform.',
      'Tested APIs with Swagger and Postman; traced delivery-job payload mismatches with scripts and visual reports.',
      'Refactored components with design patterns to make them easier to maintain.',
    ],
  },
  {
    when: 'Apr 2021 - Apr 2024',
    what: 'Diploma in Information Technology',
    where: 'Singapore Polytechnic',
    notes: ["GPA 3.82. Director's Honour Roll, AY 2021/22."],
  },
];

export const stack: { group: string; items: string[] }[] = [
  { group: 'languages', items: ['TypeScript', 'JavaScript', 'Python', 'C#', 'Java', 'SQL', 'R'] },
  { group: 'frontend', items: ['Angular', 'React', 'Astro', 'Three.js', 'Vite', 'Webpack'] },
  { group: 'backend', items: ['.NET', 'Node.js', 'REST', 'Swagger', 'Postman', 'Keycloak'] },
  { group: 'cloud & data', items: ['AWS', 'Vercel', 'GitHub Actions', 'Docker', 'Redis', 'MySQL', 'SQL Server', 'MongoDB'] },
  { group: 'ai', items: ['Claude Code', 'Codex', 'Claude API', 'Ollama', 'MCP', 'Sub-agents', 'Prompt design'] },
  { group: 'practice', items: ['Vitest', 'node:test', 'CI/CD', 'Git', 'Secure coding'] },
];
