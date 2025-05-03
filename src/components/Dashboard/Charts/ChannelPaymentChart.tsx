
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Button } from '@/components/ui/button';

interface ChartData {
  name: string;
  value: number;
}

const ChannelPaymentChart: React.FC = () => {
  const [chartType, setChartType] = useState<'channel' | 'payment'>('channel');
  
  // Mock data
  const channelData: ChartData[] = [
    { name: 'Social Media', value: 45 },
    { name: 'Website', value: 30 },
    { name: 'Walk-in', value: 15 },
    { name: 'Referral', value: 10 },
  ];
  
  const paymentData: ChartData[] = [
    { name: 'Credit Card', value: 65 },
    { name: 'Cash', value: 20 },
    { name: 'Mobile Payment', value: 10 },
    { name: 'Other', value: 5 },
  ];

  const data = chartType === 'channel' ? channelData : paymentData;
  
  const COLORS = ['#FA8072', '#E76A5F', '#FAAA9F', '#F98B7E'];
  
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-salon-tertiary/20">
          <p className="font-semibold text-salon-heading">{`${payload[0].name}`}</p>
          <p className="text-salon-primary font-medium">{`${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-card h-80">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          {chartType === 'channel' ? 'Channel Distribution' : 'Payment Methods'}
        </h2>
        <div className="flex rounded-md overflow-hidden border border-salon-tertiary/30">
          <Button
            variant="ghost"
            size="sm"
            className={`px-3 py-1 text-xs rounded-none ${
              chartType === 'channel' 
                ? 'bg-salon-primary text-white' 
                : 'bg-white text-salon-text hover:bg-salon-primary/10'
            }`}
            onClick={() => setChartType('channel')}
          >
            Channels
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`px-3 py-1 text-xs rounded-none ${
              chartType === 'payment' 
                ? 'bg-salon-primary text-white' 
                : 'bg-white text-salon-text hover:bg-salon-primary/10'
            }`}
            onClick={() => setChartType('payment')}
          >
            Payment
          </Button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center"
            formatter={(value, entry, index) => <span className="text-sm text-salon-text">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChannelPaymentChart;
