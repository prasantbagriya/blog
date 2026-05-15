'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { handleAdminLogin } from '@/lib/actions';

export default function LoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError('');
    
    try {
      const result = await handleAdminLogin(password);
      
      if (result.success) {
        // Force a hard refresh to ensure the new cookie is recognized by the layout
        window.location.href = '/admin';
      } else {
        setError(result.error || 'Invalid master password');
        setIsPending(false);
      }
    } catch (err) {
      setError('Connection error. Please try again later.');
      setIsPending(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: '400px' }}>
      <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Admin Login</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Master Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: 'rgba(255,255,255,0.05)',
              color: 'inherit'
            }}
            required
            disabled={isPending}
          />
        </div>
        {error && <p style={{ color: '#ff4444', fontSize: '0.875rem' }}>{error}</p>}
        <button
          type="submit"
          className="btn-primary"
          disabled={isPending}
          style={{ 
            width: '100%', 
            padding: '0.75rem', 
            borderRadius: 'var(--radius)',
            opacity: isPending ? 0.7 : 1,
            cursor: isPending ? 'not-allowed' : 'pointer'
          }}
        >
          {isPending ? 'Verifying...' : 'Access Dashboard'}
        </button>
      </form>
    </div>
  );
}
