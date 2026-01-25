import React, { useEffect, useState } from 'react';
import { Check, X, AlertCircle, Info } from 'lucide-react';

//4 alert types - success, error, info, warning with unique colors and icons

interface AlertProps {
  value: string;
  onClose: () => void;
  type?: 'success' | 'error' | 'info' | 'warning';
  autoCloseDuration?: number;
  showBackdrop?: boolean;
}

const Alert: React.FC<AlertProps> = ({
  value,
  onClose,
  type = 'success',
  autoCloseDuration = 3000,
  showBackdrop = false,
}) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(() => {
        onClose();
      }, 300); // Animation duration
    }, autoCloseDuration);

    return () => clearTimeout(timer);
  }, [onClose, autoCloseDuration]);

  // Color configurations based on type
  const alertConfig = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: Check,
      iconColor: 'text-green-600',
      textColor: 'text-green-800',
      progressBg: 'bg-green-500',
      title: 'Success',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: X,
      iconColor: 'text-red-600',
      textColor: 'text-red-800',
      progressBg: 'bg-red-500',
      title: 'Error',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: Info,
      iconColor: 'text-blue-600',
      textColor: 'text-blue-800',
      progressBg: 'bg-blue-500',
      title: 'Info',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: AlertCircle,
      iconColor: 'text-yellow-600',
      textColor: 'text-yellow-800',
      progressBg: 'bg-yellow-500',
      title: 'Warning',
    },
  };

  const config = alertConfig[type];
  const IconComponent = config.icon;

  return (
    <>
      {/* Backdrop - Optional */}
      {showBackdrop && (
        <div
          className={`fixed inset-0 z-40 transition-opacity duration-300 ${
            isClosing ? 'opacity-0' : 'opacity-100'
          } bg-black/30 backdrop-blur-xs`}
          onClick={() => {
            setIsClosing(true);
            setTimeout(onClose, 300);
          }}
        />
      )}

      {/* Alert Container */}
      <div
        role="alert"
        className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
          isClosing ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
        }`}
      >
        {/* Alert Card */}
        <div className={`${config.bg} ${config.border} border-l-4 rounded-lg shadow-lg p-4 max-w-md w-full md:w-96`}>
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`flex-shrink-0 mt-0.5 ${config.iconColor}`}>
              <IconComponent size={20} className="stroke-[2.5]" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-sm ${config.textColor}`}>
                {config.title}
              </h3>
              <p className={`mt-1 text-sm ${config.textColor} opacity-90 break-words`}>
                {value}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                setIsClosing(true);
                setTimeout(onClose, 300);
              }}
              className={`flex-shrink-0 inline-flex p-1 rounded-md ${config.iconColor} hover:opacity-70 transition-opacity`}
              aria-label="Close alert"
            >
              <X size={18} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className={`mt-3 h-1 w-full bg-gray-200 rounded-full overflow-hidden`}>
            <div
              className={`h-full ${config.progressBg} rounded-full animate-pulse`}
              style={{
                animation: `shrink ${autoCloseDuration}ms linear forwards`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Animation Keyframes */}
      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </>
  );
};

export default Alert;