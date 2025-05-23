
import React, { useState, useEffect } from 'react';
import DashboardHeader from './DashboardHeader';
import FileUploadComponent from './FileUpload';
import FilterPanel from './FilterPanel';
import KpiCards from './KpiCards';
import ServiceOccupancyTable from './ServiceOccupancyTable';
import { SalonDataRow, FilterState, AnalyticsData } from './data/types';
import { getFilterOptions, processAnalyticsData } from './data/dataProcessing';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import RevenueEvolutionChart from './Charts/RevenueEvolutionChart';
import TopCustomersChart from './Charts/TopCustomersChart';
import LoyaltyOrderValueChart from './Charts/LoyaltyOrderValueChart';
import ConfirmationStatusChart from './Charts/ConfirmationStatusChart';

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
        // Store the full raw data
        const rawDataPayload = {
          file_name: `Dashboard Upload - ${new Date().toLocaleDateString()}`,
          description: `Contains ${originalData.length} records from dashboard upload`,
          data: originalData, // Store the complete raw data as JSON
          user_id: user.id
        };
        
        const { data: storedData, error } = await supabase
          .from('raw_dashboard_data')
          .insert(rawDataPayload)
          .select('id');
        
        if (error) throw error;
        
        // Store summary data in user_data table
        const summaryData = {
          title: `Dashboard Upload - ${new Date().toLocaleDateString()}`,
          description: `Contains ${originalData.length} records from dashboard upload`,
          data_type: 'dashboard_upload',
          value: data?.totalRevenue || 0,
          user_id: user.id
        };
        
        const { error: summaryError } = await supabase
          .from('user_data')
          .insert(summaryData);
        
        if (summaryError) throw summaryError;
        
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
      
      {/* Optimized layout for import and filter boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <FileUploadComponent onDataProcessed={handleDataProcessed} />
        <FilterPanel 
          initialOptions={filterOptions} 
          onFilterChange={handleFilterChange} 
          compact={true}
        />
      </div>
      
      <KpiCards analyticsData={analyticsData} />
      
      {analyticsData && (
        <>
          {/* Full width revenue evolution chart */}
          <div className="mb-6">
            <RevenueEvolutionChart data={analyticsData.revenueByService} />
          </div>
          
          {/* Two column layout for charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <TopCustomersChart data={analyticsData.employeePerformance} />
            <LoyaltyOrderValueChart data={analyticsData.employeePerformance} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <ConfirmationStatusChart />
            <ServiceOccupancyTable />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
