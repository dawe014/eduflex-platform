"use client";

import { useEffect, useState } from "react";

export function useScroll(threshold: number = 50) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > threshold);
    };

    // Initial check in case user is already scrolled
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return scrolled;
}
