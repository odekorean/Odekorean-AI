"use client";

import { useMemo } from "react";

// Signature visual: Hangul jamo (ㄱㄴㄷ...) rendered as glowing nodes connected
// by faint lines — visualizing how Korean is built from simple blocks that
// combine into syllables, which is literally what the app teaches.
const JAMO = ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅎ", "ㅏ", "ㅓ"];

export function HangulConstellation() {
  const nodes = useMemo(
    () =>
      JAMO.map((char, i) => ({
        char,
        x: 8 + ((i * 37) % 84),
        y: 10 + ((i * 53) % 70),
        delay: i * 0.15,
      })),
    []
  );

  return (
    <div className="relative mx-auto h-56 w-full max-w-3xl" aria-hidden>
      <svg className="absolute inset-0 h-full w-full">
        {nodes.slice(1).map((n, i) => (
          <line
            key={i}
            x1={`${nodes[i].x}%`}
            y1={`${nodes[i].y}%`}
            x2={`${n.x}%`}
            y2={`${n.y}%`}
            stroke="url(#line-gradient)"
            strokeWidth="1"
            opacity="0.35"
          />
        ))}
        <defs>
          <linearGradient id="line-gradient">
            <stop offset="0%" stopColor="#0A5CFF" />
            <stop offset="100%" stopColor="#E0362E" />
          </linearGradient>
        </defs>
      </svg>
      {nodes.map((n, i) => (
        <span
          key={i}
          className="absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white font-kr text-base font-bold text-graphite shadow-soft animate-rise"
          style={{ left: `${n.x}%`, top: `${n.y}%`, animationDelay: `${n.delay}s` }}
        >
          {n.char}
        </span>
      ))}
    </div>
  );
}
