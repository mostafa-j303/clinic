'use client';
import React, { useEffect, useState } from 'react';
import { LoaderPinwheel, Activity } from 'lucide-react';

const LOADING_DURATION = 5; // seconds

const AppLoading: React.FC = () => {
  const [count, setCount] = useState(LOADING_DURATION);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (count === 0) return;
    const timer = setTimeout(() => setCount(count - 1), 1000);
    return () => clearTimeout(timer);
  }, [count]);

  const progressPercent = ((LOADING_DURATION - count) / LOADING_DURATION) * 100;

  // Only render after hydration
  if (!mounted) {
    return null;
  }

     return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="flex flex-col gap-8 p-8 w-full max-w-md bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
        
        {/* Header with Icon */}
        <div className="flex items-center justify-center gap-3">
          <Activity className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">Clinic System</h2>
        </div>

        {/* Animated Spinner */}
        <div className="flex justify-center items-center h-32">
          <div className="relative w-24 h-24">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-blue-600 border-r-blue-500 animate-spin" />
            
            {/* Inner pulsing circle */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center animate-pulse">
              <LoaderPinwheel className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="flex flex-col gap-3 text-center items-center">
          <p className="text-center text-gray-700 font-medium">Loading your clinic data</p>
          
          {/* Loading Text with Animation */}
        <div className="flex flex-col items-center space-y-3">
          <p className="text-blue-400 text-lg font-semibold">
            Preparing your dashboard
          </p>
          <p className="text-sm font-medium" style={{ color: 'var(--hovprimary)' }}>
            {count}s remaining
          </p>
        </div>
        {/* Enhanced Progress Bar */}
        <div className="w-80 space-y-3">
          <div className="relative h-2 rounded-full overflow-hidden backdrop-blur-sm border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(190, 117, 255, 0.15)' }}>
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ 
                width: `${progressPercent}%`,
                background: 'linear-gradient(90deg, #2196F3, #42A5F5)',
                boxShadow: '0 0 20px rgba(190, 117, 255, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.2)'
              }}
            />
            {/* Shimmer effect */}
            <div
              className="absolute inset-0 animate-pulse"
              style={{ width: `${progressPercent}%`, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)' }}
            />
          </div>
          <div className="flex justify-between text-xs text-blue-500" >
            <span>Loading</span>
            <span className="font-semibold">{Math.round(progressPercent)}%</span>
          </div>
        </div>

       

          <div className="flex justify-center gap-1">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>

        {/* Skeleton Loaders - Placeholder Content */}
        <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
          <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full animate-pulse" />
          <div className="h-3 w-4/5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full animate-pulse" />
          <div className="h-3 w-3/4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full animate-pulse" />
        </div>

        {/* Status Text */}
        <p className="text-xs text-center text-gray-500">
          Initializing clinic management system...
        </p>
      </div>
    </div>
  );
}
export default AppLoading;