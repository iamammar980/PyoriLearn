// Seed sample content into the Neon database.
// Run:  node scripts/seed.mjs
// Safe to re-run: it clears existing topics (and their materials/quizzes/progress) first.
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

const materialHtml = (title, points) => `
<article>
  <h1>${title}</h1>
  <p class="lead">A quick, friendly walkthrough — read this alongside the video above.</p>
  <h2>Key ideas</h2>
  <ul>
    ${points.map((p) => `<li>${p}</li>`).join('\n    ')}
  </ul>
  <h2>Try it yourself</h2>
  <pre><code>print("Hello, PyLearn!")</code></pre>
  <blockquote>Tip: finish the quiz below to mark this topic complete.</blockquote>
</article>`;

async function main() {
  console.log('Clearing existing topics...');
  await sql`TRUNCATE TABLE "Topic" RESTART IDENTITY CASCADE`;

  // --- Root topic 1: Python Fundamentals ---
  const [python] = await sql`
    INSERT INTO "Topic" (title, description, "youtubeUrl", "parentId", "order")
    VALUES ('Python Fundamentals', 'Start here: the core building blocks of the Python language.', NULL, NULL, 1)
    RETURNING id`;

  const [vars] = await sql`
    INSERT INTO "Topic" (title, description, "youtubeUrl", "parentId", "order")
    VALUES ('Variables & Data Types', 'How Python stores text, numbers, and booleans.',
            'https://www.youtube.com/watch?v=cQT33yu9pY8', ${python.id}, 1)
    RETURNING id`;

  const [flow] = await sql`
    INSERT INTO "Topic" (title, description, "youtubeUrl", "parentId", "order")
    VALUES ('Control Flow', 'Making decisions with if/else and repeating work with loops.',
            'https://www.youtube.com/watch?v=DZwmZ8Usvnk', ${python.id}, 2)
    RETURNING id`;

  // --- Root topic 2: Web Development ---
  const [web] = await sql`
    INSERT INTO "Topic" (title, description, "youtubeUrl", "parentId", "order")
    VALUES ('Web Development', 'Build pages for the browser with HTML and CSS.', NULL, NULL, 2)
    RETURNING id`;

  const [html] = await sql`
    INSERT INTO "Topic" (title, description, "youtubeUrl", "parentId", "order")
    VALUES ('HTML Basics', 'The structure behind every web page.',
            'https://www.youtube.com/watch?v=qz0aGYrrlhU', ${web.id}, 1)
    RETURNING id`;

  // --- Materials (one per topic) ---
  await sql`INSERT INTO "EducationalMaterial" ("topicId", content, type) VALUES
    (${vars.id}, ${materialHtml('Variables & Data Types', ['A variable is a name that points to a value.', 'Common types: str, int, float, bool.', 'Use type() to inspect a value.'])}, 'PAGE'),
    (${flow.id}, ${materialHtml('Control Flow', ['if / elif / else choose which code runs.', 'for loops repeat over a sequence.', 'while loops repeat until a condition is false.'])}, 'PAGE'),
    (${html.id}, ${materialHtml('HTML Basics', ['HTML uses tags like <h1>, <p>, and <a>.', 'Elements nest to form a document tree.', 'The <head> holds metadata; the <body> holds content.'])}, 'PAGE')`;

  // --- Quiz for "Variables & Data Types" ---
  const [q1] = await sql`
    INSERT INTO "QuizQuestion" ("topicId", "questionText", explanation)
    VALUES (${vars.id}, 'Which type would Python use for the value 3.14?', '3.14 has a decimal point, so it is a float.')
    RETURNING id`;
  await sql`INSERT INTO "QuizOption" ("questionId", "optionText", "isCorrect") VALUES
    (${q1.id}, 'int', false),
    (${q1.id}, 'float', true),
    (${q1.id}, 'str', false),
    (${q1.id}, 'bool', false)`;

  const [q2] = await sql`
    INSERT INTO "QuizQuestion" ("topicId", "questionText", explanation)
    VALUES (${vars.id}, 'How do you create a variable named age with value 20?', 'Assignment uses a single = sign.')
    RETURNING id`;
  await sql`INSERT INTO "QuizOption" ("questionId", "optionText", "isCorrect") VALUES
    (${q2.id}, 'age = 20', true),
    (${q2.id}, 'age == 20', false),
    (${q2.id}, 'int age = 20', false),
    (${q2.id}, 'var age = 20', false)`;

  // --- Quiz for "Control Flow" ---
  const [q3] = await sql`
    INSERT INTO "QuizQuestion" ("topicId", "questionText", explanation)
    VALUES (${flow.id}, 'Which keyword starts a loop that repeats over a list?', 'for iterates over each item in a sequence.')
    RETURNING id`;
  await sql`INSERT INTO "QuizOption" ("questionId", "optionText", "isCorrect") VALUES
    (${q3.id}, 'if', false),
    (${q3.id}, 'for', true),
    (${q3.id}, 'def', false),
    (${q3.id}, 'return', false)`;

  console.log('Seed complete: 2 root topics, 3 sub-topics, 3 material pages, 3 quiz questions.');
}

main().catch((e) => { console.error(e); process.exit(1); });
