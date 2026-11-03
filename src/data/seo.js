// Search metadata the pages share: keyword sets, breadcrumb names and structured-data helpers.
// Keep every value true to what the pages say; search engines and AI tools quote it as fact.

export const SITE = 'https://sthithaquantum.com';
export const orgId = `${SITE}/#organization`;
export const websiteId = `${SITE}/#website`;

// One identity everywhere (audit §7.2).
export const oneLiner =
  'Sthitha Quantum Innovations is a quantum technology company in Bengaluru, working across quantum computing, post-quantum security, education and research.';

// Added to every page after the page's own keywords.
export const brandKeywords = [
  'Sthitha Quantum Innovations',
  'Sthitha',
  'quantum technology company',
  'quantum computing company in India',
  'deep tech company Bengaluru',
];

export const keywords = {
  home: [
    'quantum technology company',
    'quantum computing company',
    'quantum computing company in Bengaluru',
    'deep tech company India',
    'post-quantum security',
    'quantum cybersecurity company',
    'post-quantum cryptography',
    'PQC migration',
    'quantum computing courses',
    'quantum research India',
  ],
  about: [
    'about Sthitha Quantum Innovations',
    'quantum technology company in India',
    'deep tech startup Bengaluru',
    'quantum computing company',
    'post-quantum security company',
    'quantum education',
    'quantum research',
  ],
  team: [
    'Sthitha Quantum Innovations team',
    'quantum computing experts India',
    'quantum technology leadership',
    'deep tech founders Bengaluru',
    'quantum research team',
  ],
  events: [
    'quantum technology events',
    'quantum computing events India',
    "AURORA '26",
    'IEEE technology event sponsor',
    'quantum community Bengaluru',
    'deep tech events',
  ],
  partnerships: [
    'quantum technology partnerships',
    'quantum computing collaboration',
    'post-quantum security partnership',
    'quantum education partnership',
    'deep tech collaboration India',
    'university quantum research collaboration',
  ],
  contact: [
    'contact Sthitha Quantum Innovations',
    'quantum computing company Bengaluru',
    'quantum technology company contact',
    'post-quantum security enquiry',
    'quantum computing course enquiry',
  ],
  exodia: [
    'post-quantum security',
    'post-quantum cryptography',
    'PQC migration',
    'quantum-safe cryptography',
    'quantum cybersecurity',
    'cybersecurity company India',
    'cryptographic discovery',
    'cryptographic inventory',
    'crypto agility',
    'quantum risk assessment',
    'harvest now decrypt later',
    'ML-KEM',
    'ML-DSA',
    'NIST post-quantum standards',
  ],
  academy: [
    'quantum computing courses',
    'quantum computing course online',
    'learn quantum computing',
    'quantum computing for beginners',
    'quantum computing course in Malayalam',
    'quantum education India',
    'qubits',
    'quantum circuits',
    'quantum algorithms',
  ],
  crashCourse: [
    'quantum computing crash course',
    'quantum computing course for beginners',
    'learn quantum computing online',
    'qubits and superposition',
    'quantum gates',
    'quantum circuits',
    "Shor's algorithm",
    "Grover's algorithm",
    'Udemy quantum computing course',
  ],
  malayalam: [
    'quantum computing in Malayalam',
    'Malayalam quantum computing course',
    'ക്വാണ്ടം കമ്പ്യൂട്ടിംഗ്',
    'learn quantum computing in Malayalam',
    'quantum computing for beginners',
    'Kerala quantum computing course',
    'Udemy Malayalam course',
  ],
  research: [
    'quantum computing research',
    'quantum algorithms research',
    'quantum machine learning',
    'quantum research India',
    'deep tech research Bengaluru',
    'quantum technology research',
  ],
  insights: [
    'quantum technology insights',
    'quantum computing articles',
    'post-quantum security articles',
    'quantum algorithms explained',
    'quantum machine learning articles',
    'quantum computing blog',
  ],
  legal: [],
};

// Names used in BreadcrumbList for each section path.
export const crumbNames = {
  '/about/': 'About Sthitha',
  '/our-team/': 'Our Team',
  '/events/': 'Events',
  '/partnerships/': 'Partnerships',
  '/contact/': 'Contact',
  '/exodia/': 'Sthitha Exodia',
  '/academy/': 'Sthitha Academy',
  '/academy/quantum-computing-crash-course/': 'Quantum Computing Crash Course',
  '/academy/quantum-computing-malayalam/': 'Quantum Computing in Malayalam',
  '/research/': 'Research & Innovation',
  '/research/insights/': 'Insights',
  '/privacy-policy/': 'Privacy Policy',
  '/terms-and-conditions/': 'Terms & Conditions',
  '/cookie-policy/': 'Cookie Policy',
};

// FAQPage from a page's visible questions. Answers marked `pending` wait for confirmed facts
// (audit §5.3) and stay out of the markup until they are rewritten.
export function faqPage(pageUrl, faqs) {
  const ready = faqs.filter((f) => !f.pending);
  if (!ready.length) return null;
  return {
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    mainEntity: ready.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

// Social card per section (audit §3.5); every card is 1200×630.
export const ogCards = {
  home: { image: '/assets/og/og-home.png', alt: 'Sthitha Quantum Innovations — quantum technology company, Bengaluru' },
  exodia: { image: '/assets/og/og-exodia.png', alt: 'Sthitha Exodia — post-quantum security and PQC migration' },
  academy: { image: '/assets/og/og-academy.png', alt: 'Sthitha Academy — quantum computing courses' },
  crashCourse: { image: '/assets/og/og-crash-course.png', alt: 'Quantum Computing Crash Course: Qubits to Shor & Grover' },
  malayalam: { image: '/assets/og/og-malayalam.png', alt: 'Quantum Computing in Malayalam for beginners' },
  research: { image: '/assets/og/og-research.png', alt: 'Sthitha Research & Innovation — quantum computing research' },
};
