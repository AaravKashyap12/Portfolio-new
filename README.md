# Aarav Kashyap Singh Portfolio

A production-minded portfolio built to feel less like a resume and more like a small product. It highlights real AI and full-stack work through a dark/light visual system, interactive project case studies, architecture previews, live traffic signals, and a tiny Oneko companion in the hero.

Live site: [https://www.aaravkashyap.live/](https://www.aaravkashyap.live/)

## What Is Inside

- Product-style hero with responsive dark and light modes
- Interactive project cards with modal case studies
- Architecture images with a full workflow viewer
- Capability and expertise sections designed for scanning
- Contact section with GitHub-style contribution graph
- Real visitor and live-viewer signals through an API route
- Oneko-style cursor pet scoped to the hero
- Playwright smoke tests for links, modals, hover states, responsive layout, and theme behavior

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Framer Motion
- GSAP
- CSS modules through global design tokens
- Playwright
- Optional Upstash Redis for live hero stats

## Getting Started

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

## Environment Variables

Create `.env.local` from `.env.example`:

```bash
NEXT_PUBLIC_GITHUB_TOKEN=your_github_token_here
UPSTASH_REDIS_REST_URL=https://your-upstash-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_rest_token_here
```

The site still renders without these values, but live stats and authenticated GitHub data work best when they are present.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npx playwright test
```

## Project Structure

```text
src/app/page.tsx              Main portfolio experience
src/app/globals.css           Visual system, responsive rules, themes
src/app/api/hero-stats        Visitor and live-viewer stats route
src/components/GitHubGraph    Contribution graph component
src/components/CursorCat      Hero-only Oneko companion
public/architectures          Project architecture visuals
tests                         Playwright smoke tests
```

## Deployment

The project is ready for Vercel.

1. Push to GitHub.
2. Import the repo into Vercel.
3. Add the environment variables from `.env.example`.
4. Deploy.

## Open Source Note

You are welcome to fork the repo and adapt the structure, motion ideas, and interaction patterns. Please replace personal content, screenshots, architecture assets, links, and branding before publishing your own version.
