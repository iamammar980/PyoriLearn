'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import GoogleButton from '@/components/GoogleButton';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const error =
    searchParams.get('error') === 'google' ? 'Google sign-in failed. Please try again.' : '';

  return (
    <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '2.5rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.75rem'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>
            Welcome to <span className="gradient-text">PyLearn</span>
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Sign in with Google to access your courses and track your progress
          </p>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#dc2626',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.88rem',
              textAlign: 'center'
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <GoogleButton label="Sign in with Google" />

        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          By continuing you agree that this platform provides educational content only and is not a substitute for professional qualifications.
        </p>
      </div>
    </div>
  );
}
