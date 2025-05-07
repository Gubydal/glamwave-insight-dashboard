
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import EnhancedChartContainer from './EnhancedChartContainer';
import { ChartDataItem } from '../data/types';

interface LoyaltyOrderValueChartProps {
  data?: ChartDataItem[];
}

const LoyaltyOrderValueChart: React.FC<LoyaltyOrderValueChartProps> = ({ data = [] }) => {
  // Sample data based on the image
  const defaultData = [
    { name: 'VIP', value: 1986 },
    { name: 'Silver', value: 1588 },
    { name: 'Basic', value: 1323 },
    { name: 'Unknown', value: 0 },
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-salon-tertiary/20">
          <p className="font-semibold text-salon-heading">{`${label}`}</p>
          <p className="text-salon-primary font-medium">
            {`${payload[0].value.toLocaleString()} MAD`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <EnhancedChartContainer title="Average Order Value by Loyalty Stage">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
          <XAxis 
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#333', fontSize: 12 }}
            label={{ value: 'Loyalty Stage', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#333', fontSize: 12 }}
            label={{ value: 'Average Order Value (MAD)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="value" 
            fill="#FA8072"
            radius={[4, 4, 0, 0]}
          >
            <LabelList dataKey="value" position="top" formatter={(value: number) => `${value.toLocaleString()} MAD`} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </EnhancedChartContainer>
  );
};

export default LoyaltyOrderValueChart;
