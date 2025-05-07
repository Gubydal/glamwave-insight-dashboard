
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

type ServiceOccupancy = {
  category: string;
  hours: number;
  rate: number;
};

const ServiceOccupancyTable: React.FC = () => {
  // This would normally fetch from Supabase, but we'll use mock data for now
  const { data: serviceOccupancy, isLoading } = useQuery({
    queryKey: ['serviceOccupancy'],
    queryFn: async () => {
      // In a real implementation, we would fetch this data from Supabase
      // For now, return mock data that matches the expected structure
      return [
        { category: 'Hammam', hours: 152, rate: 42.8 },
        { category: 'Massage', hours: 95, rate: 26.7 },
        { category: 'Facial', hours: 68, rate: 19.1 },
        { category: 'Hair Styling', hours: 42, rate: 11.8 },
        { category: 'Manicure', hours: 24, rate: 6.7 },
        { category: 'Pedicure', hours: 18, rate: 5.1 }
      ] as ServiceOccupancy[];
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Get max rate for scaling
  const maxRate = Math.max(...(serviceOccupancy?.map(item => item.rate) || [100]));

  return (
    <div className="dashboard-card">
      <h2 className="text-lg font-semibold mb-4">Service Occupancy Rates</h2>
      
      {isLoading ? (
        <div className="flex justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-salon-primary"></div>
        </div>
      ) : (
        <Table>
          <TableCaption>Service utilization by category</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Service Category</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Occupancy Rate</TableHead>
              <TableHead className="w-1/3">Distribution</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {serviceOccupancy?.map((service, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{service.category}</TableCell>
                <TableCell>{service.hours}</TableCell>
                <TableCell>{service.rate.toFixed(1)}%</TableCell>
                <TableCell>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-salon-primary h-2.5 rounded-full" 
                      style={{ width: `${(service.rate / maxRate) * 100}%` }}
                    ></div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default ServiceOccupancyTable;
