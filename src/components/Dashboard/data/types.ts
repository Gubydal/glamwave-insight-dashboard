
// Define types for our analytics data
export interface AnalyticsData {
  totalRevenue: number;
  totalTransactions: number;
  totalCustomers: number;
  averageLeadTime: number;
  currency: string;
  occupancyRate: number;
  bestSeller: string;
  averageOrderValue: number;
  psiClient: number;
  psiService: number;
  // Chart data
  revenueByService: ChartDataItem[];
  transactionsByDay: ChartDataItem[];
  occupancyByDay: ChartDataItem[];
  employeePerformance: ChartDataItem[];
  psiByService: ChartDataItem[];
  psiByClient: ChartDataItem[];
}

// Chart data item for generic use
export interface ChartDataItem {
  name: string;
  value: number;
  // Optional fields for additional data
  count?: number;
  percentage?: number;
  color?: string;
  loyaltyInfo?: string;
}

// Define type for raw data rows
export interface SalonDataRow {
  'Client name'?: string;
  'Acquisition Channel'?: string;
  'Booking Date'?: string;
  'transaction date'?: string;
  'Consumed service'?: string;
  'Service Category'?: string;
  'Price ( MAD )'?: number | string;
  'Payment Method'?: string;
  'confirmation status'?: string;
  'Offers applicability'?: string;
  'Loyalty stage'?: string;
  'loyalty points'?: number | string;
  'Employee'?: string;
  'startTime'?: string;
  'endTime'?: string;
  [key: string]: any; // For flexible column access
}

// Filter state interface
export interface FilterState {
  serviceCategory: string;
  employee: string;
  loyaltyStage: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  searchQuery: string;
}
