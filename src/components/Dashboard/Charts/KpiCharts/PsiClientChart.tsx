
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartDataItem } from '../../data/types';

interface PsiClientChartProps {
  data: ChartDataItem[];
}

const PsiClientChart: React.FC<PsiClientChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-md">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // Take top 5 clients by PSI
  const displayData = [...data].slice(0, 5);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-salon-tertiary/20">
          <p className="font-semibold text-salon-heading">{`${label}`}</p>
          <p className="text-salon-primary font-medium">
            {`PSI: ${payload[0].payload.percentage?.toFixed(2)}%`}
          </p>
          <p className="text-gray-600 text-sm">
            {`Bookings: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Color based on sensitivity (higher = more red)
  const getBarColor = (percentage: number) => {
    if (percentage > 70) return '#FF6B6B'; // Very high sensitivity
    if (percentage > 50) return '#FA8072'; // High sensitivity
    if (percentage > 30) return '#FAAA9F'; // Medium sensitivity
    if (percentage > 10) return '#FFD8BF'; // Low sensitivity
    return '#E3F2FD'; // Very low sensitivity
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={displayData}
          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={true} vertical={false} />
          <XAxis 
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
            label={{ value: 'Bookings', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            dataKey="name" 
            type="category"
            width={120}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {displayData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.percentage || 0)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PsiClientChart;
