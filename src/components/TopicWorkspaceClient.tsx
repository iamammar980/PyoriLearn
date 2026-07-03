'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import VideoPlayer from '@/components/VideoPlayer';
import HtmlMaterialRenderer from '@/components/HtmlMaterialRenderer';
import QuizRunner from '@/components/QuizRunner';

interface Option {
  id: number;
  optionText: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  id: number;
  questionText: string;
  explanation: string | null;
  options: Option[];
}

interface Material {
  id: number;
  content: string;
  type: string;
}

interface Topic {
  id: number;
  title: string;
  description: string;
  youtubeUrl: string | null;
  parent: { title: string } | null;
  materials: Material[];
  quizzes: QuizQuestion[];
}

interface Progress {
  completed: boolean;
  watchedVideo: boolean;
  quizScore: number;
}

interface ClientProps {
  topic: Topic;
  initialProgress: Progress | null;
}

export default function TopicWorkspaceClient({ topic, initialProgress }: ClientProps) {
  const [activeTab, setActiveTab] = useState<'video' | 'material' | 'quiz'>('video');
  const [progress, setProgress] = useState<Progress>(
    initialProgress || { completed: false, watchedVideo: false, quizScore: 0 }
  );

  const saveProgress = async (update: Partial<Progress>) => {
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: topic.id,
          ...update,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // If all conditions are met, mark the topic as completed in our local state
        const updatedWatched = update.watchedVideo !== undefined ? update.watchedVideo : progress.watchedVideo;
        const updatedCompleted = update.completed !== undefined ? update.completed : progress.completed;
        const updatedScore = update.quizScore !== undefined ? Math.max(progress.quizScore, update.quizScore) : progress.quizScore;
        
        // Auto-complete the topic when they watched the video AND completed the study material AND scored >= 70 on the quiz
        const autoCompleted = updatedWatched && updatedCompleted && updatedScore >= 70;

        if (autoCompleted && !progress.completed) {
          // If the conditions are met but they hadn't saved 'completed' yet, trigger a full completion save
          await fetch('/api/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              topicId: topic.id,
              completed: true,
            }),
          });
        }

        setProgress({
          watchedVideo: updatedWatched,
          completed: updatedCompleted || autoCompleted,
          quizScore: updatedScore,
        });
      }
    } catch (e) {
      console.error('Failed to save progress:', e);
    }
  };

  const handleVideoWatched = async () => {
    await saveProgress({ watchedVideo: true });
  };

  const handleMaterialCompleted = async () => {
    await saveProgress({ completed: true });
  };

  const handleQuizScore = async (score: number) => {
    await saveProgress({ quizScore: score });
  };

  const material = topic.materials[0];

  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '900px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Top Header Navigation */}
      <div>
        <Link 
          href="/dashboard" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '6px', 
            fontSize: '0.9rem', 
            color: 'var(--text-secondary)',
            marginBottom: '1rem'
          }}
          className="nav-link-hover"
        >
          ← Back to Dashboard
        </Link>

        <div style={{ display: 'flex', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
          <span>Course Syllabus</span>
          <span>&gt;</span>
          {topic.parent && (
            <>
              <span>{topic.parent.title}</span>
              <span>&gt;</span>
            </>
          )}
          <span style={{ color: 'var(--text-secondary)' }}>{topic.title}</span>
        </div>

        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>
          {topic.title}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
          {topic.description}
        </p>
      </div>

      {/* Tabs Header */}
      <div 
        style={{ 
          display: 'flex', 
          borderBottom: '1px solid var(--border-color)', 
          gap: '1.5rem',
          paddingBottom: '2px'
        }}
      >
        <button
          onClick={() => setActiveTab('video')}
          style={{
            padding: '10px 4px',
            fontSize: '0.95rem',
            fontWeight: 600,
            color: activeTab === 'video' ? 'var(--primary-color)' : 'var(--text-muted)',
            borderBottom: activeTab === 'video' ? '2px solid var(--primary-color)' : '2px solid transparent',
            cursor: 'pointer',
            transition: 'var(--transition-fast)'
          }}
        >
          🎥 Video Explanation {progress.watchedVideo && '✓'}
        </button>

        <button
          onClick={() => setActiveTab('material')}
          style={{
            padding: '10px 4px',
            fontSize: '0.95rem',
            fontWeight: 600,
            color: activeTab === 'material' ? 'var(--accent-color)' : 'var(--text-muted)',
            borderBottom: activeTab === 'material' ? '2px solid var(--accent-color)' : '2px solid transparent',
            cursor: 'pointer',
            transition: 'var(--transition-fast)'
          }}
        >
          📖 Study Material {progress.completed && '✓'}
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          style={{
            padding: '10px 4px',
            fontSize: '0.95rem',
            fontWeight: 600,
            color: activeTab === 'quiz' ? 'var(--success-color)' : 'var(--text-muted)',
            borderBottom: activeTab === 'quiz' ? '2px solid var(--success-color)' : '2px solid transparent',
            cursor: 'pointer',
            transition: 'var(--transition-fast)'
          }}
        >
          ✍️ Challenge Quiz {progress.quizScore >= 70 && '✓'}
        </button>
      </div>

      {/* Tab Panels */}
      <div style={{ marginTop: '1rem', minHeight: '350px' }}>
        {activeTab === 'video' && (
          topic.youtubeUrl ? (
            <VideoPlayer
              youtubeUrl={topic.youtubeUrl}
              watched={progress.watchedVideo}
              onMarkWatched={handleVideoWatched}
            />
          ) : (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No video explanation has been added to this topic yet.
            </div>
          )
        )}

        {activeTab === 'material' && (
          material ? (
            <HtmlMaterialRenderer
              content={material.content}
              type={material.type}
              completed={progress.completed}
              onComplete={handleMaterialCompleted}
            />
          ) : (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No study materials have been added to this topic yet.
            </div>
          )
        )}

        {activeTab === 'quiz' && (
          <QuizRunner
            questions={topic.quizzes}
            bestScore={progress.quizScore}
            onSaveScore={handleQuizScore}
          />
        )}
      </div>

      {/* Course progression summary footer */}
      {progress.watchedVideo && progress.completed && progress.quizScore >= 70 && (
        <div 
          className="glass-panel" 
          style={{ 
            background: 'rgba(16, 185, 129, 0.05)', 
            borderColor: 'rgba(16, 185, 129, 0.2)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '2rem'
          }}
        >
          <div>
            <h4 style={{ color: '#a7f3d0', fontSize: '1.05rem', fontWeight: 600 }}>🎓 Topic Fully Completed!</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Awesome work! You have finished the video, slide materials, and passed the quiz.
            </p>
          </div>
          <Link href="/dashboard" className="gradient-button" style={{ padding: '8px 16px', fontSize: '0.9rem', background: 'var(--success-color)' }}>
            Next Lesson →
          </Link>
        </div>
      )}

    </div>
  );
}
