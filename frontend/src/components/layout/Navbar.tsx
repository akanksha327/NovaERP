import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  ChevronDown, 
  Building2,
  User,
  LogOut,
  Settings
} from 'lucide-react';

interface NavbarProps {
  notifications: { id: string; text: string; time: string; read: boolean }[];
  onMarkNotificationsAsRead: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  notifications,
  onMarkNotificationsAsRead
}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [company, setCompany] = useState('Labmentix Solutions');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const companies = ['Labmentix Solutions', 'Acme Trading Co', 'Vercel Ventures'];
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="navbar">
      <div className="navbar-left">
        {/* Company Selector */}
        <div className="company-selector-wrapper">
          <button 
            className="company-selector"
            onClick={() => {
              setShowCompanyDropdown(!showCompanyDropdown);
              setShowNotificationDropdown(false);
              setShowProfileDropdown(false);
            }}
          >
            <Building2 size={16} className="text-muted" />
            <span className="font-semibold text-sm">{company}</span>
            <ChevronDown size={14} className="text-muted" />
          </button>
          
          {showCompanyDropdown && (
            <div className="dropdown-menu">
              {companies.map((c) => (
                <div
                  key={c}
                  className={`dropdown-item ${company === c ? 'active' : ''}`}
                  onClick={() => {
                    setCompany(c);
                    setShowCompanyDropdown(false);
                  }}
                >
                  {c}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Global Search */}
        <div className="search-container">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search transactions, clients, items..." 
            className="search-input"
          />
          <kbd className="search-kbd">⌘K</kbd>
        </div>
      </div>

      <div className="navbar-right">
        {/* Dark Mode Toggle */}
        <button 
          className="btn btn-ghost theme-toggle" 
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Notifications Dropdown */}
        <div className="notification-wrapper">
          <button 
            className="btn btn-ghost notification-btn"
            onClick={() => {
              setShowNotificationDropdown(!showNotificationDropdown);
              setShowCompanyDropdown(false);
              setShowProfileDropdown(false);
              if (!showNotificationDropdown) {
                onMarkNotificationsAsRead();
              }
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {showNotificationDropdown && (
            <div className="dropdown-menu notification-menu">
              <div className="notification-header flex-row align-center justify-between">
                <span className="font-semibold text-sm text-heading">Notifications</span>
                {unreadCount > 0 && <span className="text-xs text-muted">{unreadCount} new</span>}
              </div>
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="notification-empty text-xs text-muted">No new alerts</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`notification-item ${!n.read ? 'unread' : ''}`}>
                      <p className="notification-text text-sm text-body">{n.text}</p>
                      <span className="notification-time text-xs text-muted">{n.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="profile-wrapper">
          <button 
            className="profile-btn"
            onClick={() => {
              setShowProfileDropdown(!showProfileDropdown);
              setShowCompanyDropdown(false);
              setShowNotificationDropdown(false);
            }}
          >
            <div className="profile-avatar">
              <span>AD</span>
            </div>
            <div className="profile-info flex-column">
              <span className="profile-name font-semibold text-sm text-heading">Alex Danvers</span>
              <span className="profile-role text-xs text-muted">Accountant</span>
            </div>
            <ChevronDown size={14} className="text-muted" />
          </button>

          {showProfileDropdown && (
            <div className="dropdown-menu profile-menu-dropdown">
              <div className="dropdown-header">
                <p className="font-semibold text-sm text-heading">Alex Danvers</p>
                <p className="text-xs text-muted">alex.danvers@smarterp.com</p>
              </div>
              <div className="dropdown-divider" />
              <div className="dropdown-item">
                <User size={14} />
                <span>My Profile</span>
              </div>
              <div className="dropdown-item">
                <Settings size={14} />
                <span>Settings</span>
              </div>
              <div className="dropdown-divider" />
              <div className="dropdown-item text-danger">
                <LogOut size={14} />
                <span>Log out</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
