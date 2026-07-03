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
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
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
              background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: 'var(--font-display)'
            }}
          >
            🐍 PyLearn
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
                  <span style={{ color: 'var(--accent-color)', fontWeight: 600, border: '1px solid rgba(168,85,247,0.2)', padding: '1px 4px', borderRadius: '4px', background: 'rgba(168,85,247,0.05)' }}>
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
                background: 'rgba(15,23,42,0.04)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(15, 23, 42, 0.04)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Sign In
            </Link>
            <Link href="/register" className="gradient-button" style={{ padding: '6px 16px', fontSize: '0.85rem', borderRadius: '6px' }}>
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
