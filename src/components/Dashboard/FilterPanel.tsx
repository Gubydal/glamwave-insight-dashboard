
import React, { useState } from 'react';
import { Filter, ChevronDown, ChevronUp, Search, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FilterState } from './data/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface FilterPanelProps {
  initialOptions: {
    serviceCategories: string[];
    employees: string[];
    loyaltyStages: string[];
  };
  onFilterChange: (filters: FilterState) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ initialOptions, onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    serviceCategory: '',
    employee: '',
    loyaltyStage: '',
    dateRange: {
      from: null,
      to: null,
    },
    searchQuery: '',
  });

  // Count active filters
  const countActiveFilters = () => {
    let count = 0;
    if (filters.serviceCategory && filters.serviceCategory !== 'All Categories') count++;
    if (filters.employee && filters.employee !== 'All Employees') count++;
    if (filters.loyaltyStage && filters.loyaltyStage !== 'All Stages') count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.searchQuery) count++;
    return count;
  };

  const activeFilters = countActiveFilters();

  const togglePanel = () => {
    setIsExpanded(!isExpanded);
  };

  const resetFilters = () => {
    const resetState = {
      serviceCategory: '',
      employee: '',
      loyaltyStage: '',
      dateRange: {
        from: null,
        to: null,
      },
      searchQuery: '',
    };
    
    setFilters(resetState);
    onFilterChange(resetState);
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      return newFilters;
    });
  };

  const handleDateRangeChange = (range: { from: Date | null; to: Date | null }) => {
    setFilters(prev => ({
      ...prev,
      dateRange: range
    }));
  };

  const applyFilters = () => {
    onFilterChange(filters);
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
              <select 
                className="filter-select w-full"
                value={filters.serviceCategory}
                onChange={(e) => handleFilterChange('serviceCategory', e.target.value)}
              >
                <option value="">All Categories</option>
                {initialOptions.serviceCategories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-salon-text mb-1">
                Employee
              </label>
              <select 
                className="filter-select w-full"
                value={filters.employee}
                onChange={(e) => handleFilterChange('employee', e.target.value)}
              >
                <option value="">All Employees</option>
                {initialOptions.employees.map((employee, index) => (
                  <option key={index} value={employee}>
                    {employee}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-salon-text mb-1">
                Loyalty Stage
              </label>
              <select 
                className="filter-select w-full"
                value={filters.loyaltyStage}
                onChange={(e) => handleFilterChange('loyaltyStage', e.target.value)}
              >
                <option value="">All Stages</option>
                {initialOptions.loyaltyStages.map((stage, index) => (
                  <option key={index} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-salon-text mb-1">
                Date Range
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateRange.from && !filters.dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {filters.dateRange.from ? (
                      filters.dateRange.to ? (
                        <>
                          {format(filters.dateRange.from, "MMM d, yyyy")} -{" "}
                          {format(filters.dateRange.to, "MMM d, yyyy")}
                        </>
                      ) : (
                        format(filters.dateRange.from, "MMM d, yyyy")
                      )
                    ) : (
                      "Select date range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={filters.dateRange.from || undefined}
                    selected={{
                      from: filters.dateRange.from || undefined,
                      to: filters.dateRange.to || undefined,
                    }}
                    onSelect={(range) => {
                      handleDateRangeChange({
                        from: range?.from || null,
                        to: range?.to || null,
                      });
                    }}
                    numberOfMonths={2}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-salon-text/50" />
              <Input 
                type="search"
                placeholder="Search by any field..."
                className="filter-select pl-9"
                value={filters.searchQuery}
                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
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
                onClick={applyFilters}
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
