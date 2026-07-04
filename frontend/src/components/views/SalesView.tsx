import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  CheckCircle, 
  ChevronUp, 
  ChevronDown,
  ArrowUpDown
} from 'lucide-react';
import { Modal } from '../ui/Modal';

interface Invoice {
  id: string;
  customer: string;
  amount: number;
  date: string;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
}

interface SalesViewProps {
  invoices: Invoice[];
  onAddInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  onDeleteInvoices: (ids: string[]) => void;
  onMarkAsPaid: (ids: string[]) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
}

export const SalesView: React.FC<SalesViewProps> = ({
  invoices,
  onAddInvoice,
  onDeleteInvoices,
  onMarkAsPaid,
  isCreateModalOpen,
  setIsCreateModalOpen
}) => {
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Pending' | 'Overdue'>('All');
  
  // Sorting state
  const [sortField, setSortField] = useState<keyof Invoice>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Create Form State
  const [formCustomer, setFormCustomer] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDueDate, setFormDueDate] = useState('');
  const [formStatus, setFormStatus] = useState<'Paid' | 'Pending'>('Pending');
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter & Search & Sort logic
  const filteredSortedInvoices = useMemo(() => {
    let result = [...invoices];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        inv => inv.customer.toLowerCase().includes(q) || inv.id.toLowerCase().includes(q)
      );
    }

    // Status Filter
    if (statusFilter !== 'All') {
      result = result.filter(inv => inv.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'amount') {
        return sortDirection === 'asc' 
          ? (aVal as number) - (bVal as number) 
          : (bVal as number) - (aVal as number);
      }

      // Date or String comparison
      aVal = String(aVal).toLowerCase();
      bVal = String(bVal).toLowerCase();
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [invoices, search, statusFilter, sortField, sortDirection]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredSortedInvoices.length / itemsPerPage));
  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSortedInvoices.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSortedInvoices, currentPage]);

  const handleSort = (field: keyof Invoice) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Selection helpers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedInvoices.map(inv => inv.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Form submit handler with inline validation
  const handleSubmitInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formCustomer.trim()) {
      newErrors.customer = 'Customer name is required';
    }
    
    const amountVal = parseFloat(formAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than $0';
    }

    if (!formDate) {
      newErrors.date = 'Issue date is required';
    }

    if (!formDueDate) {
      newErrors.dueDate = 'Due date is required';
    } else if (new Date(formDueDate) < new Date(formDate)) {
      newErrors.dueDate = 'Due date cannot be prior to issue date';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onAddInvoice({
      customer: formCustomer,
      amount: amountVal,
      date: formDate,
      dueDate: formDueDate,
      status: formStatus as 'Paid' | 'Pending'
    });

    // Reset Form
    setFormCustomer('');
    setFormAmount('');
    setFormDueDate('');
    setFormStatus('Pending');
    setErrors({});
    setIsCreateModalOpen(false);
  };

  const isAllSelected = paginatedInvoices.length > 0 && selectedIds.length === paginatedInvoices.length;

  return (
    <div className="page-container">
      {/* View Header */}
      <div className="flex-row justify-between align-center" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="text-2xl font-bold text-heading">Sales & Invoices</h1>
          <p className="text-sm text-muted" style={{ marginTop: '4px' }}>Invoice management, tracking customer balances, and collecting receipts.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={16} />
          <span>New Invoice</span>
        </button>
      </div>

      {/* Grid Controls (Filters, Search, Bulk Actions) */}
      <div className="card flex-column gap-2" style={{ marginBottom: '20px', padding: '16px' }}>
        <div className="flex-row justify-between align-center flex-wrap gap-2">
          
          {/* Tabs for filtering by Status */}
          <div className="flex-row gap-1" style={{ backgroundColor: 'var(--bg-secondary)', padding: '4px', borderRadius: '8px' }}>
            {(['All', 'Paid', 'Pending', 'Overdue'] as const).map((status) => (
              <button
                key={status}
                className="btn btn-ghost"
                style={{ 
                  height: '32px', 
                  padding: '0 12px', 
                  fontSize: '13px', 
                  borderRadius: '6px',
                  backgroundColor: statusFilter === status ? 'var(--bg-card)' : 'transparent',
                  color: statusFilter === status ? 'var(--text-heading)' : 'var(--text-muted)',
                  boxShadow: statusFilter === status ? 'var(--shadow-sm)' : 'none'
                }}
                onClick={() => {
                  setStatusFilter(status);
                  setCurrentPage(1);
                  setSelectedIds([]);
                }}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="flex-row gap-2 flex-1 justify-between align-center" style={{ minWidth: '280px' }}>
            {/* Search Input */}
            <div className="search-container" style={{ width: '100%', maxWidth: '280px' }}>
              <Search size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Search customer name or ID..."
                className="search-input"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Bulk Actions Menu (conditional) */}
            {selectedIds.length > 0 && (
              <div className="flex-row gap-2 align-center" style={{ animation: 'fadeIn 150ms ease-out' }}>
                <span className="text-xs text-muted font-medium">{selectedIds.length} selected</span>
                <button 
                  className="btn btn-secondary" 
                  style={{ height: '36px', padding: '0 12px', fontSize: '13px' }}
                  onClick={() => {
                    onMarkAsPaid(selectedIds);
                    setSelectedIds([]);
                  }}
                >
                  <CheckCircle size={14} className="text-success" />
                  <span>Mark Paid</span>
                </button>
                <button 
                  className="btn btn-secondary text-danger" 
                  style={{ height: '36px', padding: '0 12px', fontSize: '13px' }}
                  onClick={() => {
                    onDeleteInvoices(selectedIds);
                    setSelectedIds([]);
                  }}
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Main Invoices Table */}
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
                  <span>Invoice ID</span>
                  {sortField === 'id' ? (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={12} className="text-disabled" />}
                </div>
              </th>
              <th onClick={() => handleSort('customer')} style={{ cursor: 'pointer' }}>
                <div className="table-header-cell-inner">
                  <span>Customer</span>
                  {sortField === 'customer' ? (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={12} className="text-disabled" />}
                </div>
              </th>
              <th onClick={() => handleSort('date')} style={{ cursor: 'pointer' }}>
                <div className="table-header-cell-inner">
                  <span>Issue Date</span>
                  {sortField === 'date' ? (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={12} className="text-disabled" />}
                </div>
              </th>
              <th>Due Date</th>
              <th onClick={() => handleSort('amount')} style={{ cursor: 'pointer', textAlign: 'right' }}>
                <div className="table-header-cell-inner" style={{ justifyContent: 'flex-end' }}>
                  <span>Amount</span>
                  {sortField === 'amount' ? (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={12} className="text-disabled" />}
                </div>
              </th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedInvoices.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No invoices found matching criteria.
                </td>
              </tr>
            ) : (
              paginatedInvoices.map((inv) => {
                const statusBadge = 
                  inv.status === 'Paid' ? 'badge-success' : 
                  inv.status === 'Pending' ? 'badge-warning' : 'badge-danger';
                const isSelected = selectedIds.includes(inv.id);

                return (
                  <tr key={inv.id} style={{ backgroundColor: isSelected ? 'var(--bg-hover)' : 'transparent' }}>
                    <td>
                      <label className="checkbox-container">
                        <input
                          type="checkbox"
                          className="checkbox-input"
                          checked={isSelected}
                          onChange={() => handleSelectRow(inv.id)}
                        />
                        <span className="checkbox-checkmark" />
                      </label>
                    </td>
                    <td className="font-semibold text-heading">{inv.id}</td>
                    <td className="font-medium text-heading">{inv.customer}</td>
                    <td>{inv.date}</td>
                    <td>{inv.dueDate}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>
                      <span className={`badge ${statusBadge}`}>{inv.status}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-ghost text-xs" 
                        style={{ padding: '4px 8px', height: 'auto' }}
                        onClick={() => onDeleteInvoices([inv.id])}
                      >
                        Delete
                      </button>
                      {inv.status !== 'Paid' && (
                        <button 
                          className="btn btn-ghost text-xs text-primary" 
                          style={{ padding: '4px 8px', height: 'auto', marginLeft: '4px' }}
                          onClick={() => onMarkAsPaid([inv.id])}
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex-row justify-between align-center" style={{ marginTop: '20px' }}>
          <span className="text-xs text-muted">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredSortedInvoices.length)} of {filteredSortedInvoices.length} invoices
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

      {/* Create Invoice Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setErrors({});
        }}
        title="Create Customer Invoice"
        footer={
          <>
            <button 
              className="btn btn-secondary" 
              onClick={() => {
                setIsCreateModalOpen(false);
                setErrors({});
              }}
            >
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmitInvoice}>
              Generate Invoice
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmitInvoice} className="flex-column">
          <div className="form-group">
            <label className="form-label">Customer Name</label>
            <input 
              type="text" 
              className={`form-input ${errors.customer ? 'is-invalid' : ''}`}
              placeholder="e.g. Acme Corporation" 
              value={formCustomer}
              onChange={(e) => setFormCustomer(e.target.value)}
            />
            {errors.customer && <span className="form-feedback">{errors.customer}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Invoice Amount ($)</label>
            <input 
              type="number" 
              step="0.01"
              className={`form-input ${errors.amount ? 'is-invalid' : ''}`}
              placeholder="0.00" 
              value={formAmount}
              onChange={(e) => setFormAmount(e.target.value)}
            />
            {errors.amount && <span className="form-feedback">{errors.amount}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Issue Date</label>
              <input 
                type="date" 
                className={`form-input ${errors.date ? 'is-invalid' : ''}`}
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
              />
              {errors.date && <span className="form-feedback">{errors.date}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input 
                type="date" 
                className={`form-input ${errors.dueDate ? 'is-invalid' : ''}`}
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
              />
              {errors.dueDate && <span className="form-feedback">{errors.dueDate}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Initial Status</label>
            <select 
              className="form-select"
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as 'Paid' | 'Pending')}
            >
              <option value="Pending">Pending Payment</option>
              <option value="Paid">Mark as Paid Immediately</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
};
