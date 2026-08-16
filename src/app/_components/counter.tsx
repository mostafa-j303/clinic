import React, { useState, useId, useEffect } from "react";
import { Plus, Minus } from "lucide-react";

interface CounterProps {
  initialCount: number;
  onCountChange: (newCount: number) => void;
  minCount?: number;
  maxCount?: number;
}

// Compact quantity stepper — sized to sit inline next to an Add button
// instead of stretching full-width as its own block.
const Counter: React.FC<CounterProps> = ({
  initialCount,
  onCountChange,
  minCount = 1,
  maxCount = 999
}) => {
  const [count, setCount] = useState<number>(initialCount);
  const uniqueId = useId();

  // 🔄 Sync internal state with parent-provided initialCount
  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  const handleIncrement = () => {
    if (count < maxCount) {
      const newCount = count + 1;
      setCount(newCount);
      onCountChange(newCount);
    }
  };

  const handleDecrement = () => {
    if (count > minCount) {
      const newCount = count - 1;
      setCount(newCount);
      onCountChange(newCount);
    }
  };

  const handleDirectInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value, 10);

    if (isNaN(value)) {
      value = minCount;
    }

    // Clamp value between min and max
    value = Math.max(minCount, Math.min(value, maxCount));

    setCount(value);
    onCountChange(value);
  };

  const isAtMin = count <= minCount;
  const isAtMax = count >= maxCount;

  return (
    <div className="inline-flex items-center gap-0.5 bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5 flex-shrink-0">
      {/* Decrement Button */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={isAtMin}
        className={`flex items-center justify-center size-6 rounded-md transition-all ${
          isAtMin
            ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
            : "text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 hover:text-primary active:scale-95"
        }`}
        aria-label="Decrease quantity"
        title={isAtMin ? `Minimum quantity is ${minCount}` : "Decrease quantity"}
      >
        <Minus size={13} />
      </button>

      {/* Input Field */}
      <input
        type="number"
        id={`quantity-${uniqueId}`}
        value={count}
        onChange={handleDirectInput}
        min={minCount}
        max={maxCount}
        className="h-6 w-7 text-center text-xs text-black dark:text-white font-semibold border-0 bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-primary [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
        aria-label="Quantity"
      />

      {/* Increment Button */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={isAtMax}
        className={`flex items-center justify-center size-6 rounded-md transition-all ${
          isAtMax
            ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
            : "text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 hover:text-primary active:scale-95"
        }`}
        aria-label="Increase quantity"
        title={isAtMax ? `Maximum quantity is ${maxCount}` : "Increase quantity"}
      >
        <Plus size={13} />
      </button>
    </div>
  );
};

export default Counter;
