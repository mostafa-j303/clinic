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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 pt-6 pb-2 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              isDangerous ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 className="font-heading text-lg font-bold text-gray-900">
              {isDangerous ? 'Confirm Deletion' : 'Confirm Action'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 rounded-full p-1.5 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 pt-2">
          <p className="text-sm text-gray-600 leading-relaxed">
            {text}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex gap-3 justify-end border-t border-gray-100">
          <button
            onClick={onCancel}
            className="px-5 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-semibold text-sm rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 font-semibold text-sm rounded-lg text-white transition-all cursor-pointer ${
              isDangerous
                ? 'bg-rose-600 hover:bg-rose-700 hover:shadow-lg hover:shadow-rose-600/20'
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