'client';

import { Suspense } from 'react';
import { AdminDashboard } from '../components/admin/dashboard/AdminDashboard';
import { InvestmentProvider } from '../contexts/InvestmentContext';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }>
        <InvestmentProvider>
          <AdminDashboard />
        </InvestmentProvider>
      </Suspense>
    </div>
  );
}

// Add metadata for the page
export const metadata = {
  title: 'Admin Dashboard | Investment Game',
  description: 'Admin dashboard for managing the investment game',
};

// Ensure this page is protected by admin role
AdminPage.requireAuth = true;
AdminPage.roles = ['admin'];
