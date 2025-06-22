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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (!session) {
      router.push('/api/auth/signin');
      return;
    }
  }, [session, status, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-300">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
          <div className="text-center">
            <div className="text-6xl mb-6">🔐</div>
            <h2 className="text-3xl font-bold mb-4 text-blue-400">로그인이 필요합니다</h2>
            <p className="text-gray-300 mb-6">
              투자 게임에 참여하려면 로그인해주세요.
            </p>
            <a 
              href="/api/auth/signin" 
              className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-all"
            >
              로그인하기
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Determine user role and render appropriate component
  const userRole = getUserRole(session.user?.email);

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
