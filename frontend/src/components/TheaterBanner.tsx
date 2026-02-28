import React from 'react';
import { Film, Star, Sparkles } from 'lucide-react';

export default function TheaterBanner() {
  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: '420px' }}>
      {/* Blurred hero backdrop */}
      <img
        src="/assets/generated/theatre-banner-hero.dim_1400x500.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center scale-110"
        style={{ filter: 'blur(8px) brightness(0.4)', transform: 'scale(1.1)' }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />

      {/* Fallback gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, oklch(0.22 0.08 85 / 0.8) 0%, oklch(0.08 0 0) 70%)',
          zIndex: 1,
        }}
      />

      {/* Cinematic gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(8,8,8,0.2) 0%, rgba(8,8,8,0.4) 50%, rgba(8,8,8,0.92) 100%)',
          zIndex: 2,
        }}
      />

      {/* Film strip top border */}
      <div
        className="absolute top-0 left-0 right-0 h-8 flex items-center overflow-hidden"
        style={{ zIndex: 3, background: 'oklch(0.06 0 0)' }}
      >
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 mx-1 rounded-sm"
            style={{
              width: '28px',
              height: '18px',
              background: 'oklch(0.18 0 0)',
              border: '1px solid oklch(0.3 0 0)',
            }}
          />
        ))}
      </div>

      {/* Film strip bottom border */}
      <div
        className="absolute bottom-0 left-0 right-0 h-8 flex items-center overflow-hidden"
        style={{ zIndex: 3, background: 'oklch(0.06 0 0)' }}
      >
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 mx-1 rounded-sm"
            style={{
              width: '28px',
              height: '18px',
              background: 'oklch(0.18 0 0)',
              border: '1px solid oklch(0.3 0 0)',
            }}
          />
        ))}
      </div>

      {/* Main banner image (sharp, centered) */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ zIndex: 2, paddingTop: '32px', paddingBottom: '32px' }}
      >
        <img
          src="/assets/generated/dk-theatre-banner.dim_1200x400.png"
          alt="D.K Home Theatre"
          className="h-full w-auto max-w-full object-contain"
          style={{ maxHeight: '280px', opacity: 0.85 }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      </div>

      {/* Content overlay */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
        style={{ zIndex: 4, paddingTop: '40px', paddingBottom: '40px' }}
      >
        {/* Premium badge */}
        <div
          className="flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full"
          style={{
            background: 'oklch(0.78 0.12 85 / 0.15)',
            border: '1px solid oklch(0.78 0.12 85 / 0.5)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <Star className="w-3.5 h-3.5 fill-current" style={{ color: 'oklch(0.88 0.22 95)' }} />
          <span className="text-xs tracking-[0.3em] uppercase font-medium" style={{ color: 'oklch(0.88 0.22 95)' }}>
            Premium Experience
          </span>
          <Star className="w-3.5 h-3.5 fill-current" style={{ color: 'oklch(0.88 0.22 95)' }} />
        </div>

        {/* Main title with neon glow */}
        <h1
          className="font-display text-4xl sm:text-5xl md:text-7xl font-bold mb-3 leading-tight"
          style={{
            color: 'oklch(0.95 0.02 85)',
            textShadow: '0 0 30px oklch(0.78 0.12 85 / 0.8), 0 0 60px oklch(0.78 0.12 85 / 0.4), 0 4px 8px rgba(0,0,0,0.8)',
          }}
        >
          D.K Home Theatre
        </h1>

        <p
          className="text-sm sm:text-base tracking-widest uppercase font-light mb-5"
          style={{
            color: 'oklch(0.78 0.12 85)',
            textShadow: '0 0 15px oklch(0.78 0.12 85 / 0.6)',
          }}
        >
          Special Screenings & Private Events
        </p>

        {/* Decorative divider */}
        <div className="flex items-center gap-4">
          <div className="h-px w-20" style={{ background: 'linear-gradient(to right, transparent, oklch(0.78 0.12 85 / 0.8))' }} />
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" style={{ color: 'oklch(0.78 0.12 85)' }} />
            <Film className="w-5 h-5" style={{ color: 'oklch(0.78 0.12 85)' }} />
            <Sparkles className="w-4 h-4" style={{ color: 'oklch(0.78 0.12 85)' }} />
          </div>
          <div className="h-px w-20" style={{ background: 'linear-gradient(to left, transparent, oklch(0.78 0.12 85 / 0.8))' }} />
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-6 mt-5">
          {[
            { label: 'Private Hall', icon: '🎭' },
            { label: '4K Projection', icon: '📽️' },
            { label: 'Dolby Sound', icon: '🔊' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 text-xs" style={{ color: 'oklch(0.75 0.05 85)' }}>
              <span>{item.icon}</span>
              <span className="tracking-wide">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
