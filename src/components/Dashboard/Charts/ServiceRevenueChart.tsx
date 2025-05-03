
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
    <div className="dashboard-card h-80">
      <h2 className="text-lg font-semibold mb-4">Revenue by Service Category</h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
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
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ServiceRevenueChart;
