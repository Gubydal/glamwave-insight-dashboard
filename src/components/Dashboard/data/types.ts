
// Define types for our analytics data
export interface AnalyticsData {
  totalRevenue: number;
  totalTransactions: number;
  totalCustomers: number;
  averageLeadTime: number;
  currency?: string;
  occupancyRate?: number;
  bestSeller?: string;
  averageOrderValue?: number;
  psiClient?: number;
  psiService?: number;
}
