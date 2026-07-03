import { PrismaClient } from '../generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db',
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Clearing database...');
  await prisma.userProgress.deleteMany({});
  await prisma.quizOption.deleteMany({});
  await prisma.quizQuestion.deleteMany({});
  await prisma.educationalMaterial.deleteMany({});
  await prisma.topic.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding users...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@pylearn.com',
      name: 'Admin Instructor',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const student = await prisma.user.create({
    data: {
      email: 'student@pylearn.com',
      name: 'Ammar Amer',
      password: userPassword,
      role: 'USER',
    },
  });

  console.log('Seeding topic tree and contents...');

  // Topic 1: Python Basics (Main Topic)
  const main1 = await prisma.topic.create({
    data: {
      title: 'Python Basics',
      description: 'Master the foundational concepts of Python including variables, operations, and basic inputs/outputs.',
      order: 1,
    },
  });

  // Topic 1.1: Intro to Python (Subtopic of Python Basics)
  const sub1_1 = await prisma.topic.create({
    data: {
      title: 'Introduction to Python',
      description: 'Learn what Python is, its history, how it works, and write your very first program.',
      parentId: main1.id,
      youtubeUrl: 'https://www.youtube.com/embed/kqtD5eraYb8', // Standard shareable embed link
      order: 1,
    },
  });

  // Educational Material for 1.1 (Slides mode)
  await prisma.educationalMaterial.create({
    data: {
      topicId: sub1_1.id,
      type: 'SLIDES',
      content: JSON.stringify([
        {
          title: 'Welcome to Python!',
          layout: 'welcome',
          html: '<h1>Welcome to Python Programming</h1><p>Python is an interpreted, high-level, general-purpose programming language. Created by <strong>Guido van Rossum</strong> and first released in 1991, Python design philosophy emphasizes code readability.</p><div class="highlight-box">💡 <strong>Fun Fact:</strong> Python was named after the BBC comedy series "Monty Python\'s Flying Circus", not the snake!</div>',
        },
        {
          title: 'Why Learn Python?',
          layout: 'grid',
          html: '<h2>Why Choose Python?</h2><div class="features-grid"><div class="feature-card"><h3>Easy to Read</h3><p>Python resembles English. It has clean syntax, making it perfect for beginners.</p></div><div class="feature-card"><h3>Versatile</h3><p>Used in Web Dev, AI/ML, Data Science, Scripting, Automation, and more.</p></div><div class="feature-card"><h3>Huge Ecosystem</h3><p>Thousands of open-source libraries available for instantly solving complex tasks.</p></div></div>',
        },
        {
          title: 'Your First Python Script',
          layout: 'code',
          html: '<h2>The Classic Hello World</h2><p>In Python, writing output is incredibly simple compared to languages like C++ or Java. Look at the code below:</p><pre><code>print("Hello, World!")</code></pre><div class="code-explanation">The <code>print()</code> function displays whatever text you put inside the quotes onto the screen.</div>',
        },
      ]),
    },
  });

  // Quiz for 1.1
  await prisma.quizQuestion.create({
    data: {
      topicId: sub1_1.id,
      questionText: 'Who created the Python programming language?',
      explanation: 'Python was created by Guido van Rossum and released in 1991.',
      options: {
        create: [
          { optionText: 'Guido van Rossum', isCorrect: true },
          { optionText: 'Dennis Ritchie', isCorrect: false },
          { optionText: 'Bjarne Stroustrup', isCorrect: false },
          { optionText: 'James Gosling', isCorrect: false },
        ],
      },
    },
  });

  await prisma.quizQuestion.create({
    data: {
      topicId: sub1_1.id,
      questionText: 'Which of the following is the correct function to print output in Python?',
      explanation: 'The `print()` function is the built-in function used to write output to the console.',
      options: {
        create: [
          { optionText: 'console.log()', isCorrect: false },
          { optionText: 'printf()', isCorrect: false },
          { optionText: 'print()', isCorrect: true },
          { optionText: 'echo()', isCorrect: false },
        ],
      },
    },
  });

  // Topic 1.2: Variables and Data Types
  const sub1_2 = await prisma.topic.create({
    data: {
      title: 'Variables & Data Types',
      description: 'Understand how Python stores data in memory and the difference between strings, numbers, and booleans.',
      parentId: main1.id,
      youtubeUrl: 'https://www.youtube.com/embed/cQT33yukyDM',
      order: 2,
    },
  });

  await prisma.educationalMaterial.create({
    data: {
      topicId: sub1_2.id,
      type: 'PAGE',
      content: '<h1>Variables & Data Types in Python</h1><p>Variables are containers for storing data values. In Python, you don\'t need to declare variables with types; they are dynamically typed.</p><h2>How to Define Variables</h2><pre><code># Integer\nage = 25\n\n# Float (Decimal)\nprice = 19.99\n\n# String\nname = "Alice"\n\n# Boolean\nis_active = True</code></pre><p>In Python, names are case-sensitive. <code>age</code> and <code>Age</code> are different variables.</p><h2>Common Built-in Types</h2><ul><li><strong>int</strong>: Whole numbers (e.g. 5, -12)</li><li><strong>float</strong>: Floating-point decimals (e.g. 3.14, -0.01)</li><li><strong>str</strong>: Characters wrapped in quotes (e.g. "Python")</li><li><strong>bool</strong>: True or False values</li></ul><div class="note-box">💡 <strong>Dynamic Typing:</strong> You can change the value of a variable to a different type later: <code>x = 5; x = "hello"</code>. This is valid in Python!</div>',
    },
  });

  await prisma.quizQuestion.create({
    data: {
      topicId: sub1_2.id,
      questionText: 'Which data type is dynamically assigned to: x = 12.5?',
      explanation: '12.5 has a decimal point, so Python assigns it the `float` type.',
      options: {
        create: [
          { optionText: 'int', isCorrect: false },
          { optionText: 'float', isCorrect: true },
          { optionText: 'str', isCorrect: false },
          { optionText: 'bool', isCorrect: false },
        ],
      },
    },
  });

  // Topic 2: Control Flow (Main Topic)
  const main2 = await prisma.topic.create({
    data: {
      title: 'Control Flow',
      description: 'Control how and when your code runs using branching logic and iteration loops.',
      order: 2,
    },
  });

  // Topic 2.1: Conditionals
  const sub2_1 = await prisma.topic.create({
    data: {
      title: 'Conditionals (if-else)',
      description: 'Make decisions in your code using if, elif, and else statements.',
      parentId: main2.id,
      youtubeUrl: 'https://www.youtube.com/embed/Zp5MuPOxlM0',
      order: 1,
    },
  });

  await prisma.educationalMaterial.create({
    data: {
      topicId: sub2_1.id,
      type: 'PAGE',
      content: '<h1>Branching Logic with if-else</h1><p>Python uses conditional statements to decide which blocks of code to run. Indentation is critical here!</p><h2>Syntax Structure</h2><pre><code>score = 85\n\nif score >= 90:\n    print("Grade: A")\nelif score >= 80:\n    print("Grade: B")\nelse:\n    print("Grade: C")</code></pre><div class="warning-box">⚠️ <strong>Indentation:</strong> Python uses 4 spaces (or a tab) to define code blocks. Incorrect indentation will throw an <code>IndentationError</code>!</div>',
    },
  });

  await prisma.quizQuestion.create({
    data: {
      topicId: sub2_1.id,
      questionText: 'What error does Python throw when spacing is inconsistent inside code blocks?',
      explanation: 'Python relies on spaces/indentation to group blocks of code; inconsistent spaces raise an IndentationError.',
      options: {
        create: [
          { optionText: 'SyntaxError', isCorrect: false },
          { optionText: 'SpacingError', isCorrect: false },
          { optionText: 'IndentationError', isCorrect: true },
          { optionText: 'TabError', isCorrect: false },
        ],
      },
    },
  });

  console.log('Database seeded successfully!');
  console.log(`Admin email: admin@pylearn.com`);
  console.log(`Student email: student@pylearn.com`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // disconnected
  });
