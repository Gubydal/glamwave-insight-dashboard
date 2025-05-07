
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [rawData, setRawData] = useState<SalonDataRow[]>([]);
  const [filterOptions, setFilterOptions] = useState({
    serviceCategories: ['All Categories'],
    employees: ['All Employees'],
    loyaltyStages: ['All Stages']
  });
  
  const handleDataProcessed = async (data: AnalyticsData | null, originalData: SalonDataRow[]) => {
    console.log("Data processed:", data);
    setAnalyticsData(data);
    setRawData(originalData);
    
    // Extract filter options from data
    if (originalData && originalData.length > 0) {
      setFilterOptions(getFilterOptions(originalData));
    }
    
    // Store the uploaded data in Supabase if user is authenticated
    if (user && originalData && originalData.length > 0) {
      try {
        // Store summary data in Supabase
        const summaryData = {
          title: `Dashboard Upload - ${new Date().toLocaleDateString()}`,
          description: `Contains ${originalData.length} records from dashboard upload`,
          data_type: 'dashboard_upload',
          value: data?.totalRevenue || 0,
          user_id: user.id
        };
        
        const { error } = await supabase.from('user_data').insert(summaryData);
        
        if (error) throw error;
        
        toast({
          title: "Data saved successfully",
          description: "Your uploaded data has been saved to your account"
        });
      } catch (error: any) {
        console.error("Error saving data:", error);
        toast({
          title: "Error saving data",
          description: error.message,
          variant: "destructive"
        });
      }
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
      
      {/* Reduced height for import and filter boxes, positioned in a compact layout */}
      <div className="flex flex-wrap gap-6 mb-6">
        <div className="w-full md:w-[calc(50%-12px)] lg:w-[calc(50%-12px)]">
          <FileUploadComponent onDataProcessed={handleDataProcessed} />
        </div>
        <div className="w-full md:w-[calc(50%-12px)] lg:w-[calc(50%-12px)]">
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
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium mb-4">Revenue by Service</h3>
              <ServiceRevenueChart />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium mb-4">Employee Performance</h3>
              <EmployeePerformanceChart />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <ChannelPaymentChart 
                channelData={analyticsData.revenueByService}
                paymentData={analyticsData.transactionsByDay}
              />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <LoyaltyChart 
                data={analyticsData.employeePerformance}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
