import mongoose from 'express';
import mongoosePkg from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config/env.js';
import {
  User,
  Category,
  Course,
  Module,
  Lesson,
  Enrollment,
  LessonProgress,
  Resource,
  Quiz,
  QuizAttempt,
  Assignment,
  Review,
  Certificate,
  Payment,
  Notification,
} from '../models/index.js';

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoosePkg.connect(config.mongoUri);
    console.log('[Seed] Connected. Clearing previous seed collections...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Course.deleteMany({}),
      Module.deleteMany({}),
      Lesson.deleteMany({}),
      Enrollment.deleteMany({}),
      LessonProgress.deleteMany({}),
      Resource.deleteMany({}),
      Quiz.deleteMany({}),
      QuizAttempt.deleteMany({}),
      Assignment.deleteMany({}),
      Review.deleteMany({}),
      Certificate.deleteMany({}),
      Payment.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    const passwordHash = await bcrypt.hash('Password@123', 10);
    const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);

    console.log('[Seed] Creating Users...');
    // 1. Admin
    const admin = await User.create({
      name: 'Elena Rostova (Admin)',
      email: 'admin@oblivion.edu',
      password: adminPasswordHash,
      role: 'admin',
      headline: 'Platform Administrator & Chief Academic Officer',
      bio: 'Overseeing curriculum quality, instructor credentials, and global platform compliance.',
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
      accountStatus: 'active',
      instructorStatus: 'approved',
    });

    // 2. Instructors
    const instructor1 = await User.create({
      name: 'Dr. Sarah Jenkins',
      email: 'sarah.dr@oblivion.edu',
      password: passwordHash,
      role: 'instructor',
      headline: 'Staff AI Researcher & Former Stanford Lecturer',
      bio: 'Author of 3 books on Deep Learning and Transformers. Passionate about making cutting-edge AI intuitive and hands-on.',
      profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
      accountStatus: 'active',
      instructorStatus: 'approved',
    });

    const instructor2 = await User.create({
      name: 'Alex Rivera',
      email: 'alex.dev@oblivion.edu',
      password: passwordHash,
      role: 'instructor',
      headline: 'Principal Full-Stack Architect & Cloud Consultant',
      bio: '12+ years designing distributed systems, high-scale React apps, and cloud native microservices on AWS and Kubernetes.',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
      accountStatus: 'active',
      instructorStatus: 'approved',
    });

    // 3. Students
    const student1 = await User.create({
      name: 'Emma Watson',
      email: 'emma.watson@student.edu',
      password: passwordHash,
      role: 'student',
      headline: 'Aspiring Full Stack Engineer',
      bio: 'Computer science sophomore passionate about modern web technologies and building scalable applications.',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
      accountStatus: 'active',
    });

    const student2 = await User.create({
      name: 'Liam Chen',
      email: 'liam.chen@student.edu',
      password: passwordHash,
      role: 'student',
      headline: 'Data Science & Machine Learning Enthusiast',
      bio: 'Transitioning from finance into machine learning and big data pipelines.',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      accountStatus: 'active',
    });

    const student3 = await User.create({
      name: 'Priya Sharma',
      email: 'priya.sharma@student.edu',
      password: passwordHash,
      role: 'student',
      headline: 'Product Designer & UI Engineer',
      profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80',
      accountStatus: 'active',
    });

    console.log('[Seed] Creating Categories...');
    const categoriesData = [
      { name: 'Web Development', slug: 'web-development', icon: 'Code', description: 'Master front-end, back-end, and full-stack architectures.' },
      { name: 'AI & Machine Learning', slug: 'ai-machine-learning', icon: 'Cpu', description: 'From neural networks to large language models and prompt engineering.' },
      { name: 'Data Science', slug: 'data-science', icon: 'BarChart2', description: 'Python, Pandas, SQL, visualization, and predictive modeling.' },
      { name: 'Programming', slug: 'programming', icon: 'Terminal', description: 'Core languages including TypeScript, Python, Rust, and Go.' },
      { name: 'Business & Leadership', slug: 'business', icon: 'Briefcase', description: 'Product management, agile workflows, and tech entrepreneurship.' },
      { name: 'Design & UX', slug: 'design-ux', icon: 'Layout', description: 'Figma mastery, human-centered UX design, and modern UI systems.' },
      { name: 'Cybersecurity', slug: 'cybersecurity', icon: 'Shield', description: 'Ethical hacking, application security, and network defense.' },
      { name: 'Cloud Computing', slug: 'cloud-computing', icon: 'Cloud', description: 'AWS, Kubernetes, Docker, and DevOps automation.' },
    ];
    await Category.insertMany(categoriesData);

    console.log('[Seed] Creating Courses, Modules, and Lessons...');

    // COURSE 1: Full-Stack React & Node (Paid - $49)
    const course1 = await Course.create({
      instructor: instructor2._id,
      title: 'Modern Full-Stack Mastery: React 19, TypeScript & Node.js',
      slug: 'modern-full-stack-react-typescript-node',
      subtitle: 'Build enterprise-grade, scalable full-stack web applications from scratch.',
      description: 'Learn modern software craftsmanship with React 19, Node.js, Express, MongoDB, and TypeScript. We cover state management, robust authentication, database indexing, and automated testing.',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
      category: 'Web Development',
      tags: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Full-Stack'],
      difficulty: 'Intermediate',
      price: 49,
      isFree: false,
      currency: 'USD',
      estimatedDuration: '14 hours',
      learningObjectives: [
        'Build production-ready React 19 interfaces with TypeScript',
        'Architect secure REST APIs with Node.js and Express',
        'Model complex relationships with MongoDB & Mongoose',
        'Implement JWT authentication, RBAC, and input sanitization',
      ],
      prerequisites: ['Basic JavaScript (ES6+)', 'HTML & CSS fundamentals'],
      status: 'published',
      approvalStatus: 'approved',
      averageRating: 4.9,
      totalReviews: 24,
      totalEnrolled: 142,
    });

    const c1_m1 = await Module.create({
      courseId: course1._id,
      title: 'Module 1: Modern Full-Stack Architecture & Tooling',
      description: 'Environment setup, project structure, and TypeScript strict mode.',
      order: 1,
    });
    const c1_m1_l1 = await Lesson.create({
      courseId: course1._id,
      moduleId: c1_m1._id,
      title: '1.1 Full-Stack Architecture Overview',
      description: 'Understanding client-server separation, API contracts, and stateless authentication.',
      type: 'video',
      videoUrl: 'https://www.youtube.com/embed/SqcY0GlETPk',
      duration: 12,
      isRequired: true,
      order: 1,
      content: 'In this introductory lesson, we examine the anatomy of modern multi-tier web applications. We review HTTP semantics, asynchronous requests, and boundary validations.',
    });
    const c1_m1_l2 = await Lesson.create({
      courseId: course1._id,
      moduleId: c1_m1._id,
      title: '1.2 TypeScript Setup & Type Safety Patterns',
      description: 'Configuring strict TypeScript across both client and server codebases.',
      type: 'video',
      videoUrl: 'https://www.youtube.com/embed/gieEQFIfgYc',
      duration: 18,
      isRequired: true,
      order: 2,
      content: 'TypeScript transforms how teams maintain codebases. Here we establish shared DTO types, Zod schema validation, and discriminated unions.',
    });

    const c1_m2 = await Module.create({
      courseId: course1._id,
      title: 'Module 2: Database Modeling & REST APIs',
      description: 'Schema designs, compound indexing, and centralized error handling.',
      order: 2,
    });
    const c1_m2_l1 = await Lesson.create({
      courseId: course1._id,
      moduleId: c1_m2._id,
      title: '2.1 Designing Scalable Mongoose Schemas',
      description: 'Defining indexes, virtuals, cascade operations, and validation hooks.',
      type: 'video',
      videoUrl: 'https://www.youtube.com/embed/DZBGEExL2LU',
      duration: 22,
      isRequired: true,
      order: 3,
      content: 'Learn how to avoid performance bottlenecks in MongoDB with compound indexing, projection queries, and cursor-based pagination.',
    });
    const c1_m2_l2 = await Lesson.create({
      courseId: course1._id,
      moduleId: c1_m2._id,
      title: '2.2 End-to-End Authentication & Authorization',
      description: 'Implementing bcrypt hashing, JWT token rotation, and RBAC guards.',
      type: 'video',
      videoUrl: 'https://www.youtube.com/embed/mbsmsi7l3r4',
      duration: 25,
      isRequired: true,
      order: 4,
      content: 'Security must never be an afterthought. In this lesson, we build a bulletproof authentication layer with password hashing, rate limiting, and role guards.',
    });

    // Final Quiz for Course 1
    const c1_quiz = await Quiz.create({
      courseId: course1._id,
      title: 'Full-Stack React & Node Certification Exam',
      description: 'Verify your mastery of full-stack engineering, TypeScript, and MongoDB modeling.',
      passingScore: 75,
      isFinalQuiz: true,
      questions: [
        {
          question: 'What is the primary benefit of using compound indexes in MongoDB?',
          options: [
            'They compress database storage size',
            'They optimize queries filtering or sorting across multiple fields',
            'They automatically encrypt sensitive table columns',
            'They prevent duplicate documents across different collections',
          ],
          correctAnswerIndex: 1,
          explanation: 'Compound indexes index multiple fields together, enabling MongoDB to satisfy multi-key lookups without in-memory sorting.',
        },
        {
          question: 'Why should passwords never be hashed using standard MD5 or SHA256?',
          options: [
            'Because MD5 produces invalid ASCII characters',
            'Because modern GPUs can calculate billions of MD5 hashes per second, making brute force trivial',
            'Because SHA256 cannot hash strings longer than 10 characters',
            'Because MongoDB rejects SHA256 hashes in string fields',
          ],
          correctAnswerIndex: 1,
          explanation: 'Fast cryptographic hashes like SHA256 and MD5 are susceptible to GPU rainbow table cracking. Password hashing algorithms like bcrypt introduce slow work factors.',
        },
        {
          question: 'In React 19, what hook is used to handle asynchronous transitions without blocking the UI?',
          options: ['useTransition', 'useLayoutEffect', 'useBlocker', 'useThrottle'],
          correctAnswerIndex: 0,
          explanation: 'useTransition lets you update state without blocking the UI thread during async rendering.',
        },
        {
          question: 'What HTTP status code should be returned when an authentication token is missing or expired?',
          options: ['404 Not Found', '401 Unauthorized', '403 Forbidden', '500 Server Error'],
          correctAnswerIndex: 1,
          explanation: '401 Unauthorized indicates the request lacks valid authentication credentials for the target resource.',
        },
      ],
    });

    // COURSE 2: Deep Learning & AI Transformers (Free Course)
    const course2 = await Course.create({
      instructor: instructor1._id,
      title: 'Introduction to Deep Learning & Transformer Architectures',
      slug: 'intro-deep-learning-transformers',
      subtitle: 'Understand attention mechanisms, self-attention, and large language models.',
      description: 'Demystifying the foundational architecture behind ChatGPT, Claude, and Gemini. Learn vectors, embeddings, matrix multiplications, and multi-head attention in pure Python and PyTorch.',
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&q=80',
      category: 'AI & Machine Learning',
      tags: ['AI', 'Transformers', 'Deep Learning', 'PyTorch', 'LLMs'],
      difficulty: 'Beginner',
      price: 0,
      isFree: true,
      currency: 'USD',
      estimatedDuration: '8 hours',
      learningObjectives: [
        'Understand tokenization, vectors, and cosine similarity',
        'Implement attention mechanisms from scratch in Python',
        'Inspect feed-forward neural networks and residual connections',
        'Fine-tune small open-source models with LoRA',
      ],
      prerequisites: ['Basic Python programming', 'High school algebra'],
      status: 'published',
      approvalStatus: 'approved',
      averageRating: 5.0,
      totalReviews: 38,
      totalEnrolled: 310,
    });

    const c2_m1 = await Module.create({
      courseId: course2._id,
      title: 'Module 1: Vectors, Embeddings & Tokenization',
      order: 1,
    });
    const c2_m1_l1 = await Lesson.create({
      courseId: course2._id,
      moduleId: c2_m1._id,
      title: '1.1 Text to Vectors: How Computers Read Words',
      type: 'video',
      videoUrl: 'https://www.youtube.com/embed/aircAruvnKk',
      duration: 15,
      isRequired: true,
      order: 1,
      content: 'Words carry semantic meaning. In this lesson, we visualize high-dimensional embedding spaces where similar concepts cluster together.',
    });
    const c2_m1_l2 = await Lesson.create({
      courseId: course2._id,
      moduleId: c2_m1._id,
      title: '1.2 Self-Attention Explained Mathematically',
      type: 'video',
      videoUrl: 'https://www.youtube.com/embed/eMlx5fFNoYc',
      duration: 20,
      isRequired: true,
      order: 2,
      content: 'Query, Key, and Value vectors form the heart of the transformer mechanism. We break down the formula step by step.',
    });

    // COURSE 3: Data Science with Python & Pandas (Free)
    const course3 = await Course.create({
      instructor: instructor1._id,
      title: 'Data Science Bootcamp: Python, Pandas & Exploratory Analysis',
      slug: 'data-science-bootcamp-python-pandas',
      subtitle: 'Analyze real-world datasets, create compelling visualizations, and uncover actionable insights.',
      description: 'Hands-on data analytics course covering data wrangling, cleaning missing values, aggregations, statistical summaries, and interactive dashboards with Matplotlib and Seaborn.',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
      category: 'Data Science',
      tags: ['Data Science', 'Python', 'Pandas', 'Visualization', 'Analytics'],
      difficulty: 'Beginner',
      price: 0,
      isFree: true,
      currency: 'USD',
      estimatedDuration: '6 hours',
      learningObjectives: [
        'Clean messy real-world datasets using Pandas DataFrames',
        'Perform multi-index grouping and aggregations',
        'Generate publication-ready visualizations',
        'Conduct hypothesis testing and correlation analysis',
      ],
      prerequisites: ['None (Complete beginner friendly)'],
      status: 'published',
      approvalStatus: 'approved',
      averageRating: 4.8,
      totalReviews: 19,
      totalEnrolled: 89,
    });
    const c3_m1 = await Module.create({ courseId: course3._id, title: 'Module 1: Pandas Fundamentals', order: 1 });
    await Lesson.create({
      courseId: course3._id,
      moduleId: c3_m1._id,
      title: '1.1 DataFrame Ingestion and Inspection',
      type: 'video',
      videoUrl: 'https://www.youtube.com/embed/vmEHCJofslg',
      duration: 14,
      isRequired: true,
      order: 1,
      content: 'Loading CSV, JSON, and SQL sources into Pandas DataFrames and applying summary statistics.',
    });
    await Lesson.create({
      courseId: course3._id,
      moduleId: c3_m1._id,
      title: '1.2 Handling Missing Data & Outliers',
      type: 'video',
      videoUrl: 'https://www.youtube.com/embed/vmEHCJofslg',
      duration: 16,
      isRequired: true,
      order: 2,
      content: 'Techniques for imputation, dropping rows, and detecting statistical anomalies.',
    });

    // COURSE 4: Clean Architecture & TypeScript Design Patterns (Paid - $39)
    const course4 = await Course.create({
      instructor: instructor2._id,
      title: 'Clean Code & Domain-Driven Design in TypeScript',
      slug: 'clean-code-domain-driven-design-typescript',
      subtitle: 'Write scalable, testable, and maintainable software using modern design patterns.',
      description: 'Learn SOLID principles, Repository & Unit of Work patterns, Dependency Injection, and clean layering for mission-critical Node.js services.',
      thumbnail: 'https://images.unsplash.com/photo-1516116211227-bbc042971556?w=800&q=80',
      category: 'Programming',
      tags: ['TypeScript', 'Clean Code', 'Architecture', 'SOLID', 'Design Patterns'],
      difficulty: 'Advanced',
      price: 39,
      isFree: false,
      currency: 'USD',
      estimatedDuration: '10 hours',
      learningObjectives: [
        'Apply SOLID principles to TypeScript applications',
        'Implement Onion & Hexagonal architectures',
        'Refactor monolithic spaghetti into decoupled bounded contexts',
      ],
      prerequisites: ['Intermediate TypeScript / OOP knowledge'],
      status: 'published',
      approvalStatus: 'approved',
      averageRating: 4.95,
      totalReviews: 15,
      totalEnrolled: 62,
    });
    const c4_m1 = await Module.create({ courseId: course4._id, title: 'Module 1: The Core Principles', order: 1 });
    await Lesson.create({
      courseId: course4._id,
      moduleId: c4_m1._id,
      title: '1.1 The Single Responsibility & Inversion of Control',
      type: 'video',
      videoUrl: 'https://www.youtube.com/embed/v-XOK52b21U',
      duration: 20,
      isRequired: true,
      order: 1,
      content: 'Understanding why high coupling causes system brittleness and how dependency injection fixes it.',
    });

    // COURSE 5: Cybersecurity & Web Application Penetration Testing (Paid - $59)
    const course5 = await Course.create({
      instructor: instructor2._id,
      title: 'Defensive Security & Web Application Penetration Testing',
      slug: 'defensive-security-web-pentesting',
      subtitle: 'OWASP Top 10 vulnerabilities, secure headers, XSS prevention, and ethical hacking.',
      description: 'A comprehensive security handbook for developers and aspiring security analysts. Understand CSRF, SQL Injection, SSRF, JWT vulnerabilities, and secure coding practices.',
      thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
      category: 'Cybersecurity',
      tags: ['Security', 'Penetration Testing', 'OWASP', 'Ethical Hacking'],
      difficulty: 'Intermediate',
      price: 59,
      isFree: false,
      currency: 'USD',
      estimatedDuration: '12 hours',
      learningObjectives: [
        'Identify and remediate OWASP Top 10 vulnerabilities',
        'Perform static application security testing (SAST)',
        'Configure Content Security Policy (CSP) and CORS safely',
      ],
      prerequisites: ['Familiarity with web protocols and basic JavaScript'],
      status: 'published',
      approvalStatus: 'approved',
      averageRating: 4.9,
      totalReviews: 28,
      totalEnrolled: 94,
    });
    const c5_m1 = await Module.create({ courseId: course5._id, title: 'Module 1: Authentication Attacks & Defense', order: 1 });
    await Lesson.create({
      courseId: course5._id,
      moduleId: c5_m1._id,
      title: '1.1 Broken Object Level Authorization (BOLA)',
      type: 'video',
      videoUrl: 'https://www.youtube.com/embed/2_lswM1S264',
      duration: 18,
      isRequired: true,
      order: 1,
      content: 'BOLA remains the #1 API security vulnerability. Learn how attackers manipulate object IDs and how to enforce tenant-scoped verification.',
    });

    // COURSE 6: Figma & Modern UI/UX Design System (Free)
    const course6 = await Course.create({
      instructor: instructor1._id,
      title: 'Design Systems in Figma: From Wireframe to Interactive Prototype',
      slug: 'figma-design-systems-wireframe-prototype',
      subtitle: 'Create harmonious color palettes, typography scales, tokens, and responsive components.',
      description: 'Master auto-layout, component variants, interactive states, design tokens, and accessibility contrast standards to design world-class SaaS interfaces.',
      thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&q=80',
      category: 'Design & UX',
      tags: ['Figma', 'UI Design', 'UX Design', 'Design Systems', 'Prototyping'],
      difficulty: 'Beginner',
      price: 0,
      isFree: true,
      currency: 'USD',
      estimatedDuration: '5 hours',
      learningObjectives: [
        'Build scalable design systems with tokens and variables in Figma',
        'Master auto-layout and responsive constraints',
        'Create micro-interactions and animated prototypes',
      ],
      prerequisites: ['None (Beginner friendly)'],
      status: 'published',
      approvalStatus: 'approved',
      averageRating: 4.75,
      totalReviews: 31,
      totalEnrolled: 215,
    });
    const c6_m1 = await Module.create({ courseId: course6._id, title: 'Module 1: Foundations of Design Systems', order: 1 });
    await Lesson.create({
      courseId: course6._id,
      moduleId: c6_m1._id,
      title: '1.1 Typography, Color Scales and Spacing Tokens',
      type: 'video',
      videoUrl: 'https://www.youtube.com/embed/c9Wg6Cb_YlU',
      duration: 15,
      isRequired: true,
      order: 1,
      content: 'Setting up an 8-point grid, typographic hierarchies, and accessible contrast ratios.',
    });

    // COURSE 7: Cloud Native DevOps with Docker & AWS (Paid - $45)
    const course7 = await Course.create({
      instructor: instructor2._id,
      title: 'Cloud Native DevOps: Docker Containers, CI/CD & AWS Deployment',
      slug: 'cloud-native-devops-docker-cicd-aws',
      subtitle: 'Package, test, and deploy production microservices with zero downtime.',
      description: 'Practical DevOps engineering for modern teams. We construct multi-stage Dockerfiles, configure GitHub Actions pipelines, provision AWS ECS clusters, and monitor with CloudWatch.',
      thumbnail: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&q=80',
      category: 'Cloud Computing',
      tags: ['Docker', 'AWS', 'DevOps', 'CI/CD', 'Containers'],
      difficulty: 'Intermediate',
      price: 45,
      isFree: false,
      currency: 'USD',
      estimatedDuration: '11 hours',
      learningObjectives: [
        'Author optimized, non-root multi-stage Docker images',
        'Build continuous delivery pipelines with automated testing',
        'Deploy scalable containerized web apps on AWS',
      ],
      prerequisites: ['Basic Linux command line knowledge'],
      status: 'published',
      approvalStatus: 'approved',
      averageRating: 4.85,
      totalReviews: 22,
      totalEnrolled: 110,
    });
    const c7_m1 = await Module.create({ courseId: course7._id, title: 'Module 1: Docker Engineering', order: 1 });
    await Lesson.create({
      courseId: course7._id,
      moduleId: c7_m1._id,
      title: '1.1 Writing Lean Multi-Stage Dockerfiles',
      type: 'video',
      videoUrl: 'https://www.youtube.com/embed/gAkwW2tuIqE',
      duration: 17,
      isRequired: true,
      order: 1,
      content: 'Shrinking image sizes from 1.2GB down to 80MB using Alpine and multi-stage build artifacts.',
    });

    // COURSE 8: Tech Product Management & Agile Leadership (Paid - $29)
    const course8 = await Course.create({
      instructor: instructor1._id,
      title: 'Tech Product Management: From User Research to Product Launch',
      slug: 'tech-product-management-user-research-launch',
      subtitle: 'Build products users love. Prioritization frameworks, metrics, and roadmaps.',
      description: 'Equip yourself with the tools of top silicon valley PMs. Learn customer discovery interviews, OKRs, RICE prioritization, PRDs, and cross-functional agile leadership.',
      thumbnail: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&q=80',
      category: 'Business & Leadership',
      tags: ['Product Management', 'Agile', 'Leadership', 'Strategy', 'Business'],
      difficulty: 'All Levels',
      price: 29,
      isFree: false,
      currency: 'USD',
      estimatedDuration: '7 hours',
      learningObjectives: [
        'Write crisp Product Requirement Documents (PRDs)',
        'Quantify feature impact using RICE and Kano models',
        'Define North Star metrics and leading KPIs',
      ],
      prerequisites: ['No technical background required'],
      status: 'published',
      approvalStatus: 'approved',
      averageRating: 4.9,
      totalReviews: 14,
      totalEnrolled: 76,
    });
    const c8_m1 = await Module.create({ courseId: course8._id, title: 'Module 1: Discovery & Roadmapping', order: 1 });
    await Lesson.create({
      courseId: course8._id,
      moduleId: c8_m1._id,
      title: '1.1 Problem Framing & Hypothesis Validation',
      type: 'video',
      videoUrl: 'https://www.youtube.com/embed/502ILHjX9EE',
      duration: 14,
      isRequired: true,
      order: 1,
      content: 'Separating problem space from solution space and avoiding confirmation bias.',
    });

    console.log('[Seed] Creating Educational Resources (at least 10 items)...');
    const sampleResources = [
      {
        title: 'Complete Modern React 19 Cheat Sheet & Hook Reference',
        description: 'Comprehensive, high-density reference sheet detailing all modern React hooks, compiler directives, server components, and lifecycle transitions.',
        uploaderId: instructor2._id,
        fileUrl: '/uploads/react_19_cheatsheet.pdf',
        fileName: 'react_19_cheatsheet.pdf',
        fileType: 'pdf',
        fileSize: '2.4 MB',
        category: 'Web Development',
        tags: ['React', 'CheatSheet', 'Hooks', 'TypeScript'],
        access: 'public',
        isPublished: true,
        downloadCount: 412,
      },
      {
        title: 'Transformer Attention Mechanism Deep Dive: Slide Presentation',
        description: 'Illustrated deck breaking down Multi-Head Attention, Scaled Dot-Product math, Positional Encodings, and Flash Attention v2.',
        uploaderId: instructor1._id,
        fileUrl: '/uploads/transformer_attention_deck.pdf',
        fileName: 'transformer_attention_deck.pdf',
        fileType: 'presentation',
        fileSize: '5.8 MB',
        category: 'AI & Machine Learning',
        tags: ['AI', 'Transformers', 'Math', 'Slides'],
        access: 'public',
        isPublished: true,
        downloadCount: 520,
      },
      {
        title: 'Full-Stack Express & MongoDB Boilerplate Code Template',
        description: 'Clean, production-hardened template repository with JWT auth, Zod validation, role guards, and Winston logger ready to fork.',
        uploaderId: instructor2._id,
        fileUrl: '/uploads/express_mongo_starter.zip',
        fileName: 'express_mongo_starter.zip',
        fileType: 'code',
        fileSize: '1.1 MB',
        category: 'Web Development',
        tags: ['Boilerplate', 'Express', 'TypeScript', 'Starter'],
        access: 'public',
        isPublished: true,
        downloadCount: 380,
      },
      {
        title: 'Python Pandas Data Wrangling & Cleaning Practice Exercises',
        description: '15 real-world data cleaning problem statements with included raw datasets, test cases, and annotated solution notebooks.',
        uploaderId: instructor1._id,
        fileUrl: '/uploads/pandas_practice_exercises.pdf',
        fileName: 'pandas_practice_exercises.pdf',
        fileType: 'exercise',
        fileSize: '3.2 MB',
        category: 'Data Science',
        tags: ['Pandas', 'Python', 'Exercises', 'Data Cleaning'],
        access: 'public',
        isPublished: true,
        downloadCount: 295,
      },
      {
        title: 'OWASP Top 10 API Security Checklist for Backend Developers',
        description: 'Practical audit checklist covering broken object level authorization, rate limiting, SSRF defense, and secure cryptographic storage.',
        uploaderId: instructor2._id,
        fileUrl: '/uploads/owasp_api_security_checklist.pdf',
        fileName: 'owasp_api_security_checklist.pdf',
        fileType: 'notes',
        fileSize: '1.4 MB',
        category: 'Cybersecurity',
        tags: ['Security', 'Checklist', 'OWASP', 'API'],
        access: 'public',
        isPublished: true,
        downloadCount: 610,
      },
      {
        title: 'Figma Design System UI Kit & Design Tokens Template',
        description: 'Figma component library featuring 40+ accessible UI components, light/dark themes, auto-layout forms, and icon tokens.',
        uploaderId: instructor1._id,
        fileUrl: '/uploads/figma_design_tokens_kit.pdf',
        fileName: 'figma_design_tokens_kit.pdf',
        fileType: 'presentation',
        fileSize: '7.5 MB',
        category: 'Design & UX',
        tags: ['Figma', 'UI Kit', 'Tokens', 'Design System'],
        access: 'public',
        isPublished: true,
        downloadCount: 340,
      },
      {
        title: 'Docker & Kubernetes Production Deployment Handbook',
        description: 'Curated handbook detailing multi-stage container builds, security policies, ingress controllers, and secret management on AWS ECS/EKS.',
        uploaderId: instructor2._id,
        fileUrl: '/uploads/docker_k8s_handbook.pdf',
        fileName: 'docker_k8s_handbook.pdf',
        fileType: 'ebook',
        fileSize: '4.8 MB',
        category: 'Cloud Computing',
        tags: ['Docker', 'Kubernetes', 'DevOps', 'AWS'],
        access: 'public',
        isPublished: true,
        downloadCount: 489,
      },
      {
        title: 'Product Requirement Document (PRD) Template for Agile Teams',
        description: 'Field-tested PRD framework used by venture-backed startups and FAANG product managers to define scope, non-functional requirements, and success metrics.',
        uploaderId: instructor1._id,
        fileUrl: '/uploads/agile_prd_template.pdf',
        fileName: 'agile_prd_template.pdf',
        fileType: 'doc',
        fileSize: '850 KB',
        category: 'Business & Leadership',
        tags: ['PRD', 'Agile', 'Product Management', 'Template'],
        access: 'public',
        isPublished: true,
        downloadCount: 275,
      },
      {
        title: 'TypeScript Advanced Generics & Utility Types Reference Sheet',
        description: 'Concise guide to conditional types, template literal types, mapped types, infer keyword, and high-performance type utility helpers.',
        uploaderId: instructor2._id,
        fileUrl: '/uploads/advanced_typescript_generics.pdf',
        fileName: 'advanced_typescript_generics.pdf',
        fileType: 'notes',
        fileSize: '1.6 MB',
        category: 'Programming',
        tags: ['TypeScript', 'Generics', 'Reference', 'Advanced'],
        access: 'public',
        isPublished: true,
        downloadCount: 390,
      },
      {
        title: 'Machine Learning Math: Linear Algebra & Matrix Calculus Summary',
        description: 'Essential mathematical theorems, eigenvalues, gradient descent proofs, and partial differential equations required for ML research.',
        uploaderId: instructor1._id,
        fileUrl: '/uploads/ml_linear_algebra_notes.pdf',
        fileName: 'ml_linear_algebra_notes.pdf',
        fileType: 'notes',
        fileSize: '3.9 MB',
        category: 'AI & Machine Learning',
        tags: ['Math', 'Linear Algebra', 'Machine Learning', 'Calculus'],
        access: 'public',
        isPublished: true,
        downloadCount: 450,
      },
    ];
    await Resource.insertMany(sampleResources);

    console.log('[Seed] Creating Realistic Enrollments & Lesson Progress records...');
    // Emma Watson (student1):
    // 1. Enrolled in Course 1 (Full-Stack React & Node, 4 required lessons): Completed all 4 lessons -> 100% progress + Certificate!
    const c1_lessons = [c1_m1_l1, c1_m1_l2, c1_m2_l1, c1_m2_l2];
    for (const lesson of c1_lessons) {
      await LessonProgress.create({
        studentId: student1._id,
        courseId: course1._id,
        lessonId: lesson._id,
        isCompleted: true,
        completedAt: new Date(Date.now() - 3600000 * 24),
        lastAccessedAt: new Date(Date.now() - 3600000 * 20),
      });
    }

    // Pass final quiz for Course 1
    await QuizAttempt.create({
      studentId: student1._id,
      quizId: c1_quiz._id,
      courseId: course1._id,
      selectedAnswers: [1, 1, 0, 1], // all correct
      score: 100,
      totalQuestions: 4,
      correctAnswersCount: 4,
      passed: true,
    });

    // Create payment record for Emma's paid course
    const emmaPayment = await Payment.create({
      studentId: student1._id,
      courseId: course1._id,
      provider: 'mock_razorpay',
      transactionId: 'txn_mock_seed_emma_01',
      orderId: 'order_mock_seed_emma_01',
      amount: 49,
      currency: 'USD',
      status: 'completed',
      paymentMethod: 'Credit Card (Mock)',
      receiptUrl: 'https://checkout.sandbox/receipt/seed_01',
    });

    const emmaEnrollmentC1 = await Enrollment.create({
      studentId: student1._id,
      courseId: course1._id,
      status: 'completed',
      enrollmentDate: new Date(Date.now() - 3600000 * 24 * 7),
      lastAccessedLesson: c1_m2_l2._id,
      lastAccessedAt: new Date(Date.now() - 3600000 * 2),
      completedLessonsCount: 4,
      totalLessonsCount: 4,
      progressPercentage: 100,
      isCompleted: true,
      completionDate: new Date(Date.now() - 3600000 * 20),
      paymentId: emmaPayment._id,
    });

    // Certificate for Emma
    const certEmma = await Certificate.create({
      studentId: student1._id,
      courseId: course1._id,
      certificateId: 'CERT-DEMO-2026-EMMA99',
      studentName: student1.name,
      courseTitle: course1.title,
      instructorName: instructor2.name,
      issueDate: new Date(Date.now() - 3600000 * 20),
      grade: 'Excellence with High Honors',
      isValid: true,
    });

    // Emma enrolled in Course 2 (Deep Learning, 2 required lessons): Completed 1 lesson -> exactly 50%
    await LessonProgress.create({
      studentId: student1._id,
      courseId: course2._id,
      lessonId: c2_m1_l1._id,
      isCompleted: true,
      completedAt: new Date(),
      lastAccessedAt: new Date(),
    });
    await Enrollment.create({
      studentId: student1._id,
      courseId: course2._id,
      status: 'active',
      enrollmentDate: new Date(Date.now() - 3600000 * 48),
      lastAccessedLesson: c2_m1_l1._id,
      lastAccessedAt: new Date(),
      completedLessonsCount: 1,
      totalLessonsCount: 2,
      progressPercentage: 50,
      isCompleted: false,
    });

    // Liam Chen (student2):
    // Enrolled in Course 1 (completed 1 of 4 lessons -> 25%)
    await LessonProgress.create({
      studentId: student2._id,
      courseId: course1._id,
      lessonId: c1_m1_l1._id,
      isCompleted: true,
      completedAt: new Date(),
      lastAccessedAt: new Date(),
    });
    await Enrollment.create({
      studentId: student2._id,
      courseId: course1._id,
      status: 'active',
      enrollmentDate: new Date(Date.now() - 3600000 * 24),
      lastAccessedLesson: c1_m1_l1._id,
      lastAccessedAt: new Date(),
      completedLessonsCount: 1,
      totalLessonsCount: 4,
      progressPercentage: 25,
      isCompleted: false,
    });

    // Liam enrolled in Course 3 (0 of 2 lessons completed -> 0%)
    await Enrollment.create({
      studentId: student2._id,
      courseId: course3._id,
      status: 'active',
      enrollmentDate: new Date(),
      completedLessonsCount: 0,
      totalLessonsCount: 2,
      progressPercentage: 0,
      isCompleted: false,
    });

    // Reviews
    await Review.create({
      studentId: student1._id,
      courseId: course1._id,
      rating: 5,
      comment: 'Hands down the most articulate and high-quality course on modern React 19 and full-stack development. The architecture principles are top-tier!',
      status: 'approved',
    });

    await Review.create({
      studentId: student2._id,
      courseId: course2._id,
      rating: 5,
      comment: 'Finally understood self-attention mechanisms clearly! Dr. Sarah explains the matrix math with crystal clarity.',
      status: 'approved',
    });

    // Notifications
    await Notification.create({
      userId: student1._id,
      title: 'Certificate Ready! 🎓',
      message: `Your certificate for "${course1.title}" has been issued. ID: ${certEmma.certificateId}`,
      type: 'achievement',
      link: '/student/certificates',
    });

    console.log('[Seed] Seeding completed successfully!');
    console.log('--------------------------------------------------');
    console.log('DEMO ACCOUNTS CREATED:');
    console.log('Admin:      admin@oblivion.edu       / Admin@123456');
    console.log('Instructor: alex.dev@oblivion.edu   / Password@123');
    console.log('Instructor: sarah.dr@oblivion.edu   / Password@123');
    console.log('Student:    emma.watson@student.edu  / Password@123 (100% completed course + Certificate)');
    console.log('Student:    liam.chen@student.edu    / Password@123 (25% and 0% enrolled courses)');
    console.log('Public Cert ID: ' + certEmma.certificateId);
    console.log('--------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Database seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
