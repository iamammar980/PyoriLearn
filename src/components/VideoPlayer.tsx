'use client';

import React, { useState } from 'react';

interface VideoPlayerProps {
  youtubeUrl: string;
  watched: boolean;
  onMarkWatched: () => Promise<void>;
}

export default function VideoPlayer({ youtubeUrl, watched, onMarkWatched }: VideoPlayerProps) {
  const [loading, setLoading] = useState(false);
  const [isWatched, setIsWatched] = useState(watched);

  const handleMark = async () => {
    setLoading(true);
    try {
      await onMarkWatched();
      setIsWatched(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <div 
        className="glass-panel" 
        style={{ 
          position: 'relative', 
          paddingBottom: '56.25%', /* 16:9 Aspect Ratio */
          height: 0, 
          overflow: 'hidden', 
          borderRadius: '12px' 
        }}
      >
        <iframe
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 0,
          }}
          src={youtubeUrl}
          title="Video Explanation"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <div 
        className="glass-panel" 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '1.25rem 1.5rem',
          background: 'rgba(30, 41, 59, 0.2)' 
        }}
      >
        <div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            {isWatched ? '✅ Video Completed' : '🎥 Learn from Video'}
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {isWatched 
              ? 'You have completed this video explanation. You can re-watch it at any time.' 
              : 'Watch the explanation video above. Once finished, mark it as completed to track progress.'}
          </p>
        </div>

        <button
          onClick={handleMark}
          disabled={isWatched || loading}
          className="gradient-button"
          style={{ 
            padding: '8px 16px', 
            fontSize: '0.9rem',
            opacity: isWatched ? 0.6 : 1,
            cursor: isWatched ? 'default' : 'pointer'
          }}
        >
          {loading ? 'Saving...' : isWatched ? 'Watched' : 'Mark as Watched'}
        </button>
      </div>
    </div>
  );
}
