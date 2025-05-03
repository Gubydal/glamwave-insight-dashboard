
import React from 'react';
import { ArrowUp, ArrowDown, TrendingUp, Users, CalendarDays, CircleDot } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  trend: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ReactNode;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, trend, icon }) => {
  return (
    <div className="dashboard-card">
      <div className="flex justify-between items-start">
        <div>
          <div className="kpi-label">{title}</div>
          <div className="kpi-value flex items-center">
            {value}
            <span className={trend.isPositive ? "trend-up" : "trend-down"}>
              {trend.isPositive ? <ArrowUp className="h-3 w-3 inline mr-0.5" /> : <ArrowDown className="h-3 w-3 inline mr-0.5" />}
              {trend.value}%
            </span>
          </div>
        </div>
        <div className="p-2 rounded-full bg-salon-primary/10 text-salon-primary">
          {icon}
        </div>
      </div>
    </div>
  );
};

const KpiCards: React.FC = () => {
  const kpiData = [
    {
      title: 'Total Revenue',
      value: '45,750 MAD',
      trend: { value: 12, isPositive: true },
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      title: 'Total Transactions',
      value: '172',
      trend: { value: 8, isPositive: true },
      icon: <CircleDot className="h-5 w-5" />
    },
    {
      title: 'Total Customers',
      value: '98',
      trend: { value: 5, isPositive: true },
      icon: <Users className="h-5 w-5" />
    },
    {
      title: 'Average Lead Time',
      value: '4.2 days',
      trend: { value: 2, isPositive: false },
      icon: <CalendarDays className="h-5 w-5" />
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {kpiData.map((kpi, index) => (
        <KpiCard
          key={index}
          title={kpi.title}
          value={kpi.value}
          trend={kpi.trend}
          icon={kpi.icon}
        />
      ))}
    </div>
  );
};

export default KpiCards;
