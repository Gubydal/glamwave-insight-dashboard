
import { AnalyticsData, SalonDataRow, ChartDataItem, FilterState } from './types';

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

// Parse time in various formats to minutes since midnight
function parseTimeAMPM(timeStr: string | undefined): number | null {
  if (!timeStr) return null;
  
  try {
    // Match patterns like "9:00 AM", "10:30 PM", "14:00" etc.
    const matches = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!matches) return null;
    
    let hours = parseInt(matches[1], 10);
    const minutes = parseInt(matches[2], 10);
    const period = matches[3] ? matches[3].toUpperCase() : null;
    
    // Convert to 24-hour format
    if (period === 'PM' && hours < 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    // Return minutes since midnight
    return hours * 60 + minutes;
  } catch (e) {
    console.error("Error parsing time:", timeStr, e);
    return null;
  }
}

// Parse date in various formats
function parseDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;
  
  try {
    // First try the direct approach
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // Try DD/MM/YYYY format by reversing to YYYY-MM-DD
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const reversedDateStr = parts.reverse().join('-');
        const date = new Date(reversedDateStr);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }
    
    // Try other formats as needed
    return null;
  } catch (e) {
    console.error("Error parsing date:", dateStr, e);
    return null;
  }
}

// Calculate the lead time between booking and transaction dates
function calculateLeadTime(bookingDate: string | undefined, transactionDate: string | undefined): number | null {
  const bookingDateObj = parseDate(bookingDate);
  const transactionDateObj = parseDate(transactionDate);
  
  if (!bookingDateObj || !transactionDateObj) return null;
  
  const diffTime = Math.abs(transactionDateObj.getTime() - bookingDateObj.getTime());
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

// Calculate occupancy rate based on start and end times
function calculateOccupancy(data: SalonDataRow[]): number {
  // Define business hours (8:00 AM to 11:00 PM)
  const businessHours = {
    start: 8 * 60, // 8:00 AM in minutes
    end: 23 * 60   // 11:00 PM in minutes
  };
  const businessMinutesPerDay = businessHours.end - businessHours.start;
  
  // Group bookings by day, excluding cancelled bookings
  const bookingsByDay: Record<string, Array<{start: number, end: number}>> = {};
  
  data.forEach(item => {
    // Skip cancelled bookings
    if (item['confirmation status']?.toString().toLowerCase().includes('annule')) {
      return;
    }
    
    const startTime = parseTimeAMPM(item.startTime?.toString());
    const endTime = parseTimeAMPM(item.endTime?.toString());
    const transactionDate = parseDate(item['transaction date']?.toString());
    
    if (startTime !== null && endTime !== null && transactionDate) {
      const day = transactionDate.toISOString().split('T')[0];
      
      if (!bookingsByDay[day]) {
        bookingsByDay[day] = [];
      }
      
      bookingsByDay[day].push({
        start: startTime,
        end: endTime
      });
    }
  });
  
  // Calculate occupancy for each day
  let totalOccupiedMinutes = 0;
  const totalDays = Object.keys(bookingsByDay).length || 1; // Avoid division by zero
  
  Object.values(bookingsByDay).forEach(dayBookings => {
    // Sort bookings by start time
    dayBookings.sort((a, b) => a.start - b.start);
    
    // Merge overlapping slots
    let mergedSlots: {start: number, end: number}[] = [];
    
    dayBookings.forEach(booking => {
      // Clip booking to business hours
      const clippedStart = Math.max(booking.start, businessHours.start);
      const clippedEnd = Math.min(booking.end, businessHours.end);
      
      if (clippedEnd > clippedStart) {
        // If there are no slots yet, add this one
        if (mergedSlots.length === 0) {
          mergedSlots.push({ start: clippedStart, end: clippedEnd });
        } else {
          // Try to merge with existing slots
          let merged = false;
          for (let i = 0; i < mergedSlots.length; i++) {
            const slot = mergedSlots[i];
            
            // Check if this booking overlaps with an existing slot
            if (clippedStart <= slot.end && clippedEnd >= slot.start) {
              // Merge the slots
              slot.start = Math.min(slot.start, clippedStart);
              slot.end = Math.max(slot.end, clippedEnd);
              merged = true;
              break;
            }
          }
          
          // If no overlap, add as a new slot
          if (!merged) {
            mergedSlots.push({ start: clippedStart, end: clippedEnd });
          }
        }
      }
    });
    
    // Calculate total occupied minutes from merged slots
    let dayOccupiedMinutes = 0;
    mergedSlots.forEach(slot => {
      dayOccupiedMinutes += (slot.end - slot.start);
    });
    
    totalOccupiedMinutes += dayOccupiedMinutes;
  });
  
  // Calculate occupancy rate
  const totalBusinessMinutes = totalDays * businessMinutesPerDay;
  const occupancyRate = (totalOccupiedMinutes / totalBusinessMinutes) * 100;
  
  return occupancyRate;
}

// Apply filters to data
export const applyFilters = (data: SalonDataRow[], filters: FilterState): SalonDataRow[] => {
  return data.filter(item => {
    // Service category filter
    if (filters.serviceCategory && filters.serviceCategory !== 'All Categories' && 
        item['Service Category'] !== filters.serviceCategory) {
      return false;
    }
    
    // Employee filter
    if (filters.employee && filters.employee !== 'All Employees' && 
        item['Employee'] !== filters.employee) {
      return false;
    }
    
    // Loyalty stage filter
    if (filters.loyaltyStage && filters.loyaltyStage !== 'All Stages' && 
        item['Loyalty stage'] !== filters.loyaltyStage) {
      return false;
    }
    
    // Date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      const transactionDate = parseDate(item['transaction date']?.toString());
      
      if (!transactionDate) {
        return false;
      }
      
      if (filters.dateRange.from && transactionDate < filters.dateRange.from) {
        return false;
      }
      
      if (filters.dateRange.to) {
        // Set the time to the end of the day for the "to" date
        const endOfDay = new Date(filters.dateRange.to);
        endOfDay.setHours(23, 59, 59, 999);
        
        if (transactionDate > endOfDay) {
          return false;
        }
      }
    }
    
    // Search query filter (checks multiple fields)
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesSearch = (
        (item['Client name'] && item['Client name'].toString().toLowerCase().includes(query)) ||
        (item['Consumed service'] && item['Consumed service'].toString().toLowerCase().includes(query)) ||
        (item['Service Category'] && item['Service Category'].toString().toLowerCase().includes(query)) ||
        (item['Employee'] && item['Employee'].toString().toLowerCase().includes(query)) ||
        (item['Payment Method'] && item['Payment Method'].toString().toLowerCase().includes(query))
      );
      
      if (!matchesSearch) {
        return false;
      }
    }
    
    return true;
  });
};

