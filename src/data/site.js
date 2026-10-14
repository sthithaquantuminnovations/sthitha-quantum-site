// One place for the facts the pages share. Sthitha Quantum Innovations is the parent brand;
// Sthitha Exodia, Sthitha Academy and Research & Innovation sit underneath it.
import crashCourseImage from '../assets/courses/quantum-computing-crash-course.jpg';
import malayalamImage from '../assets/courses/quantum-computing-malayalam.jpg';

export const company = {
  name: 'Sthitha Quantum Innovations',
  legalName: 'Sthitha Quantum Innovations Pvt Ltd',
  location: 'Bengaluru, India',
  email: 'sthithaquantuminnovations@gmail.com',
  // Add the official profile URLs here; a link only appears once its URL is set.
  social: [
    { label: 'LinkedIn', href: '' },
    { label: 'YouTube', href: '' },
  ],
};

export const areas = [
  {
    key: 'exodia',
    name: 'Sthitha Exodia',
    title: 'Post-Quantum Security',
    href: '/exodia',
    summary: 'Sthitha Exodia focuses on cryptographic discovery, quantum risk awareness and preparation for post-quantum migration.',
    short: 'Explore cryptographic discovery, quantum risk awareness and post-quantum migration planning.',
    link: 'Explore Sthitha Exodia',
  },
  {
    key: 'academy',
    name: 'Sthitha Academy',
    title: 'Quantum Education',
    href: '/academy',
    summary: 'Learn quantum computing through courses designed to introduce the fundamentals, circuits and algorithms.',
    short: 'Structured courses for learners starting out in quantum computing.',
    link: 'Explore Academy',
  },
  {
    key: 'research',
    name: 'Research & Innovation',
    title: 'Quantum Research',
    href: '/research',
    summary: 'Explore quantum computing, quantum machine learning and emerging ideas through technical study and experimentation.',
    short: 'Technical research, experimentation and applied learning.',
    link: 'Explore Research',
  },
];

const UDEMY_MALAYALAM = 'https://www.udemy.com/course/quantum-computing-in-malayalam-for-beginners/?referralCode=F3F5FEB370CAACC14D72';
const UDEMY = 'https://www.udemy.com/course/quantum-computing-crash-course-qubits-to-shor-grover/?referralCode=67C490A532C5D584464A';

export const courses = [
  {
    slug: 'quantum-computing-crash-course',
    href: '/academy/quantum-computing-crash-course',
    title: 'Quantum Computing Crash Course',
    subtitle: 'Qubits to Shor & Grover',
    status: 'Available Now',
    available: true,
    image: crashCourseImage,
    imageAlt: 'Quantum Computing Crash Course thumbnail: a Bloch sphere inside intersecting orbits',
    udemy: UDEMY,
  },
  {
    slug: 'quantum-computing-malayalam',
    href: '/academy/quantum-computing-malayalam',
    title: 'Quantum Computing in Malayalam',
    subtitle: 'For Beginners',
    status: 'Available Now',
    available: true,
    image: malayalamImage,
    imageAlt: 'Quantum Computing in Malayalam course thumbnail: a Bloch sphere beside a dilution refrigerator and quantum gate circuit',
    udemy: UDEMY_MALAYALAM,
  },
];

export const learn = ['Qubits', 'Superposition', 'Entanglement', 'Quantum gates', 'Quantum circuits', 'Quantum algorithms'];
export const learners = ['Students', 'Beginners', 'Developers', 'Technology professionals', 'Curious learners'];
export const learningPath = ['Fundamentals', 'Quantum Computing', 'Algorithms'];

export const aurora = {
  name: "AURORA '26",
  kind: 'IEEE technology event',
  dates: '2–3 October 2026',
  role: 'Sponsor',
};
