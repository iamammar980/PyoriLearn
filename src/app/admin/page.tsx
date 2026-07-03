import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/jwt';
import AdminPanel from '@/components/AdminPanel';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Admin Panel Header Banner */}
      <div 
        style={{ 
          background: 'linear-gradient(to bottom, rgba(168, 85, 247, 0.05) 0%, transparent 100%)',
          borderBottom: '1px solid var(--border-color)',
          padding: '2.5rem 2rem'
        }}
      >
        <div style={{ maxWidth: '1300px', margin: '0 auto', width: '100%' }}>
          <span 
            style={{ 
              fontSize: '0.78rem', 
              textTransform: 'uppercase', 
              color: 'var(--accent-color)', 
              fontWeight: 700, 
              border: '1px solid rgba(168,85,247,0.3)',
              padding: '2px 6px',
              borderRadius: '4px',
              background: 'rgba(168,85,247,0.05)',
              letterSpacing: '0.05em'
            }}
          >
            Management Mode
          </span>
          <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-display)', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
            Instructor Control Panel
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Modify learning hierarchies, manage interactive slides & documentations, program quizzes, and view student progress analytics.
          </p>
        </div>
      </div>

      <AdminPanel />
    </div>
  );
}