// Generate revenue by service chart data
function generateRevenueByService(data: SalonDataRow[]): ChartDataItem[] {
  const serviceRevenue: Record<string, number> = {};
  
  data.forEach(item => {
    const service = item['Service Category'];
    const price = typeof item['Price ( MAD )'] === 'number' 
      ? item['Price ( MAD )'] 
      : parseFloat(item['Price ( MAD )']?.toString() || '0') || 0;
      
    if (service && !isNaN(price)) {
      serviceRevenue[service] = (serviceRevenue[service] || 0) + price;
    }
  });
  
  return Object.entries(serviceRevenue)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 7); // Top 7 services
}

// Generate transactions by day chart data
function generateTransactionsByDay(data: SalonDataRow[]): ChartDataItem[] {
  const dayTransactions: Record<string, number> = {};
  
  data.forEach(item => {
    const date = parseDate(item['transaction date']?.toString());
    
    if (date) {
      const dayStr = date.toISOString().split('T')[0];
      dayTransactions[dayStr] = (dayTransactions[dayStr] || 0) + 1;
    }
  });
  
  return Object.entries(dayTransactions)
    .map(([day, count]) => {
      const date = new Date(day);
      const name = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      return { name, value: count };
    })
    .sort((a, b) => {
      const dateA = new Date(Object.keys(dayTransactions).find(key => 
        new Date(key).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) === a.name) || '');
      const dateB = new Date(Object.keys(dayTransactions).find(key => 
        new Date(key).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) === b.name) || '');
      return dateA.getTime() - dateB.getTime();
    });
}

