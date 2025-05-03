
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
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

interface UserData {
  id: string;
  title: string;
  description: string | null;
  data_type: string;
  value: number | null;
  date: string | null;
  created_at: string;
}

const Data = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form state for new data
  const [newData, setNewData] = useState({
    title: '',
    description: '',
    data_type: 'revenue',
    value: '',
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchUserData();
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
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-playfair font-bold mb-6">Your Data</h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              {dataTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
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
                      <TableCell className="capitalize">{item.data_type}</TableCell>
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
    </div>
  );
};

export default Data;
