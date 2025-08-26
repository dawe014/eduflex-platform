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

    // Web Development Course (Next.js)
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
            "Learn to build full-stack applications with the latest version of Next.js.",
          imageUrl: "/images/course-nextjs.jpg",
          price: 49.99,
          isPublished: true,
          chapters: {
            create: [
              {
                title: "Chapter 1: Introduction",
                position: 1,
                isPublished: true,
                lessons: {
                  create: [
                    {
                      title: "Welcome to the course",
                      position: 1,
                      isPublished: true,
                      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                    },
                    {
                      title: "Setting up your environment",
                      position: 2,
                      isPublished: true,
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
                      position: 1,
                      isPublished: true,
                    },
                    {
                      title: "Routing with the App Router",
                      position: 2,
                      isPublished: true,
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
          description: "Take your TypeScript skills to the next level.",
          imageUrl: "/images/course-ts.jpg",
          price: 39.99,
          isPublished: true,
        },
      });
      console.log(`📚 Created course: ${tsCourse.title}`);
    }

    // Add Prisma Course in Programming Category
    if (programmingCategory) {
      const prismaCourse = await db.course.create({
        data: {
          instructorId: instructor.id,
          categoryId: programmingCategory.id,
          title: "Mastering Prisma ORM",
          description:
            "Learn how to integrate Prisma ORM for database management in modern applications.",
          imageUrl: "/images/course-prisma.jpg",
          price: 29.99,
          isPublished: true,
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
            "Become a professional UI/UX designer by mastering tools and design principles.",
          imageUrl: "/images/course-uiux.jpg",
          price: 34.99,
          isPublished: true,
        },
      });
      console.log(`📚 Created course: ${uiuxCourse.title}`);
    }

    console.log("🎉 Success! Database has been seeded.");
  } catch (error) {
    console.error("❌ Error seeding the database:", error);
  } finally {
    await db.$disconnect();
  }
}

main();
