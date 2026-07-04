# SmartERP Backend REST API

This directory contains the REST API server for the **SmartERP** web application. It is built using Node.js, Express.js, and CORS configuration.

## Features

- REST API endpoints for Invoices, Expenses, and Inventory catalog management.
- Dynamic cross-origin request handling.
- Input models representing the exact schema required by the React dashboard interface.
- Scalable configuration blueprint for relational databases like PostgreSQL.

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm (v9+)

### Installation & Run

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```

The backend server starts on `http://localhost:5000`.

---

## API Endpoints Reference

### Health Check
- `GET /api/health` - Check server status and time.

### Invoices (Sales Ledger)
- `GET /api/invoices` - Retrieve all invoices.
- `POST /api/invoices` - Create a new invoice.
- `PATCH /api/invoices/:id/pay` - Mark a pending invoice as paid.
- `DELETE /api/invoices` - Bulk delete invoices. Body: `{ "ids": ["INV-2026-001"] }`.

### Expenses (Purchase Ledger)
- `GET /api/expenses` - Retrieve all expenses.
- `POST /api/expenses` - Record a new purchase expense.
- `DELETE /api/expenses` - Bulk delete expenses. Body: `{ "ids": ["EXP-2026-001"] }`.

### Inventory (Warehouse Ledger)
- `GET /api/inventory` - Retrieve the catalog.
- `POST /api/inventory` - Register a new catalog item.
- `PATCH /api/inventory/:id/stock` - Adjust stock level by a delta. Body: `{ "delta": -1 }`.
- `DELETE /api/inventory` - Bulk delete catalog items. Body: `{ "ids": ["1", "2"] }`.

---

## PostgreSQL Database Schema Blueprints

When moving from in-memory state to a persistent SQL database, run these PostgreSQL migrations:

```sql
-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. INVOICES TABLE
CREATE TABLE invoices (
    id VARCHAR(50) PRIMARY KEY,
    customer VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Paid', 'Pending', 'Overdue')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_dates CHECK (due_date >= issue_date)
);

-- 2. EXPENSES TABLE
CREATE TABLE expenses (
    id VARCHAR(50) PRIMARY KEY,
    supplier VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Software', 'Office', 'Marketing', 'Travel', 'Operations')),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    expense_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. INVENTORY TABLE
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    stock_level INT NOT NULL DEFAULT 0 CHECK (stock_level >= 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price > 0),
    reorder_point INT NOT NULL DEFAULT 5 CHECK (reorder_point >= 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimizations
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_inventory_sku ON inventory(sku);
```
