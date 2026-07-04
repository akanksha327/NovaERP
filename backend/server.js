import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Requests for frontend integration
app.use(cors());
app.use(express.json());

// In-Memory Database (Synced with initial mock data on frontend)
let invoices = [
  { id: 'INV-2026-001', customer: 'Acme Corporation', amount: 12500, date: '2026-06-15', dueDate: '2026-07-15', status: 'Paid' },
  { id: 'INV-2026-002', customer: 'Vercel Ventures', amount: 8400, date: '2026-06-18', dueDate: '2026-07-18', status: 'Paid' },
  { id: 'INV-2026-003', customer: 'Stripe Payments Inc', amount: 9800, date: '2026-06-20', dueDate: '2026-07-20', status: 'Paid' },
  { id: 'INV-2026-004', customer: 'Global Logix', amount: 14200, date: '2026-06-22', dueDate: '2026-07-22', status: 'Pending' },
  { id: 'INV-2026-005', customer: 'Linear Software Co', amount: 4800, date: '2026-06-25', dueDate: '2026-07-25', status: 'Pending' },
  { id: 'INV-2026-006', customer: 'Supabase Inc', amount: 6200, date: '2026-06-28', dueDate: '2026-07-10', status: 'Overdue' },
  { id: 'INV-2026-007', customer: 'Notion Labs', amount: 7500, date: '2026-07-02', dueDate: '2026-08-02', status: 'Pending' },
];

let expenses = [
  { id: 'EXP-2026-001', supplier: 'Amazon Web Services', category: 'Software', amount: 4500, date: '2026-06-10', description: 'AWS Production Cloud Compute Servers' },
  { id: 'EXP-2026-002', supplier: 'Framer Ltd', category: 'Software', amount: 320, date: '2026-06-12', description: 'Marketing Website Builder Subscription' },
  { id: 'EXP-2026-003', supplier: 'Google Workspace', category: 'Office', amount: 680, date: '2026-06-14', description: 'Corporate Email and GSuite Accounts' },
  { id: 'EXP-2026-004', supplier: 'Warp Terminal', category: 'Software', amount: 150, date: '2026-06-20', description: 'Developer Tools licenses' },
  { id: 'EXP-2026-005', supplier: 'GitHub Inc', category: 'Software', amount: 4200, date: '2026-06-24', description: 'GitHub Enterprise Copilot subscription' },
  { id: 'EXP-2026-006', supplier: 'Slack Corp', category: 'Software', amount: 1200, date: '2026-06-26', description: 'Internal Communications channels' },
  { id: 'EXP-2026-007', supplier: 'Facebook Ads', category: 'Marketing', amount: 8000, date: '2026-06-28', description: 'Q2 Customer Acquisition campaigns' },
];

let inventory = [
  { id: '1', sku: 'LAP-MAC-16', name: 'MacBook Pro 16-inch M3', stockLevel: 14, unitPrice: 2499, reorderPoint: 5 },
  { id: '2', sku: 'LAP-MAC-14', name: 'MacBook Air 14-inch M2', stockLevel: 3, unitPrice: 1299, reorderPoint: 5 },
  { id: '3', sku: 'MON-STU-27', name: 'Apple Studio Display 27"', stockLevel: 8, unitPrice: 1599, reorderPoint: 4 },
  { id: '4', sku: 'ACC-KEY-MX', name: 'Logitech MX Keys Keyboard', stockLevel: 24, unitPrice: 119, reorderPoint: 8 },
  { id: '5', sku: 'ACC-MSE-MX', name: 'Logitech MX Master 3S Mouse', stockLevel: 1, unitPrice: 99, reorderPoint: 10 },
  { id: '6', sku: 'PHN-IPH-15', name: 'iPhone 15 Pro Max 256GB', stockLevel: 12, unitPrice: 1199, reorderPoint: 4 },
  { id: '7', sku: 'TAB-IPD-11', name: 'iPad Pro 11-inch M2', stockLevel: 2, unitPrice: 799, reorderPoint: 3 },
  { id: '8', sku: 'ACC-USB-C3', name: 'Anker USB-C Multiport Adapter', stockLevel: 45, unitPrice: 49, reorderPoint: 12 },
];

// --- API ROUTES ---

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// Invoices API
app.get('/api/invoices', (req, res) => {
  res.json(invoices);
});

app.post('/api/invoices', (req, res) => {
  const { customer, amount, date, dueDate, status } = req.body;
  if (!customer || !amount || !date || !dueDate) {
    return res.status(400).json({ error: 'Missing required invoice parameters' });
  }
  const nextNum = invoices.length + 1;
  const id = `INV-2026-${String(nextNum).padStart(3, '0')}`;
  const newInvoice = { id, customer, amount: parseFloat(amount), date, dueDate, status: status || 'Pending' };
  invoices.unshift(newInvoice);
  res.status(201).json(newInvoice);
});

app.patch('/api/invoices/:id/pay', (req, res) => {
  const { id } = req.params;
  const invoice = invoices.find(inv => inv.id === id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  invoice.status = 'Paid';
  res.json(invoice);
});

app.delete('/api/invoices', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'List of IDs to delete is required' });
  invoices = invoices.filter(inv => !ids.includes(inv.id));
  res.json({ success: true, remainingCount: invoices.length });
});

// Expenses API
app.get('/api/expenses', (req, res) => {
  res.json(expenses);
});

app.post('/api/expenses', (req, res) => {
  const { supplier, category, amount, date, description } = req.body;
  if (!supplier || !category || !amount || !date) {
    return res.status(400).json({ error: 'Missing required expense parameters' });
  }
  const nextNum = expenses.length + 1;
  const id = `EXP-2026-${String(nextNum).padStart(3, '0')}`;
  const newExpense = { id, supplier, category, amount: parseFloat(amount), date, description: description || '' };
  expenses.unshift(newExpense);
  res.status(201).json(newExpense);
});

app.delete('/api/expenses', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'List of IDs to delete is required' });
  expenses = expenses.filter(exp => !ids.includes(exp.id));
  res.json({ success: true, remainingCount: expenses.length });
});

// Inventory API
app.get('/api/inventory', (req, res) => {
  res.json(inventory);
});

app.post('/api/inventory', (req, res) => {
  const { sku, name, stockLevel, unitPrice, reorderPoint } = req.body;
  if (!sku || !name || stockLevel === undefined || !unitPrice || reorderPoint === undefined) {
    return res.status(400).json({ error: 'Missing required catalog parameters' });
  }
  const id = String(inventory.length + 1);
  const newItem = { 
    id, 
    sku: sku.toUpperCase(), 
    name, 
    stockLevel: parseInt(stockLevel), 
    unitPrice: parseFloat(unitPrice), 
    reorderPoint: parseInt(reorderPoint) 
  };
  inventory.unshift(newItem);
  res.status(201).json(newItem);
});

app.patch('/api/inventory/:id/stock', (req, res) => {
  const { id } = req.params;
  const { delta } = req.body;
  if (delta === undefined) return res.status(400).json({ error: 'Delta value is required' });
  const item = inventory.find(i => i.id === id);
  if (!item) return res.status(404).json({ error: 'Catalog item not found' });
  item.stockLevel = Math.max(0, item.stockLevel + parseInt(delta));
  res.json(item);
});

app.delete('/api/inventory', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'List of IDs to delete is required' });
  inventory = inventory.filter(i => !ids.includes(i.id));
  res.json({ success: true, remainingCount: inventory.length });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[SmartERP Server] Running on http://localhost:${PORT}`);
  console.log(`[SmartERP Server] Health Check: http://localhost:${PORT}/api/health`);
});
