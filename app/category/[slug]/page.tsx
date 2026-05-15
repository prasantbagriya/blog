import { getPosts } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

const BASE_URL = 'https://chatwizs.com';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);
  return {
    title: `${categoryName} Insights | ChatWizs`,
    description: `Explore the latest articles and expert guides on ${categoryName}. Optimized for Google 2026 search trends.`,
    alternates: { canonical: `${BASE_URL}/category/${slug}` },
  };
}

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getPosts();
  const categories = Array.from(new Set(posts.map(p => (p.category || 'general').toLowerCase().replace(/ /g, '-'))));
  return categories.map((slug) => ({
    slug,
  }));
}


export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  if (!slug) notFound();
  
  const allPosts = await getPosts();
  const posts = allPosts.filter(p => p.published && (p.category || '').toLowerCase() === slug.toLowerCase());
  const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);

  return (
    <div>
      <nav aria-label="Breadcrumb" style={{ marginBottom: '2rem', fontSize: '0.875rem' }}>
        <ol style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '0.5rem', color: 'var(--muted-foreground)', fontWeight: 600 }}>
          <li><Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Home</Link></li>
          <li style={{ color: '#94a3b8' }}>/</li>
          <li aria-current="page" style={{ color: 'var(--foreground)' }}>{categoryName}</li>
        </ol>
      </nav>

      <section style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', letterSpacing: '-0.03em' }}>
          {categoryName}
        </h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '1.125rem' }}>
          Expert-verified articles and guides on {categoryName.toLowerCase()}.
        </p>
      </section>

      {posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted-foreground)' }}>
          <p style={{ fontSize: '1.25rem' }}>No articles found in this category.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
          {posts.map((post) => (
            <article key={post.id} className="glass-panel card-hover" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <Link href={`/blog/${post.slug}`} aria-hidden="true" tabIndex={-1} style={{ position: 'relative', width: '100%', height: '200px', display: 'block' }}>
                <Image 
                  src={post.coverImage} 
                  alt="" 
                  fill 
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </Link>
              <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', lineHeight: 1.3 }}>
                  <Link href={`/blog/${post.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{post.title}</Link>
                </h2>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '1rem', marginBottom: '1.5rem', flex: 1 }}>{post.excerpt}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: 'auto' }}>
                  <span style={{ color: '#475569', fontWeight: 600 }}>{post.date}</span>
                  <Link href={`/blog/${post.slug}`} aria-label={`Read article: ${post.title}`} style={{ color: 'var(--primary)', fontWeight: 700 }}>Read More →</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
