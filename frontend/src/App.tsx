import { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { DashboardView } from './components/views/DashboardView';
import { CustomersView } from './components/views/CustomersView';
import type { Customer } from './components/views/CustomersView';
import { SuppliersView } from './components/views/SuppliersView';
import type { Supplier } from './components/views/SuppliersView';
import { InventoryView } from './components/views/InventoryView';
import { PurchaseVoucher } from './components/views/PurchaseVoucher';
import { SalesVoucher } from './components/views/SalesVoucher';
import { ReportsView } from './components/views/ReportsView';
import { SettingsView } from './components/views/SettingsView';

// Interfaces
interface Invoice {
  id: string;
  customer: string;
  amount: number;
  date: string;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
}

interface Expense {
  id: string;
  supplier: string;
  category: 'Software' | 'Office' | 'Marketing' | 'Travel' | 'Operations';
  amount: number;
  date: string;
  description: string;
}

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  stockLevel: number;
  unitPrice: number;
  reorderPoint: number;
}

interface NotificationItem {
  id: string;
  text: string;
  time: string;
  read: boolean;
}

// Initial Mock Data
const INITIAL_INVOICES: Invoice[] = [
  { id: 'INV-2026-001', customer: 'Acme Corporation', amount: 12500, date: '2026-06-15', dueDate: '2026-07-15', status: 'Paid' },
  { id: 'INV-2026-002', customer: 'Vercel Ventures', amount: 8400, date: '2026-06-18', dueDate: '2026-07-18', status: 'Paid' },
  { id: 'INV-2026-003', customer: 'Stripe Payments Inc', amount: 9800, date: '2026-06-20', dueDate: '2026-07-20', status: 'Paid' },
  { id: 'INV-2026-004', customer: 'Global Logix', amount: 14200, date: '2026-06-22', dueDate: '2026-07-22', status: 'Pending' },
  { id: 'INV-2026-005', customer: 'Linear Software Co', amount: 4800, date: '2026-06-25', dueDate: '2026-07-25', status: 'Pending' },
  { id: 'INV-2026-006', customer: 'Supabase Inc', amount: 6200, date: '2026-06-28', dueDate: '2026-07-10', status: 'Overdue' },
  { id: 'INV-2026-007', customer: 'Notion Labs', amount: 7500, date: '2026-07-02', dueDate: '2026-08-02', status: 'Pending' },
];

const INITIAL_EXPENSES: Expense[] = [
  { id: 'EXP-2026-001', supplier: 'Amazon Web Services', category: 'Software', amount: 4500, date: '2026-06-10', description: 'AWS Production Cloud Compute Servers' },
  { id: 'EXP-2026-002', supplier: 'Framer Ltd', category: 'Software', amount: 320, date: '2026-06-12', description: 'Marketing Website Builder Subscription' },
  { id: 'EXP-2026-003', supplier: 'Google Workspace', category: 'Office', amount: 680, date: '2026-06-14', description: 'Corporate Email and GSuite Accounts' },
  { id: 'EXP-2026-004', supplier: 'Warp Terminal', category: 'Software', amount: 150, date: '2026-06-20', description: 'Developer Tools licenses' },
  { id: 'EXP-2026-005', supplier: 'GitHub Inc', category: 'Software', amount: 4200, date: '2026-06-24', description: 'GitHub Enterprise Copilot subscription' },
  { id: 'EXP-2026-006', supplier: 'Slack Corp', category: 'Software', amount: 1200, date: '2026-06-26', description: 'Internal Communications channels' },
  { id: 'EXP-2026-007', supplier: 'Facebook Ads', category: 'Marketing', amount: 8000, date: '2026-06-28', description: 'Q2 Customer Acquisition campaigns' },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: '1', sku: 'LAP-MAC-16', name: 'MacBook Pro 16-inch M3', stockLevel: 14, unitPrice: 2499, reorderPoint: 5 },
  { id: '2', sku: 'LAP-MAC-14', name: 'MacBook Air 14-inch M2', stockLevel: 3, unitPrice: 1299, reorderPoint: 5 },
  { id: '3', sku: 'MON-STU-27', name: 'Apple Studio Display 27"', stockLevel: 8, unitPrice: 1599, reorderPoint: 4 },
  { id: '4', sku: 'ACC-KEY-MX', name: 'Logitech MX Keys Keyboard', stockLevel: 24, unitPrice: 119, reorderPoint: 8 },
  { id: '5', sku: 'ACC-MSE-MX', name: 'Logitech MX Master 3S Mouse', stockLevel: 1, unitPrice: 99, reorderPoint: 10 },
  { id: '6', sku: 'PHN-IPH-15', name: 'iPhone 15 Pro Max 256GB', stockLevel: 12, unitPrice: 1199, reorderPoint: 4 },
  { id: '7', sku: 'TAB-IPD-11', name: 'iPad Pro 11-inch M2', stockLevel: 2, unitPrice: 799, reorderPoint: 3 },
  { id: '8', sku: 'ACC-USB-C3', name: 'Anker USB-C Multiport Adapter', stockLevel: 45, unitPrice: 49, reorderPoint: 12 },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', text: 'AWS monthly bill recorded for $4,500.', time: '1 day ago', read: false },
  { id: 'n2', text: 'Stock level warning: ACC-MSE-MX is below reorder point (1 unit left).', time: '2 days ago', read: false },
  { id: 'n3', text: 'Invoice to Notion Labs successfully cached.', time: '3 days ago', read: true },
];

