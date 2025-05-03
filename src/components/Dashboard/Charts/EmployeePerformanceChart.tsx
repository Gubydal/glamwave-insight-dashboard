
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Button } from '@/components/ui/button';

interface EmployeeData {
  name: string;
  revenue: number;
  transactions: number;
  average: number;
}

const EmployeePerformanceChart: React.FC = () => {
  const [metric, setMetric] = useState<'revenue' | 'average'>('revenue');

  // Mock data
  const data: EmployeeData[] = [
    { name: 'Emma S.', revenue: 12400, transactions: 48, average: 258.3 },
    { name: 'John D.', revenue: 9800, transactions: 35, average: 280.0 },
    { name: 'Sarah J.', revenue: 14200, transactions: 52, average: 273.1 },
    { name: 'Michael B.', revenue: 9350, transactions: 37, average: 252.7 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-salon-tertiary/20">
          <p className="font-semibold text-salon-heading">{`${label}`}</p>
          <p className="text-salon-primary font-medium">
            {metric === 'revenue' 
              ? `${payload[0].value.toLocaleString()} MAD` 
              : `${payload[0].value.toLocaleString()} MAD/transaction`}
          </p>
          <p className="text-sm text-salon-text/70">
            {metric === 'revenue' 
              ? `${data.find(d => d.name === label)?.transactions} transactions` 
              : `${data.find(d => d.name === label)?.revenue.toLocaleString()} MAD total`}
          </p>
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
  ];

  return (
    <div className="dashboard-card h-80">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Employee Performance</h2>
        <div className="flex rounded-md overflow-hidden border border-salon-tertiary/30">
          <Button
            variant="ghost"
            size="sm"
            className={`px-3 py-1 text-xs rounded-none ${
              metric === 'revenue' 
                ? 'bg-salon-primary text-white' 
                : 'bg-white text-salon-text hover:bg-salon-primary/10'
            }`}
            onClick={() => setMetric('revenue')}
          >
            Total Revenue
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`px-3 py-1 text-xs rounded-none ${
              metric === 'average' 
                ? 'bg-salon-primary text-white' 
                : 'bg-white text-salon-text hover:bg-salon-primary/10'
            }`}
            onClick={() => setMetric('average')}
          >
            Avg. Transaction
          </Button>
        </div>
      </div>
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
            tickFormatter={(value) => metric === 'revenue' ? `${value / 1000}k` : `${value}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f5f5f5' }} />
          <Bar dataKey={metric} radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EmployeePerformanceChart;
