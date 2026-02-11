import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  text: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean; // For destructive actions like delete
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  text, 
  onConfirm, 
  onCancel,
  isDangerous = false 
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className={`px-6 py-4 border-b border-gray-200 flex items-center justify-between ${
          isDangerous ? 'bg-red-50' : 'bg-gray-50'
        }`}>
          <div className="flex items-center gap-3">
            {isDangerous ? (
              <AlertTriangle className="w-6 h-6 text-red-600" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            )}
            <h2 className={`text-lg font-bold ${
              isDangerous ? 'text-red-900' : 'text-gray-900'
            }`}>
              {isDangerous ? 'Confirm Deletion' : 'Confirm Action'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 rounded-lg p-1 hover:bg-gray-200 transition"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-gray-700 leading-relaxed">
            {text}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex gap-3 justify-end border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-2 font-semibold rounded-lg text-white transition-all ${
              isDangerous
                ? 'bg-red-600 hover:bg-red-700 hover:shadow-lg'
                : 'bg-primary hover:bg-hovprimary hover:shadow-lg'
            }`}
          >
            {isDangerous ? 'Delete' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;