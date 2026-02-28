import React, { useMemo } from 'react';
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

export default function SeatMap({ screeningId, selectedSeatIds, onToggleSeat, readOnly = false }: SeatMapProps) {
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
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />

        <div className="relative z-10 px-4 py-6">
          {/* Screen */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="screen-glow rounded-sm mb-2"
              style={{
                width: '70%',
                maxWidth: '500px',
                height: '10px',
                background: 'linear-gradient(90deg, transparent 0%, oklch(0.85 0.15 200) 20%, oklch(0.95 0.1 200) 50%, oklch(0.85 0.15 200) 80%, transparent 100%)',
                borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
              }}
            />
            <div
              className="flex items-center justify-center rounded-sm"
              style={{
                width: '65%',
                maxWidth: '480px',
                height: '6px',
                background: 'linear-gradient(90deg, transparent, oklch(0.78 0.18 200 / 0.6), transparent)',
              }}
            />
            <span
              className="mt-2 text-xs tracking-[0.4em] uppercase font-bold"
              style={{ color: 'oklch(0.78 0.18 200 / 0.8)' }}
            >
              ◀ SCREEN ▶
            </span>
          </div>

          {/* Seat rows */}
          <div className="space-y-2 overflow-x-auto pb-2">
            {sortedRows.map((row) => {
              const seats = rows.get(row) || [];
              return (
                <div key={row} className="flex items-center gap-2 justify-center min-w-max mx-auto">
                  {/* Row label left */}
                  <span
                    className="text-xs font-bold w-6 text-right flex-shrink-0"
                    style={{ color: 'oklch(0.78 0.12 85 / 0.8)', fontFamily: 'monospace' }}
                  >
                    {row}
                  </span>

                  {/* Seats */}
                  <div className="flex gap-1.5">
                    {seats.map((seat) => {
                      const isSelected = selectedSeatIds.includes(seat.id);
                      const iconStatus = toIconStatus(seat.status, isSelected);
                      return (
                        <SeatIcon
                          key={seat.id}
                          seatLabel={`${seat.row}${Number(seat.number)}`}
                          status={iconStatus}
                          size={seatSize}
                          onClick={
                            !readOnly && seat.status === SeatStatus.available
                              ? () => onToggleSeat(seat.id)
                              : undefined
                          }
                        />
                      );
                    })}
                  </div>

                  {/* Row label right */}
                  <span
                    className="text-xs font-bold w-6 flex-shrink-0"
                    style={{ color: 'oklch(0.78 0.12 85 / 0.8)', fontFamily: 'monospace' }}
                  >
                    {row}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div
        className="flex flex-wrap items-center justify-center gap-4 text-xs py-3 px-4 rounded-xl"
        style={{ background: 'oklch(0.12 0 0)', border: '1px solid oklch(0.22 0.02 85 / 0.4)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded cinema-seat-available" style={{ border: '1.5px solid oklch(0.65 0.22 145)' }} />
          <span className="text-muted-foreground">Available ({availableCount})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded cinema-seat-selected" />
          <span className="text-muted-foreground">Selected ({selectedSeatIds.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded cinema-seat-reserved" />
          <span className="text-muted-foreground">Reserved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded cinema-seat-booked" />
          <span className="text-muted-foreground">Booked</span>
        </div>
      </div>
    </div>
  );
}
