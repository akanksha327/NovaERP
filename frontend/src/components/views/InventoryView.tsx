import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Minus, 
  AlertTriangle,
  ArrowUpDown, 
  ChevronUp, 
  ChevronDown
} from 'lucide-react';
import { Modal } from '../ui/Modal';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  stockLevel: number;
  unitPrice: number;
  reorderPoint: number;
}

interface InventoryViewProps {
  inventory: InventoryItem[];
  onAddInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  onDeleteInventoryItems: (ids: string[]) => void;
  onAdjustStock: (id: string, delta: number) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  onAddInventoryItem,
  onDeleteInventoryItems,
  onAdjustStock,
  isCreateModalOpen,
  setIsCreateModalOpen
}) => {
  // Search & Filter
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'All' | 'Low' | 'Out' | 'Healthy'>('All');
  
  // Sorting state
  const [sortField, setSortField] = useState<keyof InventoryItem>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Create Form State
  const [formSku, setFormSku] = useState('');
  const [formName, setFormName] = useState('');
  const [formStock, setFormStock] = useState('10');
  const [formPrice, setFormPrice] = useState('');
  const [formReorder, setFormReorder] = useState('5');
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter & Search & Sort
  const filteredSortedInventory = useMemo(() => {
    let result = [...inventory];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        item => item.name.toLowerCase().includes(q) || 
               item.sku.toLowerCase().includes(q) ||
               item.id.toLowerCase().includes(q)
      );
    }

    if (stockFilter !== 'All') {
      result = result.filter(item => {
        if (stockFilter === 'Out') return item.stockLevel === 0;
        if (stockFilter === 'Low') return item.stockLevel > 0 && item.stockLevel <= item.reorderPoint;
        return item.stockLevel > item.reorderPoint;
      });
    }

    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'stockLevel' || sortField === 'unitPrice' || sortField === 'reorderPoint') {
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
  }, [inventory, search, stockFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredSortedInventory.length / itemsPerPage));
  const paginatedInventory = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSortedInventory.slice(start, start + itemsPerPage);
  }, [filteredSortedInventory, currentPage]);

  const handleSort = (field: keyof InventoryItem) => {
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
      setSelectedIds(paginatedInventory.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSubmitItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formSku.trim()) {
      newErrors.sku = 'SKU identifier is required';
    } else if (inventory.some(i => i.sku.toLowerCase() === formSku.trim().toLowerCase())) {
      newErrors.sku = 'An item with this SKU already exists';
    }

    if (!formName.trim()) {
      newErrors.name = 'Item name is required';
    }

    const st = parseInt(formStock);
    if (isNaN(st) || st < 0) {
      newErrors.stockLevel = 'Initial stock must be zero or positive';
    }

    const pr = parseFloat(formPrice);
    if (isNaN(pr) || pr <= 0) {
      newErrors.unitPrice = 'Please specify a positive unit price';
    }

    const re = parseInt(formReorder);
    if (isNaN(re) || re < 0) {
      newErrors.reorderPoint = 'Reorder limit must be zero or positive';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onAddInventoryItem({
      sku: formSku.toUpperCase(),
      name: formName,
      stockLevel: st,
      unitPrice: pr,
      reorderPoint: re
    });

    setFormSku('');
    setFormName('');
    setFormStock('10');
    setFormPrice('');
    setFormReorder('5');
    setErrors({});
    setIsCreateModalOpen(false);
  };

  const isAllSelected = paginatedInventory.length > 0 && selectedIds.length === paginatedInventory.length;

  return (
    <div className="page-container">
      {/* View Header */}
      <div className="flex-row justify-between align-center" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="text-2xl font-bold text-heading">Stock Items</h1>
          <p className="text-sm text-muted" style={{ marginTop: '4px' }}>Monitor asset stock levels, unit value tracking, reorder alert limits, and bulk auditing.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={16} />
          <span>New Stock Item</span>
        </button>
      </div>

      {/* Grid Controls */}
      <div className="card flex-column gap-2" style={{ marginBottom: '20px', padding: '16px' }}>
        <div className="flex-row justify-between align-center flex-wrap gap-2">
          
          <div className="flex-row gap-2 align-center">
            <span className="text-xs text-muted font-medium">Status Filter:</span>
            <select
              className="form-select"
              style={{ width: '150px', height: '36px', padding: '0 8px', fontSize: '13px' }}
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value as any);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Low">Low Stock Warnings</option>
              <option value="Out">Out of Stock</option>
              <option value="Healthy">Healthy Stock</option>
            </select>
          </div>

          <div className="flex-row gap-2 flex-1 justify-between align-center" style={{ minWidth: '280px' }}>
            <div className="search-container" style={{ width: '100%', maxWidth: '280px' }}>
              <Search size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Search item SKU or name..."
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
                    onDeleteInventoryItems(selectedIds);
                    setSelectedIds([]);
                  }}
                >
                  <Trash2 size={14} />
                  <span>Delete Items</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Inventory Table */}
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
              <th onClick={() => handleSort('sku')} style={{ cursor: 'pointer', width: '120px' }}>
                <div className="table-header-cell-inner">
                  <span>SKU</span>
                  {sortField === 'sku' ? (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={12} className="text-disabled" />}
                </div>
              </th>
              <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                <div className="table-header-cell-inner">
                  <span>Item Name</span>
                  {sortField === 'name' ? (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={12} className="text-disabled" />}
                </div>
              </th>
              <th onClick={() => handleSort('stockLevel')} style={{ cursor: 'pointer', width: '150px' }}>
                <div className="table-header-cell-inner">
                  <span>Stock Level</span>
                  {sortField === 'stockLevel' ? (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={12} className="text-disabled" />}
                </div>
              </th>
              <th onClick={() => handleSort('unitPrice')} style={{ cursor: 'pointer', textAlign: 'right', width: '120px' }}>
                <div className="table-header-cell-inner" style={{ justifyContent: 'flex-end' }}>
                  <span>Unit Price</span>
                  {sortField === 'unitPrice' ? (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={12} className="text-disabled" />}
                </div>
              </th>
              <th style={{ textAlign: 'right', width: '140px' }}>Total Asset Value</th>
              <th onClick={() => handleSort('reorderPoint')} style={{ cursor: 'pointer', width: '120px' }}>
                <div className="table-header-cell-inner">
                  <span>Reorder Point</span>
                  {sortField === 'reorderPoint' ? (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={12} className="text-disabled" />}
                </div>
              </th>
              <th style={{ textAlign: 'right', width: '180px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedInventory.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No inventory items cataloged matching criteria.
                </td>
              </tr>
            ) : (
              paginatedInventory.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const isOutOfStock = item.stockLevel === 0;
                const isLowStock = !isOutOfStock && item.stockLevel <= item.reorderPoint;
                
                let stockBadge = <span className="badge badge-success">In Stock</span>;
                if (isOutOfStock) {
                  stockBadge = <span className="badge badge-danger">Out of Stock</span>;
                } else if (isLowStock) {
                  stockBadge = (
                    <span className="badge badge-warning flex-row align-center gap-1" title="Low stock level">
                      <AlertTriangle size={11} />
                      Low Stock
                    </span>
                  );
                }

                return (
                  <tr 
                    key={item.id} 
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
                          onChange={() => handleSelectRow(item.id)}
                        />
                        <span className="checkbox-checkmark" />
                      </label>
                    </td>
                    <td className="font-semibold text-heading">{item.sku}</td>
                    <td className="font-medium text-heading">{item.name}</td>
                    <td>
                      <div className="flex-row align-center gap-1">
                        <span className={`font-semibold ${isOutOfStock ? 'text-danger' : isLowStock ? 'text-warning' : 'text-heading'}`}>
                          {item.stockLevel} units
                        </span>
                        {stockBadge}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>${item.unitPrice.toFixed(2)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      ${(item.stockLevel * item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td>{item.reorderPoint} units</td>
                    <td style={{ textAlign: 'right' }}>
                      {/* Interactive Stock Adjustments */}
                      <div className="flex-row gap-1 align-center" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ width: '28px', height: '28px', padding: 0 }}
                          disabled={item.stockLevel === 0}
                          onClick={() => onAdjustStock(item.id, -1)}
                          title="Decrease Stock"
                        >
                          <Minus size={12} />
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ width: '28px', height: '28px', padding: 0 }}
                          onClick={() => onAdjustStock(item.id, 1)}
                          title="Increase Stock"
                        >
                          <Plus size={12} />
                        </button>
                        <span style={{ width: '1px', height: '18px', backgroundColor: 'var(--border-color)', margin: '0 4px' }} />
                        <button 
                          className="btn btn-ghost text-xs text-danger" 
                          style={{ padding: '4px 8px', height: 'auto' }}
                          onClick={() => onDeleteInventoryItems([item.id])}
                        >
                          Delete
                        </button>
                      </div>
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
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredSortedInventory.length)} of {filteredSortedInventory.length} stock items
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

      {/* Add Inventory Item Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setErrors({});
        }}
        title="Add Stock Item"
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
            <button className="btn btn-primary" onClick={handleSubmitItem}>
              Register Item
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmitItem} className="flex-column">
          <div className="form-group">
            <label className="form-label">SKU Identifier</label>
            <input 
              type="text" 
              className={`form-input ${errors.sku ? 'is-invalid' : ''}`}
              placeholder="e.g. LAP-MAC-16" 
              value={formSku}
              onChange={(e) => setFormSku(e.target.value)}
            />
            {errors.sku && <span className="form-feedback">{errors.sku}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Item Name</label>
            <input 
              type="text" 
              className={`form-input ${errors.name ? 'is-invalid' : ''}`}
              placeholder="e.g. MacBook Pro 16-inch M3" 
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
            {errors.name && <span className="form-feedback">{errors.name}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Unit Value ($)</label>
              <input 
                type="number" 
                step="0.01"
                className={`form-input ${errors.unitPrice ? 'is-invalid' : ''}`}
                placeholder="0.00" 
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
              />
              {errors.unitPrice && <span className="form-feedback">{errors.unitPrice}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Initial Stock Level</label>
              <input 
                type="number" 
                className={`form-input ${errors.stockLevel ? 'is-invalid' : ''}`}
                value={formStock}
                onChange={(e) => setFormStock(e.target.value)}
              />
              {errors.stockLevel && <span className="form-feedback">{errors.stockLevel}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reorder Alert Limit (Min. Stock)</label>
            <input 
              type="number" 
              className={`form-input ${errors.reorderPoint ? 'is-invalid' : ''}`}
              value={formReorder}
              onChange={(e) => setFormReorder(e.target.value)}
            />
            {errors.reorderPoint && <span className="form-feedback">{errors.reorderPoint}</span>}
            <span className="text-xs text-muted" style={{ marginTop: '2px' }}>
              We will trigger an alert dashboard warning when stock level falls below this count.
            </span>
          </div>
        </form>
      </Modal>
    </div>
  );
};
