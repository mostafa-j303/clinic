import { LoaderPinwheel } from "lucide-react";
import React from "react";

interface LoadingProps {
  variant?: 'card' | 'grid' | 'list' | 'minimal';
  message?: string;
}

function Loading({ variant = 'grid', message = 'Loading products...' }: LoadingProps) {
  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className="w-full bg-white py-12 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse"
            >
              {/* Image Skeleton */}
              <div className="w-full h-40 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
              
              {/* Content Skeleton */}
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-1/2" />
                <div className="h-8 bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20 rounded mt-4" />
              </div>
            </div>
          ))}
        </div>
        
        {/* Centered Loading Indicator */}
        <div className="flex flex-col items-center justify-center pt-8">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary border-r-accent animate-spin" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <LoaderPinwheel className="w-8 h-8 text-primary animate-spin" />
            </div>
          </div>
          <p className="text-gray-600 text-sm font-medium">{message}</p>
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="w-full space-y-3 py-12 px-4 bg-white">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex gap-4 bg-white p-4 rounded-lg shadow-sm animate-pulse"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-full" />
              <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-2/3" />
            </div>
          </div>
        ))}
        
        {/* Centered Loading Indicator */}
        <div className="flex flex-col items-center justify-center pt-6">
          <div className="relative w-16 h-16 mb-3">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary border-r-accent animate-spin" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <LoaderPinwheel className="w-8 h-8 text-primary animate-spin" />
            </div>
          </div>
          <p className="text-gray-600 text-sm font-medium">{message}</p>
        </div>
      </div>
    );
  }

  // Default card variant
  return (
    <div className="w-full flex flex-col items-center justify-center py-12 bg-white ">
      <div className="relative w-20 h-20 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary border-r-accent animate-spin" />
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <LoaderPinwheel className="w-10 h-10 text-primary animate-spin" />
        </div>
      </div>
      
      <p className="text-gray-600 text-sm font-medium">{message}</p>
      
      {/* Animated Dots */}
      <div className="flex justify-center gap-1.5 mt-4">
        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
        <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  );
}

export default Loading;