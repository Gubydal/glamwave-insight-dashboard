
import React, { useState } from 'react';
import { Upload, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileDropZoneProps {
  onFileSelected: (file: File) => void;
  isUploading: boolean;
  fileName: string | null;
}

const FileDropZone: React.FC<FileDropZoneProps> = ({ 
  onFileSelected, 
  isUploading, 
  fileName 
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
  );
};

export default FileDropZone;
