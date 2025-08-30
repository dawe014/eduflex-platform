"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

// Define the data for your slides
const slides = [
  {
    id: 1,
    image: "/images/hero-bg-1.png",
    title: "Unlock Your Potential with Expert-Led Courses",
    description:
      "Dive into a world of knowledge and master new skills at your own pace.",
    buttonText: "Browse Courses",
    buttonLink: "/courses",
  },
  {
    id: 2,
    image: "/images/hero-bg-2.png",
    title: "Learn from the Best, Anywhere, Anytime",
    description:
      "Access high-quality education from industry leaders around the globe.",
    buttonText: "Start Learning Now",
    buttonLink: "/courses",
  },
  {
    id: 3,
    image: "/images/hero-bg-3.png",
    title: "Your Journey to Success Starts Here",
    description:
      "Empower yourself with practical skills and career-advancing knowledge.",
    buttonText: "Discover Categories",
    buttonLink: "#categories",
  },
];

export const HeroSlider = () => {
  return (
    <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
      <Swiper
        modules={[Pagination, Autoplay, EffectFade]}
        effect="fade"
        spaceBetween={0}
        slidesPerView={1}
        pagination={{
          clickable: true,
          bulletClass: "swiper-pagination-bullet !bg-white/50 !w-3 !h-3 !mx-1",
          bulletActiveClass: "swiper-pagination-bullet-active !bg-white !w-8",
        }}
        autoplay={{
          delay: 12000,
          disableOnInteraction: false,
        }}
        loop={true}
        speed={1000}
        className="w-full h-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-full">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={slide.id === 1}
                className="object-cover brightness-[0.4]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-9 to-purple-9" />
              <div className="absolute inset-0 flex items-center justify-center text-center p-6">
                <div className="max-w-4xl text-white z-10 space-y-6">
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight drop-shadow-2xl">
                    {slide.title}
                  </h1>
                  <p className="text-xl md:text-2xl text-blue-100/90 font-light max-w-2xl mx-auto">
                    {slide.description}
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-lg transition-all duration-300 shadow-2xl px-8 py-6 text-lg font-semibold rounded-xl"
                  >
                    <Link href={slide.buttonLink}>{slide.buttonText}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
