
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import EnhancedChartContainer from './EnhancedChartContainer';

interface ServiceRevenueData {
  name: string;
  revenue: number;
}

const ServiceRevenueChart: React.FC = () => {
  // Mock data
  const data: ServiceRevenueData[] = [
    { name: 'Hair', revenue: 15800 },
    { name: 'Facial', revenue: 12400 },
    { name: 'Manicure', revenue: 5300 },
    { name: 'Pedicure', revenue: 4700 },
    { name: 'Massage', revenue: 7550 },
  ];

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

  const colors = [
    '#FA8072', // salon-primary
    '#E76A5F', // salon-secondary
    '#FAAA9F', // salon-tertiary
    '#F98B7E', // salon-light
    '#E76A5F', // salon-secondary again
  ];

  return (
    <EnhancedChartContainer title="Revenue by Service Category">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            {colors.map((color, index) => (
              <linearGradient 
                key={`gradient-${index}`} 
                id={`barGradient${index}`} 
                x1="0" y1="0" 
                x2="0" y2="1"
              >
                <stop offset="0%" stopColor={color} stopOpacity={1} />
                <stop offset="95%" stopColor={color} stopOpacity={0.8} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
          <XAxis 
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#333', fontSize: 12 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#333', fontSize: 12 }}
            tickFormatter={(value) => `${value / 1000}k`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f5f5f5' }} />
          <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`url(#barGradient${index % colors.length})`} 
                stroke={colors[index % colors.length]} 
                strokeWidth={1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </EnhancedChartContainer>
  );
};

export default ServiceRevenueChart;
