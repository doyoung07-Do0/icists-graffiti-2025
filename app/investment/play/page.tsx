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
      <div className="min-h-screen bg-black flex items-center justify-center" />
    );
  }

  // Determine user role and render appropriate component
  const userRole = getUserRole(session.user?.email);
  // console.log(userRole)

  // Extract team number from email (e.g., team5@icists.com -> team5)
  const teamName =
    userRole === 'team' && session.user?.email
      ? session.user.email.split('@')[0]
      : null;

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 py-8">
        {userRole === 'admin' && <AdminDashboard />}
        {userRole === 'team' && teamName && (
          <TeamDashboard teamName={teamName} />
        )}
        {userRole === 'unauthorized' && <UnauthorizedAccess />}
      </div>
    </div>
  );
}
