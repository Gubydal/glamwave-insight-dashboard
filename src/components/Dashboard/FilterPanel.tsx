
import React, { useState } from 'react';
import { Filter, ChevronDown, ChevronUp, Search, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const FilterPanel: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeFilters, setActiveFilters] = useState(0);

  // Mock filter options
  const serviceCategories = ["All Categories", "Hair Treatment", "Facial", "Manicure", "Pedicure", "Massage"];
  const employees = ["All Employees", "Emma Smith", "John Doe", "Sarah Johnson", "Michael Brown"];
  const loyaltyStages = ["All Stages", "Bronze", "Silver", "Gold", "Platinum"];

  const togglePanel = () => {
    setIsExpanded(!isExpanded);
  };

  const resetFilters = () => {
    // In a real app, this would reset all filters
    setActiveFilters(0);
  };

  return (
    <div className="dashboard-card mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-salon-primary mr-2" />
          <h2 className="text-lg font-semibold">Filters</h2>
          {activeFilters > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-salon-primary/10 text-salon-secondary text-xs rounded-full">
              {activeFilters} active
            </span>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={togglePanel}
          className="h-8 w-8 p-0 text-salon-text/70 hover:text-salon-primary hover:bg-transparent"
        >
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </Button>
      </div>

      {isExpanded && (
        <div className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-salon-text mb-1">
                Service Category
              </label>
              <select className="filter-select w-full">
                {serviceCategories.map((category, index) => (
                  <option key={index} value={category.toLowerCase().replace(' ', '-')}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-salon-text mb-1">
                Employee
              </label>
              <select className="filter-select w-full">
                {employees.map((employee, index) => (
                  <option key={index} value={employee.toLowerCase().replace(' ', '-')}>
                    {employee}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-salon-text mb-1">
                Loyalty Stage
              </label>
              <select className="filter-select w-full">
                {loyaltyStages.map((stage, index) => (
                  <option key={index} value={stage.toLowerCase().replace(' ', '-')}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-salon-text mb-1">
                Date Range
              </label>
              <div className="relative">
                <Input 
                  type="text" 
                  placeholder="Select date range"
                  className="filter-select w-full pl-9" 
                />
                <CalendarDays className="absolute left-3 top-2.5 h-4 w-4 text-salon-text/50" />
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-salon-text/50" />
              <Input 
                type="search"
                placeholder="Search by any field..."
                className="filter-select pl-9"
              />
            </div>
            <div className="flex items-center ml-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetFilters}
                className="text-salon-secondary border-salon-tertiary/30 hover:bg-salon-primary/5"
              >
                Reset Filters
              </Button>
              <Button
                size="sm"
                className="ml-2 bg-salon-primary hover:bg-salon-secondary text-white"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
