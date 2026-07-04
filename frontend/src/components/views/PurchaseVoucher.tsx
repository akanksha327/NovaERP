import React, { useState, useMemo, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  PieChart, 
  ArrowUpDown, 
  ChevronUp, 
  ChevronDown,
  Keyboard
} from 'lucide-react';
import { Modal } from '../ui/Modal';

interface Expense {
  id: string;
  supplier: string;
  category: 'Software' | 'Office' | 'Marketing' | 'Travel' | 'Operations';
  amount: number;
  date: string;
  description: string;
}

interface Supplier {
  id: string;
  name: string;
}

interface PurchaseVoucherProps {
  expenses: Expense[];
  suppliers: Supplier[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onDeleteExpenses: (ids: string[]) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
}

export const PurchaseVoucher: React.FC<PurchaseVoucherProps> = ({
  expenses,
  suppliers,
  onAddExpense,
  onDeleteExpenses,
  isCreateModalOpen,
  setIsCreateModalOpen
}) => {
  // Filters & Search
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  
  // Sorting state
  const [sortField, setSortField] = useState<keyof Expense>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Create Form State
  const [formSupplier, setFormSupplier] = useState('');
  const [formCategory, setFormCategory] = useState<'Software' | 'Office' | 'Marketing' | 'Travel' | 'Operations'>('Software');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDesc, setFormDesc] = useState('');
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Keyboard navigation focus elements
  const supplierRef = useRef<HTMLSelectElement | null>(null);
  const categoryRef = useRef<HTMLSelectElement | null>(null);
  const amountRef = useRef<HTMLInputElement | null>(null);
  const dateRef = useRef<HTMLInputElement | null>(null);
  const descRef = useRef<HTMLTextAreaElement | null>(null);

