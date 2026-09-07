# Labani Jangi

A static Astro website for https://labanijangi.com, prepared for Netlify. Content lives in the repository. No CMS subscription, API keys, database, functions, analytics or paid media services are required.

## Development

Use Node.js 24. Run `npm ci`, then `npm run dev` (http://localhost:4321). Run `npm run build` to check types/content and generate `dist/`; `npm run preview` serves the build. On Windows use `npm.cmd` if PowerShell blocks npm scripts.

Browser checks: after building, run `npx playwright test`. The configuration uses installed Microsoft Edge and checks desktop/mobile navigation, layout overflow, canonical URLs, sitemap and the missing-page template.

## Editing content

- Homepage and biography: `src/pages/index.astro`
- Reading links: `src/data/site.ts`
- Archive: Markdown files in `src/content/archive/`
- Styling: `src/styles/global.css`
- Images: put web-sized files in `public/media/`, referenced as `/media/filename.webp`

The first version contains a sourced MAP programme note and the supplied publication links. The Frontline link has an editorial navigation label, not a claimed quotation of its title. Instagram images and interview text have not been copied. Artwork and authored-writing sections appear automatically when corresponding published entries exist.

Example frontmatter for a new Markdown entry:

```yaml
---
title: Actual artwork title
kind: work
date: 2025-01-01
description: An approved description of the work.
draft: true
language: en
series: Actual series name
medium: Actual medium
image: /media/actual-artwork.webp
imageAlt: A useful description of what the artwork depicts.
credit: Actual artist and photographer credit.
---
```

Write the entry beneath the frontmatter. Replace example values before setting `draft: false`. Drafts are excluded from pages and sitemap. `kind` accepts `work`, `writing`, or `conversation`; `language` accepts `en` or `bn`. Bangla entries are supported; navigation is currently English. Image entries require alt text and credit. Optional `source` and `sourceName` add attribution. An optional `video` URL creates a watch link to an already published video, with no automatic embeds or new hosting service.

Keep high-resolution originals backed up separately. Use web-sized WebP/AVIF exports, ideally below 500 KB when quality permits, preserving proportions and colour. Do not commit large original videos. Builds do not fetch external content.

## Netlify and Bluehost

1. Import the Git repository into a Netlify **Free** project.
2. `netlify.toml` configures build `npm run build`, publish `dist`, Node 24. No adapter, environment variables or SPA rewrite is required.
3. Review a deploy preview before publishing.
4. Add `labanijangi.com` as the primary custom domain and `www.labanijangi.com` as its alias.
5. In Bluehost DNS, enter the exact apex and www record targets displayed by Netlify for this project. Preserve existing email/MX/TXT records. The registration can remain at Bluehost.
6. Verify DNS and HTTPS, then check www redirects to the primary domain.

Canonical URLs, robots and sitemap use `https://labanijangi.com`. Publishing and DNS changes require access to those accounts; repository configuration does not deploy the website.

## Zero-cost operation

Remain on Netlify Free and avoid paid upgrades/add-ons. Free hosting has usage limits; review dashboard usage as traffic and media grow. The code has no paid service integrations and cannot control account billing settings. Existing domain renewal is separate.

References: https://docs.astro.build/en/guides/deploy/netlify/ and https://www.netlify.com/pricing/.

## Content still needed

Review biography with Labani and supply approved artwork files, captions, credits and writings. Contact currently links to her supplied Instagram account. No fabricated artwork, contact details, translations or campaign features are included.
