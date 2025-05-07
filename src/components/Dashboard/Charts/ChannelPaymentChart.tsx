
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ChartDataItem } from '../data/types';

interface ChannelPaymentChartProps {
  channelData?: ChartDataItem[];
  paymentData?: ChartDataItem[];
}

const ChannelPaymentChart: React.FC<ChannelPaymentChartProps> = ({ 
  channelData = [], 
  paymentData = [] 
}) => {
  const CHANNEL_COLORS = ['#FA8072', '#F98B7E', '#F29C92', '#E76A5F'];
  const PAYMENT_COLORS = ['#FAAA9F', '#F29C92', '#FA8072', '#E76A5F'];

  const defaultData = [{ name: 'No data', value: 100 }];

  const renderChannelData = channelData.length > 0 ? channelData : defaultData;
  const renderPaymentData = paymentData.length > 0 ? paymentData : defaultData;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 shadow-md rounded-md border border-gray-200">
          <p className="font-semibold">{`${payload[0].name}`}</p>
          <p className="text-salon-primary">
            {payload[0].value === 100 && payload[0].name === 'No data' 
              ? '' 
              : `${payload[0].value.toFixed(1)}%`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (!channelData && !paymentData) {
    return (
      <div className="dashboard-card">
        <h2 className="text-lg font-semibold mb-4">Channel & Payment Distribution</h2>
        <div className="flex justify-center items-center h-64 bg-gray-50 rounded-md">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <h2 className="text-lg font-semibold mb-4">Channel & Payment Distribution</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={renderChannelData}
              cx="25%"
              cy="50%"
              outerRadius={60}
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => 
                name !== 'No data' ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
              }
              labelLine={false}
            >
              {renderChannelData.map((entry, index) => (
                <Cell 
                  key={`channel-cell-${index}`} 
                  fill={entry.name === 'No data' ? '#f0f0f0' : CHANNEL_COLORS[index % CHANNEL_COLORS.length]} 
                />
              ))}
            </Pie>
            <Pie
              data={renderPaymentData}
              cx="75%"
              cy="50%"
              outerRadius={60}
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => 
                name !== 'No data' ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
              }
              labelLine={false}
            >
              {renderPaymentData.map((entry, index) => (
                <Cell 
                  key={`payment-cell-${index}`} 
                  fill={entry.name === 'No data' ? '#f0f0f0' : PAYMENT_COLORS[index % PAYMENT_COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-around mt-2 text-xs text-center">
        <div>Acquisition Channels</div>
        <div>Payment Methods</div>
      </div>
    </div>
  );
};

export default ChannelPaymentChart;
