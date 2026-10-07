// Insights are the Markdown files in src/content/insights — add a file there to publish one.
const modules = import.meta.glob('../content/insights/*.md', { eager: true });

const format = (date, month) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', { month, day: 'numeric', year: 'numeric', timeZone: 'UTC' });

export const posts = Object.entries(modules)
  .map(([file, post]) => ({
    slug: file.split('/').pop().replace(/\.md$/, ''),
    ...post.frontmatter,
    dateShort: format(post.frontmatter.date, 'short'),
    dateLong: format(post.frontmatter.date, 'long'),
    Content: post.Content,
  }))
  .sort((a, b) => b.date.localeCompare(a.date));
