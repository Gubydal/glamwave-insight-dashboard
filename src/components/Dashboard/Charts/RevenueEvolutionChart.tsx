
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import EnhancedChartContainer from './EnhancedChartContainer';
import { ChartDataItem } from '../data/types';

interface RevenueEvolutionChartProps {
  data?: ChartDataItem[];
}

const RevenueEvolutionChart: React.FC<RevenueEvolutionChartProps> = ({ data = [] }) => {
  // Sample data based on the image
  const defaultData = [
    { name: 'Apr 10', value: 10000 },
    { name: 'Apr 12', value: 5000 },
    { name: 'Apr 15', value: 6000 },
    { name: 'Apr 16', value: 4000 },
    { name: 'Apr 18', value: 3000 },
    { name: 'Apr 20', value: 2000 },
    { name: 'Apr 22', value: 2000 },
    { name: 'Apr 24', value: 2500 },
    { name: 'Apr 26', value: 3000 },
    { name: 'Apr 28', value: 11000 },
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-salon-tertiary/20">
          <p className="font-semibold text-salon-heading">{`${label}`}</p>
          <p className="text-salon-primary font-medium">{`${payload[0].value.toLocaleString()} MAD`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <EnhancedChartContainer title="Revenue Evolution (Last 7 Transaction Days)">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 30, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
          <XAxis 
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#333', fontSize: 12 }}
            label={{ value: 'Transaction Date', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#333', fontSize: 12 }}
            label={{ value: 'Revenue (MAD)', angle: -90, position: 'insideLeft' }}
            tickFormatter={(value) => `${value / 1000}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#FA8072" 
            strokeWidth={2}
            activeDot={{ r: 8, fill: '#FA8072', stroke: '#fff', strokeWidth: 2 }}
            dot={{ r: 4, fill: '#FA8072', stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </EnhancedChartContainer>
  );
};

export default RevenueEvolutionChart;
