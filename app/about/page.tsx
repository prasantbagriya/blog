import { Metadata } from 'next';
import Link from 'next/link';

const BASE_URL = 'https://chatwizs.com';

export const metadata: Metadata = {
  title: 'About ChatWizs | Our Editorial Mission & Standards',
  description: 'ChatWizs publishes expert-verified articles on SEO, technology, and digital marketing. Learn about our editorial standards, EEAT compliance, and the team behind our content.',
  alternates: { canonical: `${BASE_URL}/about` },
};

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 0' }}>
      <nav aria-label="Breadcrumb" style={{ marginBottom: '2rem', fontSize: '0.875rem' }}>
        <ol style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '0.5rem', color: 'var(--muted-foreground)' }}>
          <li><Link href="/" style={{ color: 'var(--primary)' }}>Home</Link></li>
          <li>/</li>
          <li aria-current="page">About</li>
        </ol>
      </nav>

      <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>About ChatWizs</h1>
      <p style={{ color: 'var(--muted-foreground)', fontSize: '1.125rem', marginBottom: '3rem' }}>
        Expert-verified content for the modern web — built on transparency, experience, and trust.
      </p>

      <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Our Mission</h2>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '1.125rem', lineHeight: 1.8 }}>
          ChatWizs is dedicated to providing high-quality, research-backed insights into SEO and web development.
          In an era of AI-generated content, we stand for <strong>human expertise</strong> and full editorial accountability.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Editorial Standards (Google EEAT 2026 Compliant)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {[
            { icon: '✅', title: 'Experience', desc: 'Every author has documented, first-hand experience in their field.' },
            { icon: '🎓', title: 'Expertise', desc: 'Articles are written by subject-matter experts with verifiable credentials.' },
            { icon: '🏆', title: 'Authoritativeness', desc: 'We cite primary sources and industry-leading references.' },
            { icon: '🛡️', title: 'Trustworthiness', desc: 'All content is human-edited and fact-checked.' },
          ].map(item => (
            <div key={item.title} className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', gap: '1rem' }}>
              <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
              <div>
                <strong>{item.title}</strong>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9375rem', margin: 0 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