  // Handle keydown for Enter to jump focus (Tally workflow)
  const handleKeyDown = (e: React.KeyboardEvent, nextRef: React.RefObject<any> | null, submit: boolean = false) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (submit) {
        handleSubmitExpense(e);
      } else if (nextRef && nextRef.current) {
        nextRef.current.focus();
      }
    }
  };

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Category Breakdown
    const breakdown: Record<string, number> = {
      Software: 0,
      Office: 0,
      Marketing: 0,
      Travel: 0,
      Operations: 0
    };
    expenses.forEach(exp => {
      if (breakdown[exp.category] !== undefined) {
        breakdown[exp.category] += exp.amount;
      }
    });

    return { total, breakdown };
  }, [expenses]);

  // Search & Filter & Sort
  const filteredSortedExpenses = useMemo(() => {
    let result = [...expenses];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        exp => exp.supplier.toLowerCase().includes(q) || 
               exp.description.toLowerCase().includes(q) ||
               exp.id.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== 'All') {
      result = result.filter(exp => exp.category === categoryFilter);
    }

    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'amount') {
        return sortDirection === 'asc' 
          ? (aVal as number) - (bVal as number) 
          : (bVal as number) - (aVal as number);
      }

      aVal = String(aVal).toLowerCase();
      bVal = String(bVal).toLowerCase();
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [expenses, search, categoryFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredSortedExpenses.length / itemsPerPage));
  const paginatedExpenses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSortedExpenses.slice(start, start + itemsPerPage);
  }, [filteredSortedExpenses, currentPage]);

  const handleSort = (field: keyof Expense) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedExpenses.map(exp => exp.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formSupplier.trim()) {
      newErrors.supplier = 'Please select a supplier';
    }

    const amt = parseFloat(formAmount);
    if (isNaN(amt) || amt <= 0) {
      newErrors.amount = 'Please enter a valid positive amount';
    }

    if (!formDate) {
      newErrors.date = 'Voucher date is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onAddExpense({
      supplier: formSupplier,
      category: formCategory,
      amount: amt,
      date: formDate,
      description: formDesc
    });

    setFormSupplier('');
    setFormAmount('');
    setFormDesc('');
    setFormCategory('Software');
    setErrors({});
    setIsCreateModalOpen(false);
  };

  const isAllSelected = paginatedExpenses.length > 0 && selectedIds.length === paginatedExpenses.length;

  return (
    <div className="page-container">
      {/* View Header */}
      <div className="flex-row justify-between align-center" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="text-2xl font-bold text-heading">Purchase Vouchers</h1>
          <p className="text-sm text-muted" style={{ marginTop: '4px' }}>Record procurement spending, audit vendor credits, and monitor liabilities.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={16} />
          <span>New Purchase Voucher (F9)</span>
        </button>
      </div>

      {/* Top Metrics Cards - Category Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px', marginBottom: '24px', alignItems: 'stretch' }}>
        {/* Total Cost card */}
        <div className="card flex-column justify-between" style={{ padding: '24px' }}>
          <div>
            <span className="text-xs font-semibold text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Purchase Valuation</span>
            <h2 className="text-2xl font-bold text-heading" style={{ marginTop: '8px', fontSize: '32px' }}>
              ${summaryMetrics.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
          </div>
          <div className="flex-row align-center gap-1 text-muted text-xs" style={{ marginTop: '16px' }}>
            <PieChart size={14} />
            <span>Audited across {expenses.length} purchase vouchers</span>
          </div>
        </div>

        {/* Categories Progress list */}
        <div className="card flex-column" style={{ padding: '20px 24px' }}>
          <h3 className="text-xs font-semibold text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>Category Allocations</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
            {Object.entries(summaryMetrics.breakdown).map(([category, value]) => {
              const percentage = summaryMetrics.total > 0 ? (value / summaryMetrics.total) * 100 : 0;
              return (
                <div key={category} className="flex-column" style={{ gap: '4px' }}>
                  <div className="flex-row justify-between text-xs font-medium">
                    <span className="text-heading">{category}</span>
                    <span className="text-muted">${value.toLocaleString()} ({Math.round(percentage)}%)</span>
                  </div>
                  <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percentage}%`, backgroundColor: 'var(--color-primary)', borderRadius: '3px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid Controls */}
      <div className="card flex-column gap-2" style={{ marginBottom: '20px', padding: '16px' }}>
        <div className="flex-row justify-between align-center flex-wrap gap-2">
          
          <div className="flex-row gap-2 align-center">
            <span className="text-xs text-muted font-medium">Category Ledger:</span>
            <select
              className="form-select"
              style={{ width: '140px', height: '36px', padding: '0 8px', fontSize: '13px' }}
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Categories</option>
              <option value="Software">Software</option>
              <option value="Office">Office</option>
              <option value="Marketing">Marketing</option>
              <option value="Travel">Travel</option>
              <option value="Operations">Operations</option>
            </select>
          </div>

          <div className="flex-row gap-2 flex-1 justify-between align-center" style={{ minWidth: '280px' }}>
            <div className="search-container" style={{ width: '100%', maxWidth: '280px' }}>
              <Search size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Search supplier or description..."
                className="search-input"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Selection actions */}
            {selectedIds.length > 0 && (
              <div className="flex-row gap-2 align-center">
                <span className="text-xs text-muted font-medium">{selectedIds.length} selected</span>
                <button 
                  className="btn btn-secondary text-danger" 
                  style={{ height: '36px', padding: '0 12px', fontSize: '13px' }}
                  onClick={() => {
                    onDeleteExpenses(selectedIds);
                    setSelectedIds([]);
                  }}
                >
                  <Trash2 size={14} />
                  <span>Delete Vouchers</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Expenses Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    className="checkbox-input"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                  <span className="checkbox-checkmark" />
                </label>
              </th>
              <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                <div className="table-header-cell-inner">
                  <span>Voucher No.</span>
                  {sortField === 'id' ? (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={12} className="text-disabled" />}
                </div>
              </th>
              <th onClick={() => handleSort('supplier')} style={{ cursor: 'pointer' }}>
                <div className="table-header-cell-inner">
                  <span>Credit Party Account</span>
                  {sortField === 'supplier' ? (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={12} className="text-disabled" />}
                </div>
              </th>
              <th>Category</th>
              <th onClick={() => handleSort('date')} style={{ cursor: 'pointer' }}>
                <div className="table-header-cell-inner">
                  <span>Voucher Date</span>
                  {sortField === 'date' ? (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={12} className="text-disabled" />}
                </div>
              </th>
              <th style={{ maxWidth: '240px' }}>Memo / Description</th>
              <th onClick={() => handleSort('amount')} style={{ cursor: 'pointer', textAlign: 'right' }}>
                <div className="table-header-cell-inner" style={{ justifyContent: 'flex-end' }}>
                  <span>Amount ($)</span>
                  {sortField === 'amount' ? (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={12} className="text-disabled" />}
                </div>
              </th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedExpenses.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No Purchase Vouchers registered.
                </td>
              </tr>
            ) : (
              paginatedExpenses.map((exp) => {
                const isSelected = selectedIds.includes(exp.id);
                return (
                  <tr key={exp.id} style={{ backgroundColor: isSelected ? 'var(--bg-hover)' : 'transparent' }}>
                    <td>
                      <label className="checkbox-container">
                        <input
                          type="checkbox"
                          className="checkbox-input"
                          checked={isSelected}
                          onChange={() => handleSelectRow(exp.id)}
                        />
                        <span className="checkbox-checkmark" />
                      </label>
                    </td>
                    <td className="font-semibold text-heading">{exp.id}</td>
                    <td className="font-semibold text-heading">{exp.supplier}</td>
                    <td>
                      <span className="badge badge-info" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-heading)' }}>
                        {exp.category}
                      </span>
                    </td>
                    <td>{exp.date}</td>
                    <td style={{ maxWidth: '240px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={exp.description}>
                      {exp.description || <em className="text-muted">No description</em>}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-danger-text)' }}>
                      -${exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-ghost text-xs text-danger" 
                        style={{ padding: '4px 8px', height: 'auto' }}
                        onClick={() => onDeleteExpenses([exp.id])}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex-row justify-between align-center" style={{ marginTop: '20px' }}>
          <span className="text-xs text-muted">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredSortedExpenses.length)} of {filteredSortedExpenses.length} vouchers
          </span>
          <div className="flex-row gap-1">
            <button 
              className="btn btn-secondary" 
              style={{ height: '32px', padding: '0 12px', fontSize: '12px' }}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className="btn"
                style={{ 
                  height: '32px', 
                  width: '32px', 
                  padding: 0,
                  fontSize: '12px',
                  backgroundColor: currentPage === i + 1 ? 'var(--color-primary)' : 'var(--bg-card)',
                  color: currentPage === i + 1 ? '#FFFFFF' : 'var(--text-body)',
                  borderColor: currentPage === i + 1 ? 'var(--color-primary)' : 'var(--border-color)',
                }}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button 
              className="btn btn-secondary" 
              style={{ height: '32px', padding: '0 12px', fontSize: '12px' }}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Tally Redesigned Purchase Voucher Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setErrors({});
        }}
        title="Purchase Voucher Entry Screen"
        footer={
          <div className="flex-row justify-between align-center" style={{ width: '100%' }}>
            <span className="text-xs text-muted flex-row align-center gap-1">
              <Keyboard size={14} />
              Use [Enter] for fast field jump
            </span>
            <div className="flex-row gap-2">
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setErrors({});
                }}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSubmitExpense}>
                Post Voucher (Enter)
              </button>
            </div>
          </div>
        }
      >
        <form onSubmit={handleSubmitExpense} className="flex-column">
          
          <div className="flex-row align-center gap-1" style={{ backgroundColor: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: '8px', marginBottom: '20px' }}>
            <Keyboard size={15} className="text-primary" />
            <span className="text-xs font-semibold text-heading" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Voucher Type: Purchase / Bill Posting
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Credit Account (Supplier)</label>
            <select 
              className={`form-select ${errors.supplier ? 'is-invalid' : ''}`}
              ref={supplierRef}
              autoFocus
              value={formSupplier}
              onChange={(e) => setFormSupplier(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, categoryRef)}
            >
              <option value="">-- Choose Party Ledger Account --</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.name}>{s.name} ({s.id})</option>
              ))}
              {suppliers.length === 0 && (
                <option value="Amazon Web Services">Amazon Web Services</option>
              )}
            </select>
            {errors.supplier && <span className="form-feedback">{errors.supplier}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Debit Ledger (Category)</label>
              <select 
                className="form-select"
                ref={categoryRef}
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as any)}
                onKeyDown={(e) => handleKeyDown(e, amountRef)}
              >
                <option value="Software">Software</option>
                <option value="Office">Office Equipment</option>
                <option value="Marketing">Marketing & Ads</option>
                <option value="Travel">Corporate Travel</option>
                <option value="Operations">Operations / Utility</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Voucher Amount ($)</label>
              <input 
                type="number" 
                step="0.01"
                ref={amountRef}
                className={`form-input ${errors.amount ? 'is-invalid' : ''}`}
                placeholder="0.00" 
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, dateRef)}
              />
              {errors.amount && <span className="form-feedback">{errors.amount}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Voucher Date</label>
            <input 
              type="date" 
              ref={dateRef}
              className={`form-input ${errors.date ? 'is-invalid' : ''}`}
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, descRef)}
            />
            {errors.date && <span className="form-feedback">{errors.date}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Narration / Memo</label>
            <textarea
              className="form-textarea"
              ref={descRef}
              placeholder="Record transaction details..."
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitExpense(e);
                }
              }}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
