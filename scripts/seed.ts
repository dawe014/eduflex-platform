// File: scripts/seed.ts
const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

async function main() {
  try {
    // Clear existing data for a clean seed
    await db.userProgress.deleteMany();
    await db.review.deleteMany();
    await db.enrollment.deleteMany();
    await db.lesson.deleteMany();
    await db.chapter.deleteMany();
    await db.course.deleteMany();
    await db.category.deleteMany();
    console.log("🧹 Previous data cleared.");

    // Seed categories
    await db.category.createMany({
      data: [
        { name: "Web Development" },
        { name: "Data Science" },
        { name: "UI/UX Design" },
        { name: "Marketing" },
        { name: "Finance & Accounting" },
        { name: "Programming" },
        { name: "Design" },
        { name: "Cloud Computing" },
        { name: "Mobile Development" },
        { name: "Machine Learning" },
      ],
    });
    console.log("✅ Seeded categories successfully.");

    // Find an instructor
    const instructor = await db.user.findFirst({
      where: { role: "INSTRUCTOR" },
    });
    if (!instructor) {
      console.log("⚠️ No instructor found. Please create one first.");
      return;
    }
    console.log(`👨‍🏫 Seeding courses for instructor: ${instructor.email}`);

    // Web Development Category - Next.js Course
    const webDevCategory = await db.category.findUnique({
      where: { name: "Web Development" },
    });

    if (webDevCategory) {
      const nextJsCourse = await db.course.create({
        data: {
          instructorId: instructor.id,
          categoryId: webDevCategory.id,
          title: "The Ultimate Next.js 14 Course",
          description:
            "Master full-stack development with Next.js 14, building production-ready applications with modern tools and best practices.",
          imageUrl: "/images/course-nextjs.jpg",
          price: 49.99,
          isPublished: true,
          learnings: [
            "Develop full-stack applications using Next.js 14",
            "Leverage Server and Client Components effectively",
            "Implement secure authentication with NextAuth.js",
            "Integrate Prisma for type-safe database operations",
            "Deploy applications to Vercel with CI/CD pipelines",
            "Handle file uploads and process payments with Stripe",
            "Optimize performance with ISR and SSG",
          ],
          requirements: [
            "Basic knowledge of HTML, CSS, and JavaScript",
            "Familiarity with React (components, props, state, hooks)",
            "Node.js basics and npm/yarn package management",
          ],
          includes: [
            "15 hours of on-demand HD video content",
            "Downloadable source code and project templates",
            "Certificate of completion",
            "Lifetime access to course materials",
            "Access on mobile, tablet, and TV",
            "Exclusive community access for Q&A",
          ],
          chapters: {
            create: [
              {
                title: "Chapter 1: Getting Started",
                position: 1,
                isPublished: true,
                lessons: {
                  create: [
                    {
                      title: "Course Introduction and Overview",
                      description:
                        "Get an overview of the course structure, objectives, and what you'll build.",
                      position: 1,
                      isPublished: true,
                      videoUrl: "https://www.youtube.com/watch?v=intro_nextjs",
                      duration: "10:30",
                    },
                    {
                      title: "Setting Up Your Development Environment",
                      description:
                        "Install Node.js, VS Code, and set up a Next.js project.",
                      position: 2,
                      isPublished: true,
                      videoUrl: "https://www.youtube.com/watch?v=setup_nextjs",
                      duration: "15:45",
                    },
                    {
                      title: "Next.js Project Structure",
                      description:
                        "Explore the Next.js file structure and key configuration files.",
                      position: 3,
                      isPublished: true,
                      duration: "12:00",
                    },
                  ],
                },
              },
              {
                title: "Chapter 2: Core Concepts",
                position: 2,
                isPublished: true,
                lessons: {
                  create: [
                    {
                      title: "Understanding Server Components",
                      description:
                        "Learn how Server Components work and their benefits in Next.js.",
                      position: 1,
                      isPublished: true,
                      videoUrl:
                        "https://www.youtube.com/watch?v=server_components",
                      duration: "20:15",
                    },
                    {
                      title: "Routing with App Router",
                      description:
                        "Master the App Router for dynamic and static routing in Next.js.",
                      position: 2,
                      isPublished: true,
                      videoUrl: "https://www.youtube.com/watch?v=app_router",
                      duration: "18:50",
                    },
                    {
                      title: "Dynamic Routes and API Routes",
                      description:
                        "Create dynamic routes and serverless API endpoints in Next.js.",
                      position: 3,
                      isPublished: true,
                      duration: "15:20",
                    },
                  ],
                },
              },
              {
                title: "Chapter 3: Advanced Features",
                position: 3,
                isPublished: true,
                lessons: {
                  create: [
                    {
                      title: "Authentication with NextAuth.js",
                      description:
                        "Implement secure user authentication using NextAuth.js.",
                      position: 1,
                      isPublished: true,
                      videoUrl: "https://www.youtube.com/watch?v=nextauth",
                      duration: "25:00",
                    },
                    {
                      title: "Integrating Prisma ORM",
                      description:
                        "Connect your Next.js app to a database using Prisma.",
                      position: 2,
                      isPublished: true,
                      videoUrl: "https://www.youtube.com/watch?v=prisma_intro",
                      duration: "22:30",
                    },
                  ],
                },
              },
            ],
          },
        },
      });
      console.log(`📚 Created course: ${nextJsCourse.title}`);
    }

    // Programming Category - TypeScript Course
    const programmingCategory = await db.category.findUnique({
      where: { name: "Programming" },
    });
    if (programmingCategory) {
      const tsCourse = await db.course.create({
        data: {
          instructorId: instructor.id,
          categoryId: programmingCategory.id,
          title: "Advanced TypeScript for Professionals",
          description:
            "Elevate your TypeScript expertise with advanced techniques for building scalable and maintainable applications.",
          imageUrl: "/images/course-ts.jpg",
          price: 39.99,
          isPublished: true,
          learnings: [
            "Master advanced TypeScript types and interfaces",
            "Implement generic types and conditional types",
            "Use TypeScript with React and Node.js",
            "Write type-safe APIs with Express",
            "Optimize TypeScript for large codebases",
            "Debug complex TypeScript errors effectively",
          ],
          requirements: [
            "Basic JavaScript knowledge",
            "Familiarity with TypeScript basics",
            "Experience with Node.js or React is a plus",
          ],
          includes: [
            "10 hours of on-demand video",
            "Downloadable code examples and cheat sheets",
            "Certificate of completion",
            "Lifetime access to course materials",
            "Access on mobile and TV",
            "Exclusive TypeScript community access",
          ],
          chapters: {
            create: [
              {
                title: "Chapter 1: TypeScript Fundamentals",
                position: 1,
                isPublished: true,
                lessons: {
                  create: [
                    {
                      title: "Introduction to TypeScript",
                      description:
                        "Understand the basics of TypeScript and its benefits.",
                      position: 1,
                      isPublished: true,
                      videoUrl: "https://www.youtube.com/watch?v=ts_intro",
                      duration: "12:20",
                    },
                    {
                      title: "Setting Up TypeScript",
                      description:
                        "Install TypeScript and configure your development environment.",
                      position: 2,
                      isPublished: true,
                      videoUrl: "https://www.youtube.com/watch?v=ts_setup",
                      duration: "10:00",
                    },
                  ],
                },
              },
              {
                title: "Chapter 2: Advanced Types",
                position: 2,
                isPublished: true,
                lessons: {
                  create: [
                    {
                      title: "Generics and Conditional Types",
                      description:
                        "Learn to use generics and conditional types for flexible code.",
                      position: 1,
                      isPublished: true,
                      videoUrl: "https://www.youtube.com/watch?v=ts_generics",
                      duration: "18:40",
                    },
                    {
                      title: "Utility Types and Mapped Types",
                      description:
                        "Explore TypeScript's utility and mapped types for advanced typing.",
                      position: 2,
                      isPublished: true,
                      videoUrl: "https://www.youtube.com/watch?v=ts_utility",
                      duration: "15:25",
                    },
                  ],
                },
              },
            ],
          },
        },
      });
      console.log(`📚 Created course: ${tsCourse.title}`);
    }

    // Programming Category - Prisma Course
    if (programmingCategory) {
      const prismaCourse = await db.course.create({
        data: {
          instructorId: instructor.id,
          categoryId: programmingCategory.id,
          title: "Mastering Prisma ORM",
          description:
            "Learn to build efficient, type-safe database applications using Prisma ORM with real-world projects.",
          imageUrl: "/images/course-prisma.jpg",
          price: 29.99,
          isPublished: true,
          learnings: [
            "Set up Prisma with various databases",
            "Write type-safe database queries",
            "Handle database migrations with Prisma Migrate",
            "Integrate Prisma with Express and Next.js",
            "Optimize database performance",
            "Implement real-time features with Prisma",
          ],
          requirements: [
            "Basic JavaScript or TypeScript knowledge",
            "Familiarity with Node.js",
            "Basic understanding of relational databases",
          ],
          includes: [
            "8 hours of on-demand video",
            "Downloadable project files",
            "Certificate of completion",
            "Lifetime access to course materials",
            "Access on mobile and TV",
          ],
          chapters: {
            create: [
              {
                title: "Chapter 1: Prisma Basics",
                position: 1,
                isPublished: true,
                lessons: {
                  create: [
                    {
                      title: "What is Prisma?",
                      description:
                        "Introduction to Prisma ORM and its role in modern development.",
                      position: 1,
                      isPublished: true,
                      videoUrl: "https://www.youtube.com/watch?v=prisma_basics",
                      duration: "10:00",
                    },
                    {
                      title: "Setting Up Prisma",
                      description:
                        "Configure Prisma with your database and Node.js project.",
                      position: 2,
                      isPublished: true,
                      videoUrl: "https://www.youtube.com/watch?v=prisma_setup",
                      duration: "12:15",
                    },
                  ],
                },
              },
              {
                title: "Chapter 2: Advanced Prisma",
                position: 2,
                isPublished: true,
                lessons: {
                  create: [
                    {
                      title: "Database Migrations",
                      description:
                        "Learn to manage schema changes with Prisma Migrate.",
                      position: 1,
                      isPublished: true,
                      videoUrl:
                        "https://www.youtube.com/watch?v=prisma_migrations",
                      duration: "15:30",
                    },
                    {
                      title: "Prisma with REST APIs",
                      description: "Build REST APIs with Prisma and Express.",
                      position: 2,
                      isPublished: true,
                      videoUrl: "https://www.youtube.com/watch?v=prisma_rest",
                      duration: "20:00",
                    },
                  ],
                },
              },
            ],
          },
        },
      });
      console.log(`📚 Created course: ${prismaCourse.title}`);
    }

    // UI/UX Design Course
    const uiuxCategory = await db.category.findUnique({
      where: { name: "UI/UX Design" },
    });
    if (uiuxCategory) {
      const uiuxCourse = await db.course.create({
        data: {
          instructorId: instructor.id,
          categoryId: uiuxCategory.id,
          title: "Complete UI/UX Design Bootcamp",
          description:
            "Master UI/UX design principles, tools, and workflows to create user-friendly, visually appealing interfaces.",
          imageUrl: "/images/course-uiux.jpg",
          price: 34.99,
          isPublished: true,
          learnings: [
            "Understand core UI/UX design principles",
            "Create wireframes and prototypes with Figma",
            "Conduct user research and usability testing",
            "Design responsive interfaces for web and mobile",
            "Collaborate with developers for implementation",
            "Build a professional design portfolio",
          ],
          requirements: [
            "No prior design experience required",
            "Basic computer literacy",
            "Access to Figma or similar design tools",
          ],
          includes: [
            "12 hours of on-demand video",
            "Downloadable design assets and templates",
            "Certificate of completion",
            "Lifetime access to course materials",
            "Access on mobile and TV",
            "Exclusive design community access",
          ],
          chapters: {
            create: [
              {
                title: "Chapter 1: Introduction to UI/UX",
                position: 1,
                isPublished: true,
                lessons: {
                  create: [
                    {
                      title: "What is UI/UX Design?",
                      description:
                        "Learn the fundamentals of UI/UX design and its importance.",
                      position: 1,
                      isPublished: true,
                      videoUrl: "https://www.youtube.com/watch?v=uiux_intro",
                      duration: "8:45",
                    },
                    {
                      title: "Setting Up Figma",
                      description:
                        "Install and configure Figma for UI/UX design projects.",
                      position: 2,
                      isPublished: true,
                      videoUrl: "https://www.youtube.com/watch?v=figma_setup",
                      duration: "10:30",
                    },
                  ],
                },
              },
              {
                title: "Chapter 2: Design Fundamentals",
                position: 2,
                isPublished: true,
                lessons: {
                  create: [
                    {
                      title: "Color Theory and Typography",
                      description:
                        "Explore color theory and typography for effective designs.",
                      position: 1,
                      isPublished: true,
                      videoUrl: "https://www.youtube.com/watch?v=uiux_colors",
                      duration: "15:00",
                    },
                    {
                      title: "Creating Wireframes",
                      description:
                        "Learn to create wireframes for web and mobile interfaces.",
                      position: 2,
                      isPublished: true,
                      videoUrl:
                        "https://www.youtube.com/watch?v=uiux_wireframes",
                      duration: "12:20",
                    },
                  ],
                },
              },
            ],
          },
        },
      });
      console.log(`📚 Created course: ${uiuxCourse.title}`);
    }

    // Data Science Category - Python for Data Science
    const dataScienceCategory = await db.category.findUnique({
      where: { name: "Data Science" },
    });
    if (dataScienceCategory) {
      const dataScienceCourse = await db.course.create({
        data: {
          instructorId: instructor.id,
          categoryId: dataScienceCategory.id,
          title: "Python for Data Science",
          description:
            "Learn Python programming for data analysis, visualization, and machine learning with real-world datasets.",
          imageUrl: "/images/course-datascience.jpg",
          price: 44.99,
          isPublished: true,
          learnings: [
            "Master Python for data analysis",
            "Work with Pandas and NumPy for data manipulation",
            "Create stunning visualizations with Matplotlib and Seaborn",
            "Build machine learning models with Scikit-learn",
            "Handle large datasets efficiently",
            "Apply data science techniques to real-world problems",
          ],
          requirements: [
            "Basic programming knowledge",
            "Familiarity with Python basics is a plus",
            "A computer with Python installed",
          ],
          includes: [
            "14 hours of on-demand video",
            "Downloadable datasets and notebooks",
            "Certificate of completion",
            "Lifetime access to course materials",
            "Access on mobile and TV",
          ],
          chapters: {
            create: [
              {
                title: "Chapter 1: Python Basics for Data Science",
                position: 1,
                isPublished: true,
                lessons: {
                  create: [
                    {
                      title: "Introduction to Data Science",
                      description:
                        "Understand the role of Python in data science workflows.",
                      position: 1,
                      isPublished: true,
                      videoUrl:
                        "https://www.youtube.com/watch?v=datascience_intro",
                      duration: "10:00",
                    },
                    {
                      title: "Setting Up Python Environment",
                      description:
                        "Install Python, Jupyter, and essential data science libraries.",
                      position: 2,
                      isPublished: true,
                      videoUrl: "https://www.youtube.com/watch?v=python_setup",
                      duration: "12:00",
                    },
                  ],
                },
              },
              {
                title: "Chapter 2: Data Analysis with Pandas",
                position: 2,
                isPublished: true,
                lessons: {
                  create: [
                    {
                      title: "Pandas DataFrames and Series",
                      description:
                        "Learn to manipulate data using Pandas DataFrames and Series.",
                      position: 1,
                      isPublished: true,
                      videoUrl: "https://www.youtube.com/watch?v=pandas_intro",
                      duration: "15:30",
                    },
                    {
                      title: "Data Cleaning and Preparation",
                      description:
                        "Master techniques for cleaning and preparing datasets.",
                      position: 2,
                      isPublished: true,
                      videoUrl: "https://www.youtube.com/watch?v=data_cleaning",
                      duration: "18:00",
                    },
                  ],
                },
              },
            ],
          },
        },
      });
      console.log(`📚 Created course: ${dataScienceCourse.title}`);
    }

    console.log("🎉 Success! Database has been seeded.");
  } catch (error) {
    console.error("❌ Error seeding the database:", error);
  } finally {
    await db.$disconnect();
  }
}

main();
