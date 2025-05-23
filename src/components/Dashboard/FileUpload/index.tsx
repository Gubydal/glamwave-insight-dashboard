
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import FileDropZone from './FileDropZone';
import SampleDownloadButton from './SampleDownloadButton';
import { processAnalyticsData } from '../data/dataProcessing';
import { Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnalyticsData, SalonDataRow } from '../data/types';
import Papa from 'papaparse'; // Import PapaParse correctly

interface FileUploadComponentProps {
  onDataProcessed: (data: AnalyticsData | null, originalData: SalonDataRow[]) => void;
}

const FileUploadComponent: React.FC<FileUploadComponentProps> = ({ onDataProcessed }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [savedData, setSavedData] = useState<{ id: string; file_name: string; }[]>([]);
  const [selectedSavedData, setSelectedSavedData] = useState<string>('');

  // Fetch saved data when component mounts or user changes
  React.useEffect(() => {
    const fetchSavedData = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('raw_dashboard_data')
            .select('id, file_name')
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          
          if (data && data.length > 0) {
            setSavedData(data);
          }
        } catch (error) {
          console.error('Error fetching saved data:', error);
        }
      }
    };
    
    fetchSavedData();
  }, [user]);

  const handleLoadSavedData = async () => {
    if (!selectedSavedData) return;
    
    try {
      setIsUploading(true);
      
      const { data, error } = await supabase
        .from('raw_dashboard_data')
        .select('data')
        .eq('id', selectedSavedData)
        .single();
      
      if (error) throw error;
      
      if (data && data.data) {
        // Ensure data.data is an array of SalonDataRow
        const rawData = data.data as unknown as SalonDataRow[];
        if (Array.isArray(rawData)) {
          const processedData = processAnalyticsData(rawData);
          onDataProcessed(processedData, rawData);
          
          toast({
            title: "Data loaded successfully",
            description: `Loaded ${rawData.length} records from your saved data`
          });
        } else {
          throw new Error("Invalid data format");
        }
      }
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelected = async (file: File) => {
    setFileName(file.name);
    setIsUploading(true);

    try {
      // Parse the file based on its extension
      if (file.name.endsWith('.csv')) {
        Papa.parse(file, {
          header: true,
          complete: (result) => {
            const rawData = result.data as SalonDataRow[];
            const processedData = processAnalyticsData(rawData);
            onDataProcessed(processedData, rawData);
            setIsUploading(false);
            
            toast({
              title: "CSV file processed successfully",
              description: `Processed ${rawData.length} rows of data`
            });
          },
          error: (error) => {
            throw new Error(`CSV parsing error: ${error.message}`);
          }
        });
      } else if (file.name.endsWith('.json')) {
        const text = await file.text();
        const jsonData = JSON.parse(text) as SalonDataRow[];
        if (Array.isArray(jsonData)) {
          const processedData = processAnalyticsData(jsonData);
          onDataProcessed(processedData, jsonData);
          
          toast({
            title: "JSON file processed successfully",
            description: `Processed ${jsonData.length} records of data`
          });
        } else {
          throw new Error("JSON file must contain an array of records");
        }
        setIsUploading(false);
      } else {
        throw new Error("Unsupported file format. Please upload a CSV or JSON file.");
      }
    } catch (error: any) {
      setIsUploading(false);
      toast({
        title: "Error processing file",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="shadow-lg border-salon-tertiary/20">
      <CardHeader className="pb-3">
        <CardTitle>Import Data</CardTitle>
        <CardDescription>
          Upload a CSV file or drag and drop it here
        </CardDescription>
      </CardHeader>
      <CardContent>
        {savedData.length > 0 && (
          <div className="mb-4 space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={selectedSavedData} onValueChange={setSelectedSavedData}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select saved data" />
                </SelectTrigger>
                <SelectContent>
                  {savedData.map(item => (
                    <SelectItem key={item.id} value={item.id}>{item.file_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                className="bg-salon-primary" 
                onClick={handleLoadSavedData}
                disabled={!selectedSavedData || isUploading}
              >
                <Upload className="mr-2 h-4 w-4" /> 
                Load Data
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex flex-col space-y-4">
          <FileDropZone 
            onFileSelected={handleFileSelected} 
            isUploading={isUploading} 
            fileName={fileName}
          />
          <div className="mt-2 flex justify-center overflow-hidden text-ellipsis">
            <SampleDownloadButton />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUploadComponent;
