import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
export const GET: APIRoute = async ({ site }) => {
  const entries = await getCollection('archive', ({data}) => !data.draft);
  const urls = ['/', ...entries.map(entry => `/archive/${entry.id}/`)];
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(path => `<url><loc>${new URL(path, site).href.replaceAll('&', '&amp;').replaceAll('<', '&lt;')}</loc></url>`).join('')}</urlset>`, { headers: {'Content-Type':'application/xml'} });
};
