
import React, { useState } from 'react';
import { toast } from 'sonner';
import { parseCSV, processAnalyticsData } from '../data/dataProcessing';
import { AnalyticsData } from '../data/types';
import FileDropZone from './FileDropZone';
import SampleDownloadButton from './SampleDownloadButton';

// Export the AnalyticsData type for other components
export type { AnalyticsData } from '../data/types';

interface FileUploadComponentProps {
  onDataProcessed: (data: AnalyticsData | null) => void;
}

const FileUploadComponent: React.FC<FileUploadComponentProps> = ({ onDataProcessed }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
        let parsedData;
        
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
        onDataProcessed(analyticsData);
        
        setIsUploading(false);
        toast.success(`${file.name} processed successfully`);
      } catch (error) {
        console.error('Error processing file:', error);
        toast.error('Error processing file. Please check the format.');
        setIsUploading(false);
        onDataProcessed(null);
      }
    };
    
    reader.onerror = () => {
      toast.error('Error reading file');
      setIsUploading(false);
      onDataProcessed(null);
    };

    if (file.name.endsWith('.json')) {
      reader.readAsText(file);
    } else {
      reader.readAsText(file); // For CSV also read as text
    }
  };

  return (
    <div className="dashboard-card">
      <h2 className="text-lg font-semibold mb-4">Import Your Data</h2>
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
