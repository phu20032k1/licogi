"use client";

import { useEffect } from "react";

export default function HorizontalScrollReset() {
  useEffect(() => {
    const resetX = () => {
      document.documentElement.scrollLeft = 0;
      document.body.scrollLeft = 0;
      if (window.scrollX !== 0) {
        window.scrollTo({ left: 0, top: window.scrollY, behavior: "auto" });
      }
    };

    resetX();
    const frame = window.requestAnimationFrame(resetX);
    const timer = window.setTimeout(resetX, 80);

    window.addEventListener("pageshow", resetX);
    window.addEventListener("resize", resetX);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      window.removeEventListener("pageshow", resetX);
      window.removeEventListener("resize", resetX);
    };
  }, []);

  return null;
}
