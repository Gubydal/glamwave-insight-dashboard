
import React, { useState, useEffect } from 'react';
import DashboardHeader from './DashboardHeader';
import FileUploadComponent, { AnalyticsData } from './FileUpload';
import FilterPanel from './FilterPanel';
import KpiCards from './KpiCards';
import ServiceOccupancyTable from './ServiceOccupancyTable';
import ServiceRevenueChart from './Charts/ServiceRevenueChart';
import EmployeePerformanceChart from './Charts/EmployeePerformanceChart';
import ChannelPaymentChart from './Charts/ChannelPaymentChart';
import LoyaltyChart from './Charts/LoyaltyChart';
import { SalonDataRow, FilterState } from './data/types';
import { getFilterOptions, processAnalyticsData } from './data/dataProcessing';

const Dashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [rawData, setRawData] = useState<SalonDataRow[]>([]);
  const [filterOptions, setFilterOptions] = useState({
    serviceCategories: ['All Categories'],
    employees: ['All Employees'],
    loyaltyStages: ['All Stages']
  });
  
  const handleDataProcessed = (data: AnalyticsData | null, originalData: SalonDataRow[]) => {
    console.log("Data processed:", data);
    setAnalyticsData(data);
    setRawData(originalData);
    
    // Extract filter options from data
    if (originalData && originalData.length > 0) {
      setFilterOptions(getFilterOptions(originalData));
    }
  };
  
  const handleFilterChange = (filters: FilterState) => {
    console.log("Filters applied:", filters);
    
    // Process data with filters
    if (rawData.length > 0) {
      const filteredData = processAnalyticsData(rawData, filters);
      setAnalyticsData(filteredData);
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <DashboardHeader />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-1">
          <FileUploadComponent onDataProcessed={handleDataProcessed} />
        </div>
        <div className="md:col-span-2">
          <FilterPanel 
            initialOptions={filterOptions} 
            onFilterChange={handleFilterChange} 
          />
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
            <ChannelPaymentChart 
              channelData={analyticsData.revenueByService}
              paymentData={analyticsData.transactionsByDay}
            />
            <LoyaltyChart 
              data={analyticsData.employeePerformance}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
