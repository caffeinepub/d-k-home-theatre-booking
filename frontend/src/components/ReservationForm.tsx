import React, { useState, useRef, useCallback } from 'react';
import { useMakeReservation } from '../hooks/useQueries';
import { type Screening, type Seat, ReservationStatus } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, Ticket, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ReservationFormProps {
  screening: Screening;
  selectedSeatIds: string[];
  seatPlanEntries: [string, Seat][];
  onSuccess: (reservationId: string, customerName: string, contactInfo: string) => void;
  onCancel: () => void;
}

export default function ReservationForm({
  screening,
  selectedSeatIds,
  seatPlanEntries,
  onSuccess,
  onCancel,
}: ReservationFormProps) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [errors, setErrors] = useState<{ name?: string; contact?: string }>({});
  const isSubmittingRef = useRef(false);
  const lastSubmitRef = useRef(0);

  const makeReservation = useMakeReservation();

  const selectedSeats = seatPlanEntries
    .filter(([id]) => selectedSeatIds.includes(id))
    .map(([, seat]) => seat);

  const validate = () => {
    const newErrors: { name?: string; contact?: string } = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!contact.trim()) newErrors.contact = 'Contact info is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate submissions within 500ms
    const now = Date.now();
    if (isSubmittingRef.current || now - lastSubmitRef.current < 500) {
      return;
    }

    if (!validate()) return;

    isSubmittingRef.current = true;
    lastSubmitRef.current = now;

    const reservationId = `${screening.id}-${Date.now()}`;
    const reservation = {
      customerName: name.trim(),
      contactInfo: contact.trim(),
      screeningId: screening.id,
      seatIds: selectedSeatIds,
      status: ReservationStatus.pending,
    };

    try {
      await makeReservation.mutateAsync({ reservationId, reservation });
      onSuccess(reservationId, name.trim(), contact.trim());
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Reservation failed';
      toast.error(msg.includes('not available') ? 'Some seats are no longer available. Please re-select.' : msg);
    } finally {
      isSubmittingRef.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, contact, screening.id, selectedSeatIds, makeReservation, onSuccess]);

  const isPending = makeReservation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="theatre-card rounded-lg p-4 space-y-2">
        <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Selected Seats</h4>
        <div className="flex flex-wrap gap-2">
          {selectedSeats.map((seat) => (
            <span
              key={seat.id}
              className="px-2.5 py-1 rounded text-xs font-bold border border-gold text-gold bg-theatre-gold/10"
            >
              {seat.row}{Number(seat.number)}
            </span>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {selectedSeatIds.length} seat{selectedSeatIds.length !== 1 ? 's' : ''} selected
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-sm text-foreground flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-gold" />
          Full Name
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          disabled={isPending}
          className="bg-theatre-surface border-gold-dim focus:border-gold text-foreground placeholder:text-muted-foreground"
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact" className="text-sm text-foreground flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-gold" />
          Contact Info
        </Label>
        <Input
          id="contact"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Phone number or email"
          disabled={isPending}
          className="bg-theatre-surface border-gold-dim focus:border-gold text-foreground placeholder:text-muted-foreground"
        />
        {errors.contact && <p className="text-xs text-destructive">{errors.contact}</p>}
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 border-gold-dim text-muted-foreground hover:text-foreground"
          disabled={isPending}
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={isPending || selectedSeatIds.length === 0}
          className="flex-1 gold-gradient text-theatre-dark font-semibold hover:opacity-90"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Confirming…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Ticket className="w-4 h-4" />
              Confirm Booking
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}