// Generate employee performance chart data
function generateEmployeePerformance(data: SalonDataRow[]): ChartDataItem[] {
  const employeeMetrics: Record<string, { revenue: number, count: number }> = {};
  
  data.forEach(item => {
    const employee = item['Employee'];
    const price = typeof item['Price ( MAD )'] === 'number' 
      ? item['Price ( MAD )'] 
      : parseFloat(item['Price ( MAD )']?.toString() || '0') || 0;
      
    if (employee && !isNaN(price)) {
      if (!employeeMetrics[employee]) {
        employeeMetrics[employee] = { revenue: 0, count: 0 };
      }
      employeeMetrics[employee].revenue += price;
      employeeMetrics[employee].count += 1;
    }
  });
  
  return Object.entries(employeeMetrics)
    .map(([name, metrics]) => ({
      name, 
      value: metrics.revenue,
      count: metrics.count
    }))
    .sort((a, b) => b.value - a.value);
}

// Generate price sensitivity by service
function generatePSIByService(data: SalonDataRow[]): ChartDataItem[] {
  const serviceRevenue: Record<string, number> = {};
  const discountedRevenue: Record<string, number> = {};

  data.forEach(item => {
    const service = item['Service Category'];
    if (!service) return;

    const price = typeof item['Price ( MAD )'] === 'number' 
      ? item['Price ( MAD )'] 
      : parseFloat(item['Price ( MAD )']?.toString() || '0') || 0;
        
    if (isNaN(price)) return;

    if (!serviceRevenue[service]) {
      serviceRevenue[service] = 0;
      discountedRevenue[service] = 0;
    }

    serviceRevenue[service] += price;

    if (item['Offers applicability'] && 
        item['Offers applicability'].toString().toLowerCase().includes('discounted')) {
      discountedRevenue[service] += price;
    }
  });

  return Object.keys(serviceRevenue)
    .map(service => {
      const totalRevenue = serviceRevenue[service];
      const discounted = discountedRevenue[service];
      const percentage = totalRevenue > 0 ? (discounted / totalRevenue) * 100 : 0;
      return {
        name: service,
        value: totalRevenue,
        percentage
      };
    })
    .sort((a, b) => b.percentage - a.percentage);
}

// Generate price sensitivity by client
function generatePSIByClient(data: SalonDataRow[]): ChartDataItem[] {
  const clientBookings: Record<string, { total: number, discounted: number }> = {};
  
  data.forEach(item => {
    const client = item['Client name'];
    if (!client) return;

    if (!clientBookings[client]) {
      clientBookings[client] = { total: 0, discounted: 0 };
    }

    clientBookings[client].total += 1;
    if (item['Offers applicability'] && 
        item['Offers applicability'].toString().toLowerCase().includes('discounted')) {
      clientBookings[client].discounted += 1;
    }
  });

  return Object.entries(clientBookings)
    .map(([name, metrics]) => ({
      name,
      value: metrics.total,
      percentage: metrics.total > 0 ? (metrics.discounted / metrics.total) * 100 : 0
    }))
    .filter(item => item.value > 1) // Only clients with more than 1 booking
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 10); // Top 10 clients by sensitivity
}

