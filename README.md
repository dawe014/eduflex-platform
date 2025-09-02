# 🎓 EduFlex – Full-Stack Online Learning Platform

**[➡️ View Live Demo](https://[YOUR_VERCEL_APP_URL].vercel.app/)**

![EduFlex Platform Showcase](https://[LINK_TO_YOUR_PROJECT_GIF_OR_A_GOOD_SCREENSHOT].png)

---

## 🌍 Overview

EduFlex is a **production-ready, full-stack online learning platform** built with a modern tech stack. It provides a seamless and interactive experience for **students, instructors, and administrators**, serving as a complete solution for online education.

This project demonstrates expertise in:

- Complex database design
- Multi-role authentication
- Secure payment integration
- CMS for course creation
- Data-driven dashboards
- Modern responsive UI design

---

## ✨ Key Features

### 👨‍🎓 **Student Features**

- Browse courses with **search & category filters**
- **Detailed course pages** with syllabus, requirements, and instructor bio
- **Secure payments** via **Stripe Checkout**
- Interactive **video player with progress tracking**
- **Wishlist** feature for later enrollment
- Submit and view **course reviews**
- Personalized **student dashboard**

### 🧑‍🏫 **Instructor Features**

- **Role-based dashboard** for instructors
- **Course creation wizard** (multi-step)
- **CMS for content management**:

  - Organize chapters & lessons
  - Drag-and-drop reordering
  - Add learning objectives, requirements, and resources
  - Secure video uploads via **UploadThing**

- **Analytics dashboard** (revenue, enrollments, performance charts)

### 👑 **Admin Features**

- **Global platform overview** with key metrics
- Manage **users and roles (STUDENT / INSTRUCTOR / ADMIN)**
- **Course moderation** (approve, unpublish, delete)
- **Content moderation** for reported content
- **Internal messaging system** for contact form submissions
- **Platform settings** (e.g., enable/disable registrations)

### 🧪 **Other Features**

- **Automated tests** using **Vitest**
- Fully **responsive design**
- **Skeleton loading states** for better UX

---

## 🛠️ Tech Stack

| Category          | Technology                                                                                                 |
| ----------------- | ---------------------------------------------------------------------------------------------------------- |
| **Framework**     | ![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white) |
| **Styling**       | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)    |
| **UI Components** | **Shadcn/UI** (Radix UI + Tailwind CSS)                                                                    |
| **Database**      | ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)   |
| **ORM**           | **Prisma**                                                                                                 |
| **Auth**          | **NextAuth.js**                                                                                            |
| **Payments**      | ![Stripe](https://img.shields.io/badge/Stripe-6772E5?style=for-the-badge&logo=stripe&logoColor=white)      |
| **File Uploads**  | **UploadThing**                                                                                            |
| **Charts**        | **Recharts**                                                                                               |
| **Testing**       | ![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)      |
| **Deployment**    | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)      |

---

## 🚀 Getting Started

### ✅ Prerequisites

- Node.js (v18 or later)
- npm or yarn
- MongoDB (Atlas or local instance)
- API keys for:

  - **Stripe**
  - **NextAuth.js** (Google provider)
  - **UploadThing**

### 🔧 Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/dawe014/eduflex-platform.git
   cd eduflex-platform
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **Set up environment variables:**

   - Create `.env` file in the root directory
   - Copy `.env.example` contents and fill in:

     ```env
     DATABASE_URL="..."
     NEXTAUTH_URL="http://localhost:3000"
     NEXTAUTH_SECRET="..."

     GOOGLE_CLIENT_ID="..."
     GOOGLE_CLIENT_SECRET="..."

     STRIPE_API_KEY="..."
     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="..."
     STRIPE_WEBHOOK_SECRET="..."

     UPLOADTHING_SECRET="..."
     UPLOADTHING_APP_ID="..."
     ```

4. **Push Prisma schema to DB:**

   ```sh
   npx prisma db push
   ```

5. **(Optional) Seed the database:**

   ```sh
   npm run seed
   ```

   > **Note:** You must manually create one user and set them as `INSTRUCTOR` before running the seed script.

6. **Run the development server:**

   ```sh
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Tests

Run all tests:

```sh
npm run test
```

Run with interactive UI:

```sh
npm run test:ui
```

---

## 📞 Contact

**Dawit Tamiru** – \[dawittamiru014@gmail.com(mailto:dawittamiru014@gmail.com)]
**Project Link:** [https://github.com/dawe014/eduflex-platform](https://github.com/dawe014/eduflex-platform)
