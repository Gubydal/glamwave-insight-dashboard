
import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getSampleData } from '../data/sampleData';

const SampleDownloadButton: React.FC = () => {
  const downloadSample = () => {
    toast.info('Downloading sample file...');
    
    // Get sample data
    const sampleData = getSampleData();
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sampleData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "salon_sample_data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
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
  );
};

export default SampleDownloadButton;
