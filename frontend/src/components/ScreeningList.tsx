import React from 'react';
import { Calendar, Clock, Film, ChevronRight, Image, Sparkles } from 'lucide-react';
import { useGetAllScreenings } from '../hooks/useQueries';
import type { Screening } from '../backend';
import { Skeleton } from '@/components/ui/skeleton';

interface ScreeningListProps {
  onSelectScreening: (screening: Screening) => void;
}

function formatShortDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  const date = new Date(ms);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getYear(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).getFullYear().toString();
}

const NEON_BORDERS = [
  { border: '1px solid oklch(0.78 0.18 200 / 0.6)', shadow: '0 0 20px oklch(0.78 0.18 200 / 0.3)' },
  { border: '1px solid oklch(0.78 0.12 85 / 0.7)', shadow: '0 0 20px oklch(0.78 0.12 85 / 0.35)' },
  { border: '1px solid oklch(0.72 0.28 350 / 0.6)', shadow: '0 0 20px oklch(0.72 0.28 350 / 0.3)' },
];

export default function ScreeningList({ onSelectScreening }: ScreeningListProps) {
  const { data: screenings, isLoading, error } = useGetAllScreenings();

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="theatre-card rounded-xl overflow-hidden">
            <Skeleton className="h-72 w-full bg-theatre-grey/20 rounded-none" />
            <div className="p-5 space-y-3">
              <Skeleton className="h-6 w-3/4 bg-theatre-grey/20" />
              <Skeleton className="h-4 w-1/2 bg-theatre-grey/20" />
              <Skeleton className="h-10 w-full bg-theatre-grey/20 mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <Film className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-40" />
        <p className="text-muted-foreground">Failed to load screenings. Please try again.</p>
      </div>
    );
  }

  if (!screenings || screenings.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 rounded-full bg-theatre-surface border border-gold-dim flex items-center justify-center mx-auto mb-6">
          <Film className="w-10 h-10 text-gold opacity-60" />
        </div>
        <h3 className="font-display text-2xl text-gold mb-2">No Screenings Yet</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Check back soon for upcoming special screenings and private events.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {screenings.map((screening, idx) => {
        const hasPoster = screening.posterImages && screening.posterImages.length > 0;
        const posterUrl = hasPoster ? screening.posterImages[0] : null;
        const neon = NEON_BORDERS[idx % NEON_BORDERS.length];

        return (
          <article
            key={screening.id}
            className="rounded-xl overflow-hidden group cursor-pointer flex flex-col transition-all duration-300 screening-card-hover"
            style={{
              background: 'oklch(0.14 0 0)',
              border: neon.border,
              boxShadow: neon.shadow,
            }}
            onClick={() => onSelectScreening(screening)}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px) scale(1.02)';
              (e.currentTarget as HTMLElement).style.boxShadow = neon.shadow.replace('0.3)', '0.7)').replace('0.35)', '0.7)');
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = '';
              (e.currentTarget as HTMLElement).style.boxShadow = neon.shadow;
            }}
          >
            {/* Poster area */}
            <div className="relative w-full overflow-hidden bg-theatre-dark" style={{ aspectRatio: '2/3', maxHeight: '320px' }}>
              {posterUrl ? (
                <>
                  <img
                    src={posterUrl}
                    alt={`${screening.title} poster`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  {/* Fallback */}
                  <div className="absolute inset-0 items-center justify-center bg-theatre-dark hidden" aria-hidden="true">
                    <Film className="w-16 h-16 text-gold opacity-20" />
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-theatre-dark">
                  <Film className="w-16 h-16 text-gold opacity-20 mb-3" />
                  <span className="text-xs text-muted-foreground">No Poster</span>
                </div>
              )}

              {/* Cinematic gradient overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to bottom, transparent 40%, oklch(0.08 0 0 / 0.7) 80%, oklch(0.08 0 0) 100%)',
                }}
              />

              {/* Title overlay on poster */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3
                  className="font-display text-xl font-bold leading-tight line-clamp-2"
                  style={{
                    color: 'oklch(0.97 0.02 85)',
                    textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.7)',
                  }}
                >
                  {screening.title}
                </h3>
              </div>

              {/* Sparkle badge */}
              <div
                className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: 'oklch(0.78 0.12 85 / 0.9)',
                  color: 'oklch(0.1 0 0)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <Sparkles className="w-3 h-3" />
                Live
              </div>
            </div>

            {/* Date badge strip */}
            <div className="gold-gradient px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-theatre-dark" />
                <span className="text-theatre-dark font-bold text-sm">
                  {formatShortDate(screening.date)}
                </span>
                <span className="text-theatre-dark/70 text-xs">{getYear(screening.date)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-theatre-dark/80 text-xs font-medium">
                <Clock className="w-3.5 h-3.5" />
                {screening.time}
              </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
              {screening.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                  {screening.description}
                </p>
              )}

              <button
                className="w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 mt-auto"
                style={{
                  background: 'oklch(0.78 0.12 85 / 0.12)',
                  border: '1px solid oklch(0.78 0.12 85 / 0.5)',
                  color: 'oklch(0.78 0.12 85)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'oklch(0.78 0.12 85 / 0.25)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'oklch(0.78 0.12 85 / 0.12)';
                }}
              >
                Book Tickets
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
