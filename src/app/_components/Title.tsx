// Title.tsx
import React from 'react';

interface LabelBoxProps {
  value?: string;
  color?: string;
}

const Title: React.FC<LabelBoxProps> = ({ value,color }) => {
  if (!value){return null}
  return (
    <div className={`  font-semibold text-lg pt-1 px-3 rounded-sm border-t-8  pb-4 ${color}`} >
      {value} :
    </div>
  );
};

export default Title;