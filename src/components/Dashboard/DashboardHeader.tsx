
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserCircle, BarChart3 } from 'lucide-react';

const DashboardHeader: React.FC = () => {
  return (
    <header className="flex items-center justify-between py-4 px-6 bg-white shadow-sm rounded-lg mb-6">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-salon-primary to-salon-secondary flex items-center justify-center text-white">
          <BarChart3 className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-playfair font-semibold ml-3">GlamWave Analytics</h1>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline" className="border-salon-tertiary/30 text-salon-text">
          <UserCircle className="h-5 w-5 mr-2" />
          <span>Admin</span>
        </Button>
      </div>
    </header>
  );
};

export default DashboardHeader;
