'use client';

import React from 'react';
import Link from 'next/link';
import styles from './TopicTree.module.css';

interface Progress {
  topicId: number;
  completed: boolean;
  watchedVideo: boolean;
  quizScore: number;
}

interface Topic {
  id: number;
  title: string;
  description: string;
  parentId: number | null;
  youtubeUrl: string | null;
  order: number;
  children?: Topic[];
}

interface TopicTreeProps {
  topics: Topic[];
  progressList: Progress[];
}

export default function TopicTree({ topics, progressList }: TopicTreeProps) {
  // Filter main topics (roots)
  const mainTopics = topics
    .filter((t) => t.parentId === null)
    .sort((a, b) => a.order - b.order);

  // Group subtopics by their parentId
  const getSubtopics = (parentId: number) => {
    return topics
      .filter((t) => t.parentId === parentId)
      .sort((a, b) => a.order - b.order);
  };

  const getTopicProgress = (topicId: number) => {
    return progressList.find((p) => p.topicId === topicId) || {
      completed: false,
      watchedVideo: false,
      quizScore: 0,
    };
  };

  return (
    <div className={styles.treeContainer}>
      {mainTopics.map((mainTopic) => {
        const subtopics = getSubtopics(mainTopic.id);
        
        // Calculate main topic progress percentage based on completed subtopics
        const completedSubtopics = subtopics.filter((sub) => getTopicProgress(sub.id).completed).length;
        const progressPercent = subtopics.length > 0 
          ? Math.round((completedSubtopics / subtopics.length) * 100) 
          : 0;

        return (
          <div key={mainTopic.id} className={styles.mainTopicNode}>
            <div className={styles.mainTopicHeader}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flexGrow: 1 }}>
                  <h3 className={styles.mainTopicTitle}>
                    <span>📦</span> {mainTopic.title}
                  </h3>
                  <p className={styles.mainTopicDesc}>{mainTopic.description}</p>
                </div>
                {subtopics.length > 0 && (
                  <div className={`${styles.progressBadge} ${progressPercent === 100 ? styles.badgeCompleted : ''}`}>
                    {progressPercent}% Done
                  </div>
                )}
              </div>
            </div>

            {subtopics.length > 0 && (
              <div className={styles.subtopicsList}>
                {subtopics.map((subtopic) => {
                  const prog = getTopicProgress(subtopic.id);
                  let statusClass = styles.statusIndicator;
                  let badgeText = 'Not Started';
                  let badgeClass = styles.progressBadge;

                  if (prog.completed) {
                    statusClass += ` ${styles.statusCompleted}`;
                    badgeText = 'Completed';
                    badgeClass += ` ${styles.badgeCompleted}`;
                  } else if (prog.watchedVideo || prog.quizScore > 0) {
                    statusClass += ` ${styles.statusInProgress}`;
                    badgeText = 'In Progress';
                    badgeClass += ` ${styles.badgeInProgress}`;
                  }

                  return (
                    <div key={subtopic.id} className={styles.subtopicWrapper}>
                      <div className={`${styles.subtopicCard} ${badgeText === 'In Progress' ? styles.subtopicCardActive : ''}`}>
                        <div className={styles.subtopicInfo}>
                          <h4 className={styles.subtopicTitle}>{subtopic.title}</h4>
                          <p className={styles.subtopicDesc}>{subtopic.description}</p>
                          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {prog.watchedVideo && <span>🎥 Video Watched</span>}
                            {prog.quizScore > 0 && <span>📝 Quiz Best: {prog.quizScore}%</span>}
                          </div>
                        </div>

                        <div className={styles.subtopicProgress}>
                          <span className={statusClass} />
                          <span className={badgeClass}>{badgeText}</span>
                          <Link href={`/topics/${subtopic.id}`}>
                            <button className={styles.actionButton}>
                              {prog.completed ? 'Review' : prog.watchedVideo ? 'Resume' : 'Start'}
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
