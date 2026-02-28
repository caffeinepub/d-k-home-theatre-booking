import React, { useMemo } from 'react';
import { CheckCircle, Home, Printer } from 'lucide-react';
import type { Screening, Seat } from '../backend';
import type { SelectedFoodItem } from './FoodItems';

interface BillReceiptProps {
  screening: Screening;
  selectedSeats: Seat[];
  customerName: string;
  contactInfo: string;
  reservationId: string;
  foodItems: SelectedFoodItem[];
  onDone: () => void;
}

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const SEAT_PRICE = 250; // ₹ per seat
const GST_RATE = 0.18;
const SERVICE_FEE = 30;

function generateTransactionId(): string {
  return 'TXN' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

function generateBookingRef(): string {
  return 'DKT' + Date.now().toString(36).toUpperCase().slice(-6);
}

export default function BillReceipt({
  screening,
  selectedSeats,
  customerName,
  contactInfo,
  reservationId,
  foodItems,
  onDone,
}: BillReceiptProps) {
  const transactionId = useMemo(() => generateTransactionId(), []);
  const bookingRef = useMemo(() => generateBookingRef(), []);

  const seatSubtotal = selectedSeats.length * SEAT_PRICE;
  const foodSubtotal = foodItems.reduce((sum, { item, quantity }) => sum + item.price * quantity, 0);
  const subtotal = seatSubtotal + foodSubtotal;
  const gst = Math.round(subtotal * GST_RATE);
  const grandTotal = subtotal + gst + SERVICE_FEE;

  const now = new Date();
  const receiptDate = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const receiptTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      {/* Success header */}
      <div className="text-center mb-6">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
          style={{ background: 'linear-gradient(135deg, oklch(0.78 0.12 85), oklch(0.65 0.1 75))' }}
        >
          <CheckCircle className="w-9 h-9" style={{ color: 'oklch(0.1 0 0)' }} />
        </div>
        <h2 className="font-display text-2xl font-bold text-gold">Booking Confirmed!</h2>
        <p className="text-sm text-muted-foreground mt-1">Your receipt is ready</p>
      </div>

      {/* Receipt paper */}
      <div
        className="receipt-paper rounded-2xl overflow-hidden receipt-animate shadow-2xl"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.1)' }}
      >
        {/* Receipt header image */}
        <div className="relative">
          <img
            src="/assets/generated/receipt-header.dim_800x120.png"
            alt="D.K Home Theatre"
            className="w-full object-cover"
            style={{ maxHeight: '80px' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          {/* Fallback header */}
          <div
            className="flex flex-col items-center justify-center py-4"
            style={{ background: 'linear-gradient(135deg, #1a1a1a, #2a2a2a)' }}
          >
            <div className="text-2xl mb-1">🎬</div>
            <div style={{ fontFamily: 'Courier New, monospace', fontWeight: 700, fontSize: '16px', color: '#d4a843', letterSpacing: '0.1em' }}>
              D.K HOME THEATRE
            </div>
            <div style={{ fontFamily: 'Courier New, monospace', fontSize: '10px', color: '#888', letterSpacing: '0.2em' }}>
              BOOKING RECEIPT
            </div>
          </div>
        </div>

        {/* Receipt body */}
        <div className="p-5" style={{ fontFamily: 'Courier New, Courier, monospace', fontSize: '12px', color: '#1a1a1a' }}>
          {/* Date & Ref */}
          <div className="flex justify-between mb-1">
            <span style={{ color: '#555' }}>Date: {receiptDate}</span>
            <span style={{ color: '#555' }}>Time: {receiptTime}</span>
          </div>
          <div className="flex justify-between mb-3">
            <span style={{ color: '#555' }}>Ref: <strong style={{ color: '#1a1a1a' }}>{bookingRef}</strong></span>
            <span style={{ color: '#555' }}>TXN: <strong style={{ color: '#1a1a1a' }}>{transactionId}</strong></span>
          </div>

          {/* Dashed divider */}
          <div className="receipt-dashed mb-3" />

          {/* Customer info */}
          <div className="mb-3">
            <div><strong>Customer:</strong> {customerName}</div>
            <div><strong>Contact:</strong> {contactInfo}</div>
          </div>

          <div className="receipt-dashed mb-3" />

          {/* Movie info */}
          <div className="mb-3">
            <div className="font-bold text-sm mb-1" style={{ color: '#1a1a1a' }}>🎬 MOVIE</div>
            <div className="font-bold" style={{ fontSize: '13px' }}>{screening.title}</div>
            <div style={{ color: '#555' }}>Date: {formatDate(screening.date)}</div>
            <div style={{ color: '#555' }}>Show: {screening.time}</div>
          </div>

          <div className="receipt-dashed mb-3" />

          {/* Seats */}
          <div className="mb-3">
            <div className="font-bold text-sm mb-2" style={{ color: '#1a1a1a' }}>🎟 SEATS</div>
            {selectedSeats.map((seat) => (
              <div key={seat.id} className="flex justify-between">
                <span>Seat {seat.row}{Number(seat.number)}</span>
                <span>₹{SEAT_PRICE.toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold mt-1 pt-1" style={{ borderTop: '1px dotted #ccc' }}>
              <span>Seats Subtotal ({selectedSeats.length})</span>
              <span>₹{seatSubtotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Food items */}
          {foodItems.length > 0 && (
            <>
              <div className="receipt-dashed mb-3" />
              <div className="mb-3">
                <div className="font-bold text-sm mb-2" style={{ color: '#1a1a1a' }}>🍿 FOOD & BEVERAGES</div>
                {foodItems.map(({ item, quantity }) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.name} × {quantity}</span>
                    <span>₹{(item.price * quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold mt-1 pt-1" style={{ borderTop: '1px dotted #ccc' }}>
                  <span>Food Subtotal</span>
                  <span>₹{foodSubtotal.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}

          <div className="receipt-dashed mb-3" />

          {/* Totals */}
          <div className="mb-3 space-y-1">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between" style={{ color: '#555' }}>
              <span>GST (18%)</span>
              <span>₹{gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between" style={{ color: '#555' }}>
              <span>Service Fee</span>
              <span>₹{SERVICE_FEE.toFixed(2)}</span>
            </div>
          </div>

          {/* Grand total */}
          <div
            className="flex justify-between items-center py-2 px-3 rounded-lg mb-3"
            style={{ background: '#1a1a1a', color: '#d4a843' }}
          >
            <span className="font-bold text-base">GRAND TOTAL</span>
            <span className="font-bold text-lg">₹{grandTotal.toFixed(2)}</span>
          </div>

          <div className="receipt-dashed mb-3" />

          {/* Reservation ID */}
          <div className="text-center mb-3">
            <div style={{ color: '#555', fontSize: '10px', letterSpacing: '0.1em' }}>RESERVATION ID</div>
            <div className="font-bold" style={{ fontSize: '11px', wordBreak: 'break-all' }}>{reservationId}</div>
          </div>

          {/* QR Code placeholder */}
          <div className="flex flex-col items-center mb-3">
            <div
              className="w-24 h-24 rounded-lg flex items-center justify-center mb-1"
              style={{ background: '#f0f0f0', border: '2px solid #ddd' }}
            >
              {/* Fake QR code grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', width: '70px', height: '70px' }}>
                {Array.from({ length: 49 }).map((_, i) => {
                  const isCorner = (i < 7 && (i < 3 || i > 3)) || (i >= 42 && (i % 7 < 3 || i % 7 > 3)) || (i % 7 === 0 && i < 21) || (i % 7 === 6 && i < 21);
                  const isDark = isCorner || Math.sin(i * 137.5) > 0.1;
                  return (
                    <div
                      key={i}
                      style={{
                        background: isDark ? '#1a1a1a' : '#fff',
                        borderRadius: '1px',
                      }}
                    />
                  );
                })}
              </div>
            </div>
            <div style={{ fontSize: '9px', color: '#888', letterSpacing: '0.1em' }}>SCAN TO VERIFY</div>
          </div>

          <div className="receipt-dashed mb-3" />

          {/* Footer note */}
          <div className="text-center" style={{ fontSize: '10px', color: '#888', lineHeight: 1.6 }}>
            <div>Thank you for choosing D.K Home Theatre!</div>
            <div>Please arrive 15 mins before showtime.</div>
            <div>This is your official booking receipt.</div>
          </div>

          {/* Perforated bottom */}
          <div className="mt-4 flex justify-center gap-1">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: '#ddd' }} />
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: 'oklch(0.18 0 0)',
            border: '1px solid oklch(0.28 0.02 85 / 0.4)',
            color: 'oklch(0.65 0.01 85)',
          }}
        >
          <Printer className="w-4 h-4" />
          Print
        </button>
        <button
          onClick={onDone}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all"
          style={{
            background: 'linear-gradient(135deg, oklch(0.78 0.12 85), oklch(0.65 0.1 75))',
            color: 'oklch(0.1 0 0)',
          }}
        >
          <Home className="w-4 h-4" />
          Back to Home
        </button>
      </div>
    </div>
  );
}
