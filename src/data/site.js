// One place for the facts the pages share. Sthitha Quantum Innovations is the parent brand;
// AEGIS, Sthitha Academy and Research & Innovation sit underneath it.
import crashCourseImage from '../assets/courses/quantum-computing-crash-course.jpg';
import malayalamImage from '../assets/courses/quantum-computing-malayalam.png';

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
    key: 'aegis',
    name: 'AEGIS',
    title: 'Post-Quantum Security',
    href: '/aegis',
    summary: "AEGIS is Sthitha's platform for helping critical infrastructure discover cryptographic assets, assess quantum risk and prepare for post-quantum migration.",
    short: 'Discover cryptographic assets, assess quantum risk, prepare to migrate.',
    link: 'Explore AEGIS',
  },
  {
    key: 'academy',
    name: 'Sthitha Academy',
    title: 'Quantum Education',
    href: '/academy',
    summary: 'Sthitha Academy provides structured courses for learners beginning their journey into quantum computing and related technologies.',
    short: 'Structured courses for learners starting out in quantum computing.',
    link: 'Explore Academy',
  },
  {
    key: 'research',
    name: 'Research & Innovation',
    title: 'Exploring What Comes Next',
    href: '/research',
    summary: 'Sthitha explores emerging areas of quantum technology through technical research, experimentation and applied learning, with ongoing work in quantum computing and quantum machine learning.',
    short: 'Technical research, experimentation and applied learning.',
    link: 'Explore Research',
  },
];

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
    status: 'Coming Soon',
    available: false,
    image: malayalamImage,
    imageAlt: 'Quantum Computing in Malayalam course artwork, with the course title in Malayalam',
    udemy: '', // set once the course is approved on Udemy
  },
];

export const learn = ['Qubits', 'Superposition', 'Entanglement', 'Quantum gates', 'Quantum circuits', 'Quantum algorithms'];
export const learners = ['Students', 'Beginners', 'Developers', 'Technology professionals', 'Curious learners'];
export const learningPath = ['Fundamentals', 'Quantum Computing', 'Algorithms'];

export const aurora = {
  name: "AURORA '26",
  kind: 'IEEE Technology Event',
  dates: '2–3 October 2026',
  role: 'Sponsor',
};
