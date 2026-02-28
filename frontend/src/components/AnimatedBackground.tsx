import React, { useMemo, memo } from 'react';

const LETTERS = [
  '🎬', '🍿', '🎭', '⭐', '🎪', '🎠', '🌟', '🎡',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
  '★', '♦', '♠', '♣', '♥', '✦', '✧', '◆',
  '🎟', '🎥', '🎦', '🎶', '🎵', '🎸', '🎺', '🎻',
];

// Vibrant cinematic multi-color palette
const CANDY_COLORS = [
  'oklch(0.65 0.28 300)',  // deep violet
  'oklch(0.55 0.30 290)',  // electric purple
  'oklch(0.72 0.25 195)',  // electric teal
  'oklch(0.65 0.22 200)',  // deep cyan
  'oklch(0.58 0.26 25)',   // vivid crimson
  'oklch(0.65 0.28 15)',   // hot red
  'oklch(0.78 0.20 75)',   // warm amber
  'oklch(0.72 0.22 60)',   // golden orange
  'oklch(0.55 0.28 250)',  // midnight blue
  'oklch(0.62 0.25 260)',  // cobalt blue
  'oklch(0.72 0.28 350)',  // hot pink
  'oklch(0.82 0.22 140)',  // lime green
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

const AnimatedBackground = memo(function AnimatedBackground() {
  const letters = useMemo<LetterConfig[]>(() => {
    const rand = seededRandom(42);
    return Array.from({ length: 48 }, (_, i) => ({
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
      {/* Multi-color radial glow blobs */}
      <div
        className="absolute"
        style={{
          top: '10%', left: '5%', width: '35%', height: '40%',
          background: 'radial-gradient(ellipse, oklch(0.55 0.30 290 / 0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute"
        style={{
          top: '50%', right: '5%', width: '30%', height: '35%',
          background: 'radial-gradient(ellipse, oklch(0.65 0.22 200 / 0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: '10%', left: '30%', width: '40%', height: '30%',
          background: 'radial-gradient(ellipse, oklch(0.58 0.26 25 / 0.10) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute"
        style={{
          top: '30%', left: '50%', width: '25%', height: '30%',
          background: 'radial-gradient(ellipse, oklch(0.78 0.20 75 / 0.10) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

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
});

export default AnimatedBackground;
