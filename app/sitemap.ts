import { MetadataRoute } from 'next';
import { getPosts, getStories } from '@/lib/db';

const BASE_URL = 'https://chatwizs.com';

// ✅ DYNAMIC SITEMAP: Auto-generated from live database
// Google gets accurate lastmod → better crawl budget allocation
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Regenerate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, stories] = await Promise.all([getPosts(), getStories()]);

  const publishedPosts = posts.filter(p => p.published);
  const publishedStories = stories.filter(s => s.published);

  // ✅ Static core pages — changefreq + priority tuned for Google
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/stories`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date('2025-01-01'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date('2025-01-01'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/editorial-policy`,
      lastModified: new Date('2025-01-01'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/fact-checking-policy`,
      lastModified: new Date('2025-01-01'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date('2025-01-01'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date('2025-01-01'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // ✅ Dynamic blog post pages
  const postPages: MetadataRoute.Sitemap = publishedPosts.map(post => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.lastModified
      ? new Date(post.lastModified)
      : new Date(post.date),
    changeFrequency: 'weekly' as const,
    priority: post.isPillarPage ? 0.95 : 0.8,
  }));

  // ✅ Dynamic category pages
  const categories = Array.from(
    new Set(publishedPosts.map(p => p.category.toLowerCase().replace(/ /g, '-')))
  );
  const categoryPages: MetadataRoute.Sitemap = categories.map(cat => ({
    url: `${BASE_URL}/category/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // ✅ Dynamic author pages
  const authorSlugs = Array.from(
    new Set(
      publishedPosts
        .filter(p => p.author)
        .map(p => p.author.toLowerCase().replace(/ /g, '-'))
    )
  );
  const authorPages: MetadataRoute.Sitemap = authorSlugs.map(slug => ({
    url: `${BASE_URL}/author/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // ✅ Dynamic web stories pages
  const storyPages: MetadataRoute.Sitemap = publishedStories.map(story => ({
    url: `${BASE_URL}/stories/${story.slug}`,
    lastModified: story.lastModified
      ? new Date(story.lastModified)
      : new Date(story.date),
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  return [
    ...staticPages,
    ...postPages,
    ...categoryPages,
    ...authorPages,
    ...storyPages,
  ];
}
