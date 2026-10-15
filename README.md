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

## Contact form setup

The contact form sends mail through [EmailJS](https://www.emailjs.com) and is protected by Google reCAPTCHA v2. It needs four environment variables. Without them the form shows "The contact form is not configured yet" and the Send button is disabled.

```bash
cp .env.example .env    # then fill in the real values
```

| Variable | Where to get it |
| --- | --- |
| `PUBLIC_EMAILJS_SERVICE_ID` | EmailJS dashboard > Email Services |
| `PUBLIC_EMAILJS_TEMPLATE_ID` | EmailJS dashboard > Email Templates |
| `PUBLIC_EMAILJS_PUBLIC_KEY` | EmailJS dashboard > Account > General |
| `PUBLIC_RECAPTCHA_SITE_KEY` | Google reCAPTCHA admin console (v2 checkbox key) |

- `.env` is git-ignored and is never committed. Restart `npm run dev` after changing it, because Astro reads it at startup.
- The values are exposed to the browser by design (the `PUBLIC_` prefix). Never put a reCAPTCHA *secret* key or an EmailJS private key in `.env`.
- Add the same four variables in your host's environment settings and redeploy. The build bakes them into the site.

### Before the form works on a domain

1. **reCAPTCHA:** add every domain the site runs on (`localhost`, the live domain, any preview domain) to the key's domain list in the reCAPTCHA admin console. Otherwise the widget shows "Invalid domain for site key".
2. **EmailJS:** if you restrict allowed origins under Account > Security, add the same domains.
3. **Server-side captcha check (recommended):** the widget is only checked in the browser, which bots can bypass. In EmailJS, go to Account > Security, enable reCAPTCHA verification and enter the reCAPTCHA **secret** key there. EmailJS then rejects submissions without a valid captcha token. The form already sends the token, so no code change is needed.

The privacy and cookie policies list EmailJS and Google reCAPTCHA. Update them if you change providers.

## Notes

- Company facts (name, offices, email, social links), courses and areas of work are kept in `src/data/site.js`. A social link only appears once its URL is set.
- Team members, bios and photos are in `src/pages/our-team.astro`; photos live in `public/assets/team/`.
- The site is static, so any static host works. Set `site` in `astro.config.mjs` to the final domain.
