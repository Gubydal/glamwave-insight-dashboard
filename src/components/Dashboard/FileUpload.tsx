
import React, { useState } from 'react';
import { Upload, Download, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Define a type for our analytics data
export interface AnalyticsData {
  totalRevenue: number;
  totalTransactions: number;
  totalCustomers: number;
  averageLeadTime: number;
  // Add additional data types as needed
  currency?: string;
}

interface FileUploadComponentProps {
  onDataProcessed: (data: AnalyticsData | null) => void;
}

const FileUploadComponent: React.FC<FileUploadComponentProps> = ({ onDataProcessed }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
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
        let parsedData;
        
        if (file.name.endsWith('.json')) {
          const fileContent = e.target?.result as string;
          parsedData = JSON.parse(fileContent);
        } else if (file.name.endsWith('.csv')) {
          // A simple CSV parser
          const fileContent = e.target?.result as string;
          parsedData = parseCSV(fileContent);
        }
        
        // Process data into our analytics format
        const analyticsData = processAnalyticsData(parsedData);
        
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

  // Simple CSV parser function
  const parseCSV = (csv: string) => {
    const lines = csv.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      
      const obj: Record<string, string | number> = {};
      const currentLine = lines[i].split(',');
      
      for (let j = 0; j < headers.length; j++) {
        // Try to convert to number if possible
        const value = currentLine[j]?.trim();
        obj[headers[j]] = !isNaN(Number(value)) ? Number(value) : value;
      }
      
      result.push(obj);
    }
    
    return result;
  };

  // Process the parsed data into our analytics format
  const processAnalyticsData = (data: any): AnalyticsData => {
    // Default empty data
    const analyticsData: AnalyticsData = {
      totalRevenue: 0,
      totalTransactions: 0,
      totalCustomers: 0,
      averageLeadTime: 0,
      currency: 'MAD'
    };
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return analyticsData;
    }

    try {
      // Calculate total revenue
      analyticsData.totalRevenue = data.reduce((sum, item) => {
        const amount = item.amount || item.revenue || item.price || 0;
        return sum + Number(amount);
      }, 0);
      
      // Count transactions (assuming each row is a transaction)
      analyticsData.totalTransactions = data.length;
      
      // Count unique customers (if we have a customer ID field)
      const uniqueCustomers = new Set();
      data.forEach(item => {
        const customerId = item.customerId || item.customer_id || item.clientId || item.client_id;
        if (customerId) uniqueCustomers.add(customerId);
      });
      analyticsData.totalCustomers = uniqueCustomers.size || Math.floor(data.length * 0.6); // Estimate if no IDs
      
      // Calculate average lead time if available
      const leadTimes = data
        .map(item => item.leadTime || item.lead_time || item.processingDays || item.processing_days)
        .filter(Boolean)
        .map(Number);
      
      if (leadTimes.length > 0) {
        const totalLeadTime = leadTimes.reduce((sum, time) => sum + time, 0);
        analyticsData.averageLeadTime = totalLeadTime / leadTimes.length;
      }

      // Determine currency if available
      const currencyField = data[0].currency || data[0].currencyCode || 'MAD';
      if (currencyField) {
        analyticsData.currency = currencyField;
      }
      
      return analyticsData;
    } catch (error) {
      console.error('Error processing analytics data:', error);
      return analyticsData;
    }
  };

  const handleButtonClick = () => {
    document.getElementById('file-input')?.click();
  };

  // Download sample file
  const downloadSample = () => {
    toast.info('Downloading sample file...');
    
    // Create a sample JSON file
    const sampleData = [
      {
        "transactionId": "T001",
        "customerId": "C001",
        "service": "Hair Treatment",
        "amount": 350,
        "date": "2023-01-15",
        "employee": "Emma Smith",
        "leadTime": 3,
        "currency": "MAD"
      },
      {
        "transactionId": "T002",
        "customerId": "C002",
        "service": "Facial",
        "amount": 450,
        "date": "2023-01-16",
        "employee": "John Doe",
        "leadTime": 2,
        "currency": "MAD"
      },
      {
        "transactionId": "T003",
        "customerId": "C001",
        "service": "Manicure",
        "amount": 200,
        "date": "2023-01-17",
        "employee": "Sarah Johnson",
        "leadTime": 1,
        "currency": "MAD"
      }
    ];
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sampleData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "salon_sample_data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="dashboard-card">
      <h2 className="text-lg font-semibold mb-4">Import Your Data</h2>
      <div 
        className={`border-2 border-dashed rounded-lg p-6 transition-all duration-200 text-center
          ${isDragging ? 'border-salon-primary bg-salon-primary/5' : 'border-salon-tertiary/30'}
          ${isUploading ? 'bg-salon-primary/5' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          id="file-input"
          type="file"
          accept=".csv,.json"
          className="hidden"
          onChange={handleFileChange}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center py-4">
            <div className="animate-pulse-gentle">
              <ArrowUp className="h-10 w-10 text-salon-primary mb-2" />
            </div>
            <p className="text-salon-secondary font-medium">Uploading {fileName}...</p>
            <div className="w-48 h-1.5 bg-salon-tertiary/30 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-salon-primary animate-pulse-gentle rounded-full"></div>
            </div>
          </div>
        ) : fileName ? (
          <div className="flex flex-col items-center py-4">
            <Upload className="h-10 w-10 text-salon-primary mb-2" />
            <p className="text-salon-heading font-medium">{fileName}</p>
            <p className="text-sm text-salon-text/70 mt-1">File ready for analysis</p>
            <Button 
              onClick={handleButtonClick}
              variant="outline" 
              size="sm"
              className="mt-4 border-salon-tertiary text-salon-secondary hover:bg-salon-primary/5"
            >
              Upload Another File
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center py-8">
            <Upload className="h-12 w-12 text-salon-tertiary mb-3" />
            <p className="text-salon-heading font-medium">Drag and drop your file here</p>
            <p className="text-sm text-salon-text/70 mt-1 mb-4">Supports CSV and JSON formats</p>
            <Button 
              onClick={handleButtonClick}
              className="bg-salon-primary hover:bg-salon-secondary text-white"
            >
              Browse Files
            </Button>
          </div>
        )}
      </div>
      
      <div className="flex justify-end mt-4">
        <Button 
          variant="ghost" 
          size="sm"
          className="text-salon-secondary flex items-center text-xs"
          onClick={downloadSample}
        >
          <Download className="h-3 w-3 mr-1" />
          Download Sample File
        </Button>
      </div>
    </div>
  );
};

export default FileUploadComponent;