const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'CUST-001', name: 'Acme Corporation', email: 'billing@acme.com', phone: '+1 555-0144', company: 'Acme Corporation', outstandingBalance: 12500 },
  { id: 'CUST-002', name: 'Vercel Ventures', email: 'accounts@vercel.com', phone: '+1 555-0155', company: 'Vercel Ventures', outstandingBalance: 8400 },
  { id: 'CUST-003', name: 'Stripe Payments Inc', email: 'pay@stripe.com', phone: '+1 555-0166', company: 'Stripe Payments Inc', outstandingBalance: 9800 },
  { id: 'CUST-004', name: 'Global Logix', email: 'ops@logix.com', phone: '+1 555-0177', company: 'Global Logix', outstandingBalance: 14200 },
  { id: 'CUST-005', name: 'Linear Software Co', email: 'accounting@linear.app', phone: '+1 555-0188', company: 'Linear Software Co', outstandingBalance: 4800 },
  { id: 'CUST-006', name: 'Supabase Inc', email: 'finance@supabase.io', phone: '+1 555-0199', company: 'Supabase Inc', outstandingBalance: 6200 },
  { id: 'CUST-007', name: 'Notion Labs', email: 'billing@notion.so', phone: '+1 555-0200', company: 'Notion Labs', outstandingBalance: 7500 },
];

const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 'SUPP-001', name: 'Amazon Web Services', email: 'aws-billing@amazon.com', phone: '+1 800-201-9922', company: 'Amazon Web Services', outstandingBalance: 4500 },
  { id: 'SUPP-002', name: 'Framer Ltd', email: 'finance@framer.com', phone: '+44 20-7946-0958', company: 'Framer Ltd', outstandingBalance: 320 },
  { id: 'SUPP-003', name: 'Google Workspace', email: 'workspace-billing@google.com', phone: '+1 800-419-0157', company: 'Google Workspace', outstandingBalance: 680 },
  { id: 'SUPP-004', name: 'Warp Terminal', email: 'billing@warp.dev', phone: '+1 555-0211', company: 'Warp Terminal', outstandingBalance: 150 },
  { id: 'SUPP-005', name: 'GitHub Inc', email: 'enterprise@github.com', phone: '+1 888-448-4822', company: 'GitHub Inc', outstandingBalance: 4200 },
  { id: 'SUPP-006', name: 'Slack Corp', email: 'billing@slack.com', phone: '+1 415-555-0133', company: 'Slack Corp', outstandingBalance: 1200 },
  { id: 'SUPP-007', name: 'Facebook Ads', email: 'ads-billing@meta.com', phone: '+1 650-543-4800', company: 'Facebook Ads', outstandingBalance: 8000 },
];

