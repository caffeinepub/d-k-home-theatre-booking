import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import {
  useGetSeatPlan,
  useAddSeat,
  useRemoveSeat,
  useToggleSeatStatus,
  useCreateSeatPlan,
} from '../../hooks/useQueries';
import { type Seat, SeatStatus } from '../../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface SeatPlanEditorProps {
  screeningId: string;
}

function getSeatStatusColor(status: SeatStatus): string {
  if (status === SeatStatus.available) return 'border-gold text-gold bg-theatre-gold/10';
  if (status === SeatStatus.reserved) return 'border-theatre-grey text-theatre-grey bg-theatre-grey/10';
  return 'border-theatre-red text-theatre-red bg-theatre-red/10';
}

export default function SeatPlanEditor({ screeningId }: SeatPlanEditorProps) {
  const { data: seatPlanEntries = [], isLoading, error } = useGetSeatPlan(screeningId);
  const addSeat = useAddSeat();
  const removeSeat = useRemoveSeat();
  const toggleSeatStatus = useToggleSeatStatus();
  const createSeatPlan = useCreateSeatPlan();

  const [newRow, setNewRow] = useState('A');
  const [newCount, setNewCount] = useState('8');
  const [addingRow, setAddingRow] = useState(false);

  const rows = useMemo(() => {
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

  const handleInitSeatPlan = async () => {
    try {
      await createSeatPlan.mutateAsync(screeningId);
      toast.success('Seat plan initialized');
    } catch {
      // Already exists, ignore
    }
  };

  const handleAddRow = async () => {
    const row = newRow.trim().toUpperCase();
    const count = parseInt(newCount, 10);
    if (!row || isNaN(count) || count < 1 || count > 30) {
      toast.error('Enter a valid row label and seat count (1–30)');
      return;
    }
    if (rows.has(row)) {
      toast.error(`Row ${row} already exists`);
      return;
    }

    setAddingRow(true);
    try {
      for (let i = 1; i <= count; i++) {
        const seat: Seat = {
          id: `${screeningId}-${row}${i}`,
          row,
          number: BigInt(i),
          status: SeatStatus.available,
        };
        await addSeat.mutateAsync({ screeningId, seat });
      }
      toast.success(`Row ${row} added with ${count} seats`);
      // Suggest next row letter
      const nextChar = String.fromCharCode(row.charCodeAt(0) + 1);
      setNewRow(nextChar);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add row');
    } finally {
      setAddingRow(false);
    }
  };

  const handleRemoveSeat = async (seatId: string) => {
    try {
      await removeSeat.mutateAsync({ screeningId, seatId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove seat');
    }
  };

  const handleToggle = async (seatId: string) => {
    try {
      await toggleSeatStatus.mutateAsync({ screeningId, seatId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to toggle seat');
    }
  };

  const handleRemoveRow = async (row: string) => {
    const seats = rows.get(row) || [];
    try {
      for (const seat of seats) {
        await removeSeat.mutateAsync({ screeningId, seatId: seat.id });
      }
      toast.success(`Row ${row} removed`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove row');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gold" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 space-y-3">
        <p className="text-muted-foreground text-sm">Seat plan not found for this screening.</p>
        <Button
          onClick={handleInitSeatPlan}
          size="sm"
          className="gold-gradient text-theatre-dark font-semibold"
          disabled={createSeatPlan.isPending}
        >
          {createSeatPlan.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Initialize Seat Plan'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Add row controls */}
      <div className="theatre-card rounded-lg p-4 space-y-3">
        <h4 className="text-sm font-medium text-gold">Add Row</h4>
        <div className="flex gap-2 items-end">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Row Label</Label>
            <Input
              value={newRow}
              onChange={(e) => setNewRow(e.target.value.toUpperCase().slice(0, 2))}
              placeholder="A"
              className="w-16 bg-theatre-dark border-gold-dim focus:border-gold text-center font-mono uppercase"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Seats</Label>
            <Input
              type="number"
              min={1}
              max={30}
              value={newCount}
              onChange={(e) => setNewCount(e.target.value)}
              className="w-20 bg-theatre-dark border-gold-dim focus:border-gold text-center"
            />
          </div>
          <Button
            onClick={handleAddRow}
            disabled={addingRow}
            size="sm"
            className="gold-gradient text-theatre-dark font-semibold"
          >
            {addingRow ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-1" />Add Row</>}
          </Button>
        </div>
      </div>

      {/* Seat grid */}
      {sortedRows.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No seats yet. Add a row above to get started.
        </div>
      ) : (
        <div className="space-y-3">
          {sortedRows.map((row) => {
            const seats = rows.get(row) || [];
            return (
              <div key={row} className="theatre-card rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gold font-mono">Row {row}</span>
                  <button
                    onClick={() => handleRemoveRow(row)}
                    className="text-xs text-muted-foreground hover:text-theatre-red transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove Row
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {seats.map((seat) => (
                    <div key={seat.id} className="group relative">
                      <div
                        className={`w-10 h-10 rounded-t-lg border text-xs font-bold flex items-center justify-center transition-all ${getSeatStatusColor(seat.status)}`}
                      >
                        {Number(seat.number)}
                      </div>
                      {/* Hover actions */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:flex gap-0.5 bg-theatre-dark border border-gold-dim rounded p-0.5 z-10">
                        <button
                          onClick={() => handleToggle(seat.id)}
                          title={seat.status === SeatStatus.available ? 'Mark as booked' : 'Mark as available'}
                          className="p-1 hover:text-gold text-muted-foreground transition-colors"
                        >
                          {seat.status === SeatStatus.available
                            ? <ToggleLeft className="w-3 h-3" />
                            : <ToggleRight className="w-3 h-3 text-gold" />
                          }
                        </button>
                        <button
                          onClick={() => handleRemoveSeat(seat.id)}
                          title="Remove seat"
                          className="p-1 hover:text-theatre-red text-muted-foreground transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {seats.filter(s => s.status === SeatStatus.available).length} available / {seats.length} total
                </p>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Hover over a seat to toggle availability or remove it
      </p>
    </div>
  );
}
