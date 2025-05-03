
import { AnalyticsData } from './types';

// Parse CSV data into an array of objects
export const parseCSV = (csv: string) => {
  const lines = csv.split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  
  const result = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;
    
    const obj: Record<string, string | number> = {};
    const currentLine = lines[i].split(',');
    
    for (let j = 0; j < headers.length; j++) {
      // Try to convert to number if possible
      const value = currentLine[j]?.trim();
      obj[headers[j]] = !isNaN(Number(value)) ? Number(value) : value;
    }
    
    result.push(obj);
  }
  
  return result;
};

// Process the parsed data into our analytics format
export const processAnalyticsData = (data: any): AnalyticsData => {
  // Default empty data
  const analyticsData: AnalyticsData = {
    totalRevenue: 0,
    totalTransactions: 0,
    totalCustomers: 0,
    averageLeadTime: 0,
    currency: 'MAD'
  };
  
  if (!data || !Array.isArray(data) || data.length === 0) {
    return analyticsData;
  }

  try {
    // Calculate total revenue
    analyticsData.totalRevenue = data.reduce((sum, item) => {
      const amount = item.amount || item.revenue || item.price || 0;
      return sum + Number(amount);
    }, 0);
    
    // Count transactions (assuming each row is a transaction)
    analyticsData.totalTransactions = data.length;
    
    // Count unique customers (if we have a customer ID field)
    const uniqueCustomers = new Set();
    data.forEach(item => {
      const customerId = item.customerId || item.customer_id || item.clientId || item.client_id;
      if (customerId) uniqueCustomers.add(customerId);
    });
    analyticsData.totalCustomers = uniqueCustomers.size || Math.floor(data.length * 0.6); // Estimate if no IDs
    
    // Calculate average lead time if available
    const leadTimes = data
      .map(item => item.leadTime || item.lead_time || item.processingDays || item.processing_days)
      .filter(Boolean)
      .map(Number);
    
    if (leadTimes.length > 0) {
      const totalLeadTime = leadTimes.reduce((sum, time) => sum + time, 0);
      analyticsData.averageLeadTime = totalLeadTime / leadTimes.length;
    }

    // Determine currency if available
    const currencyField = data[0].currency || data[0].currencyCode || 'MAD';
    if (currencyField) {
      analyticsData.currency = currencyField;
    }
    
    return analyticsData;
  } catch (error) {
    console.error('Error processing analytics data:', error);
    return analyticsData;
  }
};
