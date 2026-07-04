import React, { useState } from 'react';
import { 
  User, 
  Building, 
  Sliders, 
  Database, 
  Save, 
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface SettingsViewProps {
  companyName: string;
  setCompanyName: (name: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  companyName,
  setCompanyName
}) => {
  // Save Feedback status
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile Form state
  const [profileName, setProfileName] = useState('Alex Danvers');
  const [profileEmail, setProfileEmail] = useState('alex.danvers@smarterp.com');
  const [profileRole, setProfileRole] = useState('Senior Accountant');

  // Company Form state
  const [taxId, setTaxId] = useState('TX-8829-19A');
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [fiscalYearStart, setFiscalYearStart] = useState('January');

  // App settings state
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');
  const [defaultPageSize, setDefaultPageSize] = useState('8');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [stockAlerts, setStockAlerts] = useState(true);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    // Simulate async network request
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      
      // Hide success notification after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }, 1200);
  };

  return (
    <div className="page-container">
      {/* View Header */}
      <div className="flex-row justify-between align-center" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="text-2xl font-bold text-heading">System Settings</h1>
          <p className="text-sm text-muted" style={{ marginTop: '4px' }}>Configure organization parameters, account details, and notification thresholds.</p>
        </div>
      </div>

      {saveSuccess && (
        <div 
          className="flex-row align-center gap-2" 
          style={{ 
            backgroundColor: 'var(--color-success-bg)', 
            color: 'var(--color-success-text)', 
            padding: '12px 16px', 
            borderRadius: 'var(--radius-button)', 
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: 500,
            border: '1px solid var(--border-color)',
            animation: 'fadeIn 200ms ease-out'
          }}
        >
          <CheckCircle2 size={16} />
          <span>System configuration updated successfully! Changes have been synchronized in local cache.</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left column: forms */}
        <div className="flex-column gap-3">
          
          {/* User Account Settings */}
          <div className="card flex-column" style={{ gap: '20px' }}>
            <div className="flex-row align-center gap-2" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <User size={18} className="text-primary" />
              <h3 className="text-base font-semibold text-heading" style={{ margin: 0 }}>My Account</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={profileName} 
                  onChange={(e) => setProfileName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Role Designation</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={profileRole} 
                  onChange={(e) => setProfileRole(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                value={profileEmail} 
                onChange={(e) => setProfileEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Company Details */}
          <div className="card flex-column" style={{ gap: '20px' }}>
            <div className="flex-row align-center gap-2" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <Building size={18} className="text-primary" />
              <h3 className="text-base font-semibold text-heading" style={{ margin: 0 }}>Organization Profile</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={companyName} 
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                  }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tax ID / VAT Registration</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={taxId} 
                  onChange={(e) => setTaxId(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Base Currency</label>
                <select 
                  className="form-select" 
                  value={baseCurrency} 
                  onChange={(e) => setBaseCurrency(e.target.value)}
                >
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                  <option value="INR">INR (₹) - Indian Rupee</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Fiscal Year Start</label>
                <select 
                  className="form-select" 
                  value={fiscalYearStart} 
                  onChange={(e) => setFiscalYearStart(e.target.value)}
                >
                  <option value="January">January</option>
                  <option value="April">April</option>
                  <option value="July">July</option>
                  <option value="October">October</option>
                </select>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="card flex-column" style={{ gap: '20px' }}>
            <div className="flex-row align-center gap-2" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <Sliders size={18} className="text-primary" />
              <h3 className="text-base font-semibold text-heading" style={{ margin: 0 }}>System Preferences</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Date Rendering Format</label>
                <select 
                  className="form-select" 
                  value={dateFormat} 
                  onChange={(e) => setDateFormat(e.target.value)}
                >
                  <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-07-04)</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 04/07/2026)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 07/04/2026)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Table Items Page Size</label>
                <select 
                  className="form-select" 
                  value={defaultPageSize} 
                  onChange={(e) => setDefaultPageSize(e.target.value)}
                >
                  <option value="5">5 rows</option>
                  <option value="8">8 rows</option>
                  <option value="12">12 rows</option>
                  <option value="20">20 rows</option>
                </select>
              </div>
            </div>

            <div className="flex-column gap-2" style={{ marginTop: '8px' }}>
              <label className="checkbox-container">
                <input 
                  type="checkbox" 
                  className="checkbox-input" 
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                />
                <span className="checkbox-checkmark" />
                <span>Transmit weekly accounting report summaries to {profileEmail}</span>
              </label>

              <label className="checkbox-container">
                <input 
                  type="checkbox" 
                  className="checkbox-input" 
                  checked={stockAlerts}
                  onChange={(e) => setStockAlerts(e.target.checked)}
                />
                <span className="checkbox-checkmark" />
                <span>Show warning alerts on Dashboard when inventory stocks trigger limits</span>
              </label>
            </div>
          </div>

        </div>

        {/* Right column: Action & status */}
        <div className="flex-column gap-3">
          
          {/* Action Trigger Card */}
          <div className="card flex-column" style={{ gap: '16px' }}>
            <h3 className="card-title" style={{ margin: 0 }}>Sync Status</h3>
            <p className="text-xs text-muted">All updates made locally are cached instantly. Perform a sync to upload changes to the cloud ledger database.</p>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <RefreshCw size={14} className="animate-spin" style={{ animation: 'spin 1.2s linear infinite' }} />
                  <span>Saving Ledger...</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>

          {/* Database Info Card */}
          <div className="card flex-column" style={{ gap: '12px' }}>
            <div className="flex-row align-center gap-1">
              <Database size={15} className="text-muted" />
              <h4 className="text-xs font-semibold text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Server Status</h4>
            </div>
            
            <div className="flex-column gap-1 text-xs">
              <div className="flex-row justify-between">
                <span className="text-muted">Ledger DB:</span>
                <span className="font-semibold text-heading">PostgreSQL 16.2</span>
              </div>
              <div className="flex-row justify-between">
                <span className="text-muted">Database Latency:</span>
                <span className="font-semibold text-success">14 ms (Optimal)</span>
              </div>
              <div className="flex-row justify-between">
                <span className="text-muted">Local Cache Size:</span>
                <span className="font-semibold text-heading">12.8 KB</span>
              </div>
              <div className="flex-row justify-between">
                <span className="text-muted">Deployment Server:</span>
                <span className="font-semibold text-heading">US-East Node (Vercel)</span>
              </div>
            </div>
          </div>

        </div>

      </form>
      
      {/* Inline Spinner CSS Animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