// Generate occupancy by day chart data
function generateOccupancyByDay(data: SalonDataRow[]): ChartDataItem[] {
  // Define business hours (8:00 AM to 11:00 PM)
  const businessHours = {
    start: 8 * 60, // 8:00 AM in minutes
    end: 23 * 60   // 11:00 PM in minutes
  };
  const businessMinutesPerDay = businessHours.end - businessHours.start;
  
  // Group bookings by day
  const bookingsByDay: Record<string, Array<{start: number, end: number}>> = {};
  
  // Filter out canceled bookings
  const validBookings = data.filter(item => 
    !item['confirmation status'] || !item['confirmation status'].toString().toLowerCase().includes('annule')
  );
  
  validBookings.forEach(booking => {
    const transactionDate = booking['transaction date'];
    if (!transactionDate) return;
    
    const date = parseDate(transactionDate.toString());
    if (!date) return;
    
    const dayKey = date.toISOString().split('T')[0];
    if (!bookingsByDay[dayKey]) {
      bookingsByDay[dayKey] = [];
    }
    
    const startTime = parseTimeAMPM(booking.startTime?.toString());
    const endTime = parseTimeAMPM(booking.endTime?.toString());
    
    if (startTime !== null && endTime !== null) {
      bookingsByDay[dayKey].push({
        start: startTime,
        end: endTime
      });
    }
  });
  
  // Calculate occupancy per day
  return Object.entries(bookingsByDay).map(([day, slots]) => {
    const date = new Date(day);
    const formattedDate = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    
    // Skip if no valid slots
    if (slots.length === 0) {
      return { name: formattedDate, value: 0 };
    }
    
    // Process slots for this day
    let mergedSlots: {start: number, end: number}[] = [];
    
    // Sort slots by start time
    slots.sort((a, b) => a.start - b.start);
    
    slots.forEach(booking => {
      // Clip booking to business hours
      const clippedStart = Math.max(booking.start, businessHours.start);
      const clippedEnd = Math.min(booking.end, businessHours.end);
      
      if (clippedEnd > clippedStart) {
        // If there are no slots yet, add this one
        if (mergedSlots.length === 0) {
          mergedSlots.push({ start: clippedStart, end: clippedEnd });
        } else {
          // Try to merge with existing slots
          let merged = false;
          for (let i = 0; i < mergedSlots.length; i++) {
            const slot = mergedSlots[i];
            
            // Check if this booking overlaps with an existing slot
            if (clippedStart <= slot.end && clippedEnd >= slot.start) {
              // Merge the slots
              slot.start = Math.min(slot.start, clippedStart);
              slot.end = Math.max(slot.end, clippedEnd);
              merged = true;
              break;
            }
          }
          
          // If no overlap, add as a new slot
          if (!merged) {
            mergedSlots.push({ start: clippedStart, end: clippedEnd });
          }
        }
      }
    });
    
    // Calculate occupied minutes for this day
    let occupiedMinutes = 0;
    mergedSlots.forEach(slot => {
      occupiedMinutes += (slot.end - slot.start);
    });
    
    // Calculate occupancy rate for this day
    const occupancyRate = (occupiedMinutes / businessMinutesPerDay) * 100;
    
    return {
      name: formattedDate,
      value: occupancyRate
    };
  }).sort((a, b) => {
    const dateA = new Date(Object.keys(bookingsByDay).find(key => 
      new Date(key).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) === a.name) || '');
    const dateB = new Date(Object.keys(bookingsByDay).find(key => 
      new Date(key).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) === b.name) || '');
    return dateA.getTime() - dateB.getTime();
  });
}

// Get unique values for filters
export const getFilterOptions = (data: SalonDataRow[]) => {
  const serviceCategories = Array.from(new Set(data.map(item => item['Service Category'])))
    .filter(Boolean) as string[];
    
  const employees = Array.from(new Set(data.map(item => item['Employee'])))
    .filter(Boolean) as string[];
    
  const loyaltyStages = Array.from(new Set(data.map(item => item['Loyalty stage'])))
    .filter(Boolean) as string[];
    
  return {
    serviceCategories: ['All Categories', ...serviceCategories],
    employees: ['All Employees', ...employees],
    loyaltyStages: ['All Stages', ...loyaltyStages]
  };
};

