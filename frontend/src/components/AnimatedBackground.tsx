import React, { useMemo } from 'react';

const LETTERS = [
  '🎬', '🍿', '🎭', '⭐', '🎪', '🎠', '🌟', '🎡',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
  '★', '♦', '♠', '♣', '♥', '✦', '✧', '◆',
  '🎟', '🎥', '🎦', '🎶', '🎵', '🎸', '🎺', '🎻',
];

const CANDY_COLORS = [
  'oklch(0.72 0.28 350)',  // hot pink
  'oklch(0.82 0.25 140)',  // lime green
  'oklch(0.75 0.22 55)',   // orange
  'oklch(0.78 0.18 200)',  // cyan
  'oklch(0.88 0.22 95)',   // yellow
  'oklch(0.65 0.25 300)',  // purple
  'oklch(0.65 0.25 25)',   // red
  'oklch(0.78 0.12 85)',   // gold
];

const ANIMATIONS = [
  'candy-float',
  'candy-spin-bounce',
  'candy-wobble',
  'candy-pulse-color',
  'candy-jump',
  'candy-drift',
];

interface LetterConfig {
  id: number;
  char: string;
  color: string;
  animation: string;
  duration: number;
  delay: number;
  size: number;
  top: number;
  left: number;
  opacity: number;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export default function AnimatedBackground() {
  const letters = useMemo<LetterConfig[]>(() => {
    const rand = seededRandom(42);
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      char: LETTERS[Math.floor(rand() * LETTERS.length)],
      color: CANDY_COLORS[Math.floor(rand() * CANDY_COLORS.length)],
      animation: ANIMATIONS[Math.floor(rand() * ANIMATIONS.length)],
      duration: 3 + rand() * 6,
      delay: rand() * 5,
      size: 18 + Math.floor(rand() * 36),
      top: rand() * 100,
      left: rand() * 100,
      opacity: 0.35 + rand() * 0.45,
    }));
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
      style={{ zIndex: 0 }}
    >
      {letters.map((letter) => (
        <span
          key={letter.id}
          className="candy-letter"
          style={{
            top: `${letter.top}%`,
            left: `${letter.left}%`,
            color: letter.color,
            fontSize: `${letter.size}px`,
            opacity: letter.opacity,
            animation: `${letter.animation} ${letter.duration}s ease-in-out ${letter.delay}s infinite`,
          }}
        >
          {letter.char}
        </span>
      ))}
    </div>
  );
}
