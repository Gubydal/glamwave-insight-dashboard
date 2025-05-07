
import React, { useState } from 'react';
import Sidebar from '@/components/Dashboard/Sidebar';
import Dashboard from '@/components/Dashboard/Dashboard';

const Index = () => {
  return (
    <div className="flex min-h-screen bg-salon-background">
      <Sidebar />
      <div className="ml-16 md:ml-56 w-full">
        <Dashboard />
      </div>
    </div>
  );
};

export default Index;
