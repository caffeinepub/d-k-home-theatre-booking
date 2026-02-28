import React, { useMemo } from 'react';
import { useGetAllReservations, useConfirmReservation, useCancelReservation } from '../../hooks/useQueries';
import { type Reservation, ReservationStatus } from '../../backend';
import { CheckCircle, XCircle, User, Phone, Ticket, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ReservationManagerProps {
  screeningId: string;
}

function StatusBadge({ status }: { status: ReservationStatus }) {
  if (status === ReservationStatus.confirmed) {
    return <Badge className="bg-green-900/30 text-green-400 border-green-700/50 text-xs">Confirmed</Badge>;
  }
  if (status === ReservationStatus.cancelled) {
    return <Badge className="bg-theatre-red/20 text-theatre-red border-theatre-red/40 text-xs">Cancelled</Badge>;
  }
  return <Badge className="bg-theatre-gold/10 text-gold border-gold/40 text-xs">Pending</Badge>;
}

export default function ReservationManager({ screeningId }: ReservationManagerProps) {
  // Use getAllReservations so we have the actual reservation IDs (needed for confirm/cancel)
  const { data: allReservations = [], isLoading } = useGetAllReservations();
  const confirmReservation = useConfirmReservation();
  const cancelReservation = useCancelReservation();

  // Filter to only reservations for this screening, preserving the [id, reservation] tuple
  const screeningReservations = useMemo<[string, Reservation][]>(() => {
    return allReservations.filter(([, res]) => res.screeningId === screeningId);
  }, [allReservations, screeningId]);

  const handleConfirm = async (res: Reservation, id: string) => {
    try {
      await confirmReservation.mutateAsync({ id, screeningId });
      toast.success(`Reservation confirmed for ${res.customerName}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to confirm reservation');
    }
  };

  const handleCancel = async (res: Reservation, id: string) => {
    try {
      await cancelReservation.mutateAsync({ id, screeningId });
      toast.success(`Reservation cancelled for ${res.customerName}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to cancel reservation');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-gold" />
      </div>
    );
  }

  if (screeningReservations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No reservations for this screening yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {screeningReservations.map(([resId, res]) => {
        const isConfirming = confirmReservation.isPending && confirmReservation.variables?.id === resId;
        const isCancelling = cancelReservation.isPending && cancelReservation.variables?.id === resId;
        const isActionPending = isConfirming || isCancelling;

        return (
          <div key={resId} className="theatre-card rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-gold" />
                  <span className="font-medium text-sm text-foreground">{res.customerName}</span>
                  <StatusBadge status={res.status} />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Phone className="w-3 h-3" />
                  {res.contactInfo}
                </div>
                <div className="text-xs text-muted-foreground/60 font-mono">
                  ID: {resId}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Ticket className="w-3.5 h-3.5 text-gold flex-shrink-0" />
              {res.seatIds.map((seatId) => {
                const parts = seatId.split('-');
                const label = parts[parts.length - 1];
                return (
                  <span
                    key={seatId}
                    className="px-2 py-0.5 rounded text-xs font-bold border border-gold text-gold bg-theatre-gold/10"
                  >
                    {label}
                  </span>
                );
              })}
            </div>

            {res.status === ReservationStatus.pending && (
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  onClick={() => handleConfirm(res, resId)}
                  disabled={isActionPending || confirmReservation.isPending || cancelReservation.isPending}
                  className="flex-1 bg-green-900/30 text-green-400 border border-green-700/50 hover:bg-green-900/50 text-xs"
                >
                  {isConfirming ? (
                    <><Loader2 className="w-3 h-3 animate-spin mr-1" />Confirming...</>
                  ) : (
                    <><CheckCircle className="w-3 h-3 mr-1" />Confirm</>
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleCancel(res, resId)}
                  disabled={isActionPending || confirmReservation.isPending || cancelReservation.isPending}
                  className="flex-1 bg-theatre-red/20 text-theatre-red border border-theatre-red/40 hover:bg-theatre-red/30 text-xs"
                >
                  {isCancelling ? (
                    <><Loader2 className="w-3 h-3 animate-spin mr-1" />Cancelling...</>
                  ) : (
                    <><XCircle className="w-3 h-3 mr-1" />Cancel</>
                  )}
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
