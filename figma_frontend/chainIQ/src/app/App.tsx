
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/DashboardLayout';
import { Dashboard } from './components/Dashboard';
import { SupplierOnboarding } from './components/SupplierOnboarding';
import { Reports } from './components/Reports';
import { Profile } from './components/Profile';
import { Marketplace } from './components/Marketplace';
import { Inbox } from './components/Inbox';
import { RetailerOrders } from './components/RetailerOrders';
import { OrderTracker } from './components/OrderTracker';
import { SupplierDashboard } from './components/SupplierDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/suppliers" element={<SupplierOnboarding />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/my-orders" element={<RetailerOrders />} />
          <Route path="/tracker/:batchId" element={<OrderTracker />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/my-performance" element={<SupplierDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
