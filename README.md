# Sthitha Quantum Innovations

Website for Sthitha Quantum Innovations, a quantum technology company in Bengaluru, India, working across quantum computing, post-quantum security, education and research.

The site covers three areas of work:

- **Sthitha Exodia**: post-quantum security
- **Sthitha Academy**: quantum education and courses
- **Research & Innovation**: quantum computing, algorithms and quantum machine learning

## Built with

- [Astro](https://astro.build) (static output)
- Plain CSS and JavaScript, with canvas animations in `src/scripts/visuals.js`

## Getting started

```bash
npm install
npm run dev      # local dev server at http://localhost:4321
npm run build    # static build into dist/
npm run preview  # preview the production build
```

## Project structure

```
src/
  pages/        one file per route (about, academy, exodia, research, events, ...)
  components/   shared and home-page components
  data/         site facts, courses and posts
  scripts/      interactions and canvas visuals
  styles/       global.css
public/         static assets (fonts, images, logos)
```

## Notes

- Company facts, courses and links are kept in `src/data/site.js`.
- The contact form posts to `/contact-handler.php`, which is not part of this repository. Connect it to a form backend before relying on it in production.
