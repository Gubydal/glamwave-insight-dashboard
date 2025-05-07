
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
        "bg-white rounded-lg overflow-hidden shadow-md border border-salon-tertiary/10", 
        "hover:shadow-lg transition-all duration-300",
        "transform hover:-translate-y-1",
        "mb-6", // Add margin bottom to create separation between charts
        className
      )}
      style={{
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      }}
    >
      <div className="px-5 py-4 border-b border-salon-tertiary/10 flex justify-between items-center bg-gradient-to-r from-white to-salon-tertiary/5">
        <h3 className="text-lg font-medium text-salon-heading">{title}</h3>
      </div>
      <div className="p-5 h-[280px]">
        {children}
      </div>
    </div>
  );
};

export default EnhancedChartContainer;
