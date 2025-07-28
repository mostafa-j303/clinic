'use client';
import React, { useEffect, useState } from 'react';
import { LoaderPinwheel } from 'lucide-react';

const LOADING_DURATION = 5; // seconds

const AppLoading: React.FC = () => {
  const [count, setCount] = useState(LOADING_DURATION);

  useEffect(() => {
    if (count === 0) return;
    const timer = setTimeout(() => setCount(count - 1), 1000);
    return () => clearTimeout(timer);
  }, [count]);

  const progressPercent = ((LOADING_DURATION - count) / LOADING_DURATION) * 100;

  return (
    <div className="fixed top-0 left-0 w-full h-full backdrop-blur-sm bg-black bg-opacity-30 flex flex-col items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full p-5 bg-white shadow-lg">
          <LoaderPinwheel className="w-10 h-10 text-primary" />
        </div>
        <p className="text-white text-sm font-medium">
          Loading... {count}s remaining
        </p>
        <div className="w-64 h-2 bg-white/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default AppLoading;
