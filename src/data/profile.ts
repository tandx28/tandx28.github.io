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
    'NUS Computer Science student who builds web products, 3D games and stop-motion films mainly by directing AI. Interested in software engineering, cloud platforms and technology that keeps people safe.',
};

export const nav = [
  { href: '/#about', label: 'about' },
  { href: '/#work', label: 'work' },
  { href: '/#lab', label: 'ai lab' },
  { href: '/#journey', label: 'journey' },
  { href: '/#stack', label: 'stack' },
  { href: '/#contact', label: 'contact' },
];

export const journey = [
  {
    when: 'Aug 2026 - now',
    what: 'Bachelor of Computing, Computer Science',
    where: 'National University of Singapore',
    notes: ['Tech Associate, Google Developer Group on campus.'],
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
  { group: 'ai', items: ['Claude', 'Claude Code', 'Codex', 'Ollama', 'FLUX', 'Prompt design'] },
  { group: 'practice', items: ['Vitest', 'node:test', 'CI/CD', 'Git', 'Secure coding'] },
];
