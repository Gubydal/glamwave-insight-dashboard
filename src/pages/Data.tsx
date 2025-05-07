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
import { Plus, Upload, FileText, Edit, Trash2, Search, Users } from 'lucide-react';
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

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
}

const Data = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('data');
  
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
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchCustomers();
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

  const fetchCustomers = async () => {
    try {
      if (!user) return;
      
      setLoading(true);
      
      // This is a placeholder - you would create a customers table in Supabase
      // For now, we're creating sample data
      const sampleCustomers = [
        {
          id: '1',
          name: 'Jane Doe',
          email: 'jane@example.com',
          phone: '+212 555-1234',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'John Smith',
          email: 'john@example.com',
          phone: '+212 555-5678',
          created_at: new Date().toISOString(),
        }
      ];
      
      setCustomers(sampleCustomers);
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
    
    // This is where you would add code to insert a new customer to a customers table
    // For now we'll just show a toast
    toast({
      title: "Customer functionality coming soon",
      description: "Customer management is under development"
    });
    
    setCustomerDialogOpen(false);
  };

  // Fix the SelectItem value props issue
  const handleFilterChange = (filterType: string) => {
    setFilterType(filterType);
  };

  // Filter and search data
  const filteredData = userData.filter(item => {
    const matchesType = filterType ? item.data_type === filterType : true;
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
                    {/* Fix: Changed empty string value to "all" */}
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
                    {searchQuery || filterType 
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
            </div>
            
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
                                <Button variant="outline" size="sm" className="text-red-500">
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
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Drop files here or click to upload</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Support for CSV and JSON files. The data will be processed and stored in your account.
                  </p>
                  <Button className="bg-salon-primary hover:bg-salon-primary/90">
                    <Upload className="mr-2 h-4 w-4" /> Select Files
                  </Button>
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
