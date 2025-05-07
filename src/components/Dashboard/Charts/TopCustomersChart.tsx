
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import EnhancedChartContainer from './EnhancedChartContainer';
import { ChartDataItem } from '../data/types';

interface TopCustomersChartProps {
  data?: ChartDataItem[];
}

const TopCustomersChart: React.FC<TopCustomersChartProps> = ({ data = [] }) => {
  // Sample data based on the image
  const defaultData = [
    { 
      name: 'Samira Chadli', 
      value: 3500, 
      loyaltyInfo: 'Loyalty: VIP | Points: 193 | Visits: 1 | Preferred: Hammam Massage' 
    },
    { 
      name: 'Fatima El Amrani', 
      value: 3800, 
      loyaltyInfo: 'Loyalty: Silver | Points: 115 | Visits: 2 | Preferred: Pedicure spa'
    },
    { 
      name: 'Jamila al Sarhaoui', 
      value: 4000, 
      loyaltyInfo: 'Loyalty: Basic | Points: 90 | Visits: 4 | Preferred: Pedicure spa'
    },
    { 
      name: 'Farida Benkirane', 
      value: 4000, 
      loyaltyInfo: 'Loyalty: VIP | Points: 189 | Visits: 1 | Preferred: Makeup makeover'
    },
    { 
      name: 'Asmae Haniouchi', 
      value: 12800, 
      loyaltyInfo: 'Loyalty: Basic | Points: 190 | Visits: 7 | Preferred: Hammam Fusion'
    },
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const customer = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-salon-tertiary/20 max-w-xs">
          <p className="font-semibold text-salon-heading mb-1">{label}</p>
          <p className="text-salon-primary font-medium mb-1">
            {`${payload[0].value.toLocaleString()} MAD`}
          </p>
          <p className="text-xs text-gray-600">{customer.loyaltyInfo}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <EnhancedChartContainer title="Top 5 Customers by Spend">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 80, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={true} vertical={false} />
          <XAxis 
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#333', fontSize: 12 }}
            label={{ value: 'Total Spend (MAD)', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#333', fontSize: 11 }}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="value" 
            fill="#FA8072"
            radius={[0, 4, 4, 0]}
          >
            <LabelList dataKey="value" position="right" formatter={(value: number) => `${value.toLocaleString()} MAD`} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </EnhancedChartContainer>
  );
};

export default TopCustomersChart;
