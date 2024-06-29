// Separator.tsx
import { MoveDown } from 'lucide-react';
import React from 'react';

interface SeparatorProps {
  value: string;
}

const Separator: React.FC<SeparatorProps> = ({ value }) => {
  return (
    <div className="text-white  relative text-4xl font-thin bg-gradient-to-b from-hovsecondary border-t-0 via-hoveprimary to-hovprimary flex flex-col items-center shadow-secondary   border-b-[7px] border-primary transition duration-500   ">
        <div className={' flex justify-center  items-center  animate-none pt-5 pl-7 pr-7 w-fit p-3 bg-primary  border-secondary border-r-[10px] border-l-[10px] rounded-t-[70px] skew-x-12 '}>
             {value}
        </div> 
    </div>
  );
};

export default Separator;
