
import React from 'react';
import { ArrowUp, ArrowDown, TrendingUp, Users, CalendarDays, CircleDot } from 'lucide-react';
import { AnalyticsData } from './FileUpload';

interface KpiCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ReactNode;
  isEmpty?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, trend, icon, isEmpty = false }) => {
  return (
    <div className="dashboard-card">
      <div className="flex justify-between items-start">
        <div>
          <div className="kpi-label">{title}</div>
          {!isEmpty ? (
            <div className="kpi-value flex items-center">
              {value}
              {trend && (
                <span className={trend.isPositive ? "trend-up" : "trend-down"}>
                  {trend.isPositive ? <ArrowUp className="h-3 w-3 inline mr-0.5" /> : <ArrowDown className="h-3 w-3 inline mr-0.5" />}
                  {trend.value}%
                </span>
              )}
            </div>
          ) : (
            <div className="kpi-value text-salon-tertiary/70">No data</div>
          )}
        </div>
        <div className={`p-2 rounded-full ${isEmpty ? 'bg-salon-tertiary/10 text-salon-tertiary/50' : 'bg-salon-primary/10 text-salon-primary'}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

interface KpiCardsProps {
  analyticsData: AnalyticsData | null;
}

const KpiCards: React.FC<KpiCardsProps> = ({ analyticsData }) => {
  const hasData = analyticsData !== null;
  const currency = analyticsData?.currency || 'MAD';
  
  const kpiData = [
    {
      title: 'Total Revenue',
      value: hasData ? `${analyticsData.totalRevenue.toLocaleString()} ${currency}` : '',
      trend: hasData ? { value: 12, isPositive: true } : undefined,
      icon: <TrendingUp className="h-5 w-5" />,
      isEmpty: !hasData
    },
    {
      title: 'Total Transactions',
      value: hasData ? analyticsData.totalTransactions.toLocaleString() : '',
      trend: hasData ? { value: 8, isPositive: true } : undefined,
      icon: <CircleDot className="h-5 w-5" />,
      isEmpty: !hasData
    },
    {
      title: 'Total Customers',
      value: hasData ? analyticsData.totalCustomers.toLocaleString() : '',
      trend: hasData ? { value: 5, isPositive: true } : undefined,
      icon: <Users className="h-5 w-5" />,
      isEmpty: !hasData
    },
    {
      title: 'Average Lead Time',
      value: hasData ? `${analyticsData.averageLeadTime.toFixed(1)} days` : '',
      trend: hasData ? { value: 2, isPositive: false } : undefined,
      icon: <CalendarDays className="h-5 w-5" />,
      isEmpty: !hasData
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
          isEmpty={kpi.isEmpty}
        />
      ))}
    </div>
  );
};

export default KpiCards;
