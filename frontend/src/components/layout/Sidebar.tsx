import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Receipt, 
  Package, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  isCollapsed,
  setIsCollapsed
}) => {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'invoices', name: 'Sales & Invoices', icon: FileText },
    { id: 'expenses', name: 'Purchases & Bills', icon: Receipt },
    { id: 'inventory', name: 'Inventory Catalog', icon: Package },
    { id: 'settings', name: 'System Settings', icon: Settings },
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-logo-container">
        {!isCollapsed ? (
          <div className="sidebar-logo">
            <TrendingUp size={24} strokeWidth={2.5} />
            <span>SmartERP</span>
          </div>
        ) : (
          <div className="sidebar-logo" style={{ justifyContent: 'center', width: '100%' }}>
            <TrendingUp size={24} strokeWidth={2.5} />
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <div
              key={item.id}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => onViewChange(item.id)}
              title={isCollapsed ? item.name : undefined}
            >
              {isActive && <div className="sidebar-indicator" />}
              <Icon size={20} style={{ minWidth: '20px' }} />
              {!isCollapsed && <span>{item.name}</span>}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button 
          className="btn btn-ghost"
          style={{ width: '100%', padding: '8px' }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
};
