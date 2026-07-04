import React, { useState } from 'react';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShoppingBag, 
  AlertTriangle, 
  FileText, 
  PlusCircle, 
  ArrowRight,
  FileDown,
  TrendingUp
} from 'lucide-react';

interface DashboardViewProps {
  invoices: any[];
  expenses: any[];
  inventory: any[];
  onNavigate: (view: string) => void;
  openInvoiceModal: () => void;
  openExpenseModal: () => void;
  openInventoryModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  invoices,
  expenses,
  inventory,
  onNavigate,
  openInvoiceModal,
  openExpenseModal,
  openInventoryModal
}) => {
  // Compute dashboard metrics from active state lists
  const totalRevenue = invoices
    .filter(inv => inv.status === 'Paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalSales = invoices
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalSalesOutstanding = invoices
    .filter(inv => inv.status === 'Pending' || inv.status === 'Overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalPurchases = expenses
    .reduce((sum, exp) => sum + exp.amount, 0);

  const totalInventoryValue = inventory
    .reduce((sum, item) => sum + (item.stockLevel * item.unitPrice), 0);

  const totalStockItems = inventory
    .reduce((sum, item) => sum + item.stockLevel, 0);

  // Identify low stock items
  const lowStockItems = inventory.filter(item => item.stockLevel <= item.reorderPoint);

  // SVG Chart Calculations
  // Monthly Revenue and Purchases Mock Data for 6 months (Jan-Jun)
  const chartData = [
    { name: 'Jan', revenue: 14200, purchases: 6500 },
    { name: 'Feb', revenue: 17800, purchases: 7200 },
    { name: 'Mar', revenue: 21500, purchases: 11000 },
    { name: 'Apr', revenue: 19000, purchases: 8400 },
    { name: 'May', revenue: 28500, purchases: 12500 },
    { name: 'Jun', revenue: totalRevenue > 0 ? Math.max(totalRevenue / 3, 24000) : 31200, purchases: totalPurchases > 0 ? Math.max(totalPurchases / 3, 9800) : 10500 },
  ];

  const maxVal = Math.max(...chartData.map(d => Math.max(d.revenue, d.purchases))) * 1.15;
  const chartHeight = 160;
  const chartWidth = 500;
  const paddingX = 40;
  const paddingY = 20;

  const getCoordinates = (index: number, value: number) => {
    const x = paddingX + (index * (chartWidth - 2 * paddingX)) / (chartData.length - 1);
    const y = chartHeight - paddingY - (value * (chartHeight - 2 * paddingY)) / maxVal;
    return { x, y };
  };

  // Generate paths for SVG
  const revenuePoints = chartData.map((d, i) => getCoordinates(i, d.revenue));
  const purchasePoints = chartData.map((d, i) => getCoordinates(i, d.purchases));

  const revenuePath = revenuePoints.reduce((path, p, i) => 
    i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`, ''
  );
  
  const purchasePath = purchasePoints.reduce((path, p, i) => 
    i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`, ''
  );

  const revenueAreaPath = revenuePoints.length > 0 
    ? `${revenuePath} L ${revenuePoints[revenuePoints.length - 1].x} ${chartHeight - paddingY} L ${revenuePoints[0].x} ${chartHeight - paddingY} Z`
    : '';

  // Hover states for chart dots
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; x: number; y: number; revenue: number; purchases: number; name: string } | null>(null);

  // Recent transactions list (merge invoices and expenses, sort by date)
  const combinedTransactions = [
    ...invoices.map(inv => ({
      id: inv.id,
      description: `Invoice to ${inv.customer}`,
      type: 'Sale',
      amount: inv.amount,
      date: inv.date,
      status: inv.status,
      badgeClass: inv.status === 'Paid' ? 'badge-success' : inv.status === 'Pending' ? 'badge-warning' : 'badge-danger'
    })),
    ...expenses.map(exp => ({
      id: exp.id,
      description: `Purchased: ${exp.category} (${exp.supplier})`,
      type: 'Purchase',
      amount: exp.amount,
      date: exp.date,
      status: 'Paid',
      badgeClass: 'badge-success'
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="page-container">
      {/* Welcome Header */}
      <div className="flex-row justify-between align-center" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="text-2xl font-bold text-heading">Financial Overview</h1>
          <p className="text-sm text-muted" style={{ marginTop: '4px' }}>Welcome back, Alex. Here is a summary of your business performance.</p>
        </div>
        <div className="flex-row gap-2">
          <button className="btn btn-secondary" onClick={() => window.print()}>
            <FileDown size={16} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="flex-row flex-wrap gap-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '32px' }}>
        
        {/* Revenue Card */}
        <div className="card">
          <div className="flex-row justify-between align-center text-muted" style={{ marginBottom: '12px' }}>
            <span className="text-xs font-semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue</span>
            <DollarSign size={18} className="text-muted" />
          </div>
          <div className="flex-column">
            <span className="text-2xl font-bold text-heading">${totalRevenue.toLocaleString()}</span>
            <div className="flex-row align-center gap-1" style={{ marginTop: '8px' }}>
              <span className="badge badge-success flex-row align-center gap-1" style={{ padding: '2px 6px' }}>
                <ArrowUpRight size={12} />
                12.4%
              </span>
              <span className="text-xs text-muted">vs last month</span>
            </div>
          </div>
        </div>

        {/* Sales Card */}
        <div className="card">
          <div className="flex-row justify-between align-center text-muted" style={{ marginBottom: '12px' }}>
            <span className="text-xs font-semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sales</span>
            <TrendingUp size={18} className="text-muted" />
          </div>
          <div className="flex-column">
            <span className="text-2xl font-bold text-heading">${totalSales.toLocaleString()}</span>
            <div className="flex-row align-center gap-1" style={{ marginTop: '8px' }}>
              <span className="badge badge-info flex-row align-center gap-1" style={{ padding: '2px 6px' }}>
                <ArrowUpRight size={12} />
                9.6%
              </span>
              <span className="text-xs text-muted">total invoiced value</span>
            </div>
          </div>
        </div>

        {/* Purchases Card */}
        <div className="card">
          <div className="flex-row justify-between align-center text-muted" style={{ marginBottom: '12px' }}>
            <span className="text-xs font-semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Purchases</span>
            <ShoppingBag size={18} className="text-muted" />
          </div>
          <div className="flex-column">
            <span className="text-2xl font-bold text-heading">${totalPurchases.toLocaleString()}</span>
            <div className="flex-row align-center gap-1" style={{ marginTop: '8px' }}>
              <span className="badge badge-success flex-row align-center gap-1" style={{ padding: '2px 6px', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success-text)' }}>
                <ArrowDownRight size={12} />
                -3.1%
              </span>
              <span className="text-xs text-muted">vs last month</span>
            </div>
          </div>
        </div>

        {/* Outstanding Card */}
        <div className="card">
          <div className="flex-row justify-between align-center text-muted" style={{ marginBottom: '12px' }}>
            <span className="text-xs font-semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Outstanding</span>
            <FileText size={18} className="text-muted" />
          </div>
          <div className="flex-column">
            <span className="text-2xl font-bold text-heading">${totalSalesOutstanding.toLocaleString()}</span>
            <div className="flex-row align-center gap-1" style={{ marginTop: '8px' }}>
              <span className="badge badge-warning flex-row align-center gap-1" style={{ padding: '2px 6px' }}>
                <ArrowUpRight size={12} />
                8.2%
              </span>
              <span className="text-xs text-muted">pending collection</span>
            </div>
          </div>
        </div>

        {/* Inventory Card */}
        <div className="card">
          <div className="flex-row justify-between align-center text-muted" style={{ marginBottom: '12px' }}>
            <span className="text-xs font-semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inventory Value</span>
            <AlertTriangle size={18} className={lowStockItems.length > 0 ? 'text-warning' : 'text-muted'} />
          </div>
          <div className="flex-column">
            <span className="text-2xl font-bold text-heading">${totalInventoryValue.toLocaleString()}</span>
            <div className="flex-row align-center gap-1" style={{ marginTop: '8px' }}>
              <span className={`badge ${lowStockItems.length > 0 ? 'badge-warning' : 'badge-success'} text-xs`} style={{ padding: '2px 6px' }}>
                {lowStockItems.length} Warnings
              </span>
              <span className="text-xs text-muted">{totalStockItems} units in stock</span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Panel: Charts & Sidebar Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Chart & Quick Actions */}
        <div className="flex-column gap-3">
          
          {/* Custom SVG Line Chart */}
          <div className="card flex-column" style={{ position: 'relative' }}>
            <div className="flex-row justify-between align-center" style={{ marginBottom: '24px' }}>
              <div>
                <h3 className="text-base font-semibold text-heading">Cash Flow Trends</h3>
                <p className="text-xs text-muted">Monthly Revenue versus Purchase Bills</p>
              </div>
              <div className="flex-row gap-2 text-xs">
                <span className="flex-row align-center gap-1">
                  <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />
                  Revenue
                </span>
                <span className="flex-row align-center gap-1">
                  <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', border: '2px dashed var(--text-muted)' }} />
                  Purchases
                </span>
              </div>
            </div>

            {/* SVG Plot */}
            <div style={{ position: 'relative', width: '100%', height: `${chartHeight}px` }}>
              <svg 
                viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                style={{ width: '100%', height: '100%', overflow: 'visible' }}
              >
                <defs>
                  <linearGradient id="revenue-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                {/* Horizontal grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                  const y = paddingY + ratio * (chartHeight - 2 * paddingY);
                  const value = Math.round(maxVal * (1 - ratio));
                  return (
                    <g key={idx}>
                      <line 
                        x1={paddingX} 
                        y1={y} 
                        x2={chartWidth - paddingX} 
                        y2={y} 
                        stroke="var(--border-color)" 
                        strokeWidth="1" 
                        strokeDasharray="4 4" 
                      />
                      <text 
                        x={paddingX - 8} 
                        y={y + 4} 
                        fontSize="9" 
                        fill="var(--text-muted)" 
                        textAnchor="end"
                      >
                        ${Math.round(value/1000)}k
                      </text>
                    </g>
                  );
                })}

                {/* Vertical grid lines & Month labels */}
                {chartData.map((d, idx) => {
                  const x = paddingX + (idx * (chartWidth - 2 * paddingX)) / (chartData.length - 1);
                  return (
                    <g key={idx}>
                      <line 
                        x1={x} 
                        y1={paddingY} 
                        x2={x} 
                        y2={chartHeight - paddingY} 
                        stroke="var(--border-color)" 
                        strokeWidth="0.5" 
                      />
                      <text 
                        x={x} 
                        y={chartHeight - 4} 
                        fontSize="10" 
                        fill="var(--text-muted)" 
                        textAnchor="middle"
                        fontWeight="500"
                      >
                        {d.name}
                      </text>
                    </g>
                  );
                })}

                {/* Gradient area underneath Revenue */}
                {revenueAreaPath && (
                  <path d={revenueAreaPath} fill="url(#revenue-gradient)" />
                )}

                {/* Line Paths */}
                {revenuePath && (
                  <path 
                    d={revenuePath} 
                    fill="none" 
                    stroke="var(--color-primary)" 
                    strokeWidth="2.5" 
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {purchasePath && (
                  <path 
                    d={purchasePath} 
                    fill="none" 
                    stroke="var(--text-muted)" 
                    strokeWidth="1.5" 
                    strokeDasharray="4 4" 
                    strokeLinecap="round"
                  />
                )}

                {/* Interactive Dot Hover Triggers */}
                {chartData.map((d, idx) => {
                  const revCoord = getCoordinates(idx, d.revenue);
                  return (
                    <g key={idx}>
                      {/* Active Circle Point */}
                      <circle 
                        cx={revCoord.x} 
                        cy={revCoord.y} 
                        r="4" 
                        fill="var(--bg-card)" 
                        stroke="var(--color-primary)" 
                        strokeWidth="2" 
                      />
                      {/* Overlay fat circle for hover target area */}
                      <circle 
                        cx={revCoord.x} 
                        cy={revCoord.y} 
                        r="16" 
                        fill="transparent" 
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHoveredPoint({
                          index: idx,
                          x: revCoord.x,
                          y: revCoord.y,
                          revenue: d.revenue,
                          purchases: d.purchases,
                          name: d.name
                        })}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Chart Tooltip */}
              {hoveredPoint && (
                <div 
                  className="chart-tooltip" 
                  style={{
                    position: 'absolute',
                    left: `${(hoveredPoint.x / chartWidth) * 100}%`,
                    top: `${(hoveredPoint.y / chartHeight) * 100 - 45}%`,
                    transform: 'translateX(-50%)',
                    zIndex: 10
                  }}
                >
                  <p className="font-semibold text-xs" style={{ color: 'var(--text-heading)', marginBottom: '4px' }}>{hoveredPoint.name}</p>
                  <p className="text-xs" style={{ color: 'var(--color-primary)' }}>Rev: <strong>${hoveredPoint.revenue.toLocaleString()}</strong></p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Bill: <strong>${hoveredPoint.purchases.toLocaleString()}</strong></p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '16px' }}>Quick Record Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              
              <button className="btn btn-secondary flex-row justify-between align-center" style={{ height: '52px', padding: '16px' }} onClick={openInvoiceModal}>
                <span className="flex-row align-center gap-1 font-medium">
                  <PlusCircle size={16} className="text-primary" />
                  New Invoice
                </span>
                <ArrowRight size={14} className="text-muted" />
              </button>

              <button className="btn btn-secondary flex-row justify-between align-center" style={{ height: '52px', padding: '16px' }} onClick={openExpenseModal}>
                <span className="flex-row align-center gap-1 font-medium">
                  <PlusCircle size={16} className="text-warning" />
                  Record Expense
                </span>
                <ArrowRight size={14} className="text-muted" />
              </button>

              <button className="btn btn-secondary flex-row justify-between align-center" style={{ height: '52px', padding: '16px' }} onClick={openInventoryModal}>
                <span className="flex-row align-center gap-1 font-medium">
                  <PlusCircle size={16} className="text-success" />
                  Add Stock Item
                </span>
                <ArrowRight size={14} className="text-muted" />
              </button>

            </div>
          </div>

        </div>

        {/* Right Column: Alerts & Recent Activity */}
        <div className="flex-column gap-3">
          
          {/* Critical Stock Alerts */}
          <div className="card">
            <div className="flex-row justify-between align-center" style={{ marginBottom: '16px' }}>
              <h3 className="card-title" style={{ marginBottom: 0 }}>Stock Reorder Alerts</h3>
              <span className="badge badge-warning" style={{ fontSize: '11px' }}>{lowStockItems.length} items</span>
            </div>
            <div className="flex-column gap-1">
              {lowStockItems.length === 0 ? (
                <p className="text-xs text-muted">All catalog stock quantities are stable.</p>
              ) : (
                lowStockItems.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex-row justify-between align-center" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <div className="flex-column">
                      <span className="font-semibold text-xs text-heading">{item.name}</span>
                      <span className="text-xs text-muted">SKU: {item.sku}</span>
                    </div>
                    <div className="flex-row align-center gap-1">
                      <span className="text-xs font-semibold text-danger">{item.stockLevel} units left</span>
                      <span className="text-xs text-muted">({item.reorderPoint} min)</span>
                    </div>
                  </div>
                ))
              )}
              {lowStockItems.length > 4 && (
                <button 
                  className="btn btn-ghost text-xs" 
                  style={{ justifyContent: 'flex-start', paddingLeft: 0, marginTop: '8px' }}
                  onClick={() => onNavigate('inventory')}
                >
                  View all inventory warnings &rarr;
                </button>
              )}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '16px' }}>Recent Transactions</h3>
            <div className="flex-column gap-2">
              {combinedTransactions.length === 0 ? (
                <p className="text-xs text-muted">No transactions recorded yet.</p>
              ) : (
                combinedTransactions.map((tx) => (
                  <div key={tx.id} className="flex-column" style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                    <div className="flex-row justify-between align-center">
                      <span className="font-semibold text-xs text-heading">{tx.description}</span>
                      <span className="text-xs font-bold text-heading">
                        {tx.type === 'Sale' ? '+' : '-'}${tx.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex-row justify-between align-center" style={{ marginTop: '4px' }}>
                      <span className="text-xs text-muted">{tx.date}</span>
                      <span className={`badge ${tx.badgeClass} text-xs`} style={{ padding: '2px 6px', scale: '0.9', transformOrigin: 'right' }}>
                        {tx.status || tx.type}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
