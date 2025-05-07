
import React, { useState } from 'react';
import { Upload, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SalonDataRow, AnalyticsData } from '../data/types';

interface FileDropZoneProps {
  onFileSelected: (file: File) => void;
  isUploading: boolean;
  fileName: string | null;
  onDataProcessed?: (data: AnalyticsData | null, originalData: SalonDataRow[]) => void;
  className?: string; // Make sure className is defined in the interface
}

const FileDropZone: React.FC<FileDropZoneProps> = ({ 
  onFileSelected, 
  isUploading, 
  fileName,
  className = '' // Provide a default empty string
}) => {
  const [isDragging, setIsDragging] = useState(false);

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
      onFileSelected(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelected(files[0]);
    }
  };

  const handleButtonClick = () => {
    document.getElementById('file-input')?.click();
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-4 transition-all duration-200 text-center
        ${isDragging ? 'border-salon-primary bg-salon-primary/5' : 'border-salon-tertiary/30'}
        ${isUploading ? 'bg-salon-primary/5' : ''}
        ${className}`}
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
        <div className="flex flex-col items-center py-2">
          <div className="animate-pulse-gentle">
            <ArrowUp className="h-8 w-8 text-salon-primary mb-1" />
          </div>
          <p className="text-salon-secondary font-medium text-sm">Uploading {fileName}...</p>
          <div className="w-40 h-1.5 bg-salon-tertiary/30 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-salon-primary animate-pulse-gentle rounded-full"></div>
          </div>
        </div>
      ) : fileName ? (
        <div className="flex flex-col items-center py-2">
          <Upload className="h-8 w-8 text-salon-primary mb-1" />
          <p className="text-salon-heading font-medium text-sm">{fileName}</p>
          <p className="text-xs text-salon-text/70 mt-1">File ready for analysis</p>
          <Button 
            onClick={handleButtonClick}
            variant="outline" 
            size="sm"
            className="mt-2 border-salon-tertiary text-salon-secondary hover:bg-salon-primary/5 text-xs py-1 h-7"
          >
            Upload Another File
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center py-4">
          <Upload className="h-10 w-10 text-salon-tertiary mb-2" />
          <p className="text-salon-heading font-medium text-sm">Drag and drop your file here</p>
          <p className="text-xs text-salon-text/70 mt-1 mb-2">Supports CSV and JSON formats</p>
          <Button 
            onClick={handleButtonClick}
            size="sm"
            className="bg-salon-primary hover:bg-salon-secondary text-white text-xs py-1 h-7"
          >
            Browse Files
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileDropZone;
