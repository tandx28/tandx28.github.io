// Everything personal that appears in more than one place lives here, so a
// change (a new email, a new link) is made once.
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
    'Computer Science student at NUS who builds software with AI and keeps learning new tools by shipping with them: full-stack web apps, agent workflows and automations, with tests and CI keeping the AI honest.',
};

export const nav = [
  { href: '/#ai', label: 'How I work' },
  { href: '/#work', label: 'Work' },
  { href: '/#experiments', label: 'Experiments' },
  { href: '/#experience', label: 'Experience' },
  { href: '/#press', label: 'Press' },
  { href: '/#contact', label: 'Contact' },
];

/** How I use AI day to day. Every line here is something I actually do. */
export const practices = [
  {
    title: 'Write the brief before the code',
    body:
      'Each project has an instruction file (CLAUDE.md or AGENTS.md) that sets the architecture, the rules the code must keep and what “done” means. Agents read it at the start of every session, so I explain the project once instead of every time.',
  },
  {
    title: 'Spend tokens where they change the answer',
    body:
      'I keep the main context small: searches and wide file reads go to cheaper sub-agents, replies stay terse, and big batch jobs run on local models through Ollama at no API cost. The expensive model is saved for design decisions and hard bugs.',
  },
  {
    title: 'Make the AI prove its work',
    body:
      'Nothing is done because a model says so. Type checks, unit tests, a browser check and a read of the diff come first. When something fails I hand back the exact error, not “it doesn’t work”.',
  },
  {
    title: 'Give agents jobs, and boundaries',
    body:
      'Scheduled agents sync my course files from Canvas every night and keep my study planner current. Each one owns its own data: one writes the Notion planner, the other only reads it, so they never overwrite each other.',
  },
];

export const toolbox: { group: string; items: string[] }[] = [
  { group: 'AI', items: ['Claude Code', 'Codex', 'Claude API', 'Ollama', 'MCP connectors', 'Skills and sub-agents'] },
  { group: 'Languages', items: ['TypeScript', 'JavaScript', 'Python', 'C#', 'Java', 'SQL'] },
  { group: 'Web and backend', items: ['Angular', 'React', 'Astro', 'Node.js', '.NET', 'REST APIs'] },
  { group: 'Cloud and delivery', items: ['AWS', 'Vercel', 'GitHub Actions', 'Docker', 'Redis', 'MySQL', 'MongoDB'] },
];

export const experience = [
  {
    when: 'Aug 2026 – now',
    what: 'Bachelor of Computing, Computer Science',
    where: 'National University of Singapore',
    notes: [
      'Tech Associate, Google Developer Group @ NUS Computing.',
      'Platform & Quality Lead for a student team rebuilding a school website with SiloamXperience.',
    ],
  },
  {
    when: 'Jul 2024 – Jul 2026',
    what: 'Cybercrime Operator (national service)',
    where: 'Singapore Police Force, Cybercrime Command',
    notes: [
      'Pioneer batch of the national service cybercrime operator vocation.',
      'Identified and disrupted scam websites with the Threat Intelligence Centre, and built internal tools that sped up the work.',
      'Received the SPF Director’s Award.',
    ],
  },
  {
    when: 'Mar 2023 – Jan 2024',
    what: 'Software Development Intern',
    where: 'A*STAR',
    notes: [
      'Angular and TypeScript features and C#/.NET APIs for a last-mile logistics platform.',
      'Traced delivery-job payload mismatches to their cause with scripts and visual reports.',
    ],
  },
  {
    when: 'Apr 2021 – Apr 2024',
    what: 'Diploma in Information Technology',
    where: 'Singapore Polytechnic',
    notes: ['GPA 3.82. Director’s Honour Roll, AY 2021/22.'],
  },
];

export const press = [
  {
    outlet: 'The Straits Times',
    date: '12 Jul 2025',
    title: 'More police NSFs may be recruited to tackle online scams',
    url: 'https://www.straitstimes.com/singapore/courts-crime/more-nsfs-may-be-recruited-to-tackle-scams-police',
    note: 'Interviewed about working in the pioneer batch of national service cybercrime operators, blocking scam and phishing sites.',
  },
];
