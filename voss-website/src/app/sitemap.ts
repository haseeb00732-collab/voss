import type { MetadataRoute } from 'next';
import { CATALOGUE } from '@/lib/catalogue';
export default function sitemap(): MetadataRoute.Sitemap {
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (!site) return [];
  return ['','/collection','/about','/help','/terms','/privacy','/shipping','/returns','/contact',...CATALOGUE.map(p=>`/collection/${p.slug}`)].map(route=>({url:new URL(route,site).href}));
}
