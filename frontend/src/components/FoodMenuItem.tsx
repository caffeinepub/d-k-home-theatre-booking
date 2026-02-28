import React from 'react';

export interface FoodItem {
  id: string;
  emoji: string;
  name: string;
  description: string;
  price: number;
}

interface FoodMenuItemProps {
  item: FoodItem;
  quantity: number;
  onQuantityChange: (id: string, delta: number) => void;
}

export default function FoodMenuItem({ item, quantity, onQuantityChange }: FoodMenuItemProps) {
  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl transition-all duration-200"
      style={{
        background: quantity > 0 ? 'oklch(0.78 0.12 85 / 0.08)' : 'oklch(0.14 0 0)',
        border: quantity > 0
          ? '1px solid oklch(0.78 0.12 85 / 0.5)'
          : '1px solid oklch(0.25 0.02 85 / 0.3)',
      }}
    >
      {/* Emoji icon */}
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-3xl"
        style={{ background: 'oklch(0.18 0 0)', border: '1px solid oklch(0.28 0.02 85 / 0.3)' }}
      >
        {item.emoji}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm" style={{ color: 'oklch(0.95 0.02 85)' }}>
          {item.name}
        </div>
        <div className="text-xs mt-0.5" style={{ color: 'oklch(0.55 0.01 85)' }}>
          {item.description}
        </div>
        <div className="text-sm font-bold mt-1" style={{ color: 'oklch(0.78 0.12 85)' }}>
          ₹{item.price.toFixed(2)}
        </div>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onQuantityChange(item.id, -1)}
          disabled={quantity === 0}
          className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-all"
          style={{
            background: quantity > 0 ? 'oklch(0.78 0.12 85 / 0.2)' : 'oklch(0.18 0 0)',
            border: '1px solid oklch(0.78 0.12 85 / 0.4)',
            color: quantity > 0 ? 'oklch(0.78 0.12 85)' : 'oklch(0.38 0 0)',
            cursor: quantity === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          −
        </button>

        <span
          className="w-6 text-center text-sm font-bold"
          style={{ color: quantity > 0 ? 'oklch(0.78 0.12 85)' : 'oklch(0.55 0.01 85)' }}
        >
          {quantity}
        </span>

        <button
          onClick={() => onQuantityChange(item.id, 1)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-all"
          style={{
            background: 'oklch(0.78 0.12 85)',
            color: 'oklch(0.1 0 0)',
            border: 'none',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'oklch(0.88 0.12 85)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'oklch(0.78 0.12 85)'; }}
        >
          +
        </button>
      </div>
    </div>
  );
}
