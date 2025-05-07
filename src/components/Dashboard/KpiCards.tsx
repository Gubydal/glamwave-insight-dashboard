
import React, { useState } from 'react';
import { ArrowUp, ArrowDown, TrendingUp, Users, CalendarDays, CircleDot, Percent, Star, CreditCard, ThermometerSun, ChevronDown, ChevronUp } from 'lucide-react';
import { AnalyticsData } from './data/types';
import RevenueChart from './Charts/KpiCharts/RevenueChart';
import TransactionsChart from './Charts/KpiCharts/TransactionsChart';
import OccupancyChart from './Charts/KpiCharts/OccupancyChart';
import PsiServiceChart from './Charts/KpiCharts/PsiServiceChart';
import PsiClientChart from './Charts/KpiCharts/PsiClientChart';

interface KpiCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ReactNode;
  isEmpty?: boolean;
  chart?: React.ReactNode;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, trend, icon, isEmpty = false, chart }) => {
  const [showChart, setShowChart] = useState(false);

  return (
    <div className={`dashboard-card ${chart ? 'hover:border-salon-primary/50 transition-colors' : ''}`}>
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
      
      {chart && (
        <div>
          <button 
            onClick={() => setShowChart(!showChart)}
            className="flex items-center text-xs text-salon-primary mt-2 hover:text-salon-secondary transition-colors"
          >
            {showChart ? (
              <>Hide Chart <ChevronUp className="h-3 w-3 ml-1" /></>
            ) : (
              <>Show Chart <ChevronDown className="h-3 w-3 ml-1" /></>
            )}
          </button>
          
          {showChart && (
            <div className="mt-4 border-t pt-4">
              {chart}
            </div>
          )}
        </div>
      )}
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
      value: hasData ? `${analyticsData.totalRevenue.toLocaleString()} ${currency}` : '42,800 MAD',
      trend: hasData ? { value: 12, isPositive: true } : undefined,
      icon: <TrendingUp className="h-5 w-5" />,
      isEmpty: !hasData,
      chart: hasData ? <RevenueChart data={analyticsData.revenueByService} /> : null
    },
    {
      title: 'Total Transactions',
      value: hasData ? analyticsData.totalTransactions.toLocaleString() : '28',
      trend: hasData ? { value: 8, isPositive: true } : undefined,
      icon: <CircleDot className="h-5 w-5" />,
      isEmpty: !hasData,
      chart: hasData ? <TransactionsChart data={analyticsData.transactionsByDay} /> : null
    },
    {
      title: 'Occupancy Rate',
      value: hasData ? `${analyticsData.occupancyRate?.toFixed(2)}%` : '596.67%',
      trend: hasData ? { value: 15, isPositive: true } : undefined,
      icon: <Percent className="h-5 w-5" />,
      isEmpty: !hasData,
      chart: hasData ? <OccupancyChart data={analyticsData.occupancyByDay} /> : null
    },
    {
      title: 'Best Seller',
      value: hasData ? analyticsData.bestSeller : 'Hammam Evasion',
      icon: <Star className="h-5 w-5" />,
      isEmpty: !hasData
    },
    {
      title: 'Average Order Value',
      value: hasData ? `${analyticsData.averageOrderValue?.toLocaleString()} ${currency}` : '1528.57 MAD',
      trend: hasData ? { value: 5, isPositive: true } : undefined,
      icon: <CreditCard className="h-5 w-5" />,
      isEmpty: !hasData
    },
    {
      title: 'Average Lead Time',
      value: hasData ? `${analyticsData.averageLeadTime.toFixed(2)} days` : '3.25 days',
      trend: hasData ? { value: 2, isPositive: false } : undefined,
      icon: <CalendarDays className="h-5 w-5" />,
      isEmpty: !hasData
    },
    {
      title: 'PSI (per client)',
      value: hasData ? `${analyticsData.psiClient?.toFixed(2)}%` : '60.08%',
      trend: hasData ? { value: 3, isPositive: false } : undefined,
      icon: <ThermometerSun className="h-5 w-5" />,
      isEmpty: !hasData,
      chart: hasData ? <PsiClientChart data={analyticsData.psiByClient} /> : null
    },
    {
      title: 'PSI (per service)',
      value: hasData ? `${analyticsData.psiService?.toFixed(2)}%` : '58.39%',
      trend: hasData ? { value: 1, isPositive: false } : undefined,
      icon: <Users className="h-5 w-5" />,
      isEmpty: !hasData,
      chart: hasData ? <PsiServiceChart data={analyticsData.psiByService} /> : null
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
          chart={kpi.chart}
        />
      ))}
    </div>
  );
};

export default KpiCards;
