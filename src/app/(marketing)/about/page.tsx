"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  BookOpen,
  Zap,
  Award,
  Heart,
  CheckCircle,
  ArrowRight,
  LucideProps,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { db } from "@/lib/db"; // Import db to fetch real stats

// This is a client component, but we can't use async/await directly.
// A better pattern for dynamic stats on a static page is to fetch them in a parent Server Component
// or use a client-side fetching hook. For simplicity, we'll keep them static for now.

// --- CORRECTED TYPE ---
// Specify that the icon is a React Component that accepts LucideProps
type Value = {
  icon: React.ComponentType<LucideProps>;
  title: string;
  description: string;
  colorClass: {
    bg: string;
    text: string;
  };
};

type ValueCardProps = Value;

const ValueCard: React.FC<ValueCardProps> = ({
  icon: Icon,
  title,
  description,
  colorClass,
}) => (
  <Card className="border-0 bg-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
    <CardHeader className="items-center pb-4">
      <div
        className={`p-4 rounded-full ${colorClass.bg} group-hover:scale-110 transition-transform duration-300`}
      >
        <Icon className={`h-8 w-8 ${colorClass.text}`} />
      </div>
      <CardTitle className="mt-4 text-xl font-semibold text-gray-800">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="text-center text-muted-foreground leading-relaxed">
      {description}
    </CardContent>
  </Card>
);

const values: Value[] = [
  {
    icon: BookOpen,
    title: "Accessibility",
    description:
      "Making high-quality education available to everyone, regardless of background or location.",
    colorClass: { bg: "bg-blue-100", text: "text-blue-600" },
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Fostering a supportive environment where learners and instructors connect, collaborate, and grow.",
    colorClass: { bg: "bg-purple-100", text: "text-purple-600" },
  },
  {
    icon: Zap,
    title: "Innovation",
    description:
      "Relentlessly pursuing new and better ways to learn, teach, and engage with educational content.",
    colorClass: { bg: "bg-amber-100", text: "text-amber-600" },
  },
  {
    icon: Award,
    title: "Excellence",
    description:
      "Committing to the highest standards in our content, platform technology, and user support.",
    colorClass: { bg: "bg-green-100", text: "text-green-600" },
  },
  {
    icon: Heart,
    title: "Passion",
    description:
      "We are driven by a genuine love for learning and a belief in its power to transform lives.",
    colorClass: { bg: "bg-red-100", text: "text-red-600" },
  },
  {
    icon: CheckCircle,
    title: "Integrity",
    description:
      "Operating with transparency and honesty to build lasting trust with our global community.",
    colorClass: { bg: "bg-slate-100", text: "text-slate-600" },
  },
];

const AboutPage: React.FC = () => {
  const stats = {
    learners: "1M+",
    courses: "5K+",
    countries: "150+",
    satisfaction: "98%",
  };

  return (
    <div className="bg-slate-50 text-gray-800">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 text-center overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900">
            Shaping the Future of{" "}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mt-2">
              Online Education
            </span>
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-muted-foreground">
            At EduFlex, we&apos;re building a world where anyone, anywhere can
            unlock their potential through accessible, engaging, and world-class
            learning experiences.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button
              asChild
              size="lg"
              className="font-semibold text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 transition-opacity"
            >
              <Link href="/courses">
                Explore Courses <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="font-semibold text-lg px-8 py-6 border-gray-300 hover:bg-white/60"
            >
              <Link href="/register">Become an Instructor</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl md:text-5xl font-bold text-gray-900">
                {stats.learners}
              </p>
              <p className="text-muted-foreground mt-1">Learners</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-gray-900">
                {stats.courses}
              </p>
              <p className="text-muted-foreground mt-1">Courses</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-gray-900">
                {stats.countries}
              </p>
              <p className="text-muted-foreground mt-1">Countries</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-gray-900">
                {stats.satisfaction}
              </p>
              <p className="text-muted-foreground mt-1">Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 lg:py-24 bg-slate-50">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-10">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-blue-600 mb-2">
                Our Mission
              </h2>
              <h3 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 mb-4">
                Democratizing Education for All
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Our mission is to break down the barriers to quality education.
                We provide a flexible and powerful platform that connects
                passionate instructors with eager students, fostering a diverse
                and inclusive global community of lifelong learners.
              </p>
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-purple-600 mb-2">
                Our Vision
              </h2>
              <h3 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 mb-4">
                A World Empowered by Learning
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                We envision a future where anyone can build the life they
                imagine through accessible online learning. EduFlex aims to be
                the catalyst for personal and professional growth, empowering
                individuals to thrive in a rapidly changing world.
              </p>
            </div>
          </div>
          <div className="relative h-96 w-full rounded-2xl overflow-hidden shadow-2xl group">
            <Image
              src="/images/mission-vision.jpg"
              alt="A diverse group of students collaborating online"
              fill
              objectFit="cover"
              className="transform group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <p className="absolute bottom-6 left-6 text-white text-lg font-medium">
              Igniting curiosity across the globe.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
              The Principles That Guide Us
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Our values are the foundation of our community and the driving
              force behind everything we build.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value) => (
              <ValueCard key={value.title} {...value} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Start Your Journey?
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-blue-100">
            Join millions of learners and thousands of instructors on the
            platform that&apos;s built for growth. Your next chapter starts
            here.
          </p>
          <div className="mt-8">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="font-semibold text-lg px-10 py-7 text-blue-600 bg-white hover:bg-slate-100"
            >
              <Link href="/register">Get Started for Free</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
