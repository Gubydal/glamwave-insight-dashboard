
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import EnhancedChartContainer from './EnhancedChartContainer';
import { ChartDataItem } from '../data/types';

interface ConfirmationStatusChartProps {
  data?: ChartDataItem[];
}

const ConfirmationStatusChart: React.FC<ConfirmationStatusChartProps> = ({ data = [] }) => {
  // Sample data based on the image
  const defaultData = [
    { name: 'Confirmé', value: 63, percentage: 63 },
    { name: "En attente de confirmation", value: 31, percentage: 31 },
    { name: "Annulé", value: 6, percentage: 6 },
  ];

  const chartData = data && data.length > 0 ? data : defaultData;
  
  const COLORS = ['#FA8072', '#FAAA9F', '#F98B7E'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-salon-tertiary/20">
          <p className="font-semibold text-salon-heading">{payload[0].name}</p>
          <p className="text-salon-primary font-medium">
            {`${payload[0].value} bookings (${payload[0].payload.percentage}%)`}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ 
    cx, cy, midAngle, innerRadius, outerRadius, percent, index, name 
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight={500}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <EnhancedChartContainer title="Confirmation Status Distribution">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend layout="vertical" verticalAlign="middle" align="right" />
        </PieChart>
      </ResponsiveContainer>
    </EnhancedChartContainer>
  );
};

export default ConfirmationStatusChart;