export default function App() {
  // Navigation & Layout states
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Core Persistence States
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const cached = localStorage.getItem('smarterp_invoices');
    return cached ? JSON.parse(cached) : [...INITIAL_INVOICES];
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const cached = localStorage.getItem('smarterp_expenses');
    return cached ? JSON.parse(cached) : [...INITIAL_EXPENSES];
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const cached = localStorage.getItem('smarterp_inventory');
    return cached ? JSON.parse(cached) : [...INITIAL_INVENTORY];
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const cached = localStorage.getItem('smarterp_notifications');
    return cached ? JSON.parse(cached) : [...INITIAL_NOTIFICATIONS];
  });

  const [companyName, setCompanyName] = useState<string>(() => {
    return localStorage.getItem('smarterp_company_name') || 'Labmentix Solutions';
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const cached = localStorage.getItem('smarterp_customers');
    return cached ? JSON.parse(cached) : [...INITIAL_CUSTOMERS];
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const cached = localStorage.getItem('smarterp_suppliers');
    return cached ? JSON.parse(cached) : [...INITIAL_SUPPLIERS];
  });

  // Modals state
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem('smarterp_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('smarterp_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('smarterp_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('smarterp_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('smarterp_company_name', companyName);
  }, [companyName]);

  useEffect(() => {
    localStorage.setItem('smarterp_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('smarterp_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  // Modifiers
  const handleAddInvoice = (newInv: Omit<Invoice, 'id'>) => {
    const nextNum = invoices.length + 1;
    const padded = String(nextNum).padStart(3, '0');
    const id = `INV-2026-${padded}`;
    setInvoices(prev => [{ ...newInv, id }, ...prev]);
    
    // Auto-trigger notification
    setNotifications(prev => [
      {
        id: `n_inv_${Date.now()}`,
        text: `New Sales Voucher recorded for ${newInv.customer} ($${newInv.amount}).`,
        time: 'Just now',
        read: false
      },
      ...prev
    ]);
  };

  const handleDeleteInvoices = (ids: string[]) => {
    setInvoices(prev => prev.filter(inv => !ids.includes(inv.id)));
  };

  const handleMarkInvoiceAsPaid = (ids: string[]) => {
    setInvoices(prev => prev.map(inv => 
      ids.includes(inv.id) ? { ...inv, status: 'Paid' as const } : inv
    ));
  };

  const handleAddExpense = (newExp: Omit<Expense, 'id'>) => {
    const nextNum = expenses.length + 1;
    const padded = String(nextNum).padStart(3, '0');
    const id = `EXP-2026-${padded}`;
    setExpenses(prev => [{ ...newExp, id }, ...prev]);

    setNotifications(prev => [
      {
        id: `n_exp_${Date.now()}`,
        text: `New Purchase Voucher recorded from ${newExp.supplier} ($${newExp.amount}).`,
        time: 'Just now',
        read: false
      },
      ...prev
    ]);
  };

  const handleDeleteExpenses = (ids: string[]) => {
    setExpenses(prev => prev.filter(exp => !ids.includes(exp.id)));
  };

  const handleAddInventoryItem = (newItem: Omit<InventoryItem, 'id'>) => {
    const nextId = String(inventory.length + 1);
    setInventory(prev => [{ ...newItem, id: nextId }, ...prev]);
  };

  const handleDeleteInventoryItems = (ids: string[]) => {
    setInventory(prev => prev.filter(item => !ids.includes(item.id)));
  };

  const handleAdjustStock = (id: string, delta: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const nextStock = Math.max(0, item.stockLevel + delta);
        
        if (nextStock <= item.reorderPoint && item.stockLevel > item.reorderPoint) {
          setNotifications(n => [
            {
              id: `n_stock_alert_${Date.now()}`,
              text: `Stock level warning: ${item.sku} (${item.name}) is below reorder point (${nextStock} units left).`,
              time: 'Just now',
              read: false
            },
            ...n
          ]);
        }
        return { ...item, stockLevel: nextStock };
      }
      return item;
    }));
  };

  const handleMarkNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleAddCustomer = (newCust: Omit<Customer, 'id'>) => {
    const nextId = `CUST-${String(customers.length + 1).padStart(3, '0')}`;
    setCustomers(prev => [{ ...newCust, id: nextId }, ...prev]);
  };

  const handleDeleteCustomers = (ids: string[]) => {
    setCustomers(prev => prev.filter(c => !ids.includes(c.id)));
  };

  const handleAddSupplier = (newSupp: Omit<Supplier, 'id'>) => {
    const nextId = `SUPP-${String(suppliers.length + 1).padStart(3, '0')}`;
    setSuppliers(prev => [{ ...newSupp, id: nextId }, ...prev]);
  };

  const handleDeleteSuppliers = (ids: string[]) => {
    setSuppliers(prev => prev.filter(s => !ids.includes(s.id)));
  };

  // Switch Router
  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            invoices={invoices}
            expenses={expenses}
            inventory={inventory}
            onNavigate={setCurrentView}
            openInvoiceModal={() => {
              setCurrentView('sales_voucher');
              setIsInvoiceModalOpen(true);
            }}
            openExpenseModal={() => {
              setCurrentView('purchase_voucher');
              setIsExpenseModalOpen(true);
            }}
            openInventoryModal={() => {
              setCurrentView('inventory');
              setIsInventoryModalOpen(true);
            }}
          />
        );
      case 'customers':
        return (
          <CustomersView
            customers={customers}
            onAddCustomer={handleAddCustomer}
            onDeleteCustomers={handleDeleteCustomers}
          />
        );
      case 'suppliers':
        return (
          <SuppliersView
            suppliers={suppliers}
            onAddSupplier={handleAddSupplier}
            onDeleteSuppliers={handleDeleteSuppliers}
          />
        );
      case 'inventory':
        return (
          <InventoryView
            inventory={inventory}
            onAddInventoryItem={handleAddInventoryItem}
            onDeleteInventoryItems={handleDeleteInventoryItems}
            onAdjustStock={handleAdjustStock}
            isCreateModalOpen={isInventoryModalOpen}
            setIsCreateModalOpen={setIsInventoryModalOpen}
          />
        );
      case 'sales_voucher':
        return (
          <SalesVoucher
            invoices={invoices}
            customers={customers}
            onAddInvoice={handleAddInvoice}
            onDeleteInvoices={handleDeleteInvoices}
            onMarkAsPaid={handleMarkInvoiceAsPaid}
            isCreateModalOpen={isInvoiceModalOpen}
            setIsCreateModalOpen={setIsInvoiceModalOpen}
          />
        );
      case 'purchase_voucher':
        return (
          <PurchaseVoucher
            expenses={expenses}
            suppliers={suppliers}
            onAddExpense={handleAddExpense}
            onDeleteExpenses={handleDeleteExpenses}
            isCreateModalOpen={isExpenseModalOpen}
            setIsCreateModalOpen={setIsExpenseModalOpen}
          />
        );
      case 'reports':
        return (
          <ReportsView
            invoices={invoices}
            expenses={expenses}
            inventory={inventory}
            companyName={companyName}
          />
        );
      case 'settings':
        return (
          <SettingsView
            companyName={companyName}
            setCompanyName={setCompanyName}
          />
        );
      default:
        return <div className="page-container"><p>Page not found.</p></div>;
    }
  };

  return (
    <div className="app-container">
      {/* Collapsible Left Sidebar */}
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Container */}
      <div className="main-content">
        <Navbar
          notifications={notifications}
          onMarkNotificationsAsRead={handleMarkNotificationsAsRead}
        />
        {renderActiveView()}
      </div>
    </div>
  );
}

