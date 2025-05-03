
import React, { useState } from 'react';
import DashboardHeader from './DashboardHeader';
import FileUploadComponent, { AnalyticsData } from './FileUpload';
import FilterPanel from './FilterPanel';
import KpiCards from './KpiCards';
import ServiceOccupancyTable from './ServiceOccupancyTable';
import ServiceRevenueChart from './Charts/ServiceRevenueChart';
import EmployeePerformanceChart from './Charts/EmployeePerformanceChart';
import ChannelPaymentChart from './Charts/ChannelPaymentChart';
import LoyaltyChart from './Charts/LoyaltyChart';

const Dashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  
  const handleDataProcessed = (data: AnalyticsData | null) => {
    console.log("Data processed:", data);
    setAnalyticsData(data);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <DashboardHeader />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-1">
          <FileUploadComponent onDataProcessed={handleDataProcessed} />
        </div>
        <div className="md:col-span-2">
          <FilterPanel />
        </div>
      </div>
      
      <KpiCards analyticsData={analyticsData} />
      
      {analyticsData && (
        <>
          <div className="mb-6">
            <ServiceOccupancyTable />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <ServiceRevenueChart />
            <EmployeePerformanceChart />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChannelPaymentChart />
            <LoyaltyChart />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
