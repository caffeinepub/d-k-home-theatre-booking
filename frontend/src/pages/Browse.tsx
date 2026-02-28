import React from 'react';
import TheaterBanner from '../components/TheaterBanner';
import ScreeningList from '../components/ScreeningList';
import AnimatedBackground from '../components/AnimatedBackground';
import type { Screening } from '../backend';

interface BrowseProps {
  onSelectScreening: (screening: Screening) => void;
}

export default function Browse({ onSelectScreening }: BrowseProps) {
  return (
    <div className="relative">
      {/* Animated candy background — behind everything */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <AnimatedBackground />
      </div>

      {/* Content above animated background */}
      <div className="relative" style={{ zIndex: 1 }}>
        <TheaterBanner />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-px flex-1 bg-gold-dim opacity-40" />
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-gold">Upcoming Screenings</h2>
              <div className="h-px flex-1 bg-gold-dim opacity-40" />
            </div>
            <p className="text-center text-muted-foreground text-sm">
              Select a screening to view the seat map and make your reservation
            </p>
          </div>

          <ScreeningList onSelectScreening={onSelectScreening} />
        </div>
      </div>
    </div>
  );
}
