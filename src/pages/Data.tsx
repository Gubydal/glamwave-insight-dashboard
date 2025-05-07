import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/Dashboard/Sidebar';
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Upload, FileText, Edit, Trash2, Search, Users, Database } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast as sonnerToast } from 'sonner';
import { SalonDataRow, AnalyticsData } from '@/components/Dashboard/data/types';
import { processAnalyticsData } from '@/components/Dashboard/data/dataProcessing';
import Papa from 'papaparse';

interface UserData {
  id: string;
  title: string;
  description: string | null;
  data_type: string;
  value: number | null;
  date: string | null;
  created_at: string;
  user_id?: string;
}

interface RawDashboardData {
  id: string;
  file_name: string;
  description: string | null;
  created_at: string;
  user_id: string;
}

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
}

interface CustomerData {
  id: string;
  customer_id: string;
  data_id: string;
  created_at: string;
  customer_name?: string;
  data_title?: string;
}

const Data = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData[]>([]);
  const [dashboardData, setDashboardData] = useState<RawDashboardData[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerData, setCustomerData] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('data');
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  
  // Form state for new data
  const [newData, setNewData] = useState({
    title: '',
    description: '',
    data_type: 'revenue',
    value: '',
  });

  // Form state for new customer
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Form state for linking data to customer
  const [linkData, setLinkData] = useState({
    customer_id: '',
    data_id: ''
  });
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchDashboardData();
      fetchCustomers();
      fetchCustomerData();
    }
  }, [user?.id]);

  const fetchUserData = async () => {
    try {
      if (!user) return;
      
      setLoading(true);
      
      let query = supabase
        .from('user_data')
        .select('*')
        .order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setUserData(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      if (!user) return;
      
      setLoading(true);
      
      let query = supabase
        .from('raw_dashboard_data')
        .select('*')
        .order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setDashboardData(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching dashboard data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      if (!user) return;
      
      setLoading(true);
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      setCustomers(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching customers",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerData = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('customer_data_association')
        .select(`
          id, 
          customer_id,
          data_id,
          created_at
        `);
      
      if (error) throw error;
      
      // Now get customer names and data titles to display
      const enhancedData: CustomerData[] = [];
      
      for (const association of data || []) {
        // Get customer info
        const { data: customerData } = await supabase
          .from('customers')
          .select('name')
          .eq('id', association.customer_id)
          .single();
          
        // Get data info
        const { data: dashData } = await supabase
          .from('raw_dashboard_data')
          .select('file_name')
          .eq('id', association.data_id)
          .single();
        
        enhancedData.push({
          ...association,
          customer_name: customerData?.name || 'Unknown',
          data_title: dashData?.file_name || 'Unknown Dataset'
        });
      }
      
      setCustomerData(enhancedData);
    } catch (error: any) {
      console.error("Error fetching customer data associations:", error);
      toast({
        title: "Error fetching customer data associations",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleAddNewData = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('user_data')
        .insert({
          user_id: user.id,
          title: newData.title,
          description: newData.description || null,
          data_type: newData.data_type,
          value: newData.value ? parseFloat(newData.value) : null
        })
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Data added successfully",
      });
      
      // Reset form and close dialog
      setNewData({
        title: '',
        description: '',
        data_type: 'revenue',
        value: '',
      });
      setDialogOpen(false);
      
      // Refresh data
      fetchUserData();
      
    } catch (error: any) {
      toast({
        title: "Error adding data",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleAddNewCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('customers')
        .insert({
          user_id: user.id,
          name: newCustomer.name,
          email: newCustomer.email || null,
          phone: newCustomer.phone || null
        })
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Customer added successfully",
      });
      
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
      });
      
      setCustomerDialogOpen(false);
      fetchCustomers();
      
    } catch (error: any) {
      toast({
        title: "Error adding customer",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleLinkDataToCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!user) return;
      
      if (!linkData.customer_id || !linkData.data_id) {
        toast({
          title: "Please select both customer and data",
          variant: "destructive"
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('customer_data_association')
        .insert({
          user_id: user.id,
          customer_id: linkData.customer_id,
          data_id: linkData.data_id
        });
      
      if (error) throw error;
      
      toast({
        title: "Data linked to customer successfully"
      });
      
      setLinkData({
        customer_id: '',
        data_id: ''
      });
      
      setLinkDialogOpen(false);
      fetchCustomerData();
      
    } catch (error: any) {
      toast({
        title: "Error linking data",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      if (!user) return;
      
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      sonnerToast.success('Customer deleted successfully');
      fetchCustomers();
      fetchCustomerData(); // Refresh associations too
      
    } catch (error: any) {
      sonnerToast.error('Error deleting customer: ' + error.message);
    }
  };

  const handleDeleteCustomerDataAssociation = async (id: string) => {
    try {
      if (!user) return;
      
      const { error } = await supabase
        .from('customer_data_association')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      sonnerToast.success('Association deleted successfully');
      fetchCustomerData();
      
    } catch (error: any) {
      sonnerToast.error('Error deleting association: ' + error.message);
    }
  };

  const handleFileSelected = async (file: File) => {
    setFileName(file.name);
    setIsUploading(true);

    try {
      if (!user) {
        throw new Error("You must be logged in to upload files");
      }

      // Parse the file based on its extension
      let rawData: SalonDataRow[] = [];
      
      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        const result = Papa.parse(text, { header: true });
        rawData = result.data as SalonDataRow[];
      } else if (file.name.endsWith('.json')) {
        const text = await file.text();
        const jsonData = JSON.parse(text);
        if (Array.isArray(jsonData)) {
          rawData = jsonData;
        } else {
          throw new Error("JSON file must contain an array of records");
        }
      } else {
        throw new Error("Unsupported file format. Please upload a CSV or JSON file.");
      }

      if (rawData.length === 0) {
        throw new Error("No data found in file");
      }

      // Process data
      const processedData = processAnalyticsData(rawData);
      
      // Store the data
      const rawDataPayload = {
        file_name: file.name,
        description: `Contains ${rawData.length} records uploaded from Data page`,
        data: rawData,
        user_id: user.id
      };
      
      const { error } = await supabase
        .from('raw_dashboard_data')
        .insert(rawDataPayload);
      
      if (error) throw error;
      
      toast({
        title: "File uploaded successfully",
        description: `Processed ${rawData.length} records from ${file.name}`
      });
      
      // Refresh data
      fetchDashboardData();
      
    } catch (error: any) {
      toast({
        title: "Error uploading file",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Fix the SelectItem value props issue
  const handleFilterChange = (filterType: string) => {
    setFilterType(filterType);
  };

  // Filter and search data
  const filteredData = userData.filter(item => {
    const matchesType = filterType === 'all' ? true : item.data_type === filterType;
    const matchesSearch = searchQuery
      ? item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchesType && matchesSearch;
  });

  // Get unique data types for filter
  const dataTypes = Array.from(new Set(userData.map(item => item.data_type)));

  return (
    <div className="flex min-h-screen bg-salon-background">
      <Sidebar />
      
      <div className="ml-16 md:ml-56 w-full p-6">
        <h1 className="text-3xl font-playfair font-bold mb-6">Data Management</h1>
        
        <Tabs defaultValue="data" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="data" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Data Records</span>
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Customers</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span>Upload Files</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="data">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10"
                />
              </div>
              <div className="w-full md:w-48">
                <Select value={filterType} onValueChange={handleFilterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {dataTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-salon-primary hover:bg-salon-primary/90">
                    <Plus className="mr-2 h-4 w-4" /> Add Data
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <form onSubmit={handleAddNewData}>
                    <DialogHeader>
                      <DialogTitle>Add New Data</DialogTitle>
                      <DialogDescription>
                        Add new data to your salon dashboard
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="data-type" className="col-span-4">
                          Type
                        </Label>
                        <Select 
                          value={newData.data_type}
                          onValueChange={(value) => setNewData({...newData, data_type: value})}
                        >
                          <SelectTrigger id="data-type" className="col-span-4">
                            <SelectValue placeholder="Select data type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="revenue">Revenue</SelectItem>
                            <SelectItem value="transaction">Transaction</SelectItem>
                            <SelectItem value="service">Service</SelectItem>
                            <SelectItem value="customer">Customer</SelectItem>
                            <SelectItem value="occupancy">Occupancy</SelectItem>
                            <SelectItem value="dashboard_upload">Dashboard Upload</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="col-span-4">
                          Title
                        </Label>
                        <Input
                          id="title"
                          value={newData.title}
                          onChange={(e) => setNewData({...newData, title: e.target.value})}
                          className="col-span-4"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="col-span-4">
                          Description
                        </Label>
                        <Input
                          id="description"
                          value={newData.description}
                          onChange={(e) => setNewData({...newData, description: e.target.value})}
                          className="col-span-4"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="value" className="col-span-4">
                          Value
                        </Label>
                        <Input
                          id="value"
                          type="number"
                          value={newData.value}
                          onChange={(e) => setNewData({...newData, value: e.target.value})}
                          className="col-span-4"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" className="bg-salon-primary hover:bg-salon-primary/90">Save Data</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Your Stored Data</CardTitle>
                <CardDescription>
                  View and manage all your salon data
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center p-6">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-salon-primary"></div>
                  </div>
                ) : filteredData.length === 0 ? (
                  <div className="text-center p-6 text-gray-500">
                    {searchQuery || filterType !== 'all'
                      ? "No data found matching your search criteria" 
                      : "No data found. Add your first data point using the button above."}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableCaption>A list of your salon data</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="capitalize">{item.data_type.replace('_', ' ')}</TableCell>
                            <TableCell>{item.title}</TableCell>
                            <TableCell>{item.description || '-'}</TableCell>
                            <TableCell>{item.value !== null ? item.value : '-'}</TableCell>
                            <TableCell>
                              {item.date 
                                ? new Date(item.date).toLocaleDateString() 
                                : new Date(item.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-xs"
                                onClick={() => {
                                  setLinkData({...linkData, data_id: item.id});
                                  setLinkDialogOpen(true);
                                }}
                              >
                                <Users className="h-3 w-3 mr-1" />
                                Link
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="customers">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search customers..."
                  className="w-full pl-10"
                />
              </div>
              <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-salon-primary hover:bg-salon-primary/90">
                    <Plus className="mr-2 h-4 w-4" /> Add Customer
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <form onSubmit={handleAddNewCustomer}>
                    <DialogHeader>
                      <DialogTitle>Add New Customer</DialogTitle>
                      <DialogDescription>
                        Add a new customer to your database
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="customer-name" className="col-span-4">
                          Name
                        </Label>
                        <Input
                          id="customer-name"
                          value={newCustomer.name}
                          onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                          className="col-span-4"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="customer-email" className="col-span-4">
                          Email
                        </Label>
                        <Input
                          id="customer-email"
                          type="email"
                          value={newCustomer.email}
                          onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                          className="col-span-4"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="customer-phone" className="col-span-4">
                          Phone
                        </Label>
                        <Input
                          id="customer-phone"
                          value={newCustomer.phone}
                          onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                          className="col-span-4"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" className="bg-salon-primary hover:bg-salon-primary/90">Save Customer</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              
              <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-salon-secondary hover:bg-salon-secondary/90">
                    <Database className="mr-2 h-4 w-4" /> Link Data
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <form onSubmit={handleLinkDataToCustomer}>
                    <DialogHeader>
                      <DialogTitle>Link Data to Customer</DialogTitle>
                      <DialogDescription>
                        Associate uploaded data with a customer
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="customer-select" className="col-span-4">
                          Customer
                        </Label>
                        <Select 
                          value={linkData.customer_id}
                          onValueChange={(value) => setLinkData({...linkData, customer_id: value})}
                        >
                          <SelectTrigger id="customer-select" className="col-span-4">
                            <SelectValue placeholder="Select a customer" />
                          </SelectTrigger>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="data-select" className="col-span-4">
                          Data Record
                        </Label>
                        <Select 
                          value={linkData.data_id}
                          onValueChange={(value) => setLinkData({...linkData, data_id: value})}
                        >
                          <SelectTrigger id="data-select" className="col-span-4">
                            <SelectValue placeholder="Select data record" />
                          </SelectTrigger>
                          <SelectContent>
                            {dashboardData.map((data) => (
                              <SelectItem key={data.id} value={data.id}>
                                {data.file_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" className="bg-salon-primary hover:bg-salon-primary/90">Link Data</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Database</CardTitle>
                  <CardDescription>
                    Manage your customer information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {customers.length === 0 ? (
                    <div className="text-center p-6 text-gray-500">
                      No customers found. Add your first customer using the button above.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableCaption>Your customer database</TableCaption>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Added On</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customers.map((customer) => (
                            <TableRow key={customer.id}>
                              <TableCell>{customer.name}</TableCell>
                              <TableCell>{customer.email || '-'}</TableCell>
                              <TableCell>{customer.phone || '-'}</TableCell>
                              <TableCell>{new Date(customer.created_at).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-red-500"
                                    onClick={() => handleDeleteCustomer(customer.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Data Links</CardTitle>
                  <CardDescription>
                    Data uploads associated with customers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {customerData.length === 0 ? (
                    <div className="text-center p-6 text-gray-500">
                      No customer data associations found. Link data to customers using the "Link Data" button.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableCaption>Data linked to customers</TableCaption>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Data Record</TableHead>
                            <TableHead>Linked On</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customerData.map((link) => (
                            <TableRow key={link.id}>
                              <TableCell>{link.customer_name}</TableCell>
                              <TableCell>{link.data_title}</TableCell>
                              <TableCell>{new Date(link.created_at).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-red-500"
                                  onClick={() => handleDeleteCustomerDataAssociation(link.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload Dashboard Data</CardTitle>
                <CardDescription>
                  Upload data files to be processed and stored in your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className={`border-2 border-dashed rounded-lg p-8 text-center
                    ${isUploading ? 'border-salon-primary bg-salon-primary/10' : 'border-gray-300'}`}
                  onDragOver={(e) => { e.preventDefault(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                      handleFileSelected(files[0]);
                    }
                  }}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-salon-primary rounded-full mb-4"></div>
                      <h3 className="text-lg font-medium mb-1">Uploading {fileName}...</h3>
                      <p className="text-sm text-gray-500">
                        Your file is being processed. Please wait.
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-2">Drop files here or click to upload</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Support for CSV and JSON files. The data will be processed and stored in your account.
                      </p>
                      <Button 
                        className="bg-salon-primary hover:bg-salon-primary/90"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = '.csv,.json';
                          input.onchange = (e: any) => {
                            const files = e.target.files;
                            if (files && files.length > 0) {
                              handleFileSelected(files[0]);
                            }
                          };
                          input.click();
                        }}
                      >
                        <Upload className="mr-2 h-4 w-4" /> Select Files
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Data;