// Process the parsed data into our analytics format
export const processAnalyticsData = (data: SalonDataRow[], filters?: FilterState): AnalyticsData => {
  // Default empty data
  const analyticsData: AnalyticsData = {
    totalRevenue: 0,
    totalTransactions: 0,
    totalCustomers: 0,
    averageLeadTime: 0,
    currency: 'MAD',
    occupancyRate: 0,
    bestSeller: '',
    averageOrderValue: 0,
    psiClient: 0,
    psiService: 0,
    revenueByService: [],
    transactionsByDay: [],
    occupancyByDay: [],
    employeePerformance: [],
    psiByService: [],
    psiByClient: []
  };
  
  if (!data || !Array.isArray(data) || data.length === 0) {
    return analyticsData;
  }

  try {
    // Apply filters if provided
    const filteredData = filters ? applyFilters(data, filters) : data;
    
    if (filteredData.length === 0) {
      return analyticsData; // Return empty data if no results after filtering
    }
    
    // 1. Calculate total revenue
    analyticsData.totalRevenue = filteredData.reduce((sum, item) => {
      const price = typeof item['Price ( MAD )'] === 'number' 
        ? item['Price ( MAD )'] 
        : parseFloat(item['Price ( MAD )']?.toString() || '0') || 0;
      return sum + (isNaN(price) ? 0 : price);
    }, 0);
    
    // 2. Count transactions (assuming each row is a transaction)
    analyticsData.totalTransactions = filteredData.length;
    
    // 3. Count unique customers
    const uniqueCustomers = new Set();
    filteredData.forEach(item => {
      const customerId = item['Client name'];
      if (customerId) uniqueCustomers.add(customerId);
    });
    analyticsData.totalCustomers = uniqueCustomers.size;

    // 4. Calculate occupancy rate
    analyticsData.occupancyRate = calculateOccupancy(filteredData);

    // 5. Find best seller (service with most occurrences)
    const serviceCount: Record<string, number> = {};
    filteredData.forEach(item => {
      const service = item['Consumed service'];
      if (service) {
        serviceCount[service] = (serviceCount[service] || 0) + 1;
      }
    });
    
    let bestSellerCount = 0;
    let bestSellerName = '';
    Object.entries(serviceCount).forEach(([service, count]) => {
      if (count > bestSellerCount) {
        bestSellerCount = count;
        bestSellerName = service;
      }
    });
    analyticsData.bestSeller = bestSellerName || 'Hammam Evasion'; // Default if no data
    
    // 6. Calculate average order value
    analyticsData.averageOrderValue = analyticsData.totalTransactions > 0 
      ? analyticsData.totalRevenue / analyticsData.totalTransactions 
      : 0;
    
    // 7. Calculate average lead time
    const leadTimes = filteredData
      .map(item => calculateLeadTime(item['Booking Date']?.toString(), item['transaction date']?.toString()))
      .filter(leadTime => leadTime !== null) as number[];
    
    if (leadTimes.length > 0) {
      const totalLeadTime = leadTimes.reduce((sum, time) => sum + time, 0);
      analyticsData.averageLeadTime = totalLeadTime / leadTimes.length;
    }

    // 8. Calculate Price Sensitivity Index (per client)
    const clientBookings: Record<string, { total: number, discounted: number }> = {};
    
    filteredData.forEach(item => {
      const client = item['Client name'];
      if (!client) return;

      if (!clientBookings[client]) {
        clientBookings[client] = { total: 0, discounted: 0 };
      }

      clientBookings[client].total += 1;
      if (item['Offers applicability'] && 
          item['Offers applicability'].toString().toLowerCase().includes('discounted')) {
        clientBookings[client].discounted += 1;
      }
    });

    const sensitivityValues = Object.values(clientBookings).map(client => 
      client.total > 0 ? (client.discounted / client.total) * 100 : 0
    );

    analyticsData.psiClient = sensitivityValues.length > 0 
      ? sensitivityValues.reduce((sum, val) => sum + val, 0) / sensitivityValues.length 
      : 0;
    
    // 9. Calculate Price Sensitivity Index (per service)
    const serviceRevenue: Record<string, number> = {};
    const discountedRevenue: Record<string, number> = {};

    filteredData.forEach(item => {
      const service = item['Service Category'];
      if (!service) return;

      const price = typeof item['Price ( MAD )'] === 'number' 
        ? item['Price ( MAD )'] 
        : parseFloat(item['Price ( MAD )']?.toString() || '0') || 0;
        
      if (isNaN(price)) return;

      if (!serviceRevenue[service]) {
        serviceRevenue[service] = 0;
        discountedRevenue[service] = 0;
      }

      serviceRevenue[service] += price;

      if (item['Offers applicability'] && 
          item['Offers applicability'].toString().toLowerCase().includes('discounted')) {
        discountedRevenue[service] += price;
      }
    });

    const sensitivityValuesService = Object.keys(serviceRevenue).map(service => {
      const totalRevenue = serviceRevenue[service];
      const discounted = discountedRevenue[service];
      return totalRevenue > 0 ? (discounted / totalRevenue) * 100 : 0;
    });
    
    analyticsData.psiService = sensitivityValuesService.length > 0 
      ? sensitivityValuesService.reduce((sum, val) => sum + val, 0) / sensitivityValuesService.length 
      : 0;
    
    // 10. Generate chart data
    analyticsData.revenueByService = generateRevenueByService(filteredData);
    analyticsData.transactionsByDay = generateTransactionsByDay(filteredData);
    analyticsData.occupancyByDay = generateOccupancyByDay(filteredData);
    analyticsData.employeePerformance = generateEmployeePerformance(filteredData);
    analyticsData.psiByService = generatePSIByService(filteredData);
    analyticsData.psiByClient = generatePSIByClient(filteredData);

    return analyticsData;
  } catch (error) {
    console.error('Error processing analytics data:', error);
    return analyticsData;
  }
};
