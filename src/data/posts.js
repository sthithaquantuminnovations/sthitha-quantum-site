// Insights are the Markdown files in src/content/insights — add a file there to publish one.
const modules = import.meta.glob('../content/insights/*.md', { eager: true });

const format = (date, month) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', { month, day: 'numeric', year: 'numeric', timeZone: 'UTC' });

export const posts = Object.entries(modules)
  .map(([file, post]) => {
    const raw = typeof post.rawContent === 'function' ? post.rawContent() : '';
    const wordCount = raw ? raw.trim().split(/\s+/).filter(Boolean).length : 0;
    const readingTime = post.frontmatter.readingTime || (wordCount > 0 ? `${Math.max(1, Math.ceil(wordCount / 200))} min read` : '4 min read');

    return {
      slug: file.split('/').pop().replace(/\.md$/, ''),
      ...post.frontmatter,
      wordCount,
      readingTime,
      dateShort: format(post.frontmatter.date, 'short'),
      dateLong: format(post.frontmatter.date, 'long'),
      Content: post.Content,
      getHeadings: typeof post.getHeadings === 'function' ? post.getHeadings : () => [],
    };
  })
  .sort((a, b) => b.date.localeCompare(a.date));

