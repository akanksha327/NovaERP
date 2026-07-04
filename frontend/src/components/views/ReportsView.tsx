import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Briefcase, 
  Scale, 
  Printer, 
  TrendingDown
} from 'lucide-react';

interface Invoice {
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
}

interface Expense {
  amount: number;
}

interface InventoryItem {
  stockLevel: number;
  unitPrice: number;
}

interface ReportsViewProps {
  invoices: Invoice[];
  expenses: Expense[];
  inventory: InventoryItem[];
  companyName: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  invoices,
  expenses,
  inventory,
  companyName
}) => {
  const [activeReportTab, setActiveReportTab] = useState<'pl' | 'bs' | 'tb'>('pl');

  // Profit and Loss calculations
  const plMetrics = useMemo(() => {
    const grossSales = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const cogs = grossSales * 0.40; // Simulated Cost of Goods Sold at 40%
    const grossProfit = grossSales - cogs;
    
    const operatingExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netIncome = grossProfit - operatingExpenses;

    return {
      grossSales,
      cogs,
      grossProfit,
      operatingExpenses,
      netIncome
    };
  }, [invoices, expenses]);

  // Balance Sheet calculations
  const bsMetrics = useMemo(() => {
    const accountsReceivable = invoices
      .filter(inv => inv.status === 'Pending' || inv.status === 'Overdue')
      .reduce((sum, inv) => sum + inv.amount, 0);
      
    const inventoryAsset = inventory
      .reduce((sum, item) => sum + (item.stockLevel * item.unitPrice), 0);

    const cashInBank = 45000 + plMetrics.grossSales - expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalAssets = cashInBank + accountsReceivable + inventoryAsset;

    const accountsPayable = 8500; // Simulated accounts payable
    const capitalStock = 35000;
    const retainedEarnings = totalAssets - accountsPayable - capitalStock;
    const totalLiabilitiesEquity = accountsPayable + capitalStock + retainedEarnings;

    return {
      cashInBank,
      accountsReceivable,
      inventoryAsset,
      totalAssets,
      accountsPayable,
      capitalStock,
      retainedEarnings,
      totalLiabilitiesEquity
    };
  }, [invoices, expenses, inventory, plMetrics]);

  return (
    <div className="page-container">
      {/* View Header */}
      <div className="flex-row justify-between align-center" style={{ marginBottom: '28px' }}>
        <div>
          <h1 className="text-2xl font-bold text-heading">Financial Reports</h1>
          <p className="text-sm text-muted" style={{ marginTop: '4px' }}>Analyze corporate statements, review cash flows, and generate fiscal audits.</p>
        </div>
        <div className="flex-row gap-2">
          <button className="btn btn-secondary" onClick={() => window.print()}>
            <Printer size={15} />
            <span>Print Statement</span>
          </button>
        </div>
      </div>

      {/* Reports Navigation Tabs */}
      <div className="flex-row gap-2" style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '24px', paddingBottom: '12px' }}>
        <button 
          className={`btn ${activeReportTab === 'pl' ? 'btn-primary' : 'btn-ghost'}`} 
          style={{ height: '36px' }}
          onClick={() => setActiveReportTab('pl')}
        >
          <TrendingUp size={16} />
          <span>Profit & Loss</span>
        </button>
        <button 
          className={`btn ${activeReportTab === 'bs' ? 'btn-primary' : 'btn-ghost'}`} 
          style={{ height: '36px' }}
          onClick={() => setActiveReportTab('bs')}
        >
          <Briefcase size={16} />
          <span>Balance Sheet</span>
        </button>
        <button 
          className={`btn ${activeReportTab === 'tb' ? 'btn-primary' : 'btn-ghost'}`} 
          style={{ height: '36px' }}
          onClick={() => setActiveReportTab('tb')}
        >
          <Scale size={16} />
          <span>Trial Balance</span>
        </button>
      </div>

      {/* Report Container */}
      <div className="card" style={{ padding: '36px' }}>
        
        {/* Report Company Header */}
        <div className="flex-column align-center" style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '24px', marginBottom: '24px', textAlign: 'center' }}>
          <h2 className="text-xl font-bold text-heading" style={{ letterSpacing: '0.02em' }}>{companyName}</h2>
          <span className="text-xs font-semibold text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '6px' }}>
            {activeReportTab === 'pl' && 'Profit & Loss Statement (Fiscal Year to Date)'}
            {activeReportTab === 'bs' && 'Balance Sheet (As of July 2026)'}
            {activeReportTab === 'tb' && 'Trial Balance (Ledger Account Balances)'}
          </span>
          <span className="text-xs text-muted" style={{ marginTop: '4px' }}>Currency: USD ($) | Audited Locally</span>
        </div>

        {/* 1. PROFIT & LOSS VIEW */}
        {activeReportTab === 'pl' && (
          <div className="flex-column" style={{ gap: '16px' }}>
            
            {/* Sales Section */}
            <div className="flex-column">
              <div className="flex-row justify-between align-center" style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                <span className="font-semibold text-heading">Sales Revenue (Gross)</span>
                <span className="font-semibold text-heading">${plMetrics.grossSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex-row justify-between align-center" style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', fontSize: '13px' }}>
                <span className="text-muted">Less: Cost of Goods Sold (COGS - 40%)</span>
                <span className="text-muted">-${plMetrics.cogs.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex-row justify-between align-center" style={{ padding: '10px 0', borderBottom: '1.5px solid var(--border-color)', marginTop: '4px' }}>
                <span className="font-bold text-heading" style={{ fontSize: '15px' }}>GROSS PROFIT</span>
                <span className="font-bold text-heading" style={{ fontSize: '15px' }}>${plMetrics.grossProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Operating Expenses Section */}
            <div className="flex-column" style={{ marginTop: '12px' }}>
              <h4 className="text-xs font-bold text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Operating Expenses</h4>
              <div className="flex-row justify-between align-center" style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', fontSize: '13px' }}>
                <span className="text-muted">Vendor Billing & Utilities</span>
                <span className="text-muted">-${plMetrics.operatingExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex-row justify-between align-center" style={{ padding: '10px 0', borderBottom: '1.5px solid var(--border-color)', marginTop: '4px' }}>
                <span className="font-bold text-heading" style={{ fontSize: '15px' }}>TOTAL OPERATING EXPENSES</span>
                <span className="font-bold text-heading" style={{ fontSize: '15px' }}>-${plMetrics.operatingExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Net Profit Summary */}
            <div className="flex-row justify-between align-center" style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px 20px', borderRadius: '8px', marginTop: '16px' }}>
              <span className="font-bold text-heading" style={{ fontSize: '16px' }}>NET OPERATING INCOME / PROFIT</span>
              <span className={`font-bold text-base flex-row align-center gap-1 ${plMetrics.netIncome >= 0 ? 'text-success' : 'text-danger'}`} style={{ fontSize: '20px' }}>
                {plMetrics.netIncome >= 0 ? <TrendingUp size={22} className="text-success" /> : <TrendingDown size={22} className="text-danger" />}
                ${plMetrics.netIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

          </div>
        )}

        {/* 2. BALANCE SHEET VIEW */}
        {activeReportTab === 'bs' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
            
            {/* Left Column: Assets */}
            <div className="flex-column">
              <h3 className="font-bold text-heading" style={{ borderBottom: '2px solid var(--text-heading)', paddingBottom: '8px', fontSize: '15px' }}>ASSETS</h3>
              
              <div className="flex-row justify-between align-center" style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)', fontSize: '14px' }}>
                <span className="text-body font-medium">Cash & Equivalents</span>
                <span className="font-semibold text-heading">${bsMetrics.cashInBank.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex-row justify-between align-center" style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)', fontSize: '14px' }}>
                <span className="text-body font-medium">Accounts Receivable</span>
                <span className="font-semibold text-heading">${bsMetrics.accountsReceivable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex-row justify-between align-center" style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)', fontSize: '14px' }}>
                <span className="text-body font-medium">Inventory Valuation</span>
                <span className="font-semibold text-heading">${bsMetrics.inventoryAsset.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex-row justify-between align-center" style={{ padding: '12px 0', borderBottom: '2px solid var(--text-heading)', marginTop: '8px' }}>
                <span className="font-bold text-heading">TOTAL ASSETS</span>
                <span className="font-bold text-heading">${bsMetrics.totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Right Column: Liabilities & Equity */}
            <div className="flex-column">
              <h3 className="font-bold text-heading" style={{ borderBottom: '2px solid var(--text-heading)', paddingBottom: '8px', fontSize: '15px' }}>LIABILITIES & EQUITY</h3>
              
              <div className="flex-row justify-between align-center" style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)', fontSize: '14px' }}>
                <span className="text-body font-medium">Accounts Payable</span>
                <span className="font-semibold text-heading">${bsMetrics.accountsPayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex-row justify-between align-center" style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)', fontSize: '14px' }}>
                <span className="text-body font-medium">Capital Stock (Equity)</span>
                <span className="font-semibold text-heading">${bsMetrics.capitalStock.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex-row justify-between align-center" style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)', fontSize: '14px' }}>
                <span className="text-body font-medium">Retained Earnings (YTD)</span>
                <span className="font-semibold text-heading">${bsMetrics.retainedEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex-row justify-between align-center" style={{ padding: '12px 0', borderBottom: '2px solid var(--text-heading)', marginTop: '8px' }}>
                <span className="font-bold text-heading">TOTAL LIABILITIES & EQUITY</span>
                <span className="font-bold text-heading">${bsMetrics.totalLiabilitiesEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

          </div>
        )}

        {/* 3. TRIAL BALANCE VIEW */}
        {activeReportTab === 'tb' && (
          <div className="flex-column">
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ background: 'transparent', borderBottom: '2px solid var(--text-heading)' }}>Account Ledger Name</th>
                  <th style={{ background: 'transparent', borderBottom: '2px solid var(--text-heading)', textAlign: 'right', width: '180px' }}>Debit Balance ($)</th>
                  <th style={{ background: 'transparent', borderBottom: '2px solid var(--text-heading)', textAlign: 'right', width: '180px' }}>Credit Balance ($)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-medium text-heading">Cash Account</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>${bsMetrics.cashInBank.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td style={{ textAlign: 'right', color: 'var(--text-disabled)' }}>-</td>
                </tr>
                <tr>
                  <td className="font-medium text-heading">Accounts Receivable Control</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>${bsMetrics.accountsReceivable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td style={{ textAlign: 'right', color: 'var(--text-disabled)' }}>-</td>
                </tr>
                <tr>
                  <td className="font-medium text-heading">Inventory Asset Control</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>${bsMetrics.inventoryAsset.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td style={{ textAlign: 'right', color: 'var(--text-disabled)' }}>-</td>
                </tr>
                <tr>
                  <td className="font-medium text-heading">Accounts Payable Control</td>
                  <td style={{ textAlign: 'right', color: 'var(--text-disabled)' }}>-</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>${bsMetrics.accountsPayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td className="font-medium text-heading">Initial Capital Investments</td>
                  <td style={{ textAlign: 'right', color: 'var(--text-disabled)' }}>-</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>${bsMetrics.capitalStock.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td className="font-medium text-heading">Sales Revenue Accounts</td>
                  <td style={{ textAlign: 'right', color: 'var(--text-disabled)' }}>-</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>${plMetrics.grossSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td className="font-medium text-heading">Cost of Goods Sold (COGS)</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>${plMetrics.cogs.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td style={{ textAlign: 'right', color: 'var(--text-disabled)' }}>-</td>
                </tr>
                <tr>
                  <td className="font-medium text-heading">Operating & Vendor Expenses</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>${plMetrics.operatingExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td style={{ textAlign: 'right', color: 'var(--text-disabled)' }}>-</td>
                </tr>
                
                {/* Total Row */}
                <tr style={{ borderTop: '2px solid var(--text-heading)', borderBottom: '2px double var(--text-heading)' }}>
                  <td className="font-bold text-heading" style={{ textTransform: 'uppercase' }}>Total Trial Sum</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '15px' }}>
                    ${(bsMetrics.cashInBank + bsMetrics.accountsReceivable + bsMetrics.inventoryAsset + plMetrics.cogs + plMetrics.operatingExpenses).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '15px' }}>
                    ${(bsMetrics.accountsPayable + bsMetrics.capitalStock + plMetrics.grossSales).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};
