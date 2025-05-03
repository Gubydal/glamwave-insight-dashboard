
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface ServiceOccupancyData {
  category: string;
  occupancyRate: number;
  totalHours: number;
}

const ServiceOccupancyTable: React.FC = () => {
  const [sortField, setSortField] = React.useState<keyof ServiceOccupancyData>('occupancyRate');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('desc');

  // Mock data
  const occupancyData: ServiceOccupancyData[] = [
    { category: 'Hair Treatment', occupancyRate: 75.4, totalHours: 98.5 },
    { category: 'Facial', occupancyRate: 51.2, totalHours: 67.3 },
    { category: 'Manicure', occupancyRate: 32.8, totalHours: 43.1 },
    { category: 'Pedicure', occupancyRate: 28.5, totalHours: 37.4 },
    { category: 'Massage', occupancyRate: 62.7, totalHours: 82.1 },
  ];

  const handleSort = (field: keyof ServiceOccupancyData) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedData = [...occupancyData].sort((a, b) => {
    if (sortDirection === 'asc') {
      return a[sortField] > b[sortField] ? 1 : -1;
    } else {
      return a[sortField] < b[sortField] ? 1 : -1;
    }
  });

  const getSortIcon = (field: keyof ServiceOccupancyData) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ArrowUp className="inline h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="inline h-4 w-4 ml-1" />
    );
  };

  return (
    <div className="dashboard-card overflow-hidden">
      <h2 className="text-lg font-semibold mb-4">Service Occupancy Rates</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-salon-tertiary/20">
              <th 
                className="py-3 px-4 text-left text-sm font-semibold text-salon-heading cursor-pointer hover:text-salon-primary"
                onClick={() => handleSort('category')}
              >
                Service Category
                {getSortIcon('category')}
              </th>
              <th 
                className="py-3 px-4 text-left text-sm font-semibold text-salon-heading cursor-pointer hover:text-salon-primary"
                onClick={() => handleSort('occupancyRate')}
              >
                Occupancy Rate (%)
                {getSortIcon('occupancyRate')}
              </th>
              <th 
                className="py-3 px-4 text-left text-sm font-semibold text-salon-heading cursor-pointer hover:text-salon-primary"
                onClick={() => handleSort('totalHours')}
              >
                Total Hours
                {getSortIcon('totalHours')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((service, index) => (
              <tr 
                key={index} 
                className={`border-b border-salon-tertiary/10 hover:bg-salon-background/50 transition-colors duration-150
                  ${index % 2 === 0 ? 'bg-white' : 'bg-salon-background/20'}`
                }
              >
                <td className="py-3 px-4 text-sm">{service.category}</td>
                <td className="py-3 px-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-salon-tertiary/20 rounded-full mr-3">
                      <div 
                        className="h-2 bg-salon-primary rounded-full"
                        style={{ width: `${service.occupancyRate}%` }}
                      ></div>
                    </div>
                    <span className="text-salon-text/90 font-medium">
                      {service.occupancyRate}%
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm">{service.totalHours} hours</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServiceOccupancyTable;
