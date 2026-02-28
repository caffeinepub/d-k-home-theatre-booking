import React from 'react';
import { CheckCircle, Calendar, Clock, Ticket, User, Phone, Film } from 'lucide-react';
import type { Screening, Seat } from '../backend';
import { Button } from '@/components/ui/button';

interface BookingSummaryProps {
  screening: Screening;
  selectedSeats: Seat[];
  customerName: string;
  contactInfo: string;
  reservationId: string;
  onDone: () => void;
}

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BookingSummary({
  screening,
  selectedSeats,
  customerName,
  contactInfo,
  reservationId,
  onDone,
}: BookingSummaryProps) {
  return (
    <div className="space-y-6 text-center">
      {/* Success icon */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center shadow-gold-lg">
          <CheckCircle className="w-9 h-9 text-theatre-dark" />
        </div>
        <div>
          <h3 className="font-display text-2xl font-bold text-gold">Booking Confirmed!</h3>
          <p className="text-sm text-muted-foreground mt-1">Your reservation is pending confirmation</p>
        </div>
      </div>

      {/* Ticket card */}
      <div className="theatre-card rounded-xl overflow-hidden text-left">
        {/* Ticket header */}
        <div className="gold-gradient px-5 py-3 flex items-center gap-2">
          <Film className="w-4 h-4 text-theatre-dark" />
          <span className="font-display font-bold text-theatre-dark text-sm">D.K Home Theatre</span>
        </div>

        {/* Ticket body */}
        <div className="p-5 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Film</p>
            <p className="font-display text-lg font-semibold text-foreground">{screening.title}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Date
              </p>
              <p className="text-sm text-foreground">{formatDate(screening.date)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Time
              </p>
              <p className="text-sm text-foreground">{screening.time}</p>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
              <Ticket className="w-3 h-3" /> Seats
            </p>
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
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-gold-dim" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
                <User className="w-3 h-3" /> Name
              </p>
              <p className="text-sm text-foreground">{customerName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3" /> Contact
              </p>
              <p className="text-sm text-foreground">{contactInfo}</p>
            </div>
          </div>

          <div className="bg-theatre-dark rounded-md px-3 py-2">
            <p className="text-xs text-muted-foreground">Reservation ID</p>
            <p className="text-xs font-mono text-gold-dim truncate">{reservationId}</p>
          </div>
        </div>
      </div>

      <Button
        onClick={onDone}
        className="w-full gold-gradient text-theatre-dark font-semibold hover:opacity-90"
      >
        Back to Screenings
      </Button>
    </div>
  );
}
