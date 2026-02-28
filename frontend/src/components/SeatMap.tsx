import React, { useMemo, memo } from 'react';
import { useGetSeatPlan } from '../hooks/useQueries';
import { type Seat, SeatStatus } from '../backend';
import { Skeleton } from '@/components/ui/skeleton';
import SeatIcon from './SeatIcon';
import type { SeatStatus as SeatIconStatus } from './SeatIcon';

interface SeatMapProps {
  screeningId: string;
  selectedSeatIds: string[];
  onToggleSeat: (seatId: string) => void;
  readOnly?: boolean;
}

function toIconStatus(status: SeatStatus, isSelected: boolean): SeatIconStatus {
  if (isSelected) return 'selected';
  if (status === SeatStatus.reserved) return 'reserved';
  if (status === SeatStatus.booked) return 'booked';
  return 'available';
}

const SeatMap = memo(function SeatMap({ screeningId, selectedSeatIds, onToggleSeat, readOnly = false }: SeatMapProps) {
  const { data: seatPlanEntries, isLoading, error } = useGetSeatPlan(screeningId);

  const rows = useMemo(() => {
    if (!seatPlanEntries) return new Map<string, Seat[]>();
    const map = new Map<string, Seat[]>();
    for (const [, seat] of seatPlanEntries) {
      const existing = map.get(seat.row) || [];
      existing.push(seat);
      map.set(seat.row, existing);
    }
    for (const [row, seats] of map) {
      map.set(row, seats.sort((a, b) => Number(a.number) - Number(b.number)));
    }
    return map;
  }, [seatPlanEntries]);

  const sortedRows = useMemo(() => Array.from(rows.keys()).sort(), [rows]);

  if (isLoading) {
    return (
      <div className="space-y-3 py-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-2 justify-center">
            {Array.from({ length: 10 }).map((_, j) => (
              <Skeleton key={j} className="w-9 h-9 rounded bg-theatre-grey/20" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Failed to load seat plan. Please try again.</p>
      </div>
    );
  }

  if (sortedRows.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <p className="text-sm">No seats configured for this screening yet.</p>
      </div>
    );
  }

  const availableCount = seatPlanEntries?.filter(([, s]) => s.status === SeatStatus.available).length ?? 0;

  // Determine seat size based on max seats per row
  const maxSeatsInRow = Math.max(...sortedRows.map((r) => (rows.get(r) || []).length));
  const seatSize = maxSeatsInRow > 14 ? 30 : maxSeatsInRow > 10 ? 34 : 38;

  return (
    <div className="space-y-4">
      {/* Cinema hall container */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, oklch(0.18 0.04 250 / 0.5) 0%, oklch(0.06 0 0) 70%)',
          border: '1px solid oklch(0.25 0.02 250 / 0.5)',
          minHeight: '300px',
        }}
      >
        {/* Background image */}
        <img
          src="/assets/generated/cinema-hall-bg.dim_1200x700.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />

        <div className="relative z-10 p-6">
          {/* Screen */}
          <div className="mb-8 text-center">
            <div
              className="mx-auto rounded-sm"
              style={{
                width: '70%',
                height: '6px',
                background: 'linear-gradient(90deg, transparent, oklch(0.85 0.15 85 / 0.8), transparent)',
                boxShadow: '0 0 30px oklch(0.85 0.15 85 / 0.5), 0 0 60px oklch(0.85 0.15 85 / 0.2)',
              }}
            />
            <p className="text-xs text-muted-foreground mt-2 tracking-widest uppercase opacity-60">Screen</p>
          </div>

          {/* Seat rows */}
          <div className="space-y-2">
            {sortedRows.map((rowLabel) => {
              const seats = rows.get(rowLabel) || [];
              return (
                <div key={rowLabel} className="flex items-center gap-2 justify-center">
                  <span
                    className="text-xs font-bold w-5 text-center flex-shrink-0"
                    style={{ color: 'oklch(0.65 0.12 85 / 0.7)' }}
                  >
                    {rowLabel}
                  </span>
                  <div className="flex gap-1 flex-wrap justify-center">
                    {seats.map((seat) => {
                      const isSelected = selectedSeatIds.includes(seat.id);
                      const iconStatus = toIconStatus(seat.status, isSelected);
                      const canClick = !readOnly && seat.status === SeatStatus.available;
                      return (
                        <SeatIcon
                          key={seat.id}
                          seatLabel={`${seat.row}${Number(seat.number)}`}
                          status={iconStatus}
                          size={seatSize}
                          onClick={canClick ? () => onToggleSeat(seat.id) : undefined}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-sm cinema-seat cinema-seat-available inline-block" style={{ position: 'relative', display: 'inline-block' }} />
          Available ({availableCount})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-sm cinema-seat cinema-seat-selected inline-block" style={{ position: 'relative', display: 'inline-block' }} />
          Selected ({selectedSeatIds.length})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-sm cinema-seat cinema-seat-reserved inline-block" style={{ position: 'relative', display: 'inline-block' }} />
          Reserved
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-sm cinema-seat cinema-seat-booked inline-block" style={{ position: 'relative', display: 'inline-block' }} />
          Booked
        </span>
      </div>
    </div>
  );
});

export default SeatMap;
