
import { AnalyticsData, SalonDataRow } from './types';

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
    // Match patterns like "9:00 AM", "10:30 PM", etc.
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
    // Try different date formats
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // Try DD/MM/YYYY format
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      // Try both DD/MM/YYYY and MM/DD/YYYY formats
      const formats = [
        new Date(`${parts[2]}-${parts[1]}-${parts[0]}`), // DD/MM/YYYY
        new Date(`${parts[2]}-${parts[0]}-${parts[1]}`)  // MM/DD/YYYY
      ];
      
      for (const date of formats) {
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }
  } catch (e) {
    console.error("Error parsing date:", dateStr, e);
  }
  
  return null;
}

// Calculate the lead time between booking and transaction dates
function calculateLeadTime(bookingDate: string | undefined, transactionDate: string | undefined): number | null {
  const bookingDateObj = parseDate(bookingDate);
  const transactionDateObj = parseDate(transactionDate);
  
  if (!bookingDateObj || !transactionDateObj) return null;
  
  const diffTime = Math.abs(transactionDateObj.getTime() - bookingDateObj.getTime());
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  
  return diffDays;
}

// Calculate occupancy rate based on start and end times
function calculateOccupancy(data: SalonDataRow[]): number {
  // Filter out canceled bookings
  const validBookings = data.filter(item => 
    item['confirmation status']?.toLowerCase() !== 'cancelled' &&
    item.startTime && 
    item.endTime
  );
  
  if (validBookings.length === 0) return 0;
  
  // Group bookings by day
  const bookingsByDay: Record<string, { slots: {start: number, end: number}[] }> = {};
  
  validBookings.forEach(booking => {
    const transactionDate = booking['transaction date'];
    if (!transactionDate) return;
    
    const dayKey = transactionDate.toString();
    if (!bookingsByDay[dayKey]) {
      bookingsByDay[dayKey] = { slots: [] };
    }
    
    const startMinutes = parseTimeAMPM(booking.startTime?.toString());
    const endMinutes = parseTimeAMPM(booking.endTime?.toString());
    
    if (startMinutes !== null && endMinutes !== null) {
      bookingsByDay[dayKey].slots.push({
        start: startMinutes,
        end: endMinutes
      });
    }
  });
  
  // Calculate occupancy per day (business hours: 8:00 AM - 11:00 PM = 15 hours = 900 minutes)
  const businessMinutes = 15 * 60; // 15 hours in minutes
  let totalOccupiedMinutes = 0;
  let totalDays = Object.keys(bookingsByDay).length;
  
  if (totalDays === 0) return 0;
  
  Object.values(bookingsByDay).forEach(day => {
    if (day.slots.length === 0) return;
    
    // Sort slots by start time
    day.slots.sort((a, b) => a.start - b.start);
    
    // Merge overlapping slots
    const mergedSlots: {start: number, end: number}[] = [];
    let currentSlot = { ...day.slots[0] };
    
    for (let i = 1; i < day.slots.length; i++) {
      const slot = day.slots[i];
      
      if (slot.start <= currentSlot.end) {
        // Slots overlap, merge them
        currentSlot.end = Math.max(currentSlot.end, slot.end);
      } else {
        // No overlap, add current slot to merged slots and start a new one
        mergedSlots.push({ ...currentSlot });
        currentSlot = { ...slot };
      }
    }
    
    // Add the last slot
    mergedSlots.push(currentSlot);
    
    // Calculate occupied minutes for this day
    const occupiedMinutes = mergedSlots.reduce((sum, slot) => sum + (slot.end - slot.start), 0);
    totalOccupiedMinutes += occupiedMinutes;
  });
  
  // Calculate occupancy rate
  const occupancyRate = (totalOccupiedMinutes / (totalDays * businessMinutes)) * 100;
  return occupancyRate;
}

// Process the parsed data into our analytics format
export const processAnalyticsData = (data: any): AnalyticsData => {
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
    psiService: 0
  };
  
  if (!data || !Array.isArray(data) || data.length === 0) {
    return analyticsData;
  }

  try {
    const salonData = data as SalonDataRow[];
    
    // 1. Calculate total revenue
    analyticsData.totalRevenue = salonData.reduce((sum, item) => {
      const price = typeof item['Price ( MAD )'] === 'string' 
        ? parseFloat(item['Price ( MAD )']) 
        : (item['Price ( MAD )'] || 0);
      return sum + (isNaN(price) ? 0 : price);
    }, 0);
    
    // 2. Count transactions (assuming each row is a transaction)
    analyticsData.totalTransactions = salonData.length;
    
    // 3. Count unique customers
    const uniqueCustomers = new Set();
    salonData.forEach(item => {
      const customerId = item['Client name'];
      if (customerId) uniqueCustomers.add(customerId);
    });
    analyticsData.totalCustomers = uniqueCustomers.size;

    // 4. Calculate occupancy rate
    analyticsData.occupancyRate = calculateOccupancy(salonData);

    // 5. Find best seller (service with most occurrences)
    const serviceCount: Record<string, number> = {};
    salonData.forEach(item => {
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
    const leadTimes = salonData
      .map(item => calculateLeadTime(item['Booking Date'], item['transaction date']))
      .filter(leadTime => leadTime !== null) as number[];
    
    if (leadTimes.length > 0) {
      const totalLeadTime = leadTimes.reduce((sum, time) => sum + time, 0);
      analyticsData.averageLeadTime = totalLeadTime / leadTimes.length;
    }

    // 8. Calculate Price Sensitivity Index (per client)
    const clientBookings: Record<string, { total: number, discounted: number }> = {};
    
    salonData.forEach(item => {
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

    salonData.forEach(item => {
      const service = item['Service Category'];
      if (!service) return;

      const price = typeof item['Price ( MAD )'] === 'string' 
        ? parseFloat(item['Price ( MAD )']) 
        : (item['Price ( MAD )'] || 0);
        
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

    return analyticsData;
  } catch (error) {
    console.error('Error processing analytics data:', error);
    return analyticsData;
  }
};
