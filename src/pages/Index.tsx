
import React from 'react';
import Sidebar from '@/components/Dashboard/Sidebar';
import Dashboard from '@/components/Dashboard/Dashboard';

const Index = () => {
  return (
    <div className="flex min-h-screen bg-salon-background">
      <Sidebar />
      <Dashboard />
    </div>
  );
};

export default Index;
