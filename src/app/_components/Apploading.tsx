'use client';
import React from 'react';

// Lightweight, real loading indicator — no fake countdown or artificial delay.
// Shown only for as long as data is actually being fetched.
const AppLoading: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
};

export default AppLoading;
