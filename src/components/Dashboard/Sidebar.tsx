import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, TrendingUp, Users, Settings, 
  CircleDot, FileText, Search, CalendarDays, Database, LogOut, 
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

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

const Sidebar: React.FC<SidebarProps> = ({ collapsed: externalCollapsed, onToggle: externalToggle }) => {
  const [isCollapsed, setIsCollapsed] = useState(externalCollapsed || false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (externalToggle) {
      externalToggle();
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
      toast({
        title: "Signed out successfully",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        variant: "destructive"
      });
    }
  };

  const menuItems = [
    { id: 'dashboard', icon: <TrendingUp size={18} />, label: 'Dashboard', path: '/' },
    { id: 'customers', icon: <Users size={18} />, label: 'Customers', path: '/customers' },
    { id: 'services', icon: <CircleDot size={18} />, label: 'Services', path: '/services' },
    { id: 'appointments', icon: <CalendarDays size={18} />, label: 'Appointments', path: '/appointments' },
    { id: 'data', icon: <Database size={18} />, label: 'Data', path: '/data' },
    { id: 'reports', icon: <FileText size={18} />, label: 'Reports', path: '/reports' },
    { id: 'search', icon: <Search size={18} />, label: 'Search', path: '/search' },
    { id: 'settings', icon: <Settings size={18} />, label: 'Settings', path: '/settings' },
  ];

  return (
    <div 
      className={`bg-white border-r border-salon-tertiary/20 h-screen overflow-y-auto transition-all duration-300 ease-in-out fixed left-0 z-10 ${
        isCollapsed ? 'w-16' : 'w-56'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-salon-tertiary/20">
        {!isCollapsed && (
          <div className="flex items-center">
            <div className="h-8 w-8 bg-gradient-to-br from-salon-primary to-salon-secondary rounded-full flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="ml-2 font-playfair font-medium text-salon-heading">GlamWave</span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 mx-auto bg-gradient-to-br from-salon-primary to-salon-secondary rounded-full flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
        )}
        <Button 
          variant="ghost" 
          size="sm"
          className="h-7 w-7 p-0 rounded-full hover:bg-salon-primary/10 text-salon-text/70"
          onClick={toggleCollapse}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>

      {!isCollapsed && user && (
        <div className="p-4 border-b border-salon-tertiary/20">
          <div className="flex items-center">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-salon-secondary/20">{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="ml-3 max-w-[160px]">
              <p className="text-sm font-medium truncate">{user.email}</p>
              <p className="text-xs text-salon-text/60">Signed in</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="p-2 mt-4">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={location.pathname === item.path}
            isCollapsed={isCollapsed}
            onClick={() => navigate(item.path)}
          />
        ))}

        <div className="mt-auto pt-4 border-t border-salon-tertiary/20 mt-4">
          <SidebarItem
            icon={<LogOut size={18} />}
            label="Sign Out"
            isActive={false}
            isCollapsed={isCollapsed}
            onClick={handleSignOut}
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
