
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartDataItem } from '../../data/types';

interface PsiServiceChartProps {
  data: ChartDataItem[];
}

const PsiServiceChart: React.FC<PsiServiceChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-md">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // Sort data by percentage (PSI)
  const sortedData = [...data]
    .sort((a, b) => (b.percentage || 0) - (a.percentage || 0))
    .slice(0, 7); // Top 7 services

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-salon-tertiary/20">
          <p className="font-semibold text-salon-heading">{`${label}`}</p>
          <p className="text-salon-primary font-medium">
            {`PSI: ${payload[0].payload.percentage?.toFixed(2)}%`}
          </p>
          <p className="text-gray-600 text-sm">
            {`Revenue: ${payload[0].value.toLocaleString()} MAD`}
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
          data={sortedData}
          margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={true} vertical={false} />
          <XAxis 
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            dataKey="name" 
            type="category"
            width={100}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.percentage || 0)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PsiServiceChart;
