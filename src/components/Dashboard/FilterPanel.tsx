import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { FilterState } from './data/types';
import { Filter, Search } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface FilterPanelProps {
  initialOptions: {
    serviceCategories: string[];
    employees: string[];
    loyaltyStages: string[];
  };
  onFilterChange: (filters: FilterState) => void;
  compact?: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ initialOptions, onFilterChange, compact = false }) => {
  const [serviceCategory, setServiceCategory] = useState<string>('All Categories');
  const [employee, setEmployee] = useState<string>('All Employees');
  const [loyaltyStage, setLoyaltyStage] = useState<string>('All Stages');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Apply filters
  const applyFilters = () => {
    onFilterChange({
      serviceCategory,
      employee,
      loyaltyStage,
      searchQuery,
      dateRange: { from: null, to: null }
    });
  };
  
  // Reset all filters
  const resetFilters = () => {
    setServiceCategory('All Categories');
    setEmployee('All Employees');
    setLoyaltyStage('All Stages');
    setSearchQuery('');
    
    onFilterChange({
      serviceCategory: 'All Categories',
      employee: 'All Employees',
      loyaltyStage: 'All Stages',
      searchQuery: '',
      dateRange: { from: null, to: null }
    });
  };

  if (compact) {
    return (
      <div className="dashboard-card max-h-64">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-salon-primary mr-2" />
            <h2 className="text-lg font-semibold">Filters</h2>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">Advanced</Button>
            </PopoverTrigger>
            <PopoverContent className="w-72">
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Service Category</label>
                  <Select value={serviceCategory} onValueChange={setServiceCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {initialOptions.serviceCategories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Employee</label>
                  <Select value={employee} onValueChange={setEmployee}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {initialOptions.employees.map((emp) => (
                        <SelectItem key={emp} value={emp}>{emp}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Loyalty Stage</label>
                  <Select value={loyaltyStage} onValueChange={setLoyaltyStage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {initialOptions.loyaltyStages.map((stage) => (
                        <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex gap-2 items-center mb-2">
          <div className="relative flex-grow">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-8 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>
          <Button size="sm" className="bg-salon-primary" onClick={applyFilters}>Apply</Button>
          <Button size="sm" variant="outline" onClick={resetFilters}>Reset</Button>
        </div>

        <div className="flex flex-wrap gap-1 mt-2">
          {serviceCategory !== 'All Categories' && (
            <div className="bg-salon-primary/10 text-salon-primary text-xs rounded px-2 py-1 flex items-center">
              {serviceCategory}
            </div>
          )}
          {employee !== 'All Employees' && (
            <div className="bg-salon-primary/10 text-salon-primary text-xs rounded px-2 py-1 flex items-center">
              {employee}
            </div>
          )}
          {loyaltyStage !== 'All Stages' && (
            <div className="bg-salon-primary/10 text-salon-primary text-xs rounded px-2 py-1 flex items-center">
              {loyaltyStage}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Filters</h2>
        <Button variant="outline" size="sm">
          Clear Filters
        </Button>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Service Category</label>
        <Select value={serviceCategory} onValueChange={setServiceCategory}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {initialOptions.serviceCategories.map((category) => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Employee</label>
        <Select value={employee} onValueChange={setEmployee}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {initialOptions.employees.map((emp) => (
              <SelectItem key={emp} value={emp}>{emp}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Loyalty Stage</label>
        <Select value={loyaltyStage} onValueChange={setLoyaltyStage}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {initialOptions.loyaltyStages.map((stage) => (
              <SelectItem key={stage} value={stage}>{stage}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Search</label>
        <Input 
          type="text" 
          placeholder="Search..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Button className="bg-salon-primary hover:bg-salon-primary/90" onClick={applyFilters}>
        Apply Filters
      </Button>
    </div>
  );
};

export default FilterPanel;
