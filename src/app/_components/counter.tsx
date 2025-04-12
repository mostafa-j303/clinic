import React, { useState } from "react";

interface CounterProps {
  initialCount: number;
  onCountChange: (newCount: number) => void;
}

const Counter: React.FC<CounterProps> = ({ initialCount, onCountChange }) => {
  const [count, setCount] = useState<number>(initialCount);

  const handleIncrement = () => {
    setCount((prevCount) => prevCount + 1);
    onCountChange(count + 1);
  };

  const handleDecrement = () => {
    const newCount = Math.max(count - 1, 1); // Ensure count doesn't go below 1
    setCount(newCount);
    onCountChange(newCount);
  };

  return (
    <>
      <button
        type="button"
        className="size-10 leading-10 text-gray-600 transition hover:opacity-75"
        onClick={handleIncrement}
      >
        +
      </button>
      <input
        type="number"
        id="Quantity"
        value={count}
        readOnly
        className="text-black h-10 w-10 border-transparent text-center [-moz-appearance:_textfield] sm:text-sm [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
      />

      <button
        type="button"
        className="size-10 leading-10 text-gray-600 transition hover:opacity-75"
        onClick={handleDecrement}
      >
        &minus;
      </button>
    </>
  );
};

export default Counter;
