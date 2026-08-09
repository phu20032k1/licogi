"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

const clips = [
  { title: "Công trường", subtitle: "Tổ chức thi công", fragment: "#t=0,4" },
  { title: "Thiết bị", subtitle: "Năng lực triển khai", fragment: "#t=4,8" },
  { title: "Quy trình", subtitle: "Kiểm soát thực hiện", fragment: "#t=8,12" },
] as const;

export default function PublicVideoRail() {
  const railRef = useRef<HTMLDivElement>(null);

  function move(direction: -1 | 1) {
    railRef.current?.scrollBy({ left: direction * 230, behavior: "smooth" });
  }

  return (
    <section className="public-video-rail" aria-label="Video năng lực LICOGI 18.3">
      <div className="public-video-rail-head">
        <div><span>Video năng lực</span><strong>Hiện trường · thiết bị · quy trình</strong></div>
        <div className="public-video-rail-controls">
          <button type="button" onClick={() => move(-1)} aria-label="Video trước"><ChevronLeft size={15} /></button>
          <button type="button" onClick={() => move(1)} aria-label="Video tiếp theo"><ChevronRight size={15} /></button>
        </div>
      </div>
      <div ref={railRef} className="public-video-rail-track">
        {clips.map((clip, index) => (
          <article key={clip.title} className="public-video-clip">
            <div className="public-video-clip-media">
              <video controls playsInline preload="metadata" poster="/media/hero-construction.svg">
                <source src={`/videos/licogi183-digital-intro.mp4${clip.fragment}`} type="video/mp4" />
              </video>
              <span>{String(index + 1).padStart(2, "0")}</span>
            </div>
            <div className="public-video-clip-copy"><Play size={13} /><span><b>{clip.title}</b><small>{clip.subtitle}</small></span></div>
          </article>
        ))}
      </div>
    </section>
  );
}
