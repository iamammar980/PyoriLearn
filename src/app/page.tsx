import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/db';

export default async function Home() {
  const topics = await prisma.topic.findMany({ orderBy: { order: 'asc' } });
  const mainTopics = topics.filter((t) => t.parentId === null);

  return (
    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Hero */}
      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '5rem 2rem 3rem 2rem'
        }}
      >
        <h1 style={{ fontSize: '4.5rem', lineHeight: 1.05, fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          PyLearn
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '1.75rem' }}>
          Made by PYLORI
        </p>
        <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '600px', lineHeight: 1.6, marginBottom: '2rem' }}>
          An integrated learning platform. Courses are organised into clear topics, each with an explainer video, study pages, and quizzes.
        </p>
        <Link href="/login" className="gradient-button" style={{ padding: '12px 28px', fontSize: '1rem', borderRadius: '8px' }}>
          Sign In to Start
        </Link>
      </section>

      {/* Courses: main topics -> click to reveal lessons */}
      <section style={{ padding: '2rem', maxWidth: '820px', margin: '0 auto', width: '100%' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
          Courses
        </h2>

        {mainTopics.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No courses have been published yet. Please check back soon.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {mainTopics.map((main) => {
              const lessons = topics.filter((t) => t.parentId === main.id);
              return (
                <details
                  key={main.id}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    background: 'var(--bg-secondary)',
                    overflow: 'hidden'
                  }}
                >
                  <summary
                    style={{
                      cursor: 'pointer',
                      padding: '1.1rem 1.25rem',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      listStyle: 'none'
                    }}
                  >
                    {main.title}
                    {main.description ? (
                      <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        {main.description}
                      </span>
                    ) : null}
                  </summary>

                  <div style={{ borderTop: '1px solid var(--border-color)', padding: '0.5rem 0' }}>
                    {lessons.length === 0 ? (
                      <p style={{ padding: '0.75rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        No lessons in this topic yet.
                      </p>
                    ) : (
                      lessons.map((lesson) => (
                        <Link
                          key={lesson.id}
                          href={`/topics/${lesson.id}`}
                          style={{
                            display: 'block',
                            padding: '0.75rem 1.5rem',
                            color: 'var(--text-primary)',
                            fontSize: '0.95rem',
                            borderTop: '1px solid var(--border-color)'
                          }}
                        >
                          {lesson.title}
                          {lesson.description ? (
                            <span style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                              {lesson.description}
                            </span>
                          ) : null}
                        </Link>
                      ))
                    )}
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </section>

      {/* Disclaimer */}
      <section style={{ padding: '1.5rem 2rem 3rem 2rem', maxWidth: '820px', margin: '0 auto', width: '100%' }}>
        <div
          style={{
            padding: '1.5rem 1.75rem',
            border: '1px solid var(--border-color)',
            borderLeft: '4px solid var(--text-primary)',
            borderRadius: '8px',
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6
          }}
        >
          <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>Disclaimer</strong>
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
