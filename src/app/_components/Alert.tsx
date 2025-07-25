// Alert.tsx
import React, { useEffect, useState } from 'react';

interface AlertProps {
  value: string;
  onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ value, onClose }) => {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(() => {
        onClose();
      }, 300); // Duration of the animation
    }, 1500); // Duration before animation starts

    return () => clearTimeout(timer); // Clean up the timer on unmount
  }, [onClose]);

  useEffect(() => {
    if (isClosing) {
      setIsVisible(false);
    }
  }, [isClosing]);

  return (
    <div className='fixed inset-0 flex flex-col  items-center justify-start bg-black bg-opacity-50 z-50 '>
      <div role="alert" className={`fixed top-4 right-4 rounded-xl border border-gray-100 bg-white p-4 transition-all transform ${
          isClosing ? 'translate-y-[-150%]' : 'translate-y-0'
        }`}>
      <div className="flex items-start gap-4">
        <span className="text-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </span>

        <div className="flex-1">
          <strong className="block font-medium text-gray-900"> Alert </strong>

          <p className="mt-1 text-sm text-gray-700">{value}</p>
        </div>

        <button onClick={onClose} className="text-gray-500 transition hover:text-gray-600">
          <span className="sr-only">Dismiss popup</span>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
    </div>
    
  );
};

export default Alert;
