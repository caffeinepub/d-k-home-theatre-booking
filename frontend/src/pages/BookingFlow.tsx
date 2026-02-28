import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock, Film } from 'lucide-react';
import type { Screening, Seat } from '../backend';
import { useGetSeatPlan } from '../hooks/useQueries';
import SeatMap from '../components/SeatMap';
import ReservationForm from '../components/ReservationForm';
import MediaSection from '../components/MediaSection';
import FoodItems, { type SelectedFoodItem } from './FoodItems';
import BillReceipt from './BillReceipt';

type Step = 'select-seats' | 'fill-form' | 'food-items' | 'bill-receipt';

interface BookingFlowProps {
  screening: Screening;
  onBack: () => void;
}

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

const STEP_LABELS = ['Select Seats', 'Your Details', 'Food & Drinks', 'Receipt'];
const STEPS: Step[] = ['select-seats', 'fill-form', 'food-items', 'bill-receipt'];

export default function BookingFlow({ screening, onBack }: BookingFlowProps) {
  const [step, setStep] = useState<Step>('select-seats');
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [reservationId, setReservationId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [foodSelections, setFoodSelections] = useState<SelectedFoodItem[]>([]);

  const { data: seatPlanEntries = [] } = useGetSeatPlan(screening.id);

  const handleToggleSeat = (seatId: string) => {
    setSelectedSeatIds((prev) =>
      prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId]
    );
  };

  const handleReservationSuccess = (resId: string, name: string, contact: string) => {
    setReservationId(resId);
    setCustomerName(name);
    setContactInfo(contact);
    setStep('food-items');
  };

  const handleFoodContinue = (selections: SelectedFoodItem[]) => {
    setFoodSelections(selections);
    setStep('bill-receipt');
  };

  const handleFoodSkip = () => {
    setFoodSelections([]);
    setStep('bill-receipt');
  };

  const selectedSeats: Seat[] = seatPlanEntries
    .filter(([id]) => selectedSeatIds.includes(id))
    .map(([, seat]) => seat);

  const stepIndex = STEPS.indexOf(step);
  const showStepIndicator = step !== 'bill-receipt';

  const handleBack = () => {
    if (step === 'select-seats') onBack();
    else if (step === 'fill-form') setStep('select-seats');
    else if (step === 'food-items') setStep('fill-form');
    else if (step === 'bill-receipt') onBack();
  };

  // Bill receipt is full-width, no card wrapper
  if (step === 'bill-receipt') {
    return (
      <BillReceipt
        screening={screening}
        selectedSeats={selectedSeats}
        customerName={customerName}
        contactInfo={contactInfo}
        reservationId={reservationId}
        foodItems={foodSelections}
        onDone={onBack}
      />
    );
  }

  // Food items page
  if (step === 'food-items') {
    return (
      <FoodItems
        onContinue={handleFoodContinue}
        onSkip={handleFoodSkip}
        onBack={() => setStep('fill-form')}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {step === 'select-seats' ? 'Back to Screenings' : 'Back to Seat Selection'}
      </button>

      {/* Screening info */}
      <div className="theatre-card rounded-xl p-5 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg gold-gradient flex items-center justify-center flex-shrink-0">
            <Film className="w-6 h-6 text-theatre-dark" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-xl font-bold text-foreground mb-1 truncate">{screening.title}</h2>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gold" />
                {formatDate(screening.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gold" />
                {screening.time}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Media section — shown only on seat selection step */}
      {step === 'select-seats' && (
        <div className="mb-6">
          <MediaSection
            posterImages={screening.posterImages ?? []}
            trailerLinks={screening.trailerLinks ?? []}
          />
        </div>
      )}

      {/* Step indicator */}
      {showStepIndicator && (
        <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
          {STEP_LABELS.slice(0, 3).map((label, i) => (
            <React.Fragment key={label}>
              <div className={`flex items-center gap-1.5 flex-shrink-0 ${i <= stepIndex ? 'text-gold' : 'text-muted-foreground'}`}>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border flex-shrink-0 ${
                    i < stepIndex
                      ? 'gold-gradient text-theatre-dark border-transparent'
                      : i === stepIndex
                      ? 'border-gold text-gold'
                      : 'border-muted-foreground text-muted-foreground'
                  }`}
                >
                  {i + 1}
                </div>
                <span className="text-xs font-medium hidden sm:inline whitespace-nowrap">{label}</span>
              </div>
              {i < 2 && (
                <div className={`flex-1 h-px min-w-4 ${i < stepIndex ? 'bg-gold' : 'bg-muted'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Step content */}
      <div className="theatre-card rounded-xl p-6">
        {step === 'select-seats' && (
          <div className="space-y-6">
            <h3 className="font-display text-lg font-semibold text-foreground">Choose Your Seats</h3>
            <SeatMap
              screeningId={screening.id}
              selectedSeatIds={selectedSeatIds}
              onToggleSeat={handleToggleSeat}
            />
            {selectedSeatIds.length > 0 && (
              <button
                onClick={() => setStep('fill-form')}
                className="w-full py-3 rounded-lg gold-gradient text-theatre-dark font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Continue with {selectedSeatIds.length} seat{selectedSeatIds.length !== 1 ? 's' : ''} →
              </button>
            )}
          </div>
        )}

        {step === 'fill-form' && (
          <div className="space-y-4">
            <h3 className="font-display text-lg font-semibold text-foreground">Your Details</h3>
            <ReservationForm
              screening={screening}
              selectedSeatIds={selectedSeatIds}
              seatPlanEntries={seatPlanEntries}
              onSuccess={handleReservationSuccess}
              onCancel={() => setStep('select-seats')}
            />
          </div>
        )}
      </div>
    </div>
  );
}
