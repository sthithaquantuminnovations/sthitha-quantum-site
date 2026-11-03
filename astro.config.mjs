import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { readFileSync, readdirSync } from 'node:fs';

const SITE = 'https://sthithaquantum.com';

// Legal pages are noindex, the 404 is not a page and /blog only redirects, so none belong in the sitemap.
const EXCLUDE = ['/privacy-policy/', '/terms-and-conditions/', '/cookie-policy/', '/404/'];

// An article's lastmod is its own updated (or published) date rather than the build date.
const articleDates = Object.fromEntries(
  readdirSync('./src/content/insights')
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const fm = readFileSync(`./src/content/insights/${f}`, 'utf8').split('---')[1] ?? '';
      const pick = (key) => fm.match(new RegExp(`^${key}:\\s*"?([0-9-]+)"?`, 'm'))?.[1];
      return [`${SITE}/research/insights/${f.replace(/\.md$/, '')}/`, pick('updated') || pick('date')];
    }),
);
const buildDate = new Date().toISOString();

// Wraps each ASCII diagram in a <figure>, naming it after the title line drawn inside the box.
function rehypeDiagramFigures() {
  const text = (node) => (node.type === 'text' ? node.value : (node.children || []).map(text).join(''));
  const walk = (node) => {
    (node.children || []).forEach((child, i) => {
      if (child.type === 'element' && child.tagName === 'pre') {
        const body = text(child);
        if (!/^\s*\+-{3,}/m.test(body)) return;
        const title = body.match(/^\|\s+([A-Z0-9'’ ,:()&/-]{6,}?)\s+\|$/m)?.[1]?.trim();
        if (!title) return;
        const acronyms = /^(NIST|PQC|HNDL|QML|RSA|ECC|TLS|AI)$/;
        const caption = title
          .split(' ')
          .map((w) => (acronyms.test(w) ? w : w.toLowerCase()))
          .join(' ')
          .replace(/^\w/, (c) => c.toUpperCase());
        node.children[i] = {
          type: 'element',
          tagName: 'figure',
          properties: { className: ['diagram'] },
          children: [child, { type: 'element', tagName: 'figcaption', properties: { className: ['sr-only'] }, children: [{ type: 'text', value: caption }] }],
        };
      } else walk(child);
    });
  };
  return walk;
}

export default defineConfig({
  site: SITE,
  // One URL form everywhere: /about/, never /about.
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/blog') && !EXCLUDE.some((p) => page.endsWith(p)),
      serialize: (item) => ({ ...item, lastmod: articleDates[item.url] ? new Date(articleDates[item.url]).toISOString() : buildDate }),
    }),
  ],
  markdown: {
    // Maths is rendered to HTML + MathML at build time, so readers and crawlers get real symbols.
    remarkPlugins: [remarkMath],
    rehypePlugins: [[rehypeKatex, { output: 'htmlAndMathml', throwOnError: false }], rehypeDiagramFigures],
  },
  // Whitespace between inline elements matters for the word-by-word reveals.
  compressHTML: false,
});
