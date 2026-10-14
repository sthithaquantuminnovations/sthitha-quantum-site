# Build the Astro site, then serve the static output with nginx on Cloud Run's port 8080.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# The contact form values are baked in at build time (they are public by design).
ARG PUBLIC_EMAILJS_SERVICE_ID=service_50eugon
ARG PUBLIC_EMAILJS_TEMPLATE_ID=template_q49sp0r
ARG PUBLIC_EMAILJS_PUBLIC_KEY=BFa5meIZW5sFKTJ8q
ARG PUBLIC_RECAPTCHA_SITE_KEY=6Lc5ou0tAAAAAHsN5-fiduCuBsZMeMBKX9N0m5l9
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
