import type { APIRoute } from 'astro';
import { publishedArchive } from '../lib/archive';
import { localPath } from '../i18n';
export const GET: APIRoute = async ({ site }) => {
  const entries = await publishedArchive();
  const urls = ['/', '/bn/', '/practice/', '/works/', '/artworks/', '/artworks/political/', '/artworks/palestine/', '/artworks/others/', '/archive/', '/about/', '/contact/', '/privacy/', '/terms/', '/bn/practice/', '/bn/works/', '/bn/artworks/', '/bn/artworks/political/', '/bn/artworks/palestine/', '/bn/artworks/others/', '/bn/archive/', '/bn/about/', '/bn/contact/', '/bn/privacy/', '/bn/terms/', ...entries.map(entry => localPath(`/archive/${entry.data.translationKey}/`, entry.data.language))];
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(path => `<url><loc>${new URL(path, site).href.replaceAll('&', '&amp;').replaceAll('<', '&lt;')}</loc></url>`).join('')}</urlset>`, { headers: {'Content-Type':'application/xml'} });
};
