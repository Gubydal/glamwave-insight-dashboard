
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EnhancedChartContainerProps {
  title: string;
  children: ReactNode;
  className?: string;
}

const EnhancedChartContainer: React.FC<EnhancedChartContainerProps> = ({
  title,
  children,
  className
}) => {
  return (
    <div 
      className={cn(
        "bg-white rounded-lg overflow-hidden shadow-lg border border-salon-tertiary/10", 
        "hover:shadow-xl transition-shadow duration-300",
        className
      )}
    >
      <div className="px-5 py-4 border-b border-salon-tertiary/10 flex justify-between items-center">
        <h3 className="text-lg font-medium text-salon-heading">{title}</h3>
      </div>
      <div className="p-4 h-[260px]">
        {children}
      </div>
    </div>
  );
};

export default EnhancedChartContainer;
