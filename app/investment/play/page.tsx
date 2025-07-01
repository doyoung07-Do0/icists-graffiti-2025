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
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
          <div className="text-center">
            <div className="animate-spin size-8 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-300">로딩 중...</p>
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
        {userRole === 'team' && <TeamDashboard userEmail={session.user?.email} />}
        {userRole === 'unauthorized' && <UnauthorizedAccess />}
      </div>
    </div>
  );
}
