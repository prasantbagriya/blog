'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DeleteButton from './DeleteButton';
import { Post } from '@/lib/db';

export default function AdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/posts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPosts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Dashboard...</div>;
  }

  return (
    <div style={{ margin: 0, padding: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, color: '#0f172a' }}>All Posts</h1>
      </div>

      <div style={{ display: 'flex', gap: '24px', fontSize: '14px', marginBottom: '24px', color: 'var(--muted-foreground)', fontWeight: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
          <span>All</span>
          <span style={{ background: '#dbeafe', color: 'var(--primary)', padding: '2px 8px', borderRadius: '12px' }}>{posts.length}</span>
        </div>
        <div>
          <span>Published</span>
          <span style={{ marginLeft: '8px', background: '#e2e8f0', color: 'var(--foreground)', padding: '2px 8px', borderRadius: '12px' }}>{posts.filter(p => p.published).length}</span>
        </div>
        <div>
          <span>Drafts</span>
          <span style={{ marginLeft: '8px', background: '#e2e8f0', color: 'var(--foreground)', padding: '2px 8px', borderRadius: '12px' }}>{posts.filter(p => !p.published).length}</span>
        </div>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={thStyle}>Title</th>
              <th style={thStyle}>Author</th>
              <th style={thStyle}>SEO</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={tdStyle}>
                  <Link href={`/admin/edit/${post.id}`} style={{ fontWeight: 700, color: '#0f172a', textDecoration: 'none' }}>{post.title || 'Untitled'}</Link>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{post.category} • {post.date}</div>
                </td>
                <td style={tdStyle}>{post.author}</td>
                <td style={tdStyle}>{post.seoScore}%</td>
                <td style={tdStyle}>
                  {post.published ? (
                    <span style={{ background: '#d1fae5', color: '#047857', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>Published</span>
                  ) : (
                    <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>Draft</span>
                  )}
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
                    <Link href={`/admin/edit/${post.id}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>Edit</Link>
                    <DeleteButton id={post.id} type="post" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = { padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' };
const tdStyle: React.CSSProperties = { padding: '16px 24px', fontSize: '14px' };
