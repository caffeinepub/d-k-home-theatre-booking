import React, { useState } from 'react';
import { ArrowLeft, ShoppingBag, ChevronRight, Utensils } from 'lucide-react';
import FoodMenuItem, { type FoodItem } from '../components/FoodMenuItem';

const FOOD_MENU: FoodItem[] = [
  {
    id: 'popcorn-salted',
    emoji: '🍿',
    name: 'Salted Popcorn (Large)',
    description: 'Classic buttery salted popcorn, freshly popped',
    price: 180,
  },
  {
    id: 'popcorn-caramel',
    emoji: '🍿',
    name: 'Caramel Popcorn (Large)',
    description: 'Sweet caramel glazed popcorn — irresistible!',
    price: 200,
  },
  {
    id: 'nachos',
    emoji: '🧀',
    name: 'Nachos with Cheese Dip',
    description: 'Crispy tortilla chips with warm cheese sauce',
    price: 220,
  },
  {
    id: 'cold-drink',
    emoji: '🥤',
    name: 'Cold Drink (500ml)',
    description: 'Chilled Pepsi / Coke / Sprite — your choice',
    price: 120,
  },
  {
    id: 'combo-meal',
    emoji: '🎁',
    name: 'Combo Meal (Popcorn + Drink)',
    description: 'Large popcorn + cold drink — best value!',
    price: 280,
  },
  {
    id: 'hot-dog',
    emoji: '🌭',
    name: 'Hot Dog',
    description: 'Juicy hot dog with mustard and ketchup',
    price: 160,
  },
  {
    id: 'candy',
    emoji: '🍬',
    name: 'Candy Mix',
    description: 'Assorted gummy bears, lollipops & chocolates',
    price: 90,
  },
  {
    id: 'pizza-slice',
    emoji: '🍕',
    name: 'Pizza Slice',
    description: 'Cheesy margherita or pepperoni slice',
    price: 150,
  },
  {
    id: 'ice-cream',
    emoji: '🍦',
    name: 'Ice Cream Cup',
    description: 'Vanilla / Chocolate / Strawberry scoop',
    price: 100,
  },
];

export interface SelectedFoodItem {
  item: FoodItem;
  quantity: number;
}

interface FoodItemsProps {
  onContinue: (selections: SelectedFoodItem[]) => void;
  onSkip: () => void;
  onBack: () => void;
}

export default function FoodItems({ onContinue, onSkip, onBack }: FoodItemsProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const handleQuantityChange = (id: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[id] ?? 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  const selectedItems: SelectedFoodItem[] = FOOD_MENU
    .filter((item) => (quantities[item.id] ?? 0) > 0)
    .map((item) => ({ item, quantity: quantities[item.id] }));

  const foodTotal = selectedItems.reduce((sum, { item, quantity }) => sum + item.price * quantity, 0);
  const itemCount = selectedItems.reduce((sum, { quantity }) => sum + quantity, 0);

  const handleContinue = () => {
    onContinue(selectedItems);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Your Details
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, oklch(0.78 0.12 85), oklch(0.65 0.1 75))' }}
        >
          <Utensils className="w-6 h-6" style={{ color: 'oklch(0.1 0 0)' }} />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-gold">Food & Beverages</h2>
          <p className="text-sm text-muted-foreground">Add snacks to your booking (optional)</p>
        </div>
      </div>

      {/* Menu grid */}
      <div className="space-y-3 mb-6">
        {FOOD_MENU.map((item) => (
          <FoodMenuItem
            key={item.id}
            item={item}
            quantity={quantities[item.id] ?? 0}
            onQuantityChange={handleQuantityChange}
          />
        ))}
      </div>

      {/* Order summary bar */}
      {itemCount > 0 && (
        <div
          className="rounded-xl p-4 mb-4"
          style={{
            background: 'oklch(0.78 0.12 85 / 0.1)',
            border: '1px solid oklch(0.78 0.12 85 / 0.4)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium text-gold">
                {itemCount} item{itemCount !== 1 ? 's' : ''} selected
              </span>
            </div>
            <span className="font-bold text-gold">₹{foodTotal.toFixed(2)}</span>
          </div>
          <div className="mt-2 space-y-1">
            {selectedItems.map(({ item, quantity }) => (
              <div key={item.id} className="flex justify-between text-xs text-muted-foreground">
                <span>{item.name} × {quantity}</span>
                <span>₹{(item.price * quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={onSkip}
          className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: 'oklch(0.18 0 0)',
            border: '1px solid oklch(0.28 0.02 85 / 0.4)',
            color: 'oklch(0.65 0.01 85)',
          }}
        >
          Skip Food
        </button>
        <button
          onClick={handleContinue}
          className="flex-[2] py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
          style={{
            background: 'linear-gradient(135deg, oklch(0.78 0.12 85), oklch(0.65 0.1 75))',
            color: 'oklch(0.1 0 0)',
          }}
        >
          {itemCount > 0 ? `Continue with ₹${foodTotal.toFixed(0)} food` : 'Continue without food'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
