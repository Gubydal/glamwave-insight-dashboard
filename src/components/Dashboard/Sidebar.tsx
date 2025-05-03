
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, Users, Settings, CircleDot, FileText, Search, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, isActive, isCollapsed, onClick }) => {
  return (
    <Button
      variant="ghost"
      className={`w-full flex items-center justify-${isCollapsed ? 'center' : 'start'} mb-1 px-3 py-2 transition-all ${
        isActive 
          ? 'bg-salon-primary/10 text-salon-primary hover:bg-salon-primary/20' 
          : 'text-salon-text/70 hover:bg-salon-primary/5 hover:text-salon-text'
      }`}
      onClick={onClick}
    >
      <div className={isCollapsed ? 'mr-0' : 'mr-3'}>
        {icon}
      </div>
      {!isCollapsed && <span className="text-sm font-medium">{label}</span>}
    </Button>
  );
};

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = [
    { id: 'dashboard', icon: <TrendingUp size={18} />, label: 'Dashboard' },
    { id: 'customers', icon: <Users size={18} />, label: 'Customers' },
    { id: 'services', icon: <CircleDot size={18} />, label: 'Services' },
    { id: 'appointments', icon: <CalendarDays size={18} />, label: 'Appointments' },
    { id: 'reports', icon: <FileText size={18} />, label: 'Reports' },
    { id: 'search', icon: <Search size={18} />, label: 'Search' },
    { id: 'settings', icon: <Settings size={18} />, label: 'Settings' },
  ];

  return (
    <div 
      className={`bg-white border-r border-salon-tertiary/20 h-screen transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-56'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-salon-tertiary/20">
        {!isCollapsed && (
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-salon-primary to-salon-secondary flex items-center justify-center text-white font-playfair font-bold text-lg">
              G
            </div>
            <span className="ml-2 font-playfair font-medium text-salon-heading">GlamWave</span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 mx-auto rounded-full bg-gradient-to-br from-salon-primary to-salon-secondary flex items-center justify-center text-white font-playfair font-bold text-lg">
            G
          </div>
        )}
        {!isCollapsed && (
          <Button 
            variant="ghost" 
            size="sm"
            className="h-7 w-7 p-0 rounded-full hover:bg-salon-primary/10 text-salon-text/70"
            onClick={toggleCollapse}
          >
            <ChevronLeft size={16} />
          </Button>
        )}
      </div>
      <div className="p-2 mt-4">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={activeItem === item.id}
            isCollapsed={isCollapsed}
            onClick={() => setActiveItem(item.id)}
          />
        ))}
      </div>
      {isCollapsed && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <Button 
            variant="ghost" 
            size="sm"
            className="h-7 w-7 p-0 rounded-full hover:bg-salon-primary/10 text-salon-text/70"
            onClick={toggleCollapse}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
