'use client';

import React, { useState, useEffect } from 'react';
import styles from './AdminPanel.module.css';

interface Option {
  id?: number;
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
  parentId: number | null;
  order: number;
  materials: Material[];
  quizzes: QuizQuestion[];
}

interface UserProgress {
  topicId: number;
  completed: boolean;
  watchedVideo: boolean;
  quizScore: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  progress: UserProgress[];
}

const EMPTY_OPTIONS: Option[] = [
  { optionText: '', isCorrect: true },
  { optionText: '', isCorrect: false },
  { optionText: '', isCorrect: false },
  { optionText: '', isCorrect: false },
];

type Mode = 'none' | 'newMain' | 'editMain' | 'newLesson' | 'editLesson';

export default function AdminPanel() {
  const [view, setView] = useState<'content' | 'students'>('content');
  const [mode, setMode] = useState<Mode>('none');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  // Topic form (shared for main topics and lessons)
  const [topicId, setTopicId] = useState<number | null>(null);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicDesc, setTopicDesc] = useState('');
  const [topicParent, setTopicParent] = useState<string>('');
  const [topicYoutube, setTopicYoutube] = useState('');
  const [topicOrder, setTopicOrder] = useState('0');

  // Material form (for the currently selected lesson)
  const [selectedSubtopicId, setSelectedSubtopicId] = useState<string>('');
  const [materialType, setMaterialType] = useState<'PAGE' | 'SLIDES'>('PAGE');
  const [materialContent, setMaterialContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

  // Quiz form (for the currently selected lesson)
  const [quizSubtopicId, setQuizSubtopicId] = useState<string>('');
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [options, setOptions] = useState<Option[]>(EMPTY_OPTIONS);

  const resetQuizForm = () => {
    setEditingQuestionId(null);
    setQuestionText('');
    setExplanation('');
    setOptions(EMPTY_OPTIONS.map((o) => ({ ...o })));
  };

  const loadData = async (): Promise<Topic[]> => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/data');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setTopics(data.topics);
        return data.topics as Topic[];
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
    return [];
  };

  // --- Selection helpers ---
  const selectMain = (m: Topic) => {
    setMode('editMain');
    setTopicId(m.id);
    setTopicTitle(m.title);
    setTopicDesc(m.description);
    setTopicParent('');
    setTopicYoutube('');
    setTopicOrder(String(m.order));
    setUploadMsg('');
  };

  const selectLesson = (l: Topic) => {
    setMode('editLesson');
    setTopicId(l.id);
    setTopicTitle(l.title);
    setTopicDesc(l.description);
    setTopicParent(String(l.parentId ?? ''));
    setTopicYoutube(l.youtubeUrl || '');
    setTopicOrder(String(l.order));
    // Load this lesson's material
    if (l.materials.length > 0) {
      setMaterialType(l.materials[0].type as 'PAGE' | 'SLIDES');
      setMaterialContent(l.materials[0].content);
    } else {
      setMaterialType('PAGE');
      setMaterialContent('');
    }
    setSelectedSubtopicId(String(l.id));
    setQuizSubtopicId(String(l.id));
    resetQuizForm();
    setUploadMsg('');
  };

  const startNewMain = () => {
    setMode('newMain');
    setTopicId(null);
    setTopicTitle('');
    setTopicDesc('');
    setTopicParent('');
    setTopicYoutube('');
    setTopicOrder('0');
  };

  const startNewLesson = (parentId: number) => {
    setMode('newLesson');
    setTopicId(null);
    setTopicTitle('');
    setTopicDesc('');
    setTopicParent(String(parentId));
    setTopicYoutube('');
    setTopicOrder('0');
    setMaterialContent('');
    setMaterialType('PAGE');
    resetQuizForm();
    setUploadMsg('');
  };

  useEffect(() => {
    (async () => {
      const t = await loadData();
      const firstLesson = t.find((x) => x.parentId !== null);
      if (firstLesson) selectLesson(firstLesson);
      else {
        const firstMain = t.find((x) => x.parentId === null);
        if (firstMain) selectMain(firstMain);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Content templates ---
  const insertTemplate = (templateType: string) => {
    if (materialType === 'SLIDES') {
      let slideObj = {};
      if (templateType === 'welcome') {
        slideObj = {
          title: 'Title of Slide',
          layout: 'welcome',
          html: '<h1>Welcome to this Topic</h1><p>Introduce the subject here with clear paragraphs.</p><div class="highlight-box"><strong>Tip:</strong> Callout important facts.</div>',
        };
      } else if (templateType === 'grid') {
        slideObj = {
          title: 'Comparison Grid',
          layout: 'grid',
          html: '<h2>Comparison Grid</h2><div class="features-grid"><div class="feature-card"><h3>Option A</h3><p>Description of Option A details.</p></div><div class="feature-card"><h3>Option B</h3><p>Description of Option B details.</p></div></div>',
        };
      } else if (templateType === 'code') {
        slideObj = {
          title: 'Code Example',
          layout: 'code',
          html: '<h2>Example Title</h2><p>Here is some explanation.</p><pre><code>example code here</code></pre><div class="code-explanation">Explaining how it works.</div>',
        };
      }

      try {
        let currentArray = [];
        if (materialContent.trim()) {
          currentArray = JSON.parse(materialContent);
        }
        currentArray.push(slideObj);
        setMaterialContent(JSON.stringify(currentArray, null, 2));
      } catch {
        setMaterialContent(JSON.stringify([slideObj], null, 2));
      }
    } else {
      let html = '';
      if (templateType === 'welcome') {
        html = '<h1>Title of Lesson</h1><p>Start writing content here...</p>\n';
      } else if (templateType === 'code') {
        html = '<h2>Example</h2>\n<pre><code>your example here</code></pre>\n<p>Explain the example above...</p>\n';
      } else if (templateType === 'note') {
        html = '<div class="note-box">\n<strong>Key Note:</strong> Write important notes here.\n</div>\n';
      } else if (templateType === 'warning') {
        html = '<div class="warning-box">\n<strong>Caution:</strong> Write warnings here.\n</div>\n';
      }
      setMaterialContent((prev) => prev + html);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        setUploadMsg(`${data.error || 'Upload failed'}`);
      } else {
        const isImage = (data.type || '').startsWith('image/');
        const snippet = isImage
          ? `\n<img src="${data.url}" alt="${data.name}" style="max-width:100%;border-radius:8px;" />\n`
          : `\n<p><a href="${data.url}" target="_blank" rel="noopener">Download ${data.name}</a></p>\n`;
        if (materialType === 'PAGE') {
          setMaterialContent((prev) => prev + snippet);
          setUploadMsg(`Inserted ${data.name} into the content below.`);
        } else {
          setUploadMsg(`Uploaded. URL: ${data.url}`);
        }
      }
    } catch (err) {
      console.error(err);
      setUploadMsg('Upload failed. Check your connection.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // --- Submit handlers ---
  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const wasNew = !topicId;
    const isLesson = !!topicParent;
    try {
      const res = await fetch('/api/admin/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: topicId,
          title: topicTitle,
          description: topicDesc,
          parentId: topicParent || null,
          youtubeUrl: topicYoutube || null,
          order: topicOrder,
        }),
      });

      if (res.ok) {
        const data = await res.json().catch(() => null);
        const savedId: number | undefined = data?.topic?.id;
        const fresh = await loadData();
        if (savedId) {
          const saved = fresh.find((t) => t.id === savedId);
          if (saved) {
            if (isLesson || saved.parentId !== null) selectLesson(saved);
            else selectMain(saved);
          }
        }
        if (wasNew) {
          // brief confirmation handled by re-selection revealing the editor
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTopicDelete = async (id: number) => {
    if (!confirm('Delete this item and all its materials/quizzes? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/topics/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadData();
        setMode('none');
        setTopicId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMaterialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubtopicId) return;

    if (materialType === 'SLIDES') {
      try {
        JSON.parse(materialContent);
      } catch {
        alert('Invalid JSON slides format. Ensure it is a valid JSON array of slides!');
        return;
      }
    }

    try {
      const res = await fetch('/api/admin/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: selectedSubtopicId,
          content: materialContent,
          type: materialType,
        }),
      });

      if (res.ok) {
        setUploadMsg('Study material saved.');
        await loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizSubtopicId) return;

    try {
      const res = await fetch('/api/admin/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingQuestionId,
          topicId: quizSubtopicId,
          questionText,
          explanation: explanation || null,
          options,
        }),
      });

      if (res.ok) {
        resetQuizForm();
        await loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuestionDelete = async (id: number) => {
    if (!confirm('Delete this question?')) return;
    try {
      const res = await fetch(`/api/admin/quizzes/${id}`, { method: 'DELETE' });
      if (res.ok) await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuestionEdit = (question: QuizQuestion) => {
    setEditingQuestionId(question.id);
    setQuestionText(question.questionText);
    setExplanation(question.explanation || '');
    const opts = question.options.map((o) => ({ optionText: o.optionText, isCorrect: o.isCorrect }));
    while (opts.length < 4) opts.push({ optionText: '', isCorrect: false });
    setOptions(opts);
  };

  if (loading && topics.length === 0) {
    return (
      <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <h3>Loading Control Panel…</h3>
      </div>
    );
  }

  const mainTopics = topics.filter((t) => t.parentId === null);
  const subtopics = topics.filter((t) => t.parentId !== null);
  const parentTitle = topicParent ? topics.find((t) => t.id === Number(topicParent))?.title : '';
  const currentQuizzes = topics.find((t) => t.id === Number(quizSubtopicId))?.quizzes ?? [];

  const switchBtn = (active: boolean): React.CSSProperties => ({
    padding: '8px 18px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    border: '1px solid var(--border-color)',
    background: active ? 'var(--primary-color)' : 'transparent',
    color: active ? '#fff' : 'var(--text-secondary)',
    transition: 'var(--transition-fast)',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem', maxWidth: '1300px', margin: '0 auto', width: '100%' }}>
      {/* Top view switch */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={() => setView('content')} style={switchBtn(view === 'content')}>Manage Courses</button>
        <button onClick={() => setView('students')} style={switchBtn(view === 'students')}>Students</button>
      </div>

      {view === 'students' ? (
        <div className={`${styles.adminCard} glass-panel`}>
          <h2 className={styles.cardTitle}>Student Learning Summaries</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Student Name</th>
                  <th className={styles.th}>Email Address</th>
                  <th className={styles.th}>Role</th>
                  <th className={styles.th}>Joined Date</th>
                  <th className={styles.th}>Progress Summary</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const totalSub = subtopics.length;
                  const compSub = user.progress.filter((p) => p.completed).length;
                  const completionRate = totalSub > 0 ? Math.round((compSub / totalSub) * 100) : 0;
                  return (
                    <tr key={user.id} className={styles.tr}>
                      <td className={styles.td} style={{ fontWeight: 600 }}>{user.name}</td>
                      <td className={styles.td}>{user.email}</td>
                      <td className={styles.td}>
                        <span className={styles.badge} style={{ background: 'rgba(0,0,0,0.05)', color: '#000' }}>
                          {user.role}
                        </span>
                      </td>
                      <td className={styles.td}>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className={styles.td}>
                        <strong>{completionRate}%</strong> completed ({compSub}/{totalSub} lessons)
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Course tree navigator */}
          <aside
            className="glass-panel"
            style={{ width: '300px', flexShrink: 0, padding: '1rem', position: 'sticky', top: '1rem', maxHeight: 'calc(100vh - 2rem)', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Course Tree</h3>
            </div>
            <button onClick={startNewMain} className="gradient-button" style={{ width: '100%', padding: '9px', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Add Main Topic
            </button>

            {mainTopics.length === 0 && (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', padding: '0.5rem' }}>
                No topics yet. Add your first main topic above.
              </p>
            )}

            {mainTopics.map((main) => {
              const children = subtopics.filter((s) => s.parentId === main.id);
              const mainActive = mode === 'editMain' && topicId === main.id;
              return (
                <div key={main.id} style={{ marginBottom: '0.75rem' }}>
                  <button
                    onClick={() => selectMain(main)}
                    className={`${styles.sidebarTab} ${mainActive ? styles.sidebarTabActive : ''}`}
                    style={{ width: '100%', fontWeight: 600 }}
                  >
                    {main.title}
                  </button>
                  <div style={{ paddingLeft: '0.75rem', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    {children.map((child) => {
                      const childActive = mode === 'editLesson' && topicId === child.id;
                      return (
                        <button
                          key={child.id}
                          onClick={() => selectLesson(child)}
                          className={`${styles.sidebarTab} ${childActive ? styles.sidebarTabActive : ''}`}
                          style={{ width: '100%', fontSize: '0.88rem' }}
                        >
                          {child.title}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => startNewLesson(main.id)}
                      className={styles.sidebarTab}
                      style={{ width: '100%', fontSize: '0.82rem', color: 'var(--text-muted)' }}
                    >
                      Add lesson
                    </button>
                  </div>
                </div>
              );
            })}
          </aside>

          {/* Editor panel */}
          <div style={{ flexGrow: 1, minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {mode === 'none' && (
              <div className={`${styles.adminCard} glass-panel`} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <p>Select a topic or lesson from the tree, or add a new main topic to begin.</p>
              </div>
            )}

            {/* Main topic editor */}
            {(mode === 'newMain' || mode === 'editMain') && (
              <div className={`${styles.adminCard} glass-panel`}>
                <h2 className={styles.cardTitle}>{mode === 'newMain' ? 'New Main Topic' : `Edit Main Topic`}</h2>
                <form onSubmit={handleTopicSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Title</label>
                    <input type="text" value={topicTitle} onChange={(e) => setTopicTitle(e.target.value)} required className={styles.input} placeholder="e.g. Cardiology Basics" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Description</label>
                    <input type="text" value={topicDesc} onChange={(e) => setTopicDesc(e.target.value)} className={styles.input} placeholder="Brief summary of this course section…" />
                  </div>
                  <div className={styles.formGroup} style={{ maxWidth: '180px' }}>
                    <label className={styles.formLabel}>Display Order</label>
                    <input type="number" value={topicOrder} onChange={(e) => setTopicOrder(e.target.value)} className={styles.input} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                    {mode === 'editMain' && (
                      <button type="button" onClick={() => handleTopicDelete(topicId!)} className={styles.btnDanger}>Delete Topic</button>
                    )}
                    <button type="submit" className="gradient-button" style={{ padding: '10px 24px' }}>
                      {mode === 'newMain' ? 'Create Main Topic' : 'Save Changes'}
                    </button>
                  </div>
                </form>
                {mode === 'editMain' && (
                  <button onClick={() => startNewLesson(topicId!)} className={styles.btnSecondary} style={{ marginTop: '1.25rem' }}>
                    Add a lesson under this topic
                  </button>
                )}
              </div>
            )}

            {/* Lesson editor: details + material + quizzes together */}
            {(mode === 'newLesson' || mode === 'editLesson') && (
              <>
                <div className={`${styles.adminCard} glass-panel`}>
                  <h2 className={styles.cardTitle}>
                    {mode === 'newLesson' ? 'New Lesson' : 'Edit Lesson'}
                    <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>
                      under {parentTitle}
                    </span>
                  </h2>
                  <form onSubmit={handleTopicSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Lesson Title</label>
                      <input type="text" value={topicTitle} onChange={(e) => setTopicTitle(e.target.value)} required className={styles.input} placeholder="e.g. Reading an ECG" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Description</label>
                      <input type="text" value={topicDesc} onChange={(e) => setTopicDesc(e.target.value)} className={styles.input} placeholder="Brief summary of this lesson…" />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <div className={styles.formGroup} style={{ flexGrow: 1, minWidth: '240px' }}>
                        <label className={styles.formLabel}>YouTube Video URL</label>
                        <input type="text" value={topicYoutube} onChange={(e) => setTopicYoutube(e.target.value)} className={styles.input} placeholder="https://www.youtube.com/watch?v=…" />
                      </div>
                      <div className={styles.formGroup} style={{ maxWidth: '140px' }}>
                        <label className={styles.formLabel}>Order</label>
                        <input type="number" value={topicOrder} onChange={(e) => setTopicOrder(e.target.value)} className={styles.input} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                      {mode === 'editLesson' && (
                        <button type="button" onClick={() => handleTopicDelete(topicId!)} className={styles.btnDanger}>Delete Lesson</button>
                      )}
                      <button type="submit" className="gradient-button" style={{ padding: '10px 24px' }}>
                        {mode === 'newLesson' ? 'Create Lesson' : 'Save Lesson Details'}
                      </button>
                    </div>
                  </form>
                </div>

                {mode === 'newLesson' && (
                  <div className={`${styles.adminCard} glass-panel`} style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Save the lesson details above first — then its <strong>study material</strong> and <strong>quiz questions</strong> will appear here to edit.
                  </div>
                )}

                {mode === 'editLesson' && (
                  <>
                    {/* Study material */}
                    <div className={`${styles.adminCard} glass-panel`}>
                      <h2 className={styles.cardTitle}>Study Material</h2>
                      <form onSubmit={handleMaterialSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Display Mode</label>
                          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                              <input type="radio" name="material_type" checked={materialType === 'PAGE'} onChange={() => { setMaterialType('PAGE'); setMaterialContent(''); }} />
                              Single Page (HTML Article)
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                              <input type="radio" name="material_type" checked={materialType === 'SLIDES'} onChange={() => { setMaterialType('SLIDES'); setMaterialContent('[]'); }} />
                              Presentation (JSON Slideshow)
                            </label>
                          </div>
                        </div>

                        <div className={styles.formGroup}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '6px' }}>
                            <label className={styles.formLabel}>Content ({materialType === 'SLIDES' ? 'JSON Slides Array' : 'Raw HTML'})</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Insert:</span>
                              {materialType === 'SLIDES' ? (
                                <>
                                  <span onClick={() => insertTemplate('welcome')} className={styles.templateTag}>Welcome Slide</span>
                                  <span onClick={() => insertTemplate('grid')} className={styles.templateTag}>Feature Grid</span>
                                  <span onClick={() => insertTemplate('code')} className={styles.templateTag}>Code Snippet</span>
                                </>
                              ) : (
                                <>
                                  <span onClick={() => insertTemplate('welcome')} className={styles.templateTag}>Headline</span>
                                  <span onClick={() => insertTemplate('code')} className={styles.templateTag}>Code block</span>
                                  <span onClick={() => insertTemplate('note')} className={styles.templateTag}>Note Box</span>
                                  <span onClick={() => insertTemplate('warning')} className={styles.templateTag}>Warning Box</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                            <label className="outline-button" style={{ padding: '8px 16px', fontSize: '0.85rem', cursor: uploading ? 'wait' : 'pointer' }}>
                              {uploading ? 'Uploading…' : 'Upload file / image'}
                              <input type="file" onChange={handleFileUpload} disabled={uploading} style={{ display: 'none' }} />
                            </label>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Images embed inline; other files become a download link.</span>
                            {uploadMsg && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', width: '100%' }}>{uploadMsg}</span>}
                          </div>

                          <textarea
                            value={materialContent}
                            onChange={(e) => setMaterialContent(e.target.value)}
                            className={styles.textarea}
                            required
                            placeholder={materialType === 'SLIDES' ? '[\n  {\n    "title": "Welcome Slide",\n    "layout": "welcome",\n    "html": "<h1>My Slide Heading</h1>"\n  }\n]' : '<h1>Lesson Title</h1>\n<p>Explain concepts in standard HTML tags...</p>'}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Live Preview</label>
                          <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '120px', background: 'var(--bg-secondary)' }}>
                            {materialType === 'PAGE' ? (
                              materialContent.trim() ? (
                                <div className="rich-content" dangerouslySetInnerHTML={{ __html: materialContent }} />
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Start typing HTML above to see a live preview here.</span>
                              )
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Slide preview isn&apos;t shown here — save, then open the lesson page to view the slideshow.</span>
                            )}
                          </div>
                        </div>

                        <button type="submit" className="gradient-button" style={{ alignSelf: 'flex-end', padding: '10px 24px' }}>Save Study Material</button>
                      </form>
                    </div>

                    {/* Quizzes */}
                    <div className={`${styles.adminCard} glass-panel`}>
                      <h2 className={styles.cardTitle}>
                        Quiz Questions
                        {editingQuestionId && (
                          <button onClick={resetQuizForm} className={styles.btnSecondary} style={{ fontSize: '0.8rem' }}>Cancel Edit</button>
                        )}
                      </h2>

                      {currentQuizzes.length > 0 && (
                        <div className={styles.itemList} style={{ marginBottom: '1.5rem' }}>
                          {currentQuizzes.map((q) => (
                            <div key={q.id} className={styles.itemRow}>
                              <div>
                                <strong>{q.questionText}</strong>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                  {q.options.map((o) => `${o.optionText}${o.isCorrect ? ' (correct)' : ''}`).join(', ')}
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => handleQuestionEdit(q)} className={styles.btnSecondary}>Edit</button>
                                <button onClick={() => handleQuestionDelete(q.id)} className={styles.btnDanger}>Delete</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <form onSubmit={handleQuizSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>{editingQuestionId ? 'Edit Question' : 'New Question'}</label>
                          <input type="text" value={questionText} onChange={(e) => setQuestionText(e.target.value)} required className={styles.input} placeholder="e.g. Which of the following statements is correct?" />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Explanation (shown after answering)</label>
                          <input type="text" value={explanation} onChange={(e) => setExplanation(e.target.value)} className={styles.input} placeholder="e.g. Explain briefly why this answer is correct." />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Options (select the correct one)</label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.25rem' }}>
                            {options.map((opt, index) => (
                              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <input type="radio" name="correct_option" checked={opt.isCorrect} onChange={() => setOptions(options.map((o, idx) => ({ ...o, isCorrect: idx === index })))} />
                                <input
                                  type="text"
                                  value={opt.optionText}
                                  onChange={(e) => {
                                    const updated = [...options];
                                    updated[index] = { ...updated[index], optionText: e.target.value };
                                    setOptions(updated);
                                  }}
                                  required
                                  className={styles.input}
                                  placeholder={`Option ${index + 1}`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                        <button type="submit" className="gradient-button" style={{ alignSelf: 'flex-end', padding: '10px 24px' }}>
                          {editingQuestionId ? 'Update Question' : 'Add Question'}
                        </button>
                      </form>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
