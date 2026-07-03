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
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, rgba(124, 58, 237, 0.08) 50%, transparent 100%)',
            filter: 'blur(40px)',
            zIndex: -1
          }}
        />

        {/* Project name + author */}
        <h1
          style={{
            fontSize: '5rem',
            lineHeight: '1.05',
            fontWeight: 800,
            marginBottom: '0.5rem',
            fontFamily: 'var(--font-display)'
          }}
        >
          <span className="gradient-text">PyLearn</span>
        </h1>
        <p
          style={{
            fontSize: '1rem',
            color: 'var(--text-muted)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: '2rem'
          }}
        >
          Made by PYLORI
        </p>

        <span
          style={{
            background: 'rgba(37, 99, 235, 0.1)',
            color: '#2563eb',
            fontSize: '0.85rem',
            fontWeight: 600,
            padding: '6px 14px',
            borderRadius: '20px',
            border: '1px solid rgba(37, 99, 235, 0.2)',
            marginBottom: '1.5rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          📚 The Integrated Learning Platform
        </span>

        <h2
          style={{
            fontSize: '3rem',
            lineHeight: '1.15',
            fontWeight: 800,
            marginBottom: '1.5rem',
            fontFamily: 'var(--font-display)',
            maxWidth: '900px'
          }}
        >
          Learn Any Subject with <span className="gradient-text">Structured</span> Course Trees
        </h2>

        <p
          style={{
            fontSize: '1.25rem',
            color: 'var(--text-secondary)',
            maxWidth: '650px',
            lineHeight: '1.6',
            marginBottom: '2.5rem'
          }}
        >
          A clean, effective platform for learning any topic. Courses are broken into a clear tree of subtopics — each with an explainer video, integrated study pages, and instant quizzes to check your understanding.
        </p>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/dashboard" className="gradient-button" style={{ padding: '12px 28px', fontSize: '1.05rem', borderRadius: '8px' }}>
            Start Learning Free
          </Link>
          <Link href="/login" className="outline-button">
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
              Every course is structured logically. Clear paths connect main topics to their subtopics so you can follow your learning journey step-by-step.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📄</div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', fontFamily: 'var(--font-display)' }}>Native Web Materials</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5', fontSize: '0.95rem' }}>
              No messy PDFs or downloads. Study notes, instructions, and presentations are rendered as clean, interactive web pages.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📝</div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', fontFamily: 'var(--font-display)' }}>Interactive Quizzes</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5', fontSize: '0.95rem' }}>
              Check your understanding instantly. Get immediate correct/incorrect feedback with a detailed explanation for every question.
            </p>
          </div>
        </div>
      </section>

      {/* Disclaimer Section */}
      <section style={{ padding: '1rem 2rem 3rem 2rem', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        <div
          className="glass-panel"
          style={{
            padding: '1.5rem 1.75rem',
            borderLeft: '4px solid var(--warning-color)',
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.6'
          }}
        >
          <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
            ⚠️ Disclaimer
          </strong>
          This platform provides <strong>educational content only</strong>. It is <strong>not a substitute for a college degree</strong> or any accredited qualification, it is <strong>not an official foundation or institution</strong>, and it must <strong>not be used as a guide for making real clinical decisions</strong>. Always rely on qualified professionals and official sources for medical, clinical, or professional decisions.
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
        © {new Date().getFullYear()} PyLearn — Made by PYLORI. Educational content only.
      </footer>
    </div>
  );
}
