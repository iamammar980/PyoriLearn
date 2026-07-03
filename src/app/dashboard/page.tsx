import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/db';
import TopicTree from '@/components/TopicTree';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    redirect('/login');
  }

  const userId = decoded.id;

  // Query database for all topics and user progress
  const topics = await prisma.topic.findMany({});
  
  const userProgress = await prisma.userProgress.findMany({
    where: { userId },
  });

  // Calculate statistics
  const subtopics = topics.filter((t) => t.parentId !== null);
  const totalSubtopics = subtopics.length;
  
  const completedSubtopics = userProgress.filter((p) => p.completed).length;
  const watchedCount = userProgress.filter((p) => p.watchedVideo).length;

  const progressPercent = totalSubtopics > 0 
    ? Math.round((completedSubtopics / totalSubtopics) * 100) 
    : 0;

  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '1000px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* Welcome & Overview Header */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        <div>
          <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>
            Hello, <span className="gradient-text">{decoded.name}</span>!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Track your course progress and study lessons below.
          </p>
        </div>

        {decoded.role === 'ADMIN' && (
          <Link href="/admin" className="gradient-button" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
            🔧 Open Instructor Control Panel
          </Link>
        )}
      </div>

      {/* Stats Summary Cards */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: '1.5rem' 
        }}
      >
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.82rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
            Overall Progress
          </span>
          <span style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
            {progressPercent}%
          </span>
          <div style={{ width: '100%', height: '6px', background: 'rgba(15,23,42,0.06)', borderRadius: '3px', overflow: 'hidden', marginTop: '0.25rem' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(to right, var(--primary-color), var(--accent-color))' }} />
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.82rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
            Topics Completed
          </span>
          <span style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
            {completedSubtopics} <span style={{ fontSize: '1.2rem', fontWeight: 400, color: 'var(--text-secondary)' }}>/ {totalSubtopics}</span>
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--success-color)' }}>
            ✓ Ready for next step!
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.82rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
            Videos Watched
          </span>
          <span style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
            {watchedCount} <span style={{ fontSize: '1.2rem', fontWeight: 400, color: 'var(--text-secondary)' }}>/ {totalSubtopics}</span>
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--primary-color)' }}>
            🎥 Interactive screen logging
          </span>
        </div>
      </div>

      {/* Course Map Tree Section */}
      <div>
        <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🌳</span> Course Map
        </h2>
        <TopicTree topics={topics} progressList={userProgress.map(p => ({
          topicId: p.topicId,
          completed: p.completed,
          watchedVideo: p.watchedVideo,
          quizScore: p.quizScore
        }))} />
      </div>

    </div>
  );
}

// Add Link to keep the JSX valid
import Link from 'next/link';
