import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <section 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          textAlign: 'center', 
          padding: '6rem 2rem 4rem 2rem',
          position: 'relative'
        }}
      >
        <div 
          style={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, rgba(168, 85, 247, 0.08) 50%, transparent 100%)',
            filter: 'blur(40px)',
            zIndex: -1
          }}
        />

        <span 
          style={{
            background: 'rgba(59, 130, 246, 0.1)',
            color: '#93c5fd',
            fontSize: '0.85rem',
            fontWeight: 600,
            padding: '6px 14px',
            borderRadius: '20px',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            marginBottom: '1.5rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          🐍 The Ultimate Coding Academy
        </span>
        
        <h1 
          style={{ 
            fontSize: '4.5rem', 
            lineHeight: '1.1', 
            fontWeight: 800,
            marginBottom: '1.5rem',
            fontFamily: 'var(--font-display)',
            maxWidth: '900px'
          }}
        >
          Master Python with <span className="gradient-text">Interactive</span> Tree Learning
        </h1>
        
        <p 
          style={{ 
            fontSize: '1.25rem', 
            color: 'var(--text-secondary)', 
            maxWidth: '650px', 
            lineHeight: '1.6',
            marginBottom: '2.5rem'
          }}
        >
          An official yet highly effective platform to learn Python. Break down concepts into visual subtopics, watch expert videos, read integrated slide pages, and take instant quizzes.
        </p>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/dashboard" className="gradient-button" style={{ padding: '12px 28px', fontSize: '1.05rem', borderRadius: '8px' }}>
            Start Learning Free
          </Link>
          <Link 
            href="/login" 
            className="outline-button"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section 
        style={{ 
          padding: '4rem 2rem', 
          maxWidth: '1200px', 
          margin: '0 auto', 
          width: '100%' 
        }}
      >
        <h2 
          style={{ 
            fontSize: '2.25rem', 
            textAlign: 'center', 
            marginBottom: '3rem',
            fontFamily: 'var(--font-display)' 
          }}
        >
          An Integrated Learning Experience
        </h2>

        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem' 
          }}
        >
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🌳</div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', fontFamily: 'var(--font-display)' }}>Visual Topic Tree</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5', fontSize: '0.95rem' }}>
              Topics are structured logically. Clear paths connect main topics to child topics so you can track your journey step-by-step.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📄</div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', fontFamily: 'var(--font-display)' }}>Native HTML5 Materials</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5', fontSize: '0.95rem' }}>
              No messy PDFs or downloads. Study files, instructions, and presentations are rendered as interactive slideshows and web pages.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📝</div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', fontFamily: 'var(--font-display)' }}>Interactive Quizzes</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5', fontSize: '0.95rem' }}>
              Check your understanding instantly. Receive immediate correct/incorrect verification and detailed explanation feedback.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer 
        style={{ 
          marginTop: 'auto',
          padding: '2.5rem 2rem', 
          borderTop: '1px solid var(--border-color)', 
          textAlign: 'center', 
          fontSize: '0.85rem', 
          color: 'var(--text-muted)' 
        }}
      >
        © {new Date().getFullYear()} PyLearn. Developed as an integrated educational experience.
      </footer>
    </div>
  );
}
