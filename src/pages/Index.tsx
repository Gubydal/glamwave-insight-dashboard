
import React, { useState } from 'react';
import Sidebar from '@/components/Dashboard/Sidebar';
import Dashboard from '@/components/Dashboard/Dashboard';

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };
  
  return (
    <div className="flex min-h-screen bg-salon-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className={`w-full ${sidebarCollapsed ? 'ml-16' : 'ml-16 md:ml-56'} transition-all duration-300`}>
        <Dashboard />
      </div>
    </div>
  );
};

export default Index;
