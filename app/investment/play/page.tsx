'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AdminDashboard from './components/AdminDashboard';
import TeamDashboard from './components/TeamDashboard';
import UnauthorizedAccess from './components/UnauthorizedAccess';
import { getUserRole } from './components/utils';

export default function InvestmentPlayPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Show login prompt if not authenticated
  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-blue-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-300">Loading...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Determine user role and render appropriate component
  const userRole = getUserRole(session.user?.email);
  console.log(userRole)

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 py-8">
        {userRole === 'admin' && <AdminDashboard />}
        {userRole === 'team' && <TeamDashboard/>}
        {userRole === 'unauthorized' && <UnauthorizedAccess />}
      </div>
    </div>
  );
}
