
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
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Search, Users } from 'lucide-react';
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
import { toast as sonnerToast } from 'sonner';

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
}

const Customers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form state for new customer
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
  });
  
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCustomerId, setCurrentCustomerId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
  }, [user?.id]);

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

  const handleAddOrUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!user) return;
      
      if (editMode && currentCustomerId) {
        // Update existing customer
        const { error } = await supabase
          .from('customers')
          .update({
            name: newCustomer.name,
            email: newCustomer.email || null,
            phone: newCustomer.phone || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentCustomerId);
        
        if (error) throw error;
        
        toast({
          title: "Customer updated successfully",
        });
      } else {
        // Add new customer
        const { error } = await supabase
          .from('customers')
          .insert({
            user_id: user.id,
            name: newCustomer.name,
            email: newCustomer.email || null,
            phone: newCustomer.phone || null
          });
        
        if (error) throw error;
        
        toast({
          title: "Customer added successfully",
        });
      }
      
      resetForm();
      setCustomerDialogOpen(false);
      fetchCustomers();
      
    } catch (error: any) {
      toast({
        title: `Error ${editMode ? 'updating' : 'adding'} customer`,
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditMode(true);
    setCurrentCustomerId(customer.id);
    setNewCustomer({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
    });
    setCustomerDialogOpen(true);
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
      
    } catch (error: any) {
      sonnerToast.error('Error deleting customer: ' + error.message);
    }
  };
  
  const resetForm = () => {
    setNewCustomer({
      name: '',
      email: '',
      phone: '',
    });
    setEditMode(false);
    setCurrentCustomerId(null);
  };

  const closeDialog = () => {
    resetForm();
    setCustomerDialogOpen(false);
  };
  
  // Filter customers based on search query
  const filteredCustomers = customers.filter((customer) => {
    return (
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (customer.phone && customer.phone.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="flex min-h-screen bg-salon-background">
      <Sidebar />
      
      <div className="ml-16 md:ml-56 w-full p-6">
        <h1 className="text-3xl font-playfair font-bold mb-6">Customer Management</h1>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              <form onSubmit={handleAddOrUpdateCustomer}>
                <DialogHeader>
                  <DialogTitle>{editMode ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
                  <DialogDescription>
                    {editMode ? 'Update customer information' : 'Add a new customer to your database'}
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
                <DialogFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
                  <Button type="submit" className="bg-salon-primary hover:bg-salon-primary/90">
                    {editMode ? 'Update Customer' : 'Save Customer'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
            
        <Card className="shadow-lg border-salon-tertiary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-semibold">Customer Database</CardTitle>
            <CardDescription>
              Manage your customer information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-6">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-salon-primary"></div>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center p-6 text-gray-500">
                {searchQuery ? "No customers found matching your search." : "No customers found. Add your first customer using the button above."}
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
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>{customer.name}</TableCell>
                        <TableCell>{customer.email || '-'}</TableCell>
                        <TableCell>{customer.phone || '-'}</TableCell>
                        <TableCell>{new Date(customer.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditCustomer(customer)}
                            >
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
      </div>
    </div>
  );
};

export default Customers;
