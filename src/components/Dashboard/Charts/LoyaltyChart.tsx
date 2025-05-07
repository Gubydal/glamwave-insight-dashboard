
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { ChartDataItem } from '../data/types';

interface LoyaltyChartProps {
  data?: ChartDataItem[];
}

const LoyaltyChart: React.FC<LoyaltyChartProps> = ({ data = [] }) => {
  // Define custom colors for loyalty tiers
  const getLoyaltyColor = (stage: string) => {
    const colors: Record<string, string> = {
      'Bronze': '#CD7F32',
      'Silver': '#C0C0C0',
      'Gold': '#FFD700',
      'Platinum': '#E5E4E2'
    };
    
    return colors[stage] || '#FA8072';
  };

  const sortedData = [...data].sort((a, b) => b.value - a.value);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
          <p className="font-semibold">{`${label}`}</p>
          <p className="text-salon-primary font-medium">
            {`${payload[0].value} customers`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="dashboard-card">
        <h2 className="text-lg font-semibold mb-4">Customer Loyalty Distribution</h2>
        <div className="flex justify-center items-center h-64 bg-gray-50 rounded-md">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <h2 className="text-lg font-semibold mb-4">Customer Loyalty Distribution</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              radius={[4, 4, 0, 0]}
            >
              {sortedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={getLoyaltyColor(entry.name)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LoyaltyChart;
