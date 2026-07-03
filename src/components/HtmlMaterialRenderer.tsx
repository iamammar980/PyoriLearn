'use client';

import React, { useState } from 'react';
import styles from './HtmlMaterialRenderer.module.css';

interface Slide {
  title: string;
  layout: string;
  html: string;
}

interface HtmlMaterialRendererProps {
  content: string;
  type: string; // "PAGE" or "SLIDES"
  completed: boolean;
  onComplete: () => Promise<void>;
}

export default function HtmlMaterialRenderer({ content, type, completed, onComplete }: HtmlMaterialRendererProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(completed);

  // Safely parse slides content if it's in SLIDES mode
  let slides: Slide[] = [];
  if (type === 'SLIDES') {
    try {
      slides = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse slides JSON:', e);
      slides = [{ title: 'Error', layout: 'error', html: '<p>Failed to load slides content.</p>' }];
    }
  }

  const handleComplete = async () => {
    setLoading(true);
    try {
      await onComplete();
      setIsCompleted(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  if (type === 'SLIDES' && slides.length > 0) {
    const currentSlide = slides[currentSlideIndex];
    const isLastSlide = currentSlideIndex === slides.length - 1;

    return (
      <div className={styles.materialContainer}>
        <div className={`${styles.slidesCard} glass-panel`}>
          {/* Progress Indicators */}
          <div className={styles.slideProgress}>
            {slides.map((_, index) => (
              <div
                key={index}
                className={`${styles.progressBar} ${index <= currentSlideIndex ? styles.progressBarActive : ''}`}
              />
            ))}
          </div>

          {/* Slide Body */}
          <div className={`${styles.slideContent} rich-content`}>
            <div 
              key={currentSlideIndex} /* Triggers standard browser animation keyframes */
              dangerouslySetInnerHTML={{ __html: currentSlide.html }} 
            />
          </div>

          {/* Slide Navigation controls */}
          <div className={styles.slideFooter}>
            <button
              onClick={handlePrev}
              disabled={currentSlideIndex === 0}
              className={styles.navButton}
            >
              Prev
            </button>

            <span className={styles.slideIndicator}>
              Slide {currentSlideIndex + 1} of {slides.length}
            </span>

            {isLastSlide ? (
              <button
                onClick={handleComplete}
                disabled={isCompleted || loading}
                className={`${styles.navButton} ${styles.completeButton}`}
                style={{ opacity: isCompleted ? 0.6 : 1 }}
              >
                {loading ? 'Saving...' : isCompleted ? 'Completed' : 'Mark Completed'}
              </button>
            ) : (
              <button onClick={handleNext} className={styles.navButton}>
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Fallback to PAGE mode (standard article web page format)
  return (
    <div className={styles.materialContainer}>
      <div className={`${styles.pageCard} glass-panel rich-content`}>
        <div dangerouslySetInnerHTML={{ __html: content }} />
        
        <div 
          style={{ 
            marginTop: '3rem', 
            paddingTop: '2rem', 
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {isCompleted ? 'You have completed this study material!' : 'Finished reading? Mark it as complete.'}
          </span>
          <button
            onClick={handleComplete}
            disabled={isCompleted || loading}
            className={`${styles.navButton} ${styles.completeButton}`}
            style={{ opacity: isCompleted ? 0.6 : 1 }}
          >
            {loading ? 'Saving...' : isCompleted ? 'Completed' : 'Mark Completed'}
          </button>
        </div>
      </div>
    </div>
  );
}
