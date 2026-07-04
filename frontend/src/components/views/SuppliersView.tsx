import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  ArrowUpDown, 
  ChevronUp, 
  ChevronDown,
  Mail,
  Phone,
  Building2
} from 'lucide-react';
import { Modal } from '../ui/Modal';

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  outstandingBalance: number;
}

interface SuppliersViewProps {
  suppliers: Supplier[];
  onAddSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  onDeleteSuppliers: (ids: string[]) => void;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  suppliers,
  onAddSupplier,
  onDeleteSuppliers
}) => {
  const [search, setSearch] = useState('');
  
  // Sorting state
  const [sortField, setSortField] = useState<keyof Supplier>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Create Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formBalance, setFormBalance] = useState('0');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter & Search & Sort
  const filteredSortedSuppliers = useMemo(() => {
    let result = [...suppliers];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        s => s.name.toLowerCase().includes(q) || 
             s.email.toLowerCase().includes(q) ||
             s.company.toLowerCase().includes(q) ||
             s.id.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'outstandingBalance') {
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
  }, [suppliers, search, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredSortedSuppliers.length / itemsPerPage));
  const paginatedSuppliers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSortedSuppliers.slice(start, start + itemsPerPage);
  }, [filteredSortedSuppliers, currentPage]);

  const handleSort = (field: keyof Supplier) => {
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
      setSelectedIds(paginatedSuppliers.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSubmitSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formName.trim()) {
      newErrors.name = 'Supplier name is required';
    }

    if (!formEmail.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const bal = parseFloat(formBalance);
    if (isNaN(bal) || bal < 0) {
      newErrors.balance = 'Outstanding balance must be positive or zero';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onAddSupplier({
      name: formName,
      email: formEmail,
      phone: formPhone,
      company: formCompany || 'Independent Vendor',
      outstandingBalance: bal
    });

    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormCompany('');
    setFormBalance('0');
    setErrors({});
    setIsModalOpen(false);
  };

  const isAllSelected = paginatedSuppliers.length > 0 && selectedIds.length === paginatedSuppliers.length;

  return (
    <div className="page-container">
      {/* View Header */}
      <div className="flex-row justify-between align-center" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="text-2xl font-bold text-heading">Supplier Accounts</h1>
          <p className="text-sm text-muted" style={{ marginTop: '4px' }}>Manage vendor registers, view credit balances, and audit purchase payables.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          <span>New Supplier</span>
        </button>
      </div>

      {/* Grid Controls */}
      <div className="card flex-column gap-2" style={{ marginBottom: '20px', padding: '16px' }}>
        <div className="flex-row justify-between align-center flex-wrap gap-2">
          
          <div className="search-container" style={{ width: '100%', maxWidth: '280px' }}>
            <Search size={15} className="search-icon" />
            <input
              type="text"
              placeholder="Search supplier name, email, or company..."
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
            <div className="flex-row gap-2 align-center" style={{ animation: 'fadeIn 150ms ease-out' }}>
              <span className="text-xs text-muted font-medium">{selectedIds.length} selected</span>
              <button 
                className="btn btn-secondary text-danger" 
                style={{ height: '36px', padding: '0 12px', fontSize: '13px' }}
                onClick={() => {
                  onDeleteSuppliers(selectedIds);
                  setSelectedIds([]);
                }}
              >
                <Trash2 size={14} />
                <span>Delete Accounts</span>
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Suppliers Table */}
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
              <th onClick={() => handleSort('id')} style={{ cursor: 'pointer', width: '120px' }}>
                <div className="table-header-cell-inner">
                  <span>ID</span>
                  {sortField === 'id' ? (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={12} className="text-disabled" />}
                </div>
              </th>
              <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                <div className="table-header-cell-inner">
                  <span>Supplier Name</span>
                  {sortField === 'name' ? (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={12} className="text-disabled" />}
                </div>
              </th>
              <th>Company</th>
              <th>Email</th>
              <th>Phone</th>
              <th onClick={() => handleSort('outstandingBalance')} style={{ cursor: 'pointer', textAlign: 'right', width: '180px' }}>
                <div className="table-header-cell-inner" style={{ justifyContent: 'flex-end' }}>
                  <span>Outstanding Payable</span>
                  {sortField === 'outstandingBalance' ? (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={12} className="text-disabled" />}
                </div>
              </th>
              <th style={{ textAlign: 'right', width: '120px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedSuppliers.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No supplier records found.
                </td>
              </tr>
            ) : (
              paginatedSuppliers.map((supp) => {
                const isSelected = selectedIds.includes(supp.id);
                const hasBalance = supp.outstandingBalance > 0;
                
                return (
                  <tr 
                    key={supp.id} 
                    style={{ 
                      backgroundColor: isSelected ? 'var(--bg-hover)' : 'transparent',
                    }}
                  >
                    <td>
                      <label className="checkbox-container">
                        <input
                          type="checkbox"
                          className="checkbox-input"
                          checked={isSelected}
                          onChange={() => handleSelectRow(supp.id)}
                        />
                        <span className="checkbox-checkmark" />
                      </label>
                    </td>
                    <td className="font-semibold text-heading">{supp.id}</td>
                    <td className="font-semibold text-heading">{supp.name}</td>
                    <td>
                      <span className="flex-row align-center gap-1 text-sm">
                        <Building2 size={14} className="text-muted" />
                        {supp.company}
                      </span>
                    </td>
                    <td>
                      <span className="flex-row align-center gap-1 text-sm">
                        <Mail size={14} className="text-muted" />
                        {supp.email}
                      </span>
                    </td>
                    <td>
                      <span className="flex-row align-center gap-1 text-sm">
                        <Phone size={14} className="text-muted" />
                        {supp.phone || <em className="text-disabled">None</em>}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: hasBalance ? 'var(--color-warning-text)' : 'var(--text-body)' }}>
                      ${supp.outstandingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-ghost text-xs text-danger" 
                        style={{ padding: '4px 8px', height: 'auto' }}
                        onClick={() => onDeleteSuppliers([supp.id])}
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
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredSortedSuppliers.length)} of {filteredSortedSuppliers.length} accounts
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

      {/* Add Supplier Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setErrors({});
        }}
        title="Add New Supplier Profile"
        footer={
          <>
            <button 
              className="btn btn-secondary" 
              onClick={() => {
                setIsModalOpen(false);
                setErrors({});
              }}
            >
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmitSupplier}>
              Register Supplier
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmitSupplier} className="flex-column">
          <div className="form-group">
            <label className="form-label">Supplier / Contact Name</label>
            <input 
              type="text" 
              className={`form-input ${errors.name ? 'is-invalid' : ''}`}
              placeholder="e.g. John Smith" 
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
            {errors.name && <span className="form-feedback">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className={`form-input ${errors.email ? 'is-invalid' : ''}`}
              placeholder="e.g. support@supplier.com" 
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
            />
            {errors.email && <span className="form-feedback">{errors.email}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. +1 555-0188" 
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Company / Supplier Entity</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Logix Wholesalers" 
                value={formCompany}
                onChange={(e) => setFormCompany(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Opening Credit Balance ($) (Accounts Payable)</label>
            <input 
              type="number" 
              step="0.01"
              className={`form-input ${errors.balance ? 'is-invalid' : ''}`}
              value={formBalance}
              onChange={(e) => setFormBalance(e.target.value)}
            />
            {errors.balance && <span className="form-feedback">{errors.balance}</span>}
            <span className="text-xs text-muted" style={{ marginTop: '2px' }}>
              Specify any unpaid credit balances due to this supplier.
            </span>
          </div>
        </form>
      </Modal>
    </div>
  );
};
