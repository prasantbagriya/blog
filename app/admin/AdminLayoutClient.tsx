'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { label: 'Dashboard', href: '/admin', icon: '🏠' },
    { label: 'All Posts', href: '/admin', icon: '📌' },
    { label: 'Add New', href: '/admin/new', icon: '➕' },
    { label: 'Web Stories', href: '/admin/stories', icon: '⚡' },
    { label: 'Media Library', href: '#', icon: '🖼️' },
    { label: 'SEO Audit', href: '#', icon: '📈' },
    { label: 'Settings', href: '#', icon: '⚙️' },
  ];

  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 1000,
      display: 'flex', 
      background: '#f8fafc', 
      color: '#0f172a', 
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Modern SaaS Sidebar */}
      <aside style={{ width: '260px', background: '#ffffff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, zIndex: 200 }}>
        <div style={{ height: '72px', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: '#fff', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px' }}>
            C
          </div>
          <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.5px' }}>ChatWizs Admin</span>
        </div>
        
        <nav style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '8px' }}>Content</div>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.label} 
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  fontSize: '14px',
                  fontWeight: isActive ? 700 : 600,
                  color: isActive ? '#2563eb' : '#0f172a',
                  textDecoration: 'none',
                  background: isActive ? '#eff6ff' : 'transparent',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ fontSize: '16px', filter: isActive ? 'none' : 'grayscale(100%)', opacity: 1 }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '24px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#475569' }}>
            A
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>Admin User</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>editorial@chatwizs.com</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
        {/* Modern Header */}
        <header style={{ height: '72px', minHeight: '72px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ fontSize: '15px', fontWeight: 500, color: '#64748b' }}>
            {(pathname || '').includes('/new') ? 'Create' : (pathname || '').includes('/stories') ? 'Web Stories' : 'Dashboard'}
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <a href="/" target="_blank" style={{ fontSize: '13px', fontWeight: 600, color: '#475569', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ↗ View Live Site
            </a>
            <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }}></div>
            <Link href="/admin/new" style={{ background: '#2563eb', color: '#fff', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, textDecoration: 'none', boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)' }}>
              + New Post
            </Link>
          </div>
        </header>

        <main style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
