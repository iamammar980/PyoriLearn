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

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'tree' | 'material' | 'quiz' | 'students'>('tree');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  // Topic Form State
  const [topicId, setTopicId] = useState<number | null>(null);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicDesc, setTopicDesc] = useState('');
  const [topicParent, setTopicParent] = useState<string>('');
  const [topicYoutube, setTopicYoutube] = useState('');
  const [topicOrder, setTopicOrder] = useState('0');

  // Material Form State
  const [selectedSubtopicId, setSelectedSubtopicId] = useState<string>('');
  const [materialType, setMaterialType] = useState<'PAGE' | 'SLIDES'>('PAGE');
  const [materialContent, setMaterialContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

  // Quiz Form State
  const [quizSubtopicId, setQuizSubtopicId] = useState<string>('');
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [options, setOptions] = useState<Option[]>([
    { optionText: '', isCorrect: true },
    { optionText: '', isCorrect: false },
    { optionText: '', isCorrect: false },
    { optionText: '', isCorrect: false },
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/data');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setTopics(data.topics);
        
        // Auto-select first subtopic if available
        const subtopic = data.topics.find((t: Topic) => t.parentId !== null);
        if (subtopic) {
          setSelectedSubtopicId(subtopic.id.toString());
          setQuizSubtopicId(subtopic.id.toString());
          if (subtopic.materials.length > 0) {
            setMaterialType(subtopic.materials[0].type);
            setMaterialContent(subtopic.materials[0].content);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update material fields when active subtopic changes
  const handleSubtopicChange = (id: string) => {
    setSelectedSubtopicId(id);
    const subtopic = topics.find((t) => t.id === Number(id));
    if (subtopic && subtopic.materials.length > 0) {
      setMaterialType(subtopic.materials[0].type as any);
      setMaterialContent(subtopic.materials[0].content);
    } else {
      setMaterialContent('');
    }
  };

  // Helper templates for writing content
  const insertTemplate = (templateType: string) => {
    if (materialType === 'SLIDES') {
      let slideObj = {};
      if (templateType === 'welcome') {
        slideObj = {
          title: 'Title of Slide',
          layout: 'welcome',
          html: '<h1>Welcome to this Topic</h1><p>Introduce the subject here with clear paragraphs.</p><div class="highlight-box">💡 <strong>Tip:</strong> Callout important facts.</div>',
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
          html: '<h2>Example Code Title</h2><p>Here is some code explanation.</p><pre><code>def example_func():\n    return "Hello"</code></pre><div class="code-explanation">Explaining how the function works.</div>',
        };
      }

      try {
        let currentArray = [];
        if (materialContent.trim()) {
          currentArray = JSON.parse(materialContent);
        }
        currentArray.push(slideObj);
        setMaterialContent(JSON.stringify(currentArray, null, 2));
      } catch (e) {
        // If parsing fails, start new array
        setMaterialContent(JSON.stringify([slideObj], null, 2));
      }
    } else {
      // PAGE Mode templates
      let html = '';
      if (templateType === 'welcome') {
        html = '<h1>Title of Lesson</h1><p>Start writing content here...</p>\n';
      } else if (templateType === 'code') {
        html = '<h2>Code Demonstration</h2>\n<pre><code>x = 10\ny = 20\nprint(x + y)</code></pre>\n<p>Explain variables above...</p>\n';
      } else if (templateType === 'note') {
        html = '<div class="note-box">\n💡 <strong>Key Note:</strong> Write important notes here.\n</div>\n';
      } else if (templateType === 'warning') {
        html = '<div class="warning-box">\n⚠️ <strong>Caution:</strong> Write warnings here.\n</div>\n';
      }
      setMaterialContent((prev) => prev + html);
    }
  };

  // Upload a file and insert a reference to it into the material content.
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
        setUploadMsg(`❌ ${data.error || 'Upload failed'}`);
      } else {
        const isImage = (data.type || '').startsWith('image/');
        const snippet = isImage
          ? `\n<img src="${data.url}" alt="${data.name}" style="max-width:100%;border-radius:8px;" />\n`
          : `\n<p>📎 <a href="${data.url}" target="_blank" rel="noopener">Download ${data.name}</a></p>\n`;
        // Insert into the HTML page content (append). For SLIDES mode, just surface the URL to copy.
        if (materialType === 'PAGE') {
          setMaterialContent((prev) => prev + snippet);
          setUploadMsg(`✅ Inserted ${data.name} into the content below.`);
        } else {
          setUploadMsg(`✅ Uploaded. URL: ${data.url}`);
        }
      }
    } catch (err) {
      console.error(err);
      setUploadMsg('❌ Upload failed. Check your connection.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Submit handlers
  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        // Reset and reload
        setTopicId(null);
        setTopicTitle('');
        setTopicDesc('');
        setTopicParent('');
        setTopicYoutube('');
        setTopicOrder('0');
        await loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTopicDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this topic and all its associated materials/quizzes?')) return;
    try {
      const res = await fetch(`/api/admin/topics/${id}`, { method: 'DELETE' });
      if (res.ok) await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMaterialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubtopicId) return;

    // Validate JSON if SLIDES mode is active
    if (materialType === 'SLIDES') {
      try {
        JSON.parse(materialContent);
      } catch (err) {
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
        alert('Material saved successfully!');
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
        setEditingQuestionId(null);
        setQuestionText('');
        setExplanation('');
        setOptions([
          { optionText: '', isCorrect: true },
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false },
        ]);
        await loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuestionDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
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
    // Load options
    const opts = question.options.map(o => ({
      optionText: o.optionText,
      isCorrect: o.isCorrect
    }));
    // Pad to 4 options if less
    while (opts.length < 4) {
      opts.push({ optionText: '', isCorrect: false });
    }
    setOptions(opts);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <h3>Loading Admin Panel Data...</h3>
      </div>
    );
  }

  // Group subtopics and main topics
  const mainTopics = topics.filter(t => t.parentId === null);
  const subtopics = topics.filter(t => t.parentId !== null);

  return (
    <div className={styles.container}>
      
      {/* Sidebar Tabs */}
      <div className={styles.sidebar}>
        <h3 style={{ fontSize: '1.1rem', padding: '0.5rem 1.25rem', color: 'var(--text-muted)' }}>Instructor Tools</h3>
        
        <button
          onClick={() => setActiveTab('tree')}
          className={`${styles.sidebarTab} ${activeTab === 'tree' ? styles.sidebarTabActive : ''}`}
        >
          🌳 Syllabus Tree
        </button>

        <button
          onClick={() => setActiveTab('material')}
          className={`${styles.sidebarTab} ${activeTab === 'material' ? styles.sidebarTabActive : ''}`}
        >
          📖 Lesson Content
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`${styles.sidebarTab} ${activeTab === 'quiz' ? styles.sidebarTabActive : ''}`}
        >
          ✍️ Quiz Editor
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`${styles.sidebarTab} ${activeTab === 'students' ? styles.sidebarTabActive : ''}`}
        >
          👥 Student Progress
        </button>
      </div>

      {/* Main Panel Content */}
      <div className={styles.mainContent}>
        
        {/* Tab 1: Syllabus Tree Builder */}
        {activeTab === 'tree' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className={`${styles.adminCard} glass-panel`}>
              <h2 className={styles.cardTitle}>
                {topicId ? 'Edit Topic Node' : 'Create Topic Node'}
                {topicId && (
                  <button onClick={() => setTopicId(null)} className={styles.btnSecondary} style={{ fontSize: '0.8rem' }}>
                    Cancel Edit
                  </button>
                )}
              </h2>

              <form onSubmit={topicSubmitHandler} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                  <label className={styles.formLabel}>Topic Title</label>
                  <input
                    type="text"
                    value={topicTitle}
                    onChange={(e) => setTopicTitle(e.target.value)}
                    required
                    className={styles.input}
                    placeholder="e.g. Variables & Data Types"
                  />
                </div>

                <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                  <label className={styles.formLabel}>Description</label>
                  <input
                    type="text"
                    value={topicDesc}
                    onChange={(e) => setTopicDesc(e.target.value)}
                    required
                    className={styles.input}
                    placeholder="Brief summary of topic content..."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Parent Topic (Leave blank if Main Topic)</label>
                  <select
                    value={topicParent}
                    onChange={(e) => setTopicParent(e.target.value)}
                    className={styles.select}
                  >
                    <option value="">-- Set as Root Main Topic --</option>
                    {mainTopics.map((t) => (
                      <option key={t.id} value={t.id.toString()}>{t.title}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>YouTube Video Embed URL (Subtopics only)</label>
                  <input
                    type="text"
                    value={topicYoutube}
                    onChange={(e) => setTopicYoutube(e.target.value)}
                    className={styles.input}
                    placeholder="https://www.youtube.com/embed/XXXXXX"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Display Order (Integer)</label>
                  <input
                    type="number"
                    value={topicOrder}
                    onChange={(e) => setTopicOrder(e.target.value)}
                    className={styles.input}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', gridColumn: 'span 2' }}>
                  <button type="submit" className="gradient-button" style={{ padding: '10px 24px' }}>
                    {topicId ? 'Update Topic' : 'Add Topic Node'}
                  </button>
                </div>
              </form>
            </div>

            <div className={`${styles.adminCard} glass-panel`}>
              <h2 className={styles.cardTitle}>Syllabus Structures</h2>
              <div className={styles.itemList}>
                {mainTopics.map((main) => {
                  const children = subtopics.filter((sub) => sub.parentId === main.id);
                  return (
                    <div key={main.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem' }}>
                      <div className={styles.itemRow} style={{ background: 'rgba(59, 130, 246, 0.05)' }}>
                        <div>
                          <strong style={{ fontSize: '1.1rem' }}>📦 {main.title}</strong>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{main.description}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => {
                            setTopicId(main.id);
                            setTopicTitle(main.title);
                            setTopicDesc(main.description);
                            setTopicParent('');
                            setTopicYoutube('');
                            setTopicOrder(main.order.toString());
                          }} className={styles.btnSecondary}>Edit</button>
                          <button onClick={() => handleTopicDelete(main.id)} className={styles.btnDanger}>Delete</button>
                        </div>
                      </div>

                      {children.map((child) => (
                        <div key={child.id} className={styles.itemRow} style={{ marginLeft: '2rem' }}>
                          <div>
                            <strong>📄 {child.title}</strong>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{child.description}</div>
                            {child.youtubeUrl && <span className={styles.badge} style={{ marginTop: '0.25rem', display: 'inline-block' }}>🎥 Video Link</span>}
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => {
                              setTopicId(child.id);
                              setTopicTitle(child.title);
                              setTopicDesc(child.description);
                              setTopicParent(main.id.toString());
                              setTopicYoutube(child.youtubeUrl || '');
                              setTopicOrder(child.order.toString());
                            }} className={styles.btnSecondary}>Edit</button>
                            <button onClick={() => handleTopicDelete(child.id)} className={styles.btnDanger}>Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Lesson Rich Content Editor */}
        {activeTab === 'material' && (
          <div className={`${styles.adminCard} glass-panel`}>
            <h2 className={styles.cardTitle}>Lesson Study Material</h2>

            <form onSubmit={handleMaterialSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Select Subtopic</label>
                <select
                  value={selectedSubtopicId}
                  onChange={(e) => handleSubtopicChange(e.target.value)}
                  className={styles.select}
                  required
                >
                  <option value="">-- Choose Subtopic --</option>
                  {subtopics.map((s) => (
                    <option key={s.id} value={s.id.toString()}>{s.title}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Material Display Mode</label>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="material_type"
                      checked={materialType === 'PAGE'}
                      onChange={() => {
                        setMaterialType('PAGE');
                        setMaterialContent('');
                      }}
                    />
                    Single Integrated Page (HTML Article)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="material_type"
                      checked={materialType === 'SLIDES'}
                      onChange={() => {
                        setMaterialType('SLIDES');
                        setMaterialContent('[]');
                      }}
                    />
                    Interactive Presentation (JSON Slideshow)
                  </label>
                </div>
              </div>

              <div className={styles.formGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <label className={styles.formLabel}>Material Content ({materialType === 'SLIDES' ? 'JSON Slides Array' : 'Raw HTML Document'})</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Insert Widget:</span>
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

                {/* File upload widget */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  <label className="outline-button" style={{ padding: '8px 16px', fontSize: '0.85rem', cursor: uploading ? 'wait' : 'pointer' }}>
                    {uploading ? 'Uploading…' : '📎 Upload file / image'}
                    <input type="file" onChange={handleFileUpload} disabled={uploading} style={{ display: 'none' }} />
                  </label>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Images embed inline; other files become a download link.
                  </span>
                  {uploadMsg && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', width: '100%' }}>{uploadMsg}</span>
                  )}
                </div>

                <textarea
                  value={materialContent}
                  onChange={(e) => setMaterialContent(e.target.value)}
                  className={styles.textarea}
                  required
                  placeholder={
                    materialType === 'SLIDES' 
                      ? '[\n  {\n    "title": "Welcome Slide",\n    "layout": "welcome",\n    "html": "<h1>My Slide Heading</h1>"\n  }\n]'
                      : '<h1>Intro to Variables</h1>\n<p>Explain concepts in standard HTML tags...</p>'
                  }
                />
              </div>

              {/* Live preview — renders exactly what students will see */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>🔎 Live Preview</label>
                <div
                  className="glass-panel"
                  style={{ padding: '1.5rem', minHeight: '120px', background: 'var(--bg-secondary)' }}
                >
                  {materialType === 'PAGE' ? (
                    materialContent.trim() ? (
                      <div className="rich-content" dangerouslySetInnerHTML={{ __html: materialContent }} />
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Start typing HTML above to see a live preview here.
                      </span>
                    )
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      Slide preview isn&apos;t shown here — save, then open the subtopic page to view the interactive slideshow.
                    </span>
                  )}
                </div>
              </div>

              <button type="submit" className="gradient-button" style={{ alignSelf: 'flex-end', padding: '10px 24px' }}>
                Save Lesson Content
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Quiz Builder */}
        {activeTab === 'quiz' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className={`${styles.adminCard} glass-panel`}>
              <h2 className={styles.cardTitle}>
                {editingQuestionId ? `Edit Question (ID: ${editingQuestionId})` : 'Create Challenge Question'}
                {editingQuestionId && (
                  <button onClick={() => {
                    setEditingQuestionId(null);
                    setQuestionText('');
                    setExplanation('');
                    setOptions([
                      { optionText: '', isCorrect: true },
                      { optionText: '', isCorrect: false },
                      { optionText: '', isCorrect: false },
                      { optionText: '', isCorrect: false },
                    ]);
                  }} className={styles.btnSecondary} style={{ fontSize: '0.8rem' }}>
                    Cancel Edit
                  </button>
                )}
              </h2>

              <form onSubmit={handleQuizSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Select Subtopic</label>
                  <select
                    value={quizSubtopicId}
                    onChange={(e) => setQuizSubtopicId(e.target.value)}
                    className={styles.select}
                    required
                  >
                    <option value="">-- Choose Subtopic --</option>
                    {subtopics.map((s) => (
                      <option key={s.id} value={s.id.toString()}>{s.title}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Question Text</label>
                  <input
                    type="text"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    required
                    className={styles.input}
                    placeholder="e.g. Which of the following statements is correct?"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Explanation / Reason (Shown after answering)</label>
                  <input
                    type="text"
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    className={styles.input}
                    placeholder="e.g. Explain briefly why this answer is correct."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Multiple Choice Options (Mark Correct Option)</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.25rem' }}>
                    {options.map((opt, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <input
                          type="radio"
                          name="correct_option"
                          checked={opt.isCorrect}
                          onChange={() => {
                            const updated = options.map((o, idx) => ({
                              ...o,
                              isCorrect: idx === index,
                            }));
                            setOptions(updated);
                          }}
                        />
                        <input
                          type="text"
                          value={opt.optionText}
                          onChange={(e) => {
                            const updated = [...options];
                            updated[index].optionText = e.target.value;
                            setOptions(updated);
                          }}
                          required
                          className={styles.input}
                          placeholder={`Option ${index + 1} Text`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" className="gradient-button" style={{ alignSelf: 'flex-end', padding: '10px 24px' }}>
                  {editingQuestionId ? 'Update Quiz Question' : 'Save Quiz Question'}
                </button>
              </form>
            </div>

            <div className={`${styles.adminCard} glass-panel`}>
              <h2 className={styles.cardTitle}>Existing Questions</h2>
              <div className={styles.itemList}>
                {quizSubtopicId ? (
                  topics.find((t) => t.id === Number(quizSubtopicId))?.quizzes.map((q) => (
                    <div key={q.id} className={styles.itemRow}>
                      <div>
                        <strong>{q.questionText}</strong>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          Options: {q.options.map((o) => `${o.optionText}${o.isCorrect ? ' (✓)' : ''}`).join(', ')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleQuestionEdit(q)} className={styles.btnSecondary}>Edit</button>
                        <button onClick={() => handleQuestionDelete(q.id)} className={styles.btnDanger}>Delete</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Select a subtopic above to load its challenge questions.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Student Progress List */}
        {activeTab === 'students' && (
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
                    const compSub = user.progress.filter(p => p.completed).length;
                    const completionRate = totalSub > 0 ? Math.round((compSub / totalSub) * 100) : 0;

                    return (
                      <tr key={user.id} className={styles.tr}>
                        <td className={styles.td} style={{ fontWeight: 600 }}>{user.name}</td>
                        <td className={styles.td}>{user.email}</td>
                        <td className={styles.td}>
                          <span className={styles.badge} style={{ background: user.role === 'ADMIN' ? 'rgba(124,58,237,0.12)' : 'rgba(37,99,235,0.12)', color: user.role === 'ADMIN' ? '#7c3aed' : '#2563eb' }}>
                            {user.role}
                          </span>
                        </td>
                        <td className={styles.td}>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className={styles.td}>
                          <strong>{completionRate}%</strong> completed ({compSub}/{totalSub} topics)
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );

  // Make compiler happy
  function topicSubmitHandler(e: React.FormEvent) {
    handleTopicSubmit(e);
  }
}
