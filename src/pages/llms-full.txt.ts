// Plain-text copy of every Insights article for AI assistants (linked from /llms.txt).
import type { APIRoute } from 'astro';
import { posts } from '../data/posts.js';
import { oneLiner } from '../data/seo.js';

export const GET: APIRoute = ({ site }) => {
  const articles = posts.map((post) => {
    const url = new URL(`/research/insights/${post.slug}/`, site).href;
    const body = post.rawContent ? post.rawContent() : '';
    return [
      `# ${post.title}`,
      '',
      `URL: ${url}`,
      `Published: ${post.date}${post.updated ? ` · Updated: ${post.updated}` : ''}`,
      `Author: ${post.author}`,
      `Discipline: ${post.category}`,
      '',
      `> ${post.excerpt}`,
      '',
      body.trim(),
    ].join('\n');
  });
  const text = [`# Sthitha Quantum Innovations — Insights (full text)`, '', `> ${oneLiner}`, '', ...articles.flatMap((a) => [a, '', '---', ''])].join('\n');
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
