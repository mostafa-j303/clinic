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

  // Color configurations based on type. These stay semantic (not brand-tied) on
  // purpose: a success toast shouldn't shift color just because the brand does.
  const alertConfig = {
    success: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: Check,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      textColor: 'text-emerald-900',
      progressBg: 'bg-emerald-500',
      title: 'Success',
    },
    error: {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      icon: X,
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
      textColor: 'text-rose-900',
      progressBg: 'bg-rose-500',
      title: 'Error',
    },
    info: {
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      icon: Info,
      iconBg: 'bg-sky-100',
      iconColor: 'text-sky-600',
      textColor: 'text-sky-900',
      progressBg: 'bg-sky-500',
      title: 'Info',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: AlertCircle,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      textColor: 'text-amber-900',
      progressBg: 'bg-amber-500',
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
        className={`fixed top-4 right-4 z-[51] transform transition-all duration-300 ${
          isClosing ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
        }`}
      >
        {/* Alert Card */}
        <div className={`${config.bg} ${config.border} border rounded-2xl shadow-lg shadow-black/5 p-4 max-w-md w-full md:w-96`}>
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${config.iconBg} ${config.iconColor}`}>
              <IconComponent size={18} className="stroke-[2.5]" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-1">
              <h3 className={`font-heading font-bold text-sm ${config.textColor}`}>
                {config.title}
              </h3>
              <p className={`mt-1 text-sm ${config.textColor} opacity-80 break-words leading-relaxed`}>
                {value}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                setIsClosing(true);
                setTimeout(onClose, 300);
              }}
              className={`flex-shrink-0 inline-flex p-1.5 rounded-full cursor-pointer ${config.iconColor} hover:bg-black/5 transition-colors`}
              aria-label="Close alert"
            >
              <X size={16} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className={`mt-3 h-1 w-full bg-black/10 rounded-full overflow-hidden`}>
            <div
              className={`h-full ${config.progressBg} rounded-full`}
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