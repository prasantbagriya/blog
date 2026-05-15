import { getPosts, getStories } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import Copyright from './Copyright';

const BASE_URL = 'https://chatwizs.com';

export const metadata: Metadata = {
  title: 'ChatWizs | Leading Authority on Modern Web & SEO 2026',
  description: 'Expert insights, visual web stories, and high-performance strategies to dominate Google search and AI overviews in 2026.',
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: 'ChatWizs | 2026 Search Authority',
    description: 'Expert insights on SEO and Web Performance.',
    url: BASE_URL,
    siteName: 'ChatWizs',
    images: [{ url: 'https://chatwizs.com/og-image.jpg', width: 1200, height: 630 }],
    locale: 'en_US',
    type: 'website',
  },
};

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Ensure Home page always shows latest content immediately

export default async function Home() {
  const allPosts = await getPosts();
  // Sort by date DESC, then by array position DESC (latest uploaded is first)
  const publishedPosts = [...allPosts]
    .filter(p => p && p.published)
    .sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return allPosts.indexOf(b) - allPosts.indexOf(a);
    });
  const featuredPost = publishedPosts[0];
  const recentPosts = publishedPosts.slice(1, 4);
  
  const stories = await getStories();
  const publishedStories = stories.filter(s => s && s.published).slice(0, 4);

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: 'ChatWizs',
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/logo-96x96.png`,
      width: 96,
      height: 96
    },
    sameAs: ['https://twitter.com/chatwizs']
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />

      {/* ✅ Hero Section: LCP Optimized */}
      <section className="hero-skeleton animate-fade-in" style={{ 
        textAlign: 'center', 
        padding: '6rem 0',
        background: 'radial-gradient(circle at center, rgba(37, 99, 235, 0.05) 0%, transparent 70%)',
        marginBottom: '2rem'
      }}>
        <h1 className="hero-h1" style={{ fontSize: '4rem', letterSpacing: '-0.04em' }}>
          Insights for the <br />
          <span style={{ 
            color: 'var(--primary)', 
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 10px 20px rgba(37, 99, 235, 0.1))'
          }}>Modern Web</span>
        </h1>
        <p className="hero-p" style={{ fontSize: '1.25rem', opacity: 0.8 }}>
          Dominate 2026 search landscapes with expert-verified SEO strategies and visual Web Stories.
        </p>
      </section>

      {featuredPost && (
        <section className="lcp-section" style={{ marginBottom: '5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Featured Insight</h2>
            <Link href="/blog" aria-label="View all featured blog posts" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9375rem', padding: '0.5rem 0' }}>View All Posts →</Link>
          </div>
          <article className="glass-panel card-hover" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            overflow: 'hidden', 
            minHeight: '480px',
            border: '1px solid var(--border)',
            boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.05)'
          }}>
            <Link href={`/blog/${featuredPost.slug}`} aria-hidden="true" tabIndex={-1} style={{ position: 'relative', minHeight: '320px', display: 'block' }}>
              <Image 
                src={featuredPost.coverImage} 
                alt="" 
                fill 
                priority
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, 50vw"
                fetchPriority="high"
              />
            </Link>
            <div style={{ padding: '3.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#ffffff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <span style={{ background: 'var(--primary)', color: 'white', fontSize: '0.7rem', fontWeight: 900, padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase' }}>FEATURED</span>
                <span style={{ color: 'var(--muted-foreground)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{featuredPost.category}</span>
              </div>
              <h3 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', lineHeight: 1.1, fontWeight: 900, letterSpacing: '-0.03em' }}>
                <Link href={`/blog/${featuredPost.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{featuredPost.title}</Link>
              </h3>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '1.125rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>{featuredPost.excerpt}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 'auto' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', position: 'relative', border: '2px solid var(--primary)' }}>
                  <Image src={featuredPost.authorImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'} alt={featuredPost.author} fill style={{ objectFit: 'cover' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem' }}>{featuredPost.author}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)', fontWeight: 600 }}>{featuredPost.date}</div>
                </div>
              </div>
            </div>
          </article>
        </section>
      )}

      {/* ✅ Visual Web Stories Hub */}
      {publishedStories.length > 0 && (
        <section style={{ marginBottom: '5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Visual Web Stories</h2>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>Bite-sized visual guides for modern SEO.</p>
            </div>
            <Link href="/stories" aria-label="Explore all visual web stories" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9375rem', padding: '0.5rem 0' }}>Explore Stories →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {publishedStories.map((story) => (
              <Link key={story.id} href={`/stories/${story.slug}`} aria-label={`Web Story: ${story.title}`} style={{ display: 'block', aspectRatio: '3/4', position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)' }} className="card-hover">
                <Image src={story.posterImage} alt="" fill style={{ objectFit: 'cover' }} sizes="(max-width: 480px) 100vw, 25vw" />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <h3 style={{ color: 'white', fontSize: '1.125rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>{story.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ✅ Recent Analysis Grid */}
      {recentPosts.length > 0 && (
        <section style={{ marginBottom: '5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem' }}>Latest Technical Audits</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
            {recentPosts.map((post) => (
              <article key={post.id} className="glass-panel card-hover" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <Link href={`/blog/${post.slug}`} aria-hidden="true" tabIndex={-1} style={{ position: 'relative', width: '100%', height: '220px', display: 'block' }}>
                  <Image src={post.coverImage} alt="" fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 33vw" />
                </Link>
                <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.75rem', display: 'block' }}>{post.category || 'Insight'}</span>
                  <h3 style={{ fontSize: '1.375rem', marginBottom: '1rem', lineHeight: 1.3, fontWeight: 700 }}>
                    <Link href={`/blog/${post.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{post.title}</Link>
                  </h3>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9375rem', marginBottom: '1.5rem', flex: 1, lineHeight: 1.5 }}>{post.excerpt}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontWeight: 700 }}>{post.date}</span>
                    <Link href={`/blog/${post.slug}`} aria-label={`Read insight: ${post.title}`} style={{ color: 'var(--primary)', fontWeight: 800, padding: '0.5rem 0' }}>Read Insight →</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ✅ Trust Signal: Methodology */}
      <section className="glass-panel" style={{ padding: '3rem', textAlign: 'center', background: 'var(--accent)', border: 'none' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1rem' }}>Expert-Verified Content Policy</h2>
        <p style={{ maxWidth: '700px', margin: '0 auto 2rem', color: 'var(--muted-foreground)', fontSize: '1.125rem' }}>
          Every article published on ChatWizs undergoes a rigorous 3-step verification process to ensure data accuracy, technical integrity, and search engine compliance.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🛡️ INDEPENDENTLY RESEARCHED</div>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🔬 PEER REVIEWED</div>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📈 DATA DRIVEN</div>
        </div>
      </section>
      
      <footer className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <Copyright />
      </footer>
    </div>
  );
}
