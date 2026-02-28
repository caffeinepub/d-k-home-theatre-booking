import React from 'react';

export type SeatStatus = 'available' | 'reserved' | 'booked' | 'selected';

interface SeatIconProps {
  seatLabel: string;
  status: SeatStatus;
  onClick?: () => void;
  size?: number;
}

export default function SeatIcon({ seatLabel, status, onClick, size = 38 }: SeatIconProps) {
  const isDisabled = status === 'reserved' || status === 'booked';

  const classMap: Record<SeatStatus, string> = {
    available: 'cinema-seat cinema-seat-available',
    selected: 'cinema-seat cinema-seat-selected',
    reserved: 'cinema-seat cinema-seat-reserved cinema-seat-disabled',
    booked: 'cinema-seat cinema-seat-booked cinema-seat-disabled',
  };

  return (
    <button
      className={classMap[status]}
      style={{ width: size, height: size, fontSize: size < 32 ? '7px' : '8px', fontWeight: 700 }}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      title={`Seat ${seatLabel} — ${status}`}
      aria-label={`Seat ${seatLabel}, ${status}`}
    >
      {/* Seat back */}
      <svg
        viewBox="0 0 24 24"
        width={size * 0.7}
        height={size * 0.7}
        fill="currentColor"
        style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)' }}
        aria-hidden="true"
      >
        <rect x="3" y="2" width="18" height="12" rx="3" />
        <rect x="1" y="14" width="4" height="6" rx="1" />
        <rect x="19" y="14" width="4" height="6" rx="1" />
        <rect x="5" y="14" width="14" height="5" rx="1" />
      </svg>
      {/* Seat label */}
      <span
        style={{
          position: 'absolute',
          bottom: '2px',
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: size < 36 ? '6px' : '7px',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}
      >
        {seatLabel}
      </span>
    </button>
  );
}
