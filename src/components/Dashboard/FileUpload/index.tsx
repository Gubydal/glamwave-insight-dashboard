
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { parseCSV, processAnalyticsData } from '../data/dataProcessing';
import { AnalyticsData, SalonDataRow } from '../data/types';
import FileDropZone from './FileDropZone';
import SampleDownloadButton from './SampleDownloadButton';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database, File, Settings } from 'lucide-react';

// Export the AnalyticsData type for other components
export type { AnalyticsData } from '../data/types';

interface FileUploadComponentProps {
  onDataProcessed: (data: AnalyticsData | null, rawData: SalonDataRow[]) => void;
}

interface StoredDataItem {
  id: string;
  file_name: string;
  description: string | null;
  created_at: string;
}

const FileUploadComponent: React.FC<FileUploadComponentProps> = ({ onDataProcessed }) => {
  const { user } = useAuth();
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [storedData, setStoredData] = useState<StoredDataItem[]>([]);
  const [isLoadingStoredData, setIsLoadingStoredData] = useState(false);

  // Fetch stored data
  useEffect(() => {
    if (user) {
      fetchStoredData();
    }
  }, [user]);

  const fetchStoredData = async () => {
    if (!user) return;
    
    setIsLoadingStoredData(true);
    try {
      const { data, error } = await supabase
        .from('raw_dashboard_data')
        .select('id, file_name, description, created_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setStoredData(data || []);
    } catch (error) {
      console.error('Error fetching stored data:', error);
      toast.error('Failed to load your saved data');
    } finally {
      setIsLoadingStoredData(false);
    }
  };

  const processFile = (file: File) => {
    // Check if the file is a CSV or JSON
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.json')) {
      toast.error('Please upload a CSV or JSON file');
      return;
    }

    setFileName(file.name);
    setIsUploading(true);

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        let parsedData: SalonDataRow[];
        
        if (file.name.endsWith('.json')) {
          const fileContent = e.target?.result as string;
          parsedData = JSON.parse(fileContent);
        } else if (file.name.endsWith('.csv')) {
          // Use our CSV parser
          const fileContent = e.target?.result as string;
          parsedData = parseCSV(fileContent);
        }
        
        console.log('Parsed data:', parsedData.slice(0, 2)); // Log first 2 items for debugging
        
        // Process data into our analytics format
        const analyticsData = processAnalyticsData(parsedData);
        console.log('Processed analytics data:', analyticsData);
        
        // Send the data back to parent component
        onDataProcessed(analyticsData, parsedData);
        
        setIsUploading(false);
        toast.success(`${file.name} processed successfully`);
      } catch (error) {
        console.error('Error processing file:', error);
        toast.error('Error processing file. Please check the format.');
        setIsUploading(false);
        onDataProcessed(null, []);
      }
    };
    
    reader.onerror = () => {
      toast.error('Error reading file');
      setIsUploading(false);
      onDataProcessed(null, []);
    };

    if (file.name.endsWith('.json')) {
      reader.readAsText(file);
    } else {
      reader.readAsText(file); // For CSV also read as text
    }
  };

  const handleStoredDataSelect = async (dataId: string) => {
    if (!dataId) return;
    
    try {
      setIsUploading(true);
      
      // Get the data item details to show the name
      const { data: dataItem } = await supabase
        .from('raw_dashboard_data')
        .select('file_name, data')
        .eq('id', dataId)
        .single();
      
      if (!dataItem) {
        throw new Error('Data not found');
      }
      
      setFileName(dataItem.file_name);
      
      // Get the actual stored data
      const rawData = dataItem.data as SalonDataRow[];
      const analyticsData = processAnalyticsData(rawData);
      
      toast.success(`${dataItem.file_name} loaded successfully`);
      setIsUploading(false);
      
      // Send the processed data back to parent component
      onDataProcessed(analyticsData, rawData);
      
    } catch (error) {
      console.error('Error loading stored data:', error);
      toast.error('Failed to load the selected data');
      setIsUploading(false);
      onDataProcessed(null, []);
    }
  };

  return (
    <div className="dashboard-card max-h-64">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <Database className="h-5 w-5 text-salon-primary mr-2" />
          <h2 className="text-lg font-semibold">Import Data</h2>
        </div>
        {user && (
          <div className="flex items-center">
            <Select onValueChange={handleStoredDataSelect}>
              <SelectTrigger className="w-[180px] h-8 text-xs">
                <SelectValue placeholder="Previous uploads" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingStoredData ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : storedData.length === 0 ? (
                  <SelectItem value="none" disabled>No saved data</SelectItem>
                ) : (
                  storedData.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.file_name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      <FileDropZone 
        onFileSelected={processFile} 
        isUploading={isUploading}
        fileName={fileName}
      />
      <SampleDownloadButton />
    </div>
  );
};

export default FileUploadComponent;
