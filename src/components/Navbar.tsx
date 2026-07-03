'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface NavbarProps {
  user: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/login');
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <nav 
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        borderBottom: '1px solid var(--border-color)',
        background: '#ffffff',
        backdropFilter: 'none',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: '70px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: '#000',
              fontFamily: 'var(--font-display)'
            }}
          >
            PyLearn
          </span>
        </Link>

        {user && (
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.95rem' }}>
            <Link href="/dashboard" style={{ color: 'var(--text-secondary)' }} className="nav-link-hover">
              Dashboard
            </Link>
            {user.role === 'ADMIN' && (
              <Link href="/admin" style={{ color: 'var(--text-secondary)' }} className="nav-link-hover">
                Control Panel
              </Link>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {user ? (
          <>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user.name}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {user.role === 'ADMIN' ? (
                  <span style={{ color: '#000', fontWeight: 600, border: '1px solid var(--border-color)', padding: '1px 4px', borderRadius: '4px', background: 'rgba(0,0,0,0.04)' }}>
                    Instructor
                  </span>
                ) : (
                  'Student'
                )}
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              style={{
                background: 'rgba(0,0,0,0.04)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.borderColor = 'var(--border-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.04)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <Link href="/login" className="gradient-button" style={{ padding: '6px 16px', fontSize: '0.85rem', borderRadius: '6px' }}>
            Sign in with Google
          </Link>
        )}
      </div>
    </nav>
  );
}
