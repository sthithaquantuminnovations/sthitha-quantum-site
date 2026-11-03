// Generates the 1200×630 social cards in public/assets/og/ and the app icons in public/assets/images/.
// Run with `npm run og` after changing a card's text or adding an Insights article.
import sharp from 'sharp';
import { readFileSync, readdirSync, mkdirSync } from 'node:fs';

const OUT = 'public/assets/og';
const LOGO = 'public/assets/images/sthitha-logo-icon.png';
const BG = '#110f0d';
const BLUE = '#3aa0ff';
mkdirSync(OUT, { recursive: true });

const cards = [
  { file: 'og-home', eyebrow: 'Sthitha Quantum Innovations', title: 'Building Technology for the Quantum Era', sub: 'Quantum computing · Post-quantum security · Education · Research' },
  { file: 'og-exodia', eyebrow: 'Sthitha Exodia', title: 'Post-Quantum Security & PQC Migration', sub: 'Discover · Protect · Migrate' },
  { file: 'og-academy', eyebrow: 'Sthitha Academy', title: 'Learn Quantum Computing, Starting With the Fundamentals', sub: 'Quantum computing courses in English and Malayalam' },
  { file: 'og-crash-course', eyebrow: 'Sthitha Academy · Course', title: 'Quantum Computing Crash Course', sub: 'Qubits to Shor & Grover' },
  { file: 'og-malayalam', eyebrow: 'Sthitha Academy · Course', title: 'Quantum Computing in Malayalam', sub: 'For Beginners' },
  { file: 'og-research', eyebrow: 'Research & Innovation', title: 'Exploring the Science Behind Quantum Technologies', sub: 'Quantum computing · Quantum algorithms · Quantum machine learning' },
];

// One card per Insights article: the article's headline under its discipline.
for (const f of readdirSync('src/content/insights').filter((f) => f.endsWith('.md'))) {
  const fm = readFileSync(`src/content/insights/${f}`, 'utf8').split('---')[1];
  const field = (k) => fm.match(new RegExp(`^${k}:\\s*"(.*)"`, 'm'))?.[1] ?? '';
  cards.push({ file: `og-${f.replace(/\.md$/, '')}`, eyebrow: `Insights · ${field('category')}`, title: field('title'), sub: `${field('readingTime')} · Sthitha Quantum Innovations` });
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function wrap(text, max) {
  const lines = [];
  let line = '';
  for (const word of text.split(' ')) {
    if ((line + ' ' + word).trim().length > max) { lines.push(line); line = word; } else line = (line + ' ' + word).trim();
  }
  return [...lines, line];
}

const logo = await sharp(LOGO).resize({ height: 300 }).png().toBuffer();
const logoMeta = await sharp(logo).metadata();

for (const card of cards) {
  const size = card.title.length > 60 ? 50 : card.title.length > 36 ? 58 : 66;
  const lines = wrap(card.title, Math.round(1180 / size)).slice(0, 4);
  const top = 300 - (lines.length * size * 1.12) / 2;
  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="g" cx="82%" cy="42%" r="55%"><stop offset="0" stop-color="${BLUE}" stop-opacity=".28"/><stop offset="1" stop-color="${BG}" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="1200" height="630" fill="${BG}"/>
    <rect width="1200" height="630" fill="url(#g)"/>
    <rect x="72" y="72" width="40" height="4" fill="${BLUE}"/>
    <text x="72" y="${top - 34}" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="24" font-weight="600" letter-spacing="2" fill="${BLUE}">${esc(card.eyebrow.toUpperCase())}</text>
    ${lines.map((l, i) => `<text x="72" y="${top + size + i * size * 1.12}" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="${size}" font-weight="700" fill="#ffffff">${esc(l)}</text>`).join('')}
    <text x="72" y="${top + size + lines.length * size * 1.12 + 22}" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="26" fill="#b9b3ad">${esc(card.sub)}</text>
    <text x="72" y="566" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="22" fill="#8a847e">sthithaquantum.com · Bengaluru, India</text>
  </svg>`;
  await sharp(Buffer.from(svg))
    .composite([{ input: logo, left: 1200 - logoMeta.width - 72, top: Math.round((630 - logoMeta.height) / 2) }])
    .png({ compressionLevel: 9 })
    .toFile(`${OUT}/${card.file}.png`);
  console.log(`${OUT}/${card.file}.png`);
}

// App icons for the web manifest: the atom mark centred on the site background.
for (const px of [192, 512]) {
  const mark = await sharp(LOGO).resize({ height: Math.round(px * 0.72) }).png().toBuffer();
  await sharp({ create: { width: px, height: px, channels: 4, background: BG } })
    .composite([{ input: mark, gravity: 'center' }])
    .png()
    .toFile(`public/assets/images/icon-${px}.png`);
  console.log(`public/assets/images/icon-${px}.png`);
}
