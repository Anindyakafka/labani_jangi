# Labani Jangi

A static Astro website for https://labanijangi.com, prepared for Netlify. Content lives in the repository. No CMS subscription, API keys, database, functions or paid media services are required.

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

## West Bengal map

`src/components/WestBengalMap.astro` renders 23 separate SVG district paths, with Nadia highlighted. `data-district-id` provides stable local names for future statistics and interaction; source IDs are retained. No runtime map library, external tile requests, API key or statistics are included. Native SVG titles provide district names; custom hover/touch/keyboard behaviour is deferred.

Geometry is from geoBoundaries IND ADM2, boundary ID `IND-ADM2-76128533`, representing 2021, provided by Pathways Data Pvt. Ltd. / lgdirectory.gov.in under **Open Database License 1.0**. Map derivatives in `public/maps/west-bengal.geojson` and `src/data/west-bengal.json` retain that license, separate from the repository code license. The page includes attribution, a license link and downloadable derivative geometry. Source: https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/IND/ADM2/geoBoundaries-IND-ADM2_simplified.geojson . Metadata: https://www.geoboundaries.org/api/current/gbOpen/IND/ADM2/ . License: https://opendatacommons.org/licenses/odbl/1-0/ .

To regenerate, download the pinned source URL above as `map-source.tmp.json`, run `python scripts/prepare-map.py`, then remove the temporary source. The script selects West Bengal districts, preserves source IDs, normalises display spellings (including source `Barddhaman` to `Purba Bardhaman`), and projects coordinates to a local equirectangular SVG at latitude 24.5°. Before joining statistics, verify boundary vintages and district names against the statistical dataset; this is not a claim of current administrative boundaries.

## Content still needed before launch

Review biography with Labani and supply approved artwork files, captions, credits and writings. Contact currently links to her supplied Instagram account. No fabricated artwork, contact details, translations or campaign features are included.

## Analytics

Umami Cloud tracking is configured in `src/layouts/Layout.astro` for website ID `c0819d04-f244-4caf-8922-e89e57123ae6`. This identifier is public, not an API credential. The tracker records only on `labanijangi.com` and `www.labanijangi.com`, respects Do Not Track, and excludes URL fragments. Localhost and deploy-preview visits are excluded. No session recording, user identifiers, custom personal-data properties or paid features are enabled by this implementation.

Page views cover home and archive traffic. Event attributes record Instagram clicks, publication clicks, archive opens by content kind, and video/source link clicks. A video-link click is not a video play; a page visit is not proof someone read the content. Map interactions and reading-depth metrics are not implemented yet. Events count toward the Umami account's free usage quota.

On Netlify, `/studio-insights-7c39/` redirects to the Umami account dashboard, where login is required. This is a convenience shortcut, not authentication or a secret stored securely; its path is visible in repository configuration. It is absent from navigation and sitemap. Keep Umami public sharing disabled. There is no custom dashboard or API secret in the website.

After deploying, visit the production domain with tracking permitted in your browser, click a publication/Instagram link, and confirm page views and events in Umami. Local tests mock the external script and do not verify ingestion into the private account. No historical traffic can be recovered by this installation. Stay on Hobby and check the account's quota and retention settings.