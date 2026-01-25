import { MoveDown, ArrowDown } from 'lucide-react';
import React from 'react';

interface SeparatorProps {
  value: string;
  showIcon?: boolean;
}

const Separator: React.FC<SeparatorProps> = ({ 
  value, 
  showIcon = true 
}) => {

  // Default variant - improved original
  return (
    <div className="relative py-6 md:py-6 bg-gradient-to-b from-hovprimary via-primary/5 to-hovsecondary overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      
      {/* Main separator */}
      <div className="relative flex flex-col items-center gap-6">
        {/* Badge/Pill shape */}
        <div className="bg-white shadow-lg rounded-full px-8 py-4 border-4 border-primary hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            {value}
          </h2>
        </div>

        {/* Decorative line */}
        <div className="flex items-center gap-3 w-full max-w-xs">
          <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent to-primary/50" />
          {showIcon && (
            <ArrowDown className="w-5 h-5 text-primary animate-bounce flex-shrink-0" />
          )}
          <div className="flex-1 h-0.5 bg-gradient-to-l from-transparent to-primary/50" />
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 right-1/2 translate-x-1/2 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl" />
    </div>
  );
};

export default Separator;