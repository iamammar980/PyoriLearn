'use client';

import React, { useState } from 'react';
import styles from './QuizRunner.module.css';

interface Option {
  id: number;
  optionText: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  questionText: string;
  explanation: string | null;
  options: Option[];
}

interface QuizRunnerProps {
  questions: Question[];
  bestScore: number;
  onSaveScore: (score: number) => Promise<void>;
}

export default function QuizRunner({ questions, bestScore, onSaveScore }: QuizRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  if (questions.length === 0) {
    return (
      <div className={`${styles.quizCard} glass-panel`} style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <h3>No questions available for this topic yet.</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Check back later or check other topics!</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  const handleOptionClick = (option: Option) => {
    if (answered) return;
    setSelectedOptionId(option.id);
    setAnswered(true);
    if (option.isCorrect) {
      setCorrectAnswersCount((prev) => prev + 1);
    }
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setAnswered(false);
    } else {
      // Quiz Finished!
      setQuizFinished(true);
      const finalScore = Math.round((correctAnswersCount / questions.length) * 100);
      setSaving(true);
      try {
        await onSaveScore(finalScore);
        setHasSaved(true);
      } catch (e) {
        console.error('Failed to save score:', e);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setAnswered(false);
    setCorrectAnswersCount(0);
    setQuizFinished(false);
    setHasSaved(false);
  };

  if (quizFinished) {
    const finalScore = Math.round((correctAnswersCount / questions.length) * 100);
    const passed = finalScore >= 70;

    return (
      <div className={styles.quizContainer}>
        <div className={`${styles.quizCard} glass-panel ${styles.resultScreen}`}>
          <h2 className={styles.resultTitle}>
            {passed ? '🎉 Quiz Completed!' : '👍 Keep Practicing!'}
          </h2>
          
          <div className={styles.resultScoreBadge}>
            {finalScore}%
          </div>
          
          <div className={styles.resultStats}>
            <p>You answered <strong>{correctAnswersCount}</strong> out of <strong>{questions.length}</strong> questions correctly.</p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {saving ? 'Saving score...' : hasSaved ? `Progress saved! Best score: ${Math.max(bestScore, finalScore)}%` : ''}
            </p>
          </div>

          <button onClick={handleRetry} className="gradient-button styles.retryButton">
            Retry Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.quizContainer}>
      <div className={`${styles.quizCard} glass-panel`}>
        {/* Header progress */}
        <div className={styles.header}>
          <span className={styles.title}>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className={styles.score}>
            Best Score: {bestScore}%
          </span>
        </div>

        {/* Question body */}
        <div className={styles.questionContainer}>
          <h3 className={styles.questionText}>{currentQuestion.questionText}</h3>
          
          <div className={styles.optionsGrid}>
            {currentQuestion.options.map((option) => {
              let optionClass = styles.optionButton;
              if (answered) {
                optionClass += ` ${styles.optionDisabled}`;
                if (option.isCorrect) {
                  optionClass += ` ${styles.optionCorrect}`;
                } else if (selectedOptionId === option.id) {
                  optionClass += ` ${styles.optionIncorrect}`;
                }
              }

              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(option)}
                  disabled={answered}
                  className={optionClass}
                >
                  <span>{option.optionText}</span>
                  {answered && option.isCorrect && <span>✓</span>}
                  {answered && selectedOptionId === option.id && !option.isCorrect && <span>✗</span>}
                </button>
              );
            })}
          </div>

          {answered && currentQuestion.explanation && (
            <div className={styles.explanation}>
              💡 <strong>Explanation:</strong> {currentQuestion.explanation}
            </div>
          )}
        </div>

        {/* Footer next controls */}
        {answered && (
          <div className={styles.footer}>
            <button onClick={handleNext} className={styles.nextButton}>
              {currentIndex === questions.length - 1 ? 'Finish' : 'Next Question →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
