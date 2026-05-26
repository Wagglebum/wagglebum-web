import { MetadataRoute } from 'next';
import { getAllDocSlugs } from '@/lib/docs';

const BASE = 'https://wagglebum.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                           priority: 1.0,  changeFrequency: 'weekly' },
    { url: `${BASE}/games`,                priority: 0.8,  changeFrequency: 'monthly' },
    { url: `${BASE}/plugins`,              priority: 0.8,  changeFrequency: 'monthly' },
    { url: `${BASE}/plugins/wagsave`,      priority: 0.9,  changeFrequency: 'weekly' },
    { url: `${BASE}/games/hello-good-dog`, priority: 0.7,  changeFrequency: 'monthly' },
    { url: `${BASE}/about`,                priority: 0.5,  changeFrequency: 'monthly' },
    { url: `${BASE}/support`,              priority: 0.6,  changeFrequency: 'monthly' },
    { url: `${BASE}/plugins/wagsave/support`, priority: 0.6, changeFrequency: 'weekly' },
  ];

  const docRoutes: MetadataRoute.Sitemap = getAllDocSlugs()
    .filter(({ sectionId }) => !['es', 'ja', 'ko', 'zh-CN', 'zh-TW'].includes(sectionId))
    .map(({ sectionId, slug }) => ({
      url: `${BASE}/docs/${sectionId}/${slug}`,
      priority: 0.7,
      changeFrequency: 'monthly' as const,
    }));

  return [...staticRoutes, ...docRoutes];
}
