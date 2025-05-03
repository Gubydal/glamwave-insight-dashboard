
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface LoyaltyData {
  stage: string;
  customers: number;
  retention: number;
}

const LoyaltyChart: React.FC = () => {
  // Mock data
  const data: LoyaltyData[] = [
    { stage: 'Bronze', customers: 42, retention: 60 },
    { stage: 'Silver', customers: 28, retention: 75 },
    { stage: 'Gold', customers: 18, retention: 88 },
    { stage: 'Platinum', customers: 10, retention: 95 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-salon-tertiary/20">
          <p className="font-semibold text-salon-heading">{`${label}`}</p>
          <p className="text-salon-primary font-medium">{`${payload[0].value} customers`}</p>
          <p className="text-sm text-salon-text/70">{`${data.find(d => d.stage === label)?.retention}% retention rate`}</p>
        </div>
      );
    }
    return null;
  };

  const colors = ['#FAAA9F', '#F98B7E', '#FA8072', '#E76A5F'];

  return (
    <div className="dashboard-card h-80">
      <h2 className="text-lg font-semibold mb-4">Customer Loyalty Distribution</h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
          <XAxis 
            dataKey="stage"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#333', fontSize: 12 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#333', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f5f5f5' }} />
          <Bar dataKey="customers" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LoyaltyChart;
