import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import path from 'path';

const BASE_URL = 'https://chatwizs.com';

async function generateSeoAssets() {
  console.log('--- GENERATING STATIC SEO ASSETS (ADVANCED V2.0) ---');
  
  const dataDir = path.join(process.cwd(), 'data');
  const postsPath = path.join(dataDir, 'posts.json');
  const storiesPath = path.join(dataDir, 'stories.json');

  let posts = [];
  let stories = [];

  try {
    if (existsSync(postsPath)) {
      posts = JSON.parse(readFileSync(postsPath, 'utf-8'));
    }
    if (existsSync(storiesPath)) {
      stories = JSON.parse(readFileSync(storiesPath, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading data for sitemap:', e);
  }

  const publishedPosts = posts.filter(p => p && p.published);
  const publishedStories = stories.filter(s => s && s.published);

  // 1. Standard Sitemap (with Image Support)
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/blog</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/stories</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url><loc>${BASE_URL}/about</loc><priority>0.5</priority></url>
  <url><loc>${BASE_URL}/contact</loc><priority>0.5</priority></url>
  ${publishedPosts.map(p => `
  <url>
    <loc>${BASE_URL}/blog/${p.slug}</loc>
    <lastmod>${p.lastModified || p.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${p.coverImage.startsWith('http') ? p.coverImage : BASE_URL + p.coverImage}</image:loc>
      <image:title>${p.title.replace(/&/g, '&amp;')}</image:title>
    </image:image>
  </url>`).join('')}
  ${publishedStories.map(s => `
  <url>
    <loc>${BASE_URL}/stories/${s.slug}</loc>
    <lastmod>${s.lastModified || s.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${s.posterImage.startsWith('http') ? s.posterImage : BASE_URL + s.posterImage}</image:loc>
      <image:title>${s.title.replace(/&/g, '&amp;')}</image:title>
    </image:image>
  </url>`).join('')}
</urlset>`;

  // 2. News Sitemap (Hardened for Google News Approval)
  let newsSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${publishedPosts.slice(0, 100).map(p => `
  <url>
    <loc>${BASE_URL}/blog/${p.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>ChatWizs</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${new Date(p.date).toISOString()}</news:publication_date>
      <news:title>${p.title.replace(/&/g, '&amp;')}</news:title>
    </news:news>
  </url>`).join('')}
</urlset>`;

  // 3. RSS Feed (Full Content Simulation for Feed Readers)
  let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title>ChatWizs Blog</title>
  <link>${BASE_URL}</link>
  <description>Expert SEO and Technology Insights for 2026</description>
  <language>en-us</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
  ${publishedPosts.slice(0, 20).map(p => `
  <item>
    <title>${p.title.replace(/&/g, '&amp;')}</title>
    <link>${BASE_URL}/blog/${p.slug}</link>
    <description><![CDATA[${p.excerpt}]]></description>
    <pubDate>${new Date(p.date).toUTCString()}</pubDate>
    <guid isPermaLink="true">${BASE_URL}/blog/${p.slug}</guid>
    <dc:creator>${p.author || 'ChatWizs Team'}</dc:creator>
    <category>${p.category}</category>
  </item>`).join('')}
</channel>
</rss>`;

  // 4. Robots.txt (Crawler Efficiency Tuning)
  let robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/admin
Disallow: /auth
Disallow: /_next

# Sitemaps
Sitemap: ${BASE_URL}/sitemap.xml
Sitemap: ${BASE_URL}/news-sitemap.xml`;

  const publicDir = path.join(process.cwd(), 'public');
  if (!existsSync(publicDir)) mkdirSync(publicDir);

  writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
  writeFileSync(path.join(publicDir, 'news-sitemap.xml'), newsSitemap);
  writeFileSync(path.join(publicDir, 'feed.xml'), rss);
  writeFileSync(path.join(publicDir, 'robots.txt'), robots);
  
  console.log('✅ Advanced SEO Assets Successfully Deployed');
}

generateSeoAssets().catch(console.error);
